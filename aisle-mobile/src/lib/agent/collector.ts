import {SOURCES,type Offer,type Pack,type SourceResult} from './types';
export function parsePack(value:string):Pack|null {
 const text=value.toLowerCase().replace(/,/g,'');
 const m=text.match(/(?:(\d+)\s*[x×]\s*)?(\d+(?:\.\d+)?)\s*(kg|g|ml|l|lb|oz)\b/);
 if(m){const unit=m[3];const amount=Number(m[2])*(m[1]?Number(m[1]):1)*({kg:1000,g:1,ml:1,l:1000,lb:453.59237,oz:28.349523}[unit]??1);return amount>0?{amount:Math.round(amount*1000)/1000,unit:['ml','l'].includes(unit)?'ml':'g',label:m[0]}:null;}
 const count=text.match(/(?:bag of\s*|pack of\s*)(\d+)|\b(\d+)\s*(?:eggs|count|ct|pack)\b/);
 if(count)return {amount:Number(count[1]??count[2]),unit:'each',label:count[0]};
 return /\b(?:each|ea)\b/.test(text)?{amount:1,unit:'each',label:'each'}:null;
}
export type CatalogueSource={id:string;name:string;origin:string};
export function normalizeProducts(raw:unknown,source:CatalogueSource,now=new Date()):Offer[]{
 const body=raw as {products?:unknown[]};if(!body||!Array.isArray(body.products))throw new Error('Unexpected catalogue response');
 const result:Offer[]=[];
 for(const rawProduct of body.products.slice(0,250)){
  const p=rawProduct as Record<string,unknown>;
  if(typeof p.title!=='string'||typeof p.handle!=='string'||!Array.isArray(p.variants)||!/^[a-z0-9-]+$/i.test(p.handle))continue;
  if(/gift card|gift basket|catering|meal kit|rain barrel|seeds -|workshop|class -/i.test(`${p.title} ${p.product_type}`))continue;
  for(const rawVariant of p.variants.slice(0,15)){
   const v=rawVariant as Record<string,unknown>;
   if(typeof v.price!=='string'||!/^\d{1,5}(?:\.\d{1,2})?$/.test(v.price)||typeof v.available!=='boolean'||!['number','string'].includes(typeof v.id))continue;
   const price=Math.round(Number(v.price)*100);if(price<=0||price>100000)continue;
   const title=`${p.title}${typeof v.title==='string'&&v.title!=='Default Title'?` · ${v.title}`:''}`.slice(0,240);
   result.push({id:`${source.id}:${v.id}`,sourceId:source.id,retailer:source.name,title,brand:typeof p.vendor==='string'?p.vendor.slice(0,80):'',url:`${source.origin}/products/${p.handle}?variant=${encodeURIComponent(String(v.id))}`,price,currency:'CAD',pack:parsePack(title),available:v.available,observedAt:now.toISOString(),expiresAt:new Date(now.getTime()+24*3600000).toISOString(),scope:'online',tags:Array.isArray(p.tags)?p.tags.filter((t):t is string=>typeof t==='string').slice(0,30):[]});
  }
 }
 return result;
}
// Wildcard robots rules, parsed once and applied everywhere. Fail closed: an
// unreadable or ambiguous rule stops collection rather than proceeding.
export function robotsDisallows(robots:string):string[]{
 const denied:string[]=[];let applies=false;
 for(const raw of robots.split(/\r?\n/)){
  const line=raw.split('#')[0].trim();
  if(/^user-agent:/i.test(line))applies=/user-agent:\s*\*\s*$/i.test(line);
  else if(applies&&/^disallow:/i.test(line)){const rule=line.slice(line.indexOf(':')+1).trim();if(rule)denied.push(rule);}
 }
 return denied;
}
export function blockedByRobots(robots:string,paths:string[]):boolean{
 const denied=robotsDisallows(robots);
 return paths.some(path=>denied.some(rule=>new RegExp('^'+rule.replace(/[.+?^${}()|[\]\\]/g,'\\$&').replaceAll('*','.*')).test(path)));
}
export type TextFetcher=(url:string)=>Promise<string>;
export const fetchText:TextFetcher=async url=>{
 const response=await fetch(url,{signal:AbortSignal.timeout(12000),redirect:'manual',headers:{Accept:'application/json,text/plain','User-Agent':'AislePriceResearch/1.0 (+https://aisle-burlington.katefretz.chatgpt.site)'}});
 if(!response.ok)throw new Error(`Retailer returned HTTP ${response.status}`);
 const reader=response.body?.getReader();if(!reader)throw new Error('Empty retailer response');let size=0;const decoder=new TextDecoder();let text='';
 for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>4_000_000){await reader.cancel();throw new Error('Catalogue response exceeded limit');}text+=decoder.decode(value,{stream:true});}return text+decoder.decode();
};
// These are fixed, reviewed public catalogue endpoints. No user-controlled URLs,
// private retailer endpoints, credential forwarding, recursive crawling or checkout.
export async function collectSource(source:typeof SOURCES[number],read:TextFetcher=fetchText,now=new Date()):Promise<SourceResult>{
 try{
  const robots=await read(source.origin+'/robots.txt');
  if(blockedByRobots(robots,source.paths))throw new Error('Catalogue collection is disallowed by the retailer');
  const storefront=await read(source.origin+'/');
  const currency=storefront.match(/Shopify\.currency\s*=\s*(\{[^;]+\})/);
  if(!currency||JSON.parse(currency[1]).active!==source.currency)throw new Error('Retailer currency could not be verified as CAD');
  const offers:Offer[]=[];
  for(const path of source.paths)offers.push(...normalizeProducts(JSON.parse(await read(source.origin+path)),source,now));
  const unique=[...new Map(offers.map(o=>[o.id,o])).values()];
  if(!unique.length)throw new Error('No valid product prices were returned');
  return {id:source.id,name:source.name,url:source.origin,status:'ready',message:'Public online catalogue sample; store stock, delivery area and checkout charges are not confirmed.',checkedAt:now.toISOString(),offers:unique};
 }catch(error){console.warn(`Price source ${source.id} unavailable`,error instanceof Error?error.message:'Unknown error');return {id:source.id,name:source.name,url:source.origin,status:'unavailable',message:'This catalogue could not be read. Please try again later or check the retailer directly.',checkedAt:now.toISOString(),offers:[]};}
}

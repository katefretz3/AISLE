// Retailer adapters.
//
// An adapter turns one retailer origin into verified offers plus the evidence
// that backs them. Adapters are the only producers of Offer records in the
// agentic path. They either return records parsed from a response they just
// read, or they fail loudly — there is no partial-credit mode where a parse
// failure becomes an approximate price.
import {blockedByRobots,normalizeProducts,type CatalogueSource} from './collector';
import type {Offer} from './types';
import {EvidenceLedger,type Evidence,type SourcedOffer} from './provenance';
import type {Reader} from './net';

export type ProbeVerdict={
 origin:string;
 adapter:string;
 usable:boolean;
 reason:string;
 paths:string[];
 checkedAt:string;
};
export type CollectOutcome={
 origin:string;
 chainId:string|null;
 name:string;
 status:'ready'|'unavailable';
 message:string;
 offers:SourcedOffer[];
 evidence:Evidence[];
 checkedAt:string;
};
export type Adapter={
 id:string;
 version:string;
 probe(origin:string,read:Reader):Promise<ProbeVerdict>;
 collect(input:{origin:string;name:string;chainId:string|null;paths:string[]},read:Reader,ledger:EvidenceLedger,now:Date):Promise<CollectOutcome>;
};

const SHOPIFY_PATHS=['/products.json?limit=250'];

/**
 * Public Shopify storefront catalogues. Three gates run before any price is
 * read: robots.txt must permit the path, the storefront must declare an active
 * CAD currency, and the payload must parse into the documented product shape.
 * Any gate failing returns `unavailable` with zero offers.
 */
export const shopifyAdapter:Adapter={
 id:'shopify-public',
 version:'2',
 async probe(origin,read){
  const checkedAt=new Date().toISOString();
  const fail=(reason:string):ProbeVerdict=>({origin,adapter:'shopify-public',usable:false,reason,paths:[],checkedAt});
  try{
   const robots=await read(`${origin}/robots.txt`);
   if(robots.status!==200)return fail(`robots.txt returned HTTP ${robots.status}; collection not attempted`);
   if(blockedByRobots(robots.body,SHOPIFY_PATHS))return fail('The retailer disallows catalogue collection in robots.txt');
   const storefront=await read(`${origin}/`);
   if(storefront.status!==200)return fail(`Storefront returned HTTP ${storefront.status}`);
   const currency=storefront.body.match(/Shopify\.currency\s*=\s*(\{[^;]+\})/);
   if(!currency)return fail('Not a Shopify storefront, or the currency could not be read');
   if(JSON.parse(currency[1]).active!=='CAD')return fail('Storefront does not price in CAD');
   const sample=await read(`${origin}${SHOPIFY_PATHS[0]}`);
   if(sample.status!==200)return fail(`Catalogue returned HTTP ${sample.status}`);
   const parsed=JSON.parse(sample.body) as {products?:unknown[]};
   if(!Array.isArray(parsed.products)||!parsed.products.length)return fail('Catalogue returned no products');
   return {origin,adapter:'shopify-public',usable:true,reason:`Public CAD catalogue with ${parsed.products.length} products on the first page`,paths:SHOPIFY_PATHS,checkedAt};
  }catch(error){
   return fail(error instanceof Error?error.message:'The retailer could not be reached');
  }
 },
 async collect({origin,name,chainId,paths},read,ledger,now){
  const checkedAt=now.toISOString();
  const evidence:Evidence[]=[];
  try{
   const robots=await read(`${origin}/robots.txt`);
   if(robots.status!==200||blockedByRobots(robots.body,paths))throw new Error('Catalogue collection is disallowed by the retailer');
   const storefront=await read(`${origin}/`);
   const currency=storefront.body.match(/Shopify\.currency\s*=\s*(\{[^;]+\})/);
   if(!currency||JSON.parse(currency[1]).active!=='CAD')throw new Error('Retailer currency could not be verified as CAD at collection time');
   const source:CatalogueSource={id:chainId??origin,name,origin};
   const offers:SourcedOffer[]=[];
   for(const path of paths){
    const response=await read(`${origin}${path}`);
    if(response.status!==200)throw new Error(`Catalogue returned HTTP ${response.status}`);
    const row=await ledger.record({origin,url:response.url,method:'GET',status:response.status,fetchedAt:response.fetchedAt,adapter:`${this.id}@${this.version}`,note:`Public catalogue page ${path}`,body:response.body});
    evidence.push(row);
    // Re-read each variant out of the parsed body so the excerpt kept beside
    // the price is the retailer's own text, not a reconstruction.
    for(const offer of normalizeProducts(JSON.parse(response.body),source,now)){
     offers.push({...offer,evidenceId:row.id,excerpt:excerptFor(offer)});
    }
   }
   const unique=[...new Map(offers.map(o=>[o.id,o])).values()];
   if(!unique.length)throw new Error('No valid product prices were returned');
   return {origin,chainId,name,status:'ready',message:'Public online catalogue. Branch stock, delivery area and checkout charges are not confirmed.',offers:unique,evidence,checkedAt};
  }catch(error){
   console.warn(`Adapter ${this.id} could not read ${origin}`,error instanceof Error?error.message:'Unknown error');
   return {origin,chainId,name,status:'unavailable',message:error instanceof Error?error.message:'This catalogue could not be read.',offers:[],evidence,checkedAt};
  }
 },
};

const excerptFor=(offer:Offer)=>`${offer.title} — ${(offer.price/100).toFixed(2)} CAD — ${offer.available?'available':'unavailable'} — ${offer.url}`;

export const ADAPTERS:Adapter[]=[shopifyAdapter];
export const adapterById=(id:string)=>ADAPTERS.find(a=>a.id===id)??null;

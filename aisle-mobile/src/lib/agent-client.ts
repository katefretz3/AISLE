import {Capacitor,CapacitorHttp} from '@capacitor/core';
import {Filesystem,Directory,Encoding} from '@capacitor/filesystem';
import {SOURCES,type MarketSnapshot,type SourceResult} from './agent/types';
import {collectSource,fetchText} from './agent/collector';
import {collectPlaces,type PlaceResult} from './agent/places';
const cacheDir=Directory.Data;
async function readCache<T>(path:string):Promise<T|null>{try{const r=await Filesystem.readFile({path,directory:cacheDir,encoding:Encoding.UTF8});return JSON.parse(typeof r.data==='string'?r.data:await r.data.text()) as T;}catch{return null;}}
async function writeCache(path:string,value:unknown){await Filesystem.writeFile({path,directory:cacheDir,encoding:Encoding.UTF8,data:JSON.stringify(value),recursive:true});}
async function nativeText(url:string){
 if(!Capacitor.isNativePlatform())return fetchText(url);
 const allowed=SOURCES.some(s=>url.startsWith(s.origin+'/'));if(!allowed)throw new Error('Unknown retailer');
 const r=await CapacitorHttp.get({url,connectTimeout:12000,readTimeout:12000,responseType:'text',headers:{Accept:'application/json,text/plain','User-Agent':'AisleMobile/1.0'}});
 if(r.status!==200)throw new Error(`Retailer returned HTTP ${r.status}`);const text=typeof r.data==='string'?r.data:JSON.stringify(r.data);if(text.length>4000000)throw new Error('Retailer response exceeded limit');return text;
}
let marketJob:Promise<MarketSnapshot>|undefined;
export async function loadMarket(refresh=false):Promise<MarketSnapshot>{
 if(marketJob)return marketJob;
 marketJob=(async()=>{const saved=await readCache<MarketSnapshot>('aisle/market.json');if(saved&&(!refresh||Date.now()-Date.parse(saved.collectedAt)<3600000))return saved;
  const sources:SourceResult[]=[];for(const source of SOURCES)sources.push(await collectSource(source,nativeText));const next={sources,collectedAt:new Date().toISOString()};await writeCache('aisle/market.json',next);return next;})();
 try{return await marketJob;}finally{marketJob=undefined;}
}
export async function loadPlaces(area:{lat:number;lng:number}):Promise<PlaceResult>{
 const path=`aisle/places-${area.lat}-${area.lng}.json`;const old=await readCache<PlaceResult>(path);if(old&&Date.now()-Date.parse(old.checkedAt)<(old.status==='ready'?86400000:300000))return old;
 const next=await collectPlaces(area,Capacitor.isNativePlatform()?async query=>{
  const r=await CapacitorHttp.post({url:'https://overpass.private.coffee/api/interpreter',headers:{'Content-Type':'application/x-www-form-urlencoded'},data:new URLSearchParams({data:query}).toString(),responseType:'text',connectTimeout:12000,readTimeout:20000});
  if(r.status!==200)throw new Error('Directory unavailable');const text=typeof r.data==='string'?r.data:JSON.stringify(r.data);if(text.length>2000000)throw new Error('Directory response too large');return JSON.parse(text);
 }:undefined);await writeCache(path,next);return next;
}

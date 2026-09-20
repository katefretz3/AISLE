// Store and feed discovery.
//
// Candidate retailers are not hard-coded from memory. They come from the
// OpenStreetMap directory for the household's own search area, which returns
// real mapped shops with real `website` tags. Those websites are then probed to
// find out whether a public CAD catalogue exists. A chain the registry already
// knows has no public feed is reported as such and never probed.
import {nearbyPlaces,placeArea,type GroceryPlace,type PlaceResult} from './places';
import {chainFor,inOntario,SEEDED_ORIGINS,CHAINS} from './registry';
import {ADAPTERS,type ProbeVerdict} from './adapters';
import {OriginGuard,safeHost,type Reader} from './net';
import type {Preferences} from '../catalog';

export type DiscoveredStore=GroceryPlace&{km:number;preferred:boolean;chainName:string|null;feed:'connected'|'no-public-feed'|'unprobed'};
export type FeedCandidate={origin:string;name:string;chainId:string|null;storeCount:number;source:'registry'|'openstreetmap'};

/** Nearby Ontario grocery stores for this household's saved pin and radius. */
export async function discoverStores(prefs:Preferences,fetchPlaces:(area:{lat:number;lng:number})=>Promise<PlaceResult>){
 const area=placeArea(prefs);
 const result=await fetchPlaces(area);
 const withinOntario={...result,places:result.places.filter(inOntario)};
 const nearby=nearbyPlaces(withinOntario,prefs);
 const stores:DiscoveredStore[]=nearby.map(place=>{
  const chain=chainFor(place.name,place.brand??'');
  return {...place,chainName:chain?.name??null,
   feed:chain?.feed.kind==='shopify-public'?'connected':chain?.feed.kind==='none'?'no-public-feed':'unprobed'};
 });
 return {area,status:withinOntario.status,message:withinOntario.message,checkedAt:withinOntario.checkedAt,stores,
  dropped:result.places.length-withinOntario.places.length};
}

/**
 * Turn discovered stores into probe candidates. Seeded origins come first, then
 * distinct mapped websites. Chains the registry marks as having no public feed
 * are excluded here so we do not hammer sites that cannot answer.
 */
export function feedCandidates(stores:DiscoveredStore[],limit=8):FeedCandidate[]{
 const candidates=new Map<string,FeedCandidate>();
 for(const [origin,meta] of Object.entries(SEEDED_ORIGINS)){
  const chain=CHAINS.find(c=>c.id===meta.chainId);
  candidates.set(origin,{origin,name:chain?.name??origin,chainId:meta.chainId,storeCount:0,source:'registry'});
 }
 for(const store of stores){
  const chain=chainFor(store.name,store.brand??'');
  if(chain&&chain.feed.kind==='none')continue;          // Known to publish nothing. Reported, not probed.
  if(!store.website)continue;
  const host=safeHost(store.website);
  if(!host)continue;
  const origin=`https://${host}`;
  const existing=candidates.get(origin);
  if(existing){existing.storeCount+=1;continue;}
  candidates.set(origin,{origin,name:chain?.name??store.brand??store.name,chainId:chain?.id??null,storeCount:1,source:'openstreetmap'});
 }
 return [...candidates.values()]
  .sort((a,b)=>Number(a.source!=='registry')-Number(b.source!=='registry')||b.storeCount-a.storeCount||a.origin.localeCompare(b.origin))
  .slice(0,limit);
}

export type ProbeReport=ProbeVerdict&{name:string;chainId:string|null;source:FeedCandidate['source']};

/** Probe candidates in order, stopping once the budget is spent. */
export async function probeFeeds(candidates:FeedCandidate[],guard:OriginGuard,read:Reader,maxProbes=5):Promise<ProbeReport[]>{
 const reports:ProbeReport[]=[];
 for(const candidate of candidates.slice(0,maxProbes)){
  guard.allow(candidate.origin);
  const seeded=SEEDED_ORIGINS[candidate.origin];
  for(const adapter of ADAPTERS){
   const verdict=seeded
    // Already reviewed; confirm it still answers rather than re-probing blind.
    ? {...await adapter.probe(candidate.origin,read),paths:seeded.paths}
    : await adapter.probe(candidate.origin,read);
   reports.push({...verdict,name:candidate.name,chainId:candidate.chainId,source:candidate.source});
   if(verdict.usable)break;
  }
 }
 return reports;
}

/** Chains the user can see near them that Aisle genuinely cannot price yet. */
export function coverageGaps(stores:DiscoveredStore[]){
 const gaps=new Map<string,{chainId:string;name:string;reason:string;stores:number;nearestKm:number}>();
 for(const store of stores){
  const chain=chainFor(store.name,store.brand??'');
  if(!chain||chain.feed.kind!=='none')continue;
  const row=gaps.get(chain.id)??{chainId:chain.id,name:chain.name,reason:chain.feed.reason,stores:0,nearestKm:Infinity};
  row.stores+=1;row.nearestKm=Math.min(row.nearestKm,store.km);
  gaps.set(chain.id,row);
 }
 return [...gaps.values()].sort((a,b)=>a.nearestKm-b.nearestKm);
}

// What Aisle can and cannot price, per Ontario chain.
//
// This replaces the old "grocery chain directory", which listed six chains with
// invented distances and a `priced` flag that decided which fake prices to
// generate. The question a shopper actually has is "why is my Loblaws not in
// here?", and that has a real answer: the chain publishes no machine-readable
// price feed. Saying so is more useful than a number that was made up.
import {CHAINS,type ChainPolicy} from './agent/registry';
import type {AgentRun} from './agent';

export type CoverageStatus=
 |'read'          // A catalogue was read on the last run.
 |'readable'      // Publishes a feed Aisle can read; not read on the last run.
 |'no-feed'       // Publishes nothing machine-readable.
 |'unknown';      // Never probed.

export type CoverageRow={
 chain:ChainPolicy;
 status:CoverageStatus;
 /** One sentence the user can act on or at least understand. */
 explanation:string;
 /** Branches found near the household on the last run, if any. */
 nearby:number;
 /** Straight-line km to the closest branch found, or null if none was. */
 nearestKm:number|null;
 /** Price records read from this chain on the last run. */
 records:number;
};

const STATUS_ORDER:Record<CoverageStatus,number>={read:0,readable:1,'no-feed':2,unknown:3};

/**
 * Join the static chain registry against what the last run actually observed.
 *
 * Without a run this still returns every chain, because "we cannot read Metro's
 * prices" is true before any search happens and is worth saying up front.
 */
export function coverageRows(run:AgentRun|null):CoverageRow[]{
 const sources=new Map((run?.sources??[]).map(s=>[s.chainId??'',s]));
 const branches=new Map<string,{count:number;nearestKm:number}>();
 for(const store of run?.stores??[]){
  if(!store.chainId)continue;
  const row=branches.get(store.chainId)??{count:0,nearestKm:Infinity};
  row.count+=1;
  if(Number.isFinite(store.km))row.nearestKm=Math.min(row.nearestKm,store.km);
  branches.set(store.chainId,row);
 }

 return CHAINS.map(chain=>{
  const source=sources.get(chain.id);
  const seen=branches.get(chain.id);
  const nearby=seen?.count??0;
  const nearestKm=seen&&Number.isFinite(seen.nearestKm)?seen.nearestKm:null;
  const records=source?.records??0;

  let status:CoverageStatus;
  let explanation:string;
  if(source?.status==='ready'&&records>0){
   status='read';
   explanation=`${records} price ${records===1?'record':'records'} read from this retailer's public catalogue on the last check.`;
  }else if(chain.feed.kind==='shopify-public'){
   status='readable';
   explanation=source?.status==='unavailable'&&source.message
    ? `Publishes a public catalogue, but the last check did not complete: ${source.message}`
    : 'Publishes a public catalogue Aisle can read. Run a price check to collect it.';
  }else if(chain.feed.kind==='none'){
   status='no-feed';
   explanation=chain.feed.reason;
  }else{
   status='unknown';
   explanation='Not yet probed for a public price feed.';
  }

  return {chain,status,explanation,nearby,nearestKm,records};
 }).sort((a,b)=>
  STATUS_ORDER[a.status]-STATUS_ORDER[b.status]
  ||b.nearby-a.nearby
  ||a.chain.name.localeCompare(b.chain.name));
}

export type CoverageSummary={readable:number;total:number;nearbyUnreadable:number};

/** The headline number: how much of the market Aisle can actually price. */
export function coverageSummary(rows:CoverageRow[]):CoverageSummary{
 return {
  readable:rows.filter(r=>r.status==='read'||r.status==='readable').length,
  total:rows.length,
  nearbyUnreadable:rows.filter(r=>r.nearby>0&&(r.status==='no-feed'||r.status==='unknown')).length,
 };
}

export const STATUS_LABEL:Record<CoverageStatus,string>={
 read:'Prices read',
 readable:'Can be read',
 'no-feed':'No price feed',
 unknown:'Not probed',
};

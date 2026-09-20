// The agent loop.
//
// Phases: discover → collect → match → verify → compose.
//
// The match phase is the only one a language model participates in, and even
// there it is choosing among records the collect phase already fetched. The
// verify phase then re-checks every offer still referenced against the evidence
// ledger and throws away anything that no longer stands up, before a single
// figure is totalled. If no model is configured the deterministic planner runs
// the identical tools, so the app's behaviour degrades in explanation quality,
// never in accuracy.
import {buildShopperModel} from './memory';
import {EvidenceLedger,verifiedOffers,type Evidence,type SourcedOffer} from './provenance';
import {OriginGuard,createReader,type Reader} from './net';
import {computeBaskets,toolByName,type Basket,type Budget,type Proposal,type ToolContext} from './tools';
import {matchOffer,requiredPacks} from './engine';
import {AGENT_SYSTEM_PROMPT,allowedDistances,allowedFigures,reviewNarrative,type Violation} from './policy';
import {brokerConfig,runToolLoop,type LoopEvent} from './model';
import {coverageGaps,type DiscoveredStore} from './discovery';
import {productById,type UserState} from '../catalog';
import type {PlaceResult} from './places';
import type {CollectOutcome} from './adapters';

export type Phase='discover'|'collect'|'match'|'verify'|'compose';
export type TraceStep={phase:Phase;label:string;detail:string;at:string;ms:number};
export type AgentRun={
 runId:string;
 mode:'assisted'|'deterministic';
 startedAt:string;
 finishedAt:string;
 durationMs:number;
 stores:DiscoveredStore[];
 coverageGaps:ReturnType<typeof coverageGaps>;
 sources:{name:string;origin:string;status:CollectOutcome['status'];message:string;records:number;checkedAt:string}[];
 baskets:Basket[];
 unmatched:{itemId:string;name:string;reason:string}[];
 proposals:Proposal[];
 narrative:string;
 violations:Violation[];
 rejectedOffers:{offerId:string;retailer:string;faults:string[]}[];
 evidence:Evidence[];
 trace:TraceStep[];
 budgetSpent:{toolCalls:number;probes:number;collects:number;evidenceBytes:number};
 warnings:string[];
};

export type RunOptions={
 state:UserState;
 now?:number;
 signal?:AbortSignal;
 budget?:Partial<Omit<Budget,'deadline'>>;
 timeoutMs?:number;
 fetchPlaces?:(area:{lat:number;lng:number})=>Promise<PlaceResult>;
 reader?:Reader;
 onEvent?:(event:LoopEvent)=>void;
 forceDeterministic?:boolean;
};

const DEFAULT_BUDGET:Omit<Budget,'deadline'>={maxToolCalls:28,maxProbes:5,maxCollects:4};
const newRunId=()=>Array.from(crypto.getRandomValues(new Uint8Array(8)),b=>b.toString(16).padStart(2,'0')).join('');

export async function runAgent(options:RunOptions):Promise<AgentRun>{
 const now=options.now??Date.now();
 const startedAt=new Date(now).toISOString();
 const started=Date.now();
 const trace:TraceStep[]=[];
 const warnings:string[]=[];
 let phase:Phase='discover';
 const mark=(label:string,detail:string)=>{trace.push({phase,label,detail,at:new Date().toISOString(),ms:Date.now()-started});};

 const shopper=buildShopperModel(options.state,now);
 const ledger=new EvidenceLedger();
 const guard=new OriginGuard();
 const read=options.reader??createReader(guard);
 const ctx:ToolContext={
  state:options.state,shopper,ledger,guard,read,
  // Imported lazily so the agent core stays runnable (and testable) outside a device build.
  fetchPlaces:options.fetchPlaces??(async area=>(await import('../agent-client')).loadPlaces(area)),
  now,
  budget:{...DEFAULT_BUDGET,...options.budget,deadline:Date.now()+(options.timeoutMs??90_000)},
  stores:[],probes:[],sources:[],offers:[],proposals:new Map(),unmatched:new Map(),
  counters:{toolCalls:0,probes:0,collects:0},
  log:(label,detail)=>mark(label,detail),
 };

 // ---- discover -----------------------------------------------------------
 await call('find_stores_nearby',{},ctx);
 if(!ctx.stores.length)warnings.push('The store directory returned nothing for your area, so nearby stores could not be listed. Your saved location is unchanged.');
 phase='collect';
 await call('discover_price_feeds',{},ctx);
 const readable=ctx.probes.filter(p=>p.usable).map(p=>p.origin);
 if(readable.length)await call('collect_prices',{origins:readable.slice(0,ctx.budget.maxCollects)},ctx);
 else warnings.push('No retailer near you publishes a price catalogue Aisle is allowed to read right now, so no prices were collected.');

 // ---- match --------------------------------------------------------------
 phase='match';
 const config=options.forceDeterministic?null:brokerConfig();
 let narrative='';
 let mode:AgentRun['mode']='deterministic';
 if(config&&ctx.offers.length){
  mode='assisted';
  const outcome=await runToolLoop({config,system:AGENT_SYSTEM_PROMPT,goal:buildGoal(ctx),ctx,maxSteps:10,onEvent:options.onEvent,signal:options.signal});
  narrative=outcome.narrative;
  mark('reasoning',`Assisted matching finished after ${outcome.steps} steps and ${outcome.toolCalls} tool calls (${outcome.stopped})`);
  if(outcome.stopped==='error'){
   mode='deterministic';
   warnings.push(`The reasoning service was unavailable (${outcome.error}). Aisle matched your list with its built-in rules instead; no prices were affected.`);
   narrative='';
  }
 }else if(config){
  warnings.push('No prices were collected, so there was nothing for the reasoning step to match.');
 }
 if(mode==='deterministic'){
  const filled=planDeterministically(ctx);
  mark('rule-based matching',`${filled} of ${ctx.state.items.length} list items matched a collected record by rule`);
 }

 // ---- verify -------------------------------------------------------------
 phase='verify';
 const {kept,rejected}=verifiedOffers(ctx.offers,ledger,now);
 const keptIds=new Set(kept.map(o=>o.id));
 ctx.offers=kept;
 for(const [key,proposal] of [...ctx.proposals]){
  if(keptIds.has(proposal.offerId))continue;
  ctx.proposals.delete(key);
  const item=ctx.state.items.find(i=>i.id===proposal.itemId);
  if(item)ctx.unmatched.set(item.id,'The collected price for this match did not pass verification and was discarded');
 }
 mark('verification',`${kept.length} price records verified against their source responses; ${rejected.length} discarded`);

 // ---- compose ------------------------------------------------------------
 phase='compose';
 const baskets=computeBaskets(ctx);
 const figures=allowedFigures(ctx.offers,[shopper.perShopBudget,...baskets.flatMap(b=>[b.subtotal,b.overBudget])]);
 const distances=allowedDistances(ctx.stores.map(s=>s.km));
 const offerIds=new Set(ctx.offers.map(o=>o.id));
 const reviewed=reviewNarrative(narrative||describe(ctx,baskets),figures,distances,offerIds);
 if(reviewed.violations.length)mark('policy review',`${reviewed.violations.length} unsupported statement(s) removed from the explanation`);
 else mark('policy review','Every figure in the explanation traces to a collected price or a computed total');

 const finished=Date.now();
 return {
  runId:newRunId(),mode,startedAt,finishedAt:new Date(finished).toISOString(),durationMs:finished-started,
  stores:ctx.stores,coverageGaps:coverageGaps(ctx.stores),
  sources:ctx.sources.map(s=>({name:s.name,origin:s.origin,status:s.status,message:s.message,records:s.offers.length,checkedAt:s.checkedAt})),
  baskets,
  unmatched:ctx.state.items.filter(item=>!baskets.some(b=>b.lines.some(l=>l.itemId===item.id&&l.offer)))
   .map(item=>({itemId:item.id,name:item.name,reason:ctx.unmatched.get(item.id)||'No collected record matched this item'})),
  proposals:[...ctx.proposals.values()],
  narrative:reviewed.text,violations:reviewed.violations,
  rejectedOffers:rejected.map(r=>({offerId:r.offer.id,retailer:r.offer.retailer,faults:r.faults})),
  evidence:ledger.all(),trace,
  budgetSpent:{...ctx.counters,evidenceBytes:ledger.bytes},
  warnings,
 };
}

async function call(name:string,args:unknown,ctx:ToolContext){
 const tool=toolByName(name);
 if(!tool)return;
 if(ctx.counters.toolCalls>=ctx.budget.maxToolCalls||Date.now()>ctx.budget.deadline)return;
 ctx.counters.toolCalls+=1;
 try{await tool.run(tool.schema.parse(args),ctx);}
 catch(error){ctx.log(name,error instanceof Error?error.message:'This step failed');}
}

function buildGoal(ctx:ToolContext){
 const items=ctx.state.items.map(i=>`- ${i.id}: ${i.qty} × ${i.name}${i.locked?' (locked to this exact brand and size)':''}`).join('\n');
 return `Match this household's grocery list against the price records already collected, then total the result.

List:
${items}

Read the profile first so the household's own preferences shape the ranking. Search the collected offers for each item. Propose a match only where a collected record really is the item asked for; flag anything else as unavailable. Finish by calling compute_basket, then write two or three sentences explaining what you matched and what you could not.`;
}

/** The fallback planner. Same tools, same constraints, rules instead of a model. */
function planDeterministically(ctx:ToolContext){
 let filled=0;
 for(const item of ctx.state.items){
  const product=item.productId?productById[item.productId]:undefined;
  const ranked=ctx.offers
   .map(offer=>({offer,scored:matchOffer(item,offer,ctx.state,ctx.now)}))
   .filter((row):row is {offer:SourcedOffer;scored:NonNullable<ReturnType<typeof matchOffer>>}=>row.scored!==null&&row.scored.packs!==null)
   .sort((a,b)=>b.scored.score-a.scored.score||a.offer.price-b.offer.price);
  // One proposal per retailer, so each basket can be costed independently.
  const seen=new Set<string>();
  let matched=false;
  for(const row of ranked){
   if(seen.has(row.offer.sourceId))continue;
   seen.add(row.offer.sourceId);
   const packs=requiredPacks(item,row.offer);
   if(packs===null||packs<=0)continue;
   const confidence=row.scored.brandMatches&&row.scored.sameSize?'high':row.scored.sameSize||row.scored.brandMatches?'medium':'low';
   ctx.proposals.set(`${item.id}::${row.offer.sourceId}`,{itemId:item.id,sourceId:row.offer.sourceId,offerId:row.offer.id,packs,
    lineTotal:row.offer.price*packs,confidence,
    rationale:`${row.scored.reason}. Matched by name, brand and pack rules against the collected catalogue entry.`,origin:'agent'});
   matched=true;
  }
  if(matched){filled+=1;ctx.unmatched.delete(item.id);}
  else ctx.unmatched.set(item.id,product
   ?`No collected catalogue record matches ${product.name} (${product.brand}, ${product.size}) within your brand and pack rules`
   :`No collected catalogue record matches "${item.name}"`);
 }
 return filled;
}

/** Plain-language summary used when no model wrote one. Facts only. */
function describe(ctx:ToolContext,baskets:Basket[]){
 const ready=ctx.sources.filter(s=>s.status==='ready');
 if(!ready.length)return 'No retailer catalogue could be read for your area, so Aisle has no prices to show. Nothing here is estimated.';
 const best=baskets[0];
 const matched=best?best.priced:0;
 const parts=[`Aisle read ${ctx.offers.length} current price records from ${ready.length} ${ready.length===1?'retailer':'retailers'} near you and matched ${matched} of ${ctx.state.items.length} list items.`];
 if(best&&!best.complete)parts.push(`No basket is complete yet, so none is being ranked as cheapest — ${best.total-best.priced} ${best.total-best.priced===1?'item has':'items have'} no collected price.`);
 if(best&&best.unconfirmed)parts.push(`${best.unconfirmed} ${best.unconfirmed===1?'match is':'matches are'} waiting on your confirmation before they count towards a total.`);
 const gaps=coverageGaps(ctx.stores);
 if(gaps.length)parts.push(`${gaps.length} ${gaps.length===1?'chain':'chains'} near you publish no price feed Aisle can read, so they are listed without prices rather than estimated.`);
 return parts.join(' ');
}

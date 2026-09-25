// The agent's tools.
//
// Each tool is ordinary deterministic TypeScript. The model chooses which to
// call and with what arguments; it never produces the results. Arguments are
// validated with zod before a handler runs, so a malformed or adventurous call
// fails with a message the model can read and correct rather than doing
// something unintended.
//
// Hard constraints (locks, exclusions, protected brands) are enforced *inside*
// the handlers. A model that proposes a match violating one gets a refusal, not
// a quiet acceptance.
import {z} from 'zod';
import {productById,type ListItem,type UserState} from '../catalog';
import {matchOffer,requiredPacks,words} from './engine';
import {brandNudge,type ShopperModel} from './memory';
import {EvidenceLedger,type SourcedOffer} from './provenance';
import {OriginGuard,type Reader} from './net';
import {ADAPTERS} from './adapters';
import {coverageGaps,discoverStores,feedCandidates,probeFeeds,type DiscoveredStore,type ProbeReport} from './discovery';
import {SEEDED_ORIGINS} from './registry';
import type {CollectOutcome} from './adapters';
import type {PlaceResult} from './places';
import {reviewRationale,allowedFigures} from './policy';

/**
 * Why an item ended up with no price.
 *
 * The kind is carried rather than inferred from the prose, so the interface can
 * state a shared explanation once for a group of items instead of repeating a
 * near-identical paragraph per row. `detail` stays item-specific and is still
 * shown; it is the reasoning, not the boilerplate around it.
 */
export type UnmatchedKind=
 |'no-record'   // Nothing in the collected catalogues corresponds to the item.
 |'discarded'   // A price was found but failed verification, so it was dropped.
 |'flagged';    // Recorded as genuinely unavailable rather than substituted.

export type UnmatchedReason={kind:UnmatchedKind;detail:string};

export type Proposal={itemId:string;sourceId:string;offerId:string;packs:number;lineTotal:number;confidence:'high'|'medium'|'low';rationale:string;origin:'agent'|'confirmed'};
export type Budget={maxToolCalls:number;maxProbes:number;maxCollects:number;deadline:number};

export type ToolContext={
 state:UserState;
 shopper:ShopperModel;
 ledger:EvidenceLedger;
 guard:OriginGuard;
 read:Reader;
 fetchPlaces:(area:{lat:number;lng:number})=>Promise<PlaceResult>;
 now:number;
 budget:Budget;
 stores:DiscoveredStore[];
 probes:ProbeReport[];
 sources:CollectOutcome[];
 offers:SourcedOffer[];
 proposals:Map<string,Proposal>;
 unmatched:Map<string,UnmatchedReason>;
 counters:{toolCalls:number;probes:number;collects:number};
 log:(label:string,detail:string)=>void;
};

export type ToolResult={ok:boolean;[key:string]:unknown};
export type Tool={
 name:string;
 description:string;
 schema:z.ZodTypeAny;
 json:Record<string,unknown>;
 run(args:any,ctx:ToolContext):Promise<ToolResult>;
};

const refuse=(reason:string):ToolResult=>({ok:false,refused:reason});
const proposalKey=(itemId:string,sourceId:string)=>`${itemId}::${sourceId}`;
const itemLabel=(item:ListItem)=>{
 const product=item.productId?productById[item.productId]:undefined;
 return product?`${product.name} · ${product.brand} · ${product.size}`:item.name;
};

/** Constraints the household set explicitly. A model cannot argue past these. */
function constraintBlock(item:ListItem,offer:SourcedOffer,state:UserState):string|null{
 const product=item.productId?productById[item.productId]:undefined;
 if(product&&state.prefs.excludedProducts.includes(product.id))return `${product.name} is on the household's excluded list`;
 const scored=matchOffer(item,offer,state,Date.now());
 if(!scored)return 'This offer does not satisfy the household\'s brand locks, exclusions or name match for that item';
 if(scored.packs===null)return 'The retailer pack size is not comparable with the requested size, so the quantity cannot be worked out';
 return null;
}

export const TOOLS:Tool[]=[
 {
  name:'get_shopper_profile',
  description:'The household profile: options set during onboarding, and the preferences learned from their own confirmed choices and recorded trips. Read this before matching.',
  schema:z.object({}).strict(),
  json:{type:'object',properties:{},additionalProperties:false},
  async run(_args,ctx){
   const m=ctx.shopper;
   return {ok:true,explicit:m.explicit,cadenceDays:m.cadenceDays,perShopBudgetCents:m.perShopBudget,
    learningEnabled:m.learningEnabled,confidence:m.confidence,
    brandPreferences:m.brands.slice(0,15).map(b=>({brand:b.label,acceptanceRate:Number(b.probability.toFixed(2)),observations:b.samples})),
    dueForRepurchase:m.replenishment.filter(r=>r.due).slice(0,10).map(r=>({product:r.name,everyDays:r.intervalDays,daysSince:r.daysSince,basis:r.basis})),
    notes:m.notes};
  },
 },
 {
  name:'get_grocery_list',
  description:'The household\'s current grocery list, with quantities and which items are locked to an exact brand and size.',
  schema:z.object({}).strict(),
  json:{type:'object',properties:{},additionalProperties:false},
  async run(_args,ctx){
   return {ok:true,listName:ctx.state.listName,items:ctx.state.items.map(item=>{
    const product=item.productId?productById[item.productId]:undefined;
    return {itemId:item.id,name:item.name,quantity:item.qty,locked:item.locked,
     knownProduct:product?{brand:product.brand,size:product.size,category:product.category}:null,
     custom:!product};
   })};
  },
 },
 {
  name:'find_stores_nearby',
  description:'Grocery stores mapped within the household\'s saved radius in Ontario, with straight-line distance. Also reports which nearby chains Aisle has no price feed for.',
  schema:z.object({}).strict(),
  json:{type:'object',properties:{},additionalProperties:false},
  async run(_args,ctx){
   const found=await discoverStores(ctx.state.prefs,ctx.fetchPlaces);
   ctx.stores=found.stores;
   ctx.log('find_stores_nearby',`${found.stores.length} mapped stores within ${ctx.state.prefs.radius} km`);
   return {ok:true,status:found.status,message:found.message,checkedAt:found.checkedAt,
    stores:found.stores.slice(0,25).map(s=>({name:s.name,chain:s.chainName,km:Number(s.km.toFixed(1)),address:s.address,preferred:s.preferred,priceFeed:s.feed,mapUrl:s.url})),
    chainsWithoutPriceData:coverageGaps(found.stores).map(g=>({chain:g.name,storesNearby:g.stores,nearestKm:Number(g.nearestKm.toFixed(1)),reason:g.reason})),
    note:'Distances are straight-line, not driving routes. Being listed here does not mean Aisle knows that branch\'s prices.'};
  },
 },
 {
  name:'discover_price_feeds',
  description:'Check which of the nearby retailers publish a public price catalogue that Aisle is allowed to read. Call find_stores_nearby first. Returns a verdict per retailer; no prices.',
  schema:z.object({}).strict(),
  json:{type:'object',properties:{},additionalProperties:false},
  async run(_args,ctx){
   if(ctx.counters.probes>=ctx.budget.maxProbes)return refuse('The feed-discovery budget for this run is spent');
   const candidates=feedCandidates(ctx.stores);
   const remaining=Math.max(0,ctx.budget.maxProbes-ctx.counters.probes);
   const reports=await probeFeeds(candidates,ctx.guard,ctx.read,remaining);
   ctx.counters.probes+=reports.length;
   ctx.probes=[...ctx.probes,...reports];
   ctx.log('discover_price_feeds',`${reports.filter(r=>r.usable).length} of ${reports.length} probed retailers serve a readable CAD catalogue`);
   return {ok:true,feeds:reports.map(r=>({retailer:r.name,origin:r.origin,readable:r.usable,reason:r.reason,discoveredVia:r.source}))};
  },
 },
 {
  name:'collect_prices',
  description:'Read the current catalogue from retailers that discover_price_feeds found readable. Every price returned is recorded with the response it came from. Call this before searching offers.',
  schema:z.object({origins:z.array(z.string().url()).min(1).max(6)}).strict(),
  json:{type:'object',properties:{origins:{type:'array',items:{type:'string'},minItems:1,maxItems:6,description:'Retailer origins reported readable by discover_price_feeds, e.g. https://example.ca'}},required:['origins'],additionalProperties:false},
  async run(args:{origins:string[]},ctx){
   const usable=new Map(ctx.probes.filter(p=>p.usable).map(p=>[p.origin,p]));
   const wanted=args.origins.filter(o=>usable.has(o));
   if(!wanted.length)return refuse('None of those origins were reported readable by discover_price_feeds. Call it first and use the origins it returns.');
   const outcomes:CollectOutcome[]=[];
   for(const origin of wanted){
    if(ctx.counters.collects>=ctx.budget.maxCollects)break;
    if(Date.now()>ctx.budget.deadline)break;
    const probe=usable.get(origin)!;
    const adapter=ADAPTERS.find(a=>a.id===probe.adapter);
    if(!adapter)continue;
    const paths=SEEDED_ORIGINS[origin]?.paths??probe.paths;
    const outcome=await adapter.collect({origin,name:probe.name,chainId:probe.chainId,paths},ctx.read,ctx.ledger,new Date(ctx.now));
    ctx.counters.collects+=1;
    outcomes.push(outcome);
    ctx.sources=[...ctx.sources.filter(s=>s.origin!==origin),outcome];
    ctx.offers=[...ctx.offers.filter(o=>!outcome.offers.some(n=>n.id===o.id)),...outcome.offers];
   }
   ctx.log('collect_prices',`${ctx.offers.length} priced records held from ${ctx.sources.filter(s=>s.status==='ready').length} retailers`);
   return {ok:true,collected:outcomes.map(o=>({retailer:o.name,origin:o.origin,status:o.status,message:o.message,
    priceRecords:o.offers.length,checkedAt:o.checkedAt,evidenceIds:o.evidence.map(e=>e.id)}))};
  },
 },
 {
  name:'search_offers',
  description:'Search the collected price records. Returns real catalogue entries with their retailer, title, brand, pack size, price in cents and source URL. This is the only place prices come from.',
  schema:z.object({query:z.string().min(1).max(120),itemId:z.string().max(64).optional(),origin:z.string().url().optional(),limit:z.number().int().min(1).max(25).optional()}).strict(),
  json:{type:'object',properties:{
   query:{type:'string',description:'Words to match against product title and brand, e.g. "whole wheat bread"'},
   itemId:{type:'string',description:'Optional list item id; results are then ranked for that item and annotated with how many packs it would take'},
   origin:{type:'string',description:'Optional retailer origin to restrict the search to'},
   limit:{type:'number',description:'Maximum results, default 10'}},required:['query'],additionalProperties:false},
  async run(args:{query:string;itemId?:string;origin?:string;limit?:number},ctx){
   const item=args.itemId?ctx.state.items.find(i=>i.id===args.itemId):undefined;
   if(args.itemId&&!item)return refuse(`No list item with id ${args.itemId}`);
   const terms=words(args.query);
   const pool=ctx.offers.filter(o=>(!args.origin||o.url.startsWith(args.origin))&&o.available&&Date.parse(o.expiresAt)>ctx.now);
   const scored=pool.map(offer=>{
    const haystack=words(`${offer.title} ${offer.brand}`);
    const hits=terms.filter(t=>haystack.includes(t)).length;
    const product=item?.productId?productById[item.productId]:undefined;
    const nudge=product?brandNudge(ctx.shopper,product.category,offer.brand):0;
    const ranked=item?matchOffer(item,offer,ctx.state,ctx.now):null;
    return {offer,textScore:hits/Math.max(1,terms.length),eligible:!!ranked,packs:item?requiredPacks(item,offer):null,nudge,
     score:(hits/Math.max(1,terms.length))*5+(ranked?ranked.score/5:0)+nudge};
   }).filter(row=>row.textScore>0)
     .sort((a,b)=>b.score-a.score||a.offer.price-b.offer.price)
     .slice(0,args.limit??10);
   if(!scored.length)return {ok:true,results:[],note:'No collected record matches that search. Nothing in the catalogues corresponds to it; report it as unavailable rather than substituting something else.'};
   return {ok:true,results:scored.map(row=>({
    offerId:row.offer.id,retailer:row.offer.retailer,title:row.offer.title,brand:row.offer.brand||'(not stated)',
    packSize:row.offer.pack?`${row.offer.pack.amount} ${row.offer.pack.unit}`:'not stated by the retailer',
    priceCents:row.offer.price,currency:row.offer.currency,url:row.offer.url,observedAt:row.offer.observedAt,
    packsNeededForThisItem:row.packs,satisfiesHouseholdConstraints:row.eligible,evidenceId:row.offer.evidenceId})),
    note:'Prices are online catalogue prices in CAD cents. They are not confirmed branch prices and exclude delivery, deposits and tax.'};
  },
 },
 {
  name:'propose_match',
  description:'Propose one collected offer as the match for one list item. The household confirms it in the app; this does not confirm it. Refused if the offer breaks a lock, an exclusion or a pack-size rule.',
  schema:z.object({itemId:z.string().min(1).max(64),offerId:z.string().min(1).max(160),confidence:z.enum(['high','medium','low']),rationale:z.string().min(1).max(400)}).strict(),
  json:{type:'object',properties:{
   itemId:{type:'string'},offerId:{type:'string',description:'An offerId returned by search_offers'},
   confidence:{type:'string',enum:['high','medium','low']},
   rationale:{type:'string',description:'Why this catalogue product is the item the household asked for. No prices or claims the tools did not return.'}},
   required:['itemId','offerId','confidence','rationale'],additionalProperties:false},
  async run(args:{itemId:string;offerId:string;confidence:'high'|'medium'|'low';rationale:string},ctx){
   const item=ctx.state.items.find(i=>i.id===args.itemId);
   if(!item)return refuse(`No list item with id ${args.itemId}`);
   const offer=ctx.offers.find(o=>o.id===args.offerId);
   if(!offer)return refuse(`Offer ${args.offerId} is not in the collected results. Only offer ids returned by search_offers can be proposed.`);
   if(!ctx.ledger.has(offer.evidenceId))return refuse('That offer has no evidence row and cannot be used');
   const blocked=constraintBlock(item,offer,ctx.state);
   if(blocked)return refuse(blocked);
   const packs=requiredPacks(item,offer);
   if(packs===null||packs<=0)return refuse('The quantity for this item cannot be worked out from the retailer pack size');
   const rationale=reviewRationale(args.rationale,allowedFigures(ctx.offers,[]));
   ctx.proposals.set(proposalKey(item.id,offer.sourceId),{itemId:item.id,sourceId:offer.sourceId,offerId:offer.id,packs,
    lineTotal:offer.price*packs,confidence:args.confidence,rationale,origin:'agent'});
   ctx.unmatched.delete(item.id);
   ctx.log('propose_match',`${itemLabel(item)} → ${offer.retailer}: ${offer.title}`);
   return {ok:true,proposed:{itemId:item.id,offerId:offer.id,retailer:offer.retailer,packs,lineTotalCents:offer.price*packs},
    note:'Recorded as a proposal. The household must confirm it before it counts towards a basket total.'};
  },
 },
 {
  name:'flag_unavailable',
  description:'Record that no collected record genuinely matches a list item. Use this instead of proposing an approximate substitute.',
  schema:z.object({itemId:z.string().min(1).max(64),reason:z.string().min(1).max(300)}).strict(),
  json:{type:'object',properties:{itemId:{type:'string'},reason:{type:'string'}},required:['itemId','reason'],additionalProperties:false},
  async run(args:{itemId:string;reason:string},ctx){
   const item=ctx.state.items.find(i=>i.id===args.itemId);
   if(!item)return refuse(`No list item with id ${args.itemId}`);
   ctx.unmatched.set(item.id,{kind:'flagged',detail:args.reason.slice(0,300)});
   ctx.log('flag_unavailable',`${itemLabel(item)}: ${args.reason.slice(0,120)}`);
   return {ok:true,flagged:item.id};
  },
 },
 {
  name:'compute_basket',
  description:'Total the proposed and already-confirmed matches per retailer, in integer cents, against the household\'s per-shop budget. This is the only way to obtain a total; never add prices yourself.',
  schema:z.object({}).strict(),
  json:{type:'object',properties:{},additionalProperties:false},
  async run(_args,ctx){
   const baskets=computeBaskets(ctx);
   return {ok:true,perShopBudgetCents:ctx.shopper.perShopBudget,baskets:baskets.map(b=>({
    retailer:b.name,subtotalCents:b.subtotal,itemsPriced:b.priced,itemsOnList:b.total,complete:b.complete,
    awaitingConfirmation:b.unconfirmed,overBudgetCents:b.overBudget})),
    note:'Product subtotals only. Delivery, tax, deposits, minimum orders and membership fees are not included. An incomplete basket cannot be ranked against a complete one.'};
  },
 },
];

export type BasketLine={itemId:string;name:string;quantity:number;offer:SourcedOffer|null;packs:number;lineTotal:number;confirmed:boolean;confidence:Proposal['confidence']|null;rationale:string;reason:string};
export type Basket={sourceId:string;name:string;origin:string;subtotal:number;priced:number;total:number;complete:boolean;unconfirmed:number;overBudget:number;lines:BasketLine[]};

/** Integer-cent arithmetic over confirmed selections and agent proposals. */
export type BasketInput={
 state:UserState;perShopBudget:number;
 sources:{chainId:string|null;origin:string;name:string;status:'ready'|'unavailable'}[];
 offers:SourcedOffer[];proposals:Map<string,Proposal>;unmatched:Map<string,UnmatchedReason>;
};

/**
 * Pure, so the interface can re-total instantly when someone confirms or
 * rejects a match without re-running collection over the network.
 */
export function basketsFrom(input:BasketInput):Basket[]{
 const {state,perShopBudget,offers,proposals,unmatched}=input;
 return input.sources.filter(s=>s.status==='ready').map(source=>{
  const sourceId=source.chainId??source.origin;
  const lines:BasketLine[]=state.items.map(item=>{
   const confirmedOfferId=state.offerSelections?.[item.id]?.[sourceId];
   const proposal=proposals.get(proposalKey(item.id,sourceId));
   const offerId=confirmedOfferId??proposal?.offerId;
   const offer=offerId?offers.find(o=>o.id===offerId)??null:null;
   const packs=offer?(requiredPacks(item,offer)??0):0;
   return {itemId:item.id,name:item.name,quantity:item.qty,offer,packs,
    lineTotal:offer?offer.price*packs:0,confirmed:!!confirmedOfferId,
    confidence:proposal?.confidence??null,rationale:proposal?.rationale??'',
    reason:offer?'':unmatched.get(item.id)?.detail||'No collected record matched this item'};
  });
  const priced=lines.filter(l=>l.offer&&l.packs>0);
  const subtotal=priced.reduce((sum,l)=>sum+l.lineTotal,0);
  return {sourceId,name:source.name,origin:source.origin,subtotal,priced:priced.length,total:lines.length,
   complete:priced.length===lines.length&&lines.length>0,
   unconfirmed:priced.filter(l=>!l.confirmed).length,
   overBudget:Math.max(0,subtotal-perShopBudget),lines};
 }).sort((a,b)=>Number(b.complete)-Number(a.complete)||b.priced-a.priced||a.subtotal-b.subtotal);
}

export function computeBaskets(ctx:ToolContext):Basket[]{
 return basketsFrom({state:ctx.state,perShopBudget:ctx.shopper.perShopBudget,
  sources:ctx.sources.map(s=>({chainId:s.chainId,origin:s.origin,name:s.name,status:s.status})),
  offers:ctx.offers,proposals:ctx.proposals,unmatched:ctx.unmatched});
}

export const toolByName=(name:string)=>TOOLS.find(t=>t.name===name)??null;
export const toolSchemasForModel=()=>TOOLS.map(t=>({name:t.name,description:t.description,input_schema:t.json}));

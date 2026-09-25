// What this household has actually bought, and what they actually paid.
//
// Everything here is derived from saved receipts. That matters for two reasons.
//
// First, coverage: Aisle can read prices from 2 of 19 Ontario chains, but a
// receipt works at all nineteen. For most households their own history is the
// only price signal that will ever exist for the shop they actually use, so it
// is treated as a first-class source rather than a footnote.
//
// Second, honesty: a receipt is a record of something that happened. Nothing in
// this file predicts a price or invents an interval. Where the evidence is thin
// the result says so through `basis`, and the interface is expected to print
// that distinction rather than presenting a guess as a pattern.
import {productById,type Trip,type TripLine,type UserState} from './catalog';
import {cadenceDays} from './agent/memory';

const DAY=86400000;

/** A price this household genuinely paid, per single unit. */
export type PaidPrice={
 productId:string;
 /** Cents for ONE unit — the line total divided by its quantity. */
 unitCents:number;
 quantity:number;
 lineCents:number;
 date:string;
 storeId:string;
 storeName:string;
};

export type PriceHistory={
 productId:string;
 /** Most recent first. */
 paid:PaidPrice[];
 last:PaidPrice;
 /** Median unit price across every recorded purchase. */
 medianUnitCents:number;
 /** Cheapest recorded unit price, and where. */
 cheapest:PaidPrice;
};

const isLine=(l:TripLine):boolean=>!!l.productId&&l.quantity>0;

/**
 * Per-product price history, keyed by product id.
 *
 * Only lines where somebody entered a figure count: a line recorded with
 * `actual:null` says the item was bought, not what it cost, and must never be
 * read as a price of zero.
 */
export function priceHistory(trips:Trip[]):Map<string,PriceHistory>{
 const paidBy=new Map<string,PaidPrice[]>();
 for(const trip of trips){
  for(const line of trip.lines??[]){
   if(!isLine(line)||line.actual===null||!Number.isFinite(line.actual)||line.actual<=0)continue;
   const rows=paidBy.get(line.productId!)??[];
   rows.push({
    productId:line.productId!,
    unitCents:line.actual/line.quantity,
    quantity:line.quantity,
    lineCents:line.actual,
    date:trip.date,
    storeId:trip.storeId,
    storeName:trip.storeName??trip.storeId,
   });
   paidBy.set(line.productId!,rows);
  }
 }
 const out=new Map<string,PriceHistory>();
 for(const [productId,rows] of paidBy){
  const paid=[...rows].sort((a,b)=>b.date.localeCompare(a.date));
  const sorted=[...rows].sort((a,b)=>a.unitCents-b.unitCents);
  out.set(productId,{
   productId,paid,last:paid[0],
   medianUnitCents:sorted[Math.floor((sorted.length-1)/2)].unitCents,
   cheapest:sorted[0],
  });
 }
 return out;
}

export type DueBasis=
 |'observed'   // Three or more purchases, so the gap between them is a real pattern.
 |'cadence';   // Too few to see a pattern; the household's stated shopping rhythm stands in.

export type DueItem={
 productId:string;
 name:string;
 /** Whole days between purchases. Observed median, or the stated cadence. */
 intervalDays:number;
 daysSince:number;
 lastPurchase:string;
 purchases:number;
 basis:DueBasis;
 /** True once enough time has passed that it is worth raising. */
 due:boolean;
 /** Sentence the interface prints verbatim, so the basis is never hidden. */
 why:string;
};

const plural=(n:number,one:string,many=one+'s')=>`${n} ${n===1?one:many}`;

/**
 * Items this household buys regularly and has not bought in a while.
 *
 * Built from trips, not from the behavioural event log: trips are recorded for
 * everybody (the event log only fills when Learning is switched on), they are
 * kept far longer, and they survive the event ring buffer that would otherwise
 * evict exactly the long-interval items — cooking oil, spices — where knowing
 * the interval is worth the most.
 *
 * A single purchase is never an interval. With fewer than three, the household's
 * own stated shopping frequency stands in, and `basis` says so.
 */
export function dueItems(state:UserState,now=Date.now()):DueItem[]{
 const byProduct=new Map<string,number[]>();
 for(const trip of state.trips){
  const stamp=Date.parse(`${trip.date}T12:00:00`);
  if(!Number.isFinite(stamp)||stamp>now)continue;
  const day=Math.floor(stamp/DAY)*DAY;
  for(const line of trip.lines??[]){
   if(!isLine(line))continue;
   const days=byProduct.get(line.productId!)??[];
   if(!days.includes(day))days.push(day);
   byProduct.set(line.productId!,days);
  }
 }

 const cadence=cadenceDays(state.prefs.frequency);
 const rows:DueItem[]=[];
 for(const [productId,rawDays] of byProduct){
  const product=productById[productId];
  if(!product)continue;                                   // Dropped from the catalogue.
  if(state.prefs.excludedProducts.includes(productId))continue;
  const days=[...rawDays].sort((a,b)=>a-b);
  const gaps=days.slice(1).map((day,i)=>(day-days[i])/DAY).sort((a,b)=>a-b);
  const observed=gaps.length>=2;
  const intervalDays=Math.max(1,Math.round(observed?gaps[Math.floor(gaps.length/2)]:cadence));
  const lastStamp=days[days.length-1];
  const daysSince=Math.floor(Math.max(0,(now-lastStamp)/DAY));
  const basis:DueBasis=observed?'observed':'cadence';
  rows.push({
   productId,name:product.name,intervalDays,daysSince,
   lastPurchase:new Date(lastStamp).toISOString(),
   purchases:days.length,basis,
   // 0.85 leaves a little room before the shop rather than after it: being
   // reminded slightly early costs nothing, running out costs a trip.
   due:daysSince>=intervalDays*0.85,
   why:observed
    ? `You buy this about every ${plural(intervalDays,'day')} · ${plural(daysSince,'day')} since the last one`
    : `Bought ${plural(days.length,'time')} · ${plural(daysSince,'day')} ago, and you shop about every ${plural(Math.round(cadence),'day')}`,
  });
 }

 return rows.sort((a,b)=>
  Number(b.due)-Number(a.due)
  ||(a.basis===b.basis?0:a.basis==='observed'?-1:1)
  ||b.daysSince/Math.max(1,b.intervalDays)-a.daysSince/Math.max(1,a.intervalDays));
}

/**
 * Due items worth raising on the home screen.
 *
 * Skips anything already on the list, and anything waved off recently. A snooze
 * lasts one shopping cycle rather than forever: "not this week" is a statement
 * about this week, and a household that says it about milk still buys milk.
 */
export function dueNow(state:UserState,now=Date.now()):DueItem[]{
 const onList=new Set(state.items.map(i=>i.productId).filter(Boolean) as string[]);
 const snoozeFor=cadenceDays(state.prefs.frequency)*DAY;
 return dueItems(state,now).filter(row=>{
  if(!row.due||onList.has(row.productId))return false;
  const snoozed=Date.parse(state.dueSnoozed?.[row.productId]??'');
  if(Number.isFinite(snoozed)&&now-snoozed<snoozeFor)return false;
  return true;
 });
}

export type Accuracy={
 /** Trips where Aisle priced every item on the list, so the two totals compare. */
 comparable:{trip:Trip;predicted:number;actual:number;difference:number}[];
 /** Signed mean difference across those trips, in cents. Positive = paid more. */
 meanDifference:number|null;
};

/**
 * How Aisle's estimate compared with what was paid.
 *
 * Only whole-list estimates are counted. `predicted` is the subtotal of the
 * items Aisle could price, so on a list where it priced 4 of 12 it is not a
 * forecast of the shop, and setting it beside the receipt total would invent an
 * error that says nothing about the estimate's quality.
 */
export function accuracy(trips:Trip[]):Accuracy{
 const comparable=trips.filter(trip=>
  trip.predictedTotal!==undefined&&trip.predictedPriced!==undefined
  &&trip.predictedTotal>0&&trip.predictedPriced===trip.predictedTotal
  &&trip.predicted>0&&trip.total>0)
  .map(trip=>({trip,predicted:trip.predicted,actual:trip.total,difference:trip.total-trip.predicted}));
 return {
  comparable,
  meanDifference:comparable.length
   ?Math.round(comparable.reduce((sum,row)=>sum+row.difference,0)/comparable.length)
   :null,
 };
}

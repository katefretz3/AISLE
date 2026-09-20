// The shopper model.
//
// Everything here is derived from things the household actually did: options
// they set during onboarding, retailer products they confirmed, and trips they
// recorded. Nothing is bought, inferred from a third party, or guessed.
//
// Two hard rules:
//   1. Allergies and dietary restrictions are explicit-only. They are never
//      learned from behaviour and never relaxed by a confident-looking signal.
//   2. When behavioural learning is off, every derived field below is empty.
//      The Forget control clears the events, which empties them permanently.
import {productById,type UserState,type Preferences} from '../catalog';

const DAY=86400000;
const HALF_LIFE_DAYS=60;
const decay=(ageMs:number)=>Math.exp(-Math.max(0,ageMs/DAY)/HALF_LIFE_DAYS);

export type Affinity={key:string;label:string;probability:number;samples:number;weight:number};
export type Replenishment={productId:string;name:string;intervalDays:number;lastPurchase:string;daysSince:number;due:boolean;samples:number;basis:'observed-interval'|'chosen-cadence'};
export type ShopperModel={
 learningEnabled:boolean;
 cadenceDays:number;
 perShopBudget:number;                    // integer cents
 explicit:{
  household:number;city:string;radiusKm:number;transport:Preferences['transport'];priority:Preferences['priority'];
  preferredStores:string[];preferredBrands:string[];favouriteProducts:string[];excludedProducts:string[];
  dietary:string[];allergens:string[];categoryLocks:string[];substitutions:boolean;
 };
 brands:Affinity[];
 retailers:Affinity[];
 replenishment:Replenishment[];
 confidence:{events:number;trips:number;confirmedMatches:number;level:'none'|'low'|'medium'|'high'};
 notes:string[];
};

export const cadenceDays=(f:Preferences['frequency'])=>f==='fortnightly'?14:f==='twice-weekly'?3.5:7;
export const perShopBudget=(prefs:Preferences)=>Math.round(prefs.budget*100*cadenceDays(prefs.frequency)/7);

/** Recency-weighted Beta-Bernoulli acceptance rate. Uniform prior, so one
 *  observation moves the estimate a little and never to certainty. */
function betaAffinity(accepted:number,rejected:number){
 return (accepted+1)/(accepted+rejected+2);
}

export function buildShopperModel(state:UserState,now=Date.now()):ShopperModel{
 const prefs=state.prefs;
 const learningEnabled=prefs.learning;
 const events=learningEnabled?state.events.filter(e=>Number.isFinite(Date.parse(e.date))&&Date.parse(e.date)<=now):[];
 const notes:string[]=[];

 // Brand acceptance, per brand, from confirmed and rejected retailer matches.
 const brandTally=new Map<string,{a:number;b:number;n:number;label:string}>();
 for(const event of events){
  if(!event.brand||!['offer_accepted','offer_rejected'].includes(event.action))continue;
  const key=`${event.category}::${event.brand}`;
  const row=brandTally.get(key)??{a:0,b:0,n:0,label:`${event.brand} in ${event.category}`};
  const weight=decay(now-Date.parse(event.date));
  if(event.action==='offer_accepted')row.a+=weight;else row.b+=weight;
  row.n+=1;brandTally.set(key,row);
 }
 const brands=[...brandTally].map(([key,r])=>({key,label:r.label,probability:betaAffinity(r.a,r.b),samples:r.n,weight:r.a+r.b}))
  .sort((x,y)=>y.weight-x.weight||x.key.localeCompare(y.key)).slice(0,40);

 // Retailer acceptance, from confirmed matches and recorded trips.
 const retailerTally=new Map<string,{a:number;b:number;n:number}>();
 for(const event of events){
  if(!event.storeId||!['offer_accepted','offer_rejected'].includes(event.action))continue;
  const row=retailerTally.get(event.storeId)??{a:0,b:0,n:0};
  const weight=decay(now-Date.parse(event.date));
  if(event.action==='offer_accepted')row.a+=weight;else row.b+=weight;
  row.n+=1;retailerTally.set(event.storeId,row);
 }
 for(const trip of learningEnabled?state.trips:[]){
  if(!Number.isFinite(Date.parse(trip.date)))continue;
  const row=retailerTally.get(trip.storeId)??{a:0,b:0,n:0};
  row.a+=decay(now-Date.parse(trip.date));row.n+=1;retailerTally.set(trip.storeId,row);
 }
 const retailers=[...retailerTally].map(([key,r])=>({key,label:key,probability:betaAffinity(r.a,r.b),samples:r.n,weight:r.a+r.b}))
  .sort((x,y)=>y.weight-x.weight||x.key.localeCompare(y.key));

 // Replenishment timing. Median gap between recorded purchase days; the chosen
 // shopping cadence stands in until there are at least three recorded days.
 const period=cadenceDays(prefs.frequency);
 const purchaseDays=new Map<string,number[]>();
 for(const event of events){
  if(event.action!=='purchased'||!event.productId)continue;
  const day=Math.floor(Date.parse(event.date)/DAY)*DAY;
  const list=purchaseDays.get(event.productId)??[];
  if(!list.includes(day))list.push(day);
  purchaseDays.set(event.productId,list);
 }
 const replenishment:Replenishment[]=[];
 for(const [productId,rawDays] of purchaseDays){
  const product=productById[productId];
  if(!product)continue;
  const days=[...rawDays].sort((a,b)=>a-b);
  const gaps=days.slice(1).map((day,i)=>(day-days[i])/DAY).sort((a,b)=>a-b);
  const observed=gaps.length>=2;
  const intervalDays=observed?gaps[Math.floor(gaps.length/2)]:period;
  const last=days[days.length-1];
  const daysSince=Math.max(0,(now-last)/DAY);
  replenishment.push({productId,name:product.name,intervalDays:Math.round(intervalDays*10)/10,lastPurchase:new Date(last).toISOString(),
   daysSince:Math.floor(daysSince),due:daysSince>=intervalDays*0.85,samples:days.length,basis:observed?'observed-interval':'chosen-cadence'});
 }
 replenishment.sort((a,b)=>Number(b.due)-Number(a.due)||b.daysSince/Math.max(1,b.intervalDays)-a.daysSince/Math.max(1,a.intervalDays));

 const confirmedMatches=Object.values(state.offerSelections??{}).reduce((n,row)=>n+Object.keys(row).length,0);
 const signals=events.length+state.trips.length+confirmedMatches;
 const level=!learningEnabled?'none':signals>=40?'high':signals>=12?'medium':signals>0?'low':'none';

 if(!learningEnabled)notes.push('Behavioural learning is off. Only options you set yourself are in use.');
 else if(level==='low')notes.push('Few recorded choices so far, so suggestions lean on the staples you picked during setup.');
 if(prefs.allergens.length)notes.push('Ingredient records from these catalogues are not verified, so automatic food suggestions are paused. Allergies are never inferred from behaviour.');
 else if(prefs.dietary.length)notes.push('With dietary preferences set, new suggestions are limited to plain produce until verified ingredient data is connected.');
 if(!replenishment.length&&learningEnabled)notes.push('No repeat purchases recorded yet, so timing uses your chosen shopping cadence.');

 return {
  learningEnabled,cadenceDays:period,perShopBudget:perShopBudget(prefs),
  explicit:{household:prefs.household,city:prefs.city,radiusKm:prefs.radius,transport:prefs.transport,priority:prefs.priority,
   preferredStores:prefs.preferredStores,preferredBrands:prefs.preferredBrands,favouriteProducts:prefs.favouriteProducts,
   excludedProducts:prefs.excludedProducts,dietary:prefs.dietary,allergens:prefs.allergens,categoryLocks:prefs.categoryLocks,substitutions:prefs.substitutions},
  brands,retailers,replenishment:replenishment.slice(0,30),
  confidence:{events:events.length,trips:state.trips.length,confirmedMatches,level},
  notes,
 };
}

/** Brand nudge applied during ranking. Bounded to ±0.5 so a learned preference
 *  can reorder near-ties but can never outrank a hard constraint or a price. */
export function brandNudge(model:ShopperModel,category:string,brand:string){
 if(!model.learningEnabled||!brand)return 0;
 const row=model.brands.find(b=>b.key===`${category}::${brand}`);
 return row?row.probability-0.5:0;
}

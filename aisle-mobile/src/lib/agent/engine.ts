import {allowedSuggestion,productById,products,stores,type ListItem,type UserState} from '../catalog';
import {parsePack} from './collector';
import {cityLocation} from '../locations';
import type {MarketSnapshot,Offer} from './types';
const DAY=86400000;
export const words=(s:string)=>s.toLowerCase().normalize('NFKD').replace(/[’']/g,'').replace(/[^a-z0-9% ]/g,' ').split(/\s+/).filter(Boolean).map(w=>w.length>4?w.replace(/s$/,''):w);
const genericBrand=(s:string)=>/^(fresh|store brand)/i.test(s);
const hasBrand=(o:Offer,b:string)=>words(b).every(w=>words(`${o.brand} ${o.title}`).includes(w));
export function requiredPacks(item:ListItem,offer:Offer):number|null{
 const product=item.productId?productById[item.productId]:undefined;
 if(!product)return item.qty; // Custom items explicitly count the selected retailer pack.
 const wanted=parsePack(product.size);
 if(!wanted||!offer.pack||wanted.unit!==offer.pack.unit||offer.pack.amount<=0)return null;
 return Math.ceil((wanted.amount*item.qty-.0001)/offer.pack.amount);
}
export function matchOffer(item:ListItem,offer:Offer,state:UserState,now=Date.now()){
 const p=item.productId?productById[item.productId]:undefined;
 const terms=words(p?.name??item.name).filter(w=>!['fresh','large','original','crown','boneles'].includes(w));
 const actual=words(offer.title);const hit=terms.filter(w=>actual.includes(w)).length/Math.max(1,terms.length);
 if(hit<.6)return null;
 if(p?.category==='Produce'&&/\b(juice|lemonade|oil|mayonnaise|crisp|crisps|spread|jam|yogurt|pierogies|sprout|sprouts|powder|seed|seeds|herbs|plant|plants|superbelly)\b/i.test(offer.title))return null;
 if(p&&state.prefs.excludedProducts.includes(p.id))return null;
 const brandMatches=!!p&&(genericBrand(p.brand)||hasBrand(offer,p.brand));
 if(p&&(item.locked||state.prefs.preferredBrands.includes(p.brand)||state.prefs.categoryLocks.includes(p.category)||!state.prefs.substitutions)&&!brandMatches)return null;
 const wanted=parsePack(p?.size??item.name);
 const sameSize=!!wanted&&!!offer.pack&&wanted.unit===offer.pack.unit&&Math.abs(wanted.amount-offer.pack.amount)<.01;
 if(item.locked&&(!brandMatches||!sameSize||hit<1))return null;
 // Names can be ambiguous (apple juice vs apples). Even high scores require an
 // explicit pack confirmation. Never turn semantic similarity into an exact SKU.
 const reason=[brandMatches?'Brand fits your list':'Different brand',sameSize?'Same listed pack size':'Review pack size'];
 let affinity=0;
 if(state.prefs.learning){const relevant=state.events.filter(e=>e.category===p?.category&&e.brand===offer.brand&&['offer_accepted','offer_rejected'].includes(e.action)&&Number.isFinite(Date.parse(e.date))&&Date.parse(e.date)<=now);let a=1,b=1;for(const e of relevant){const d=Math.exp(-Math.max(0,(now-Date.parse(e.date))/DAY)/60);if(e.action==='offer_accepted')a+=d;else b+=d;}affinity=a/(a+b)-.5;}
 return {offer,packs:requiredPacks(item,offer),score:hit*5+Number(brandMatches)+Number(sameSize)+affinity,reason:reason.join(' · '),sameSize,brandMatches};
}
export function buildPlan(state:UserState,market:MarketSnapshot,now=Date.now()){
 const fresh=market.sources.flatMap(s=>s.status==='ready'?s.offers:[]).filter(o=>o.available&&o.currency==='CAD'&&Number.isFinite(o.price)&&o.price>0&&Date.parse(o.expiresAt)>now&&Date.parse(o.observedAt)<=now+60000);
 const restrictions=state.prefs.allergens.length>0||state.prefs.dietary.length>0;
 const lines=state.items.map(item=>{
  const candidates=fresh.map(o=>matchOffer(item,o,state,now)).filter((x):x is NonNullable<typeof x>=>x!==null).sort((a,b)=>b.score-a.score||a.offer.price-b.offer.price);
  const choices=state.offerSelections?.[item.id]??{};
  const selected=candidates.filter(c=>c.packs!==null&&choices[c.offer.sourceId]===c.offer.id);
  const shortlist=[...new Map([...selected,...candidates.slice(0,12)].map(c=>[c.offer.id,c])).values()];
  return {item,candidates:shortlist,selected};
 });
 const periodDays=state.prefs.frequency==='fortnightly'?14:state.prefs.frequency==='twice-weekly'?3.5:7;
 const budget=Math.round(state.prefs.budget*100*periodDays/7);
 const baskets=market.sources.map(source=>{
  const priced=lines.map(line=>{const selected=line.selected.find(c=>c.offer.sourceId===source.id);return {item:line.item,offer:selected?.offer,packs:selected?.packs??0};});
  const subtotal=priced.reduce((n,line)=>n+(line.offer?.price??0)*line.packs,0);const missing=priced.filter(l=>!l.offer).length;
  return {sourceId:source.id,name:source.name,subtotal,missing,complete:missing===0&&lines.length>0,lines:priced,overBudget:Math.max(0,subtotal-budget)};
 }).sort((a,b)=>Number(b.complete)-Number(a.complete)||a.subtotal-b.subtotal);
 // Price variation only compares identical confirmed title/brand/pack, never
 // two loosely matched candidates or an incomplete basket against a full one.
 const variations=lines.flatMap(line=>{
  const selected=line.selected.map(c=>c.offer);if(selected.length<2)return [];
  const a=selected[0];const same=selected.filter(b=>words(a.title).join(' ')===words(b.title).join(' ')&&words(a.brand).join(' ')===words(b.brand).join(' ')&&a.pack&&b.pack&&a.pack.unit===b.pack.unit&&a.pack.amount===b.pack.amount);
  if(same.length<2)return [];const sorted=[...same].sort((a,b)=>a.price-b.price);
  return [{name:line.item.name,low:sorted[0],high:sorted[sorted.length-1],difference:(sorted[sorted.length-1].price-sorted[0].price)*(requiredPacks(line.item,sorted[0])??0)}];
 });
 const suggestions=products.filter(p=>!p.id.endsWith('-store')&&!state.items.some(i=>i.productId===p.id)&&allowedSuggestion(p,state.prefs)).flatMap(p=>{
  const favourite=state.prefs.favouriteProducts.includes(p.id);let score=favourite?3:0;const reasons:string[]=favourite?['An everyday staple you selected']:[];
  const purchases=state.prefs.learning?state.events.filter(e=>e.productId===p.id&&e.action==='purchased'&&Number.isFinite(Date.parse(e.date))&&Date.parse(e.date)<=now).map(e=>Date.parse(e.date)).sort((a,b)=>a-b):[];
  const dates=[...new Set(purchases.map(t=>Math.floor(t/DAY)*DAY))];
  if(dates.length){const gaps=dates.slice(1).map((t,i)=>(t-dates[i])/DAY).sort((a,b)=>a-b);const interval=gaps.length?gaps[Math.floor(gaps.length/2)]:periodDays;const elapsed=(now-dates[dates.length-1])/DAY;const due=elapsed>=interval*.85;score+=due?4:1;reasons.push(due?`May be due again · ${Math.floor(elapsed)} days since a recorded purchase`:'You bought this on a recorded trip');}
  if(!score)return [];
  const matches=fresh.map(o=>matchOffer({id:p.id,name:p.name,productId:p.id,qty:1,locked:false,checked:false},o,state,now)).filter((m):m is NonNullable<typeof m>=>!!m);
  const lowest=matches.length?Math.min(...matches.map(m=>m.offer.price)):null;
  if(lowest!==null&&lowest>budget){score-=3;reasons.push('Above your per-shop budget at the observed pack price');}
  return [{product:p,score,reasons,observedFrom:lowest}];
 }).sort((a,b)=>b.score-a.score||a.product.id.localeCompare(b.product.id)).slice(0,6);
 const centre=state.prefs.searchLocation??cityLocation(state.prefs.city);
 return {version:'aisle-agent-1',generatedAt:new Date(now).toISOString(),lines,baskets,variations,suggestions,budget,periodDays,restrictions,
  profile:[`${state.prefs.household} ${state.prefs.household===1?'person':'people'} · ${periodDays}-day shop`,`Budget per shop: ${budget/100} CAD (${Math.round(budget/state.prefs.household)/100} per person)`,`${state.prefs.radius} km from ${centre.lat.toFixed(3)}, ${centre.lng.toFixed(3)} · ${state.prefs.transport}`,`${state.prefs.preferredStores.length} preferred chains · ${state.prefs.preferredBrands.length} protected brands`,state.prefs.learning?'Learning from your confirmed choices':'Behavioural learning is off; explicit preferences still apply'],
  uncoveredStores:stores.filter(s=>state.prefs.preferredStores.includes(s.id)&&!market.sources.some(source=>source.id===s.id)),
  localRecommendation:null,
  trace:[{step:'Collect',detail:`${market.sources.filter(s=>s.status==='ready').length} sources available; ${fresh.length} fresh, available online offers`},{step:'Constrain',detail:restrictions?'Ingredient restrictions present. No food is labelled allergy-safe; new food suggestions are limited.':'Excluded products, brand locks and substitution settings applied'},{step:'Match',detail:`${lines.filter(l=>l.selected.length).length} of ${lines.length} list items have a confirmed retailer product`},{step:'Learn',detail:state.prefs.learning?`${state.events.length} recorded events considered with recency weighting`:'Only explicit favourites and selections used'},{step:'Compare',detail:`${baskets.filter(b=>b.complete).length} complete online baskets; incomplete baskets cannot win`},{step:'Check location',detail:'No branch-specific price feed connected. No in-store destination or travel savings inferred from online prices.'}]};
}
export type AgentPlan=ReturnType<typeof buildPlan>;

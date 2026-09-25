// Unit pricing — the comparison a shopper actually makes.
//
// A 675 g loaf at $3.79 and a 570 g loaf at $3.39 cannot be compared by their
// ticket prices, and doing that arithmetic in a shop is exactly the work this
// app exists to remove.
//
// One rule matters more than the formatting: every offer in the same comparison
// is shown on the SAME basis. Rendering one as $/kg and its rival as $/100 g
// would be worse than showing nothing, because the two numbers look comparable
// and are not. So a basis is chosen once for the whole set, from the largest
// pack in it, and applied to all of them.
import type {Pack} from './agent/types';

export type UnitBasis={unit:'g'|'ml'|'each';per:number;label:string};

const BASES:Record<'g'|'ml'|'each',UnitBasis[]>={
 g:[{unit:'g',per:100,label:'100 g'},{unit:'g',per:1000,label:'kg'}],
 ml:[{unit:'ml',per:100,label:'100 mL'},{unit:'ml',per:1000,label:'L'}],
 each:[{unit:'each',per:1,label:'item'}],
};

/**
 * The basis to show a set of packs on. Larger packs read better per kilo or
 * litre; small ones per 100. Mixed units cannot share a basis, so the most
 * common unit in the set wins and anything else is left without a unit price
 * rather than silently converted.
 *
 * On an equal count, weight and volume beat `each`: "$0.60 / 100 g" tells a
 * shopper something about the food, where a per-item figure often just repeats
 * the ticket price. Ordering the tiebreak alphabetically would decide it by
 * spelling, which is no reason at all.
 */
export function chooseBasis(packs:(Pack|null|undefined)[]):UnitBasis|null{
 const usable=packs.filter((p):p is Pack=>!!p&&p.amount>0);
 if(!usable.length)return null;
 const counts=new Map<'g'|'ml'|'each',number>();
 for(const pack of usable)counts.set(pack.unit,(counts.get(pack.unit)??0)+1);
 const rank=(unit:'g'|'ml'|'each')=>unit==='each'?1:0;
 const unit=[...counts.entries()].sort((a,b)=>b[1]-a[1]||rank(a[0])-rank(b[0]))[0][0];
 const options=BASES[unit];
 if(unit==='each')return options[0];
 // Use the big basis once the typical pack is large enough that per-100 would
 // read as an awkward fraction.
 const largest=Math.max(...usable.filter(p=>p.unit===unit).map(p=>p.amount));
 return largest>=1000?options[1]:options[0];
}

/** Price for one basis-worth of this pack, in cents. Null when not comparable. */
export function unitPriceCents(priceCents:number,pack:Pack|null|undefined,basis:UnitBasis|null):number|null{
 if(!basis||!pack||pack.unit!==basis.unit||!(pack.amount>0))return null;
 if(!Number.isFinite(priceCents)||priceCents<=0)return null;
 // A single item priced "per item" is the ticket price with a suffix on it.
 // That is not a second fact, so do not dress it up as one. A dozen eggs at
 // $0.42 each is a real figure; one jar at $4.99 each is not.
 if(basis.unit==='each'&&pack.amount===1)return null;
 return priceCents/pack.amount*basis.per;
}

/** "$1.24 / 100 g". Sub-cent values keep a decimal so they do not read as free. */
export function formatUnitPrice(cents:number|null,basis:UnitBasis|null):string|null{
 if(cents==null||!basis)return null;
 const dollars=cents/100;
 const shown=dollars>=1?dollars.toFixed(2)
  :dollars>=0.1?dollars.toFixed(2)
  :dollars.toFixed(3).replace(/0$/,'');
 return `$${shown} / ${basis.label}`;
}

export type UnitPriced<T>={row:T;unitCents:number|null;text:string|null;best:boolean};

/**
 * Put a set of offers on one basis and mark the best value.
 *
 * "Best" is only meaningful when at least two rows are actually comparable, so
 * a lone offer is never decorated as a winner — there is nothing it beat.
 */
export function withUnitPrices<T>(rows:T[],read:(row:T)=>{price:number;pack:Pack|null}):{
 basis:UnitBasis|null;priced:UnitPriced<T>[];
}{
 const basis=chooseBasis(rows.map(row=>read(row).pack));
 const priced=rows.map(row=>{
  const {price,pack}=read(row);
  const unitCents=unitPriceCents(price,pack,basis);
  return {row,unitCents,text:formatUnitPrice(unitCents,basis),best:false};
 });
 const comparable=priced.filter(p=>p.unitCents!=null);
 if(comparable.length>1){
  const cheapest=Math.min(...comparable.map(p=>p.unitCents!));
  // A tie means nothing to choose between them, so mark neither.
  if(comparable.filter(p=>p.unitCents===cheapest).length===1)
   for(const entry of priced)if(entry.unitCents===cheapest)entry.best=true;
 }
 return {basis,priced};
}

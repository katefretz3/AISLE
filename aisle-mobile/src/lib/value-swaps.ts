// Better-value suggestions, built only from offers Aisle actually collected.
//
// This replaces the old `swapCandidates`, which compared two hash-generated
// numbers and announced the difference as a saving. Nothing here is generated:
// every suggestion names two real catalogue records from the same retailer,
// each with its own evidence row, and the saving is the difference between two
// prices that were read off the wire.
//
// The trap this module exists to avoid is the one that makes most "you could
// save $2" features dishonest: a smaller pack is nearly always cheaper, and
// swapping down to it is not a saving, it is buying less food. So a suggestion
// is only made when the alternative delivers AT LEAST AS MUCH as the current
// pick and still costs less for the quantity the household actually wants.
import {productById,type ListItem,type UserState} from './catalog';
import {matchOffer,requiredPacks} from './agent/engine';
import type {SourcedOffer} from './agent/provenance';
import {chooseBasis,unitPriceCents,formatUnitPrice} from './unit-price';

export type ValueSwap={
 item:ListItem;
 /** What the basket currently uses. */
 from:{offer:SourcedOffer;packs:number;lineTotal:number;amount:number};
 /** The cheaper, no-smaller alternative at the same retailer. */
 to:{offer:SourcedOffer;packs:number;lineTotal:number;amount:number};
 retailer:string;
 /** Cents saved on this line, for this household's quantity. */
 saving:number;
 /** "$0.50 / 100 g instead of $0.62 / 100 g", or null if packs differ in unit. */
 unitNote:string|null;
 /** Plain reason this is not a downgrade. */
 sizeNote:string;
};

/** Total amount a choice delivers, in the offer's own unit. */
function delivered(offer:SourcedOffer,packs:number):number|null{
 if(!offer.pack||!(offer.pack.amount>0)||!(packs>0))return null;
 return offer.pack.amount*packs;
}

/**
 * Cheaper alternatives for the lines of one basket.
 *
 * `current` maps an item id to the offer the basket is using, so the comparison
 * is against what the household would actually pay today — not against some
 * notional list price.
 */
export function valueSwaps(
 state:UserState,
 offers:SourcedOffer[],
 current:Map<string,{offer:SourcedOffer;packs:number;lineTotal:number}>,
 now=Date.now(),
):ValueSwap[]{
 // A household that has turned substitutions off, or that is managing a diet or
 // an allergy, is not asking to be offered alternatives.
 if(!state.prefs.substitutions||state.prefs.dietary.length||state.prefs.allergens.length)return [];
 const swaps:ValueSwap[]=[];
 for(const item of state.items){
  const now_=current.get(item.id);
  if(!now_||item.locked)continue;
  const product=item.productId?productById[item.productId]:null;
  if(product&&(state.prefs.categoryLocks.includes(product.category)
   ||state.prefs.preferredBrands.includes(product.brand)))continue;
  const fromAmount=delivered(now_.offer,now_.packs);
  if(fromAmount===null)continue;

  let best:ValueSwap|null=null;
  for(const offer of offers){
   if(offer.id===now_.offer.id)continue;
   // Same retailer only: a cheaper product at a shop you are not visiting is
   // not a swap, it is a different trip.
   if(offer.sourceId!==now_.offer.sourceId)continue;
   // Honours locks, exclusions, brand rules and the name match.
   if(!matchOffer(item,offer,state,now))continue;
   const packs=requiredPacks(item,offer);
   if(packs===null||packs<=0)continue;
   const toAmount=delivered(offer,packs);
   if(toAmount===null)continue;
   // Different units cannot be compared, and less food is not a saving.
   if(offer.pack?.unit!==now_.offer.pack?.unit)continue;
   if(toAmount<fromAmount)continue;
   const lineTotal=offer.price*packs;
   const saving=now_.lineTotal-lineTotal;
   if(saving<Math.max(1,state.prefs.minimumSwapSaving))continue;
   if(best&&saving<=best.saving)continue;

   const basis=chooseBasis([now_.offer.pack,offer.pack]);
   const fromUnit=formatUnitPrice(unitPriceCents(now_.offer.price,now_.offer.pack,basis),basis);
   const toUnit=formatUnitPrice(unitPriceCents(offer.price,offer.pack,basis),basis);
   best={
    item,retailer:offer.retailer,saving,
    from:{offer:now_.offer,packs:now_.packs,lineTotal:now_.lineTotal,amount:fromAmount},
    to:{offer,packs,lineTotal,amount:toAmount},
    unitNote:fromUnit&&toUnit?`${toUnit} instead of ${fromUnit}`:null,
    sizeNote:toAmount>fromAmount
     ?`Gives you more (${toAmount}${unitWord(offer)} against ${fromAmount}${unitWord(now_.offer)})`
     :'Same amount',
   };
  }
  if(best)swaps.push(best);
 }
 return swaps.sort((a,b)=>b.saving-a.saving);
}

function unitWord(offer:SourcedOffer):string{
 const unit=offer.pack?.unit;
 return unit==='each'?'':` ${unit==='ml'?'mL':unit}`;
}

/** Total saving if every suggestion is taken. */
export const totalSaving=(swaps:ValueSwap[])=>swaps.reduce((sum,s)=>sum+s.saving,0);

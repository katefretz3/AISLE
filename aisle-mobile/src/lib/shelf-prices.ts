// Prices read off a shelf by the person standing in front of it.
//
// The agent can only price 2 of 19 Ontario chains, because the other seventeen
// publish nothing machine-readable. No amount of engineering changes that. What
// does change it is the household: they are already in the shop, looking at the
// label. Typing what it says turns the coverage gap into something they own.
//
// The discipline that makes this safe is provenance, not accuracy. A shelf price
// may well be more relevant than an online catalogue price — it is the actual
// branch, today — but it cannot be verified by anyone else, so it is never
// mixed into a figure that claims to be evidence-backed. It is carried in its
// own channel, labelled wherever it is shown, and counted separately.
import {parsePack} from './agent/collector';
import {productById,type ListItem,type ShelfPrice,type UserState,pruneShelfPrices} from './catalog';

const DAY=86400000;

/** Beyond this a price is shown with a warning: shelves move. */
export const STALE_AFTER_DAYS=30;

const newId=()=>Array.from(crypto.getRandomValues(new Uint8Array(8)),b=>b.toString(16).padStart(2,'0')).join('');

export type ShelfPriceInput={
 item:ListItem;
 storeId:string;
 storeName:string;
 priceCents:number;
 /** What the label was for, e.g. "675 g". Blank records an unknown pack. */
 packLabel:string;
 note?:string;
 photoId?:string;
};

/**
 * Record one observation.
 *
 * The pack is parsed from what the household typed rather than assumed from the
 * list item: seeing a 450 g loaf when your list says 675 g is exactly the case
 * this exists for, and silently filing it under 675 g would produce a unit price
 * that is wrong by a third.
 */
export function recordShelfPrice(state:UserState,input:ShelfPriceInput,now=Date.now()):UserState{
 const packLabel=input.packLabel.trim();
 const row:ShelfPrice={
  id:newId(),
  productId:input.item.productId,
  itemName:input.item.name,
  storeId:input.storeId,
  storeName:input.storeName,
  priceCents:Math.round(input.priceCents),
  pack:parsePack(packLabel),
  packLabel:packLabel||'not stated',
  observedAt:new Date(now).toISOString(),
  ...(input.note?.trim()?{note:input.note.trim().slice(0,140)}:{}),
  ...(input.photoId?{photoId:input.photoId}:{}),
 };
 return {...state,shelfPrices:pruneShelfPrices([row,...(state.shelfPrices??[])],now)};
}

export function removeShelfPrice(state:UserState,id:string):UserState{
 return {...state,shelfPrices:(state.shelfPrices??[]).filter(row=>row.id!==id)};
}

/** The default pack to offer when capturing: what the list asked for. */
export function expectedPackLabel(item:ListItem):string{
 const product=item.productId?productById[item.productId]:null;
 return product?.size??'';
}

export const shelfPriceAgeDays=(row:ShelfPrice,now=Date.now())=>
 Math.max(0,Math.floor((now-Date.parse(row.observedAt))/DAY));

export const isStale=(row:ShelfPrice,now=Date.now())=>shelfPriceAgeDays(row,now)>=STALE_AFTER_DAYS;

/**
 * The most recent observation for an item.
 *
 * Prices are compared within a shop, not across shops, so a price seen at the
 * store being shopped always wins over a more recent one from somewhere else.
 * Passing no store returns the latest from anywhere.
 */
export function latestShelfPrice(
 state:UserState,productId:string|null,storeId?:string,
):ShelfPrice|null{
 if(!productId)return null;
 const rows=(state.shelfPrices??[]).filter(row=>row.productId===productId);
 if(!rows.length)return null;
 const here=storeId?rows.filter(row=>row.storeId===storeId):[];
 const pool=here.length?here:rows;
 return pool.reduce((best,row)=>row.observedAt>best.observedAt?row:best);
}

/**
 * What a captured price means for a whole line.
 *
 * The label is for one pack, so the household's quantity has to be applied. When
 * the pack the price was for matches what the list asks for, one pack covers one
 * unit and the arithmetic is simple. When it does not — a 450 g loaf against a
 * 675 g line — the number of packs is worked out the same way the agent does it,
 * and when that cannot be worked out the line total is left null rather than
 * guessed.
 */
export function shelfLineTotal(row:ShelfPrice,item:ListItem):number|null{
 if(!(row.priceCents>0)||!(item.qty>0))return null;
 const product=item.productId?productById[item.productId]:null;
 const wanted=product?parsePack(product.size):null;
 // No pack on either side: treat the label as the price for one of whatever the
 // household is counting, which is what "each" means on a shelf.
 if(!row.pack||!wanted)return row.priceCents*item.qty;
 if(row.pack.unit!==wanted.unit||!(row.pack.amount>0))return null;
 const packs=Math.ceil((wanted.amount*item.qty-0.0001)/row.pack.amount);
 return packs>0?row.priceCents*packs:null;
}

export type PriceSource='collected'|'observed';

export type LinePrice={cents:number;source:PriceSource;shelf?:ShelfPrice}|null;

/**
 * One price per line, saying where it came from.
 *
 * A collected price wins: it is the one somebody other than this household can
 * check. A shelf price fills the gap where there is none, which for most
 * households is most of the list.
 */
export function resolveLinePrice(
 item:ListItem,collected:number|null,state:UserState,storeId?:string,
):LinePrice{
 if(collected!=null&&Number.isFinite(collected))return {cents:collected,source:'collected'};
 const shelf=latestShelfPrice(state,item.productId,storeId);
 if(!shelf)return null;
 const total=shelfLineTotal(shelf,item);
 return total==null?null:{cents:total,source:'observed',shelf};
}

export type ShelfTally={
 /** Lines whose price Aisle collected and can evidence. */
 collected:number;
 /** Lines priced only by what the household saw. */
 observed:number;
 /** Lines with no price from either. */
 unpriced:number;
};

/** How a total is made up, so a mixed figure is never shown as one kind. */
export function tallyProvenance(items:ListItem[],resolve:(item:ListItem)=>LinePrice):ShelfTally{
 let collected=0,observed=0,unpriced=0;
 for(const item of items){
  const price=resolve(item);
  if(!price)unpriced+=1;
  else if(price.source==='collected')collected+=1;
  else observed+=1;
 }
 return {collected,observed,unpriced};
}

/** Every photo id still referenced by a stored price, for the orphan sweep. */
export const referencedPhotoIds=(state:UserState):string[]=>
 (state.shelfPrices??[]).map(row=>row.photoId).filter((id):id is string=>!!id);

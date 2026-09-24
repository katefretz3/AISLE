// The order you walk a shop in.
//
// This is deliberately not the browse order used by the catalogue. Browsing is
// a lookup problem — you want Produce next to Dairy because that is how people
// name things. Walking is a route problem, and a supermarket is laid out with
// fresh departments around the perimeter and packaged goods in the middle.
//
// Frozen comes last on purpose: picking it up first means carrying thawing food
// around the shop. That single rule is the one most shoppers already follow.
import {DEPARTMENTS,itemById} from './taxonomy';
import type {ListItem} from './catalog';

/** Department ids in the order a shopper physically passes them. */
export const WALK_ORDER:string[]=[
 'produce',    // perimeter: fresh first, while the trolley is empty
 'bakery',
 'deli',
 'meat',
 'dairy',
 'pantry',     // centre aisles
 'breakfast',
 'snacks',
 'beverages',
 'household',  // non-grocery, usually furthest from the doors
 'personal',
 'baby',
 'pet',
 'frozen',     // last, so it stays frozen
];

const RANK=new Map(WALK_ORDER.map((id,index)=>[id,index]));
const UNPLACED=WALK_ORDER.length;

export type ChecklistGroup={
 id:string;
 name:string;
 items:ListItem[];
 checked:number;
};

/** Where a department falls on the walk. Unknown departments sort to the end. */
export const walkRank=(departmentId:string|null|undefined)=>
 departmentId?RANK.get(departmentId)??UNPLACED:UNPLACED;

const departmentOf=(item:ListItem)=>item.productId?itemById[item.productId]?.departmentId??null:null;

/**
 * Group a list for in-store use. Items the shopper typed themselves have no
 * department, so they collect in one group at the end rather than being
 * scattered or silently dropped.
 */
export function groupForWalk(items:ListItem[]):ChecklistGroup[]{
 const names=new Map(DEPARTMENTS.map(d=>[d.id,d.name]));
 const buckets=new Map<string,ListItem[]>();
 for(const item of items){
  const key=departmentOf(item)??'other';
  const bucket=buckets.get(key);
  if(bucket)bucket.push(item);else buckets.set(key,[item]);
 }
 return [...buckets.entries()]
  .map(([id,groupItems])=>({
   id,
   name:id==='other'?'Anything else':names.get(id)??'Anything else',
   items:groupItems,
   checked:groupItems.filter(item=>item.checked).length,
  }))
  .sort((a,b)=>walkRank(a.id==='other'?null:a.id)-walkRank(b.id==='other'?null:b.id)
   ||a.name.localeCompare(b.name));
}

/** The list exactly as the household wrote it. */
export function groupAsWritten(items:ListItem[]):ChecklistGroup[]{
 return items.length?[{id:'list',name:'Your list',items,checked:items.filter(i=>i.checked).length}]:[];
}

export type BasketTally={
 /** Cost of the ticked items that have a price. */
 inBasket:number;
 priced:number;
 /** Ticked, but nothing priced them — excluded from `inBasket`. */
 unpriced:number;
 checked:number;
};

/**
 * What is actually in the trolley so far.
 *
 * Only ticked items count, and an item nobody could price is counted
 * separately rather than as zero — otherwise the running total quietly reads
 * lower than the shop really is, which is the one number a shopper must be able
 * to trust.
 */
export function tallyBasket(items:ListItem[],lineTotal:(itemId:string)=>number|null):BasketTally{
 let inBasket=0,priced=0,unpriced=0;
 for(const item of items){
  if(!item.checked)continue;
  const total=lineTotal(item.id);
  if(total==null||!Number.isFinite(total))unpriced+=1;
  else{inBasket+=total;priced+=1;}
 }
 return {inBasket,priced,unpriced,checked:priced+unpriced};
}

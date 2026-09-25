"use client";
// The in-store checklist.
//
// Two changes from a plain list, both aimed at what actually happens in a shop.
//
// It is ordered the way the shop is walked rather than the way the list was
// typed, so you are not criss-crossing the store, and frozen comes last so it
// is not thawing in the trolley.
//
// And the total is live and pinned, because the question while shopping is not
// "what will this cost" but "how am I doing right now". It counts only what has
// actually been ticked, and says plainly when some of that has no price, so a
// small number is never mistaken for a complete one.
import {useMemo} from 'react';
import {Check,CircleAlert,ListOrdered,Store,Tag} from 'lucide-react';
import {Progress} from '@/components/ui/progress';
import {groupForWalk,groupAsWritten,tallyBasket,type ChecklistGroup} from '@/lib/shopping-order';
import {money,type ListItem} from '@/lib/catalog';
import type {ShelfTally} from '@/lib/shelf-prices';
import './shop-checklist.css';

export type ChecklistOrder='aisle'|'list';

type Props={
 items:ListItem[];
 order:ChecklistOrder;
 onOrderChange:(order:ChecklistOrder)=>void;
 /** Whole-line cost of an item, or null when nothing priced it. */
 lineTotal:(itemId:string)=>number|null;
 /** Where those costs came from. The running total can mix prices Aisle
  *  collected with prices the household typed off a shelf, and a number made of
  *  both must say so rather than borrowing the authority of the stronger one. */
 provenance:ShelfTally;
 budget:number;
 shopName:string;
 renderItem:(item:ListItem)=>React.ReactNode;
};

export default function ShopChecklist({items,order,onOrderChange,lineTotal,provenance,budget,shopName,renderItem}:Props){
 const groups=useMemo<ChecklistGroup[]>(()=>
  order==='aisle'?groupForWalk(items):groupAsWritten(items),[items,order]);

 const tally=useMemo(()=>tallyBasket(items,lineTotal),[items,lineTotal]);

 const remaining=budget-tally.inBasket;
 const pct=items.length?Math.round(tally.checked/items.length*100):0;

 return <div className="checklist">
  <div className="checklist-running" role="status" aria-live="polite">
   <div className="checklist-running-top">
    <div>
     <span className="checklist-running-label">In your basket</span>
     <strong className="checklist-running-total">{money(tally.inBasket)}</strong>
    </div>
    <div className="checklist-running-right">
     <span className={`checklist-remaining${remaining<0?' is-over':''}`}>
      {remaining<0?`${money(Math.abs(remaining))} over`:`${money(remaining)} left`}
     </span>
     <small>of {money(budget)}</small>
    </div>
   </div>
   <Progress value={budget>0?Math.min(100,Math.max(0,tally.inBasket/budget*100)):0}
    className={remaining<0?'budget-progress over-budget':'budget-progress'}/>
   <p className="checklist-running-foot">
    <span>{tally.checked} of {items.length} picked up · {pct}%</span>
    {tally.unpriced>0&&<span className="checklist-unpriced">
     <CircleAlert size={13}/> {tally.unpriced} with no price, not counted
    </span>}
    {provenance.observed>0&&<span className="checklist-observed">
     <Tag size={13}/> {provenance.observed} {provenance.observed===1?'price':'prices'} you entered yourself
    </span>}
   </p>
  </div>

  <div className="checklist-toolbar">
   <span className="checklist-where"><Store size={15}/> {shopName}</span>
   <div className="checklist-order" role="group" aria-label="Checklist order">
    <button type="button" aria-pressed={order==='aisle'} onClick={()=>onOrderChange('aisle')}>
     <ListOrdered size={14}/> Aisle order
    </button>
    <button type="button" aria-pressed={order==='list'} onClick={()=>onOrderChange('list')}>
     My order
    </button>
   </div>
  </div>

  {groups.map(group=>{
   const done=group.checked===group.items.length;
   return <section className={`checklist-group${done?' is-done':''}`} key={group.id}
    aria-labelledby={`group-${group.id}`}>
    {order==='aisle'&&<h3 id={`group-${group.id}`} className="checklist-group-head">
     <span className="checklist-group-name">{done&&<Check size={14}/>}{group.name}</span>
     <span className="checklist-group-count">{group.checked}/{group.items.length}</span>
    </h3>}
    <div className="checklist-rows">{group.items.map(renderItem)}</div>
   </section>;
  })}
 </div>;
}

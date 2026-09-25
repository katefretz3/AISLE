"use client";
// What this household is likely to need, from what they have actually bought.
//
// This is the one question Aisle can answer for everybody. Price comparison
// needs a readable retailer, and 17 of 19 Ontario chains publish nothing — but
// "you buy milk about every 7 days and it has been 9" comes from the household's
// own receipts and works whatever shop they use.
//
// Nothing here is a prediction dressed as a fact. Every row prints the basis it
// was derived from, so an interval seen three times reads differently from one
// standing in on the household's stated shopping rhythm.
import {useMemo,useState} from 'react';
import {Check,ChevronDown,Clock,Plus,ShoppingBasket} from 'lucide-react';
import {money,productById,type UserState} from '@/lib/catalog';
import {dueNow,priceHistory} from '@/lib/shopping-history';
import './due-this-week.css';

type Props={
 state:UserState;
 onAdd:(productId:string)=>void;
 onDismiss:(productId:string)=>void;
};

const SHOWN=4;

export default function DueThisWeek({state,onAdd,onDismiss}:Props){
 const [expanded,setExpanded]=useState(false);
 const [added,setAdded]=useState<Set<string>>(new Set());
 const rows=useMemo(()=>dueNow(state),[state]);
 const prices=useMemo(()=>priceHistory(state.trips),[state.trips]);

 // Nothing recorded yet, or nothing due: the home screen says nothing rather
 // than inventing a reason to interrupt.
 if(!rows.length)return null;

 const shown=expanded?rows:rows.slice(0,SHOWN);
 const observed=rows.filter(r=>r.basis==='observed').length;

 function add(productId:string){
  onAdd(productId);
  setAdded(prev=>new Set(prev).add(productId));
 }

 return <section className="due-week">
  <div className="due-head">
   <div>
    <h2><Clock size={18}/> Probably due this week</h2>
    <p>{observed>0
     ? `From what you have bought before — ${observed} of these on an interval Aisle has seen more than once.`
     : 'From what you have bought before. Aisle has only seen these once or twice, so it is going by how often you shop.'}</p>
   </div>
  </div>

  <ul className="due-list">
   {shown.map(row=>{
    const product=productById[row.productId];
    const history=prices.get(row.productId);
    const isAdded=added.has(row.productId);
    return <li key={row.productId} className={`due-row is-${row.basis}`}>
     <span className="due-copy">
      <strong>{row.name}</strong>
      <small>{row.why}</small>
      {history&&<small className="due-paid">
       You paid {money(Math.round(history.last.unitCents))} at {history.last.storeName}
       {history.paid.length>1&&`, usually ${money(Math.round(history.medianUnitCents))}`}
      </small>}
      {product&&<small className="due-pack">{product.brand} · {product.size}</small>}
     </span>
     <span className="due-actions">
      <button type="button" className={`button ${isAdded?'secondary':'primary'} due-add`}
       disabled={isAdded} onClick={()=>add(row.productId)}>
       {isAdded?<><Check size={15}/> Added</>:<><Plus size={15}/> Add</>}
      </button>
      <button type="button" className="text-button due-skip" onClick={()=>onDismiss(row.productId)}>
       Not this time
      </button>
     </span>
    </li>;
   })}
  </ul>

  {rows.length>SHOWN&&<button type="button" className="text-button due-more" onClick={()=>setExpanded(v=>!v)}>
   {expanded?'Show fewer':`Show ${rows.length-SHOWN} more`} <ChevronDown size={14}/>
  </button>}

  <p className="due-foot">
   <ShoppingBasket size={14}/>
   Worked out from your saved receipts, not from anything a retailer told us. Save a
   receipt after each shop and these get sharper.
  </p>
 </section>;
}

"use client";
// "Start from…" — the fastest way to build next week's list.
//
// Grocery lists are the same list most weeks. Retyping it is the single biggest
// piece of avoidable work in the app, so the three shortcuts here are the last
// shop (snapshotted automatically when a shop is finished, so it always exists
// without anyone deciding to save), any list somebody named, and the household's
// usuals — favourites plus whatever the shopper model says is due again.
import {useMemo,useState} from 'react';
import {Check,Clock,History,Plus,Repeat,Sparkles,X} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {buildShopperModel} from '@/lib/agent';
import {money,productById,productImagePath,type SavedList,type UserState} from '@/lib/catalog';
import './list-starters.css';

type Props={
 open:boolean;
 onOpenChange:(open:boolean)=>void;
 state:UserState;
 /** `replace` swaps the whole list; otherwise the items are added to it. */
 onUse:(items:{productId:string|null;name:string;qty:number}[],replace:boolean)=>void;
};

export default function ListStarters({open,onOpenChange,state,onUse}:Props){
 const [replace,setReplace]=useState(false);
 const saved=useMemo(()=>[...(state.savedLists??[])]
  .sort((a,b)=>b.savedAt.localeCompare(a.savedAt)),[state.savedLists]);

 // Favourites first, then anything the household's own history says is due.
 const {usuals,alreadyOnList}=useMemo(()=>{
  const model=buildShopperModel(state);
  const onList=new Set(state.items.map(i=>i.productId).filter(Boolean));
  const rows:{productId:string;name:string;why:string}[]=[];
  let covered=0;
  for(const id of state.prefs.favouriteProducts){
   const product=productById[id];
   if(!product)continue;
   if(onList.has(id)){covered+=1;continue;}
   rows.push({productId:id,name:product.name,why:'A staple you picked'});
  }
  for(const due of model.replenishment){
   if(!due.due||rows.some(r=>r.productId===due.productId))continue;
   if(onList.has(due.productId)){covered+=1;continue;}
   const product=productById[due.productId];
   if(product)rows.push({productId:due.productId,name:product.name,
    why:`Usually every ${due.intervalDays} days · ${due.daysSince} since`});
  }
  return {usuals:rows.slice(0,24),alreadyOnList:covered};
 },[state]);

 const [picked,setPicked]=useState<Set<string>>(new Set());
 const toggle=(id:string)=>setPicked(prev=>{
  const next=new Set(prev);next.has(id)?next.delete(id):next.add(id);return next;
 });

 function useList(list:SavedList){
  onUse(list.items.map(i=>({productId:i.productId,name:i.name,qty:i.qty})),replace);
  onOpenChange(false);
 }
 function useUsuals(){
  const rows=usuals.filter(u=>picked.has(u.productId));
  if(!rows.length)return;
  onUse(rows.map(u=>({productId:u.productId,name:u.name,qty:1})),false);
  setPicked(new Set());
  onOpenChange(false);
 }

 return <Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="starters-modal">
   <DialogTitle>Start from something you already have</DialogTitle>
   <DialogDescription>
    Most shops are mostly the same. Reuse a previous list instead of typing it again.
   </DialogDescription>

   <label className="starters-mode">
    <input type="checkbox" checked={replace} onChange={e=>setReplace(e.target.checked)}/>
    <span><strong>Replace my current list</strong>
     <small>{state.items.length
      ? `Leave this off to add to the ${state.items.length} item${state.items.length===1?'':'s'} already on your list.`
      : 'Your list is empty, so either way works.'}</small></span>
   </label>

   <div className="starters-body">
    <section>
     <h3><History size={16}/> Previous lists</h3>
     {saved.length?<div className="starters-lists">
      {saved.map(list=><button key={list.id} className="starters-list" onClick={()=>useList(list)}>
       <span className="starters-list-icon">{list.auto?<Repeat size={17}/>:<Clock size={17}/>}</span>
       <span className="starters-list-copy">
        <strong>{list.name}</strong>
        <small>{list.items.length} item{list.items.length===1?'':'s'} ·{' '}
         {new Date(list.savedAt).toLocaleDateString('en-CA',{day:'numeric',month:'short'})}
         {list.auto?' · saved automatically':''}</small>
       </span>
       <Plus size={17}/>
      </button>)}
     </div>:<p className="starters-empty">
      Nothing saved yet. When you finish a shop, Aisle keeps a copy of that list here
      so your next one starts from it.</p>}
    </section>

    <section>
     <h3><Sparkles size={16}/> Your usuals</h3>
     {usuals.length?<>
      <div className="starters-usuals">
       {usuals.map(row=><button key={row.productId} aria-pressed={picked.has(row.productId)}
        className={`starters-usual${picked.has(row.productId)?' is-picked':''}`}
        onClick={()=>toggle(row.productId)}>
        <img src={productImagePath(row.productId)} alt="" loading="lazy" decoding="async"/>
        <span><strong>{row.name}</strong><small>{row.why}</small></span>
        <span className="starters-check">{picked.has(row.productId)?<Check size={14}/>:<Plus size={15}/>}</span>
       </button>)}
      </div>
      <button className="button primary full" disabled={!picked.size} onClick={useUsuals}>
       Add {picked.size||''} {picked.size===1?'item':'items'}
      </button>
     </>:<p className="starters-empty">
      {alreadyOnList>0
       ?`Everything you usually buy is already on this list — all ${alreadyOnList} of them.`
       :'Pick some staples during setup, or record a few shops, and your regulars will show up here.'}</p>}
    </section>
   </div>
  </DialogContent>
 </Dialog>;
}

/** Used by the list screen's summary row. */
export const savedListCount=(state:UserState)=>(state.savedLists??[]).length;
export {money};

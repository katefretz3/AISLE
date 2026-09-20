"use client";
// Hierarchical catalogue browser: Department → Aisle → Item.
//
// The way someone actually looks for something in a shop — walk to Produce,
// find the fruit, pick up blueberries — with a search box that cuts straight
// through all three levels when they already know what they want.
import {useMemo,useState} from 'react';
import {ArrowLeft,Check,ChevronRight,Plus,Search,X} from 'lucide-react';
import {DEPARTMENTS,searchItems,type Aisle,type CatalogueItem,type Department} from '@/lib/taxonomy';
import {productImagePath} from '@/lib/catalog';
import './category-browser.css';

type Props={
 onPick:(id:string)=>void;
 /** Ids already on the list, shown with a tick instead of a plus. */
 picked?:Set<string>;
 /** "match" narrows the copy for replacing one unmatched line. */
 mode?:'add'|'match';
 /** Optional filter, used by onboarding to offer food only. */
 include?:(item:CatalogueItem)=>boolean;
};

export default function CategoryBrowser({onPick,picked=new Set(),mode='add',include}:Props){
 const [query,setQuery]=useState('');
 const [department,setDepartment]=useState<Department|null>(null);
 const [aisle,setAisle]=useState<Aisle|null>(null);

 const allow=useMemo(()=>include??(()=>true),[include]);
 const departments=useMemo(()=>DEPARTMENTS
  .map(d=>({...d,aisles:d.aisles.map(a=>({...a,items:a.items.filter(allow)})).filter(a=>a.items.length)}))
  .filter(d=>d.aisles.length),[allow]);

 const results=useMemo(()=>query.trim()?searchItems(query,80).filter(allow):[],[query,allow]);
 const counted=(items:CatalogueItem[])=>items.filter(i=>picked.has(i.id)).length;

 function openDepartment(next:Department){setDepartment(next);setAisle(null);}
 function back(){if(aisle)setAisle(null);else setDepartment(null);}

 const Tile=({item}:{item:CatalogueItem})=>{
  const chosen=picked.has(item.id);
  return <button type="button" className={`browse-item${chosen?' is-picked':''}`} onClick={()=>onPick(item.id)}
   aria-pressed={chosen} aria-label={`${mode==='match'?'Match':'Add'} ${item.name}, ${item.brand}, ${item.size}`}>
   <img src={productImagePath(item.id)} alt="" loading="lazy" decoding="async"/>
   <span className="browse-item-copy"><strong>{item.name}</strong><small>{item.brand} · {item.size}</small></span>
   <span className="browse-item-action">{chosen?<Check size={16}/>:<Plus size={17}/>}</span>
  </button>;
 };

 return <div className="category-browser">
  <label className="browse-search">
   <Search size={18}/>
   <input aria-label="Search groceries" autoComplete="off" value={query} onChange={e=>setQuery(e.target.value)}
    placeholder="Search 400+ groceries — blueberries, oat milk, dish soap…"/>
   {query&&<button type="button" className="browse-clear" aria-label="Clear search" onClick={()=>setQuery('')}><X size={16}/></button>}
  </label>

  {query.trim()
   ? <div className="browse-panel">
      <p className="browse-meta">{results.length?`${results.length} ${results.length===1?'match':'matches'}`:'No match'}</p>
      {results.length
       ? <div className="browse-grid">{results.map(item=><div className="browse-result" key={item.id}>
          <Tile item={item}/>
          <span className="browse-trail">{item.department} <ChevronRight size={11}/> {item.aisle}</span>
         </div>)}</div>
       : <p className="browse-empty">Nothing in the catalogue matches “{query}”. Add it as your own item instead — Aisle will leave it unpriced rather than inventing a match.</p>}
     </div>

   : <div className="browse-panel">
      {(department||aisle)&&<nav className="browse-crumbs" aria-label="Catalogue location">
       <button type="button" onClick={back} className="browse-back"><ArrowLeft size={15}/> Back</button>
       <span><button type="button" onClick={()=>setDepartment(null)}>All departments</button>
        {department&&<> <ChevronRight size={12}/> <button type="button" onClick={()=>setAisle(null)}>{department.name}</button></>}
        {aisle&&<> <ChevronRight size={12}/> <strong>{aisle.name}</strong></>}</span>
      </nav>}

      {!department&&<div className="browse-tiles">{departments.map(d=>{
       const items=d.aisles.flatMap(a=>a.items);
       return <button type="button" key={d.id} className="browse-tile" onClick={()=>openDepartment(d)}>
        <span className="browse-tile-art">{d.aisles.slice(0,3).map(a=>a.items[0]).map(i=>
         <img key={i.id} src={productImagePath(i.id)} alt="" loading="lazy" decoding="async"/>)}</span>
        <strong>{d.name}</strong>
        <small>{d.aisles.length} aisles · {items.length} items{counted(items)?` · ${counted(items)} on your list`:''}</small>
        <ChevronRight size={16}/>
       </button>;})}</div>}

      {department&&!aisle&&<div className="browse-tiles">{department.aisles.map(a=>
       <button type="button" key={a.id} className="browse-tile" onClick={()=>setAisle(a)}>
        <span className="browse-tile-art">{a.items.slice(0,3).map(i=>
         <img key={i.id} src={productImagePath(i.id)} alt="" loading="lazy" decoding="async"/>)}</span>
        <strong>{a.name}</strong>
        <small>{a.items.length} items{counted(a.items)?` · ${counted(a.items)} on your list`:''}</small>
        <ChevronRight size={16}/>
       </button>)}</div>}

      {aisle&&<div className="browse-grid">{aisle.items.map(item=><Tile key={item.id} item={item}/>)}</div>}
     </div>}
 </div>;
}

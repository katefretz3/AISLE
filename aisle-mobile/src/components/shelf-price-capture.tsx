"use client";
// Typing in what the shelf says, while standing in front of it.
//
// The moment this exists for is narrow: phone in one hand, trolley in the other,
// looking at a label. So the form asks for as little as it can get away with —
// the price — and pre-fills everything else from what it already knows. The pack
// size is offered rather than assumed, because noticing that the shelf has a
// 450 g loaf when your list says 675 g is the single most useful thing a person
// can tell this app.
import {useEffect,useState} from 'react';
import {Info,Tag,Trash2} from 'lucide-react';
import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import {money,type ListItem,type ShelfPrice} from '@/lib/catalog';
import {expectedPackLabel,shelfPriceAgeDays,isStale} from '@/lib/shelf-prices';
import './shelf-price-capture.css';

type StoreOption={value:string;label:string};

type Props={
 open:boolean;
 onOpenChange:(open:boolean)=>void;
 item:ListItem|null;
 /** Where the household is shopping, pre-selected. */
 defaultStoreId:string;
 stores:StoreOption[];
 /** Whatever was captured for this item before, so it can be corrected. */
 existing:ShelfPrice|null;
 onSave:(input:{priceCents:number;packLabel:string;storeId:string;note:string})=>void;
 onRemove:(id:string)=>void;
};

export default function ShelfPriceCapture({
 open,onOpenChange,item,defaultStoreId,stores,existing,onSave,onRemove,
}:Props){
 const [price,setPrice]=useState('');
 const [packLabel,setPackLabel]=useState('');
 const [storeId,setStoreId]=useState(defaultStoreId);
 const [note,setNote]=useState('');
 const [error,setError]=useState('');

 // Reset to this item every time the sheet opens, so a price typed for one
 // product can never be saved against another.
 useEffect(()=>{
  if(!open||!item)return;
  setPrice(existing?(existing.priceCents/100).toFixed(2):'');
  setPackLabel(existing?.packLabel&&existing.packLabel!=='not stated'
   ?existing.packLabel:expectedPackLabel(item));
  setStoreId(existing?.storeId??defaultStoreId);
  setNote(existing?.note??'');
  setError('');
 },[open,item,existing,defaultStoreId]);

 if(!item)return null;

 function save(){
  const cents=Math.round(Number(price)*100);
  if(!price.trim()||!Number.isFinite(cents)||cents<=0){
   setError('Enter the price on the label, in dollars.');return;
  }
  if(cents>100000){setError('That looks too high for a shelf price. Check the decimal point.');return;}
  onSave({priceCents:cents,packLabel,storeId,note});
  onOpenChange(false);
 }

 const store=stores.find(s=>s.value===storeId);

 return <Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="shelf-modal">
   <div className="modal-icon"><Tag size={23}/></div>
   <DialogTitle>What does the label say?</DialogTitle>
   <DialogDescription>
    {item.qty} × {item.name}{store?` · ${store.label}`:''}
   </DialogDescription>

   <label className="field-label">Price on the shelf
    <div className="budget-input">
     <span>$</span>
     <input type="number" inputMode="decimal" min="0.01" step="0.01" placeholder="0.00"
      aria-label={`Shelf price for ${item.name}`} value={price} autoFocus
      onChange={e=>{setPrice(e.target.value);setError('');}}
      onKeyDown={e=>{if(e.key==='Enter')save();}}/>
    </div>
   </label>

   <div className="form-grid">
    <label>Size on the label
     <input type="text" maxLength={40} placeholder="e.g. 675 g" value={packLabel}
      aria-label="Pack size the price is for"
      onChange={e=>setPackLabel(e.target.value)}/>
    </label>
    <label>Shop
     <Select value={storeId} onValueChange={setStoreId}>
      <SelectTrigger aria-label="Shop where you saw this price"><SelectValue/></SelectTrigger>
      <SelectContent>
       {stores.map(s=><SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
      </SelectContent>
     </Select>
    </label>
   </div>

   <label className="field-label">Note <span className="field-optional">optional</span>
    <input type="text" maxLength={140} placeholder="On sale until Sunday, last one on the shelf…"
     aria-label="Note about this price" value={note} onChange={e=>setNote(e.target.value)}/>
   </label>

   {error&&<p role="alert" className="shelf-error">{error}</p>}

   <div className="shelf-honesty">
    <Info size={15}/>
    <p>This is your own reading of the label, so Aisle records it as yours. It is
     kept apart from prices Aisle collected itself, shown as something you saw
     rather than something it verified, and never used to claim a saving.</p>
   </div>

   <button className="button primary full" onClick={save}>
    Save this price
   </button>

   {existing&&<button className="text-button shelf-remove"
    onClick={()=>{onRemove(existing.id);onOpenChange(false);}}>
    <Trash2 size={14}/> Remove the {money(existing.priceCents)} you saved
    {shelfPriceAgeDays(existing)>0&&` ${shelfPriceAgeDays(existing)} days ago`}
    {isStale(existing)&&' · probably out of date'}
   </button>}
  </DialogContent>
 </Dialog>;
}

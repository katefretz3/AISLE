"use client";
// The agent, on screen.
//
// Shows what the agent actually did: which retailers it could read, which list
// items it matched to a real catalogue record, what it could not price, and the
// HTTP response behind every figure. Nothing here is rendered unless it came
// back from a run — an unpriced item shows as an unpriced item.
import {useMemo,useState} from 'react';
import {Accordion,AccordionContent,AccordionItem,AccordionTrigger} from '@/components/ui/accordion';
import {ArrowUpRight,Check,ChevronDown,ChevronRight,CircleAlert,FileSearch,Info,LoaderCircle,MapPin,RefreshCw,ShieldCheck,Sparkles,Store,X} from 'lucide-react';
import type {AgentRun,Basket,UnmatchedKind} from '@/lib/agent';
import type {AgentSession} from '@/lib/use-agent-run';
import {money,productById,productImagePath,type UserState} from '@/lib/catalog';
import {withUnitPrices} from '@/lib/unit-price';
import './agent-workspace.css';

type Props={state:UserState;agent:AgentSession;commit:(update:(state:UserState)=>UserState)=>void;onAdd:(id:string)=>void;
 onList:()=>void;onPreferences:()=>void;onSetup:()=>void;onCompare:()=>void};

const PHASES=[
 {id:'discover',label:'Finding stores near you'},
 {id:'collect',label:'Reading retailer catalogues'},
 {id:'match',label:'Matching your list'},
 {id:'verify',label:'Verifying every price'},
 {id:'compose',label:'Totalling your baskets'},
] as const;

export default function AgentWorkspace({state,agent,commit,onList,onPreferences,onSetup,onCompare}:Props){
 const {run,busy,error,baskets,best,perShopBudget:budget,readable,start}=agent;
 const phase=busy?'discover':'';
 // Items with a collected price, counted once across every basket.
 const matchedCount=useMemo(()=>
  new Set(baskets.flatMap(b=>b.lines.filter(l=>l.offer).map(l=>l.itemId))).size,[baskets]);

 function decide(itemId:string,sourceId:string,offerId:string,brand:string,accept:boolean){
  commit(s=>{
   const selections={...s.offerSelections,[itemId]:{...s.offerSelections?.[itemId]}};
   if(accept)selections[itemId][sourceId]=offerId;else delete selections[itemId][sourceId];
   const item=s.items.find(i=>i.id===itemId);
   const category=item?.productId?productById[item.productId]?.category??'Other':'Other';
   return {...s,offerSelections:selections,events:s.prefs.learning
    ?[...s.events,{action:accept?'offer_accepted':'offer_rejected',category,productId:item?.productId??undefined,
      offerId,brand,date:new Date().toISOString(),storeId:sourceId}].slice(-200)
    :s.events};
  });
 }

 return <div className="agent-workspace">
  <header className="agent-hero">
   <div>
    <span className="agent-eyebrow"><Sparkles size={15}/> Your grocery agent</span>
    <h1>{state.prefs.name?`Let’s price your list, ${state.prefs.name}.`:'Let’s price your list.'}</h1>
    <p>Aisle looks for stores near you, reads the catalogues it is allowed to read, and matches your
     list against what they actually publish. Every figure traces back to a response it received.</p>
    <div className="agent-hero-actions">
     <button className="button primary" disabled={busy} onClick={start}>
      {busy?<><LoaderCircle size={17} className="spin"/> Checking…</>:<><RefreshCw size={16}/> Run a price check</>}
     </button>
     <button className="button ghost" onClick={onList}>Edit my list <ChevronRight size={16}/></button>
     {baskets.length>0&&<button className="button ghost" onClick={onCompare}>Compare baskets <ChevronRight size={16}/></button>}
    </div>
   </div>
   <dl className="agent-stats">
    <div><dt>Budget this shop</dt><dd>{money(budget)}</dd></div>
    <div><dt>On your list</dt><dd>{state.items.length}</dd></div>
    <div><dt>Retailers read</dt><dd>{readable}</dd></div>
    <div><dt>Prices verified</dt><dd>{run?run.offers.length:0}</dd></div>
   </dl>
  </header>

  {busy&&<ol className="agent-phases" aria-live="polite">
   {PHASES.map(p=><li key={p.id} className={phase===p.id?'is-active':''}><span/>{p.label}</li>)}
  </ol>}

  {error&&<p className="agent-alert error" role="alert"><CircleAlert size={17}/> {error}
   <button onClick={start}>Try again</button></p>}

  {run&&<>
   <section className="agent-summary">
    <span className={`agent-mode ${run.mode}`}>{run.mode==='assisted'?'AI-assisted matching':'Rule-based matching'}</span>
    <p>{run.narrative}</p>
    {run.warnings.map(w=><p className="agent-warning" key={w}><Info size={15}/> {w}</p>)}
   </section>

   <section className="agent-block">
    <div className="agent-block-head">
     <div><h2>Your list, matched</h2>
      <p>{matchedCount>0
       ?<>{matchedCount} of {state.items.length} {state.items.length===1?'item':'items'} {matchedCount===1?'has':'have'} a
         collected price{matchedCount<state.items.length&&<>; the rest are grouped below with the reason</>}. Aisle
         proposes, you confirm — a match only counts towards a total once you accept it.</>
       :<>Aisle proposes; you confirm. A match only counts towards a total once you accept it.</>}</p></div>
     <button className="text-button" onClick={onPreferences}>Preferences <ArrowUpRight size={15}/></button>
    </div>
    {readable===0
     ? <div className="agent-blocked">
        <CircleAlert size={20}/>
        <div>
         <strong>{state.items.length
          ?'No prices were collected, so nothing on your list is priced.'
          :'No prices were collected, and your list is empty.'}</strong>
         <p>{state.items.length
          ? <>All {state.items.length} items are showing as unpriced because no retailer catalogue could be read
            on this run — not because the items are unavailable. Aisle leaves them blank rather than filling in
            a plausible number.</>
          : <>No retailer catalogue could be read on this run. Add groceries to your list and check again — Aisle
            will price whatever it can actually read, and leave the rest blank.</>}</p>
         {state.items.length>0&&<ul>{state.items.slice(0,12).map(i=><li key={i.id}>{i.qty} × {i.name}</li>)}
          {state.items.length>12&&<li>and {state.items.length-12} more</li>}</ul>}
        </div>
       </div>
     : <div className="agent-lines">

      {/* Priced items first: they are the output. Items with no price follow in
          one grouped block, so the explanation is stated once instead of once
          per row — eight near-identical paragraphs read as an apology and train
          people to stop reading them. */}
      {state.items.filter(item=>baskets.some(b=>b.lines.some(l=>l.itemId===item.id&&l.offer))).map(item=>{
      const candidates=baskets.map(b=>({basket:b,line:b.lines.find(l=>l.itemId===item.id)}))
       .filter((c):c is {basket:Basket;line:NonNullable<typeof c.line>}=>!!c.line?.offer);
      const {priced:unitRows}=withUnitPrices(candidates,c=>({price:c.line.offer!.price,pack:c.line.offer!.pack}));
      const unitFor=(sourceId:string)=>unitRows.find(u=>u.row.basket.sourceId===sourceId);
      const product=item.productId?productById[item.productId]:undefined;
      return <article className={`agent-line${candidates.length?'':' is-gap'}`} key={item.id}>
       <img src={productImagePath(item.productId)} alt="" loading="lazy" decoding="async"/>
       <div className="agent-line-copy">
        <strong>{item.qty} × {item.name}</strong>
        <small>{product?`${product.brand} · ${product.size}`:'Your own item'}{item.locked?' · locked to this exact product':''}</small>
       </div>
       <div className="agent-line-offers">
        {candidates.length?candidates.map(({basket,line})=>
         <div className={`agent-offer${line.confirmed?' is-confirmed':''}`} key={basket.sourceId}>
          <div className="agent-offer-copy">
           <strong>{money(line.lineTotal)}</strong>
           <span>{basket.name} · {line.packs}× {line.offer!.pack?`${line.offer!.pack.amount} ${line.offer!.pack.unit}`:'pack size not stated'}</span>
           {(()=>{const unit=unitFor(basket.sourceId);
            return unit?.text
             ?<span className={`agent-unit${unit.best?' is-best':''}`}>{unit.text}{unit.best&&' · best value'}</span>
             :<span className="agent-unit is-unknown">No unit price — pack size not stated</span>;})()}
           <a href={line.offer!.url} target="_blank" rel="noreferrer noopener">{line.offer!.title} <ArrowUpRight size={12}/></a>
           {line.rationale&&<em>{line.rationale}</em>}
          </div>
          {line.confirmed
           ?<button className="agent-chip is-on" onClick={()=>decide(item.id,basket.sourceId,line.offer!.id,line.offer!.brand,false)}>
             <Check size={14}/> Confirmed</button>
           :<span className="agent-offer-decide">
             <button className="agent-chip" onClick={()=>decide(item.id,basket.sourceId,line.offer!.id,line.offer!.brand,true)}>
              <Check size={14}/> This is right</button>
             <button className="agent-chip subtle" onClick={()=>decide(item.id,basket.sourceId,line.offer!.id,line.offer!.brand,false)}>
              <X size={13}/> Not this</button>
            </span>}
         </div>)
        :null}
       </div>
      </article>;})}
      <UnpricedGroups state={state} run={run} baskets={baskets} onList={onList} onPreferences={onPreferences} onRecheck={start}/>
       </div>}
   </section>

   <section className="agent-block">
    <div className="agent-block-head">
     <div><h2>Baskets</h2>
      <p>Product subtotals in CAD. Delivery, tax, deposits and membership fees are not included.
       An incomplete basket is never ranked as cheapest.</p></div>
     {baskets.length>0&&<button className="text-button" onClick={onCompare}>Compare all <ArrowUpRight size={15}/></button>}
    </div>
    {baskets.length?<div className="agent-cards">
     {baskets.slice(0,3).map(b=><article className={`agent-card${b===best&&b.complete?' is-best':''}`} key={b.sourceId}>
      <h3>{b.name}</h3>
      <strong className="agent-card-total">{b.priced?money(b.subtotal):'—'}</strong>
      <p>{b.complete?'Every item priced':`${b.priced} of ${b.total} items priced`}</p>
      {b.unconfirmed>0&&<p className="agent-card-note">{b.unconfirmed} awaiting your confirmation</p>}
      {b.complete&&b.overBudget>0&&<p className="agent-card-over">{money(b.overBudget)} over your budget</p>}
      {b.complete&&b.overBudget===0&&<p className="agent-card-under">{money(budget-b.subtotal)} left in budget</p>}
     </article>)}
    </div>:<p className="agent-empty">No retailer catalogue could be read on this run, so there is nothing to total. Widening your search area in Account settings may reach a shop that publishes one.</p>}
   </section>

   <section className="agent-block">
    <div className="agent-block-head"><div><h2><Store size={18}/> Stores near you</h2>
     <p>Within {state.prefs.radius} km of your saved location. Distances are straight-line, not driving routes.</p></div>
     <button className="text-button" onClick={onSetup}>Change my area <ArrowUpRight size={15}/></button></div>
    {run.stores.length?<ul className="agent-stores">
     {run.stores.slice(0,8).map(s=><li key={s.id}>
      <MapPin size={15}/>
      <span><strong>{s.name}</strong><small>{s.address||'Address not mapped'}</small></span>
      <span className="agent-km">{s.km.toFixed(1)} km</span>
      <span className={`agent-feed ${s.feed}`}>{s.feed==='connected'?'Prices read':s.feed==='no-public-feed'?'No price feed':'Not checked'}</span>
     </li>)}
    </ul>:<p className="agent-empty">The map directory returned no shops for your area. That is a gap in the map data, not a sign there are none — your saved location is unchanged, and a price check will still try the retailers Aisle knows.</p>}

    {run.coverageGaps.length>0&&<div className="agent-note">
     <ShieldCheck size={18}/>
     <div><strong>Chains Aisle deliberately does not price</strong>
      <p>{run.coverageGaps.map(g=>g.name).join(', ')} {run.coverageGaps.length===1?'publishes':'publish'} no public price
       feed. Aisle lists them without prices rather than estimating. Real coverage needs a licensed retailer feed.</p></div>
    </div>}
   </section>

   <Accordion type="multiple" className="agent-block agent-evidence">
    <AccordionItem value="evidence">
     <AccordionTrigger><span className="agent-acc-label"><FileSearch size={17}/> Evidence behind these prices ({run.evidence.length} responses)</span></AccordionTrigger>
     <AccordionContent>
      <table className="agent-table"><thead><tr><th>Source</th><th>Status</th><th>Read at</th><th>Size</th><th>SHA-256</th></tr></thead>
       <tbody>{run.evidence.map(e=><tr key={e.id}>
        <td><a href={e.url} target="_blank" rel="noreferrer noopener">{e.origin.replace('https://','')}</a></td>
        <td>{e.status}</td><td>{new Date(e.fetchedAt).toLocaleString('en-CA')}</td>
        <td>{Math.round(e.bytes/1024)} KB</td><td className="agent-hash">{e.bodyHash.slice(0,16)}…</td>
       </tr>)}</tbody></table>
      {run.rejectedOffers.length>0&&<p className="agent-rejected">{run.rejectedOffers.length} collected
       record{run.rejectedOffers.length===1?' was':'s were'} discarded before totalling (unavailable, expired,
       or failing verification).</p>}
      {run.violations.length>0&&<ul className="agent-violations">{run.violations.map((v,i)=><li key={i}>{v.detail}</li>)}</ul>}
     </AccordionContent>
    </AccordionItem>
    <AccordionItem value="trace">
     <AccordionTrigger><span className="agent-acc-label"><Info size={17}/> How this run worked</span></AccordionTrigger>
     <AccordionContent>
      <ol className="agent-trace">{run.trace.map((t,i)=><li key={i}>
       <span className="agent-trace-phase">{t.phase}</span>
       <span><strong>{t.label}</strong> — {t.detail}</span>
       <span className="agent-trace-ms">{t.ms} ms</span>
      </li>)}</ol>
      <p className="agent-foot">Run {run.runId} · {run.durationMs} ms · {run.budgetSpent.toolCalls} tool calls ·
       {Math.round(run.budgetSpent.evidenceBytes/1024)} KB read. Prices are online catalogue prices, not confirmed
       branch prices, and Aisle will not send you to a store because of one.</p>
     </AccordionContent>
    </AccordionItem>
   </Accordion>
  </>}
 </div>;
}

/** The shared explanation for each kind of gap, said once. */
const GAP_COPY:Record<UnmatchedKind,{title:(n:number)=>string;body:string}>={
 'no-record':{
  title:n=>`${n} ${n===1?'item has':'items have'} no matching catalogue record`,
  body:'Nothing in the catalogues Aisle could read corresponds to these, so they are left blank. '
   +'That is a gap in what retailers publish, not a sign the items are unavailable in the shop.',
 },
 discarded:{
  title:n=>`${n} ${n===1?'price was':'prices were'} found but could not be trusted`,
  body:'A figure was collected for these and then failed verification — wrong currency, stale, or with no '
   +'usable evidence behind it. Aisle discards a price it cannot stand behind rather than showing it.',
 },
 flagged:{
  title:n=>`${n} ${n===1?'item was':'items were'} recorded as unavailable`,
  body:'Aisle looked and found nothing genuinely equivalent, so it reported that instead of proposing an '
   +'approximate substitute.',
 },
};

/**
 * Every unpriced item, grouped by why.
 *
 * The per-item reasoning is kept — it is behind a disclosure rather than
 * deleted — but the sentence that is identical on every row is printed once.
 */
function UnpricedGroups({state,run,baskets,onList,onPreferences,onRecheck}:{
 state:UserState;run:AgentRun;baskets:Basket[];
 onList:()=>void;onPreferences:()=>void;onRecheck:()=>void;
}){
 const [open,setOpen]=useState<UnmatchedKind|null>(null);
 const groups=useMemo(()=>{
  const priced=new Set(baskets.flatMap(b=>b.lines.filter(l=>l.offer).map(l=>l.itemId)));
  const rows=run.unmatched.filter(u=>!priced.has(u.itemId)&&state.items.some(i=>i.id===u.itemId));
  const by=new Map<UnmatchedKind,typeof rows>();
  for(const row of rows)by.set(row.kind,[...(by.get(row.kind)??[]),row]);
  return [...by.entries()];
 },[run,baskets,state.items]);

 if(!groups.length)return null;

 return <>{groups.map(([kind,rows])=>{
  const copy=GAP_COPY[kind];
  const expanded=open===kind;
  return <section className={`agent-gap-group is-${kind}`} key={kind}>
   <div className="agent-gap-head">
    <CircleAlert size={18}/>
    <div>
     <strong>{copy.title(rows.length)}</strong>
     <p>{copy.body}</p>
    </div>
   </div>
   <ul className="agent-gap-items">
    {rows.map(row=><li key={row.itemId}>{row.name}</li>)}
   </ul>
   <div className="agent-gap-actions">
    <button type="button" className="text-button" onClick={()=>setOpen(expanded?null:kind)}>
     {expanded?'Hide the detail':`Why these ${rows.length===1?'one':rows.length}`} <ChevronDown size={14}/>
    </button>
    {kind==='no-record'
     ?<><button type="button" className="text-button" onClick={onList}>Edit my list <ArrowUpRight size={14}/></button>
       <button type="button" className="text-button" onClick={onPreferences}>Loosen brand rules <ArrowUpRight size={14}/></button></>
     :kind==='discarded'
      ?<button type="button" className="text-button" onClick={onRecheck}>Check again <ArrowUpRight size={14}/></button>
      :<button type="button" className="text-button" onClick={onList}>Edit my list <ArrowUpRight size={14}/></button>}
   </div>
   {expanded&&<dl className="agent-gap-detail">
    {rows.map(row=><div key={row.itemId}><dt>{row.name}</dt><dd>{row.reason}</dd></div>)}
   </dl>}
  </section>;
 })}</>;
}

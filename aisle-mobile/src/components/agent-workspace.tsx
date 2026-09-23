"use client";
// The agent, on screen.
//
// Shows what the agent actually did: which retailers it could read, which list
// items it matched to a real catalogue record, what it could not price, and the
// HTTP response behind every figure. Nothing here is rendered unless it came
// back from a run — an unpriced item shows as an unpriced item.
import {useMemo} from 'react';
import {Accordion,AccordionContent,AccordionItem,AccordionTrigger} from '@/components/ui/accordion';
import {ArrowUpRight,Check,ChevronRight,CircleAlert,FileSearch,Info,LoaderCircle,MapPin,RefreshCw,ShieldCheck,Sparkles,Store,X} from 'lucide-react';
import type {Basket} from '@/lib/agent';
import type {AgentSession} from '@/lib/use-agent-run';
import {money,productById,productImagePath,type UserState} from '@/lib/catalog';
import './agent-workspace.css';

type Props={state:UserState;agent:AgentSession;commit:(update:(state:UserState)=>UserState)=>void;onAdd:(id:string)=>void;
 onList:()=>void;onPreferences:()=>void;onSetup:()=>void;onDemo:()=>void;onCompare:()=>void};

const PHASES=[
 {id:'discover',label:'Finding stores near you'},
 {id:'collect',label:'Reading retailer catalogues'},
 {id:'match',label:'Matching your list'},
 {id:'verify',label:'Verifying every price'},
 {id:'compose',label:'Totalling your baskets'},
] as const;

export default function AgentWorkspace({state,agent,commit,onList,onPreferences,onSetup,onDemo,onCompare}:Props){
 const {run,busy,error,baskets,best,perShopBudget:budget,readable,start}=agent;
 const phase=busy?'discover':'';

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
      <p>Aisle proposes; you confirm. A match only counts towards a total once you accept it.</p></div>
     <button className="text-button" onClick={onPreferences}>Preferences <ArrowUpRight size={15}/></button>
    </div>
    {readable===0
     ? <div className="agent-blocked">
        <CircleAlert size={20}/>
        <div>
         <strong>No prices were collected, so nothing on your list is priced.</strong>
         <p>All {state.items.length} items are showing as unpriced because no retailer catalogue could be read
          on this run — not because the items are unavailable. Aisle leaves them blank rather than filling in
          a plausible number.</p>
         <ul>{state.items.slice(0,12).map(i=><li key={i.id}>{i.qty} × {i.name}</li>)}
          {state.items.length>12&&<li>and {state.items.length-12} more</li>}</ul>
        </div>
       </div>
     : <div className="agent-lines">

      {state.items.map(item=>{
      const candidates=baskets.map(b=>({basket:b,line:b.lines.find(l=>l.itemId===item.id)}))
       .filter((c):c is {basket:Basket;line:NonNullable<typeof c.line>}=>!!c.line?.offer);
      const gap=run.unmatched.find(u=>u.itemId===item.id);
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
        :<p className="agent-gap"><CircleAlert size={15}/> {(gap?.reason??'No collected record matched this item').replace(/\.?$/,'.')} Aisle leaves it unpriced rather than guessing.</p>}
       </div>
      </article>;})}
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
    </div>:<p className="agent-empty">No retailer catalogue could be read, so there is nothing to total.</p>}
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
    </ul>:<p className="agent-empty">The store directory returned nothing for your area.</p>}

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

   <button className="text-button agent-demo" onClick={onDemo}>Explore the separate sample-price demo</button>
  </>}
 </div>;
}

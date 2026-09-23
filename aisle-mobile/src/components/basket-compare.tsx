"use client";
// Compare baskets — the observed-price comparison screen.
//
// This is what "Compare stores" used to promise and not deliver: before, it
// rendered the same agent workspace as the home screen. It now ranks the
// agent's verified baskets against each other and is the one place a shop
// actually starts from.
//
// The ranking rule is the honest one: a complete basket always outranks a
// partial one, and an incomplete basket is never labelled cheapest — only
// best-covered. A retailer with a readable catalogue but nothing matched still
// appears, because "we looked and found nothing" is a result.
import {useMemo} from 'react';
import {ArrowUpRight,Check,ChevronRight,CircleAlert,Info,MapPin,RefreshCw,ShieldCheck,ShoppingBag,Store,TrendingDown} from 'lucide-react';
import {money,type UserState} from '@/lib/catalog';
import type {Basket} from '@/lib/agent';
import type {AgentSession} from '@/lib/use-agent-run';
import './basket-compare.css';

type Props={
 state:UserState;
 agent:AgentSession;
 onShop:(sourceId:string)=>void;
 onList:()=>void;
 onSetup:()=>void;
 onDemo:()=>void;
};

export default function BasketCompare({state,agent,onShop,onList,onSetup,onDemo}:Props){
 const {run,busy,error,baskets,best,perShopBudget,readable,start}=agent;
 const complete=useMemo(()=>baskets.filter(b=>b.complete),[baskets]);

 // Only comparable when two baskets both cover the whole list; comparing a
 // full basket against a partial one would overstate the difference.
 const spread=useMemo(()=>{
  if(complete.length<2)return null;
  const sorted=[...complete].sort((a,b)=>a.subtotal-b.subtotal);
  return {low:sorted[0],high:sorted[sorted.length-1],
   difference:sorted[sorted.length-1].subtotal-sorted[0].subtotal};
 },[complete]);

 return <div className="compare-screen">
  <div className="page-heading">
   <div>
    <span className="eyebrow">YOUR LIST, PRICED SIDE BY SIDE</span>
    <h1>Compare baskets</h1>
    <p>Every figure here came from a retailer catalogue Aisle read itself. Where a
     price is missing the basket stays incomplete rather than being filled in.</p>
   </div>
   <button className="button secondary" disabled={busy} onClick={start}>
    <RefreshCw size={16} className={busy?'spin':''}/>{busy?'Checking…':'Re-check prices'}
   </button>
  </div>

  {error&&<p className="agent-alert error" role="alert">
   <CircleAlert size={17}/> {error}<button onClick={start}>Try again</button></p>}

  {spread&&<section className="compare-spread">
   <span className="compare-spread-icon"><TrendingDown size={20}/></span>
   <div>
    <strong>{money(spread.difference)} between your cheapest and dearest complete basket</strong>
    <p>{spread.low.name} totals {money(spread.low.subtotal)}; {spread.high.name} totals {money(spread.high.subtotal)}
     for the same {spread.low.total} items.</p>
   </div>
  </section>}

  {baskets.length===0
   ? <EmptyCompare busy={busy} readable={readable} run={!!run} onList={onList} onSetup={onSetup} onDemo={onDemo}/>
   : <>
    <div className="compare-grid">
     {baskets.map(basket=>
      <BasketCard key={basket.sourceId} basket={basket} budget={perShopBudget}
       isBest={basket===best&&basket.complete} onShop={()=>onShop(basket.sourceId)}/>)}
    </div>

    <section className="compare-note">
     <Info size={18}/>
     <p>Subtotals cover products only — delivery, tax, deposits, minimum-order fees and
      memberships are not included. These are online catalogue prices, so they are not
      confirmed prices at any particular branch, and Aisle will not send you to a shop
      because of one.</p>
    </section>
   </>}

  {run&&run.stores.length>0&&<section className="compare-stores">
   <div className="compare-section-head">
    <div><h2><Store size={18}/> Shops near you</h2>
     <p>Within {state.prefs.radius} km of your saved location. Straight-line distance, not a driving route.</p></div>
    <button className="text-button" onClick={onSetup}>Change my area <ArrowUpRight size={15}/></button>
   </div>
   <ul>
    {run.stores.slice(0,8).map(store=><li key={store.id}>
     <MapPin size={15}/>
     <span className="compare-store-copy"><strong>{store.name}</strong><small>{store.address||'Address not mapped'}</small></span>
     <span className="compare-km">{store.km.toFixed(1)} km</span>
     <span className={`agent-feed ${store.feed}`}>
      {store.feed==='connected'?'Prices read':store.feed==='no-public-feed'?'No price feed':'Not checked'}</span>
    </li>)}
   </ul>
   {run.coverageGaps.length>0&&<div className="compare-gap">
    <ShieldCheck size={18}/>
    <div><strong>Chains Aisle deliberately does not price</strong>
     <p>{run.coverageGaps.map(g=>g.name).join(', ')} {run.coverageGaps.length===1?'publishes':'publish'} no
      public price feed. They are listed without prices rather than estimated.</p></div>
   </div>}
  </section>}
 </div>;
}

function BasketCard({basket,budget,isBest,onShop}:{basket:Basket;budget:number;isBest:boolean;onShop:()=>void}){
 const coverage=basket.total?Math.round(basket.priced/basket.total*100):0;
 return <article className={`compare-card${isBest?' is-best':''}`}>
  {isBest&&<span className="compare-badge"><Check size={13}/> Cheapest complete basket</span>}
  <h3>{basket.name}</h3>
  <strong className="compare-total">{basket.priced?money(basket.subtotal):'—'}</strong>
  <p className="compare-sub">{basket.complete
   ? `All ${basket.total} items priced`
   : `${basket.priced} of ${basket.total} items priced`}</p>

  <div className="compare-meter" role="img" aria-label={`${coverage}% of your list priced`}>
   <span style={{width:`${coverage}%`}}/>
  </div>

  <dl className="compare-facts">
   {basket.complete
    ? <div><dt>Budget</dt><dd className={basket.overBudget>0?'is-over':'is-under'}>
       {basket.overBudget>0?`${money(basket.overBudget)} over`:`${money(budget-basket.subtotal)} left`}</dd></div>
    : <div><dt>Missing</dt><dd>{basket.total-basket.priced} unpriced</dd></div>}
   <div><dt>Confirmed</dt><dd>{basket.priced-basket.unconfirmed} of {basket.priced}</dd></div>
  </dl>

  {basket.unconfirmed>0&&<p className="compare-warn">
   <CircleAlert size={14}/> {basket.unconfirmed} {basket.unconfirmed===1?'match is':'matches are'} still
   proposals. Confirm them on My week before relying on this total.</p>}

  <button className="button primary full" disabled={!basket.priced} onClick={onShop}>
   <ShoppingBag size={16}/> Shop at {basket.name}
  </button>
 </article>;
}

function EmptyCompare({busy,readable,run,onList,onSetup,onDemo}:{
 busy:boolean;readable:number;run:boolean;onList:()=>void;onSetup:()=>void;onDemo:()=>void;
}){
 return <section className="compare-empty">
  <span className="compare-empty-icon"><Store size={26}/></span>
  <h2>{busy?'Reading retailer catalogues…'
   :!run?'No price check has run yet.'
   :readable===0?'No retailer near you publishes a catalogue Aisle can read.'
   :'Nothing on your list matched a collected price.'}</h2>
  <p>{busy?'This takes a few seconds. Aisle is finding shops near you and reading the catalogues it is allowed to read.'
   :readable===0?'Aisle only shows prices it has actually collected, so rather than estimating, it shows nothing. Widening your search area may reach a retailer that publishes one.'
   :'The catalogues Aisle could read do not stock your items, or the matches did not meet your brand and pack rules.'}</p>
  {!busy&&<div className="compare-empty-actions">
   <button className="button secondary" onClick={onList}>Edit my list <ChevronRight size={15}/></button>
   <button className="button secondary" onClick={onSetup}>Widen my search area <ChevronRight size={15}/></button>
   <button className="text-button" onClick={onDemo}>Explore the sample-price demo</button>
  </div>}
 </section>;
}

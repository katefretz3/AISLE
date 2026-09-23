"use client";
// One agent run, shared by every screen that needs it.
//
// The run used to live inside AgentWorkspace, which meant the home screen had
// verified prices and nothing else did: compare fell back to rendering the same
// component, the shopping checklist could never be started, and the budget card
// showed a dash. Owning the run here lets all of them read the same verified
// result without re-collecting, and keeps a single answer to "what does this
// basket cost" across the app.
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {runAgent,basketsFrom,buildShopperModel,type AgentRun,type Basket} from '@/lib/agent';
import type {UserState} from '@/lib/catalog';

export type AgentSession={
 run:AgentRun|null;
 busy:boolean;
 error:string;
 /** Verified baskets, re-totalled locally whenever a match is confirmed. */
 baskets:Basket[];
 /** The cheapest complete basket, or the best-covered one if none is complete. */
 best:Basket|null;
 perShopBudget:number;
 /** Retailers whose catalogue was actually readable on this run. */
 readable:number;
 start:()=>void;
 basketFor:(sourceId:string|null)=>Basket|null;
};

export function useAgentRun(state:UserState,ready:boolean):AgentSession{
 const [run,setRun]=useState<AgentRun|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const alive=useRef(true),inFlight=useRef(false);
 // Read through a ref so `start` can stay stable: a run is a point-in-time
 // snapshot and must not restart every time someone edits a quantity.
 const latest=useRef(state);
 latest.current=state;

 const start=useCallback(()=>{
  if(inFlight.current)return;
  inFlight.current=true;setBusy(true);setError('');
  void (async()=>{
   try{
    const result=await runAgent({state:latest.current});
    if(alive.current)setRun(result);
   }catch(e){
    if(alive.current)setError(e instanceof Error?e.message:'The price check could not be completed.');
   }finally{
    inFlight.current=false;
    if(alive.current)setBusy(false);
   }
  })();
 },[]);

 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 useEffect(()=>{if(ready&&!run&&!busy&&!error)start();},[ready,run,busy,error,start]);

 const perShopBudget=useMemo(()=>buildShopperModel(state).perShopBudget,[state]);

 // Re-total locally when a match is confirmed or withdrawn: no network, no
 // re-collection, and no chance of a shown figure drifting from its evidence.
 const baskets=useMemo<Basket[]>(()=>{
  if(!run)return [];
  return basketsFrom({
   state,perShopBudget,
   sources:run.sources.map(s=>({chainId:s.chainId,origin:s.origin,name:s.name,status:s.status})),
   offers:run.offers,
   proposals:new Map(run.proposals.map(p=>[`${p.itemId}::${p.sourceId}`,p])),
   unmatched:new Map(run.unmatched.map(u=>[u.itemId,u.reason])),
  });
 },[run,state,perShopBudget]);

 // A complete basket always beats a partial one; an incomplete basket is never
 // presented as the cheapest, only as the best-covered.
 const best=useMemo(()=>{
  if(!baskets.length)return null;
  const complete=baskets.filter(b=>b.complete);
  return (complete.length?complete:baskets)[0]??null;
 },[baskets]);

 const basketFor=useCallback((sourceId:string|null)=>
  sourceId?baskets.find(b=>b.sourceId===sourceId)??null:null,[baskets]);

 return {run,busy,error,baskets,best,perShopBudget,
  readable:run?run.sources.filter(s=>s.status==='ready').length:0,
  start,basketFor};
}

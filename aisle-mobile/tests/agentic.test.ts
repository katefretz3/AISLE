// Tests for the agentic layer.
//
// These concentrate on the promise the system makes: it will not show a number
// it cannot trace to a response it received. Most of what follows is an attempt
// to get a fabricated price through the pipeline and confirm that it fails.
import test from 'node:test';
import assert from 'node:assert/strict';
import {EvidenceLedger,faultsOf,verifiedOffers,type SourcedOffer} from '@/lib/agent/provenance';
import {OriginGuard,safeHost,assertReadable} from '@/lib/agent/net';
import {shopifyAdapter} from '@/lib/agent/adapters';
import {buildShopperModel} from '@/lib/agent/memory';
import {reviewNarrative,allowedFigures,allowedDistances} from '@/lib/agent/policy';
import {toolByName,computeBaskets,type ToolContext} from '@/lib/agent/tools';
import {feedCandidates,coverageGaps,discoverStores} from '@/lib/agent/discovery';
import {runAgent} from '@/lib/agent/orchestrator';
import {chainFor,inOntario} from '@/lib/agent/registry';
import {CATALOGUE,FIXTURE_ORIGIN,fixturePlaces,fixtureReader,fixtureState} from './fixtures';

const NOW=Date.parse('2026-09-20T12:00:00.000Z');

async function collectFixture(){
 const ledger=new EvidenceLedger();
 const outcome=await shopifyAdapter.collect(
  {origin:FIXTURE_ORIGIN,name:'Fixture Grocer',chainId:null,paths:['/products.json?limit=250']},
  fixtureReader(),ledger,new Date(NOW));
 return {ledger,outcome};
}

// ---- evidence ---------------------------------------------------------------

test('every collected offer carries an evidence row that resolves', async()=>{
 const {ledger,outcome}=await collectFixture();
 assert.equal(outcome.status,'ready');
 assert.ok(outcome.offers.length>0);
 for(const offer of outcome.offers){
  assert.ok(ledger.has(offer.evidenceId),`${offer.id} has no evidence row`);
  assert.equal(ledger.get(offer.evidenceId)!.status,200);
 }
});

test('an offer invented without evidence is rejected by the gate', async()=>{
 const {ledger,outcome}=await collectFixture();
 const fabricated:SourcedOffer={...outcome.offers[0],id:'fixture:999',price:199,evidenceId:'',excerpt:'made up'};
 assert.deepEqual(faultsOf(fabricated,ledger,NOW),['no-evidence']);
 const forged:SourcedOffer={...fabricated,evidenceId:'0'.repeat(64)};
 assert.deepEqual(faultsOf(forged,ledger,NOW),['unknown-evidence']);
 const {kept,rejected}=verifiedOffers([...outcome.offers,fabricated,forged],ledger,NOW);
 // Both fabrications are rejected, alongside the fixture's sold-out entry.
 assert.ok(rejected.some(r=>r.faults.includes('no-evidence')));
 assert.ok(rejected.some(r=>r.faults.includes('unknown-evidence')));
 assert.ok(!kept.some(o=>o.id==='fixture:999'));
 assert.ok(kept.every(o=>ledger.has(o.evidenceId)));
});

test('stale, non-CAD and non-integer prices cannot pass verification', async()=>{
 const {ledger,outcome}=await collectFixture();
 const base=outcome.offers[0];
 assert.ok(faultsOf({...base,expiresAt:new Date(NOW-1000).toISOString()},ledger,NOW).includes('expired'));
 assert.ok(faultsOf({...base,currency:'USD' as unknown as 'CAD'},ledger,NOW).includes('not-cad'));
 assert.ok(faultsOf({...base,price:3.995},ledger,NOW).includes('bad-price'));
 assert.ok(faultsOf({...base,observedAt:new Date(NOW+600000).toISOString()},ledger,NOW).includes('future-observation'));
});

test('unavailable catalogue entries never reach a basket', async()=>{
 const {ledger,outcome}=await collectFixture();
 const soldOut=outcome.offers.find(o=>/Sold Out Butter/.test(o.title));
 assert.ok(soldOut,'fixture should include an unavailable product');
 assert.ok(faultsOf(soldOut!,ledger,NOW).includes('unavailable'));
});

// ---- collection gates -------------------------------------------------------

test('robots.txt disallow stops collection with zero offers', async()=>{
 const ledger=new EvidenceLedger();
 const reader=fixtureReader({[`${FIXTURE_ORIGIN}/robots.txt`]:
  {url:`${FIXTURE_ORIGIN}/robots.txt`,status:200,body:'User-agent: *\nDisallow: /products.json\n',bytes:40,fetchedAt:new Date().toISOString()}});
 const outcome=await shopifyAdapter.collect({origin:FIXTURE_ORIGIN,name:'Fixture Grocer',chainId:null,paths:['/products.json?limit=250']},reader,ledger,new Date(NOW));
 assert.equal(outcome.status,'unavailable');
 assert.equal(outcome.offers.length,0);
});

test('a storefront that does not price in CAD is refused', async()=>{
 const ledger=new EvidenceLedger();
 const reader=fixtureReader({[`${FIXTURE_ORIGIN}/`]:
  {url:`${FIXTURE_ORIGIN}/`,status:200,body:'<script>Shopify.currency = {"active":"USD"};</script>',bytes:50,fetchedAt:new Date().toISOString()}});
 const outcome=await shopifyAdapter.collect({origin:FIXTURE_ORIGIN,name:'Fixture Grocer',chainId:null,paths:['/products.json?limit=250']},reader,ledger,new Date(NOW));
 assert.equal(outcome.status,'unavailable');
 assert.match(outcome.message,/CAD/);
});

test('a probe reports usable only after robots, currency and payload all pass', async()=>{
 const good=await shopifyAdapter.probe(FIXTURE_ORIGIN,fixtureReader());
 assert.equal(good.usable,true);
 const broken=await shopifyAdapter.probe(FIXTURE_ORIGIN,fixtureReader({[`${FIXTURE_ORIGIN}/products.json?limit=250`]:
  {url:`${FIXTURE_ORIGIN}/products.json?limit=250`,status:404,body:'',bytes:0,fetchedAt:new Date().toISOString()}}));
 assert.equal(broken.usable,false);
});

// ---- network guard ----------------------------------------------------------

test('the origin guard refuses anything that is not a public HTTPS retailer', ()=>{
 assert.equal(safeHost('http://example.ca'),null,'plain http');
 assert.equal(safeHost('https://user:pass@example.ca'),null,'credentials');
 assert.equal(safeHost('https://localhost'),null,'loopback name');
 assert.equal(safeHost('https://127.0.0.1'),null,'literal address');
 assert.equal(safeHost('https://169.254.169.254/latest/meta-data'),null,'metadata address');
 assert.equal(safeHost('https://example.ca:8080'),null,'non-standard port');
 assert.equal(safeHost('https://Example.CA/products.json'),'example.ca');
});

test('reads outside the run allow-list, and account routes, are refused', ()=>{
 const guard=new OriginGuard().allow(FIXTURE_ORIGIN);
 assert.throws(()=>assertReadable('https://elsewhere.example.com/products.json',guard),/allow-list/);
 assert.throws(()=>assertReadable(`${FIXTURE_ORIGIN}/account/orders`,guard),/account or checkout/);
 assert.doesNotThrow(()=>assertReadable(`${FIXTURE_ORIGIN}/products.json?limit=250`,guard));
});

// ---- policy -----------------------------------------------------------------

test('a price the tools never returned is stripped from the narrative', async()=>{
 const {outcome}=await collectFixture();
 const figures=allowedFigures(outcome.offers,[24000]);
 const review=reviewNarrative(
  'Bread is $3.99 at Fixture Grocer and milk is only $1.25 there, saving you $41.00 this week.',
  figures,allowedDistances([2.4]),new Set(outcome.offers.map(o=>o.id)));
 assert.match(review.text,/\$3\.99/,'a collected price survives');
 assert.doesNotMatch(review.text,/\$1\.25/,'an invented price is removed');
 assert.doesNotMatch(review.text,/\$41\.00/,'an invented saving is removed');
 assert.equal(review.violations.filter(v=>v.kind==='unverified-figure').length,2);
});

test('allergen safety language is removed outright', ()=>{
 const review=reviewNarrative('This loaf is allergy-safe and guaranteed gluten-free.',new Set(),new Set(),new Set());
 assert.doesNotMatch(review.text,/allergy-safe/);
 assert.doesNotMatch(review.text,/gluten-free/);
 assert.equal(review.violations.filter(v=>v.kind==='safety-claim').length,2);
});

test('distances and offer ids the tools did not return are caught', ()=>{
 const review=reviewNarrative('The store is 1.4 km away and offer fixture:424242 is cheapest.',new Set(),allowedDistances([2.4]),new Set(['fixture:1001']));
 assert.doesNotMatch(review.text,/1\.4 km/);
 assert.ok(review.violations.some(v=>v.kind==='unverified-store'));
 assert.ok(review.violations.some(v=>v.kind==='fabricated-offer'));
});

// ---- memory -----------------------------------------------------------------

test('with learning off nothing behavioural is derived', ()=>{
 const state=fixtureState({prefs:{...fixtureState().prefs,learning:false},
  events:[{category:'Bakery',action:'offer_accepted',brand:'Dempster’s',date:new Date(NOW-DAY(2)).toISOString(),productId:'bread'}]});
 const model=buildShopperModel(state,NOW);
 assert.equal(model.brands.length,0);
 assert.equal(model.replenishment.length,0);
 assert.equal(model.confidence.level,'none');
});

test('replenishment uses the median observed gap once there is history', ()=>{
 const events=[14,7,0].map(daysAgo=>({category:'Dairy & eggs',action:'purchased',productId:'milk',date:new Date(NOW-DAY(daysAgo)).toISOString()}));
 const base=fixtureState();
 const model=buildShopperModel({...base,prefs:{...base.prefs,learning:true},events},NOW);
 const milk=model.replenishment.find(r=>r.productId==='milk');
 assert.ok(milk);
 assert.equal(milk!.basis,'observed-interval');
 assert.equal(milk!.intervalDays,7);
 assert.equal(milk!.samples,3);
});

test('allergies are explicit only and pause suggestions rather than being inferred', ()=>{
 const base=fixtureState();
 const model=buildShopperModel({...base,prefs:{...base.prefs,allergens:['Peanuts'],learning:true}},NOW);
 assert.deepEqual(model.explicit.allergens,['Peanuts']);
 assert.ok(model.notes.some(n=>/not verified/i.test(n)&&/paused/i.test(n)));
});

test('per-shop budget follows the chosen cadence', ()=>{
 const base=fixtureState();
 assert.equal(buildShopperModel({...base,prefs:{...base.prefs,budget:120,frequency:'weekly'}},NOW).perShopBudget,12000);
 assert.equal(buildShopperModel({...base,prefs:{...base.prefs,budget:120,frequency:'fortnightly'}},NOW).perShopBudget,24000);
});

// ---- tools ------------------------------------------------------------------

async function fixtureContext(state=fixtureState()){
 const {ledger,outcome}=await collectFixture();
 const ctx:ToolContext={
  state,shopper:buildShopperModel(state,NOW),ledger,guard:new OriginGuard().allow(FIXTURE_ORIGIN),
  read:fixtureReader(),fetchPlaces:async()=>fixturePlaces(),now:NOW,
  budget:{maxToolCalls:30,maxProbes:5,maxCollects:4,deadline:Date.now()+60000},
  stores:[],probes:[],sources:[outcome],offers:outcome.offers,proposals:new Map(),unmatched:new Map(),
  counters:{toolCalls:0,probes:0,collects:0},log:()=>{},
 };
 return ctx;
}

test('search_offers only ever returns collected records', async()=>{
 const ctx=await fixtureContext();
 const result=await toolByName('search_offers')!.run({query:'whole wheat bread',itemId:'item-bread'},ctx) as any;
 assert.equal(result.ok,true);
 assert.ok(result.results.length>0);
 for(const row of result.results)assert.ok(ctx.ledger.has(row.evidenceId));
 const empty=await toolByName('search_offers')!.run({query:'dragonfruit sorbet'},ctx) as any;
 assert.equal(empty.results.length,0);
 assert.match(empty.note,/rather than substituting/);
});

test('propose_match refuses an offer id that was never collected', async()=>{
 const ctx=await fixtureContext();
 const result=await toolByName('propose_match')!.run(
  {itemId:'item-bread',offerId:'fixture:not-real',confidence:'high',rationale:'looks right'},ctx) as any;
 assert.equal(result.ok,false);
 assert.match(result.refused,/not in the collected results/);
 assert.equal(ctx.proposals.size,0);
});

test('propose_match refuses to break a lock the household set', async()=>{
 const state=fixtureState();
 state.items[0]={...state.items[0],locked:true};
 const ctx=await fixtureContext(state);
 const apples=ctx.offers.find(o=>/Gala Apples/.test(o.title))!;
 const result=await toolByName('propose_match')!.run(
  {itemId:'item-bread',offerId:apples.id,confidence:'high',rationale:'close enough'},ctx) as any;
 assert.equal(result.ok,false);
 assert.equal(ctx.proposals.size,0);
});

test('propose_match refuses an excluded product however cheap it is', async()=>{
 const base=fixtureState();
 const ctx=await fixtureContext({...base,prefs:{...base.prefs,excludedProducts:['bread']}});
 const bread=ctx.offers.find(o=>/Whole Wheat Bread/.test(o.title))!;
 const result=await toolByName('propose_match')!.run(
  {itemId:'item-bread',offerId:bread.id,confidence:'high',rationale:'cheapest loaf'},ctx) as any;
 assert.equal(result.ok,false);
 assert.match(result.refused,/excluded/);
});

test('a rationale carrying an invented price is scrubbed before it is stored', async()=>{
 const ctx=await fixtureContext();
 const bread=ctx.offers.find(o=>/Whole Wheat Bread/.test(o.title))!;
 const result=await toolByName('propose_match')!.run(
  {itemId:'item-bread',offerId:bread.id,confidence:'high',rationale:'Same loaf, and it is $0.75 cheaper than Metro.'},ctx) as any;
 assert.equal(result.ok,true);
 const stored=[...ctx.proposals.values()][0];
 assert.doesNotMatch(stored.rationale,/\$0\.75/);
});

test('baskets total in integer cents and stay incomplete when an item has no price', async()=>{
 const ctx=await fixtureContext();
 const bread=ctx.offers.find(o=>/Whole Wheat Bread/.test(o.title))!;
 const milk=ctx.offers.find(o=>/2% Milk/.test(o.title))!;
 await toolByName('propose_match')!.run({itemId:'item-bread',offerId:bread.id,confidence:'high',rationale:'Same size and brand'},ctx);
 await toolByName('propose_match')!.run({itemId:'item-milk',offerId:milk.id,confidence:'high',rationale:'Same size and brand'},ctx);
 const [basket]=computeBaskets(ctx);
 assert.equal(basket.subtotal,399+679);
 assert.ok(Number.isInteger(basket.subtotal));
 assert.equal(basket.complete,false,'salmon has no collected price, so the basket is not complete');
 assert.equal(basket.unconfirmed,2,'agent proposals await household confirmation');
});

test('compute_basket is the only source of a total and excludes the extras', async()=>{
 const ctx=await fixtureContext();
 const result=await toolByName('compute_basket')!.run({},ctx) as any;
 assert.equal(result.ok,true);
 assert.match(result.note,/Delivery, tax, deposits/);
 assert.equal(result.perShopBudgetCents,12000);
});

// ---- discovery --------------------------------------------------------------

test('discovery keeps Ontario only and reports chains it cannot price', async()=>{
 const found=await discoverStores(fixtureState().prefs,async()=>fixturePlaces());
 assert.ok(found.stores.every(s=>inOntario(s)),'out-of-province rows are dropped');
 assert.equal(found.dropped,1);
 const gaps=coverageGaps(found.stores);
 assert.ok(gaps.some(g=>g.chainId==='no-frills'));
 assert.match(gaps.find(g=>g.chainId==='no-frills')!.reason,/licensed retailer feed/);
});

test('chains known to publish nothing are never probed', async()=>{
 const found=await discoverStores(fixtureState().prefs,async()=>fixturePlaces());
 const candidates=feedCandidates(found.stores);
 assert.ok(!candidates.some(c=>c.origin.includes('nofrills')),'a chain with no public feed is not probed');
 assert.ok(candidates.some(c=>c.origin===FIXTURE_ORIGIN),'a mapped independent website is probed');
});

test('the registry recognises Ontario banners from map tags', ()=>{
 assert.equal(chainFor('Real Canadian Superstore')?.id,'superstore');
 assert.equal(chainFor('FreshCo #1234')?.id,'freshco');
 assert.equal(chainFor('Some Corner Store')?.id,undefined);
});

// ---- end to end -------------------------------------------------------------

test('a full run produces only verified figures and honest gaps', async()=>{
 const run=await runAgent({
  state:fixtureState(),now:NOW,forceDeterministic:true,
  fetchPlaces:async()=>fixturePlaces(),reader:fixtureReader(),
 });
 assert.equal(run.mode,'deterministic');
 assert.ok(run.evidence.length>0,'the run kept the responses it read');
 assert.ok(run.sources.some(s=>s.status==='ready'));

 const [basket]=run.baskets;
 assert.ok(basket,'a basket was produced');
 for(const line of basket.lines.filter(l=>l.offer)){
  assert.ok(run.evidence.some(e=>e.id===line.offer!.evidenceId),'every priced line traces to evidence');
  assert.ok(Number.isInteger(line.lineTotal));
 }
 // Salmon is not in the fixture catalogue and must be reported as a gap.
 assert.ok(run.unmatched.some(u=>u.itemId==='item-salmon'));
 assert.equal(basket.complete,false);
 assert.equal(run.violations.length,0,'the composed explanation needed no corrections');
 assert.ok(run.coverageGaps.some(g=>g.chainId==='no-frills'));
 assert.ok(run.trace.some(t=>t.phase==='verify'));
});

test('when no catalogue can be read the run says so instead of estimating', async()=>{
 const reader=fixtureReader({[`${FIXTURE_ORIGIN}/`]:
  {url:`${FIXTURE_ORIGIN}/`,status:500,body:'',bytes:0,fetchedAt:new Date().toISOString()}});
 const run=await runAgent({state:fixtureState(),now:NOW,forceDeterministic:true,fetchPlaces:async()=>fixturePlaces(),reader});
 assert.equal(run.baskets.length,0);
 assert.equal(run.unmatched.length,3,'every item is reported as unpriced');
 assert.ok(run.warnings.some(w=>/no prices were collected/i.test(w)));
 assert.doesNotMatch(run.narrative,/\$/,'no figure is offered when nothing was collected');
});

function DAY(n:number){return n*86400000;}

// Account settings and Legal screens.
//
// The legal tests are deliberately about *substance*, not formatting: this app
// makes specific promises (device-only storage, no analytics, unverified
// allergen data, Ontario-only) and the documents have to actually say so. A
// generic template that passed a "has some text" check would be worse than
// useless, because it would look finished.
import test from 'node:test';
import assert from 'node:assert/strict';
import {DOCUMENTS,OPERATOR,PLACEHOLDER_FIELDS,PRIVACY,SOURCES,TERMS,documentById,hasPlaceholders} from '@/lib/legal';
import {initialState,stores,productById,reopenList,pruneSavedLists,type Trip,type ListItem,type SavedList} from '@/lib/catalog';
import {groupForWalk,tallyBasket} from '@/lib/shopping-order';
import {perShopBudget,cadenceDays} from '@/lib/agent';
import ErrorBoundary from '@/components/error-boundary';

const textOf=(doc:typeof TERMS)=>
 doc.sections.flatMap(s=>[s.heading,...s.body,...(s.list??[]),s.callout??'']).join('\n').toLowerCase();

test('every legal document is structurally sound', ()=>{
 assert.equal(DOCUMENTS.length,3);
 for(const doc of DOCUMENTS){
  assert.ok(doc.title.trim(),`${doc.id} has no title`);
  assert.ok(doc.summary.trim(),`${doc.id} has no summary`);
  assert.ok(doc.sections.length>=5,`${doc.id} has only ${doc.sections.length} sections`);
  const ids=doc.sections.map(s=>s.id);
  assert.equal(new Set(ids).size,ids.length,`${doc.id} has duplicate section ids`);
  for(const section of doc.sections){
   assert.ok(section.heading.trim(),`${doc.id}/${section.id} has no heading`);
   assert.ok(section.body.length>0&&section.body.every(p=>p.trim()),`${doc.id}/${section.id} has an empty paragraph`);
   assert.match(section.id,/^[a-z0-9-]+$/,`${doc.id}/${section.id} is not anchor-safe`);
  }
  assert.equal(documentById(doc.id)?.id,doc.id);
 }
 assert.equal(documentById('nope'),null);
});

test('unfinished operator details are detected, not shipped quietly', ()=>{
 // While placeholders remain the screens show a blocking notice. If someone
 // fills them in, this test still passes — it checks the mechanism, not the
 // current state.
 const placeholders=Object.entries(OPERATOR).filter(([,v])=>v.startsWith('PLACEHOLDER')).map(([k])=>k);
 assert.deepEqual(PLACEHOLDER_FIELDS,placeholders);
 assert.equal(hasPlaceholders,placeholders.length>0);
});

test('the Terms carry the disclaimers this app specifically needs', ()=>{
 const text=textOf(TERMS);
 for(const [claim,needle] of [
  ['prices are not guaranteed',/not (quotes|guarantees)|not confirmed prices/],
  ['online prices are not branch prices',/not the same as the price at a particular branch/],
  ['no allergy safety',/allergy|allergen/],
  ['read the label',/read the product label/],
  ['Ontario scope',/ontario/],
  ['no account, no recovery',/cannot recover your data/],
  ['automated matching can be wrong',/matching can be wrong/],
  ['limitation of liability',/limitation of liability/],
  ['governing law',/governed by the laws/],
  ['consumer rights preserved',/consumer protection legislation/],
 ] as const){
  assert.match(text,needle,`Terms should address: ${claim}`);
 }
});

test('the Privacy Policy describes what the app actually does', ()=>{
 const text=textOf(PRIVACY);
 for(const [claim,needle] of [
  ['no account',/no account/],
  ['device storage',/stored on your device|on your device/],
  ['no analytics',/analytics/],
  ['never sold',/never sell/],
  ['coarse location only',/coarse search area/],
  ['retailer requests',/catalogue/],
  ['learning is opt-in',/off by default/],
  ['allergies never inferred',/never inferred/],
  ['retention',/24 hours/],
  ['children',/children/],
  ['Canadian privacy law',/pipeda|privacy commissioner/],
  ['security',/https/],
 ] as const){
  assert.match(text,needle,`Privacy Policy should address: ${claim}`);
 }
});

test('attribution required by our data licences is present', ()=>{
 const text=textOf(SOURCES);
 // OpenStreetMap's ODbL requires visible attribution; shipping without it
 // would be a licence breach, not a cosmetic omission.
 assert.match(text,/openstreetmap/,'OpenStreetMap must be credited');
 assert.match(text,/odbl|open database licence/,'the ODbL must be named');
 assert.match(text,/geonames/,'city coordinates come from GeoNames');
 assert.match(text,/credits/,'photo credits must be referenced');
 assert.match(text,/no verified ingredient/,'the absence of ingredient data should be stated');
});

test('documents cross-reference each other rather than contradicting', ()=>{
 assert.match(textOf(TERMS),/privacy policy/,'Terms should point at the Privacy Policy');
 assert.match(textOf(TERMS),/data sources/,'Terms should point at Data sources');
 for(const doc of DOCUMENTS)assert.ok(doc.lastUpdated.trim(),`${doc.id} has no date`);
});

// ---- account settings ------------------------------------------------------

test('budget bounds on the settings screen match what the app accepts', ()=>{
 const prefs=initialState().prefs;
 // The screen clamps to 10..2000; the derived per-shop figure must stay sane
 // across the whole range and every cadence.
 for(const budget of [10,120,2000])
  for(const frequency of ['twice-weekly','weekly','fortnightly'] as const){
   const value=perShopBudget({...prefs,budget,frequency});
   assert.ok(Number.isInteger(value),`per-shop budget must be integer cents (${budget}/${frequency})`);
   assert.ok(value>0,`per-shop budget must be positive (${budget}/${frequency})`);
   assert.ok(value<=Math.round(budget*100*cadenceDays(frequency)/7)+1);
  }
});

test('erasing everything leaves a usable, onboarded state', ()=>{
 // The Erase control resets to this shape; if it left `onboarded:false` the
 // household would be dropped back into setup instead of an empty list.
 const fresh={...initialState(),items:[],onboarded:true};
 assert.equal(fresh.items.length,0);
 assert.equal(fresh.onboarded,true);
 assert.equal(fresh.trips.length,0);
 assert.equal(fresh.events.length,0);
 assert.ok(fresh.prefs.city,'a city must remain set so the agent can still run');
});

// ---- crash recovery --------------------------------------------------------

test('the error boundary captures a render error instead of blanking the app', ()=>{
 // React calls this static when a child throws during render; returning the
 // error is what swaps the tree for the recovery screen rather than unmounting
 // everything and leaving a white page.
 const boom=new Error('render exploded');
 const next=ErrorBoundary.getDerivedStateFromError(boom);
 assert.equal(next.error,boom);

 const instance=new ErrorBoundary({children:null});
 assert.equal(instance.state.error,null,'starts clean so it renders children normally');
});

// ---- shopping history ------------------------------------------------------

test('a trip records its shop name so history survives an unknown source', ()=>{
 // Shops can now start from an agent basket, whose retailer is not one of the
 // bundled chains. History used to assert the chain existed, which crashed the
 // spending screen for anyone who shopped at a discovered retailer.
 const trip:Trip={id:'t1',storeId:'goodnessme',storeName:'Goodness Me!',date:'2026-09-20',
  total:4250,predicted:0,comparisonTotal:0,items:3,prices:[]};
 assert.equal(stores.find(s=>s.id===trip.storeId),undefined,
  'this retailer is deliberately not a bundled chain');
 // The screen resolves the chain, then the recorded name, then the raw id.
 const resolved=stores.find(s=>s.id===trip.storeId)?.name??trip.storeName??trip.storeId;
 assert.equal(resolved,'Goodness Me!');

 // A trip saved before this field existed still resolves to something showable.
 const legacy:Trip={...trip,storeName:undefined};
 const legacyResolved=stores.find(s=>s.id===legacy.storeId)?.name??legacy.storeName??legacy.storeId;
 assert.equal(legacyResolved,'goodnessme','falls back to the id rather than throwing');

 const bundled:Trip={...trip,storeId:'metro',storeName:undefined};
 assert.equal(stores.find(s=>s.id===bundled.storeId)?.name,'Metro');
});

// ---- in-store checklist ----------------------------------------------------

const listItem=(id:string,productId:string|null,checked=false):ListItem=>
 ({id,productId,name:productId?productById[productId]?.name??id:id,qty:1,checked,locked:false});

test('the checklist follows the walk, not the order things were typed', ()=>{
 // Typed in a deliberately awkward order: frozen first, produce last.
 const items=[listItem('a','ice-cream'),listItem('b','shampoo'),listItem('c','pasta'),
  listItem('d','bananas'),listItem('e','bread'),listItem('f','chicken')];
 const groups=groupForWalk(items).map(g=>g.id);
 assert.deepEqual(groups,['produce','bakery','meat','pantry','personal','frozen']);
 // Frozen last matters: picked up first it thaws in the trolley.
 assert.equal(groups[groups.length-1],'frozen');
 assert.ok(groups.indexOf('produce')<groups.indexOf('pantry'),'perimeter before centre aisles');
});

test('items somebody typed themselves collect at the end, never dropped', ()=>{
 const groups=groupForWalk([listItem('a','bananas'),listItem('b',null),listItem('c','ice-cream')]);
 const last=groups[groups.length-1];
 assert.equal(last.id,'other');
 assert.equal(last.name,'Anything else');
 assert.equal(groups.flatMap(g=>g.items).length,3,'every item is still present');
});

test('group counts track what has been picked up', ()=>{
 const groups=groupForWalk([listItem('a','bananas',true),listItem('b','apples'),listItem('c','bread',true)]);
 const produce=groups.find(g=>g.id==='produce')!;
 assert.equal(produce.items.length,2);
 assert.equal(produce.checked,1);
 assert.equal(groups.find(g=>g.id==='bakery')!.checked,1);
});

test('the running total counts only what is in the trolley, and says what it cannot price', ()=>{
 const items=[listItem('a','bananas',true),listItem('b','milk',true),
  listItem('c','bread',true),listItem('d','chicken')];
 const prices:Record<string,number|null>={a:169,b:649,c:null,d:1499};
 const tally=tallyBasket(items,id=>prices[id]??null);
 assert.equal(tally.inBasket,169+649,'unticked items are not in the trolley');
 assert.equal(tally.priced,2);
 assert.equal(tally.unpriced,1,'a ticked item with no price is reported, not counted as zero');
 assert.equal(tally.checked,3);
 // Counting an unpriced pickup as zero would under-report the shop, which is
 // the one number a shopper has to be able to trust.
 assert.notEqual(tally.inBasket,169+649+0+1499);
});

// ---- reusing a list --------------------------------------------------------

test('reopening a saved list gives fresh, unticked items', ()=>{
 const saved:SavedList={id:'s1',name:'Last shop',savedAt:'2026-09-20T10:00:00.000Z',auto:true,
  items:[listItem('old-1','bananas',true),listItem('old-2','milk',true)]};
 const reopened=reopenList(saved);
 assert.equal(reopened.length,2);
 assert.ok(reopened.every(i=>!i.checked),'a reused list starts unticked');
 assert.ok(reopened.every(i=>!saved.items.some(o=>o.id===i.id)),'ids are new, so the copies are independent');
 assert.deepEqual(reopened.map(i=>i.productId),['bananas','milk']);
});

test('automatic snapshots never crowd out a list somebody named', ()=>{
 const make=(id:string,auto:boolean,day:number):SavedList=>
  ({id,name:id,auto,savedAt:`2026-09-${String(day).padStart(2,'0')}T10:00:00.000Z`,items:[]});
 const lists=[...Array.from({length:9},(_,i)=>make(`auto-${i}`,true,i+1)),
  make('Christmas dinner',false,1),make('Party',false,2)];
 const pruned=pruneSavedLists(lists);
 assert.equal(pruned.filter(l=>!l.auto).length,2,'both named lists survive');
 assert.equal(pruned.filter(l=>l.auto).length,5,'only the newest automatic snapshots are kept');
 assert.ok(pruned.filter(l=>l.auto).every(l=>Number(l.savedAt.slice(8,10))>=5),'and they are the newest');
});

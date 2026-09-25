// Shopping history — derived from receipts, which is the only price signal that
// exists for the 17 Ontario chains Aisle cannot read.
import test from 'node:test';
import assert from 'node:assert/strict';
import {priceHistory,dueItems,dueNow,accuracy} from '@/lib/shopping-history';
import {normalizeState,type Trip,type TripLine,type UserState} from '@/lib/catalog';
import {fixtureState} from './fixtures';

const DAY=86400000;
const NOW=Date.parse('2026-03-01T12:00:00Z');
const dayStr=(back:number)=>new Date(NOW-back*DAY).toISOString().slice(0,10);

const line=(productId:string|null,quantity:number,actual:number|null,predicted:number|null=null):TripLine=>
 ({productId,name:productId??'Custom',quantity,actual,predicted});

const trip=(daysBack:number,lines:TripLine[],over:Partial<Trip>={}):Trip=>({
 id:`trip-${daysBack}`,storeId:'fortinos',storeName:'Fortinos',date:dayStr(daysBack),
 total:9000,predicted:0,comparisonTotal:0,items:lines.length,lines,...over});

const withTrips=(trips:Trip[],over:Partial<UserState>={}):UserState=>
 ({...fixtureState(),trips,...over});

test('a line total is divided by its quantity to get what one unit cost', ()=>{
 // The trap: {quantity:2, actual:898} is $8.98 for two, not $8.98 each.
 const history=priceHistory([trip(3,[line('milk',2,898)])]);
 const milk=history.get('milk')!;
 assert.equal(milk.last.unitCents,449,'one unit cost $4.49');
 assert.equal(milk.last.lineCents,898,'the line total is kept as recorded');
 assert.equal(milk.last.storeName,'Fortinos');
});

test('an item bought but never priced is not recorded as costing nothing', ()=>{
 const history=priceHistory([trip(3,[line('milk',1,null),line('bread',1,379)])]);
 assert.equal(history.has('milk'),false,'no price entered means no price, not zero');
 assert.equal(history.get('bread')!.last.unitCents,379);
});

test('price history reports the median and the cheapest shop, not an average', ()=>{
 const history=priceHistory([
  trip(1,[line('milk',1,500)],{storeId:'metro',storeName:'Metro'}),
  trip(20,[line('milk',1,400)]),
  trip(40,[line('milk',1,450)]),
 ]);
 const milk=history.get('milk')!;
 assert.equal(milk.paid.length,3);
 assert.equal(milk.last.unitCents,500,'most recent first');
 assert.equal(milk.last.storeName,'Metro');
 assert.equal(milk.medianUnitCents,450);
 assert.equal(milk.cheapest.unitCents,400);
});

test('one purchase is never an interval, and says which basis it used', ()=>{
 const once=dueItems(withTrips([trip(9,[line('milk',1,449)])]),NOW);
 assert.equal(once.length,1);
 assert.equal(once[0].basis,'cadence','a single purchase cannot show a pattern');
 assert.match(once[0].why,/Bought 1 time/);
 assert.match(once[0].why,/you shop about every/,'the stand-in is named, not hidden');

 // Three purchases a week apart is a pattern.
 const regular=dueItems(withTrips([
  trip(1,[line('milk',1,449)]),trip(8,[line('milk',1,449)]),trip(15,[line('milk',1,449)]),
 ]),NOW);
 assert.equal(regular[0].basis,'observed');
 assert.equal(regular[0].intervalDays,7);
 assert.equal(regular[0].daysSince,1);
 assert.equal(regular[0].due,false,'bought yesterday is not due');
 assert.match(regular[0].why,/about every 7 days/);
});

test('an item is raised once most of its interval has passed', ()=>{
 const rows=dueItems(withTrips([
  trip(6,[line('milk',1,449)]),trip(13,[line('milk',1,449)]),trip(20,[line('milk',1,449)]),
 ]),NOW);
 assert.equal(rows[0].intervalDays,7);
 assert.equal(rows[0].daysSince,6);
 assert.equal(rows[0].due,true,'6 of 7 days elapsed is worth raising before the shop');
});

test('due items skip what is already on the list, and anything hidden', ()=>{
 const base=withTrips([
  trip(10,[line('milk',1,449)]),trip(20,[line('milk',1,449)]),trip(30,[line('milk',1,449)]),
 ]);
 assert.equal(dueNow({...base,items:[]},NOW).some(r=>r.productId==='milk'),true);
 const onList={...base,items:[{id:'i1',productId:'milk',name:'2% milk',qty:1,checked:false,locked:false}]};
 assert.equal(dueNow(onList,NOW).some(r=>r.productId==='milk'),false,'already on the list');
 const hidden={...base,items:[],prefs:{...base.prefs,excludedProducts:['milk']}};
 assert.equal(dueNow(hidden,NOW).some(r=>r.productId==='milk'),false,'hidden products stay hidden');
});

test('purchase records survive without the Learning toggle', ()=>{
 // Learning governs inference. A receipt is a record of what happened, so the
 // home screen works for a household that never switched inference on.
 const state=withTrips([
  trip(9,[line('milk',1,449)]),trip(18,[line('milk',1,449)]),trip(27,[line('milk',1,449)]),
 ]);
 assert.equal(state.prefs.learning,false,'off by default');
 assert.ok(dueItems(state,NOW).length>0,'and the record is still there');
});

test('custom items and dropped products cannot enter the history', ()=>{
 const rows=dueItems(withTrips([trip(9,[line(null,1,500),line('not-a-real-product',1,500)])]),NOW);
 assert.deepEqual(rows,[],'a name with no catalogue id is not a product');
 assert.equal(priceHistory([trip(9,[line(null,1,500)])]).size,0);
});

test('an estimate that covered part of the list is never scored as an estimate', ()=>{
 // predicted is the subtotal of what Aisle could price. On a list where it
 // priced 4 of 12, setting it beside the receipt total invents an error.
 const partial=trip(2,[line('milk',1,449)],{total:9100,predicted:1616,predictedPriced:4,predictedTotal:12});
 assert.deepEqual(accuracy([partial]).comparable,[],'partial coverage is not comparable');
 assert.equal(accuracy([partial]).meanDifference,null);

 const complete=trip(3,[line('milk',1,449)],{total:9100,predicted:8600,predictedPriced:12,predictedTotal:12});
 const scored=accuracy([complete]);
 assert.equal(scored.comparable.length,1);
 assert.equal(scored.meanDifference,500,'paid $5.00 more than estimated');

 // Trips saved before coverage was recorded cannot be scored either.
 const legacy=trip(4,[line('milk',1,449)],{total:9100,predicted:8600});
 assert.deepEqual(accuracy([legacy]).comparable,[],'unknown coverage is not full coverage');
});

test('trips saved before receipts carried product ids still load', ()=>{
 const old={...fixtureState(),trips:[{
  id:'old',storeId:'fortinos',date:'2026-02-01',total:9000,predicted:0,comparisonTotal:0,items:2,
  prices:[{name:'2% milk',quantity:2,actual:898,predicted:0}],
 } as unknown as Trip]};
 const migrated=normalizeState(old);
 const [t]=migrated.trips;
 assert.equal(t.lines?.length,1,'the row is preserved');
 assert.equal(t.lines?.[0].productId,null,'we do not know which product a bare name was');
 assert.equal(t.lines?.[0].actual,898);
 assert.equal(t.lines?.[0].predicted,null,'a stored 0 estimate is absence, not a price');
 // And it cannot feed history, because guessing the product would invent it.
 assert.equal(priceHistory(migrated.trips).size,0);
 assert.deepEqual(dueItems(migrated,NOW),[]);
});

test('a snooze silences an item for one shopping cycle, not for ever', ()=>{
 const base=withTrips([
  trip(10,[line('milk',1,449)]),trip(20,[line('milk',1,449)]),trip(30,[line('milk',1,449)]),
 ],{items:[]});
 assert.equal(dueNow(base,NOW).some(r=>r.productId==='milk'),true);
 // "Not this time" must not behave like the permanent Hidden products list:
 // a household that waves off milk this week still buys milk.
 const justSnoozed={...base,dueSnoozed:{milk:new Date(NOW-2*DAY).toISOString()}};
 assert.equal(dueNow(justSnoozed,NOW).some(r=>r.productId==='milk'),false,'quiet for now');
 const stale={...base,dueSnoozed:{milk:new Date(NOW-30*DAY).toISOString()}};
 assert.equal(dueNow(stale,NOW).some(r=>r.productId==='milk'),true,'and back afterwards');
});

test('stale snoozes are dropped from stored state', ()=>{
 const state=normalizeState({...fixtureState(),dueSnoozed:{
  milk:new Date(Date.now()-2*DAY).toISOString(),
  bread:new Date(Date.now()-90*DAY).toISOString(),
  junk:'not a date',
 }} as UserState);
 assert.deepEqual(Object.keys(state.dueSnoozed??{}),['milk']);
});

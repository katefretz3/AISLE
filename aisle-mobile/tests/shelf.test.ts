// In-store price capture. Self-reported, and never laundered into evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {recordShelfPrice,latestShelfPrice,shelfLineTotal,resolveLinePrice,
 tallyProvenance,isStale,shelfPriceAgeDays,expectedPackLabel,removeShelfPrice,referencedPhotoIds} from '@/lib/shelf-prices';
import {normalizeState,pruneShelfPrices,type ListItem,type ShelfPrice,type UserState} from '@/lib/catalog';
import {faultsOf,EvidenceLedger} from '@/lib/agent';
import {scaledSize,orphanPhotoIds,photoRejection,MAX_PHOTO_EDGE,TARGET_PHOTO_BYTES} from '@/lib/photo';
import {fixtureState} from './fixtures';

const DAY=86400000;
const NOW=Date.parse('2026-03-01T12:00:00Z');
const item=(productId:string|null,qty=1,name='Whole wheat bread'):ListItem=>
 ({id:'i1',productId,name,qty,checked:false,locked:false});

const capture=(state:UserState,over:Partial<Parameters<typeof recordShelfPrice>[1]>={},now=NOW)=>
 recordShelfPrice(state,{item:item('bread'),storeId:'metro',storeName:'Metro',
  priceCents:449,packLabel:'675 g',...over},now);

test('a captured price is recorded against the pack the label was for', ()=>{
 const state=capture(fixtureState());
 const row=state.shelfPrices![0];
 assert.equal(row.priceCents,449);
 assert.deepEqual(row.pack,{amount:675,unit:'g',label:'675 g'});
 assert.equal(row.storeName,'Metro');
 assert.equal(row.productId,'bread');
});

test('seeing a different size than your list is recorded as that size', ()=>{
 // The whole point of capture: the shelf has a 450 g loaf, your list says 675 g.
 // Filing it under 675 g would understate the unit price by a third.
 const state=capture(fixtureState(),{priceCents:329,packLabel:'450 g'});
 assert.deepEqual(state.shelfPrices![0].pack,{amount:450,unit:'g',label:'450 g'});
 // And the line total buys enough to cover the quantity asked for.
 const total=shelfLineTotal(state.shelfPrices![0],item('bread',1));
 assert.equal(total,658,'two 450 g loaves cover one 675 g line');
});

test('a price with no stated pack is recorded as unknown, not assumed', ()=>{
 const state=capture(fixtureState(),{packLabel:''});
 assert.equal(state.shelfPrices![0].pack,null);
 assert.equal(state.shelfPrices![0].packLabel,'not stated');
});

test('a shelf price in a unit that cannot be compared gives no line total', ()=>{
 const millilitres:ShelfPrice={id:'x',productId:'bread',itemName:'Whole wheat bread',storeId:'metro',
  storeName:'Metro',priceCents:449,pack:{amount:500,unit:'ml'},packLabel:'500 mL',
  observedAt:new Date(NOW).toISOString()};
 assert.equal(shelfLineTotal(millilitres,item('bread')),null,'mL against a gram line is not convertible');
 const free={...millilitres,priceCents:0};
 assert.equal(shelfLineTotal(free,item('bread')),null,'a zero price is not a price');
});

test('the price you saw in the shop you are in beats a newer one elsewhere', ()=>{
 let state=capture(fixtureState(),{priceCents:449},NOW-5*DAY);           // Metro, older
 state=capture(state,{storeId:'fortinos',storeName:'Fortinos',priceCents:519},NOW); // newer, elsewhere
 assert.equal(latestShelfPrice(state,'bread','metro')!.priceCents,449,'prices compare within a shop');
 assert.equal(latestShelfPrice(state,'bread','fortinos')!.priceCents,519);
 assert.equal(latestShelfPrice(state,'bread')!.priceCents,519,'with no shop, the newest wins');
 assert.equal(latestShelfPrice(state,'milk','metro'),null);
 assert.equal(latestShelfPrice(state,null,'metro'),null,'an unmatched item has no history');
});

test('a collected price always outranks one somebody typed', ()=>{
 const state=capture(fixtureState());
 const withCollected=resolveLinePrice(item('bread'),379,state,'metro');
 assert.equal(withCollected!.source,'collected');
 assert.equal(withCollected!.cents,379,'the evidence-backed figure is used');
 const withoutCollected=resolveLinePrice(item('bread'),null,state,'metro');
 assert.equal(withoutCollected!.source,'observed');
 assert.equal(withoutCollected!.cents,449);
 assert.equal(withoutCollected!.shelf!.storeName,'Metro');
 assert.equal(resolveLinePrice(item('milk'),null,state,'metro'),null,'nothing to fall back on');
});

test('a total made of both kinds reports what it is made of', ()=>{
 const state=capture(fixtureState());
 const items=[item('bread'),{...item('milk'),id:'i2',name:'2% milk'},{...item('eggs'),id:'i3',name:'Large eggs'}];
 const collected=new Map([['i2',699]]);
 const tally=tallyProvenance(items,i=>resolveLinePrice(i,collected.get(i.id)??null,state,'metro'));
 assert.deepEqual(tally,{collected:1,observed:1,unpriced:1});
});

test('a shelf price can never pass the evidence gate', ()=>{
 // The architectural line: everything in a basket subtotal traces to an HTTP
 // response. A self-reported price has no evidence row, so if one were ever
 // cast into an offer it must be rejected rather than quietly accepted.
 const state=capture(fixtureState());
 const row=state.shelfPrices![0];
 const ledger=new EvidenceLedger();
 const asOffer={
  id:'shelf',sourceId:'metro',retailer:'Metro',title:row.itemName,brand:'',url:'',
  price:row.priceCents,currency:'CAD' as const,pack:null,available:true,
  observedAt:row.observedAt,expiresAt:new Date(NOW+DAY).toISOString(),
  scope:'online' as const,tags:[],evidenceId:'',excerpt:'',
 };
 assert.ok(faultsOf(asOffer,ledger,NOW).includes('no-evidence'),
  'the gate rejects it, so it can only ever travel in its own channel');
});

test('prices age, and old ones are dropped from storage', ()=>{
 const fresh=capture(fixtureState(),{},NOW-3*DAY).shelfPrices![0];
 assert.equal(shelfPriceAgeDays(fresh,NOW),3);
 assert.equal(isStale(fresh,NOW),false);
 const old=capture(fixtureState(),{},NOW-40*DAY).shelfPrices![0];
 assert.equal(isStale(old,NOW),true,'shelves move, so a month-old price is flagged');
 // Beyond a year it is not kept at all.
 const ancient={...old,observedAt:new Date(NOW-400*DAY).toISOString()};
 assert.equal(pruneShelfPrices([ancient,fresh],NOW).length,1);
 assert.equal(pruneShelfPrices([{...fresh,priceCents:0}],NOW).length,0,'a zero price is dropped');
});

test('stored prices are bounded, newest kept', ()=>{
 const many=Array.from({length:600},(_,i)=>({
  id:`r${i}`,productId:'bread',itemName:'Whole wheat bread',storeId:'metro',storeName:'Metro',
  priceCents:400+i,pack:null,packLabel:'not stated',
  observedAt:new Date(NOW-i*DAY/24).toISOString(),
 } as ShelfPrice));
 const kept=pruneShelfPrices(many,NOW);
 assert.equal(kept.length,500);
 assert.equal(kept[0].priceCents,400,'the newest survives');
});

test('captures survive a reload and can be removed', ()=>{
 const state=normalizeState(capture(fixtureState()));
 assert.equal(state.shelfPrices!.length,1);
 const cleared=removeShelfPrice(state,state.shelfPrices![0].id);
 assert.equal(cleared.shelfPrices!.length,0);
 // A household that never captured anything gets an empty list, not undefined.
 assert.deepEqual(normalizeState(fixtureState()).shelfPrices,[]);
});

test('the capture form is prefilled with the size the list asked for', ()=>{
 assert.equal(expectedPackLabel(item('bread')),'675 g');
 assert.equal(expectedPackLabel(item(null)),'','nothing to suggest for a custom item');
});

// ---- stored photographs ------------------------------------------------------

test('photos are only ever scaled down', ()=>{
 assert.deepEqual(scaledSize(4032,3024,MAX_PHOTO_EDGE),{width:1200,height:900},'landscape fits the long edge');
 assert.deepEqual(scaledSize(3024,4032,MAX_PHOTO_EDGE),{width:900,height:1200},'portrait too');
 assert.deepEqual(scaledSize(800,600,MAX_PHOTO_EDGE),{width:800,height:600},'a small photo is left alone');
 assert.deepEqual(scaledSize(0,0,MAX_PHOTO_EDGE),{width:0,height:0},'nothing to scale');
 assert.equal(scaledSize(1,1,MAX_PHOTO_EDGE).width,1,'never rounds away to zero');
 assert.ok(MAX_PHOTO_EDGE*MAX_PHOTO_EDGE*3<TARGET_PHOTO_BYTES*8,
  're-encoding is the exception, not the rule, at this edge length');
});

test('every route that drops a price leaves its photo collectable', ()=>{
 // Deleting by hand, the year-old cutoff and the 500 cap all remove rows
 // without touching the filesystem. Hooking each one would eventually miss a
 // path, so the live ids are reconciled against what is on disk instead.
 const onDisk=['aaaaaaaaaaaaaaaa.json','bbbbbbbbbbbbbbbb.json','cccccccccccccccc.json'];
 assert.deepEqual(orphanPhotoIds(onDisk,['bbbbbbbbbbbbbbbb']),
  ['aaaaaaaaaaaaaaaa','cccccccccccccccc']);
 assert.deepEqual(orphanPhotoIds(onDisk,onDisk.map(f=>f.replace('.json',''))),[],
  'nothing referenced is deleted');
 assert.deepEqual(orphanPhotoIds([],['aaaaaaaaaaaaaaaa']),[],'a dangling id deletes nothing');
 // Anything that is not one of ours is left alone.
 assert.deepEqual(orphanPhotoIds(['household.json','notes.txt','../escape.json'],[]),[]);
});

test('a pruned price surrenders its photo id to the sweep', ()=>{
 const kept:ShelfPrice={id:'r1',productId:'bread',itemName:'Bread',storeId:'metro',storeName:'Metro',
  priceCents:449,pack:null,packLabel:'not stated',observedAt:new Date(NOW-DAY).toISOString(),
  photoId:'aaaaaaaaaaaaaaaa'};
 const aged={...kept,id:'r2',observedAt:new Date(NOW-400*DAY).toISOString(),photoId:'bbbbbbbbbbbbbbbb'};
 const state={...fixtureState(),shelfPrices:pruneShelfPrices([kept,aged],NOW)};
 assert.deepEqual(referencedPhotoIds(state),['aaaaaaaaaaaaaaaa'],'the aged-out photo is no longer referenced');
 assert.deepEqual(orphanPhotoIds(['aaaaaaaaaaaaaaaa.json','bbbbbbbbbbbbbbbb.json'],referencedPhotoIds(state)),
  ['bbbbbbbbbbbbbbbb'],'so the sweep collects it');
});

test('a photo is refused before any of it is read', ()=>{
 assert.equal(photoRejection(2_000_000,'image/jpeg'),null);
 assert.match(photoRejection(2_000_000,'application/pdf')!,/JPEG, PNG or WebP/);
 assert.match(photoRejection(20_000_000,'image/jpeg')!,/under 8 MB/);
 assert.match(photoRejection(0,'image/png')!,/empty/);
});

test('a price stands on its own without a photograph', ()=>{
 const state=capture(fixtureState());
 assert.equal(state.shelfPrices![0].photoId,undefined,'a photo is optional');
 assert.equal(shelfLineTotal(state.shelfPrices![0],item('bread')),449,'and changes nothing about the price');
 assert.deepEqual(referencedPhotoIds(state),[]);
});

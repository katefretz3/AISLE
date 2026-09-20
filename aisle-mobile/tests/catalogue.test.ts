// Catalogue integrity.
//
// The taxonomy, the generated artwork and catalog.ts have to stay in step: an
// item with no picture, a duplicate id, or a legacy id quietly dropped would
// all show up as a broken list for someone who already saved one.
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {ALL_ITEMS,AISLES,DEPARTMENTS,itemById,itemsInAisle,searchItems} from '@/lib/taxonomy';
import {allowedSuggestion,parseList,products,productById,productImagePath,hasPhoto,categories,initialState} from '@/lib/catalog';
import photoManifest from '@/lib/photo-manifest.json';
import {loadTaxonomy,treeTest,cardSort} from '../tools/ia-study.mjs';
import {TEMPLATES} from '../tools/product-art.mjs';

const ART_DIR=join(process.cwd(),'public','images','products');

test('the catalogue covers a realistic shop across every department', ()=>{
 assert.ok(ALL_ITEMS.length>=400,`expected a full catalogue, got ${ALL_ITEMS.length}`);
 assert.ok(DEPARTMENTS.length>=12);
 assert.ok(AISLES.length>=60);
 for(const d of DEPARTMENTS)assert.ok(d.aisles.length>0,`${d.name} has no aisles`);
 for(const a of AISLES)assert.ok(a.items.length>0,`${a.name} has no items`);
});

test('every item id is unique and every item knows its own place', ()=>{
 const ids=ALL_ITEMS.map(i=>i.id);
 assert.equal(new Set(ids).size,ids.length,'duplicate product id');
 for(const dept of DEPARTMENTS)for(const aisle of dept.aisles)for(const item of aisle.items){
  assert.equal(item.departmentId,dept.id);
  assert.equal(item.aisleId,aisle.id);
  assert.equal(item.department,dept.name);
  assert.equal(item.aisle,aisle.name);
  assert.equal(item.edible,dept.edible);
 }
});

test('every item has artwork on disk, drawn by a template that exists', ()=>{
 const missingArt=ALL_ITEMS.filter(i=>!existsSync(join(ART_DIR,`${i.id}.png`)));
 assert.deepEqual(missingArt.map(i=>i.id),[],'items with no generated image');
 const missingTemplate=ALL_ITEMS.filter(i=>!(i.art.template in TEMPLATES));
 assert.deepEqual(missingTemplate.map(i=>`${i.id}:${i.art.template}`),[]);
 for(const item of ALL_ITEMS){
  assert.match(item.art.colour,/^#[0-9a-f]{6}$/i,`${item.id} colour`);
  assert.match(item.art.accent,/^#[0-9a-f]{6}$/i,`${item.id} accent`);
 }
 assert.ok(existsSync(join(ART_DIR,'custom-item.png')),'placeholder art is missing');
});

test('product ids from earlier saved lists still resolve', ()=>{
 // Anything already persisted on someone's device must keep working.
 const legacy=['strawberries','avocados','bananas','milk','eggs','bread','chicken','pasta','yogurt',
  'broccoli','coffee','tomatoes','apples','spinach','potatoes','carrots','onions','rice','cheese','butter',
  'tofu','salmon','beef','oats','beans','peanut-butter','sauce','olive-oil','frozen-berries','peas',
  'oat-milk','cereal','lemons','milk-store','eggs-store','bread-store','pasta-store','yogurt-store',
  'coffee-store','rice-store'];
 for(const id of legacy)assert.ok(productById[id],`legacy product ${id} disappeared`);
 for(const item of initialState().items)assert.ok(!item.productId||productById[item.productId]);
});

test('catalog.ts mirrors the taxonomy', ()=>{
 assert.equal(products.length,ALL_ITEMS.length);
 for(const p of products){
  const item=itemById[p.id];
  assert.ok(item,`${p.id} is not in the taxonomy`);
  assert.equal(p.category,item.department,'category should be the department name');
 }
 assert.equal(categories[0],'All items');
 for(const d of DEPARTMENTS)assert.ok(categories.includes(d.name),`${d.name} missing from filters`);
});

test('search finds an item by name, by aisle and by everyday synonym', ()=>{
 assert.equal(searchItems('blueberries')[0].id,'blueberries');
 assert.ok(searchItems('blueberries').some(i=>i.id==='frozen-blueberries'));
 assert.ok(searchItems('capsicum').some(i=>i.id==='bell-peppers'),'synonym should resolve');
 assert.ok(searchItems('pop').some(i=>i.id==='cola'),'colloquial term should resolve');
 assert.ok(searchItems('mince').some(i=>i.id.includes('ground')),'mince should find ground meat');
 assert.equal(searchItems('').length,0);
 assert.equal(searchItems('zzzznothing').length,0);
});

test('a pasted list matches real products and leaves the rest unmatched', ()=>{
 const parsed=parseList('2 blueberries\noat milk\ndish soap\nquantum widget');
 assert.equal(parsed[0].qty,2);
 assert.equal(parsed[0].productId,'blueberries');
 assert.equal(parsed[1].productId,'oat-milk');
 assert.equal(parsed[2].productId,'dish-soap');
 assert.equal(parsed[3].productId,null,'an unknown line stays unmatched rather than being forced');
 assert.equal(parsed[3].name,'quantum widget');
});

test('dietary rules constrain food only, and allergens are never inferred', ()=>{
 const base=initialState().prefs;
 const vegan={...base,dietary:['Vegan']};
 assert.equal(allowedSuggestion(productById['beef'],vegan),false,'meat is withheld');
 assert.equal(allowedSuggestion(productById['apples'],vegan),true,'plain produce is fine');
 assert.equal(allowedSuggestion(productById['toilet-paper'],vegan),true,'paper towels are not food');
 const allergic={...base,allergens:['Peanuts']};
 assert.equal(allowedSuggestion(productById['peanut-butter'],allergic),false);
 assert.equal(allowedSuggestion(productById['apples'],allergic),false,'food suggestions pause entirely');
 assert.equal(allowedSuggestion(productById['dish-soap'],allergic),true,'non-food is unaffected');
});

// ---- information architecture ----------------------------------------------
// Guards the structure the card sort and tree test (tools/ia-study.mjs) shaped.
// The thresholds sit below the current scores so ordinary catalogue growth does
// not trip them, but a change that genuinely scrambles the tree will.

test('every cross-listing points at an aisle that exists', ()=>{
 const aisleIds=new Set(AISLES.map(a=>a.id));
 for(const item of ALL_ITEMS)
  for(const id of item.alsoIn??[]){
   assert.ok(aisleIds.has(id),`${item.id} is cross-listed into unknown aisle "${id}"`);
   assert.notEqual(id,item.aisleId,`${item.id} is cross-listed into its own aisle`);
  }
});

test('a cross-listed item shows up in both of its aisles', ()=>{
 const crossed=ALL_ITEMS.find(i=>(i.alsoIn?.length??0)>0);
 assert.ok(crossed,'expected at least one cross-listed item');
 assert.ok(itemsInAisle(crossed!.aisleId).some(i=>i.id===crossed!.id),'missing from its home aisle');
 for(const id of crossed!.alsoIn!)
  assert.ok(itemsInAisle(id).some(i=>i.id===crossed!.id),`missing from cross-listed aisle ${id}`);
});

test('the tree stays navigable for the simulated participants', ()=>{
 const departments=loadTaxonomy();
 const trials=treeTest(departments);
 const found=trials.filter(t=>t.found).length/trials.length;
 const dept=trials.filter(t=>t.deptCorrect).length/trials.length;
 // Simulated, so these are relative guards, not claims about real people.
 assert.ok(found>=0.55,`aisle findability fell to ${(found*100).toFixed(1)}%`);
 assert.ok(dept>=0.75,`department findability fell to ${(dept*100).toFixed(1)}%`);
});

test('no aisle is a dumping ground the participants cannot agree on', ()=>{
 const rows=cardSort(loadTaxonomy());
 const worst=rows[0];
 assert.ok(worst.agreement>=0.2,`"${worst.aisle}" scored only ${(worst.agreement*100).toFixed(0)}% agreement`);
});

// ---- photographs -----------------------------------------------------------

test('every item has a generic, brand-free photo query', ()=>{
 for(const item of ALL_ITEMS){
  assert.ok(item.photo.trim().length>0,`${item.id} has no photo query`);
  assert.ok(!/[A-Z]/.test(item.photo),`${item.id} photo query should be lowercase`);
  // The query must not simply echo the brand, or the pipeline would fetch
  // pictures of packaging instead of pictures of food.
  const brandWords=item.brand.toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>3);
  const queryWords=new Set(item.photo.split(/\s+/));
  const echoed=brandWords.filter(w=>queryWords.has(w));
  assert.ok(echoed.length<brandWords.length||brandWords.length===0,
   `${item.id} photo query "${item.photo}" is just the brand`);
 }
});

test('the photo manifest only lists items that exist', ()=>{
 for(const id of photoManifest as string[]){
  assert.ok(itemById[id],`photo manifest lists unknown item ${id}`);
  assert.ok(existsSync(join(process.cwd(),'public','images','photos',`${id}.jpg`)),
   `manifest lists ${id} but the photo is missing`);
 }
});

test('items fall back to their illustration when no photo exists', ()=>{
 const withoutPhoto=ALL_ITEMS.find(i=>!hasPhoto(i.id));
 assert.ok(withoutPhoto,'expected at least one item without a photo');
 assert.match(productImagePath(withoutPhoto!.id),/^\/images\/products\/.+\.png$/);
});

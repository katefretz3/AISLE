// Catalogue integrity.
//
// The taxonomy, the generated artwork and catalog.ts have to stay in step: an
// item with no picture, a duplicate id, or a legacy id quietly dropped would
// all show up as a broken list for someone who already saved one.
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {ALL_ITEMS,AISLES,DEPARTMENTS,itemById,searchItems} from '@/lib/taxonomy';
import {allowedSuggestion,parseList,products,productById,categories,initialState} from '@/lib/catalog';
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

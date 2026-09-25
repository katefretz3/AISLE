import {cityLocation,ontarioCities,type SearchLocation} from './locations';
import {ALL_ITEMS,DEPARTMENT_NAMES,itemById,searchItems} from './taxonomy';
import photoManifest from './photo-manifest.json';
export type Product = { id: string; name: string; brand: string; size: string; category: string; icon: string };
/** Retailer identity only — branding for logos and receipts. Aisle's prices
 *  and distances come from the agent run, never from this table. */
export type Store = { id: string; name: string; short: string; color: string; text: string; url: string };
export type ListItem = { id: string; productId: string | null; name: string; qty: number; checked: boolean; locked: boolean };
export type Preferences = { searchLocation?:SearchLocation; name: string; area: string; city: string; budget: number; household: number; transport: "drive" | "walk" | "transit"; radius: number; usualStore: string; substitutions: boolean; learning: boolean; categoryLocks: string[]; neighbourhood:string; priority:"saving"|"balanced"|"convenience"; frequency:"weekly"|"twice-weekly"|"fortnightly"; dietary:string[]; allergens:string[]; preferredBrands:string[]; favouriteProducts:string[]; excludedProducts:string[]; preferredStores:string[]; minimumSwapSaving:number };
/**
 * One line of a shop that actually happened.
 *
 * The product id is the point: a receipt keyed only on a display name cannot be
 * joined back to the catalogue, so neither price history nor repurchase
 * intervals can be built from it. `actual` is the LINE total for `quantity`
 * units, not a unit price — dividing is the caller's job and getting that wrong
 * misreports by a factor of the quantity.
 */
export type TripLine = {
 productId: string | null;
 name: string;
 quantity: number;
 /** Line total paid, in cents. Null when the household did not enter one. */
 actual: number | null;
 /** Aisle's line total when the trip was saved. Null when it had no price. */
 predicted: number | null;
};

/** Superseded by `TripLine`. Kept so trips saved before the change still load. */
export type LegacyTripPrice = {name: string; quantity: number; actual: number; predicted: number};

export type Trip = {
 id: string; storeId: string; storeName?: string; date: string;
 /** What the household actually paid for the whole shop, in cents. */
 total: number;
 /** Aisle's basket subtotal when the trip was saved, in cents. */
 predicted: number;
 /** How much of the list that estimate covered. Without these two numbers
  *  `predicted` cannot honestly be compared with `total`: an estimate covering
  *  4 of 12 items is not a forecast of the shop. */
 predictedPriced?: number;
 predictedTotal?: number;
 /** Always 0. Once held the sample engine's fabricated baseline. */
 comparisonTotal: number;
 items: number;
 receiptId?: string;
 /** What was bought. Canonical; `prices` is the pre-migration shape. */
 lines?: TripLine[];
 prices?: LegacyTripPrice[];
};
/** A list kept for reuse. `auto` marks the snapshot taken when a shop is
 *  finished, so "start from last shop" exists without anyone having to think
 *  about saving. */
export type SavedList = { id: string; name: string; savedAt: string; auto?: boolean; items: ListItem[] };
export type UserState = { onboarded: boolean; listName: string; items: ListItem[]; savedLists?: SavedList[]; prefs: Preferences; trips: Trip[]; offerSelections?:Record<string,Record<string,string>>;
 /** Products the household waved off on the home screen, with the date they did
  *  it. A snooze, not an exclusion: saying "not this week" about milk should not
  *  quietly drop milk from your staples forever. */
 dueSnoozed?:Record<string,string>; events: {category: string; action: string; date: string; productId?:string; storeId?:string;brand?:string;offerId?:string}[]; activeShop: string | null };
export const stores: Store[] = [
 {id:"food-basics",name:"Food Basics",short:"fb",color:"#e9f1d5",text:"#416324",url:"https://www.foodbasics.ca"},
 {id:"no-frills",name:"No Frills",short:"nf",color:"#ffed42",text:"#20251a",url:"https://www.nofrills.ca"},
 {id:"walmart",name:"Walmart",short:"W",color:"#e6effd",text:"#17559d",url:"https://www.walmart.ca"},
 {id:"freshco",name:"FreshCo",short:"F",color:"#e7eed4",text:"#4b611a",url:"https://freshco.com"},
 {id:"fortinos",name:"Fortinos",short:"F",color:"#fff0e7",text:"#c35b31",url:"https://www.fortinos.ca"},
 {id:"metro",name:"Metro",short:"m",color:"#f9e6e4",text:"#bd2e36",url:"https://www.metro.ca"},
 {id:"loblaws",name:"Loblaws",short:"L",color:"#eaf0fb",text:"#1c4f91",url:"https://www.loblaws.ca"},
 {id:"zehrs",name:"Zehrs",short:"Z",color:"#e9f1d5",text:"#3b6c36",url:"https://www.zehrs.ca"},
 {id:"superstore",name:"Real Canadian Superstore",short:"RCSS",color:"#fff0d8",text:"#a55d1f",url:"https://www.realcanadiansuperstore.ca"},
 {id:"foodland",name:"Foodland",short:"FL",color:"#edf4d9",text:"#4c7137",url:"https://www.foodland.ca"},
 {id:"longos",name:"Longo’s",short:"L",color:"#f2e5e5",text:"#9b2631",url:"https://www.longos.com"},
 {id:"farmboy",name:"Farm Boy",short:"FB",color:"#e7efdc",text:"#446332",url:"https://www.farmboy.ca"},
 {id:"costco",name:"Costco",short:"C",color:"#e8eef4",text:"#bc303a",url:"https://www.costco.ca"},
 {id:"denningers",name:"Denninger’s",short:"D",color:"#f1ebe1",text:"#675340",url:"https://denningers.com"},
];
// Products come from the taxonomy (Department → Aisle → Item), so the catalogue,
// the category browser and the generated artwork can never drift apart.
// `category` stays the department name, which keeps existing saved category
// locks and the engine's category logic working unchanged.
// Retained so the Product shape stays stable for anything still reading it.
const ICON_FOR_TEMPLATE:Record<string,string>={
 round:'apple',berry:'cherry',strawberry:'cherry',banana:'banana',citrus:'citrus',melon:'cherry',
 pear:'apple',pineapple:'apple',grapes:'cherry',leafy:'leaf',floret:'sprout',root:'carrot',
 bulb:'salad',pepper:'salad',longveg:'carrot',mushroom:'sprout',corn:'wheat',avocado:'salad',herb:'leaf',
 carton:'milk',jug:'milk',bottle:'package',can:'package',jar:'package',tub:'milk',pouch:'package',
 bag:'package',box:'wheat',tray:'beef',tube:'package',roll:'package',spray:'package',bar:'package',
 sachet:'package',coffeebag:'coffee',teabox:'leaf',diaper:'package',soapbar:'package',toothbrush:'package',
 cheese:'milk',egg:'egg',loaf:'wheat',bun:'wheat',bagel:'wheat',tortilla:'wheat',croissant:'wheat',
 baguette:'wheat',pastry:'wheat',pizza:'wheat',steak:'beef',poultry:'beef',fillet:'fish',shrimp:'fish',
 bacon:'beef',sausage:'beef',deli:'beef',
};
export const products:Product[]=ALL_ITEMS.map(item=>({
 id:item.id,name:item.name,brand:item.brand,size:item.size,category:item.department,
 icon:ICON_FOR_TEMPLATE[item.art.template]??'package',
}));
export const productById:Record<string,Product> = Object.fromEntries(products.map(p=>[p.id,p]));
// Photographs win when we have one; the generated illustration is the fallback,
// so a half-finished `npm run photos` run still leaves every item with a
// picture and needs no code change to take effect.
const PHOTOS=new Set(photoManifest as string[]);
export const hasPhoto=(id?:string|null)=>!!id&&PHOTOS.has(id);
export const productImagePath = (id?:string|null) =>
 hasPhoto(id)?`/images/photos/${id}.jpg`:`/images/products/${id&&productById[id]?id:'custom-item'}.png`;
export const categories = ["All items",...DEPARTMENT_NAMES];
export const money = (cents:number) => new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD"}).format(cents/100);
export const profileDefaults={city:"Burlington",neighbourhood:"Burlington",priority:"balanced" as const,frequency:"weekly" as const,dietary:[] as string[],allergens:[] as string[],preferredBrands:[] as string[],favouriteProducts:[] as string[],excludedProducts:[] as string[],preferredStores:[] as string[],minimumSwapSaving:50};
/**
 * Bring a stored trip up to the current shape.
 *
 * Trips saved before receipts carried product ids keep their price rows, but
 * `productId` stays null: we genuinely do not know which catalogue item a bare
 * display name referred to, and guessing would put invented history behind a
 * price. Those rows still show in the trip's own detail view; they simply
 * cannot feed repurchase intervals or price history.
 */
/** A snooze only means anything for a shopping cycle or two, so old ones are
 *  dropped rather than accumulating one entry per product for ever. */
function pruneSnoozes(snoozed:Record<string,string>|undefined,now=Date.now()):Record<string,string>{
 const keep:Record<string,string>={};
 for(const [productId,at] of Object.entries(snoozed??{})){
  const stamp=Date.parse(at);
  if(Number.isFinite(stamp)&&now-stamp<30*86400000)keep[productId]=at;
 }
 return keep;
}

function migrateTrip(trip:Trip):Trip{
 if(trip.lines)return trip;
 const lines:TripLine[]=(trip.prices??[]).map(row=>({
  productId:null,name:row.name,quantity:row.quantity,
  actual:Number.isFinite(row.actual)?row.actual:null,
  predicted:Number.isFinite(row.predicted)&&row.predicted>0?row.predicted:null,
 }));
 return {...trip,lines};
}

export function normalizeState(s:UserState):UserState{const city=ontarioCities.find(c=>c.name===(s.prefs.city??s.prefs.area))?.name??"Burlington";const point=s.prefs.searchLocation;const valid=point&&point.city===city&&Number.isFinite(point.lat)&&Math.abs(point.lat)<=85&&Number.isFinite(point.lng)&&Math.abs(point.lng)<=180;const prefs={...profileDefaults,...s.prefs,city,searchLocation:valid?point:cityLocation(city)};return {...s,prefs,events:s.events??[],savedLists:s.savedLists??[],dueSnoozed:pruneSnoozes(s.dueSnoozed),trips:(s.trips??[]).map(migrateTrip)};}
export const initialState = ():UserState => ({onboarded:false,listName:"The weekly shop",savedLists:[],items:["strawberries","avocados","bananas","milk","eggs","bread","chicken","pasta","yogurt","broccoli","coffee","tomatoes"].map((id,i)=>({id:`starter-${i}`,productId:id,name:productById[id].name,qty:1,checked:false,locked:id==="coffee"})),prefs:{name:"",area:"Burlington",budget:120,household:2,transport:"drive",radius:10,usualStore:"fortinos",substitutions:true,learning:false,categoryLocks:[],...profileDefaults},trips:[],events:[],activeShop:null});
// There is deliberately no price function here.
//
// Aisle used to carry a demo engine that derived a price from a hash of the
// product and store ids and multiplied it by a per-store "factor". It looked
// like a working comparison and was entirely invented. Prices now come only
// from src/lib/agent, where each one is tied to an HTTP response in the
// evidence ledger, and an item with no collected price stays blank.
export function parseList(text:string):{productId:string|null;name:string;qty:number}[] {
 return text.split(/[,\n;]+/).map(t=>t.trim()).filter(Boolean).slice(0,80).map(raw=>{
  const m=raw.match(/^(\d{1,2})\s*(?:x\s+|×\s*|\s)(.+)$/i);
  const qty=m?Math.max(1,Math.min(99,Number(m[1]))):1;
  const name=(m?m[2]:raw).trim().slice(0,150);
  // Search the full catalogue, including each item's synonyms, so "pop",
  // "capsicum" or "mince" land on the right product. An unrecognized line stays
  // unmatched rather than being forced onto the nearest thing.
  const hit=searchItems(name,1)[0];
  const exact=itemById[name.toLowerCase().replace(/\s+/g,'-')];
  const id=exact?.id??(hit&&!hit.id.endsWith('-store')?hit.id:null);
  return {productId:id,name:id?productById[id].name:name,qty};
 });
}

// A small, explainable recommender. Explicit requirements always take priority.
export const dietaryOptions=["Vegetarian","Vegan","Pescatarian","Halal","Kosher","Gluten-free","Dairy-free"];
export const allergenOptions=["Peanuts","Tree nuts","Milk","Eggs","Wheat","Soy","Sesame","Fish","Shellfish","Other / needs review"];
export const brandOptions=Array.from(new Set(ALL_ITEMS
 .filter(i=>i.edible&&i.brand!=='Store brand'&&!/^(fresh|in-store)/i.test(i.brand))
 .map(i=>i.brand))).sort((a,b)=>a.localeCompare(b));
export const priorityLabels={saving:"Lowest grocery bill",balanced:"Price + travel cost",convenience:"Closest complete basket"};
export function recordChoice(s:UserState,action:string,productId:string,storeId?:string):UserState{
 if(!s.prefs.learning)return s;
 const p=productById[productId];
 return {...s,events:[...s.events,{category:p?.category??"Other",action,productId,storeId,date:new Date().toISOString()}].slice(-200)};
}
export function allowedSuggestion(p:Product,prefs:Preferences){
 if(prefs.excludedProducts.includes(p.id))return false;
 const item=itemById[p.id];
 // Paper towels are not food: dietary rules apply only to edible departments.
 if(item&&!item.edible)return true;
 // No verified ingredient or allergen records exist for these catalogues, so
 // with an allergen listed Aisle stops suggesting food rather than guessing.
 if(prefs.allergens.length)return false;
 if(prefs.dietary.length&&p.category!=="Produce")return false;
 return true;
}
export function personalSuggestions(state:UserState,now=Date.now()){
 return products.filter(p=>!p.id.endsWith("-store")&&!state.items.some(i=>i.productId===p.id)&&allowedSuggestion(p,state.prefs)).map(p=>{
  const favourite=state.prefs.favouriteProducts.includes(p.id);let score=favourite?5:0;let purchases=0;let adds=0;
  if(state.prefs.learning)for(const e of state.events.filter(e=>e.productId===p.id)){
   const decay=Math.exp(-Math.max(0,(now-new Date(e.date).getTime())/86400000)/60);
   if(e.action==="purchased"){score+=3*decay;purchases++;}else if(e.action==="added"){score+=decay;adds++;}else if(e.action==="dismissed"){score-=4*decay;}
  }
  const why=favourite?"A staple you picked":purchases?`Bought on ${purchases} recorded ${purchases===1?"trip":"trips"}`:adds?"You’ve added this before":"";
  return {product:p,score,why};
 }).filter(p=>p.score>0&&p.why).sort((a,b)=>b.score-a.score).slice(0,4);
}
export function swapConfidence(state:UserState,category:string){
 if(!state.prefs.learning)return {probability:.5,count:0};
 const choices=state.events.filter(e=>e.category===category&&["accepted_swap","kept_brand"].includes(e.action));
 const accept=choices.filter(e=>e.action==="accepted_swap").length;
 return {probability:(accept+1)/(choices.length+2),count:choices.length};
}
export function starterList(prefs:Preferences):ListItem[]{
 const ids=prefs.favouriteProducts.length?prefs.favouriteProducts:prefs.allergens.length?[]:initialState().items.map(i=>i.productId!).filter(id=>allowedSuggestion(productById[id],prefs));
 return ids.filter(id=>productById[id]&&!prefs.excludedProducts.includes(id)).map((id,i)=>({id:`setup-${i}`,productId:id,name:productById[id].name,qty:1,checked:false,locked:prefs.preferredBrands.includes(productById[id].brand)}));
}

/** A fresh, unchecked copy of a saved list's items, with new ids. */

/** Reopen a saved list as fresh, unchecked items. */
export function reopenList(list:SavedList):ListItem[]{
 return list.items.map((item,index)=>({...item,id:`reopened-${Date.now().toString(36)}-${index}`,checked:false}));
}

/** Keep the newest snapshots and every named list, so automatic saves cannot
 *  crowd out the ones somebody chose to keep. */
export function pruneSavedLists(lists:SavedList[],keepAuto=5):SavedList[]{
 const named=lists.filter(l=>!l.auto);
 const auto=lists.filter(l=>l.auto).sort((a,b)=>b.savedAt.localeCompare(a.savedAt)).slice(0,keepAuto);
 return [...auto,...named].sort((a,b)=>b.savedAt.localeCompare(a.savedAt)).slice(0,30);
}

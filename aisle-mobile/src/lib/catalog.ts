import {cityLocation,ontarioCities,type SearchLocation} from './locations';
import {ALL_ITEMS,DEPARTMENT_NAMES,itemById,searchItems} from './taxonomy';
import photoManifest from './photo-manifest.json';
export type Product = { id: string; name: string; brand: string; size: string; category: string; icon: string; base: number; swap?: string };
export type Store = { id: string; name: string; short: string; color: string; text: string; factor: number; km: number; url: string; priced: boolean };
export type ListItem = { id: string; productId: string | null; name: string; qty: number; checked: boolean; locked: boolean };
export type Preferences = { searchLocation?:SearchLocation; name: string; area: string; city: string; budget: number; household: number; transport: "drive" | "walk" | "transit"; radius: number; usualStore: string; substitutions: boolean; learning: boolean; categoryLocks: string[]; neighbourhood:string; priority:"saving"|"balanced"|"convenience"; frequency:"weekly"|"twice-weekly"|"fortnightly"; dietary:string[]; allergens:string[]; preferredBrands:string[]; favouriteProducts:string[]; excludedProducts:string[]; preferredStores:string[]; minimumSwapSaving:number };
export type Trip = { id: string; storeId: string; storeName?: string; date: string; total: number; predicted: number; comparisonTotal: number; items: number; receiptId?: string; prices: {name: string; quantity: number; actual: number; predicted: number}[] };
export type UserState = { onboarded: boolean; listName: string; items: ListItem[]; prefs: Preferences; trips: Trip[]; offerSelections?:Record<string,Record<string,string>>; events: {category: string; action: string; date: string; productId?:string; storeId?:string;brand?:string;offerId?:string}[]; activeShop: string | null };
export const stores: Store[] = [
 {id:"food-basics",name:"Food Basics",short:"fb",color:"#e9f1d5",text:"#416324",factor:.95,km:3.2,url:"https://www.foodbasics.ca",priced:true},
 {id:"no-frills",name:"No Frills",short:"nf",color:"#ffed42",text:"#20251a",factor:.97,km:2.4,url:"https://www.nofrills.ca",priced:true},
 {id:"walmart",name:"Walmart",short:"W",color:"#e6effd",text:"#17559d",factor:1,km:4.1,url:"https://www.walmart.ca",priced:true},
 {id:"freshco",name:"FreshCo",short:"F",color:"#e7eed4",text:"#4b611a",factor:.96,km:5.3,url:"https://freshco.com",priced:true},
 {id:"fortinos",name:"Fortinos",short:"F",color:"#fff0e7",text:"#c35b31",factor:1.16,km:1.8,url:"https://www.fortinos.ca",priced:true},
 {id:"metro",name:"Metro",short:"m",color:"#f9e6e4",text:"#bd2e36",factor:1.11,km:3.8,url:"https://www.metro.ca",priced:true},
 {id:"loblaws",name:"Loblaws",short:"L",color:"#eaf0fb",text:"#1c4f91",factor:1.13,km:4.7,url:"https://www.loblaws.ca",priced:false},
 {id:"zehrs",name:"Zehrs",short:"Z",color:"#e9f1d5",text:"#3b6c36",factor:1.08,km:5.2,url:"https://www.zehrs.ca",priced:false},
 {id:"superstore",name:"Real Canadian Superstore",short:"RCSS",color:"#fff0d8",text:"#a55d1f",factor:1.02,km:6.3,url:"https://www.realcanadiansuperstore.ca",priced:false},
 {id:"foodland",name:"Foodland",short:"FL",color:"#edf4d9",text:"#4c7137",factor:1.09,km:6.8,url:"https://www.foodland.ca",priced:false},
 {id:"longos",name:"Longo’s",short:"L",color:"#f2e5e5",text:"#9b2631",factor:1.15,km:6,url:"https://www.longos.com",priced:false},
 {id:"farmboy",name:"Farm Boy",short:"FB",color:"#e7efdc",text:"#446332",factor:1.1,km:5,url:"https://www.farmboy.ca",priced:false},
 {id:"costco",name:"Costco",short:"C",color:"#e8eef4",text:"#bc303a",factor:.9,km:7,url:"https://www.costco.ca",priced:false},
 {id:"denningers",name:"Denninger’s",short:"D",color:"#f1ebe1",text:"#675340",factor:1.15,km:3,url:"https://denningers.com",priced:false},
];
// Products come from the taxonomy (Department → Aisle → Item), so the catalogue,
// the category browser and the generated artwork can never drift apart.
// `category` stays the department name, which keeps existing saved category
// locks and the engine's category logic working unchanged.
const SWAP_TO_STORE_BRAND:Record<string,string>={
 milk:'milk-store',eggs:'eggs-store',bread:'bread-store',pasta:'pasta-store',
 yogurt:'yogurt-store',coffee:'coffee-store',rice:'rice-store',
};
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
 icon:ICON_FOR_TEMPLATE[item.art.template]??'package',base:item.base,swap:SWAP_TO_STORE_BRAND[item.id],
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
export function normalizeState(s:UserState):UserState{const city=ontarioCities.find(c=>c.name===(s.prefs.city??s.prefs.area))?.name??"Burlington";const point=s.prefs.searchLocation;const valid=point&&point.city===city&&Number.isFinite(point.lat)&&Math.abs(point.lat)<=85&&Number.isFinite(point.lng)&&Math.abs(point.lng)<=180;const prefs={...profileDefaults,...s.prefs,city,searchLocation:valid?point:cityLocation(city)};return {...s,prefs,events:s.events??[]};}
export const initialState = ():UserState => ({onboarded:false,listName:"The weekly shop",items:["strawberries","avocados","bananas","milk","eggs","bread","chicken","pasta","yogurt","broccoli","coffee","tomatoes"].map((id,i)=>({id:`starter-${i}`,productId:id,name:productById[id].name,qty:1,checked:false,locked:id==="coffee"})),prefs:{name:"",area:"Burlington",budget:120,household:2,transport:"drive",radius:10,usualStore:"fortinos",substitutions:true,learning:false,categoryLocks:[],...profileDefaults},trips:[],events:[],activeShop:null});
// Demonstration fixtures only. Never observed retailer prices or live inventory.
export function priceAt(productId:string, storeId:string):number|null {
 const p=productById[productId],s=stores.find(s=>s.id===storeId);
 if(!p||!s||!s.priced)return null;
 if(storeId==="freshco"&&["coffee","oat-milk"].includes(productId))return null;
 if(storeId==="metro"&&productId==="tofu")return null;
 let hash=0;for(const c of productId+storeId)hash=(hash*31+c.charCodeAt(0))>>>0;
 const sale=hash%7===0?.79:1;
 return Math.max(49,Math.round(p.base*s.factor*(.96+(hash%9)/100)*sale));
}
export function compareBasket(items:ListItem[],prefs:Preferences) {
 return stores.filter(s=>s.priced&&s.km<=prefs.radius).map(s=>{
  const lines=items.map(i=>({item:i,product:i.productId?productById[i.productId]:null,price:i.productId?priceAt(i.productId,s.id):null}));
  const missing=lines.filter(l=>l.price===null).length;
  const subtotal=lines.reduce((sum,l)=>sum+(l.price??0)*l.item.qty,0);
  const travel=prefs.transport==="drive"?Math.round(s.km*2*18):prefs.transport==="transit"?700:0;
  return {...s,subtotal,travel,total:subtotal+travel,missing,complete:missing===0&&items.length>0,lines,minutes:Math.round(s.km*(prefs.transport==="walk"?12:prefs.transport==="transit"?6:2.5))+3};
 }).sort((a,b)=>Number(b.complete)-Number(a.complete)||a.subtotal-b.subtotal);
}
export function swapCandidates(state:UserState) {
 if(!state.prefs.substitutions||state.prefs.dietary.length||state.prefs.allergens.length)return [];
 const current=recommendedBasket(state);
 if(!current)return [];
 return state.items.flatMap(item=>{
  const p=item.productId?productById[item.productId]:null;
  if(!p?.swap||item.locked||state.prefs.categoryLocks.includes(p.category)||state.prefs.preferredBrands.includes(p.brand))return [];
  const next=productById[p.swap],a=priceAt(p.id,current.id),b=priceAt(next.id,current.id);
  return a!==null&&b!==null&&(a-b)*item.qty>=state.prefs.minimumSwapSaving?[{item,from:p,to:next,saving:(a-b)*item.qty}]:[];
 }).sort((a,b)=>b.saving*(.6+.4*swapConfidence(state,b.from.category).probability)-a.saving*(.6+.4*swapConfidence(state,a.from.category).probability));
}
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
export function recommendedBasket(state:UserState){
 const complete=compareBasket(state.items,state.prefs).filter(s=>s.complete);
 return complete.sort((a,b)=>{
  const primary=state.prefs.priority==="convenience"?a.km-b.km:state.prefs.priority==="balanced"?a.total-b.total:a.subtotal-b.subtotal;
  return primary||Number(state.prefs.preferredStores.includes(b.id))-Number(state.prefs.preferredStores.includes(a.id));
 })[0];
}
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

import {cityLocation,ontarioCities,type SearchLocation} from './locations';
export type Product = { id: string; name: string; brand: string; size: string; category: string; icon: string; base: number; swap?: string };
export type Store = { id: string; name: string; short: string; color: string; text: string; factor: number; km: number; url: string; priced: boolean };
export type ListItem = { id: string; productId: string | null; name: string; qty: number; checked: boolean; locked: boolean };
export type Preferences = { searchLocation?:SearchLocation; name: string; area: string; city: string; budget: number; household: number; transport: "drive" | "walk" | "transit"; radius: number; usualStore: string; substitutions: boolean; learning: boolean; categoryLocks: string[]; neighbourhood:string; priority:"saving"|"balanced"|"convenience"; frequency:"weekly"|"twice-weekly"|"fortnightly"; dietary:string[]; allergens:string[]; preferredBrands:string[]; favouriteProducts:string[]; excludedProducts:string[]; preferredStores:string[]; minimumSwapSaving:number };
export type Trip = { id: string; storeId: string; date: string; total: number; predicted: number; comparisonTotal: number; items: number; receiptId?: string; prices: {name: string; quantity: number; actual: number; predicted: number}[] };
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
const definitions:[string,string,string,string,string,string,number,string?][]=[
 ["strawberries","Fresh strawberries","Fresh produce","454 g","Produce","cherry",499],
 ["avocados","Avocados","Fresh produce","Bag of 5","Produce","salad",499],
 ["bananas","Bananas","Fresh produce","1 kg","Produce","banana",169],
 ["milk","2% milk","Neilson","4 L","Dairy & eggs","milk",679,"milk-store"],
 ["eggs","Large eggs","Burnbrae Farms","12 eggs","Dairy & eggs","egg",429,"eggs-store"],
 ["bread","Whole wheat bread","Dempster’s","675 g","Bakery","wheat",399,"bread-store"],
 ["chicken","Chicken breasts","Fresh, boneless","1 kg","Meat & protein","beef",1499],
 ["pasta","Spaghetti","Barilla","410 g","Pantry","wheat",299,"pasta-store"],
 ["yogurt","Vanilla Greek yogurt","Oikos","750 g","Dairy & eggs","milk",649,"yogurt-store"],
 ["broccoli","Broccoli crowns","Fresh produce","500 g","Produce","sprout",299],
 ["coffee","Medium roast coffee","Tim Hortons","300 g","Pantry","coffee",999,"coffee-store"],
 ["tomatoes","Roma tomatoes","Fresh produce","500 g","Produce","cherry",249],
 ["apples","Gala apples","Fresh produce","3 lb bag","Produce","apple",449],
 ["spinach","Baby spinach","Fresh produce","142 g","Produce","leaf",349],
 ["potatoes","Yellow potatoes","Fresh produce","5 lb bag","Produce","carrot",449],
 ["carrots","Carrots","Fresh produce","2 lb bag","Produce","carrot",249],
 ["onions","Yellow onions","Fresh produce","3 lb bag","Produce","salad",349],
 ["rice","Jasmine rice","Rooster","2 kg","Pantry","wheat",899,"rice-store"],
 ["cheese","Old cheddar","Black Diamond","400 g","Dairy & eggs","milk",649],
 ["butter","Salted butter","Lactantia","454 g","Dairy & eggs","milk",649],
 ["tofu","Extra firm tofu","Sunrise","350 g","Meat & protein","package",349],
 ["salmon","Atlantic salmon","Fresh fillet","500 g","Meat & protein","fish",1299],
 ["beef","Lean ground beef","Fresh","500 g","Meat & protein","beef",699],
 ["oats","Quick oats","Quaker","1 kg","Pantry","wheat",499],
 ["beans","Black beans","Unico","540 mL","Pantry","package",189],
 ["peanut-butter","Peanut butter","Kraft","1 kg","Pantry","package",649],
 ["sauce","Tomato pasta sauce","Classico","650 mL","Pantry","package",349],
 ["olive-oil","Extra virgin olive oil","Bertolli","1 L","Pantry","package",1399],
 ["frozen-berries","Frozen mixed berries","Compliments","600 g","Frozen","cherry",599],
 ["peas","Frozen green peas","Green Giant","750 g","Frozen","sprout",349],
 ["oat-milk","Original oat beverage","Earth’s Own","1.75 L","Dairy & eggs","milk",449],
 ["cereal","Original Cheerios","General Mills","350 g","Pantry","wheat",549],
 ["lemons","Lemons","Fresh produce","Bag of 4","Produce","citrus",299],
 ["milk-store","2% milk","Store brand","4 L","Dairy & eggs","milk",599],
 ["eggs-store","Large eggs","Store brand","12 eggs","Dairy & eggs","egg",369],
 ["bread-store","Whole wheat bread","Store brand","675 g","Bakery","wheat",249],
 ["pasta-store","Spaghetti","Store brand","410 g","Pantry","wheat",169],
 ["yogurt-store","Vanilla Greek yogurt","Store brand","750 g","Dairy & eggs","milk",479],
 ["coffee-store","Medium roast coffee","Store brand","300 g","Pantry","coffee",749],
 ["rice-store","Jasmine rice","Store brand","2 kg","Pantry","wheat",649],
];
export const products:Product[]=definitions.map(([id,name,brand,size,category,icon,base,swap])=>({id,name,brand,size,category,icon,base,swap}));
export const productById:Record<string,Product> = Object.fromEntries(products.map(p=>[p.id,p]));
export const productImagePath = (id?:string|null) => `/images/products/${id&&productById[id]?id:'custom-item'}.png`;
export const categories = ["All items","Produce","Dairy & eggs","Meat & protein","Bakery","Pantry","Frozen"];
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
 const aliases:Record<string,string>={chicken:"chicken",milk:"milk",eggs:"eggs",bread:"bread",yogurt:"yogurt",pasta:"pasta",coffee:"coffee",rice:"rice",cheese:"cheese","ground beef":"beef",cereal:"cereal","oat milk":"oat-milk",berries:"strawberries"};
 return text.split(/[,\n;]+/).map(t=>t.trim()).filter(Boolean).slice(0,80).map(raw=>{
  const m=raw.match(/^(\d{1,2})\s*(?:x\s+|×\s*|\s)(.+)$/i);const qty=m?Math.max(1,Math.min(99,Number(m[1]))):1;
  const name=(m?m[2]:raw).trim().slice(0,150);const n=name.toLowerCase();
  const id=aliases[n]??products.find(p=>!p.id.endsWith("-store")&&(p.name.toLowerCase()===n||p.id===n||p.id===n.replace(/s$/,"")))?.id??null;
  return {productId:id,name:id?productById[id].name:name,qty};
 });
}

// A small, explainable recommender. Explicit requirements always take priority.
export const dietaryOptions=["Vegetarian","Vegan","Pescatarian","Halal","Kosher","Gluten-free","Dairy-free"];
export const allergenOptions=["Peanuts","Tree nuts","Milk","Eggs","Wheat","Soy","Sesame","Fish","Shellfish","Other / needs review"];
export const brandOptions=Array.from(new Set(products.filter(p=>p.brand!=="Store brand"&&p.category!=="Produce"&&!p.brand.startsWith("Fresh")).map(p=>p.brand)));
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
 // The demo catalogue has no verified ingredient/allergen records. Do not guess.
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

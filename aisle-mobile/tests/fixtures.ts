// Test fixtures.
//
// Everything here is clearly synthetic and is never loaded by the application.
// No value in this file is presented anywhere as a real retailer offer.
import type {ReadResult,Reader} from '@/lib/agent/net';
import type {PlaceResult} from '@/lib/agent/places';
import {initialState,type UserState} from '@/lib/catalog';

export const FIXTURE_ORIGIN='https://fixture-grocer.example.ca';

const body=(url:string,status:number,text:string):ReadResult=>
 ({url,status,body:text,bytes:text.length,fetchedAt:new Date().toISOString()});

export const CATALOGUE={products:[
 {title:'Whole Wheat Bread',handle:'whole-wheat-bread',vendor:'Dempster’s',product_type:'Bakery',tags:['bakery'],
  variants:[{id:1001,title:'675 g',price:'3.99',available:true}]},
 {title:'2% Milk',handle:'two-percent-milk',vendor:'Neilson',product_type:'Dairy',tags:['dairy'],
  variants:[{id:1002,title:'4 L',price:'6.79',available:true}]},
 {title:'Gala Apples',handle:'gala-apples',vendor:'Fresh produce',product_type:'Produce',tags:['produce'],
  variants:[{id:1003,title:'3 lb bag',price:'4.49',available:true}]},
 {title:'Apple Juice',handle:'apple-juice',vendor:'Fresh produce',product_type:'Beverage',tags:[],
  variants:[{id:1004,title:'1 L',price:'2.99',available:true}]},
 {title:'Sold Out Butter',handle:'sold-out-butter',vendor:'Lactantia',product_type:'Dairy',tags:[],
  variants:[{id:1005,title:'454 g',price:'6.49',available:false}]},
]};

export function fixtureReader(overrides:Record<string,ReadResult>={}):Reader{
 const routes:Record<string,ReadResult>={
  [`${FIXTURE_ORIGIN}/robots.txt`]:body(`${FIXTURE_ORIGIN}/robots.txt`,200,'User-agent: *\nDisallow: /checkout\n'),
  [`${FIXTURE_ORIGIN}/`]:body(`${FIXTURE_ORIGIN}/`,200,'<html><script>Shopify.currency = {"active":"CAD","rate":"1.0"};</script></html>'),
  [`${FIXTURE_ORIGIN}/products.json?limit=250`]:body(`${FIXTURE_ORIGIN}/products.json?limit=250`,200,JSON.stringify(CATALOGUE)),
  ...overrides,
 };
 return async url=>{
  const hit=routes[url];
  if(!hit)throw new Error(`Fixture has no route for ${url}`);
  return hit;
 };
}

export const fixturePlaces=(): PlaceResult=>({
 status:'ready',checkedAt:new Date().toISOString(),message:'Fixture directory',
 places:[
  {id:'node/1',name:'Fixture Grocer',chainId:null,lat:43.3862,lng:-79.8371,address:'1 Test Street',url:'https://www.openstreetmap.org/node/1',website:FIXTURE_ORIGIN},
  {id:'node/2',name:'No Frills',chainId:'no-frills',lat:43.39,lng:-79.84,address:'2 Test Street',url:'https://www.openstreetmap.org/node/2',brand:'No Frills',website:'https://www.nofrills.ca'},
  {id:'node/3',name:'Somewhere In Manitoba',chainId:null,lat:49.9,lng:-97.1,address:'Out of province',url:'https://www.openstreetmap.org/node/3'},
 ],
});

/** A household with a short, predictable list. */
export function fixtureState(overrides:Partial<UserState>={}):UserState{
 const base=initialState();
 return {
  ...base,
  onboarded:true,
  items:[
   {id:'item-bread',productId:'bread',name:'Whole wheat bread',qty:1,checked:false,locked:false},
   {id:'item-milk',productId:'milk',name:'2% milk',qty:1,checked:false,locked:false},
   {id:'item-salmon',productId:'salmon',name:'Atlantic salmon',qty:1,checked:false,locked:false},
  ],
  prefs:{...base.prefs,city:'Burlington',radius:25,budget:120,household:2},
  ...overrides,
 };
}

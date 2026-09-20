// Ontario grocery registry.
//
// Aisle only operates in Ontario, so this file records what is actually known
// about each chain's price data rather than pretending coverage exists. A chain
// with no connected feed reports that fact to the user; it never falls back to
// an estimate, a national average or a model's recollection of a price.
export type FeedPolicy =
 |{kind:'shopify-public'}                 // Public Shopify catalogue JSON, verified CAD at collection time.
 |{kind:'none';reason:string}             // Known to publish no machine-readable public price feed.
 |{kind:'unknown'};                       // Never probed. Eligible for discovery.

export type ChainPolicy = {
 id:string;                               // Matches the store ids already used in catalog.ts where one exists.
 name:string;
 match:RegExp;                            // Applied to OpenStreetMap name/brand tags.
 feed:FeedPolicy;
 scope:'online-catalogue'|'branch'|'none';
};

// Major banners operating in Ontario. None of these publish a public,
// machine-readable branch price feed. Branch-level pricing needs a licensed
// retailer feed or a partnership; until one exists the honest answer is
// "not connected", which is what the agent reports.
const NO_PUBLIC_FEED='No public machine-readable price feed. Branch pricing requires a licensed retailer feed or partnership.';
export const CHAINS:ChainPolicy[]=[
 {id:'loblaws',name:'Loblaws',match:/loblaw/i,feed:{kind:'none',reason:NO_PUBLIC_FEED},scope:'branch'},
 {id:'no-frills',name:'No Frills',match:/no\s*frills/i,feed:{kind:'none',reason:NO_PUBLIC_FEED},scope:'branch'},
 {id:'zehrs',name:'Zehrs',match:/zehrs/i,feed:{kind:'none',reason:NO_PUBLIC_FEED},scope:'branch'},
 {id:'fortinos',name:'Fortinos',match:/fortino/i,feed:{kind:'none',reason:NO_PUBLIC_FEED},scope:'branch'},
 {id:'superstore',name:'Real Canadian Superstore',match:/superstore/i,feed:{kind:'none',reason:NO_PUBLIC_FEED},scope:'branch'},
 {id:'independent',name:'Your Independent Grocer',match:/independent\s+grocer/i,feed:{kind:'none',reason:NO_PUBLIC_FEED},scope:'branch'},
 {id:'metro',name:'Metro',match:/\bmetro\b/i,feed:{kind:'none',reason:NO_PUBLIC_FEED},scope:'branch'},
 {id:'food-basics',name:'Food Basics',match:/food\s*basics/i,feed:{kind:'none',reason:NO_PUBLIC_FEED},scope:'branch'},
 {id:'sobeys',name:'Sobeys',match:/sobeys/i,feed:{kind:'none',reason:NO_PUBLIC_FEED},scope:'branch'},
 {id:'freshco',name:'FreshCo',match:/freshco/i,feed:{kind:'none',reason:NO_PUBLIC_FEED},scope:'branch'},
 {id:'foodland',name:'Foodland',match:/foodland/i,feed:{kind:'none',reason:NO_PUBLIC_FEED},scope:'branch'},
 {id:'farmboy',name:'Farm Boy',match:/farm\s*boy/i,feed:{kind:'none',reason:NO_PUBLIC_FEED},scope:'branch'},
 {id:'longos',name:'Longo’s',match:/longo/i,feed:{kind:'none',reason:NO_PUBLIC_FEED},scope:'branch'},
 {id:'walmart',name:'Walmart',match:/walmart/i,feed:{kind:'none',reason:NO_PUBLIC_FEED},scope:'branch'},
 {id:'costco',name:'Costco',match:/costco/i,feed:{kind:'none',reason:NO_PUBLIC_FEED},scope:'branch'},
 {id:'giant-tiger',name:'Giant Tiger',match:/giant\s*tiger/i,feed:{kind:'none',reason:NO_PUBLIC_FEED},scope:'branch'},
 {id:'tnt',name:'T&T Supermarket',match:/t&t|t\s*&\s*t\s*supermarket/i,feed:{kind:'none',reason:NO_PUBLIC_FEED},scope:'branch'},
 // Independents already verified as serving a public CAD catalogue.
 {id:'goodnessme',name:'Goodness Me!',match:/goodness\s*me/i,feed:{kind:'shopify-public'},scope:'online-catalogue'},
 {id:'denningers',name:'Denninger’s',match:/denninger/i,feed:{kind:'shopify-public'},scope:'online-catalogue'},
];

export const chainFor=(name:string,brand='')=>CHAINS.find(c=>c.match.test(name)||(!!brand&&c.match.test(brand)))??null;

// Origins the collector may read without a discovery probe: these two are the
// reviewed, previously verified catalogues already shipped with the app.
export const SEEDED_ORIGINS:Record<string,{chainId:string;paths:string[]}>={
 'https://goodnessme.ca':{chainId:'goodnessme',paths:['/collections/produce-1/products.json?limit=250','/collections/food-drink-1/products.json?limit=250']},
 'https://denningers.com':{chainId:'denningers',paths:['/products.json?limit=250']},
};

// Ontario bounding box. Discovery refuses to look outside the province because
// the product only claims Ontario coverage.
export const ONTARIO_BOUNDS={minLat:41.6,maxLat:56.9,minLng:-95.2,maxLng:-74.3};
export const inOntario=(p:{lat:number;lng:number})=>p.lat>=ONTARIO_BOUNDS.minLat&&p.lat<=ONTARIO_BOUNDS.maxLat&&p.lng>=ONTARIO_BOUNDS.minLng&&p.lng<=ONTARIO_BOUNDS.maxLng;

// Paths a probe must never touch, whatever a discovered site advertises.
export const PROBE_DENIED=/\/(checkout|cart|account|login|admin|customer|orders?|payment|wallet|api\/graphql)(\/|$|\?)/i;

export type Pack = {amount:number;unit:'g'|'ml'|'each';label:string};
export type Offer = {id:string;sourceId:string;retailer:string;title:string;brand:string;url:string;price:number;currency:'CAD';pack:Pack|null;available:boolean;observedAt:string;expiresAt:string;scope:'online';tags:string[];previousPrice?:number};
export type SourceResult = {id:string;name:string;url:string;status:'ready'|'unavailable';message:string;checkedAt:string;offers:Offer[]};
export type MarketSnapshot = {sources:SourceResult[];collectedAt:string};
export type OfferSelection = Record<string,Record<string,string>>;
export const SOURCES = [
 {id:'goodnessme',name:'Goodness Me!',origin:'https://goodnessme.ca',paths:['/collections/produce-1/products.json?limit=250','/collections/food-drink-1/products.json?limit=250'],currency:'CAD' as const},
 {id:'denningers',name:'Denninger’s',origin:'https://denningers.com',paths:['/products.json?limit=250'],currency:'CAD' as const},
];

// Output policy.
//
// A language model is used here for language work: reading a messy shopping
// list, judging whether a catalogue title is really the product the household
// asked for, and writing the explanation. It is never the source of a fact.
//
// This file is the last check before anything a model wrote reaches the user.
// Money that did not come from a verified offer or from the app's own integer
// arithmetic is removed from the text and reported as a violation. Safety
// language about allergens is removed outright.
import type {SourcedOffer} from './provenance';

export type Violation={kind:'unverified-figure'|'safety-claim'|'unverified-store'|'fabricated-offer';detail:string};

export const AGENT_SYSTEM_PROMPT=`You are the matching agent inside Aisle, a grocery price app for Ontario, Canada.

Your job is to decide which real retailer products correspond to the items on a household's list, and to explain your reasoning. You are working with tools that return real data collected moments ago.

Absolute rules:
1. You must never state a price, a total, a saving, a distance or a store address from your own knowledge. Every figure you mention must have come back from a tool in this conversation, quoted exactly as the tool returned it. If you do not have a figure, say that it is not available.
2. You must never invent a product, a store, a brand, a pack size or an offer id. Only refer to records the tools returned.
3. If the tools return nothing usable for a list item, say so plainly. An honest gap is the correct answer. Do not substitute a similar item and present it as the requested one, and do not estimate.
4. You cannot confirm a match on the household's behalf. Use propose_match; the household confirms in the app. Say that matches are proposals.
5. Retailer ingredient and allergen data is not verified here. Never describe a product as safe for an allergy, gluten-free, or suitable for a medical need. If the profile lists allergens, say that labels must be checked.
6. Prices come from online catalogues. Never claim they are the price at a specific branch, and never tell the household to travel somewhere because of an online price.
7. Respect hard constraints exactly: excluded products, locked items, protected brands and category locks are not negotiable, regardless of price.

Work in this order: read the profile and list, find stores, collect prices, search the collected offers, propose matches for what genuinely matches, flag what does not, then compute the basket. Be brief.`;

const MONEY=/(?:\$\s?\d[\d,]*(?:\.\d{1,2})?)|(?:\b\d[\d,]*\.\d{2}\s?(?:CAD|cad|dollars)\b)/g;
const DISTANCE=/\b\d+(?:\.\d+)?\s?(?:km|kilometres|kilometers|miles)\b/gi;
const SAFETY=/\b(?:allergy[-\s]?safe|safe for (?:your|their|a) (?:allergy|allergies)|allergen[-\s]?free|guaranteed gluten[-\s]?free|suitable for (?:celiac|coeliac))\b/gi;

const normalizeFigure=(value:string)=>value.replace(/[^0-9.]/g,'').replace(/^0+(?=\d)/,'');

/** The complete set of money strings the narrative is permitted to contain. */
export function allowedFigures(offers:SourcedOffer[],totals:number[]):Set<string>{
 const figures=new Set<string>();
 const add=(cents:number)=>{
  if(!Number.isFinite(cents))return;
  figures.add(normalizeFigure((cents/100).toFixed(2)));
  figures.add(normalizeFigure(String(cents)));
 };
 for(const offer of offers)add(offer.price);
 for(const total of totals)add(total);
 add(0);
 return figures;
}

/** The set of distances the narrative may quote, as returned by discovery. */
export const allowedDistances=(kms:number[])=>new Set(kms.map(km=>normalizeFigure(km.toFixed(1))));

export function reviewNarrative(text:string,figures:Set<string>,distances:Set<string>,offerIds:Set<string>){
 const violations:Violation[]=[];
 let safe=text.replace(SAFETY,match=>{
  violations.push({kind:'safety-claim',detail:`Removed an allergen-safety claim: "${match}"`});
  return '[removed: Aisle cannot verify allergen information]';
 });
 safe=safe.replace(MONEY,match=>{
  if(figures.has(normalizeFigure(match)))return match;
  violations.push({kind:'unverified-figure',detail:`Removed "${match}", which no collected price or computed total supports`});
  return '[figure not verified]';
 });
 safe=safe.replace(DISTANCE,match=>{
  const value=normalizeFigure(match.replace(/[a-z]/gi,''));
  if(distances.has(value)||distances.has(normalizeFigure(Number(value).toFixed(1))))return match;
  violations.push({kind:'unverified-store',detail:`Removed "${match}", which the store directory did not return`});
  return '[distance not verified]';
 });
 // A quoted offer id that is not in the collected pool means the model produced
 // a record that does not exist. That is the failure this whole file exists for.
 for(const quoted of safe.match(/\b[a-z0-9-]+:\d{6,}\b/gi)??[]){
  if(!offerIds.has(quoted))violations.push({kind:'fabricated-offer',detail:`Referenced offer "${quoted}" was not in the collected results`});
 }
 return {text:safe,violations};
}

/** Applied to every rationale string a model attaches to a proposed match. */
export function reviewRationale(text:string,figures:Set<string>){
 return reviewNarrative(text.slice(0,400),figures,new Set(),new Set()).text;
}

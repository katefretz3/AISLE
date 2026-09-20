// Provenance ledger.
//
// The rule this file enforces: Aisle may only show a price that came out of a
// specific HTTP response it actually received. Every offer carries an
// `evidenceId` that has to resolve to a row in the ledger, and every row keeps
// the response status, byte count, SHA-256 of the body and the moment it was
// read. A price with no row cannot be displayed, ranked, or summed. There is no
// code path that mints an offer from a model, a heuristic or a cached guess.
import type {Offer} from './types';

export type Evidence = {
 id:string;
 origin:string;
 url:string;
 method:'GET'|'POST';
 status:number;
 bytes:number;
 bodyHash:string;
 fetchedAt:string;
 adapter:string;
 note:string;
};
export type EvidenceInput = Omit<Evidence,'id'|'bodyHash'|'bytes'>&{body:string};

const encoder=new TextEncoder();
export async function sha256(text:string):Promise<string>{
 const digest=await crypto.subtle.digest('SHA-256',encoder.encode(text));
 return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
}

/** Bounded, append-only record of what was fetched during one agent run. */
export class EvidenceLedger {
 private rows=new Map<string,Evidence>();
 private consumed=0;
 constructor(readonly maxBytes=12_000_000){}
 get bytes(){return this.consumed;}
 get exhausted(){return this.consumed>=this.maxBytes;}
 async record(input:EvidenceInput):Promise<Evidence>{
  const bytes=encoder.encode(input.body).byteLength;
  if(this.consumed+bytes>this.maxBytes)throw new Error('Evidence budget exceeded for this run');
  const bodyHash=await sha256(input.body);
  // Same URL + same bytes on the wire is the same observation; keep one row.
  const id=await sha256(`${input.method} ${input.url} ${bodyHash}`);
  const row:Evidence={id,origin:input.origin,url:input.url,method:input.method,status:input.status,bytes,bodyHash,fetchedAt:input.fetchedAt,adapter:input.adapter,note:input.note};
  if(!this.rows.has(id)){this.rows.set(id,row);this.consumed+=bytes;}
  return this.rows.get(id)!;
 }
 get(id:string){return this.rows.get(id)??null;}
 has(id:string){return this.rows.has(id);}
 all():Evidence[]{return [...this.rows.values()];}
}

export type SourcedOffer = Offer&{evidenceId:string;excerpt:string};
export type OfferFault = 'no-evidence'|'unknown-evidence'|'bad-status'|'not-cad'|'bad-price'|'expired'|'future-observation'|'unavailable';

/**
 * The gate. Anything that fails here never reaches the basket arithmetic or the
 * interface. Faults are reported, not repaired: an offer we cannot stand behind
 * becomes a visible gap in the plan rather than a filled-in number.
 */
export function faultsOf(offer:SourcedOffer,ledger:EvidenceLedger,now:number):OfferFault[]{
 const faults:OfferFault[]=[];
 if(!offer.evidenceId)faults.push('no-evidence');
 else{
  const row=ledger.get(offer.evidenceId);
  if(!row)faults.push('unknown-evidence');
  else if(row.status!==200)faults.push('bad-status');
 }
 if(offer.currency!=='CAD')faults.push('not-cad');
 if(!Number.isInteger(offer.price)||offer.price<=0||offer.price>100000)faults.push('bad-price');
 if(!(Date.parse(offer.expiresAt)>now))faults.push('expired');
 if(!(Date.parse(offer.observedAt)<=now+60000))faults.push('future-observation');
 if(!offer.available)faults.push('unavailable');
 return faults;
}
export const isTrustworthy=(offer:SourcedOffer,ledger:EvidenceLedger,now:number)=>faultsOf(offer,ledger,now).length===0;
export function verifiedOffers(offers:SourcedOffer[],ledger:EvidenceLedger,now:number){
 const kept:SourcedOffer[]=[];const rejected:{offer:SourcedOffer;faults:OfferFault[]}[]=[];
 for(const offer of offers){const faults=faultsOf(offer,ledger,now);if(faults.length)rejected.push({offer,faults});else kept.push(offer);}
 return {kept,rejected};
}

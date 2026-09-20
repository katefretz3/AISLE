// The only way the agent reaches the network.
//
// Tool arguments are chosen by a language model, so a URL must never be taken
// on trust. Every read passes an allow-list check first: HTTPS only, no
// credentials, no non-standard port, host must already be known to this run
// from the registry or from OpenStreetMap discovery, and the path must not be
// an account, cart or checkout route. There is no user- or model-supplied
// origin that skips this.
import {Capacitor,CapacitorHttp} from '@capacitor/core';
import {PROBE_DENIED} from './registry';

export type ReadResult={url:string;status:number;body:string;bytes:number;fetchedAt:string};
export type Reader=(url:string,init?:{method?:'GET'|'POST';body?:string;headers?:Record<string,string>})=>Promise<ReadResult>;

export class OriginGuard {
 private hosts=new Set<string>();
 allow(origin:string){const host=safeHost(origin);if(host)this.hosts.add(host);return this;}
 allows(origin:string){const host=safeHost(origin);return !!host&&this.hosts.has(host);}
 get origins(){return [...this.hosts].map(h=>`https://${h}`);}
}
export function safeHost(value:string):string|null{
 try{
  const url=new URL(value);
  if(url.protocol!=='https:'||url.username||url.password)return null;
  if(url.port&&url.port!=='443')return null;
  if(!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname))return null;
  // Block anything that resolves inward. Public retailer catalogues only.
  if(/^(localhost|.*\.local|.*\.internal)$/i.test(url.hostname))return null;
  if(/^(\d{1,3}\.){3}\d{1,3}$/.test(url.hostname))return null;
  return url.hostname.toLowerCase();
 }catch{return null;}
}
export function assertReadable(url:string,guard:OriginGuard){
 const host=safeHost(url);
 if(!host)throw new Error(`Refused: ${url} is not a plain public HTTPS address`);
 if(!guard.allows(url))throw new Error(`Refused: ${host} is not in this run's allow-list`);
 if(PROBE_DENIED.test(new URL(url).pathname))throw new Error(`Refused: ${new URL(url).pathname} is an account or checkout route`);
}

const MAX_BYTES=4_000_000;
const AGENT='AisleOntario/1.0 (+https://github.com/katefretz3/AISLE; grocery price research)';

/** Capacitor HTTP on device, fetch in the browser; identical limits on both. */
export function createReader(guard:OriginGuard,timeoutMs=12000):Reader{
 return async (url,init={})=>{
  assertReadable(url,guard);
  const method=init.method??'GET';
  const headers={Accept:'application/json,text/plain,*/*','User-Agent':AGENT,...init.headers};
  const fetchedAt=new Date().toISOString();
  if(Capacitor.isNativePlatform()){
   const response=method==='POST'
    ? await CapacitorHttp.post({url,headers,data:init.body??'',responseType:'text',connectTimeout:timeoutMs,readTimeout:timeoutMs})
    : await CapacitorHttp.get({url,headers,responseType:'text',connectTimeout:timeoutMs,readTimeout:timeoutMs});
   const body=typeof response.data==='string'?response.data:JSON.stringify(response.data);
   if(body.length>MAX_BYTES)throw new Error('Response exceeded the size limit');
   return {url,status:response.status,body,bytes:body.length,fetchedAt};
  }
  const response=await fetch(url,{method,headers,body:init.body,redirect:'manual',signal:AbortSignal.timeout(timeoutMs)});
  const reader=response.body?.getReader();
  if(!reader)return {url,status:response.status,body:'',bytes:0,fetchedAt};
  const decoder=new TextDecoder();let body='',bytes=0;
  for(;;){
   const {value,done}=await reader.read();
   if(done)break;
   bytes+=value.byteLength;
   if(bytes>MAX_BYTES){await reader.cancel();throw new Error('Response exceeded the size limit');}
   body+=decoder.decode(value,{stream:true});
  }
  return {url,status:response.status,body:body+decoder.decode(),bytes,fetchedAt};
 };
}

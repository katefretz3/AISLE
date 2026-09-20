// Reference reasoning broker.
//
// The mobile app holds no API key. It posts the agent's conversation here, and
// this handler attaches the key server-side and forwards to the Anthropic
// Messages API. Deploy it wherever you already run a small HTTPS service
// (Cloudflare Workers, Deno Deploy, or Node behind your own TLS) and set
// VITE_AISLE_AGENT_ENDPOINT in the app build to its URL.
//
// It deliberately forwards very little: a model id from an allow-list, a token
// cap, the system prompt, the tool schemas and the messages. It never returns
// the key, and it never adds data of its own to the conversation — the app's
// policy layer assumes everything factual came from the app's own tools.
//
// This handler is a plain `(Request) => Promise<Response>`, so it runs on any
// Fetch-API runtime.

const ANTHROPIC_URL='https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION='2023-06-01';

// Pin the models you are willing to pay for. An unknown id is rejected rather
// than passed through.
const ALLOWED_MODELS=new Set(['claude-sonnet-5','claude-opus-5','claude-haiku-4-5-20251001']);
const MAX_TOKENS=4096;
const MAX_BODY_BYTES=400_000;

export type BrokerEnv={ANTHROPIC_API_KEY:string;ALLOWED_ORIGIN?:string};

const corsHeaders=(origin:string)=>({
 'Access-Control-Allow-Origin':origin,
 'Access-Control-Allow-Headers':'Content-Type',
 'Access-Control-Allow-Methods':'POST,OPTIONS',
 'Vary':'Origin',
});
const json=(body:unknown,status:number,origin:string)=>
 new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...corsHeaders(origin)}});

export async function handleAgentRequest(request:Request,env:BrokerEnv):Promise<Response>{
 const origin=env.ALLOWED_ORIGIN??'*';
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:corsHeaders(origin)});
 if(request.method!=='POST')return json({error:{message:'Use POST'}},405,origin);
 if(!env.ANTHROPIC_API_KEY)return json({error:{message:'The reasoning service is not configured'}},503,origin);

 const raw=await request.text();
 if(raw.length>MAX_BODY_BYTES)return json({error:{message:'Request too large'}},413,origin);

 let payload:{model?:unknown;max_tokens?:unknown;system?:unknown;tools?:unknown;messages?:unknown};
 try{payload=JSON.parse(raw);}catch{return json({error:{message:'Malformed request body'}},400,origin);}

 const model=typeof payload.model==='string'?payload.model:'';
 if(!ALLOWED_MODELS.has(model))return json({error:{message:'Unsupported model'}},400,origin);
 if(!Array.isArray(payload.messages)||!payload.messages.length)return json({error:{message:'messages is required'}},400,origin);
 if(payload.tools!==undefined&&!Array.isArray(payload.tools))return json({error:{message:'tools must be an array'}},400,origin);
 if(payload.system!==undefined&&typeof payload.system!=='string')return json({error:{message:'system must be a string'}},400,origin);

 const maxTokens=Math.min(MAX_TOKENS,Math.max(256,Number(payload.max_tokens)||1024));
 const upstream=await fetch(ANTHROPIC_URL,{
  method:'POST',
  headers:{'Content-Type':'application/json','x-api-key':env.ANTHROPIC_API_KEY,'anthropic-version':ANTHROPIC_VERSION},
  body:JSON.stringify({model,max_tokens:maxTokens,system:payload.system,tools:payload.tools,messages:payload.messages}),
 });

 if(!upstream.ok){
  // Surface the status, never the upstream body: it can echo request content.
  return json({error:{message:`Reasoning service returned HTTP ${upstream.status}`}},upstream.status===429?429:502,origin);
 }
 const reply=await upstream.json() as {content?:unknown;stop_reason?:unknown};
 return json({content:reply.content??[],stop_reason:reply.stop_reason??'end_turn'},200,origin);
}

// Cloudflare Workers / Deno Deploy entry point.
export default {fetch:(request:Request,env:BrokerEnv)=>handleAgentRequest(request,env)};

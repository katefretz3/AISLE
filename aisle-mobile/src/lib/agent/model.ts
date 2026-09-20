// Language-model client.
//
// The app never holds an API key. Requests go to a broker that the operator
// runs (see `server/agent-broker.ts`), which attaches the key server-side and
// forwards to the Anthropic Messages API. If no broker is configured the whole
// agent still runs — the orchestrator falls back to its deterministic planner
// and says so in the interface. AI is how the plan is reasoned about, never
// where the data comes from.
import type {Tool,ToolContext} from './tools';
import {toolByName,toolSchemasForModel} from './tools';

export type BrokerConfig={endpoint:string;model:string;maxTokens:number;headers:Record<string,string>};

export function brokerConfig():BrokerConfig|null{
 const env=(import.meta as unknown as {env?:Record<string,string|undefined>}).env??{};
 const endpoint=env.VITE_AISLE_AGENT_ENDPOINT;
 if(!endpoint||!/^https:\/\//.test(endpoint))return null;
 return {endpoint,model:env.VITE_AISLE_AGENT_MODEL||'claude-sonnet-5',maxTokens:Number(env.VITE_AISLE_AGENT_MAX_TOKENS||2048),headers:{'Content-Type':'application/json'}};
}

type TextBlock={type:'text';text:string};
type ToolUseBlock={type:'tool_use';id:string;name:string;input:unknown};
type ContentBlock=TextBlock|ToolUseBlock;
type Message={role:'user'|'assistant';content:string|unknown[]};
type BrokerReply={content:ContentBlock[];stop_reason:string};

export type LoopEvent=
 |{type:'thinking';text:string}
 |{type:'tool';name:string;args:unknown;result:unknown;ms:number;refused:boolean}
 |{type:'error';message:string};

export type LoopOutcome={narrative:string;steps:number;toolCalls:number;stopped:'complete'|'budget'|'deadline'|'error';error?:string};

async function callBroker(config:BrokerConfig,body:unknown,signal?:AbortSignal):Promise<BrokerReply>{
 const response=await fetch(config.endpoint,{method:'POST',headers:config.headers,body:JSON.stringify(body),signal});
 if(!response.ok)throw new Error(`Reasoning service returned HTTP ${response.status}`);
 const payload=await response.json() as Partial<BrokerReply>&{error?:{message?:string}};
 if(payload.error)throw new Error(payload.error.message||'Reasoning service reported an error');
 if(!Array.isArray(payload.content))throw new Error('Reasoning service returned an unexpected response');
 return {content:payload.content as ContentBlock[],stop_reason:payload.stop_reason??'end_turn'};
}

/**
 * Drive the model until it stops asking for tools. Every tool result the model
 * sees is produced by our own handler, so the conversation cannot be steered
 * into inventing data: the worst a bad call can do is get refused.
 */
export async function runToolLoop(input:{
 config:BrokerConfig;system:string;goal:string;ctx:ToolContext;maxSteps:number;
 onEvent?:(event:LoopEvent)=>void;signal?:AbortSignal;
}):Promise<LoopOutcome>{
 const {config,system,goal,ctx,maxSteps,onEvent,signal}=input;
 const messages:Message[]=[{role:'user',content:goal}];
 const tools=toolSchemasForModel();
 let narrative='',steps=0,toolCalls=0;
 for(;steps<maxSteps;steps++){
  if(Date.now()>ctx.budget.deadline)return {narrative,steps,toolCalls,stopped:'deadline'};
  if(ctx.counters.toolCalls>=ctx.budget.maxToolCalls)return {narrative,steps,toolCalls,stopped:'budget'};
  let reply:BrokerReply;
  try{
   reply=await callBroker(config,{model:config.model,max_tokens:config.maxTokens,system,tools,messages},signal);
  }catch(error){
   const message=error instanceof Error?error.message:'The reasoning service could not be reached';
   onEvent?.({type:'error',message});
   return {narrative,steps,toolCalls,stopped:'error',error:message};
  }
  const text=reply.content.filter((b):b is TextBlock=>b.type==='text').map(b=>b.text).join('\n').trim();
  if(text){narrative=text;onEvent?.({type:'thinking',text});}
  const requests=reply.content.filter((b):b is ToolUseBlock=>b.type==='tool_use');
  if(!requests.length)return {narrative,steps:steps+1,toolCalls,stopped:'complete'};
  messages.push({role:'assistant',content:reply.content});
  const results:unknown[]=[];
  for(const request of requests){
   const started=Date.now();
   const result=await executeTool(request.name,request.input,ctx);
   toolCalls+=1;ctx.counters.toolCalls+=1;
   onEvent?.({type:'tool',name:request.name,args:request.input,result,ms:Date.now()-started,refused:result.ok===false});
   results.push({type:'tool_result',tool_use_id:request.id,content:JSON.stringify(result).slice(0,60_000),is_error:result.ok===false});
  }
  messages.push({role:'user',content:results});
 }
 return {narrative,steps,toolCalls,stopped:'budget'};
}

async function executeTool(name:string,rawInput:unknown,ctx:ToolContext):Promise<{ok:boolean;[key:string]:unknown}>{
 const tool:Tool|null=toolByName(name);
 if(!tool)return {ok:false,refused:`There is no tool called ${name}`};
 const parsed=tool.schema.safeParse(rawInput??{});
 if(!parsed.success)return {ok:false,refused:`Those arguments are not valid: ${parsed.error.issues.map(i=>`${i.path.join('.')||'(root)'} ${i.message}`).join('; ')}`};
 try{
  return await tool.run(parsed.data,ctx);
 }catch(error){
  return {ok:false,refused:error instanceof Error?error.message:'That tool failed'};
 }
}

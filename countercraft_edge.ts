// Deploy as countercraft with verify_jwt=false: capabilities and verified owner JWTs
// are authenticated inside the service. No service secret is shipped to a browser.
import { createService } from './countercraft_service.mjs';
const url=Deno.env.get('SUPABASE_URL')!,key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const headers={'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json'};
async function json(response:Response){const data=await response.json();if(!response.ok)throw Error(data.message||data.error||'Service unavailable.');return data;}
const service=createService({
 rpc:async(action:string,scope:unknown,input:unknown)=>json(await fetch(url+'/rest/v1/rpc/countercraft_gateway',{method:'POST',headers,body:JSON.stringify({p_action:action,p_scope:scope,p_input:input})})),
 auth:async(token:string)=>{const user=await json(await fetch(url+'/auth/v1/user',{headers:{apikey:key,Authorization:'Bearer '+token}}));let claims;try{claims=JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));}catch{throw Error('Owner session is invalid.');}if(claims.sub!==user.id||!claims.session_id||!Number.isFinite(claims.exp)||claims.exp*1000<=Date.now())throw Error('Owner session has expired.');return {userId:user.id,sessionId:claims.session_id,expiresAt:new Date(claims.exp*1000).toISOString()};},
 put:async(path:string,bytes:Uint8Array,mime:string)=>{const r=await fetch(url+'/storage/v1/object/countercraft-private/'+path,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':mime,'x-upsert':'false','Cache-Control':'no-store'},body:bytes});if(!r.ok)throw Error('Asset upload failed.');},
 get:async(path:string)=>{if(!/^[a-f0-9]{64}\/[a-f0-9-]{36}\/[a-f0-9]{64}-(photo-[0-2]\.jpg|proof\.png|artwork\.svg)$/.test(path))throw Error('Invalid private asset path.');const r=await fetch(url+'/storage/v1/object/authenticated/countercraft-private/'+path,{headers:{apikey:key,Authorization:'Bearer '+key}});if(!r.ok)throw Error('Saved media unavailable.');return {bytes:new Uint8Array(await r.arrayBuffer()),mime:(r.headers.get('content-type')||'').split(';')[0]};},
 remove:async(path:string)=>{const r=await fetch(url+'/storage/v1/object/countercraft-private',{method:'DELETE',headers,body:JSON.stringify({prefixes:[path]})});if(!r.ok)throw Error('Orphan cleanup was not confirmed.');},
 logout:async(token:string)=>{const r=await fetch(url+'/auth/v1/logout?scope=local',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+token}});if(!r.ok)throw Error('Server sign-out could not be confirmed.');}
});
const cors={'Access-Control-Allow-Origin':'https://jdaniel318-ctrl.github.io','Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Content-Type':'application/json'};
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(req.method!=='POST'||(req.headers.get('origin')&&req.headers.get('origin')!=='https://jdaniel318-ctrl.github.io'))return new Response('{"error":"Request unavailable."}',{status:403,headers:cors});
 try{const reader=req.body?.getReader();if(!reader)throw Error('Request body required.');const chunks:Uint8Array[]=[];let size=0;for(;;){const r=await reader.read();if(r.done)break;size+=r.value.length;if(size>12*1048576){await reader.cancel();throw Error('Request too large.');}chunks.push(r.value);}const body=new Uint8Array(size);let offset=0;for(const c of chunks){body.set(c,offset);offset+=c.length;}const payload=JSON.parse(new TextDecoder().decode(body));const result=await service(payload,(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,''));return new Response(JSON.stringify(result),{headers:cors});}
 catch(e){return new Response(JSON.stringify({error:String((e as Error).message||'This action could not be confirmed.').slice(0,600),...((e as any).code==='review-required'?{code:'review-required',publication:(e as any).publication}:{})}),{status:400,headers:cors});}
});

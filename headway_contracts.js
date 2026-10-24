/* Headway 8.8.20.55 — pure, scoped test-job contracts.
 * No network, permission grants, live storage, automatic retry, or production geometry.
 * Preview fixtures are never server-authorized owner decisions. */
(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root&&root.document)root.BlackFlagHeadway=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const PID='ikes-wood-signs',SCHEMA='headway-job-v1',POLICY='ike-nominal-v1';
const clone=x=>JSON.parse(JSON.stringify(x));
const fail=code=>{throw new Error(code);};
const finite=n=>typeof n==='number'&&Number.isFinite(n);
function clean(value){
 if(value===null||typeof value==='string'||typeof value==='boolean')return value;
 if(typeof value==='number'){if(!Number.isFinite(value))fail('nonfinite-data');return value;}
 if(Array.isArray(value))return value.map(clean);
 if(value&&typeof value==='object'){const out={};for(const k of Object.keys(value).sort()){if(['__proto__','prototype','constructor'].includes(k))fail('unsafe-object-key');if(value[k]!==undefined)out[k]=clean(value[k]);}return out;}
 fail('unsupported-data');
}
const canonical=x=>JSON.stringify(clean(x));
// Standard SHA-256 fallback for isolated contexts without WebCrypto; tested against known vectors.
function digestBytes(data){
 const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
 const h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19],n=data.length,b=new Uint8Array(Math.ceil((n+9)/64)*64);b.set(data);b[n]=128;const dv=new DataView(b.buffer);dv.setUint32(b.length-8,Math.floor(n/536870912));dv.setUint32(b.length-4,(n*8)>>>0);const r=(x,n)=>(x>>>n)|(x<<(32-n)),w=new Uint32Array(64);
 for(let off=0;off<b.length;off+=64){for(let i=0;i<16;i++)w[i]=dv.getUint32(off+4*i);for(let i=16;i<64;i++){const a=w[i-15],c=w[i-2];w[i]=(w[i-16]+(r(a,7)^r(a,18)^(a>>>3))+w[i-7]+(r(c,17)^r(c,19)^(c>>>10)))>>>0;}let[a,c,d,e,f,g,j,k]=h;for(let i=0;i<64;i++){const t1=(k+(r(f,6)^r(f,11)^r(f,25))+((f&g)^(~f&j))+K[i]+w[i])>>>0,t2=((r(a,2)^r(a,13)^r(a,22))+((a&c)^(a&d)^(c&d)))>>>0;k=j;j=g;g=f;f=(e+t1)>>>0;e=d;d=c;c=a;a=(t1+t2)>>>0;}[a,c,d,e,f,g,j,k].forEach((x,i)=>h[i]=(h[i]+x)>>>0);}
 return h.map(x=>x.toString(16).padStart(8,'0')).join('');
}
async function sha256(text){const b=new TextEncoder().encode(String(text));if(globalThis.crypto?.subtle){const a=await globalThis.crypto.subtle.digest('SHA-256',b);return Array.from(new Uint8Array(a),x=>x.toString(16).padStart(2,'0')).join('');}return digestBytes(b);}
function image(v){return typeof v==='string'&&v.length<40000000&&/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=\r\n]+$/.test(v);}
function context(c){if(!c||c.projectId!==PID||!c.plankId||!/^[a-f0-9]{64}$/.test(c.photoHash||'')||!Number.isFinite(Date.parse(c.now)))fail('invalid-plank-context');}
function previewSize(c,feet){context(c);if(c.mode!=='preview'||!finite(feet)||feet<=0||feet>20)fail('invalid-preview-size');return {schema:'headway-size-v1',projectId:PID,plankId:c.plankId,photoHash:c.photoHash,nominalFeet:feet,source:'preview_fixture',policyRevision:POLICY,decidedAt:c.now,expiresAt:new Date(Date.parse(c.now)+3600000).toISOString()};}
function previewSpecies(c,id,name){context(c);if(c.mode!=='preview'||!['pine','cedar','red-oak','white-oak','walnut','hickory'].includes(id)||typeof name!=='string'||!name)fail('invalid-preview-species');return {schema:'headway-species-v1',projectId:PID,plankId:c.plankId,photoHash:c.photoHash,speciesId:id,speciesName:name,source:'preview_fixture',decidedAt:c.now,expiresAt:new Date(Date.parse(c.now)+3600000).toISOString()};}
function decisionBase(d,c,schema){try{context(c);if(!d||d.schema!==schema||d.projectId!==c.projectId||d.plankId!==c.plankId||d.photoHash!==c.photoHash)return {ok:false,code:'plank-mismatch'};if(d.source!=='preview_fixture')return {ok:false,code:'owner-service-not-activated'};if(!['preview','isolated_test'].includes(c.mode))return {ok:false,code:'preview-only'};const at=Date.parse(d.decidedAt),end=Date.parse(d.expiresAt),now=Date.parse(c.now);if(!Number.isFinite(at)||!Number.isFinite(end)||at>now+10000||end<=now||end<=at||end-at>3600000)return {ok:false,code:'decision-expired'};return {ok:true,code:'preview-simulation'};}catch(_){return {ok:false,code:'invalid-context'};}}
function validateSize(d,c){const r=decisionBase(d,c,'headway-size-v1');if(!r.ok)return r;return finite(d.nominalFeet)&&d.nominalFeet>0&&d.nominalFeet<=20&&d.policyRevision===POLICY?{...r,nominalFeet:d.nominalFeet}:{ok:false,code:'invalid-size'};}
function validateSpecies(d,c){const r=decisionBase(d,c,'headway-species-v1');if(!r.ok)return r;return ['pine','cedar','red-oak','white-oak','walnut','hickory'].includes(d.speciesId)&&typeof d.speciesName==='string'&&d.speciesName?{...r,speciesId:d.speciesId}:{ok:false,code:'invalid-species'};}
function draftFields(d){const keys=['projectId','plankId','photoData','photoOriginalData','photoQuarterTurns','photoLineageHash','topSide','usableRegion','obstacleAvoidance','renderVersion','wording','font','fontVersion','letterSize','fill','customColor','orientation','price','ratePerFoot','pricingRevision','sizeDecision','speciesDecision'];return Object.fromEntries(keys.map(k=>[k,d[k]===undefined?null:d[k]]));}
const fingerprint=d=>sha256(canonical(draftFields(d)));
async function approve(d,preview,generatedAt,approvedAt){if(d.projectId!==PID||!image(d.photoData)||!image(preview)||!String(d.wording||'').trim()||!finite(d.price)||d.price<0)fail('incomplete-design');const g=Date.parse(generatedAt),a=Date.parse(approvedAt);if(!Number.isFinite(g)||!Number.isFinite(a)||a<g)fail('invalid-approval-time');return {schema:'headway-approval-v1',draftHash:await fingerprint(d),previewHash:await sha256(preview),generatedAt,approvedAt,productionCertified:false};}
async function approvalMatches(a,d,p){return !!(a&&a.schema==='headway-approval-v1'&&a.draftHash===await fingerprint(d)&&image(p)&&a.previewHash===await sha256(p));}
async function jobPacket(order,approval,ctx){if(order.projectId!==PID||order.testMode!==true||!order.id||!ctx.operationId)fail('new-test-job-only');if(!validateSize(order.sizeDecision,ctx).ok||!validateSpecies(order.speciesDecision,ctx).ok)fail('decisions-not-verified');if(!await approvalMatches(approval,order,order.approvedPreviewData))fail('approval-changed');const source=order.photoOriginalData||order.photoData;if(!image(source)||await sha256(source)!==ctx.photoHash||order.photoLineageHash!==ctx.photoHash)fail('source-lineage-mismatch');const row=clean(order);row.headwayJob={schema:SCHEMA,revision:1,operationId:ctx.operationId,sourceHash:await sha256(row.photoData),originalHash:await sha256(source),previewHash:await sha256(row.approvedPreviewData),approval:clone(approval),nominalSize:clone(row.sizeDecision),speciesDecision:clone(row.speciesDecision),mediaRepresentation:'app-resolution source + frozen approved preview',productionCertified:false};row.headwayJob.integrityHash=await sha256(canonical(row));return row;}
async function verifyJob(row,pid){try{if(!row||row.projectId!==pid||pid!==PID||row.testMode!==true||!row.id||row.headwayJob?.schema!==SCHEMA||!image(row.photoData)||!image(row.approvedPreviewData))return false;const c=clean(row),hash=c.headwayJob.integrityHash;delete c.headwayJob.integrityHash;return hash===await sha256(canonical(c))&&row.headwayJob.sourceHash===await sha256(row.photoData)&&row.headwayJob.originalHash===await sha256(row.photoOriginalData||row.photoData)&&row.photoLineageHash===row.headwayJob.originalHash&&row.headwayJob.previewHash===await sha256(row.approvedPreviewData);}catch(_){return false;}}
function transaction(record){const frozen=clean(record);let phase='prepared',attempted=false,pending=null;const result=error=>({state:phase,operationId:frozen.headwayJob?.operationId,error:error?String(error.message||error):''});
 async function read(ports){try{const got=await ports.get(frozen.id);if(!got){phase='not_found';return result();}if(!await verifyJob(got,frozen.projectId)||canonical(got)!==canonical(frozen))throw Error('saved-record-mismatch');phase='verified';return result();}catch(e){phase='unconfirmed';return result(e);}}
 return Object.freeze({state:()=>phase,snapshot:()=>clone(frozen),async submit(ports){if(!['preview','isolated_test','sea_trial'].includes(ports.mode))fail('live-activation-held');if(!await verifyJob(frozen,frozen.projectId))fail('invalid-job');if(ports.mode==='preview'){phase='preview';return result();}if(ports.mode==='sea_trial'&&frozen.headwayJob.nominalSize?.source==='preview_fixture')fail('preview-fixture-not-sea-trial');if(pending)return pending;if(attempted)return result();attempted=true;phase='pending';pending=(async()=>{try{await ports.put(clone(frozen));return await read(ports);}catch(e){phase='unconfirmed';return result(e);}finally{pending=null;}})();return pending;},async recheck(ports){if(pending)return pending;if(!attempted)return result();return read(ports);}});
}
/* Strongbox archival boundary: do not reuse clean() to validate legacy records.
 * The new-job canonical()/approval/transaction path above deliberately stays strict.
 * v1 stays readable; v2 encodes EVERY value as a typed tuple, preventing tag collisions.
 * Neither this codec nor rehearsal contains storage or network operations. */
const BACKUP_V1='headway-business-backup-v1',BACKUP_V2='strongbox-business-backup-v2';
const ARCHIVE_ENCODING='blackflag-typed-json-v1',UNSAFE_KEYS=new Set(['__proto__','prototype','constructor']);
const pointer=(base,key)=>base+'/'+String(key).replace(/~/g,'~0').replace(/\//g,'~1');
function archiveState(maxDepth=100,maxNodes=500000){return {active:new WeakSet(),nodes:0,specialValues:[],maxDepth,maxNodes};}
function archiveEncode(v,at,state,depth=0){
 if(depth>state.maxDepth)fail('backup-depth: '+at);
 if(++state.nodes>state.maxNodes)fail('backup-node-limit: '+at);
 const special=kind=>state.specialValues.push({path:at,kind});
 if(v===null)return ['null'];
 if(typeof v==='string')return ['string',v];
 if(typeof v==='boolean')return ['boolean',v];
 if(typeof v==='undefined'){special('undefined');return ['undefined'];}
 if(typeof v==='number'){
  let kind=Number.isNaN(v)?'NaN':v===Infinity?'Infinity':v===-Infinity?'-Infinity':Object.is(v,-0)?'-0':null;
  if(kind){special(kind);return ['special',kind];}return ['number',v];
 }
 if(typeof v!=='object')fail('unsupported-backup-type: '+at);
 if(state.active.has(v))fail('cyclic-backup-data: '+at);
 const proto=Object.getPrototypeOf(v),array=Array.isArray(v);
 if(!array&&proto!==Object.prototype&&proto!==null)fail('unsupported-backup-type: '+at);
 if(Object.getOwnPropertySymbols(v).length)fail('unsupported-backup-symbol: '+at);
 const descriptors=Object.getOwnPropertyDescriptors(v);
 for(const key of Object.keys(descriptors)){
  const d=descriptors[key];if(array&&key==='length')continue;
  if(UNSAFE_KEYS.has(key))fail('unsafe-object-key: '+pointer(at,key));
  if(!Object.hasOwn(d,'value')||!d.enumerable)fail('unsupported-backup-property: '+pointer(at,key));
 }
 state.active.add(v);
 try{
  if(array){
   if(v.length>100000)fail('backup-array-limit: '+at);
   const entries=[];for(const key of Object.keys(descriptors)){
    if(key==='length')continue;
    const i=Number(key);if(!Number.isInteger(i)||i<0||i>=v.length||String(i)!==key)fail('unsupported-backup-array-property: '+pointer(at,key));
   }
   let holes=0;for(let i=0;i<v.length;i++){if(Object.hasOwn(descriptors,i))entries.push([i,archiveEncode(descriptors[i].value,pointer(at,i),state,depth+1)]);else holes++;}
   if(holes)special('sparse-array');
   return ['array',v.length,entries];
  }
  if(proto===null)special('null-prototype-object');
  return ['object',Object.keys(descriptors).sort().map(key=>[key,archiveEncode(descriptors[key].value,pointer(at,key),state,depth+1)]),proto===null?'null-prototype':'plain'];
 }finally{state.active.delete(v);}
}
function archiveDecode(w,at,state,depth=0){
 if(depth>state.maxDepth)fail('backup-depth: '+at);
 if(++state.nodes>state.maxNodes)fail('backup-node-limit: '+at);
 const bad=()=>fail('backup-wire: '+at);
 if(!Array.isArray(w)||typeof w[0]!=='string')return bad();
 switch(w[0]){
  case 'null':if(w.length!==1)return bad();return null;
  case 'undefined':if(w.length!==1)return bad();return undefined;
  case 'string':if(w.length!==2||typeof w[1]!=='string')return bad();return w[1];
  case 'boolean':if(w.length!==2||typeof w[1]!=='boolean')return bad();return w[1];
  case 'number':if(w.length!==2||!finite(w[1])||Object.is(w[1],-0))return bad();return w[1];
  case 'special':{
   if(w.length!==2||typeof w[1]!=='string')return bad();
   if(w[1]==='NaN')return NaN;if(w[1]==='Infinity')return Infinity;if(w[1]==='-Infinity')return -Infinity;if(w[1]==='-0')return -0;return bad();
  }
  case 'array':{
   if(w.length!==3||!Number.isInteger(w[1])||w[1]<0||w[1]>100000||!Array.isArray(w[2]))return bad();
   const out=new Array(w[1]);let previous=-1;
   for(const entry of w[2]){
    if(!Array.isArray(entry)||entry.length!==2||!Number.isInteger(entry[0])||entry[0]<=previous||entry[0]>=w[1])return bad();
    previous=entry[0];out[entry[0]]=archiveDecode(entry[1],pointer(at,entry[0]),state,depth+1);
   }return out;
  }
  case 'object':{
   if(w.length!==3||!Array.isArray(w[1])||!['plain','null-prototype'].includes(w[2]))return bad();
   const out=w[2]==='plain'?{}:Object.create(null);let previous=null;
   for(const entry of w[1]){
    if(!Array.isArray(entry)||entry.length!==2||typeof entry[0]!=='string')return bad();const key=entry[0];
    if(UNSAFE_KEYS.has(key))fail('unsafe-object-key: '+pointer(at,key));
    if(previous!==null&&key<=previous)return bad();previous=key;
    Object.defineProperty(out,key,{value:archiveDecode(entry[1],pointer(at,key),state,depth+1),enumerable:true,configurable:true,writable:true});
   }return out;
  }
  default:return bad();
 }
}
function archiveRows(rows){
 if(!Array.isArray(rows)||rows.length>10000)fail('invalid-backup');
 const state=archiveState(),wire=[];
 for(let i=0;i<rows.length;i++){if(!Object.hasOwn(rows,i))fail('backup-scope-or-duplicate');wire.push(archiveEncode(rows[i],'/rows/'+i,state));}
 return {wire,specialValues:state.specialValues};
}
function checkRows(pid,rows){
 if(typeof pid!=='string'||!pid||!Array.isArray(rows)||rows.length>10000)fail('invalid-backup');
 const seen=new Set();for(const r of rows){
  const validId=r&&(typeof r.id==='string'&&r.id.length>0||finite(r.id));
  if(!r||Array.isArray(r)||r.projectId!==pid||!validId||seen.has(r.id)||(r.isolation?.projectId&&r.isolation.projectId!==pid)||(r.namespace&&r.namespace!=='bf.project.'+pid))fail('backup-scope-or-duplicate');
  seen.add(r.id);
 }
}
async function backup(projectId,rows){
 const encoded=archiveRows(rows);checkRows(projectId,rows);
 const special=encoded.specialValues.length>0;
 const b={schema:special?BACKUP_V2:BACKUP_V1,projectId,createdAt:new Date().toISOString(),rows:special?encoded.wire:clean(rows),count:rows.length,includes:'Complete supplied order rows including supported stored media; no credentials or settings are requested.'};
 if(special){b.encoding=ARCHIVE_ENCODING;b.specialValues=encoded.specialValues;}
 b.integrityHash=await sha256(canonical(b));return b;
}
async function readBackupRows(b,pid){
 // Validate the JSON envelope before hashing: no getters, special JS values, cycles or exotic objects.
 const safe=archiveState(450,4000000);archiveEncode(b,'',safe);
 if(safe.specialValues.length)fail('backup-wire-not-json');
 const c=clean(b);
 if(!c||!([BACKUP_V1,BACKUP_V2].includes(c.schema))||c.projectId!==pid||!Array.isArray(c.rows)||c.rows.length>10000||c.count!==c.rows.length)fail('backup-identity');
 const hash=c.integrityHash;delete c.integrityHash;
 if(typeof hash!=='string'||hash!==await sha256(canonical(c)))fail('backup-integrity');
 let rows;
 if(c.schema===BACKUP_V1){rows=clone(c.rows);archiveRows(rows);}
 else{
  if(c.encoding!==ARCHIVE_ENCODING||!Array.isArray(c.specialValues))fail('backup-wire');
  const state=archiveState();rows=c.rows.map((w,i)=>archiveDecode(w,'/rows/'+i,state));
  const check=archiveRows(rows);
  if(canonical(check.wire)!==canonical(c.rows))fail('backup-wire-noncanonical');
  if(canonical(check.specialValues)!==canonical(c.specialValues))fail('backup-special-manifest');
 }
 checkRows(pid,rows);return rows;
}
async function rehearse(b,pid){
 const rows=await readBackupRows(b,pid),encoded=archiveRows(rows),isolated=new Map(),state=archiveState();
 for(let i=0;i<rows.length;i++)isolated.set(rows[i].id,archiveDecode(encoded.wire[i],'/rows/'+i,state));
 const restored=Array.from(isolated.values()),again=archiveRows(restored);
 if(canonical(again.wire)!==canonical(encoded.wire)||canonical(again.specialValues)!==canonical(encoded.specialValues))fail('restore-readback');
 const specialValues=encoded.specialValues.map(x=>({...x,orderId:String(rows[Number(x.path.split('/')[2])].id)}));
 return {ok:true,projectId:pid,records:restored.length,sourcePhotos:restored.filter(r=>image(r.photoData)).length,approvedPreviews:restored.filter(r=>image(r.approvedPreviewData)).length,missingSourcePhotos:restored.filter(r=>!image(r.photoData)).length,missingPreviews:restored.filter(r=>!image(r.approvedPreviewData)).length,specialValues,specialValueCount:specialValues.length,restoreTarget:'isolated memory only; existing browser database untouched',integrityHash:b.integrityHash};
}
return Object.freeze({version:'8.8.20.55',canonical,sha256,image,previewSize,previewSpecies,validateSize,validateSpecies,fingerprint,approve,approvalMatches,jobPacket,verifyJob,transaction,backup,rehearse,readBackupRows});
});

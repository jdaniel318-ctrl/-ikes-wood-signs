/* Harbor storage safety. Read-only local inspection/capture; never grants authority or restores data. */
(function(g,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else g.BlackFlagStorageSafety=api;})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const VERSION=1,PRIMARY='blackFlagPlatformV1',ENVELOPES='darkSkyV4ProjectEnvelopesV1';
const DATABASES=Object.freeze([PRIMARY,'ikesWoodSignsV1','blackFlagGraphicsDB','bootstrapBuildScheduleDB','blackflag-ike-sign-requests-v1','blackflag-carvewright-v1','blackflag-carve-studio-v1','blackflag-carvewright-machining-v1','darkSkyDurableLedgerV1','blackFlagCharterGuardDraftsV1','dark-sky-upper-command-visuals-v1','blackflag-stormwake-voyages-v1']);
const LIMITS=Object.freeze({bytes:64*1024*1024,records:20000,timeout:8000,depth:40});
const businessKey=k=>/^(blackflag|darksky|bootstrapbuild|ikeswoodsigns|carvewright|schedulejoe|househull|stormwake|bf[.:-])/i.test(k);
const secretKey=k=>/(?:password|passphrase|credential|secret|token|session|nonce|csrf|(?:^|[_:-])pin(?:$|[_:-])|adminpin|enginepin|captainpin|pin(?:hash|code)?$|jwt|bearer|accesskey|apikey|privatekey|authorization)/i.test(String(k));
const fieldSecret=k=>/password|passphrase|credential|secret|token|nonce|csrf|^(?:pin|adminPin|enginePin|captainPin|authorization|session|accessKey|apiKey|privateKey|jwt|bearer)$|(?:recovery|gate|authority|preview|admin|engine|captain)Pin|session[_-]?(?:id|token)|(?:access|api|private)[_-]?key$/i.test(k);
const code=e=>String(e?.name||'ReadError').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,60)||'ReadError';
const bytes=s=>new TextEncoder().encode(String(s)).length;
function readJSON(storage,key){try{const raw=storage.getItem(key);if(raw===null)return {name:key,status:'missing',bytes:0,value:null};return {name:key,status:'read',bytes:bytes(raw),value:JSON.parse(raw)};}catch(e){return {name:key,status:'error',error:code(e),value:null};}}
function openExisting(factory,name,timeout=LIMITS.timeout){return new Promise((resolve,reject)=>{
 let req,settled=false,upgraded=false;
 const finish=(err,db)=>{if(settled){try{db?.close();}catch(_){}return;}settled=true;clearTimeout(timer);err?reject(err):resolve(db);};
 const timer=setTimeout(()=>finish(Object.assign(new Error('Open timed out'),{name:'OpenTimeout'})),timeout);
 try{req=factory.open(name);req.onupgradeneeded=()=>{upgraded=true;try{req.transaction.abort();}catch(_){}finish(Object.assign(new Error('Database not present; creation aborted'),{name:'DatabaseMissing'}));};
 req.onerror=()=>finish(upgraded?Object.assign(new Error('Database missing'),{name:'DatabaseMissing'}):req.error||new Error('Database open failed'));
 req.onblocked=()=>finish(Object.assign(new Error('Database busy'),{name:'DatabaseBlocked'}));
 req.onsuccess=()=>{if(upgraded||settled){try{req.result.close();}catch(_){}return;}req.result.onversionchange=()=>req.result.close();finish(null,req.result);};}
 catch(e){finish(e);}
});}
function roughSize(value,seen=new WeakSet(),depth=0){
 if(depth>LIMITS.depth)throw Object.assign(new Error('Value too deep'),{name:'DepthLimit'});
 if(value===null||value===undefined)return 4;
 if(typeof value==='string')return bytes(value)+2;
 if(typeof value!=='object')return 16;
 if(seen.has(value))return 8;seen.add(value);
 if(typeof Blob!=='undefined'&&value instanceof Blob)return Math.ceil(value.size*4/3)+160;
 if(value instanceof ArrayBuffer||ArrayBuffer.isView(value))return Math.ceil(value.byteLength*4/3)+80;
 let sum=32;
 if(value instanceof Map){for(const [k,v]of value)sum+=roughSize(k,seen,depth+1)+roughSize(v,seen,depth+1);}
 else if(value instanceof Set){for(const v of value)sum+=roughSize(v,seen,depth+1);}
 else for(const k of Object.keys(value)){sum+=bytes(k)+roughSize(value[k],seen,depth+1);if(sum>LIMITS.bytes)break;}
 return sum;
}
function readStore(db,name,budget,timeout=LIMITS.timeout){return new Promise(resolve=>{
 const out={name,status:'read',count:0,records:[]};let txn,done=false;
 const finish=(error)=>{if(done)return;done=true;clearTimeout(timer);if(error){out.status='partial';out.error=typeof error==='string'?error:code(error);}out.count=out.records.length;resolve(out);};
 const timer=setTimeout(()=>{try{txn?.abort();}catch(_){}finish('ReadTimeout');},timeout);
 try{txn=db.transaction([name],'readonly');const req=txn.objectStore(name).openCursor();
 txn.oncomplete=()=>finish();txn.onerror=()=>finish(txn.error||new Error('Transaction failed'));txn.onabort=()=>finish(out.error||txn.error||'ReadAborted');
 req.onerror=()=>finish(req.error||new Error('Cursor failed'));
 req.onsuccess=()=>{if(done)return;const c=req.result;if(!c)return;
 try{const size=roughSize(c.key)+roughSize(c.value);if(out.records.length>=budget.maxRecords||budget.used+size>budget.maxBytes){out.error='CaptureLimit';try{txn.abort();}catch(_){}finish('CaptureLimit');return;}
 budget.used+=size;out.records.push({key:c.key,value:c.value});c.continue();}
 catch(e){try{txn.abort();}catch(_){}finish(e);}};
 }catch(e){finish(e);}
});}
async function readDatabase(factory,name,{stores=null,budget={used:0,maxBytes:LIMITS.bytes,maxRecords:LIMITS.records},timeout=LIMITS.timeout}={}){
 const out={kind:'indexeddb',name,status:'read',stores:[]};let db;
 try{db=await openExisting(factory,name,timeout);out.version=db.version;
 const names=stores||Array.from(db.objectStoreNames);
 for(const n of names){if(!db.objectStoreNames.contains(n)){out.stores.push({name:n,status:'missing',count:null,error:'StoreMissing',records:[]});out.status='partial';continue;}
 const s=await readStore(db,n,budget,timeout);out.stores.push(s);if(s.status!=='read')out.status='partial';}
 }catch(e){out.status=e?.name==='DatabaseMissing'?'not-present':'error';out.error=code(e);}
 finally{try{db?.close();}catch(_){}}
 return out;
}
function evaluateEnvelopes({projects=[],registry=[],localEnvelope={},dbEnvelope={},sources=[],schema=8}={}){
 const result={at:new Date().toISOString(),status:'complete',readOnly:true,total:Array.isArray(projects)?projects.length:0,checked:0,sealed:null,rows:[],sources:sources.map(s=>({name:s.name,status:s.status,error:s.error||null})),error:''};
 if(!Array.isArray(projects)||!Array.isArray(registry)||sources.some(s=>!['read','missing'].includes(s.status))){result.status='incomplete';result.error='One or more sources could not be read. No repair or commissioning was attempted.';return result;}
 const goodMap=x=>x&&typeof x==='object'&&!Array.isArray(x);
 if(!goodMap(localEnvelope)||!goodMap(dbEnvelope)){result.status='incomplete';result.error='Envelope projection has an invalid format.';return result;}
 const ids=new Set(),registryMap=new Map(),duplicate=new Set();for(const p of registry){const id=String(p?.id||'');if(registryMap.has(id))duplicate.add(id);registryMap.set(id,p);}
 const projectOK=(p,id)=>!!p&&Number(p.schemaVersion)===schema&&p.namespace==='bf.project.'+id&&p.isolation?.projectId===id&&p.isolation?.crossProjectAccess==='deny'&&p.permissions?.defaultDeny===true;
 const envelopeOK=(e,id)=>!!e&&e.projectId===id&&Number(e.schemaVersion)===schema&&e.namespace==='bf.project.'+id&&e.isolation?.projectId===id&&e.isolation?.namespace==='bf.project.'+id&&e.isolation?.crossProjectAccess==='deny'&&e.permissions?.defaultDeny===true&&e.permissions?.projectScoped===true;
 for(const p of projects){const id=String(p?.id||'');const r={projectId:id,name:String(p?.name||id),registryFound:registryMap.has(id),localEnvelope:envelopeOK(localEnvelope[id],id),dbEnvelope:envelopeOK(dbEnvelope[id],id),memorySealed:projectOK(p,id),registrySealed:projectOK(registryMap.get(id),id)&&!duplicate.has(id)};
 r.ok=!!id&&!ids.has(id)&&r.localEnvelope&&r.dbEnvelope&&r.memorySealed&&r.registrySealed;ids.add(id);result.rows.push(r);}
 result.checked=result.rows.length;result.sealed=result.rows.filter(r=>r.ok).length;
 if(!projects.length){result.status='incomplete';result.sealed=null;result.error='No in-memory vessels supplied; empty is not a commissioning pass.';}
 return result;
}
async function inspect({indexedDB:factory=globalThis.indexedDB,localStorage:storage=globalThis.localStorage,projects=[],schema=8,timeout=LIMITS.timeout}={}){
 const local=readJSON(storage,ENVELOPES),primary=await readDatabase(factory,PRIMARY,{stores:['projects','settings','orders'],timeout});
 const r=primary.stores.find(s=>s.name==='projects'),s=primary.stores.find(s=>s.name==='settings'),o=primary.stores.find(s=>s.name==='orders');
 const settings=new Map((s?.records||[]).map(x=>[x.value?.key,x.value?.value]));const mirror=settings.get(ENVELOPES);
 const sources=[{...local,value:undefined},{name:'canonical-projects',status:r?.status==='read'?'read':'error',error:r?.error||primary.error},{name:'settings-mirror',status:s?.status==='read'?'read':'error',error:s?.error||primary.error}];
 const result=evaluateEnvelopes({projects,registry:(r?.records||[]).map(x=>x.value),localEnvelope:local.status==='missing'?{}:local.value,dbEnvelope:mirror===undefined?{}:mirror,sources,schema});
 result.orders={status:o?.status||'error',error:o?.error||primary.error,rows:(o?.records||[]).map(x=>x.value)};
 result.registry=(r?.records||[]).map(x=>x.value);result.settingsStatus=s?.status||'error';result.settings=settings;
 return result;
}
function base64(buffer){const data=new Uint8Array(buffer);if(typeof Buffer!=='undefined')return Buffer.from(data).toString('base64');let text='';for(let i=0;i<data.length;i+=16384)text+=String.fromCharCode(...data.subarray(i,i+16384));return btoa(text);}
async function serialize(value,meta={omitted_fields:0},seen=new WeakSet(),depth=0){
 if(depth>LIMITS.depth)throw Object.assign(new Error('Depth limit'),{name:'DepthLimit'});
 if(value===undefined)return {$type:'Undefined'};if(typeof value==='bigint')return {$type:'BigInt',value:String(value)};
 if(typeof value==='number'&&!Number.isFinite(value))return {$type:'Number',value:String(value)};
 if(value===null||typeof value==='string'||typeof value==='number'||typeof value==='boolean')return value;
 if(typeof value!=='object')throw Object.assign(new Error('Unsupported value'),{name:'UnsupportedValue'});
 if(seen.has(value))throw Object.assign(new Error('Cyclic value'),{name:'CyclicValue'});seen.add(value);
 try{
 if(value instanceof Date)return {$type:'Date',value:value.toISOString()};
 if(typeof Blob!=='undefined'&&value instanceof Blob)return {$type:'Blob',mime:value.type,bytes:value.size,base64:base64(await value.arrayBuffer())};
 if(value instanceof ArrayBuffer)return {$type:'ArrayBuffer',bytes:value.byteLength,base64:base64(value)};
 if(ArrayBuffer.isView(value))return {$type:value.constructor.name,bytes:value.byteLength,base64:base64(value.buffer.slice(value.byteOffset,value.byteOffset+value.byteLength))};
 if(value instanceof Map){const entries=[];for(const [k,v]of value){if(typeof k==='string'&&secretKey(k)){meta.omitted_fields++;entries.push([k,{$omitted:'credential-map-value'}]);}else entries.push([await serialize(k,meta,seen,depth+1),await serialize(v,meta,seen,depth+1)]);}return {$type:'Map',entries};}
 if(value instanceof Set){const values=[];for(const v of value)values.push(await serialize(v,meta,seen,depth+1));return {$type:'Set',values};}
 if(Array.isArray(value)){const out=[];for(const v of value)out.push(await serialize(v,meta,seen,depth+1));return out;}
 const tag=Object.prototype.toString.call(value);if(tag!=='[object Object]')throw Object.assign(new Error('Unsupported structured data'),{name:'UnsupportedValue'});
 if(typeof value.key==='string'&&secretKey(value.key)){meta.omitted_fields++;return {$omitted:'credential-record'};}
 const out=Object.create(null);for(const k of Object.keys(value)){if(fieldSecret(k)){meta.omitted_fields++;out[k]={$omitted:'credential-field'};}else out[k]=await serialize(value[k],meta,seen,depth+1);}return out;
 }finally{seen.delete(value);}
}
async function capture({indexedDB:factory=globalThis.indexedDB,localStorage:storage=globalThis.localStorage,timeout=LIMITS.timeout,maxBytes=LIMITS.bytes,onProgress=()=>{},isAllowed=()=>true}={}){
 const budget={used:0,maxBytes:Math.min(maxBytes,LIMITS.bytes),maxRecords:LIMITS.records},meta={omitted_fields:0};
 const out={schema:'blackflag-local-capture-v1',scope:'LOCAL_BROWSER_RESCUE',created_at:new Date().toISOString(),coverage:{status:'partial',atomic:false,cloud_included:false,cache_included:false,session_included:false,restorable_claim:false},sources:[],errors:[],exclusions:{credential_records:0,credential_fields:0,unrelated_local_keys:0,unrecognized_databases:0},limits:{max_bytes:budget.maxBytes,max_records_per_store:budget.maxRecords},notes:['Read-only, sequential point-in-time capture, not a transactional fleet-wide backup.','Known authentication/session material excluded. Business text and photos are sensitive.','No database restore, authority grant, upload or cloud backup is performed.']};
 const access=()=>{if(!isAllowed())throw Object.assign(new Error('Engine access ended; capture discarded'),{name:'AccessEnded'});};access();
 const progress=(name)=>{access();onProgress(name);};
 const ls={kind:'localStorage',name:'known-application-keys',status:'read',count:0,entries:[]};out.sources.push(ls);progress('Reading local application records');
 try{const keys=[];for(let i=0;i<storage.length;i++){const k=storage.key(i);if(k!==null)keys.push(k);}for(const key of keys){access();
 if(!businessKey(key)){out.exclusions.unrelated_local_keys++;continue;}
 if(secretKey(key)){out.exclusions.credential_records++;continue;}
 try{const raw=storage.getItem(key);if(raw===null)throw Object.assign(new Error('Changed during capture'),{name:'RecordDisappeared'});
 const n=bytes(raw)+bytes(key);if(budget.used+n>budget.maxBytes)throw Object.assign(new Error('Limit'),{name:'CaptureLimit'});budget.used+=n;
 let v;try{v=JSON.parse(raw);}catch(_){ // Raw invalid JSON may contain credentials; retain no unsafe opaque content.
 out.errors.push({source:'localStorage',code:'UnparsedRecordOmitted'});ls.status='partial';continue;}
 const value=await serialize(v,meta);ls.entries.push({key,value,encoding:'redacted-json'});
 }catch(e){ls.status='partial';out.errors.push({source:'localStorage',code:code(e)});}}
 }catch(e){ls.status='partial';out.errors.push({source:'localStorage',code:code(e)});}ls.count=ls.entries.length;
 let catalog=null;
 try{if(typeof factory?.databases==='function')catalog=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Object.assign(new Error('Catalog timeout'),{name:'CatalogTimeout'})),timeout);Promise.resolve(factory.databases()).then(v=>{clearTimeout(timer);resolve(v);},e=>{clearTimeout(timer);reject(e);});});else out.errors.push({source:'catalog',code:'CatalogUnsupported'});}
 catch(e){out.errors.push({source:'catalog',code:code(e)});}
 if(catalog){out.exclusions.unrecognized_databases=catalog.filter(x=>!DATABASES.includes(x.name)).length;}
 for(const name of DATABASES){progress('Reading '+name);
 if(catalog&&!catalog.some(x=>x.name===name)){out.sources.push({kind:'indexeddb',name,status:'not-present',stores:[]});continue;}
 const d=await readDatabase(factory,name,{budget,timeout});access();
 for(const store of d.stores){const records=[];for(const row of store.records){
 const keyName=typeof row.key==='string'?row.key:String(row.value?.key||'');
 if(secretKey(keyName)){out.exclusions.credential_records++;continue;}
 try{records.push({key:await serialize(row.key,meta),value:await serialize(row.value,meta)});}catch(e){store.status='partial';d.status='partial';out.errors.push({source:name+'/'+store.name,code:code(e)});}}
 store.read_count=store.count;store.count=records.length;store.records=records;
 if(store.error)out.errors.push({source:name+'/'+store.name,code:store.error});}
 if(d.error&&d.status!=='not-present')out.errors.push({source:name,code:d.error});out.sources.push(d);
 }
 access();out.exclusions.credential_fields=meta.omitted_fields;
 out.coverage.status=out.errors.length||out.sources.some(s=>s.status==='partial'||s.status==='error')?'partial':'complete-listed-sources';
 out.coverage.definition='All readable allowlisted sources, subject to listed exclusions. Not all website data and not proven restore.';
 out.bytes_observed=budget.used;return out;
}
async function hash(value,crypto=globalThis.crypto){if(!crypto?.subtle)throw new Error('Secure hashing unavailable; rescue file cannot be verified.');return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');}
async function wrap(payload,build,crypto=globalThis.crypto){const text=JSON.stringify(payload);if(bytes(text)>96*1024*1024)throw new Error('Rescue file exceeds the safe export limit. No file was certified.');return {schema:'blackflag-private-rescue-v1',format_version:VERSION,build,created_at:new Date().toISOString(),checksum_algorithm:'SHA-256',sha256:await hash(text,crypto),payload};}
async function verify(text,crypto=globalThis.crypto){if(typeof text!=='string'||text.length>100*1024*1024)throw new Error('Rescue file is too large.');let d;try{d=JSON.parse(text);}catch(_){throw new Error('Rescue file is not valid JSON.');}
 if(d?.schema!=='blackflag-private-rescue-v1'||d.format_version!==VERSION||d.checksum_algorithm!=='SHA-256'||d.payload?.scope!=='LOCAL_BROWSER_RESCUE'||!['partial','complete-listed-sources'].includes(d.payload?.coverage?.status)||!Array.isArray(d.payload?.sources)||!Array.isArray(d.payload?.errors))throw new Error('Unsupported rescue-file format.');
 if(await hash(JSON.stringify(d.payload),crypto)!==d.sha256)throw new Error('Rescue checksum mismatch.');
 return {readback:true,coverage:d.payload.coverage.status,source_count:d.payload.sources.length,error_count:d.payload.errors.length,sha256:d.sha256,restored:false,authority_granted:false,note:'File integrity only; no restore or backup completeness is certified.'};}
function diagnostic(payload,build){return {schema:'blackflag-storage-diagnostic-v1',build,captured_at:payload.created_at||new Date().toISOString(),scope:'Counts and known store names only; no customer records or credentials',coverage:payload.coverage?.status||'unknown',sources:(payload.sources||[]).map(s=>({kind:s.kind,name:s.name,status:s.status,count:typeof s.count==='number'?s.count:null,stores:(s.stores||[]).map(t=>({name:t.name,status:t.status,read_count:t.read_count??t.count??null,exported_count:t.count??null,error:t.error||null}))})),errors:(payload.errors||[]).map(e=>({source:e.source,code:e.code})),exclusions:payload.exclusions||{},bytes_observed:payload.bytes_observed??null,no_restore_performed:true};}
return Object.freeze({VERSION,DATABASES,LIMITS,readJSON,openExisting,readDatabase,evaluateEnvelopes,inspect,serialize,capture,wrap,verify,diagnostic});
});

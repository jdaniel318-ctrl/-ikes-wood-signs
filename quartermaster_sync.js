/* Trade Winds: opt-in exact-scope cloud storage, durable pending commands and draft recovery. */
(function(g){
 'use strict';
 const CLOUD_MAX_BYTES=5*1024*1024,DB='blackflag-quartermaster-tradewinds-v1';
 const clone=x=>JSON.parse(JSON.stringify(x));
 const stable=x=>Array.isArray(x)?'['+x.map(stable).join(',')+']':x&&typeof x==='object'?'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+stable(x[k])).join(',')+'}':JSON.stringify(x);
 const fail=(message,code)=>{throw Object.assign(Error(message),{code});};
 function create({scope,client,guard,indexedDB,core}){
  scope=clone(scope);core.blankWorkspace(scope);const key=stable(scope),originId=g.crypto.randomUUID();let closed=false,connection=null,opening=null,cache=null,revision=0,savedAt=null,pending=false,serial=Promise.resolve();
  function check(){if(closed)fail('Workspace transport is closed.','CLOSED');if(guard()===false)fail('The account or workspace changed.','AUTH');}
  function validate(w){return core.validateBackup({schema:'blackflag.quartermaster.backup.v1',workspace:clone(w)},scope);}
  function capacity(w){if(new TextEncoder().encode(JSON.stringify(w)).length>CLOUD_MAX_BYTES)fail('This business exceeds the 5 MiB across-devices pilot capacity. Device records remain intact.','CAPACITY');}
  function db(){check();if(connection)return Promise.resolve(connection);if(opening)return opening;opening=new Promise((resolve,reject)=>{
   let r;try{r=indexedDB.open(DB,1);}catch(e){reject(e);return;}
   r.onupgradeneeded=()=>r.result.createObjectStore('records');r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('Recovery storage is blocked by another tab.'));
   r.onsuccess=()=>{connection=r.result;connection.onversionchange=()=>{connection.close();connection=null;};resolve(connection);};
  }).catch(e=>{opening=null;throw e;});return opening;}
  async function record(kind,fn){check();const database=await db();check();return new Promise((resolve,reject)=>{
   let tx,result,error;try{tx=database.transaction('records',fn?'readwrite':'readonly',fn?{durability:'strict'}:undefined);const os=tx.objectStore('records'),r=os.get([key,kind]);
    r.onsuccess=()=>{try{check();const previous=r.result??null;if(fn){const next=fn(clone(previous));if(next===undefined)os.delete([key,kind]);else os.put(clone(next),[key,kind]);result=next;}else result=previous;}catch(e){error=e;tx.abort();}};
    tx.oncomplete=()=>{try{check();resolve(result==null?null:clone(result));}catch(e){reject(e);}};tx.onerror=()=>{error=error||tx.error;};tx.onabort=()=>reject(error||tx.error||Error('Recovery storage write failed.'));
   }catch(e){reject(e);}
  });}
  async function read(operationId=null){check();const r=await client.rpc('quartermaster_read_workspace',{p_scope:scope,p_operation_id:operationId},'Cloud workspace could not be read.');check();return accept(r);}
  function accept(r){
   if(r?.schema!=='blackflag.quartermaster.cloud.v1'||!Number.isSafeInteger(r.cloudRevision)||r.cloudRevision<0||(!r.workspace&&r.cloudRevision!==0))fail('The server returned an invalid workspace receipt.','RESPONSE');
   const w=r.workspace?validate(r.workspace):null;if(w&&(!r.cloudRevision||!Number.isFinite(Date.parse(r.savedAt))))fail('The server returned an incomplete saved receipt.','RESPONSE');
   cache=w;revision=r.cloudRevision;savedAt=r.savedAt;return {...r,workspace:w};
  }
  async function preference(mode){if(mode!==undefined){if(!['local','cloud'].includes(mode))fail('Unknown storage mode.','VALIDATION');await record('mode',()=>mode);}return await record('mode')||'local';}
  async function inspect(){pending=!!await record('pending');return read();}
  async function open(){const r=await inspect();if(!r.workspace)fail('No cloud workspace exists for this business. Preview device records before enabling across devices.','MISSING');return clone(r.workspace);}
  async function clearPending(id){await record('pending',r=>r?.operationId===id?undefined:r);pending=!!await record('pending');}
  async function send(command){
   check();let r;
   try{r=await client.rpc('quartermaster_commit_workspace',{p_scope:scope,p_expected_cloud_revision:command.expected,p_operation_id:command.operationId,p_workspace:command.workspace},'Cloud save could not be confirmed.');check();r=accept(r);
    if(r.receipt?.operationId!==command.operationId||r.receipt.workspaceRevision!==command.workspace.revision||r.receipt.cloudRevision!==command.expected+1||r.cloudRevision<r.receipt.cloudRevision)fail('The server did not confirm this exact save.','RESPONSE');
   }catch(error){pending=true;if(error.code==='40001'||/quartermaster_revision_conflict/i.test(error.message||''))throw Object.assign(Error('The cloud workspace changed on another device. Your change is retained for comparison.'),{code:'CONFLICT',cause:error});throw Object.assign(Error('Cloud save is unconfirmed. Your change is kept on this device. Check save result before retrying.'),{code:'PENDING',cause:error});}
   // If cleanup fails, keep pending and reconcile later. Never call a second write.
   try{if(command.intent==='enable')await preference('cloud');await clearPending(command.operationId);}catch(error){pending=true;throw Object.assign(Error('The server saved this change, but this device could not retain the receipt. Check save result.'),{code:'PENDING',cause:error});}
   return r;
  }
  async function commit(w,expected,intent='save'){
   check();const candidate=validate(w);capacity(candidate);
   const command={originId,operationId:g.crypto.randomUUID(),expected,workspace:candidate,intent,createdAt:new Date().toISOString()};
   await record('pending',old=>{if(old)fail('A previous save needs checking before another change can be sent.','PENDING');return command;});pending=true;check();return send(command);
  }
  async function enable(w){const source=validate(w);capacity(source);const r=await inspect();if(r.workspace)fail('Cloud records already exist. Open them without replacing either copy.','CONFLICT');return (await commit(source,0,'enable')).workspace;}
  async function checkPending(){
   const command=await record('pending');pending=!!command;if(!command)return {state:'none',...(await read())};
   const r=await read(command.operationId);
   if(r.receipt){
    if(r.receipt.operationId!==command.operationId||r.receipt.cloudRevision!==command.expected+1||r.receipt.workspaceRevision!==command.workspace.revision||r.cloudRevision<r.receipt.cloudRevision)fail('Saved receipt does not match the retained request.','RESPONSE');
    if(command.intent==='enable')await preference('cloud');await clearPending(command.operationId);return {state:'confirmed',owned:command.originId===originId,intent:command.intent,...r};
   }
   return {state:r.cloudRevision===command.expected?'retryable':'conflict',owned:command.originId===originId,command,...r};
  }
  async function retryPending(){const result=await checkPending();if(result.state==='confirmed'||result.state==='none')return result;if(result.state!=='retryable')fail('The cloud workspace changed. Keep the retained change and open the latest cloud copy.','CONFLICT');return {state:'confirmed',owned:result.command.originId===originId,intent:result.command.intent,...await send(result.command)};}
  async function discardPending(){const result=await checkPending();if(result.state==='retryable'||result.state==='conflict')await clearPending(result.command.operationId);return result;}
  const persistence={
   transact(fn,extraCheck){const work=serial.then(async()=>{
    check();extraCheck();pending=!!await record('pending');if(pending)fail('Check the previous save result before continuing.','PENDING');
    if(!cache)await open();check();let w=clone(cache),answer=fn(w);
    if(answer&&typeof answer.then==='function')fail('Workspace changes must be synchronous.','VALIDATION');
    if(answer?.write===false){await open();w=clone(cache);answer=fn(w);check();extraCheck();return clone(answer&&Object.hasOwn(answer,'value')?answer.value:w);}
    check();extraCheck();const result=clone(answer&&Object.hasOwn(answer,'value')?answer.value:w);await commit(w,revision);check();extraCheck();return result;
   });serial=work.catch(()=>{});return work;},close(){closed=true;}
  };
  async function putRecovery(id,value){check();if(typeof id!=='string'||id.length>160||!id)fail('Recovery identity is invalid.','VALIDATION');const v=clone(value);if(!v.document||v.document.business?.id!==scope.businessId||!Number.isSafeInteger(v.baseRevision)||!['cloud','local'].includes(v.mode))fail('Recovery belongs to a different business.','SCOPE');if(new TextEncoder().encode(JSON.stringify(v)).length>core.BACKUP_MAX_BYTES)fail('Recovery is too large for this device.','CAPACITY');await record('recovery:'+id,()=>({id,scope:clone(scope),value:v,updatedAt:new Date().toISOString()}));}
  async function getRecovery(){const database=await db();check();const all=await new Promise((resolve,reject)=>{const tx=database.transaction('records'),os=tx.objectStore('records'),r=os.getAll(IDBKeyRange.bound([key,'recovery:'],[key,'recovery:\uffff']));r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});check();return all.filter(r=>stable(r.scope)===key).map(clone);}
  async function removeRecovery(id){await record('recovery:'+id,()=>undefined);}
  return Object.freeze({scope:clone(scope),inspect,enable,open,persistence,preference,checkPending,retryPending,discardPending,getPending:async()=>{const r=await record('pending');pending=!!r;return r;},getRecovery,putRecovery,removeRecovery,
   status:()=>({cloudRevision:revision,savedAt,pending}),close(){closed=true;if(connection)connection.close();connection=null;cache=null;}});
 }
 g.BlackFlagQuartermasterSync=Object.freeze({create,CLOUD_MAX_BYTES});
})(typeof window!=='undefined'?window:globalThis);

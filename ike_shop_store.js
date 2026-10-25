/* Ike's sign requests: separate local persistence, no public customer history. */
(function(root,factory){
  'use strict';
  const common=typeof module==='object'&&module.exports;
  const api=factory(common?require('./ike_shop_core.js'):root.IkeShopCore,common?require('./carve_fonts.js'):root.IkeCarveFonts);
  if(common)module.exports=api;
  if(root)root.IkeShopStore=api;
}(typeof globalThis!=='undefined'?globalThis:this,function(core,fonts){
  'use strict';
  const DB_NAME='blackflag-ike-sign-requests-v1',STORE_NAME='requests';
  const SCOPE_FIELDS=['projectId','backend','environment','site','deploymentId'];
  const BAD_KEYS=['__proto__','constructor','prototype'];
  const fault=(code,message,cause)=>Object.assign(new Error(message),{code,...(cause?{cause}:{})});
  const plain=v=>v&&typeof v==='object'&&!Array.isArray(v)&&(Object.getPrototypeOf(v)===Object.prototype||Object.getPrototypeOf(v)===null);
  const idOK=v=>typeof v==='string'&&/^[a-zA-Z0-9_-]{1,128}$/.test(v);
  function clone(value){
    let nodes=0;
    function check(v,depth){
      if(++nodes>50000||depth>18)throw fault('VALIDATION','The request is too complex.');
      if(v===null||typeof v==='string'||typeof v==='boolean')return;
      if(typeof v==='number'){if(!Number.isFinite(v))throw fault('VALIDATION','Request numbers must be finite.');return;}
      const array=Array.isArray(v);
      if((!plain(v)&&!array)||(array&&Object.getPrototypeOf(v)!==Array.prototype))throw fault('VALIDATION','Requests must contain plain JSON data.');
      if(array&&(v.length>16384||Reflect.ownKeys(v).length!==v.length+1))throw fault('VALIDATION','Request arrays must have consecutive entries.');
      Reflect.ownKeys(v).forEach(k=>{
        if(array&&k==='length')return;
        if(typeof k!=='string'||BAD_KEYS.includes(k)||(array&&!/^(0|[1-9][0-9]*)$/.test(k)))throw fault('VALIDATION','Unsafe request property.');
        const d=Object.getOwnPropertyDescriptor(v,k);
        if(!d||!Object.prototype.hasOwnProperty.call(d,'value')||!d.enumerable)throw fault('VALIDATION','Request accessors are not supported.');
        check(d.value,depth+1);
      });
    }
    check(value,0);
    let text;try{text=JSON.stringify(value);}catch(e){throw fault('VALIDATION','The request is not serializable.',e);}
    if(text.length>16*1024*1024)throw fault('VALIDATION','The request exceeds the local size limit.');
    return JSON.parse(text);
  }
  function scopeIdentity(scope){
    if(!plain(scope)||Reflect.ownKeys(scope).length!==SCOPE_FIELDS.length)throw fault('AUTH','Exact Ike project, backend, environment, site and deployment scope is required.');
    const values=SCOPE_FIELDS.map(k=>{const d=Object.getOwnPropertyDescriptor(scope,k);if(!d||!Object.prototype.hasOwnProperty.call(d,'value')||typeof d.value!=='string'||!d.value.length||d.value.length>2048)throw fault('AUTH','The Ike request scope is invalid.');return d.value;});
    if(values[0]!=='ikes-wood-signs')throw fault('AUTH','This request store belongs to Ike’s Wood Signs.');
    return JSON.stringify(values);
  }
  function validate(request,expected){
    if(!Number.isSafeInteger(expected)||expected<0)throw fault('VALIDATION','The expected request revision is invalid.');
    const copy=clone(request);
    if(!plain(copy)||copy.schema!=='ike-sign-request-v1'||copy.projectId!=='ikes-wood-signs'||!idOK(copy.id)||copy.revision!==expected)throw fault('VALIDATION','Request identity or revision is invalid.');
    if(!core||typeof core.validate!=='function')throw fault('STORAGE','The request files are incomplete. Open the complete release.');
    const checked=core.validate(copy,fonts,{complete:false});
    if(!checked.ok)throw fault('VALIDATION',checked.errors.join(' '));
    return copy;
  }
  function create(options){
    options=options||{};
    const sourceScope=options.scope,scopeKey=scopeIdentity(sourceScope);
    if(typeof options.guard!=='function')throw fault('AUTH','A current customer-workspace guard is required.');
    const guard=options.guard,memoryOnly=options.memoryOnly===true,memory=new Map();
    let closed=false,database=null,opening=null;
    const pending=new Set(),transactions=new Set();
    function authorized(){
      if(closed)throw fault('AUTH','This sign request workspace is closed.');
      let allowed=false;
      try{allowed=scopeIdentity(sourceScope)===scopeKey&&guard()===true;}catch(e){throw fault('AUTH','The Ike customer workspace changed.',e);}
      if(!allowed)throw fault('AUTH','The Ike customer workspace changed. Reopen the sign request.');
    }
    authorized();
    const storageError=e=>e&&['AUTH','CONFLICT','VALIDATION','STORAGE'].includes(e.code)?e:fault('STORAGE','Local request storage failed. No save was confirmed.',e);
    const recordKey=id=>JSON.stringify([scopeKey,id]);
    function read(record,id){
      if(!record)return null;
      if(record.key!==recordKey(id)||record.scopeKey!==scopeKey||record.id!==id||record.revision!==record.request?.revision||record.request?.id!==id)throw fault('STORAGE','Stored request identity is invalid.');
      try{return validate(record.request,record.revision);}catch(e){throw fault('STORAGE','The stored request is invalid.',e);}
    }
    function openDatabase(){
      authorized();
      if(database)return Promise.resolve(database);
      if(opening)return opening;
      opening=new Promise((resolve,reject)=>{
        let request,settled=false;
        const fail=e=>{if(settled)return;settled=true;pending.delete(cancel);reject(storageError(e));};
        const cancel=()=>fail(fault('AUTH','The sign request closed before storage opened.'));
        pending.add(cancel);
        try{
          request=globalThis.indexedDB.open(DB_NAME,1);
          request.onupgradeneeded=()=>{try{authorized();if(!request.result.objectStoreNames.contains(STORE_NAME))request.result.createObjectStore(STORE_NAME,{keyPath:'key'});}catch(e){try{request.transaction.abort();}catch(_){}fail(e);}};
          request.onerror=()=>fail(request.error);
          request.onblocked=()=>fail(fault('STORAGE','Local request storage is blocked. Close older shop tabs and try again.'));
          request.onsuccess=()=>{const db=request.result;if(settled){db.close();return;}try{authorized();if(!db.objectStoreNames.contains(STORE_NAME))throw fault('STORAGE','The request store is missing.');}catch(e){db.close();fail(e);return;}database=db;db.onversionchange=close;settled=true;pending.delete(cancel);resolve(db);};
        }catch(e){fail(e);}
      });
      return opening;
    }
    async function transact(mode,work){
      authorized();const db=await openDatabase();authorized();
      return new Promise((resolve,reject)=>{
        let tx,result,settled=false;
        const cleanup=()=>{pending.delete(cancel);if(tx)transactions.delete(tx);};
        const fail=e=>{if(settled)return;settled=true;try{tx?.abort();}catch(_){}cleanup();reject(storageError(e));};
        const cancel=()=>fail(fault('AUTH','The sign request closed during local storage work.'));
        const checked=fn=>function(){if(settled)return;try{authorized();fn.apply(null,arguments);}catch(e){fail(e);}};
        try{
          authorized();tx=db.transaction(STORE_NAME,mode);transactions.add(tx);pending.add(cancel);
          tx.onabort=()=>fail(tx.error||fault('STORAGE','The local request transaction was aborted.'));
          tx.onerror=()=>fail(tx.error);
          tx.oncomplete=checked(()=>{settled=true;cleanup();resolve(result);});
          work(tx.objectStore(STORE_NAME),checked,value=>{result=value;});
        }catch(e){fail(e);}
      });
    }
    async function load(id){
      authorized();if(!idOK(id))throw fault('VALIDATION','Invalid request ID.');
      if(memoryOnly){await Promise.resolve();authorized();return read(memory.get(recordKey(id)),id);}
      return transact('readonly',(store,checked,done)=>{const r=store.get(recordKey(id));r.onsuccess=checked(()=>done(read(r.result,id)));});
    }
    async function save(request,expectedRevision){
      authorized();if(expectedRevision===Number.MAX_SAFE_INTEGER)throw fault('VALIDATION','The request revision cannot be incremented.');
      // Snapshot before an await: no late caller mutation can change the saved request.
      const copy=validate(request,expectedRevision);
      function next(previous){
        if((!previous&&expectedRevision!==0)||(previous&&previous.revision!==expectedRevision))throw fault('CONFLICT','This request changed in another operation. Reload it before continuing.');
        copy.revision=expectedRevision+1;copy.design.revision=copy.revision;copy.updatedAt=new Date().toISOString();
        return {key:recordKey(copy.id),scopeKey,id:copy.id,revision:copy.revision,request:copy};
      }
      if(memoryOnly){await Promise.resolve();authorized();const record=next(read(memory.get(recordKey(copy.id)),copy.id));authorized();memory.set(record.key,record);return clone(copy);}
      return transact('readwrite',(store,checked,done)=>{const r=store.get(recordKey(copy.id));r.onsuccess=checked(()=>{const record=next(read(r.result,copy.id));authorized();const put=store.put(record);put.onsuccess=checked(()=>done(clone(copy)));});});
    }
    function close(){
      if(closed)return;closed=true;
      Array.from(pending).forEach(cancel=>cancel());
      transactions.forEach(tx=>{try{tx.abort();}catch(_){}});transactions.clear();memory.clear();
      if(database){database.close();database=null;}
    }
    return Object.freeze({save,load,close});
  }
  return Object.freeze({create});
}));

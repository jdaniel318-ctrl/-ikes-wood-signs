/* Holdfast: narrow legacy preservation. No startup work or storage writes. */
(function(root,factory){
  const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
  else root.BlackFlagLegacyRecovery=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const KEYS=Object.freeze(['ikesWoodSignsOrdersBackupV15','ikesOrderDraftV2','ikesOrderDraftV2:ikes-wood-signs']);
  const PROJECT='ikes-wood-signs',SCHEMA='blackflag-older-ike-recovery-v1';
  function capture(storage){
    return KEYS.flatMap(key=>{const raw=storage.getItem(key);return raw===null?[]:[{key,raw}];});
  }
  function validateEntries(entries){
    if(!Array.isArray(entries)||entries.length>KEYS.length)throw Error('Invalid older-records file.');
    const seen=new Set();for(const e of entries){
      if(!e||!KEYS.includes(e.key)||seen.has(e.key)||typeof e.raw!=='string')throw Error('Invalid older-records entry.');
      seen.add(e.key);
    }
  }
  function sameEntries(a,b){
    validateEntries(a);validateEntries(b);
    return a.length===b.length&&a.every(e=>b.some(x=>x.key===e.key&&x.raw===e.raw));
  }
  // Old fields must be present verbatim. Additional canonical fields are allowed;
  // arrays retain exact length/order. A matching ID alone proves nothing.
  function preserved(old,current,extra=false){
    if(old===null||typeof old!=='object')return old===current;
    if(current===null||typeof current!=='object'||Array.isArray(old)!==Array.isArray(current))return false;
    const keys=Object.keys(old),other=Object.keys(current);
    if((!extra||Array.isArray(old))&&keys.length!==other.length)return false;
    return keys.every(k=>Object.prototype.hasOwnProperty.call(current,k)&&preserved(old[k],current[k],extra));
  }
  function heldIdentity(row,excludedIds){
    const scopes=[row?.projectId,row?.isolation?.projectId,row?.currentOrder?.projectId,row?.currentOrder?.isolation?.projectId];
    const ids=[row?.id,row?.currentOrderId,row?.currentOrder?.id];
    return scopes.some(id=>id!==undefined&&id!==null&&id!==''&&id!==PROJECT)||ids.some(id=>id!==undefined&&excludedIds.has(String(id)));
  }
  function compare(entries,orders,currentDraft,excludedIds=new Set()){
    validateEntries(entries);if(!Array.isArray(orders))throw Error('Current orders could not be read.');
    return entries.map(entry=>{
      const result={key:entry.key,eligible:false,total:0,matched:0,changed:0,missing:0,held:0,status:'review'};
      let old;try{old=JSON.parse(entry.raw);}catch(_){return {...result,status:'unreadable',held:1};}
      if(entry.key!==KEYS[0]){
        if(!old||typeof old!=='object'||Array.isArray(old))return {...result,status:'unreadable',held:1};
        let current;try{current=JSON.parse(currentDraft);}catch(_){}
        if(heldIdentity(old,excludedIds)||heldIdentity(current,excludedIds))return {...result,total:1,held:1};
        const match=!!current&&preserved(old,current);
        return {...result,total:1,matched:match?1:0,changed:current&&!match?1:0,missing:current?0:1,eligible:match,status:match?'matched':'review'};
      }
      if(!Array.isArray(old))return {...result,status:'unreadable',held:1};
      result.total=old.length;
      for(const row of old){
        if(!row||typeof row!=='object'||Array.isArray(row)||typeof row.id!=='string'||!row.id.trim()||heldIdentity(row,excludedIds)){result.held++;continue;}
        const hits=orders.filter(x=>x&&x.id===row.id);
        if(!hits.length){result.missing++;continue;}
        if(hits.length!==1||hits[0].projectId!==PROJECT||heldIdentity(hits[0],excludedIds)){result.held++;continue;}
        if(preserved(row,hits[0],true))result.matched++;else result.changed++;
      }
      result.eligible=result.matched===result.total&&result.held===0;
      result.status=result.eligible?'matched':'review';return result;
    });
  }
  async function digest(raw){
    if(!globalThis.crypto?.subtle)throw Error('This browser cannot verify the recovery file. Open the secure site in Safari.');
    const bytes=new TextEncoder().encode(raw),hash=await globalThis.crypto.subtle.digest('SHA-256',bytes);
    return {bytes:bytes.byteLength,sha256:Array.from(new Uint8Array(hash),v=>v.toString(16).padStart(2,'0')).join('')};
  }
  async function archive(entries,build){
    validateEntries(entries);
    const value={schema:SCHEMA,build,createdAt:new Date().toISOString(),scope:'Exact older Ike LocalStorage records; complements the Captain orders/settings backup.',entries:await Promise.all(entries.map(async e=>({...e,...await digest(e.raw)})))};
    await verify(JSON.stringify(value),entries);return value;
  }
  async function verify(text,expected){
    const data=JSON.parse(text);
    if(data?.schema!==SCHEMA)throw Error('Choose the older Ike records file prepared here.');
    if(!sameEntries(data.entries,expected))throw Error('The selected file does not contain the exact older records prepared here.');
    for(const e of data.entries){const hash=await digest(e.raw);if(hash.sha256!==e.sha256||hash.bytes!==e.bytes)throw Error('Recovery file verification failed. Save a fresh copy.');}
    return true;
  }
  function removeVerified(storage,entries,eligibleKeys){
    validateEntries(entries);
    if(!Array.isArray(eligibleKeys)||eligibleKeys.some(k=>!KEYS.includes(k)||!entries.some(e=>e.key===k)))throw Error('Only verified older copies may be removed.');
    if(!sameEntries(capture(storage),entries))throw Error('Older records changed. Prepare and verify a fresh file before cleanup.');
    const removed=[],unconfirmed=[];let error='';
    for(const key of new Set(eligibleKeys)){
      try{
        const entry=entries.find(e=>e.key===key);
        if(storage.getItem(key)!==entry.raw)throw Error('An older record changed. Cleanup stopped.');
        storage.removeItem(key);
        unconfirmed.push(key);
        if(storage.getItem(key)!==null)throw Error('Removal was not confirmed.');
        unconfirmed.pop();
        removed.push(key);
      }catch(err){error=String(err?.message||err);break;}
    }
    return {removed,unconfirmed,error};
  }
  // Keephaven: explicit exact-record archive. No calls run at module load.
  const ARCHIVE_DB='blackFlagOlderIkeArchiveV1', ARCHIVE_STORE='snapshots';
  function operation(options={}){
    if(typeof options.guard!=='function')throw Error('Engine session check is required.');
    const end=Date.now()+(options.timeout||20000);
    return {factory:options.indexedDB||globalThis.indexedDB,check(){options.guard();if(Date.now()>=end)throw Error('Archive operation timed out. Originals were not automatically retried.');},remaining(){return Math.max(1,end-Date.now());}};
  }
  function openArchive(op,create=false){return new Promise((resolve,reject)=>{
    let request,settled=false;
    const finish=(error,db)=>{if(settled){db?.close();return;}settled=true;clearTimeout(timer);error?reject(error):resolve(db);};
    const timer=setTimeout(()=>{try{request?.transaction?.abort();}catch(_){}finish(Error('Archive open timed out.'));},op.remaining());
    try{op.check();if(!op.factory)throw Error('Archive storage is unavailable.');request=op.factory.open(ARCHIVE_DB,1);
      request.onupgradeneeded=()=>{try{if(settled)throw Error('Archive open ended.');op.check();if(!create){request.transaction.abort();finish(null,null);return;}request.result.createObjectStore(ARCHIVE_STORE,{keyPath:'id'});}catch(e){try{request.transaction.abort();}catch(_){}finish(e);}};
      request.onblocked=()=>finish(Error('Archive storage is busy in another tab. Close that tab and try again.'));
      request.onerror=()=>finish(request.error||Error('Archive could not be opened.'));
      request.onsuccess=()=>{const db=request.result;try{if(settled){db.close();return;}op.check();if(!db.objectStoreNames.contains(ARCHIVE_STORE))throw Error('Archive store is missing.');db.onversionchange=()=>db.close();finish(null,db);}catch(e){db.close();finish(e);}};
    }catch(e){finish(e);}
  });}
  function archiveTransaction(db,op,mode,work){return new Promise((resolve,reject)=>{
    let tx,settled=false,value;
    const finish=(error)=>{if(settled)return;settled=true;clearTimeout(timer);error?reject(error):resolve(value);};
    const stop=error=>{try{tx?.abort();}catch(_){}finish(error);};
    const timer=setTimeout(()=>stop(Error('Archive transaction timed out.')),op.remaining());
    try{op.check();tx=db.transaction([ARCHIVE_STORE],mode);
      tx.onabort=()=>finish(tx.error||Error('Archive transaction aborted.'));
      tx.onerror=()=>stop(tx.error||Error('Archive transaction failed.'));
      tx.oncomplete=()=>{try{op.check();finish();}catch(e){finish(e);}};
      work(tx.objectStore(ARCHIVE_STORE),(v)=>{value=v;},stop);
    }catch(e){stop(e);}
  });}
  async function archiveId(entries){validateEntries(entries);return (await digest(JSON.stringify(KEYS.flatMap(key=>entries.filter(e=>e.key===key).map(e=>({key:e.key,raw:e.raw})))))).sha256;}
  async function validateArchive(value){
    if(!value||!value.entries?.length)throw Error('Archived snapshot is missing or invalid.');
    await verify(JSON.stringify(value),value.entries);
    if(value.id!==await archiveId(value.entries))throw Error('Archived snapshot identity did not match.');
    return value;
  }
  async function readStored(id,op){
    const db=await openArchive(op);if(!db)throw Error('Archived snapshot was not found.');
    try{const value=await archiveTransaction(db,op,'readonly',(store,result,fail)=>{const req=store.get(id);req.onsuccess=()=>result(req.result);req.onerror=()=>fail(req.error);});await validateArchive(value);op.check();return value;}
    finally{db.close();}
  }
  async function readArchive(id,options){return readStored(id,operation(options));}
  async function listArchives(options){
    const op=operation(options),db=await openArchive(op);if(!db)return [];
    try{const values=await archiveTransaction(db,op,'readonly',(store,result,fail)=>{const req=store.getAll();req.onsuccess=()=>result(req.result);req.onerror=()=>fail(req.error);});
      const rows=[];for(const value of values){try{await validateArchive(value);op.check();rows.push({id:value.id,createdAt:value.createdAt,count:value.entries.length,bytes:value.entries.reduce((n,e)=>n+e.bytes,0)});}catch(e){op.check();rows.push({invalid:true});}}return rows.sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
    }finally{db.close();}
  }
  async function moveToArchive(options){
    const op=operation(options),{storage,entries,savedText}=options;op.check();validateEntries(entries);
    if(!entries.length)throw Error('No older records to archive.');
    await verify(savedText,entries);op.check();
    if(!sameEntries(capture(storage),entries))throw Error('Older records changed. Prepare and verify a fresh file.');
    const value=await archive(entries,options.build);value.id=await archiveId(entries);op.check();
    const db=await openArchive(op,true);
    try{await archiveTransaction(db,op,'readwrite',(store,result,fail)=>{
      const req=store.get(value.id);req.onerror=()=>fail(req.error);
      req.onsuccess=()=>{try{op.check();if(req.result){result(req.result);return;}const add=store.add(value);add.onerror=()=>fail(add.error);add.onsuccess=()=>result(value);}catch(e){fail(e);}};
    });}finally{db.close();}
    // A successful request is insufficient: wait for commit, reopen, hash, compare.
    const readback=await readStored(value.id,op);op.check();
    if(!sameEntries(readback.entries,entries))throw Error('Archive readback did not match. Older records kept.');
    if(!sameEntries(capture(storage),entries))throw Error('Older records changed. Archive kept; no older entries removed.');
    const removed=[],unconfirmed=[];let error='';
    for(const e of entries){try{op.check();if(storage.getItem(e.key)!==e.raw)throw Error('An older record changed. Move stopped.');storage.removeItem(e.key);unconfirmed.push(e.key);if(storage.getItem(e.key)!==null)throw Error('Removal was not confirmed.');unconfirmed.pop();removed.push(e.key);}catch(e){error=String(e.message||e);break;}}
    return {id:value.id,archived:entries.length,removed,unconfirmed,error};
  }
  async function restoreArchive(id,options){
    const op=operation(options),value=await readStored(id,op),{storage}=options;
    const restored=[],kept=[],unconfirmed=[];let error='';
    for(const e of value.entries){try{op.check();if(storage.getItem(e.key)!==null){kept.push(e.key);continue;}storage.setItem(e.key,e.raw);unconfirmed.push(e.key);if(storage.getItem(e.key)!==e.raw)throw Error('Restored entry could not be verified.');unconfirmed.pop();restored.push(e.key);}catch(e){error=String(e.message||e);break;}}
    return {restored,kept,unconfirmed,error,archiveKept:true};
  }
  return Object.freeze({KEYS,PROJECT,capture,compare,archive,verify,sameEntries,removeVerified,ARCHIVE_DB,listArchives,readArchive,moveToArchive,restoreArchive});
});

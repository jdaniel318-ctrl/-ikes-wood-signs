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
  return Object.freeze({KEYS,PROJECT,capture,compare,archive,verify,sameEntries,removeVerified});
});

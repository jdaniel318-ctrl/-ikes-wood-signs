'use strict';
const assert=require('node:assert/strict'),R=require('./fleet_legacy_recovery.js');
// Transactional fault harness: staged writes become visible only at completion.
// Native IndexedDB is checked separately in the managed browser.
function database(fault={}){
 const records=new Map();let exists=false;
 const factory={records,fault,open(){const req={};setTimeout(()=>{
  const db={objectStoreNames:{contains:()=>exists},close(){},createObjectStore(){exists=true},transaction(names,mode){
   const staged=new Map(records);let stopped=false,pending=0,timer;
   const tx={error:null,abort(){if(stopped)return;stopped=true;clearTimeout(timer);setTimeout(()=>tx.onabort?.(),0)},objectStore(){return {get:id=>request(()=>structuredClone(staged.get(id))),getAll:()=>request(()=>structuredClone([...staged.values()])),add:value=>request(()=>{if(staged.has(value.id))throw Error('duplicate');staged.set(value.id,structuredClone(value));return value.id;})}}};
   function finish(){clearTimeout(timer);timer=setTimeout(()=>{if(stopped||pending)return;if(mode==='readwrite'&&fault.hang)return;if(mode==='readwrite'&&fault.abort){tx.error=Error('quota abort');tx.abort();return;}if(mode==='readwrite'){records.clear();for(const [k,v]of staged)records.set(k,v);fault.afterCommit?.(records);}stopped=true;tx.oncomplete?.();},fault.delay||2)}
   function request(work){const r={};pending++;setTimeout(()=>{if(stopped)return;try{r.result=work();r.onsuccess?.();}catch(e){r.error=e;tx.error=e;r.onerror?.();tx.abort();}pending--;finish();},0);return r;}
   finish();return tx;
  }};
  req.result=db;req.transaction={abort(){req.aborted=true;exists=false}};
  if(fault.openHang)return;
  if(fault.blocked){req.onblocked?.();return;}
  if(!exists)req.onupgradeneeded?.();
  if(req.aborted)req.onerror?.();else req.onsuccess?.();
 },0);return req;}};return factory;
}
function storage(seed={}){const data=new Map(Object.entries(seed));return {data,getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)}}
async function setup(fault={}){const s=storage({[R.KEYS[0]]:' [{"id":"OLD","photo":"full"}] ',[R.KEYS[1]]:' {"draft":"unique 🌊"} ',[R.KEYS[2]]:'{broken',other:'preserve'}),entries=R.capture(s),savedText=JSON.stringify(await R.archive(entries,'test')),db=database(fault);return {s,db,entries,opts:{storage:s,indexedDB:db,entries,savedText,guard:()=>{},build:'test',timeout:50}}}
(async()=>{
 let n=0;async function test(name,fn){await fn();n++;console.log('PASS',name)}
 await test('archive API is present',()=>assert.equal(typeof R.moveToArchive,'function','Verified storage transfer must be implemented'));
 await test('only committed exact archive allows source removal; full raw values survive reload and restore',async()=>{const {s,db,entries,opts}=await setup();db.fault.afterCommit=()=>assert.equal(R.capture(s).length,3);const r=await R.moveToArchive(opts);assert.equal(r.removed.length,3);assert.equal(s.getItem('other'),'preserve');const list=await R.listArchives({indexedDB:db,guard:()=>{}});assert.equal(list.length,1);const a=await R.readArchive(list[0].id,{indexedDB:db,guard:()=>{}});assert(R.sameEntries(a.entries,entries));await R.verify(JSON.stringify(a),entries);const restored=await R.restoreArchive(r.id,{indexedDB:db,storage:s,guard:()=>{}});assert.equal(restored.restored.length,3);assert(R.sameEntries(R.capture(s),entries));assert.equal(db.records.size,1)});
 await test('invalid or unverified file cannot trigger archival or deletion',async()=>{const {s,db,opts}=await setup();await assert.rejects(()=>R.moveToArchive({...opts,savedText:'{}'}));assert.equal(db.records.size,0);assert.equal(R.capture(s).length,3)});
 await test('quota transaction abort after request success keeps every original',async()=>{const {s,db,opts}=await setup({abort:true});await assert.rejects(()=>R.moveToArchive(opts),/quota|abort/i);assert.equal(db.records.size,0);assert.equal(R.capture(s).length,3)});
 await test('readback corruption retains originals',async()=>{const {s,opts}=await setup({afterCommit:rows=>{[...rows.values()][0].entries[0].raw+='corrupt'}});await assert.rejects(()=>R.moveToArchive(opts));assert.equal(R.capture(s).length,3)});
 await test('changed source after archive commit prevents deletion',async()=>{const {s,db,opts}=await setup();db.fault.afterCommit=()=>s.setItem(R.KEYS[1],'newer');await assert.rejects(()=>R.moveToArchive(opts),/changed/i);assert.equal(R.capture(s).length,3);assert.equal(s.getItem(R.KEYS[1]),'newer')});
 await test('revoked session after commit prevents deletion',async()=>{const {s,db,opts}=await setup();let allowed=true;db.fault.afterCommit=()=>{allowed=false};opts.guard=()=>{if(!allowed)throw Error('session changed')};await assert.rejects(()=>R.moveToArchive(opts),/session/);assert.equal(R.capture(s).length,3)});
 await test('timeout aborts writes and cannot delete late',async()=>{const {s,db,opts}=await setup({hang:true});await assert.rejects(()=>R.moveToArchive({...opts,timeout:12}),/timed out/i);await new Promise(r=>setTimeout(r,25));assert.equal(R.capture(s).length,3);assert.equal(db.records.size,0)});
 await test('blocked or stalled open keeps originals',async()=>{for(const fault of [{blocked:true},{openHang:true}]){const {s,opts}=await setup(fault);await assert.rejects(()=>R.moveToArchive({...opts,timeout:12}));assert.equal(R.capture(s).length,3)}});
 await test('partial removal is reported and archive retains every entry',async()=>{const {s,db,opts}=await setup();const remove=s.removeItem;s.removeItem=k=>{if(k===R.KEYS[1])throw Error('blocked');remove(k)};const r=await R.moveToArchive(opts);assert.equal(r.removed.length,1);assert.match(r.error,/blocked/);assert.equal((await R.readArchive(r.id,{indexedDB:db,guard:()=>{}})).entries.length,3)});
 await test('restore never overwrites changed value and retains archive on quota failure',async()=>{const {s,db,opts}=await setup();const r=await R.moveToArchive(opts);s.setItem(R.KEYS[0],'newer');s.setItem=()=>{throw Error('quota')};const restored=await R.restoreArchive(r.id,{indexedDB:db,storage:s,guard:()=>{}});assert.equal(restored.restored.length,0);assert.equal(restored.kept.length,1);assert.match(restored.error,/quota/);assert.equal(s.getItem(R.KEYS[0]),'newer');assert.equal(db.records.size,1)});
 await test('archive discovery does not create an absent database',async()=>{const db=database();assert.deepEqual(await R.listArchives({indexedDB:db,guard:()=>{}}),[]);assert.equal(db.records.size,0)});
 await test('repeated snapshot is reused without overwriting previous immutable archive',async()=>{const {s,db,opts}=await setup();const first=await R.moveToArchive(opts);await R.restoreArchive(first.id,{storage:s,indexedDB:db,guard:()=>{}});const original=JSON.stringify([...db.records.values()][0]);await R.moveToArchive(opts);assert.equal(db.records.size,1);assert.equal(JSON.stringify([...db.records.values()][0]),original)});
 await test('one invalid snapshot does not hide valid downloadable archives',async()=>{const {s,db,opts}=await setup();const r=await R.moveToArchive(opts);db.records.set('bad',{id:'bad',entries:[]});const rows=await R.listArchives({indexedDB:db,guard:()=>{}});assert.equal(rows.filter(x=>!x.invalid).length,1);assert.equal(rows.filter(x=>x.invalid).length,1);assert.equal((await R.readArchive(r.id,{indexedDB:db,guard:()=>{}})).entries.length,3)});
 console.log(JSON.stringify({passed:n}));
})().catch(e=>{console.error(e);process.exitCode=1});
module.exports={database,storage};

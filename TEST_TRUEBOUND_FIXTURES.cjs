'use strict';
// Test-only transaction harness. Real IndexedDB coverage is run separately in browser QA.
const E='darkSkyV4ProjectEnvelopesV1',A='darkSkyV4ProjectAdmissionsV1',M='darkSkyV4FleetManifestV1',T='darkSkyProjectRetirementTombstonesV1';
const project=id=>({id,name:id==='alpha'?'HouseHull fixture':'VoyageKeeper fixture',namespace:'bf.project.'+id,schemaVersion:8,isolation:{projectId:id,crossProjectAccess:'deny'},permissions:{defaultDeny:true}});
const envelope=id=>({projectId:id,namespace:'bf.project.'+id,schemaVersion:8,policyVersion:'4.0',isolation:{projectId:id,namespace:'bf.project.'+id,crossProjectAccess:'deny'},permissions:{defaultDeny:true,projectScoped:true},sealedAt:'2026-11-01',build:'prior'});
function database(seed,fault={}){
 const tables=structuredClone(seed),factory={tables,fault,transactions:[],open(){const req={};setTimeout(()=>{
  if(fault.openHang)return;if(fault.blocked){req.onblocked?.();return;}
  const db={close(){},objectStoreNames:{contains:n=>!!tables[n]},transaction(names,mode){
   factory.transactions.push({names,mode});const stage=structuredClone(tables);let stopped=false,pending=0,timer;
   const tx={abort(){if(stopped)return;stopped=true;clearTimeout(timer);setTimeout(()=>tx.onabort?.(),0)},objectStore(name){if(!names.includes(name)||!stage[name])throw Error('wrong store');return {
    get:key=>request(()=>structuredClone(stage[name].find(v=>v[name==='projects'?'id':'key']===key))),
    getAll:()=>request(()=>structuredClone(stage[name])),
    put:value=>request(()=>{if(mode!=='readwrite')throw Error('read only');const k=name==='projects'?'id':'key',i=stage[name].findIndex(v=>v[k]===value[k]);if(i<0)stage[name].push(structuredClone(value));else stage[name][i]=structuredClone(value);return value[k]}),
    add:value=>request(()=>{if(mode!=='readwrite'||stage[name].some(v=>v.key===value.key))throw Error('duplicate');stage[name].push(structuredClone(value));return value.key})
   }}};
   function finish(){clearTimeout(timer);timer=setTimeout(()=>{if(stopped||pending)return;if(mode==='readwrite'&&fault.hang)return;if(mode==='readwrite'&&fault.abort){tx.error=Error('quota abort');tx.abort();return;}if(mode==='readwrite'){for(const n of names)tables[n]=stage[n];fault.afterCommit?.(tables);}stopped=true;tx.oncomplete?.();},2)}
   function request(work){const r={};pending++;setTimeout(()=>{if(stopped)return;try{if(fault.readError&&mode==='readonly')throw Error('read failed');r.result=work();r.onsuccess?.();}catch(e){r.error=e;tx.error=e;r.onerror?.();tx.abort();}pending--;finish()},0);return r}
   finish();return tx;
  }};req.result=db;req.transaction={abort(){req.aborted=true}};if(fault.missing)req.onupgradeneeded?.();if(req.aborted)req.onerror?.();else req.onsuccess?.();
 },0);return req}};return factory;
}
function fixture(){
 const projects=['alpha','beta','kept'].map(project),adm=Object.fromEntries(projects.map(p=>[p.id,{projectId:p.id,admitted:true,transactionId:'admitted-'+p.id}])),env={kept:envelope('kept')};
 const values=new Map([[E,JSON.stringify(env)],[A,JSON.stringify(adm)],[M,JSON.stringify(projects.map(p=>p.id))],['orders','PRIVATE ORDERS'],['quarantine','PRIVATE EVIDENCE']]);
 const storage={getItem:k=>values.has(k)?values.get(k):null,setItem:(k,v)=>values.set(k,String(v)),removeItem:()=>{throw Error('repair must never delete')}};
 const db=database({projects,settings:[{key:E,value:env},{key:A,value:adm},{key:M,value:projects.map(p=>p.id)},{key:'private-settings',value:{private:'must not change'}}],orders:[{id:'order',data:'PRIVATE'}]});
 const f={projects:structuredClone(projects),values,storage,db,allowed:true};f.options={storage,indexedDB:db,getProjects:()=>f.projects,guard:()=>{if(!f.allowed)throw Error('Engine session changed')},build:'8.8.20.91',timeout:120};return f;
}
module.exports={E,A,M,T,project,envelope,database,fixture};

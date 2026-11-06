/* Truebound: explicit missing-only boundary repair. No work runs at load time. */
(function(g,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else g.BlackFlagBoundaryRepair=api;})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const DB='blackFlagPlatformV1',E='darkSkyV4ProjectEnvelopesV1',A='darkSkyV4ProjectAdmissionsV1',M='darkSkyV4FleetManifestV1',T='darkSkyProjectRetirementTombstonesV1';
const own=(v,k)=>Object.prototype.hasOwnProperty.call(v,k);
const object=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
// IndexedDB can hold values JSON would silently drop or change. Refuse those
// sources before copying a map, including unsupported fields on other projects.
function assertJSON(v,seen=new Set()){
 if(v===null||typeof v==='string'||typeof v==='boolean')return;
 if(typeof v==='number'&&Number.isFinite(v)&&!Object.is(v,-0))return;
 if(!v||typeof v!=='object'||seen.has(v))throw Error('Stored evidence cannot be copied exactly. No repair is eligible.');
 const proto=Object.getPrototypeOf(v),array=Array.isArray(v);
 if((!array&&proto!==null&&Object.getPrototypeOf(proto)!==null)||Object.getOwnPropertySymbols(v).length)throw Error('Stored evidence has an unsupported format.');
 const keys=Object.keys(v);if(array&&(keys.length!==v.length||keys.some((key,i)=>key!==String(i))))throw Error('Stored evidence has an unsupported array.');
 seen.add(v);for(const key of Object.getOwnPropertyNames(v)){if(array&&key==='length')continue;const d=Object.getOwnPropertyDescriptor(v,key);if(!d.enumerable||!own(d,'value'))throw Error('Stored evidence cannot be copied exactly.');assertJSON(d.value,seen);}seen.delete(v);
}
const clone=v=>{assertJSON(v);return JSON.parse(JSON.stringify(v));};
function stable(v){if(Array.isArray(v))return '['+v.map(stable).join(',')+']';if(object(v))return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';return JSON.stringify(v);}
function boundary(p,id,envelope=false){const ns='bf.project.'+id;return object(p)&&(envelope?p.projectId===id:p.id===id)&&Number(p.schemaVersion)===8&&p.namespace===ns&&p.isolation?.projectId===id&&p.isolation?.crossProjectAccess==='deny'&&p.permissions?.defaultDeny===true&&(!envelope||(p.isolation.namespace===ns&&p.permissions.projectScoped===true));}
function identity(p){const out={};for(const key of ['id','name','namespace','schemaVersion','isolation','permissions','v4AdmissionReviewRequired'])if(p&&own(p,key))out[key]=p[key];return out;}
function admission(a,id){return object(a)&&a.admitted===true&&a.projectId===id&&typeof a.transactionId==='string'&&!!a.transactionId.trim();}
function create(options){
 const {storage,indexedDB,getProjects,guard,build}=options||{},timeout=options?.timeout||8000,plans=new WeakMap();let busy=false;
 if(!storage||!indexedDB||typeof getProjects!=='function'||typeof guard!=='function'||typeof build!=='string')throw Error('Engine repair context is required.');
 const check=()=>{if(guard()===false)throw Error('Engine session changed.');};
 function readLocal(key,optional=false){const raw=storage.getItem(key);if(raw===null){if(optional)return {raw,value:{}};throw Error('Required local evidence is missing: '+key);}let value;try{value=JSON.parse(raw);}catch(_){throw Error('Local evidence is unreadable: '+key);}return {raw,value};}
 function snapshot(registry,records){
  check();if(!Array.isArray(registry))throw Error('Project registry is unavailable.');
  const session=getProjects();if(!Array.isArray(session))throw Error('Current project identities are unavailable.');
  const local={},raw={};for(const key of [E,A,M,T]){const r=readLocal(key,key===E||key===T);local[key]=r.value;raw[key]=r.raw;}
  const database={};for(const key of [E,A,M]){const row=records[key];if(!row&&key!==E)throw Error('Required database evidence is missing: '+key);database[key]=row?row.value:{};}
  for(const value of [local[E],local[A],local[T],database[E],database[A]])if(!object(value))throw Error('Stored evidence has an invalid format.');
  for(const value of [local[M],database[M]])if(!Array.isArray(value)||value.some(id=>typeof id!=='string')||new Set(value).size!==value.length)throw Error('Fleet membership evidence has an invalid format.');
  return clone({registry:registry.map(identity),session:session.map(identity),local,database,raw});
 }
 function open(){check();return new Promise((resolve,reject)=>{let request,done=false;const finish=(err,db)=>{if(done){db?.close();return;}done=true;clearTimeout(timer);err?reject(err):resolve(db);};const timer=setTimeout(()=>finish(Error('Database open timed out.')),timeout);
  try{request=indexedDB.open(DB);request.onupgradeneeded=()=>{try{request.transaction.abort();}catch(_){}finish(Error('Existing database is missing. No database was created.'));};request.onblocked=()=>finish(Error('Database is busy. Close other Black Flag tabs and review again.'));request.onerror=()=>finish(request.error||Error('Database open failed.'));request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>db.close();finish(null,db);};}catch(e){finish(e);}
 });}
 async function transaction(mode,work){
  const db=await open();try{return await new Promise((resolve,reject)=>{let tx,result,done=false,failure;const finish=err=>{if(done)return;done=true;clearTimeout(timer);err?reject(err):resolve(result);};const stop=err=>{failure=err;try{tx?.abort();}catch(_){}finish(err);};const timer=setTimeout(()=>stop(Error('Boundary transaction timed out.')),timeout);
   try{check();tx=db.transaction(['projects','settings'],mode);tx.onabort=()=>finish(failure||tx.error||Error('Boundary transaction aborted.'));tx.onerror=()=>{failure=tx.error||Error('Boundary transaction failed.');};tx.oncomplete=()=>finish(failure);
    const values={};let pending=4;const receive=(key,req)=>{req.onerror=()=>stop(req.error||Error('Evidence read failed.'));req.onsuccess=()=>{if(done)return;values[key]=req.result;if(--pending===0){try{check();result=work(snapshot(values.projects,values),tx.objectStore('settings'));}catch(e){stop(e);}}};};
    receive('projects',tx.objectStore('projects').getAll());for(const key of [E,A,M])receive(key,tx.objectStore('settings').get(key));
   }catch(e){stop(e);}
  });}finally{db.close();}
 }
 function evaluate(s,ids){return ids.map(id=>{
  const canonical=s.registry.filter(p=>p.id===id),session=s.session.filter(p=>p.id===id),blocked=[],add=[];
  if(!canonical.length||!session.length)throw Error('Project is not in both the registry and current session.');
  if(canonical.length!==1||session.length!==1||!boundary(canonical[0],id)||!boundary(session[0],id))blocked.push('Project identity or boundary does not match.');
  if([canonical[0],session[0]].some(p=>own(p,'v4AdmissionReviewRequired')&&p.v4AdmissionReviewRequired!==false)||own(s.local[T],id))blocked.push('Project requires admission review or is retired.');
  if(!admission(s.local[A][id],id)||!admission(s.database[A][id],id)||stable(s.local[A][id])!==stable(s.database[A][id]))blocked.push('Matching saved admission evidence is required.');
  if(!s.local[M].includes(id)||!s.database[M].includes(id))blocked.push('Project is not on both saved fleet manifests.');
  for(const [side,map]of [['local',s.local[E]],['database',s.database[E]]]){if(!own(map,id))add.push(side);else if(!boundary(map[id],id,true))blocked.push('Existing '+side+' boundary conflicts; it will not be overwritten.');}
  if(own(s.local[E],id)&&own(s.database[E],id)&&stable(s.local[E][id])!==stable(s.database[E][id]))blocked.push('Saved boundary copies differ; review is required.');
  return {projectId:id,name:String(canonical[0].name||id),add,blocked};
 });}
 async function review(ids){
  check();if(busy)throw Error('A repair is already running.');if(!Array.isArray(ids)||!ids.length||ids.length>100||new Set(ids).size!==ids.length||ids.some(id=>typeof id!=='string'||!id.match(/^[a-z0-9][a-z0-9_-]{0,127}$/)||['constructor','prototype'].includes(id)))throw Error('Choose unique current project IDs for review.');
  const s=await transaction('readonly',s=>s);check();const rows=evaluate(s,ids),ready=rows.every(r=>!r.blocked.length)&&rows.some(r=>r.add.length),plan={ready,createdAt:new Date().toISOString(),rows};
  plans.set(plan,{snapshot:s,ids:[...ids],used:false});return plan;
 }
 async function apply(plan){
  check();const held=plans.get(plan);if(busy||!held||held.used)throw Error('Review this repair again; the plan is missing or already used.');held.used=true;busy=true;
  let committed=false;
  try{
   const original=held.snapshot,rows=evaluate(original,held.ids);if(rows.some(r=>r.blocked.length)||!rows.some(r=>r.add.length))throw Error('No eligible repair. Review the findings again.');
   const at=new Date().toISOString(),expected=clone(original),entries={};
   for(const row of rows){const id=row.projectId,ns='bf.project.'+id;entries[id]=clone(own(original.local[E],id)?original.local[E][id]:own(original.database[E],id)?original.database[E][id]:{projectId:id,namespace:ns,schemaVersion:8,policyVersion:'4.0',isolation:{projectId:id,namespace:ns,crossProjectAccess:'deny'},permissions:{projectScoped:true,defaultDeny:true},sealedAt:at,build});if(row.add.includes('database'))expected.database[E][id]=entries[id];}
   const receipt={schema:'blackflag-boundary-repair-v1',at,build,phase:'database-committed',targets:rows.map(r=>({projectId:r.projectId,add:r.add})),scope:'Missing boundaries only. Local completion requires separate readback.'};
   await transaction('readwrite',(now,settings)=>{
    if(stable(now)!==stable(original))throw Error('Evidence changed. Review a fresh repair before saving.');check();
    if(rows.some(r=>r.add.includes('database')))settings.put({key:E,value:expected.database[E]});
    // An append-only receipt records the attempted scope, not authority or a success claim.
    const id=globalThis.crypto?.randomUUID?.()||at+'-'+Math.random().toString(36).slice(2);
    settings.add({key:'darkSkyBoundaryRepair:'+id,value:receipt});
   });committed=true;
   await transaction('readonly',now=>{
    if(stable(now)!==stable(expected))throw Error('Evidence changed or database readback did not match. Review again.');check();
    if(rows.some(r=>r.add.includes('local'))){const map=clone(now.local[E]);for(const row of rows)if(row.add.includes('local'))map[row.projectId]=entries[row.projectId];
     // No await between last exact source comparison and the local replacement.
     if(storage.getItem(E)!==now.raw[E])throw Error('Local boundaries changed. Review again.');
     storage.setItem(E,JSON.stringify(map));if(storage.getItem(E)!==JSON.stringify(map))throw Error('Local boundary readback did not match.');
     expected.local[E]=map;expected.raw[E]=JSON.stringify(map);
    }
   });
   await transaction('readonly',now=>{if(stable(now)!==stable(expected))throw Error('Final boundary readback did not match.');if(evaluate(now,held.ids).some(r=>r.blocked.length||r.add.length))throw Error('Boundary verification did not pass.');});
   check();return {status:'verified',verified:true,projectIds:held.ids,at};
  }catch(e){if(!committed)throw e;return {status:'partial',verified:false,projectIds:held.ids,error:String(e?.message||'Readback was not confirmed.'),at:new Date().toISOString()};}
  finally{busy=false;}
 }
 return Object.freeze({review,apply});
}
return Object.freeze({create});
});

/* Dark Sky / Black Flag v3.8.7 — Operational Coherence */
(function(g){
'use strict';
const SCHEMA=6, POLICY='3.4', AUDIT='blackFlagV3AuditV1', SNAP='blackFlagV3RecoverySnapshotsV1', MIG='blackFlagV3MigrationStateV1', TELEM='blackFlagV3TelemetryV1';
const STATES=['draft','configured','owner_invited','owner_active','deployment_ready','testing','live','suspended','relationship_ended','archived'];
const DEPLOYMENT_TRANSITIONS={
 draft:new Set(['sea_trial','retired']),
 sea_trial:new Set(['draft','deployed','retired']),
 deployed:new Set(['paused','retired']),
 paused:new Set(['deployed','retired']),
 retired:new Set([])
};
const clean=v=>String(v||'').trim().toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'');
const ns=id=>'bf.project.'+clean(id);
const normalizeName=v=>String(v||'').trim().replace(/\s+/g,' ').toLocaleLowerCase();
const randomId=()=>{try{if(globalThis.crypto?.randomUUID)return globalThis.crypto.randomUUID().replace(/-/g,'').slice(0,12)}catch(_){}return Date.now().toString(36)+Math.random().toString(36).slice(2,8)};
function createProjectId(_name,projects=[]){
 const used=new Set((projects||[]).map(p=>String(p?.id||'')));
 let id=`bf-p-${randomId()}`; while(used.has(id)) id=`bf-p-${randomId()}`; return id;
}
function registry(projects=[]){return (projects||[]).map(p=>({projectId:String(p?.id||''),displayName:String(p?.name||p?.identity?.displayName||''),normalizedName:normalizeName(p?.name||p?.identity?.displayName||''),state:lifecycle(p),namespace:String(p?.namespace||ns(p?.id||'')),createdAt:p?.createdAt||null,updatedAt:p?.updatedAt||p?.governance?.updatedAt||null}));}
function sameName(projects=[],name,{includeArchived=false}={}){const n=normalizeName(name);return registry(projects).filter(r=>r.normalizedName===n&&(includeArchived||!['archived','relationship_ended'].includes(r.state)));}
const read=(k,f)=>{try{const x=JSON.parse(localStorage.getItem(k)||'null');return x==null?f:x}catch(_){return f}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
function deployments(p){if(Array.isArray(p?.deployments))return p.deployments;if(Array.isArray(p?.deployment))return p.deployment;if(Array.isArray(p?.deployment?.instances))return p.deployment.instances;return []}
function lifecycle(p){
 const status=p?.governance?.platformStatus||'approved';
 if(p?.archived)return'archived'; if(status==='relationship_ended')return'relationship_ended'; if(status==='suspended')return'suspended';
 if(p?.publish?.status==='live')return'live';
 if(deployments(p).some(d=>['deployed','active','live'].includes(String(d?.state||'').toLowerCase())))return'deployment_ready';
 if(p?.ownerAccess?.status==='active')return deployments(p).some(d=>['draft','test','testing','sea_trial'].includes(String(d?.state||'').toLowerCase()))?'testing':'owner_active';
 if(p?.ownerAccess?.status==='invited')return'owner_invited';
 return (p?.products?.length||p?.branding||p?.workflow||p?.customerExperience||p?.customization)?'configured':'draft';
}
function sealDeployment(p,d){
 if(!p||!d||typeof d!=='object')return d;
 const projectId=clean(p.id), namespace=ns(projectId);
 d.projectId=projectId; d.namespace=namespace;
 d.authorization={...(d.authorization||{}),role:'device',projectId,namespace,scope:'customer_session',crossProjectAccess:'deny',policyVersion:POLICY,engineAccess:false,ownerAccess:false};
 if(d.deviceIdentity&&typeof d.deviceIdentity==='object'){
   d.deviceIdentity.projectId=projectId; d.deviceIdentity.namespace=namespace;
 }
 return d;
}
function ensure(p){
 if(!p||typeof p!=='object')return p;
 p.id=clean(p.id||createProjectId(p.name||'project')); p.schemaVersion=SCHEMA; p.namespace=ns(p.id);
 const displayName=p.name||p.identity?.displayName||p.id;
 p.name=displayName; p.createdAt=p.createdAt||new Date().toISOString(); p.updatedAt=p.updatedAt||p.governance?.updatedAt||p.createdAt;
 p.identity={...(p.identity||{}),projectId:p.id,displayName,normalizedName:normalizeName(displayName),projectCode:p.projectCode||p.orderPrefix||p.identity?.projectCode||'PRJ',identityVersion:3,immutableProjectId:true};
 if(!Array.isArray(p.identity.previousNames))p.identity.previousNames=[];
 p.isolation={...(p.isolation||{}),projectId:p.id,namespace:p.namespace,policyVersion:POLICY,crossProjectAccess:'deny'};
 p.permissions={...(p.permissions||{}),policyVersion:POLICY,projectScoped:true,defaultDeny:true};
 p.lifecycle={...(p.lifecycle||{}),state:lifecycle(p),version:2,updatedAt:p.lifecycle?.updatedAt||new Date().toISOString()};
 p.audit={...(p.audit||{}),enabled:true,policyVersion:POLICY};
 deployments(p).forEach(d=>sealDeployment(p,d));
 return p;
}
function migrate(rows){
 let changed=false;
 const projects=(Array.isArray(rows)?rows:[]).map(p=>{const before=JSON.stringify([p?.schemaVersion,p?.namespace,p?.isolation,p?.permissions,p?.lifecycle,p?.identity,deployments(p).map(d=>[d?.projectId,d?.namespace,d?.authorization?.projectId])]);ensure(p);if(before!==JSON.stringify([p?.schemaVersion,p?.namespace,p?.isolation,p?.permissions,p?.lifecycle,p?.identity,deployments(p).map(d=>[d?.projectId,d?.namespace,d?.authorization?.projectId])]))changed=true;return p});
 return{projects,changed,from:'3.3',to:'3.4'};
}
function scope(resource,projectId){
 if(!resource||typeof resource!=='object')return{ok:false,error:'resource_missing'};
 const actual=resource.projectId||resource?.isolation?.projectId||'';
 if(!actual)return{ok:false,error:'project_scope_missing',expected:clean(projectId),actual:''};
 return clean(actual)===clean(projectId)?{ok:true}:{ok:false,error:'project_boundary',expected:clean(projectId),actual:clean(actual)};
}
function authorizeMutation({project,actorRole='engine_admin',contextProjectId='',capability='' }={}){
 if(!project?.id)return{ok:false,error:'project_missing'};
 const projectId=clean(project.id), context=clean(contextProjectId);
 if(['archived','relationship_ended'].includes(lifecycle(project)))return{ok:false,error:'project_read_only',projectId};
 if(actorRole==='system')return{ok:true,projectId};
 if(!context||context!==projectId)return{ok:false,error:'project_context_mismatch',projectId,contextProjectId:context};
 if(actorRole==='engine_admin')return{ok:true,projectId};
 if(actorRole==='project_owner'){
   const oa=project.ownerAccess||{};
   if(!oa.enabled||oa.status!=='active')return{ok:false,error:'owner_access_inactive',projectId};
   if(capability && !(oa.capabilities||[]).includes(capability))return{ok:false,error:'owner_capability_denied',projectId,capability};
   return{ok:true,projectId};
 }
 return{ok:false,error:'actor_role_denied',projectId,actorRole};
}
function validateDeployment(project,d){
 if(!project?.id||!d)return{ok:false,error:'deployment_missing'};
 const projectId=clean(project.id), namespace=ns(projectId);
 const checks=[
   ['projectId',clean(d.projectId)===projectId],
   ['namespace',String(d.namespace||'')===namespace],
   ['authorization.projectId',clean(d.authorization?.projectId)===projectId],
   ['authorization.namespace',String(d.authorization?.namespace||'')===namespace],
   ['authorization.crossProjectAccess',d.authorization?.crossProjectAccess==='deny'],
   ['authorization.engineAccess',d.authorization?.engineAccess===false]
 ];
 if(d.deviceIdentity){
   checks.push(['deviceIdentity.projectId',clean(d.deviceIdentity.projectId)===projectId]);
   checks.push(['deviceIdentity.namespace',String(d.deviceIdentity.namespace||'')===namespace]);
 }
 const failures=checks.filter(([,pass])=>!pass).map(([field])=>field);
 return failures.length?{ok:false,error:'deployment_boundary',projectId,failures}:{ok:true,projectId};
}
function canTransitionDeployment(from,to){
 const a=String(from||'draft').toLowerCase(),b=String(to||'').toLowerCase();
 return !!DEPLOYMENT_TRANSITIONS[a]?.has(b);
}
function audit(event={}){
 const rows=read(AUDIT,[]); const row={id:'AUD-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),at:new Date().toISOString(),schemaVersion:SCHEMA,actorRole:event.actorRole||'engine',projectId:event.projectId||null,category:event.category||'operation',action:String(event.action||'activity'),detail:String(event.detail||'')};
 rows.unshift(row);write(AUDIT,rows.slice(0,2500));return row;
}
function telemetry(type,data={},projectId=null){
 const rows=read(TELEM,[]);rows.push({at:Date.now(),schemaVersion:SCHEMA,type,projectId,data});write(TELEM,rows.slice(-5000));
}
function readTelemetry({type=null,projectId=null,since=0}={}){
 return read(TELEM,[]).filter(x=>(!type||x.type===type)&&(!projectId||x.projectId===projectId)&&Number(x.at||0)>=since);
}
function checksum(v){const s=JSON.stringify(v);let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16).padStart(8,'0')}
function sanitize(rows){return structuredClone(rows||[]).map(p=>{if(p?.ownerAccess?.credential)p.ownerAccess.credential={login:p.ownerAccess.credential.login||'',testMode:!!p.ownerAccess.credential.testMode,createdAt:p.ownerAccess.credential.createdAt||null,changedAt:p.ownerAccess.credential.changedAt||null,secretMaterialOmittedFromSnapshot:true};if(p?.ownerAccess?.invitation)p.ownerAccess.invitation={...p.ownerAccess.invitation,tokenHash:'[omitted]',tokenHashOmittedFromSnapshot:true};return p})}
function snapshot(projects,reason='manual'){
 const safe=sanitize(projects), row={id:'SNP-'+Date.now().toString(36),at:new Date().toISOString(),reason,schemaVersion:SCHEMA,projectCount:safe.length,checksums:Object.fromEntries(safe.map(p=>[p.id,checksum(p)])),projects:safe};
 const rows=read(SNAP,[]);rows.unshift(row);write(SNAP,rows.slice(0,12));audit({category:'recovery',action:'recovery.snapshot.created',detail:reason});return row;
}
function integrity(projects=[],doc=document){
 const issues=[], ids=new Set(), spaces=new Set(), names=new Map(), dom=new Map(), deploymentIds=new Set();
 doc.querySelectorAll('[id]').forEach(el=>dom.set(el.id,(dom.get(el.id)||0)+1));
 [...dom].filter(([,n])=>n>1).forEach(([id,n])=>issues.push({level:'critical',code:'DUPLICATE_DOM_ID',detail:`${id} x ${n}`}));
 projects.forEach(p=>{
  if(!p?.id){issues.push({level:'critical',code:'PROJECT_ID_MISSING'});return}
  if(ids.has(p.id))issues.push({level:'critical',code:'DUPLICATE_PROJECT_ID',projectId:p.id});ids.add(p.id);
  if(!p.namespace)issues.push({level:'warning',code:'NAMESPACE_MISSING',projectId:p.id});
  if(p.namespace&&spaces.has(p.namespace))issues.push({level:'critical',code:'DUPLICATE_NAMESPACE',projectId:p.id});if(p.namespace)spaces.add(p.namespace);
  if(p?.isolation?.projectId!==p.id)issues.push({level:'critical',code:'ISOLATION_PROJECT_MISMATCH',projectId:p.id});
  if(p?.isolation?.crossProjectAccess!=='deny')issues.push({level:'warning',code:'DEFAULT_DENY_MISSING',projectId:p.id});
  const nn=normalizeName(p?.name||p?.identity?.displayName||''); if(nn){const prior=names.get(nn);if(prior)issues.push({level:'warning',code:'DUPLICATE_DISPLAY_NAME',projectId:p.id,detail:`Shares display name with ${prior}`});else names.set(nn,p.id);}
  deployments(p).forEach(d=>{
    if(!d?.id){issues.push({level:'critical',code:'DEPLOYMENT_ID_MISSING',projectId:p.id});return}
    const qualified=`${p.id}::${d.id}`; if(deploymentIds.has(qualified))issues.push({level:'critical',code:'DUPLICATE_DEPLOYMENT_ID',projectId:p.id,detail:d.id});deploymentIds.add(qualified);
    const boundary=validateDeployment(p,d); if(!boundary.ok)issues.push({level:'critical',code:'DEPLOYMENT_BOUNDARY_MISMATCH',projectId:p.id,detail:`${d.id}: ${boundary.failures.join(', ')}`});
  });
 });
 return{at:new Date().toISOString(),ok:!issues.some(x=>x.level==='critical'),critical:issues.filter(x=>x.level==='critical').length,warnings:issues.filter(x=>x.level==='warning').length,issues};
}
g.BlackFlagV3Core={version:'3.8.7-operational-coherence',schemaVersion:SCHEMA,policyVersion:POLICY,states:STATES,clean,normalizeProjectName:normalizeName,createProjectId,registry,findProjectsByName:sameName,namespaceFor:ns,lifecycle,ensure,migrate,assertProjectScope:scope,authorizeProjectMutation:authorizeMutation,sealDeployment,validateDeployment,canTransitionDeployment,audit,readAudit:()=>read(AUDIT,[]),telemetry,readTelemetry,snapshot,readSnapshots:()=>read(SNAP,[]),integrity,migrationState:()=>read(MIG,null),markMigration:x=>write(MIG,{...x,at:new Date().toISOString()})};
})(window);

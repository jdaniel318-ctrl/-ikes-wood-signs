/* Black Flag v3 Stage 1 — Structural Core */
(function(g){
'use strict';
const SCHEMA=3, POLICY='3.0', AUDIT='blackFlagV3AuditV1', SNAP='blackFlagV3RecoverySnapshotsV1', MIG='blackFlagV3MigrationStateV1', TELEM='blackFlagV3TelemetryV1';
const STATES=['draft','configured','owner_invited','owner_active','deployment_ready','testing','live','suspended','relationship_ended','archived'];
const clean=v=>String(v||'').trim().toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'');
const ns=id=>'bf.project.'+clean(id);
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
function ensure(p){
 if(!p||typeof p!=='object')return p;
 p.id=clean(p.id||p.name||'project'); p.schemaVersion=SCHEMA; p.namespace=ns(p.id);
 p.identity={...(p.identity||{}),projectId:p.id,displayName:p.name||p.identity?.displayName||p.id,projectCode:p.projectCode||p.orderPrefix||p.identity?.projectCode||'PRJ'};
 p.isolation={...(p.isolation||{}),projectId:p.id,namespace:p.namespace,policyVersion:POLICY,crossProjectAccess:'deny'};
 p.permissions={...(p.permissions||{}),policyVersion:POLICY,projectScoped:true,defaultDeny:true};
 p.lifecycle={...(p.lifecycle||{}),state:lifecycle(p),version:1,updatedAt:p.lifecycle?.updatedAt||new Date().toISOString()};
 p.audit={...(p.audit||{}),enabled:true,policyVersion:POLICY};
 return p;
}
function migrate(rows){
 let changed=false;
 const projects=(Array.isArray(rows)?rows:[]).map(p=>{const before=JSON.stringify([p?.schemaVersion,p?.namespace,p?.isolation,p?.permissions,p?.lifecycle,p?.identity]);ensure(p);if(before!==JSON.stringify([p?.schemaVersion,p?.namespace,p?.isolation,p?.permissions,p?.lifecycle,p?.identity]))changed=true;return p});
 return{projects,changed,from:'2.9.x',to:'3.0'};
}
function scope(resource,projectId,{legacyIke=false}={}){
 if(!resource||typeof resource!=='object')return{ok:false,error:'resource_missing'};
 let actual=resource.projectId||resource?.isolation?.projectId||''; if(!actual&&legacyIke)actual='ikes-wood-signs';
 return clean(actual)===clean(projectId)?{ok:true}:{ok:false,error:'project_boundary',expected:clean(projectId),actual:clean(actual)};
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
function sanitize(rows){return structuredClone(rows||[]).map(p=>{if(p?.ownerAccess?.credential)p.ownerAccess.credential={...p.ownerAccess.credential,password:null,passwordOmittedFromSnapshot:true};return p})}
function snapshot(projects,reason='manual'){
 const safe=sanitize(projects), row={id:'SNP-'+Date.now().toString(36),at:new Date().toISOString(),reason,schemaVersion:SCHEMA,projectCount:safe.length,checksums:Object.fromEntries(safe.map(p=>[p.id,checksum(p)])),projects:safe};
 const rows=read(SNAP,[]);rows.unshift(row);write(SNAP,rows.slice(0,12));audit({category:'recovery',action:'recovery.snapshot.created',detail:reason});return row;
}
function integrity(projects=[],doc=document){
 const issues=[], ids=new Set(), spaces=new Set(), dom=new Map();
 doc.querySelectorAll('[id]').forEach(el=>dom.set(el.id,(dom.get(el.id)||0)+1));
 [...dom].filter(([,n])=>n>1).forEach(([id,n])=>issues.push({level:'critical',code:'DUPLICATE_DOM_ID',detail:`${id} x ${n}`}));
 projects.forEach(p=>{
  if(!p?.id){issues.push({level:'critical',code:'PROJECT_ID_MISSING'});return}
  if(ids.has(p.id))issues.push({level:'critical',code:'DUPLICATE_PROJECT_ID',projectId:p.id});ids.add(p.id);
  if(!p.namespace)issues.push({level:'warning',code:'NAMESPACE_MISSING',projectId:p.id});
  if(p.namespace&&spaces.has(p.namespace))issues.push({level:'critical',code:'DUPLICATE_NAMESPACE',projectId:p.id});if(p.namespace)spaces.add(p.namespace);
  if(p?.isolation?.projectId!==p.id)issues.push({level:'critical',code:'ISOLATION_PROJECT_MISMATCH',projectId:p.id});
  if(p?.isolation?.crossProjectAccess!=='deny')issues.push({level:'warning',code:'DEFAULT_DENY_MISSING',projectId:p.id});
 });
 return{at:new Date().toISOString(),ok:!issues.some(x=>x.level==='critical'),critical:issues.filter(x=>x.level==='critical').length,warnings:issues.filter(x=>x.level==='warning').length,issues};
}
g.BlackFlagV3Core={version:'3.0-stage1',schemaVersion:SCHEMA,policyVersion:POLICY,states:STATES,clean,namespaceFor:ns,lifecycle,ensure,migrate,assertProjectScope:scope,audit,readAudit:()=>read(AUDIT,[]),telemetry,readTelemetry,snapshot,readSnapshots:()=>read(SNAP,[]),integrity,migrationState:()=>read(MIG,null),markMigration:x=>write(MIG,{...x,at:new Date().toISOString()})};
})(window);
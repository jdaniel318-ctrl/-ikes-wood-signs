/* Dark Sky 4.0.8 — Orphan Watch platform generation layer */
(function(g){
'use strict';
const VERSION='4.0.8';
const NAME='Broadside';
const SCHEMA=1;
const KEYS=Object.freeze({
 state:'darkSkyV4StateV1', flags:'darkSkyV4FeatureFlagsV1', decisions:'darkSkyV4DecisionLedgerV1',
 diagnostics:'darkSkyV4BlackBoxV1', labs:'darkSkyV4CaptainLabV1', release:'darkSkyV4ReleaseRingsV1',
 recovery:'darkSkyV4RecoveryVaultV1', migration:'darkSkyV4MigrationGateV1'
});
const CONTRACT=Object.freeze([
 'Nothing disappears during an ordinary upgrade.',
 'Nothing crosses project boundaries.',
 'Every important change is traceable.',
 'Experiments cannot silently alter production.',
 'Every vessel can be recovered and carried forward.'
]);
const ROLE_CAPABILITIES=Object.freeze({
 captain:['fleet.read','governance.decide','lab.create','lab.promote','recovery.create','recovery.review','release.review','audit.read','diagnostics.read','feature_flags.manage'],
 engine_admin:['fleet.read','project.configure','project.test','deployment.manage','recovery.create','audit.read','diagnostics.read'],
 project_admin:['project.read','project.configure','orders.manage','customers.manage'],
 limited_admin:['project.read','orders.manage'],
 owner:['project.read','orders.manage','customers.read'],
 customer:['customer_flow.use']
});
const DEFAULT_FLAGS=Object.freeze({
 recovery_vault:{enabled:true,scope:'fleet',ring:'stable'},
 black_box:{enabled:true,scope:'fleet',ring:'stable'},
 captain_lab:{enabled:true,scope:'captain',ring:'captain'},
 decision_ledger:{enabled:true,scope:'captain',ring:'stable'},
 release_rings:{enabled:true,scope:'fleet',ring:'stable'},
 command_search:{enabled:false,scope:'fleet',ring:'captain'},
 attention_center:{enabled:true,scope:'fleet',ring:'stable'},
 workflow_engine:{enabled:false,scope:'project',ring:'captain'}
});
function read(key,fallback){try{const v=JSON.parse(localStorage.getItem(key));return v==null?fallback:v}catch(_){return fallback}}
function write(key,value){localStorage.setItem(key,JSON.stringify(value));return value}
function uid(prefix){return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`}
function core(){return g.BlackFlagV3Core||null}
function cleanProject(p){
 const c=structuredClone(p||{});
 if(c?.ownerAccess?.credential)c.ownerAccess.credential={login:c.ownerAccess.credential.login||'',secretMaterialOmitted:true};
 if(c?.ownerAccess?.invitation)c.ownerAccess.invitation={...c.ownerAccess.invitation,tokenHash:'[omitted]'};
 return c;
}
function featureFlags(){return {...DEFAULT_FLAGS,...read(KEYS.flags,{})}}
function setFeatureFlag(key,patch={}){
 if(!DEFAULT_FLAGS[key])throw new Error('Unknown V4 feature flag.');
 const rows=featureFlags(); rows[key]={...rows[key],...patch,updatedAt:new Date().toISOString()}; write(KEYS.flags,rows);
 core()?.audit?.({actorRole:'captain',category:'v4.feature',action:'v4.feature_flag.changed',detail:`${key} → ${rows[key].enabled?'enabled':'disabled'} • ${rows[key].ring||'stable'}`});
 return rows[key];
}
function can(role,capability){return !!ROLE_CAPABILITIES[role]?.includes(capability)}
function decision(entry={}){
 const text=String(entry.decision||entry.title||'').trim(); if(!text)throw new Error('Decision text is required.');
 const rows=read(KEYS.decisions,[]); const row={id:uid('DEC'),at:new Date().toISOString(),status:entry.status||'active',decision:text,rationale:String(entry.rationale||'').trim(),scope:entry.scope||'platform',projectId:entry.projectId||null,warning:String(entry.warning||'').trim(),supersedes:entry.supersedes||null};
 rows.unshift(row);write(KEYS.decisions,rows.slice(0,500));core()?.audit?.({actorRole:'captain',projectId:row.projectId,category:'governance',action:'v4.captain.decision.recorded',detail:row.decision});return row;
}
function decisions(){return read(KEYS.decisions,[])}
function diagnostic(type,detail='',extra={}){
 const rows=read(KEYS.diagnostics,[]);const row={id:uid('BBX'),at:new Date().toISOString(),type:String(type||'event'),detail:String(detail||''),build:VERSION,url:location.pathname,projectId:document.body?.dataset?.activeProject||null,...extra};
 rows.unshift(row);write(KEYS.diagnostics,rows.slice(0,300));return row;
}
function diagnostics(){return read(KEYS.diagnostics,[])}
function labCreate(project,brief=''){
 if(!project?.id)throw new Error('A project is required for a Captain Lab experiment.');
 const rows=read(KEYS.labs,[]);const row={id:uid('LAB'),at:new Date().toISOString(),updatedAt:new Date().toISOString(),projectId:project.id,projectName:project.name||project.id,state:'sandbox',brief:String(brief||'').trim(),productionWriteAllowed:false,clone:cleanProject(project)};
 rows.unshift(row);write(KEYS.labs,rows.slice(0,40));core()?.audit?.({actorRole:'captain',projectId:project.id,category:'experiment',action:'v4.captain_lab.created',detail:`${row.id} • production writes denied`});return row;
}
function labs(){return read(KEYS.labs,[])}
function labMark(id,state,notes=''){
 const rows=labs(),row=rows.find(x=>x.id===id);if(!row)throw new Error('Lab experiment not found.');
 if(!['sandbox','candidate','rejected','promoted'].includes(state))throw new Error('Invalid lab state.');
 row.state=state;row.notes=String(notes||'');row.updatedAt=new Date().toISOString();row.productionWriteAllowed=false;write(KEYS.labs,rows);core()?.audit?.({actorRole:'captain',projectId:row.projectId,category:'experiment',action:`v4.captain_lab.${state}`,detail:`${id} • promotion records approval only; Engine applies changes separately`});return row;
}
function releaseState(){return read(KEYS.release,{currentRing:'captain',rings:['captain','private','selected_live','fleet'],lastPromotion:null})}
function setReleaseRing(ring,detail=''){
 const state=releaseState();if(!state.rings.includes(ring))throw new Error('Unknown release ring.');
 const next={...state,currentRing:ring,lastPromotion:{at:new Date().toISOString(),ring,detail:String(detail||'')}};write(KEYS.release,next);core()?.audit?.({actorRole:'captain',category:'release',action:'v4.release_ring.changed',detail:`${state.currentRing} → ${ring}${detail?' • '+detail:''}`});return next;
}
function recoveryPoint(projects=[],reason='manual-v4'){
 const coreSnap=core()?.snapshot?.(projects,reason)||null;
 const rows=read(KEYS.recovery,[]);const row={id:uid('VAULT'),at:new Date().toISOString(),reason,build:VERSION,projectCount:projects.length,projectIds:projects.map(p=>p.id),coreSnapshotId:coreSnap?.id||null,registryFingerprint:projects.map(p=>`${p.id}:${p.namespace||core()?.namespaceFor?.(p.id)||''}`).sort().join('|')};
 rows.unshift(row);write(KEYS.recovery,rows.slice(0,20));core()?.audit?.({actorRole:'system',category:'recovery',action:'v4.recovery_vault.sealed',detail:`${row.id} • ${row.projectCount} projects`});return row;
}
function recoveryVault(){return read(KEYS.recovery,[])}
function preflight(projects=[],doc=document){
 const base=core()?.integrity?.(projects,doc)||{issues:[]};const issues=[...(base.issues||[])];
 if(!Array.isArray(projects)||!projects.length)issues.push({level:'critical',code:'V4_FLEET_EMPTY',detail:'No registered projects were supplied to V4 preflight.'});
 projects.forEach(p=>{
   const expected=core()?.namespaceFor?.(p.id)||`bf.project.${p.id}`;
   if(String(p.namespace||expected)!==expected)issues.push({level:'critical',code:'V4_NAMESPACE_CONTRACT',projectId:p.id,detail:`Expected ${expected}`});
   if(!p.id)issues.push({level:'critical',code:'V4_IDENTITY_CONTRACT',detail:p.name||'Unnamed project'});
 });
 const flags=featureFlags();if(!flags.recovery_vault?.enabled)issues.push({level:'warning',code:'V4_RECOVERY_VAULT_DISABLED'});if(!flags.black_box?.enabled)issues.push({level:'warning',code:'V4_BLACK_BOX_DISABLED'});
 const critical=issues.filter(x=>x.level==='critical').length,warnings=issues.filter(x=>x.level==='warning').length;
 return {at:new Date().toISOString(),version:VERSION,name:NAME,ok:critical===0,critical,warnings,contract:CONTRACT,issues};
}
function bootstrap(projects=[]){
 const prior=read(KEYS.migration,null);if(prior?.completed)return prior;
 const vault=recoveryPoint(projects,'pre-v4.0.0-broadside-migration');
 const row={from:'3.10.2',to:VERSION,at:new Date().toISOString(),completed:true,recoveryPointId:vault.id,projectIds:projects.map(p=>p.id)};write(KEYS.migration,row);write(KEYS.state,{version:VERSION,name:NAME,schema:SCHEMA,installedAt:row.at,contract:CONTRACT});core()?.audit?.({actorRole:'system',category:'migration',action:'v4.0.0.broadside.migration.complete',detail:`${projects.length} projects • recovery ${vault.id}`});return row;
}
function exportProject(project){
 if(!project?.id)throw new Error('Project missing.');
 const payload={exportedAt:new Date().toISOString(),darkSkyVersion:VERSION,project:cleanProject(project),audit:(core()?.readAudit?.()||[]).filter(x=>x.projectId===project.id)};
 return new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
}
function migrationState(){return read(KEYS.migration,null)}
function completeCommissioning(projects=[],meta={}){
 const expected=Array.isArray(projects)?projects.length:0, sealed=Number(meta.sealedCount??expected);
 if(!expected||sealed!==expected)return markCommissioningFailed(projects,`Envelope invariant failed: ${sealed}/${expected} sealed.`);
 const prior=migrationState()||{};
 const row={...prior,from:prior.from||'3.10.2',to:VERSION,at:new Date().toISOString(),completed:true,failed:false,stage:'v4-project-envelopes',projectIds:projects.map(p=>p.id),commissionedProjectCount:sealed};
 write(KEYS.migration,row);write(KEYS.state,{version:VERSION,name:NAME,schema:SCHEMA,installedAt:read(KEYS.state,{})?.installedAt||row.at,commissionedAt:row.at,contract:CONTRACT});
 core()?.audit?.({actorRole:'system',category:'migration',action:'v4.0.8.commissioning.harbor_master_sealed',detail:`${sealed}/${expected} project envelopes read-back verified`});
 return row;
}
function markCommissioningFailed(projects=[],reason='Commissioning invariant failed'){
 const prior=migrationState()||{}, expected=Array.isArray(projects)?projects.length:0;
 const row={...prior,to:VERSION,at:new Date().toISOString(),completed:false,failed:true,stage:'v4-project-envelopes',projectIds:(projects||[]).map(p=>p.id),commissionedProjectCount:0,failure:String(reason||'Commissioning failed')};
 write(KEYS.migration,row);core()?.audit?.({actorRole:'system',category:'migration',action:'v4.0.8.commissioning.failed',detail:row.failure});diagnostic('commissioning.failed',row.failure,{projectCount:expected});return row;
}
function status(projects=[]){const pf=preflight(projects,null),rel=releaseState();return {version:VERSION,name:NAME,schema:SCHEMA,contract:CONTRACT,preflight:pf,release:rel,flags:featureFlags(),decisions:decisions().length,labs:labs().length,diagnostics:diagnostics().length,recoveryPoints:recoveryVault().length,migration:migrationState()}}
window.addEventListener('error',e=>{if(featureFlags().black_box?.enabled)diagnostic('javascript.error',e.message||'Unknown error',{source:e.filename||'',line:e.lineno||0,column:e.colno||0})});
window.addEventListener('unhandledrejection',e=>{if(featureFlags().black_box?.enabled)diagnostic('promise.rejection',String(e.reason?.message||e.reason||'Unhandled rejection'))});
g.DarkSkyV4={version:VERSION,name:NAME,schemaVersion:SCHEMA,contract:CONTRACT,roles:ROLE_CAPABILITIES,can,featureFlags,setFeatureFlag,decision,decisions,diagnostic,diagnostics,labCreate,labs,labMark,releaseState,setReleaseRing,recoveryPoint,recoveryVault,preflight,bootstrap,migrationState,completeCommissioning,markCommissioningFailed,exportProject,status};
})(window);

/* Dark Sky 8.6.61 — Recovery Identity Landing: authenticated read capability with exact-vessel RLS authority. */
(function(g){
'use strict';
const BUILD='8.6.61';
const ROLE={ADMIRAL:'admiral',CAPTAIN:'captain',ENGINE_ADMIN:'engine_admin',PROJECT_OWNER:'project_owner',PROJECT_STAFF:'project_staff',DEVICE:'device',CUSTOMER:'customer',CLIENT_PREVIEW:'client_preview'};
const ACTION={PLATFORM_GOVERN:'platform.govern',VESSEL_COMMISSION:'vessel.commission',PROJECT_CONFIGURE:'project.configure',PROJECT_PUBLISH:'project.publish',PROJECT_VIEW:'project.view',OWNER_MANAGE:'owner.manage',ORDERS_READ:'orders.read',ORDERS_WRITE:'orders.write',CUSTOMERS_READ:'customers.read',PRODUCTS_WRITE:'products.write',PRICING_WRITE:'pricing.write',BRANDING_WRITE:'branding.write',DEPLOYMENTS_WRITE:'deployments.write',STAFF_WRITE:'staff.write',REPORTING_READ:'reporting.read',NOTIFICATIONS_WRITE:'notifications.write',CUSTOMER_ORDER_CREATE:'customer.order.create'};
const grants={
 admiral:['*'],captain:['*'],
 engine_admin:Object.values(ACTION).filter(x=>x!=='platform.govern'&&x!=='customer.order.create'),
 project_owner:[ACTION.PROJECT_VIEW,ACTION.ORDERS_READ,ACTION.ORDERS_WRITE,ACTION.CUSTOMERS_READ,ACTION.PRODUCTS_WRITE,ACTION.PRICING_WRITE,ACTION.BRANDING_WRITE,ACTION.DEPLOYMENTS_WRITE,ACTION.STAFF_WRITE,ACTION.REPORTING_READ,ACTION.NOTIFICATIONS_WRITE],
 project_staff:[ACTION.PROJECT_VIEW,ACTION.ORDERS_READ,ACTION.ORDERS_WRITE,ACTION.CUSTOMERS_READ],
 device:[ACTION.CUSTOMER_ORDER_CREATE],customer:[ACTION.CUSTOMER_ORDER_CREATE],client_preview:[]
};
function authorize({role=ROLE.CUSTOMER,action,projectId=null,sessionProjectId=null}={}){
 const list=grants[role]||[]; if(list.includes('*'))return{ok:true};
 if([ROLE.PROJECT_OWNER,ROLE.PROJECT_STAFF,ROLE.DEVICE].includes(role)&&String(projectId||'')!==String(sessionProjectId||''))return{ok:false,reason:'project_boundary'};
 return list.includes(action)?{ok:true}:{ok:false,reason:'role_denied'};
}
const OWNER_MODULE_ACTION={orders:ACTION.ORDERS_READ,customers:ACTION.CUSTOMERS_READ,products:ACTION.PRODUCTS_WRITE,pricing:ACTION.PRICING_WRITE,branding:ACTION.BRANDING_WRITE,kiosks:ACTION.DEPLOYMENTS_WRITE,deployments:ACTION.DEPLOYMENTS_WRITE,staff:ACTION.STAFF_WRITE,reporting:ACTION.REPORTING_READ,notifications:ACTION.NOTIFICATIONS_WRITE};
function ownerCan(project,moduleKey,sessionProjectId){
 if(moduleKey==='settings')return String(project?.id||'')===String(sessionProjectId||'');
 const action=OWNER_MODULE_ACTION[moduleKey];if(!action)return false;
 const base=authorize({role:ROLE.PROJECT_OWNER,action,projectId:project?.id,sessionProjectId});
 if(!base.ok)return false;
 return (project?.ownerAccess?.capabilities||[]).includes(moduleKey);
}
const CONFIG_KEY='darkSkyProductionIdentityConfigV1';
const STAGING_DEFAULT=Object.freeze({provider:'supabase',environment:'staging',url:'https://sjgqqtnuttnkwsoebbqf.supabase.co',publishableKey:'sb_publishable_gvWfIBQg4ew2RvVr6CpJSg_8y02QmKy',rlsContractVersion:'identity-keel-v1',configuredAt:'fleet-staging-bootstrap'});
function readConfig(){try{const c=JSON.parse(localStorage.getItem(CONFIG_KEY)||'null');return c&&typeof c==='object'?c:STAGING_DEFAULT;}catch(_){return STAGING_DEFAULT;}}
function safeClientConfig(config){const c=config||readConfig();if(!c)return null;return {provider:'supabase',environment:String(c.environment||'staging'),url:String(c.url||'').replace(/\/+$/,''),publishableKey:String(c.publishableKey||''),rlsContractVersion:String(c.rlsContractVersion||''),configuredAt:c.configuredAt||''};}
function hasForbiddenSecret(config){const raw=JSON.stringify(config||readConfig()||{});return /service[_-]?role|sb_secret_|secretKey|serviceRole/i.test(raw);}
function productionStatus(){const c=safeClientConfig();const configured=!!(c?.url&&/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(c.url)&&c?.publishableKey&&/^(sb_publishable_|eyJ)/.test(c.publishableKey));const secretSafe=!hasForbiddenSecret(c);const rlsDeclared=c?.rlsContractVersion==='identity-keel-v1';const staging=String(c?.environment||'staging')==='staging';return {provider:'supabase',environment:staging?'staging':'production',configured,secretSafe,rlsDeclared,ready:configured&&secretSafe&&rlsDeclared,productionEnabled:false,mode:configured?'staging-adapter-configured':'bridge-only',build:BUILD};}
function configureProductionAuth({url,publishableKey,rlsContractVersion='identity-keel-v1'}={}){
 const clean={provider:'supabase',environment:'staging',url:String(url||'').trim().replace(/\/+$/,''),publishableKey:String(publishableKey||'').trim(),rlsContractVersion:String(rlsContractVersion||''),configuredAt:new Date().toISOString(),build:BUILD};
 if(hasForbiddenSecret(clean))throw new Error('Secret/service-role keys are forbidden in browser configuration. Use only a Supabase publishable key.');
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(clean.url))throw new Error('Enter the Supabase project URL.');
 if(!/^(sb_publishable_|eyJ)/.test(clean.publishableKey))throw new Error('Use a Supabase publishable key (legacy anon is accepted only during migration).');
 localStorage.setItem(CONFIG_KEY,JSON.stringify(clean));return productionStatus();
}
function clearProductionAuth(){localStorage.removeItem(CONFIG_KEY);return productionStatus();}
async function probeProductionAuth(){const c=safeClientConfig();if(!c?.url||!c?.publishableKey)return {ok:false,error:'not_configured',status:productionStatus()};const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),6000);try{const r=await fetch(c.url+'/auth/v1/settings',{headers:{apikey:c.publishableKey},cache:'no-store',signal:ctl.signal});return {ok:r.ok,http:r.status,status:productionStatus()};}catch(err){return {ok:false,error:String(err?.name==='AbortError'?'timeout':err?.message||err),status:productionStatus()};}finally{clearTimeout(timer);}}
const commissioningAuthority={allowedRoles:[ROLE.ADMIRAL,ROLE.CAPTAIN,ROLE.ENGINE_ADMIN],deniedRoles:[ROLE.PROJECT_OWNER,ROLE.PROJECT_STAFF,ROLE.DEVICE,ROLE.CUSTOMER,ROLE.CLIENT_PREVIEW],canCommission(role){return this.allowedRoles.includes(String(role||''));},contract:'commissioner creates sealed vessel; commissioner does not become owner automatically'};

const ownershipCharter=Object.freeze({
 entryPaths:['self_join','captain_commissioned','admiral_commissioned','engine_admin_commissioned','fleet_commissioned'],
 ownershipModels:['fleet_unassigned','admiral_owned','outside_owner_pending','outside_owner_assigned','fleet_owned'],
 operatingModels:['owner_operated','captain_operated','fleet_operated','delegated_operator'],
 principles:['commissioning_authority_is_not_ownership','ownership_is_not_operating_authority','vessel_identity_survives_transfer','one_canonical_primary_owner_state','transfer_is_invite_accept_audit','admiral_course_authority_remains_separate'],
 selfJoin:{allowed:true,initialState:'pending_review',authorityGrantedOnlyAfterApproval:true},
 transfer:{atomic:true,newOwnerMustAccept:true,priorOwnerReducedAfterAcceptance:true,recoveryAuthority:['admiral','captain','engine_admin']},
 admiralOwned:{allowed:true,captainMayOperate:true,ownerTransferOptional:true}
});
const productionAuth={provider:'supabase',required:true,get ready(){return productionStatus().ready;},status:productionStatus,configure:configureProductionAuth,clear:clearProductionAuth,probe:probeProductionAuth,readClientConfig:safeClientConfig,require:['server_side_identity','publishable_browser_key_only','row_level_security','membership_authorization','secure_sessions','recovery','revocation','rollback_bridge']};
g.BlackFlagV3Identity={version:'8.6.61-admiral-command-rail',build:BUILD,ROLE,ACTION,authorize,ownerCan,productionAuth,commissioningAuthority,ownershipCharter};
})(window);

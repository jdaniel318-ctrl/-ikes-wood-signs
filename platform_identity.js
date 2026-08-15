/* Black Flag v3 Stage 1 — Identity & Permission Policy */
(function(g){
'use strict';
const ROLE={CAPTAIN:'captain',ENGINE_ADMIN:'engine_admin',PROJECT_OWNER:'project_owner',PROJECT_STAFF:'project_staff',DEVICE:'device',CUSTOMER:'customer'};
const ACTION={PLATFORM_GOVERN:'platform.govern',PROJECT_CONFIGURE:'project.configure',PROJECT_PUBLISH:'project.publish',PROJECT_VIEW:'project.view',OWNER_MANAGE:'owner.manage',ORDERS_READ:'orders.read',ORDERS_WRITE:'orders.write',CUSTOMERS_READ:'customers.read',PRODUCTS_WRITE:'products.write',PRICING_WRITE:'pricing.write',BRANDING_WRITE:'branding.write',DEPLOYMENTS_WRITE:'deployments.write',STAFF_WRITE:'staff.write',REPORTING_READ:'reporting.read',NOTIFICATIONS_WRITE:'notifications.write',CUSTOMER_ORDER_CREATE:'customer.order.create'};
const grants={
 captain:['*'],
 engine_admin:Object.values(ACTION).filter(x=>x!=='platform.govern'&&x!=='customer.order.create'),
 project_owner:[ACTION.PROJECT_VIEW,ACTION.ORDERS_READ,ACTION.ORDERS_WRITE,ACTION.CUSTOMERS_READ,ACTION.PRODUCTS_WRITE,ACTION.PRICING_WRITE,ACTION.BRANDING_WRITE,ACTION.DEPLOYMENTS_WRITE,ACTION.STAFF_WRITE,ACTION.REPORTING_READ,ACTION.NOTIFICATIONS_WRITE],
 project_staff:[ACTION.PROJECT_VIEW,ACTION.ORDERS_READ,ACTION.ORDERS_WRITE,ACTION.CUSTOMERS_READ],
 device:[ACTION.CUSTOMER_ORDER_CREATE],customer:[ACTION.CUSTOMER_ORDER_CREATE]
};
function authorize({role=ROLE.CUSTOMER,action,projectId=null,sessionProjectId=null}={}){
 const list=grants[role]||[]; if(list.includes('*'))return{ok:true};
 if([ROLE.PROJECT_OWNER,ROLE.PROJECT_STAFF,ROLE.DEVICE].includes(role)&&String(projectId||'')!==String(sessionProjectId||''))return{ok:false,reason:'project_boundary'};
 return list.includes(action)?{ok:true}:{ok:false,reason:'role_denied'};
}

const OWNER_MODULE_ACTION={
 orders:ACTION.ORDERS_READ,customers:ACTION.CUSTOMERS_READ,products:ACTION.PRODUCTS_WRITE,
 pricing:ACTION.PRICING_WRITE,branding:ACTION.BRANDING_WRITE,kiosks:ACTION.DEPLOYMENTS_WRITE,
 deployments:ACTION.DEPLOYMENTS_WRITE,staff:ACTION.STAFF_WRITE,reporting:ACTION.REPORTING_READ,
 notifications:ACTION.NOTIFICATIONS_WRITE
};
function ownerCan(project,moduleKey,sessionProjectId){
 if(moduleKey==='settings')return String(project?.id||'')===String(sessionProjectId||'');
 const action=OWNER_MODULE_ACTION[moduleKey];if(!action)return false;
 const base=authorize({role:ROLE.PROJECT_OWNER,action,projectId:project?.id,sessionProjectId});
 if(!base.ok)return false;
 return (project?.ownerAccess?.capabilities||[]).includes(moduleKey);
}

g.BlackFlagV3Identity={version:'3.8.20-immutable-project-identity',ROLE,ACTION,authorize,ownerCan,productionAuth:{ready:false,require:['server_side_identity','password_hashing','secure_sessions','server_side_authorization','recovery','revocation']}};
})(window);
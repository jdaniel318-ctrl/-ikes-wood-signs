/* Dark Sky / Black Flag v4.1.1 — Full Sail core compatibility layer */
(function(g){
'use strict';
const SCHEMA=8, POLICY='4.0', AUDIT='blackFlagV3AuditV1', SNAP='blackFlagV3RecoverySnapshotsV1', MIG='blackFlagV3MigrationStateV1', TELEM='blackFlagV3TelemetryV1';
const STATES=['draft','configured','owner_invited','owner_active','deployment_ready','testing','live','suspended','relationship_ended','archived'];
const FLEET_FOUNDATION=Object.freeze({
 version:'1.0',
 doctrine:'Engine is the first ship, not the fleet.',
 reusable:Object.freeze(['immutable_identity','authorization','tenant_isolation','lifecycle_contracts','audit_log','telemetry','recovery_snapshots','deployment_boundaries','integration_contracts','visual_capability_contracts']),
 engineSpecific:Object.freeze(['business_projects','orders','customers','products_services','project_control','business_deployments']),
 futureShipRule:'Reuse Dark Sky primitives without inheriting Engine-specific workflows or UI.'
});


const BUSINESS_MODEL_MODES=Object.freeze(['custom-product','retail','food-service','service','request-quote','mixed','other']);
const BUSINESS_BRIEF_MAX=12000;

const CUSTOMER_RELATIONSHIP_TYPES=Object.freeze({
 purchase:Object.freeze({label:'Purchase / Order',noun:'order',actionLabel:'PLACE ORDER',testActionLabel:'PLACE TEST ORDER',receiptLabel:'ORDER RECEIVED',confirmationHeading:'Order received.',nextStep:'The business has your order and can take it from here.',detailHeading:'Tell us how you want it',detailPlaceholder:'Quantity, options, preferences, or special instructions.'}),
 service_request:Object.freeze({label:'Service Request',noun:'service request',actionLabel:'REQUEST SERVICE',testActionLabel:'SUBMIT TEST SERVICE REQUEST',receiptLabel:'SERVICE REQUEST RECEIVED',confirmationHeading:'Service request received.',nextStep:'The business can review the work and follow up with you.',detailHeading:'Tell us about the work',detailPlaceholder:'Describe the job, location, timing, and anything the business should know.'}),
 quote:Object.freeze({label:'Quote / Estimate',noun:'quote request',actionLabel:'REQUEST QUOTE',testActionLabel:'SUBMIT TEST QUOTE REQUEST',receiptLabel:'QUOTE REQUEST RECEIVED',confirmationHeading:'Quote request received.',nextStep:'The business can review the details and prepare the next step.',detailHeading:'Tell us what you need priced',detailPlaceholder:'Describe the scope, quantities, timing, location, and any important requirements.'}),
 booking:Object.freeze({label:'Booking / Appointment',noun:'booking request',actionLabel:'REQUEST APPOINTMENT',testActionLabel:'SUBMIT TEST BOOKING',receiptLabel:'BOOKING REQUEST RECEIVED',confirmationHeading:'Booking request received.',nextStep:'The business can confirm availability and timing with you.',detailHeading:'Tell us what you want to schedule',detailPlaceholder:'Describe the service, preferred timing, location, and any special requirements.'}),
 inquiry:Object.freeze({label:'Inquiry',noun:'inquiry',actionLabel:'SEND INQUIRY',testActionLabel:'SUBMIT TEST INQUIRY',receiptLabel:'INQUIRY RECEIVED',confirmationHeading:'Inquiry received.',nextStep:'The business can review your message and respond.',detailHeading:'What would you like to know?',detailPlaceholder:'Tell the business what you are looking for or what you would like to discuss.'}),
 partnership:Object.freeze({label:'Partnership / Engagement',noun:'partnership request',actionLabel:'START PARTNERSHIP',testActionLabel:'SUBMIT TEST PARTNERSHIP',receiptLabel:'PARTNERSHIP REQUEST RECEIVED',confirmationHeading:'Partnership request received.',nextStep:'This starts the conversation. The business can review the opportunity and follow up with you.',detailHeading:'Tell us about the partnership',detailPlaceholder:'Describe what you want to accomplish together, where it would happen, timing, responsibilities, quantities, and anything else the business should understand.'}),
 application:Object.freeze({label:'Application',noun:'application',actionLabel:'SUBMIT APPLICATION',testActionLabel:'SUBMIT TEST APPLICATION',receiptLabel:'APPLICATION RECEIVED',confirmationHeading:'Application received.',nextStep:'The business can review the application and follow up.',detailHeading:'Tell us about your application',detailPlaceholder:'Provide the information the business should consider when reviewing this application.'}),
 reservation:Object.freeze({label:'Reservation',noun:'reservation request',actionLabel:'REQUEST RESERVATION',testActionLabel:'SUBMIT TEST RESERVATION',receiptLabel:'RESERVATION REQUEST RECEIVED',confirmationHeading:'Reservation request received.',nextStep:'The business can confirm availability and the reservation details.',detailHeading:'Tell us what you want to reserve',detailPlaceholder:'Include date, time, quantity, location, and any special requirements.'}),
 custom_project:Object.freeze({label:'Custom Project',noun:'project request',actionLabel:'START PROJECT',testActionLabel:'SUBMIT TEST PROJECT',receiptLabel:'PROJECT REQUEST RECEIVED',confirmationHeading:'Project request received.',nextStep:'The business can review the project and determine the next step with you.',detailHeading:'Tell us about the project',detailPlaceholder:'Describe what you want to accomplish, timing, requirements, and anything else the business should know.'})
});
const CUSTOMER_WORKFLOW_PROFILES=Object.freeze({purchase:Object.freeze(['New','In Production','Ready for Pickup','Completed']),service_request:Object.freeze(['New Request','Reviewing','Scheduled','In Progress','Completed']),quote:Object.freeze(['New Request','Reviewing','Estimate Prepared','Awaiting Decision','Completed']),booking:Object.freeze(['New Booking','Confirming','Scheduled','Completed']),inquiry:Object.freeze(['New Inquiry','Reviewing','Responded','Completed']),partnership:Object.freeze(['New Partnership','Reviewing','Contacted','Active Partnership','Completed']),application:Object.freeze(['New Application','Reviewing','Decision Pending','Completed']),reservation:Object.freeze(['New Reservation','Confirming','Reserved','Completed']),custom_project:Object.freeze(['New Project','Discovery','Planning','In Progress','Completed'])});
const CUSTOMER_ACTIVITY_TERMS=Object.freeze({purchase:{singular:'Order',plural:'Orders',lowerSingular:'order',lowerPlural:'orders'},service_request:{singular:'Request',plural:'Requests',lowerSingular:'request',lowerPlural:'requests'},quote:{singular:'Quote',plural:'Quotes',lowerSingular:'quote',lowerPlural:'quotes'},booking:{singular:'Booking',plural:'Bookings',lowerSingular:'booking',lowerPlural:'bookings'},inquiry:{singular:'Inquiry',plural:'Inquiries',lowerSingular:'inquiry',lowerPlural:'inquiries'},partnership:{singular:'Engagement',plural:'Engagements',lowerSingular:'engagement',lowerPlural:'engagements'},application:{singular:'Application',plural:'Applications',lowerSingular:'application',lowerPlural:'applications'},reservation:{singular:'Reservation',plural:'Reservations',lowerSingular:'reservation',lowerPlural:'reservations'},custom_project:{singular:'Project Request',plural:'Project Requests',lowerSingular:'project request',lowerPlural:'project requests'}});
function defaultWorkflowForRelationship(type='custom_project'){return [...(CUSTOMER_WORKFLOW_PROFILES[type]||CUSTOMER_WORKFLOW_PROFILES.custom_project)];}
function deriveCustomerRelationship(p={},model=null){
 const explicit=String(p?.customerExperience?.relationshipType||p?.operatingModel?.overrides?.relationshipType||p?.operatingModel?.relationshipType||'').trim();
 if(CUSTOMER_RELATIONSHIP_TYPES[explicit])return explicit;
 const operating=model||deriveOperatingProfile(p);
 const text=[normalizeBusinessBrief(p).text,p.description||'',...(p.products||[]).map(x=>x.name||'')].join(' ').toLowerCase();
 if(/partner|partnership|collaborat|sponsor|joint venture|vendor relationship|work together/.test(text))return'partnership';
 if(/application|apply for|candidate|enroll/.test(text))return'application';
 if(/reservation|reserve a|reserve our/.test(text))return'reservation';
 if(/appointment|booking|book a|schedule a/.test(text))return'booking';
 if(/quote|estimate|bid|proposal|pricing request/.test(text)||operating.mode==='request-quote')return'quote';
 if(/inquiry|question|learn more|contact us|discuss/.test(text))return'inquiry';
 if(operating.mode==='service')return'service_request';
 if(['custom-product','retail','food-service'].includes(operating.mode))return'purchase';
 return'custom_project';
}
function resolveCustomerRelationship(p={}){
 const model=resolveOperatingModel(p);
 const type=deriveCustomerRelationship(p,model);
 return {type,...CUSTOMER_RELATIONSHIP_TYPES[type]};
}
function activityTermsForProject(p={}){const type=resolveCustomerRelationship(p).type;return {type,...(CUSTOMER_ACTIVITY_TERMS[type]||CUSTOMER_ACTIVITY_TERMS.custom_project)};}
function resolveProjectWorkflow(p={}){if(Array.isArray(p.workflow)&&p.workflow.length>=2)return p.workflow.map(x=>String(x).trim()).filter(Boolean);return defaultWorkflowForRelationship(resolveCustomerRelationship(p).type);}

function normalizeBusinessBrief(p={}){
 const raw=p.businessBrief;
 const text=typeof raw==='string'?raw:(raw&&typeof raw==='object'?raw.text:'')||p.description||'';
 return {
  version:1,
  text:String(text||'').trim().slice(0,BUSINESS_BRIEF_MAX),
  source:(raw&&typeof raw==='object'&&raw.source)|| (p.commissionedAt?'commissioning':'legacy'),
  updatedAt:(raw&&typeof raw==='object'&&raw.updatedAt)||p.updatedAt||new Date().toISOString()
 };
}
function detectFulfillment(text=''){
 const t=String(text).toLowerCase(), out=[];
 const add=(id,words)=>{if(words.some(w=>t.includes(w))&&!out.includes(id))out.push(id)};
 add('pickup',['pickup','pick up','collect']); add('delivery',['delivery','deliver']); add('shipping',['ship','shipping','mail']);
 add('on-site',['on site','on-site','at your home','at your business','service call']); add('event',['event','festival','market','pop-up','popup']);
 add('mobile',['mobile','truck','trailer','stand']); add('digital',['digital','download','online delivery']);
 return out;
}
function deriveOperatingProfile(p={},briefOverride){
 const brief=typeof briefOverride==='string'?briefOverride:normalizeBusinessBrief(p).text;
 const text=[brief,p.description||'',...(p.products||[]).map(x=>x.name||'')].join(' ').toLowerCase();
 const type=String(p.businessType||p.type||'other').toLowerCase();
 let mode='other';
 if(type.includes('food')||/lemonade|bakery|restaurant|cafe|coffee|food|drink|beverage/.test(text))mode='food-service';
 else if(type.includes('service')||/service|repair|clean|consult|install|landscap|electric|plumb|appointment/.test(text))mode='service';
 else if(type.includes('retail')||/retail|store|shop|merchandise/.test(text))mode='retail';
 else if(type.includes('wood')||type.includes('mug')||type.includes('flower')||/custom|personaliz|engrave|print|sign|mug|shirt|apparel/.test(text))mode='custom-product';
 if(/quote|estimate|bid|proposal/.test(text))mode='request-quote';
 const customerFlow=p.customerExperience?.mode|| (mode==='request-quote'||mode==='service'?'request':'guided');
 const fulfillment=detectFulfillment(text);
 const schedulingNeeded=/schedule|appointment|booking|reservation|date|time slot|calendar/.test(text);
 const requiredInputs=[];
 if(p.customerExperience?.contactCapture!==false)requiredInputs.push('customer_contact');
 if(p.customerExperience?.photoRequired)requiredInputs.push('photo_or_reference');
 if(mode==='request-quote'||mode==='service')requiredInputs.push('request_details');
 if(schedulingNeeded)requiredInputs.push('preferred_timing');
 const visual=normalizeVisualPresentation(p);
 const offers=(p.products||[]).filter(x=>x.active!==false).map(x=>x.name).filter(Boolean);
 const summaryParts=[
  mode.replaceAll('-',' '),
  customerFlow==='catalog'?'catalog customer flow':customerFlow==='request'?'request / quote customer flow':'guided customer flow'
 ];
 if(fulfillment.length)summaryParts.push(fulfillment.join(', ')+' fulfillment');
 if(schedulingNeeded)summaryParts.push('scheduling needed');
 const relationshipType=deriveCustomerRelationship(p,{mode,customerFlow,fulfillment,schedulingNeeded,requiredInputs});
 return {version:1,derivedAt:new Date().toISOString(),mode,customerFlow,relationshipType,fulfillment,schedulingNeeded,requiredInputs,visualProfile:visual.profile||'none',offers,workflow:Array.isArray(p.workflow)&&p.workflow.length>=2?p.workflow.slice():defaultWorkflowForRelationship(relationshipType),summary:summaryParts.join(' • ')};
}
function resolveOperatingModel(p={}){
 const derived=deriveOperatingProfile(p);
 const saved=p.operatingModel&&typeof p.operatingModel==='object'?p.operatingModel:{};
 const o=saved.overrides&&typeof saved.overrides==='object'?saved.overrides:{};
 return {...derived,...saved,mode:o.mode||saved.mode||derived.mode,customerFlow:o.customerFlow||saved.customerFlow||derived.customerFlow,relationshipType:CUSTOMER_RELATIONSHIP_TYPES[o.relationshipType]?o.relationshipType:(CUSTOMER_RELATIONSHIP_TYPES[saved.relationshipType]?saved.relationshipType:derived.relationshipType),fulfillment:Array.isArray(o.fulfillment)?o.fulfillment:(Array.isArray(saved.fulfillment)?saved.fulfillment:derived.fulfillment),schedulingNeeded:typeof o.schedulingNeeded==='boolean'?o.schedulingNeeded:(typeof saved.schedulingNeeded==='boolean'?saved.schedulingNeeded:derived.schedulingNeeded),overrides:o,derived};
}
function updateBusinessUnderstanding(p,{briefText,overrides={}}={}){
 const now=new Date().toISOString();
 p.businessBrief={...normalizeBusinessBrief(p),text:String(briefText??normalizeBusinessBrief(p).text).trim().slice(0,BUSINESS_BRIEF_MAX),source:'project_control',updatedAt:now};
 const base=deriveOperatingProfile(p,p.businessBrief.text);
 const cleanOverrides={};
 if(BUSINESS_MODEL_MODES.includes(overrides.mode))cleanOverrides.mode=overrides.mode;
 if(['guided','catalog','request'].includes(overrides.customerFlow))cleanOverrides.customerFlow=overrides.customerFlow;
 if(CUSTOMER_RELATIONSHIP_TYPES[overrides.relationshipType])cleanOverrides.relationshipType=overrides.relationshipType;
 if(Array.isArray(overrides.fulfillment))cleanOverrides.fulfillment=[...new Set(overrides.fulfillment.map(x=>String(x).trim()).filter(Boolean))].slice(0,12);
 if(typeof overrides.schedulingNeeded==='boolean')cleanOverrides.schedulingNeeded=overrides.schedulingNeeded;
 p.operatingModel={...base,overrides:cleanOverrides,reviewedAt:now,reviewVersion:1};
 p.description=p.businessBrief.text.split(/\n+/)[0].trim().slice(0,180)||p.description||p.name||'Project';
 p.updatedAt=now;
 return resolveOperatingModel(p);
}

const VISUAL_CAPABILITY_CATALOG=Object.freeze({
 input:Object.freeze({
  photo_upload:{label:'Photo Upload',description:'Customer or staff supplies a product photo.',status:'available'},
  camera_capture:{label:'Camera Capture',description:'Capture a new image from the device camera.',status:'available'},
  multi_photo:{label:'Multiple Photos',description:'Use front, side, back, or detail images.',status:'foundation'},
  reference_image:{label:'Reference Image',description:'Keep an inspiration/reference image separate from the product photo.',status:'foundation'}
 }),
 placement:Object.freeze({
  flat_surface:{label:'Flat Surface',description:'Signs, plaques, prints, boards, and other planar products.',status:'available'},
  cylindrical_wrap:{label:'Cylindrical Wrap',description:'Mugs, tumblers, bottles, and other round products.',status:'available'},
  curved_surface:{label:'Curved Surface',description:'Bowls, helmets, curved panels, and irregular rounded products.',status:'foundation'},
  front_back:{label:'Front / Back Placement',description:'Garments, bags, cards, and two-sided products.',status:'foundation'},
  multi_zone:{label:'Multi-Zone Placement',description:'Several independent artwork zones on one product.',status:'foundation'},
  bounded_area:{label:'Bounded Print Area',description:'Artwork stays inside a defined printable region.',status:'foundation'},
  perspective_surface:{label:'Perspective Surface',description:'Place artwork on an angled photographed surface.',status:'foundation'},
  freeform_overlay:{label:'Freeform Overlay',description:'Move and size artwork freely over a customer photo.',status:'foundation'},
  template_overlay:{label:'Template Overlay',description:'Use business-defined placement guides or print zones.',status:'foundation'},
  card_overlay:{label:'Card / Message Overlay',description:'Place a message card or label over a product/arrangement image.',status:'available'},
  environment_placement:{label:'Room / Environment Placement',description:'Preview décor, signs, or products inside a room or scene.',status:'foundation'},
  vehicle_equipment:{label:'Vehicle / Equipment Placement',description:'Preview decals, labels, or graphics on vehicles/equipment.',status:'foundation'},
  arrangement:{label:'Arrangement Preview',description:'Compose or annotate flowers, gift baskets, bundles, or grouped products.',status:'foundation'},
  none:{label:'No Visual Placement',description:'Project does not need a visual placement step.',status:'available'}
 }),
 transform:Object.freeze({
  scale:{label:'Scale',status:'available'}, rotate:{label:'Rotate',status:'foundation'}, curve:{label:'Curve / Warp',status:'available'},
  crop:{label:'Crop',status:'foundation'}, repeat:{label:'Repeat / Pattern',status:'foundation'}, mirror:{label:'Mirror',status:'foundation'}, perspective:{label:'Perspective',status:'foundation'}
 }),
 preview:Object.freeze({
  product_mockup:{label:'Product Mockup',status:'available'}, multi_view:{label:'Multi-View',status:'foundation'},
  environment_mockup:{label:'Environment Mockup',status:'foundation'}, before_after:{label:'Before / After',status:'foundation'},
  arrangement_preview:{label:'Arrangement Preview',status:'foundation'}, none:{label:'No Visual Preview',status:'available'}
 }),
 approval:Object.freeze({
  customer_proof:{label:'Customer Proof',status:'available'}, owner_approval:{label:'Owner Approval',status:'foundation'},
  revision_loop:{label:'Revision Loop',status:'foundation'}, none:{label:'No Visual Approval',status:'available'}
 }),
 output:Object.freeze({
  production_reference:{label:'Production Reference',status:'available'}, print_ready_image:{label:'Print-Ready Image',status:'foundation'},
  machine_ready_export:{label:'Machine-Ready Export',status:'foundation'}, none:{label:'No Visual Output',status:'available'}
 })
});
const VISUAL_PROFILE_PRESETS=Object.freeze({
 none:Object.freeze({label:'No Visual Preview',input:[],placement:['none'],transform:[],preview:['none'],approval:['none'],output:['none']}),
 'flat-surface':Object.freeze({label:'Flat Surface',input:['photo_upload','camera_capture'],placement:['flat_surface'],transform:['scale'],preview:['product_mockup'],approval:['customer_proof'],output:['production_reference']}),
 'cylindrical-wrap':Object.freeze({label:'Cylindrical Wrap',input:['photo_upload','camera_capture'],placement:['cylindrical_wrap'],transform:['scale','curve'],preview:['product_mockup'],approval:['customer_proof'],output:['production_reference']}),
 'card-overlay':Object.freeze({label:'Card / Message Overlay',input:['photo_upload','camera_capture'],placement:['card_overlay'],transform:['scale'],preview:['product_mockup'],approval:['customer_proof'],output:['production_reference']}),
 'curved-surface':Object.freeze({label:'Curved Surface',input:['photo_upload','camera_capture'],placement:['curved_surface'],transform:['scale','curve'],preview:['product_mockup'],approval:['customer_proof'],output:['production_reference']}),
 'front-back':Object.freeze({label:'Front / Back',input:['multi_photo','photo_upload'],placement:['front_back'],transform:['scale'],preview:['multi_view'],approval:['customer_proof'],output:['production_reference']}),
 'multi-zone':Object.freeze({label:'Multi-Zone',input:['photo_upload'],placement:['multi_zone','bounded_area'],transform:['scale'],preview:['product_mockup'],approval:['customer_proof'],output:['production_reference']}),
 'bounded-area':Object.freeze({label:'Bounded Print Area',input:['photo_upload'],placement:['bounded_area'],transform:['scale'],preview:['product_mockup'],approval:['customer_proof'],output:['production_reference']}),
 perspective:Object.freeze({label:'Perspective Surface',input:['photo_upload','camera_capture'],placement:['perspective_surface'],transform:['scale','perspective'],preview:['product_mockup'],approval:['customer_proof'],output:['production_reference']}),
 freeform:Object.freeze({label:'Freeform Photo Overlay',input:['photo_upload','camera_capture'],placement:['freeform_overlay'],transform:['scale','rotate'],preview:['product_mockup'],approval:['customer_proof'],output:['production_reference']}),
 template:Object.freeze({label:'Template Overlay',input:['photo_upload','reference_image'],placement:['template_overlay','bounded_area'],transform:['scale'],preview:['product_mockup'],approval:['customer_proof'],output:['production_reference']}),
 environment:Object.freeze({label:'Room / Environment',input:['photo_upload','reference_image'],placement:['environment_placement'],transform:['scale','perspective'],preview:['environment_mockup'],approval:['customer_proof'],output:['production_reference']}),
 vehicle:Object.freeze({label:'Vehicle / Equipment',input:['photo_upload','multi_photo'],placement:['vehicle_equipment','multi_zone'],transform:['scale','perspective'],preview:['multi_view'],approval:['customer_proof'],output:['production_reference']}),
 arrangement:Object.freeze({label:'Arrangement',input:['photo_upload','reference_image'],placement:['arrangement'],transform:['scale'],preview:['arrangement_preview'],approval:['customer_proof'],output:['production_reference']}),
 'before-after':Object.freeze({label:'Before / After',input:['multi_photo'],placement:['none'],transform:[],preview:['before_after'],approval:['customer_proof'],output:['production_reference']})
});
function legacyVisualProfile(p={}){
 const type=String(p.type||p.businessType||p.projectTheme||'').toLowerCase();
 if(type.includes('wood')||p.id==='ikes-wood-signs')return'flat-surface';
 if(type.includes('mug')||p.id==='mugshot-after-dark')return'cylindrical-wrap';
 if(type.includes('flower')||p.id==='beccas-bloom-shop')return'card-overlay';
 return p?.customerExperience?.photoRequired?'freeform':'none';
}
function normalizeVisualPresentation(p={}){
 const existing=p.visualPresentation&&typeof p.visualPresentation==='object'?p.visualPresentation:{};
 const profile=VISUAL_PROFILE_PRESETS[existing.profile]?existing.profile:legacyVisualProfile(p);
 const preset=VISUAL_PROFILE_PRESETS[profile]||VISUAL_PROFILE_PRESETS.none;
 const families=['input','placement','transform','preview','approval','output'];
 const out={version:1,enabled:profile!=='none',profile,renderer:existing.renderer||(['flat-surface','cylindrical-wrap','card-overlay'].includes(profile)?profile:'generic-foundation'),customCapabilities:Array.isArray(existing.customCapabilities)?existing.customCapabilities:[]};
 families.forEach(f=>{const vals=Array.isArray(existing[f])?existing[f]:preset[f]||[];out[f]=[...new Set(vals.filter(v=>VISUAL_CAPABILITY_CATALOG[f]?.[v]))];});
 out.updatedAt=existing.updatedAt||new Date().toISOString();
 return out;
}

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
 p.visualPresentation=normalizeVisualPresentation(p);
 p.businessBrief=normalizeBusinessBrief(p);
 p.operatingModel=resolveOperatingModel(p);
 deployments(p).forEach(d=>sealDeployment(p,d));
 return p;
}
function migrate(rows){
 let changed=false;
 const projects=(Array.isArray(rows)?rows:[]).map(p=>{const before=JSON.stringify([p?.schemaVersion,p?.namespace,p?.isolation,p?.permissions,p?.lifecycle,p?.identity,deployments(p).map(d=>[d?.projectId,d?.namespace,d?.authorization?.projectId])]);ensure(p);if(before!==JSON.stringify([p?.schemaVersion,p?.namespace,p?.isolation,p?.permissions,p?.lifecycle,p?.identity,deployments(p).map(d=>[d?.projectId,d?.namespace,d?.authorization?.projectId])]))changed=true;return p});
 return{projects,changed,from:'3.4',to:'3.5'};
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
 if(doc && typeof doc.querySelectorAll==='function'){
  doc.querySelectorAll('[id]').forEach(el=>dom.set(el.id,(dom.get(el.id)||0)+1));
  [...dom].filter(([,n])=>n>1).forEach(([id,n])=>issues.push({level:'critical',code:'DUPLICATE_DOM_ID',detail:`${id} x ${n}`}));
 }
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
g.BlackFlagV3Core={version:'4.1.1-orphan-watch-core',schemaVersion:SCHEMA,policyVersion:POLICY,states:STATES,fleetFoundation:FLEET_FOUNDATION,visualCapabilityCatalog:VISUAL_CAPABILITY_CATALOG,visualProfilePresets:VISUAL_PROFILE_PRESETS,businessModelModes:BUSINESS_MODEL_MODES,customerRelationshipTypes:CUSTOMER_RELATIONSHIP_TYPES,customerWorkflowProfiles:CUSTOMER_WORKFLOW_PROFILES,customerActivityTerms:CUSTOMER_ACTIVITY_TERMS,normalizeBusinessBrief,deriveOperatingProfile,resolveOperatingModel,deriveCustomerRelationship,resolveCustomerRelationship,activityTermsForProject,defaultWorkflowForRelationship,resolveProjectWorkflow,updateBusinessUnderstanding,normalizeVisualPresentation,clean,normalizeProjectName:normalizeName,createProjectId,registry,findProjectsByName:sameName,namespaceFor:ns,lifecycle,ensure,migrate,assertProjectScope:scope,authorizeProjectMutation:authorizeMutation,sealDeployment,validateDeployment,canTransitionDeployment,audit,readAudit:()=>read(AUDIT,[]),telemetry,readTelemetry,snapshot,readSnapshots:()=>read(SNAP,[]),integrity,migrationState:()=>read(MIG,null),markMigration:x=>write(MIG,{...x,at:new Date().toISOString()})};
})(window);

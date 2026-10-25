#!/usr/bin/env node
'use strict';
// Actual app functions, synthetic vessel records, isolated VM: no network or user data.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const ROOT=path.resolve(process.argv[2]||__dirname),OUT=path.resolve(process.argv[3]||path.join(ROOT,'../fleetclarity-workflows-evidence'));
const source=fs.readFileSync(path.join(ROOT,'app.js'),'utf8');
function actual(name){
  const match=new RegExp('^  (?:async )?function '+name+'\\(','m').exec(source);
  assert(match,`Missing production function ${name}`);
  const start=match.index+2,lineEnd=source.indexOf('\n',start),line=source.slice(start,lineEnd);
  try{new vm.Script('('+line+')');return line;}catch(_){}
  const end=source.indexOf('\n  }',start);
  assert(end>start,`Missing end of ${name}`);
  const text=source.slice(start,end+4);new vm.Script('('+text+')');return text;
}
const names=['readCustomerDirectory','writeCustomerDirectory','normalizeCustomerKey','briefPurchaseDescription','captureCustomerFromOrder','rebuildCustomerDirectoryForProject','projectScopedOrders','projectCustomerRows','engineWideCustomerMatches','projectTabsHtml','renderProjectTab','commissioningGateRows','commissioningSnapshot','commissioningNextMove','fleetDockMatches','fleetMissionControlState','renderFleetMissionControl'];
// Older baselines do not have navigation tokens; load the actual helpers when present.
const navigationNames=['surfaceVisible','engineWorkspaceNavigationToken','engineWorkspaceNavigationCurrent'].filter(name=>new RegExp('^  function '+name+'\\(','m').test(source));
function fixture({db={version:4},tools=true,identity=true,owner='active',captain=false}={}){
  const a={id:'vessel-a',name:'Synthetic Alpha',projectCode:identity?'ALPHA':'',branding:{businessName:identity?'Alpha':''},ownerAccess:{enabled:true,status:owner},publish:{status:'live'},customerHistory:{adminVisible:false}};
  const b={id:'vessel-b',name:'Synthetic Beta',projectCode:'BETA',branding:{businessName:'Beta'},ownerAccess:{enabled:true,status:'active'},publish:{status:'live'}};
  const directory={
    'vessel-a':{
      'email:shared@example.invalid':{projectId:'vessel-a',customerKey:'email:shared@example.invalid',name:'Alpha Customer',email:'shared@example.invalid',orderCount:2,purchases:[{description:'Alpha purchase',date:'2026-01-01'}]},
      wrong:{projectId:'vessel-b',name:'Foreign embedded customer',orderCount:999,purchases:[]},
      conflict:{projectId:'vessel-a',isolation:{projectId:'vessel-b'},name:'Conflicting scope customer',orderCount:999,purchases:[]}
    },
    'vessel-b':{'email:shared@example.invalid':{projectId:'vessel-b',customerKey:'email:shared@example.invalid',name:'Beta Customer',orderCount:73,purchases:[{description:'Beta purchase',date:'2026-01-02'}]}}
  };
  const nodes=new Map();
  const classList=(initial=[])=>{const values=new Set(initial);return {add:value=>values.add(value),remove:value=>values.delete(value),contains:value=>values.has(value),toggle(){}};};
  const node=id=>{if(!nodes.has(id))nodes.set(id,{html:'',paints:0,get innerHTML(){return this.html;},set innerHTML(value){this.html=value;this.paints++;},textContent:'',value:'',checked:false,dataset:{},classList:classList(),addEventListener(){},querySelector(){return null;},querySelectorAll(){return [];}});return nodes.get(id);};
  const ctx=vm.createContext({console,Date,Number,String,Object,Math,JSON,Map,Set,Boolean,db,DB_VERSION:4,PROJECT_CUSTOMERS_KEY:'synthetic-customers',PROJECT_COMMAND_GROUPS:{},BUILD_VERSION:'synthetic',
    window:{DarkSkyV4:tools?{}:null},localStorage:{getItem(){return JSON.stringify(directory);},setItem(key,value){for(const id of Object.keys(directory))delete directory[id];Object.assign(directory,JSON.parse(value));}},
    escapeHtml:v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
    projectModuleHero:(p,k,title,copy,meta='')=>`<h3>${title}</h3><p>${copy}</p>${meta}`,
    projectById:id=>[a,b].find(p=>p.id===id),projects:()=>[a],ensureProjectGovernance:p=>p,
    migrateLegacyDeployment:()=>[{state:'deployed'}],experienceDeploymentFor:()=>({id:'synthetic-deployment'}),platformStatus:()=> 'approved',experienceApproved:()=>true,experienceSeaTrialCurrent:()=>true,
    commissioningApproval:()=>captain?{approved:true,approvedAt:'2026-01-01T00:00:00Z'}:null,
    normalizeBusinessIdentityText:s=>String(s||'').toLowerCase(),fleetDockSearch:'',fleetDockFilter:'all',
    $:node,$$:()=>[],document:{getElementById:node,body:{classList:classList(['engine-mode'])}},getComputedStyle:()=>({display:'block'}),CSS:{escape:s=>s},engineActiveProjectId:a.id,engineSessionUnlocked:true,projectTabRenderEpoch:0,engineWorkspaceNavigationGeneration:0,commandRouteGeneration:0,activeCommandRoute:'fleet',location:{href:'https://synthetic.invalid/#fleet'},
    syncProjectCommandNavigation(){},bindProjectControlJumpLinks(){},
    renderProjectAnalytics:async()=>{node('projectTabContent').innerHTML='<h3>Analytics route</h3>';},
    getMergedOrders:async()=>{throw Error('Viewing customer history must not read/rebuild orders');}
  });
  vm.runInContext([...navigationNames,...names].map(actual).join('\n'),ctx);
  vm.runInContext("const customerTabsHtml=projectTabsHtml;projectTabsHtml=(p,tab)=>tab==='experience'?'<h3>Experience</h3>':customerTabsHtml(p,tab);",ctx);
  return {ctx,a,b,directory,node,replaceNode:id=>{nodes.delete(id);return node(id);},run:code=>vm.runInContext(code,ctx)};
}
// Status regressions use the real gate, launch, overview/export and Captain functions.
// Synthetic dependencies supply storage, admission and pure visual configuration only.
const captainSource=fs.readFileSync(path.join(ROOT,'captain.js'),'utf8');
function captainActual(name){
  const start=captainSource.indexOf('  function '+name+'('),end=captainSource.indexOf('\n  }',start);
  assert(start>=0&&end>start,`Missing Captain function ${name}`);return captainSource.slice(start,end+4);
}
const statusNames=['ensureProjectGovernance','platformStatus','ownerAccessLabel','migrateLegacyDeployment','quarantineForeignDeployments878','normalizeDeploymentIdentity','projectShellFor','projectShowroomPreviewReady','ensureExperienceTestState','experienceConfigurationSignature','experienceApproved','experienceSeaTrialCurrent','experienceDeploymentFor','commissioningGateRows','commissioningSnapshot','projectFleetLaunchState','deploymentReadiness','deploymentVoyageState','deploymentSnapshot','projectControlAgeHours','projectControlTrend','projectControlSnapshot','projectControlMoney','projectControlTime','projectControlKpi','renderProjectControlOverview','openFleetDockCustomerExperience'];
const addedStatusNames=['projectStatusPresentation','fleetCompassVesselMarkup'].filter(name=>new RegExp('^  function '+name+'\\(','m').test(source));
function statusFixture({shell='ikes',state=null,publication='live',owner='not_claimed',enabled=true,evidence=false,captain=false}={}){
  const p={id:'synthetic-alpha',name:'Alpha Vessel',shellType:shell,projectCode:'ALPHA',branding:{businessName:'Alpha'},description:'Synthetic business brief',publish:{status:publication},ownerAccess:{enabled,status:owner},products:[{id:'offer',name:'Synthetic offer',active:true,published:true}],workflow:['New','Completed'],deployments:state?[{id:'outpost-a',name:'Alpha outpost',state,manifestVersion:2,idleMinutes:3,purgeSession:true}]:[]};
  const nodes=new Map(),calls=[],orders=[{projectId:p.id,id:'synthetic-order',createdAt:'2026-01-01',status:'New',price:10}],customers=[{projectId:p.id,name:'Retained Alpha',orderCount:2}];
  function node(id){if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',isConnected:true,classList:{remove(){},add(){}},setAttribute(){},addEventListener(){},querySelector(){return null;},querySelectorAll(){return [];},focus(){}});return nodes.get(id);}
  const context={console,Date,Number,String,Object,Math,JSON,Map,Set,Boolean,structuredClone,DB_VERSION:5,db:{version:5},BUILD_VERSION:'synthetic',PROJECT_SHELLS:{},OWNER_CAPABILITIES:[],companies:[p],engineActiveProjectId:p.id,
    window:{DarkSkyV4:{}},document:{activeElement:null,getElementById:node},HTMLElement:class{},requestAnimationFrame:fn=>fn(),captainSignalReturnFocus:null,
    compileBusinessIntakeProject:p=>p,canonicalProjectId:id=>id,foreignDeploymentClaim878:()=>null,deviceAuthorizationState:()=> 'synthetic-only',
    operatingModelForProject:()=>({mode:'synthetic'}),visualPresentationFor:()=>({}),commissioningApproval:()=>captain?{approved:true,approvedAt:'2026-01-01T00:00:00Z'}:null,
    getMergedOrders:async()=>orders,approvedProjectOrders:(all,p)=>all.filter(o=>o.projectId===p.id),canonicalOrderStatus:v=>v,projectCustomerRows:()=>customers,readActivity:()=>[],projectLedger:()=>[],
    activityTermsForProject:()=>({lowerSingular:'order',lowerPlural:'orders',plural:'Orders'}),customerRelationshipForProject:()=>({label:'Purchase'}),compactOrderDate:()=> 'synthetic date',ownerAccessLabel:p=>p.ownerAccess.status,
    isHouseHullProject:()=>false,bindProjectControlJumpLinks(){},projectById:id=>id===p.id?p:null,$:node,byId:node,
    escapeHtml:v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
    projectCustomerOperatingModelReady:()=>true,showFleetActionStatus(){},enterLiveCustomerProject:async(p,source)=>calls.push(['live',p.id,source]),setCustomerSessionContext:(p,mode)=>calls.push(['context',p.id,mode]),clearUniversalReceipt:p=>calls.push(['clearReceipt',p.id]),enterProject:async id=>calls.push(['enter',id]),experienceTestReturnState:null,
    fleetStableCallsign:p=>p.projectCode,captainSafe:v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
  };
  const ctx=vm.createContext(context);vm.runInContext([...statusNames,...addedStatusNames].map(actual).join('\n'),ctx);
  if(evidence){const signature=ctx.experienceConfigurationSignature(p);p.experienceTest={approvedAt:'2026-01-01',approvedSignature:signature,seaTrialSignature:signature,lastSeaTrialDeploymentId:'outpost-a'};if(p.deployments[0])p.deployments[0].lastTestedAt='2026-01-01';}
  vm.runInContext(captainActual('stateLabel')+'\n'+captainActual('openSignalReport'),ctx);
  return {ctx,p,node,calls,orders,customers,presentation:()=>{assert.equal(typeof ctx.projectStatusPresentation,'function','Shared status adapter is missing');return ctx.projectStatusPresentation(p,ctx.commissioningSnapshot(structuredClone(p)));},captainReport(vessel){ctx.fleetSnapshot=()=>[vessel];ctx.openSignalReport(p.id);return node('captainFleetSignalReport').innerHTML;}};
}
function freezeTree(value){if(value&&typeof value==='object'){Object.values(value).forEach(freezeTree);Object.freeze(value);}return value;}
async function statusRegressions(){
  await test('actual legacy Overview shows saved publication and individual open evidence instead of ordinal completion',async()=>{const f=statusFixture({captain:true});await f.ctx.renderProjectControlOverview(f.p);const html=f.node('projectOverviewLive').innerHTML;assert.equal(html.includes('<small>PUBLICATION</small><strong>PUBLISHED</strong>'),true,'Saved live publication must read PUBLISHED');assert.equal(html.includes('data-commissioning-gate="live" class="open"'),true,'Missing live gate must remain OPEN despite legacy launch step 5');assert.equal(html.includes('pc-fleet-launch-progress'),false,'Ordinal launch progress must not present commissioning evidence');});
  await test('Overview owner profile labels disabled saved access consistently',async()=>{const f=statusFixture({owner:'active',enabled:false});await f.ctx.renderProjectControlOverview(f.p);assert.match(f.node('projectOverviewLive').innerHTML,/<dt>Owner setup<\/dt><dd>DISABLED<\/dd>/);});
  await test('Overview rendering preserves exact-vessel order and retained customer records',async()=>{const f=statusFixture(),before=JSON.stringify([f.orders,f.customers]);await f.ctx.renderProjectControlOverview(f.p);assert.equal(JSON.stringify([f.orders,f.customers]),before);assert.match(f.node('projectOverviewLive').innerHTML,/synthetic-order/);assert.match(f.node('projectOverviewLive').innerHTML,/CUSTOMERS/);});

  for(const shell of ['ikes','universal'])for(const state of [null,'retired','paused','sea_trial','deployed']){
    await test(`${shell} saved live / ${state||'zero deployments'} keeps published separate from incomplete gates`,async()=>{
      const f=statusFixture({shell,state,captain:true}),snap=f.ctx.commissioningSnapshot(structuredClone(f.p)),display=f.presentation();
      assert.equal(display.publication.key,'published');assert.equal(display.publication.label,'PUBLISHED');assert.match(display.publication.detail,/saved/i);
      assert.equal(display.commissioning.key,'incomplete');assert.equal(display.commissioning.rows.find(r=>r.id==='experience').pass,false);assert.equal(display.commissioning.rows.find(r=>r.id==='sea').pass,false);assert.equal(display.commissioning.rows.find(r=>r.id==='live').pass,state==='deployed');
      assert.deepEqual(JSON.parse(JSON.stringify(display.commissioning.rows)),JSON.parse(JSON.stringify(snap.rows)));
      await f.ctx.renderProjectControlOverview(f.p);const html=f.node('projectOverviewLive').innerHTML;
      assert.match(html,/<small>PUBLICATION<\/small><strong>PUBLISHED<\/strong>/);assert.match(html,/pc-commissioning-evidence/);assert.doesNotMatch(html,/pc-fleet-launch-progress|FLEET COMMISSIONING LANE/);
      for(const row of snap.rows)assert.match(html,new RegExp('data-commissioning-gate="'+row.id+'" class="'+(row.pass?'pass':'open')+'"'));
      assert.match(html,/data-open-fleet-commissioning="synthetic-alpha"[^>]*>REVIEW COMMISSIONING DOCK/);
      assert.match(html,new RegExp('data-project-launch-action="synthetic-alpha"[^>]*>'+f.ctx.projectFleetLaunchState(f.p).actionLabel));
    });
    await test(`${shell} saved live / ${state||'zero deployments'} emits one missing-deployment category`,async()=>{
      const f=statusFixture({shell,state}),s=await f.ctx.projectControlSnapshot(f.p),missing=s.attention.filter(x=>/No deployment commissioned|no active deployment/.test(x.title));
      assert.equal(missing.length,state==='deployed'?0:1);if(!state||state==='retired')assert.equal(missing[0].title,'No deployment commissioned');
      if(state==='paused')assert(s.attention.some(x=>x.title==='Deployment paused'));if(state==='sea_trial')assert(s.attention.some(x=>x.title==='Deployment in Sea Trial'));
      assert(s.attention.some(x=>/^New order waiting/.test(x.title)));assert.equal(s.orders.length,1);assert.equal(s.customers.length,1);
    });
  }
  await test('saved test without deployments emits exactly one missing-deployment issue',async()=>{const f=statusFixture({publication:'test'}),s=await f.ctx.projectControlSnapshot(f.p);assert.equal(s.attention.filter(x=>x.tab==='deployment').length,1);});
  for(const [saved,key,label] of [['test','test','TEST'],['development','development','DEVELOPMENT'],['surprise','unknown','UNVERIFIED'],[null,'unknown','UNVERIFIED']])await test('publication retains conservative saved state '+saved,()=>{const f=statusFixture({publication:saved}),s=f.presentation();assert.equal(s.publication.key,key);assert.equal(s.publication.label,label);});
  for(const [owner,enabled,key,route] of [['active',false,'disabled','Owner Access Setup'],['not_claimed',true,'not_claimed','Owner Sign-In'],['invited',true,'invited','Owner Sign-In'],['active',true,'active','Owner Workspace'],['other',true,'unknown','Owner Sign-In']]){
    await test(`owner ${owner}, enabled=${enabled} uses saved setup and existing doorway`,()=>{const f=statusFixture({owner,enabled}),d=f.presentation();assert.equal(d.owner.key,key);assert.equal(d.owner.routeLabel,route);assert.equal(typeof f.ctx.fleetCompassVesselMarkup,'function','Compass status renderer missing');const html=f.ctx.fleetCompassVesselMarkup(f.p,f.ctx.commissioningSnapshot(structuredClone(f.p)));assert.match(html,new RegExp(route));assert.match(html,/Saved publication: PUBLISHED/);assert.match(html,new RegExp(d.owner.routeDetail.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));assert.match(html,/data-fleet-dock-action="owner"/);});
    if(enabled&&owner!=='active')await test('owner attention describes saved '+owner+' setup',async()=>{const f=statusFixture({owner,enabled}),s=await f.ctx.projectControlSnapshot(f.p),attention=s.attention.find(x=>x.tab==='owner');assert(attention);assert.match(attention.title+' '+attention.detail,owner==='not_claimed'?/not claimed/i:owner==='invited'?/invited/i:/unverified/i);});
  }
  await test('all current local gates produce recorded while Captain alone cannot',()=>{const f=statusFixture({state:'deployed',evidence:true,captain:true}),d=f.presentation();assert.equal(d.commissioning.key,'recorded');assert.equal(d.commissioning.passed,7);assert.equal(d.commissioning.total,7);assert.equal(d.commissioning.nextGate,null);assert.match(d.commissioning.detail,/server authority.*separate/i);});
  await test('all technical gates without local Captain record are ready',()=>{const f=statusFixture({state:'deployed',evidence:true}),d=f.presentation();assert.equal(d.commissioning.key,'ready');assert.equal(d.commissioning.nextGate.id,'captain');assert.equal(d.commissioning.passed,6);});
  await test('stale approval and Sea Trial remain open even with Captain record and live operation',()=>{const f=statusFixture({state:'deployed',evidence:true,captain:true});f.p.description='Edited configuration';const d=f.presentation();assert.equal(f.ctx.projectFleetLaunchState(f.p).step,5);assert.equal(d.commissioning.key,'incomplete');assert.equal(d.commissioning.nextGate.id,'experience');assert.equal(d.commissioning.rows.find(r=>r.id==='sea').pass,false);});
  await test('pure adapter honors supplied rows over optimistic snapshot totals and leaves frozen records unchanged',()=>{const f=statusFixture({state:'deployed',evidence:true,captain:true}),snap=f.ctx.commissioningSnapshot(structuredClone(f.p));snap.rows.find(r=>r.id==='boundary').pass=false;snap.ready=true;snap.commissioned=true;const before=JSON.stringify([f.p,snap,f.orders,f.customers]);freezeTree(f.p);freezeTree(snap);const d=f.ctx.projectStatusPresentation(f.p,snap);assert.equal(d.commissioning.key,'incomplete');assert.equal(d.commissioning.nextGate.id,'boundary');assert.equal(d.commissioning.passed,6);assert.equal(JSON.stringify([f.p,snap,f.orders,f.customers]),before);});
  await test('each absent gate stays incomplete despite optimistic supplied summary',()=>{const f=statusFixture({state:'deployed',evidence:true,captain:true}),snap=f.ctx.commissioningSnapshot(structuredClone(f.p));for(const row of snap.rows){const reduced={...snap,rows:snap.rows.filter(x=>x.id!==row.id)};const d=f.ctx.projectStatusPresentation(f.p,reduced);assert.equal(d.commissioning.rows.find(x=>x.id===row.id).pass,false);assert.equal(d.commissioning.key,'incomplete');assert.equal(d.commissioning.nextGate.id,row.id);assert.match(d.commissioning.rows.find(x=>x.id===row.id).detail,/unverified/i);}assert.equal(f.ctx.projectStatusPresentation(f.p,null).commissioning.passed,0);});
  for(const shell of ['ikes','universal'])for(const state of [null,'retired','paused','sea_trial','deployed'])await test(`${shell} ${state||'zero'} keeps launch values and customer Live/Preview routes`,async()=>{const f=statusFixture({shell,state}),before=JSON.stringify(f.ctx.projectFleetLaunchState(f.p)),expectedLive=shell==='ikes'||state==='deployed';const exported=f.ctx.deploymentSnapshot()[0];assert.equal(JSON.stringify(f.ctx.projectFleetLaunchState(f.p)),before);const old=JSON.parse(before);assert.deepEqual([exported.launchKey,exported.launchLabel,exported.launchStep,exported.launchDetail],[old.key,old.label,old.step,old.detail]);await f.ctx.openFleetDockCustomerExperience(f.p);assert.equal(f.calls.some(c=>c[0]==='live'),expectedLive);assert.equal(f.calls.some(c=>c[0]==='context'&&c[2]==='preview'),!expectedLive);});
  await test('deployment export adds display fields without canonical normalization from extra commissioning snapshot',()=>{const f=statusFixture({state:'deployed'});f.ctx.projectFleetLaunchState(f.p);f.ctx.experienceApproved(f.p);const before=JSON.stringify([f.p,f.orders,f.customers]),result=f.ctx.deploymentSnapshot()[0];assert(result.statusPresentation,'Additive statusPresentation export missing');assert.equal(result.statusPresentation.publication.key,'published');assert.equal(result.statusPresentation.commissioning.key,'incomplete');assert.equal(JSON.stringify([f.p,f.orders,f.customers]),before);assert.equal(result.ownerState,'not_claimed');});
  await test('Captain renders individual local evidence and conservative publication, not ordinal progress',()=>{const f=statusFixture({captain:true}),html=f.captainReport(f.ctx.deploymentSnapshot()[0]);assert.match(html,/PUBLISHED/);assert.match(html,/LOCAL COMMISSIONING/);assert.match(html,/data-commissioning-gate="live" class="open"/);assert.doesNotMatch(html,/STEP 5 OF 5|safely in harbor/);assert.match(html,/No current outpost records.*publication.*availability/i);});
  await test('Captain without additive presentation reports unverified evidence and availability',()=>{const f=statusFixture(),html=f.captainReport({projectId:f.p.id,name:f.p.name,launchKey:'live',launchLabel:'LIVE',launchStep:5,outposts:[],activeOutposts:0,attentionOutposts:0,totalOutposts:0,ownerState:'claimed'});assert.match(html,/UNVERIFIED/);assert.doesNotMatch(html,/STEP 5 OF 5|safely in harbor/);});
  await test('Captain with empty additive evidence cannot display a complete local record',()=>{const f=statusFixture(),v=f.ctx.deploymentSnapshot()[0];v.statusPresentation.commissioning={label:'LOCAL RECORD COMPLETE',detail:'Optimistic missing evidence',rows:[],passed:7,total:7};const html=f.captainReport(v);assert.match(html,/EVIDENCE UNVERIFIED/);assert.doesNotMatch(html,/LOCAL RECORD COMPLETE/);});
  await test('active outpost readiness attention remains independent of commissioning gate rows',async()=>{const f=statusFixture({state:'deployed',evidence:true,captain:true});f.p.deployments[0].purgeSession=false;assert.equal(f.presentation().commissioning.key,'recorded');const s=await f.ctx.projectControlSnapshot(f.p);assert(s.attention.some(x=>x.title==='Deployment readiness needs attention'));});
}

const results=[];
async function test(name,fn){try{await fn();results.push({name,pass:true});console.log('PASS '+name);}catch(error){results.push({name,pass:false,error:error.message});console.error('FAIL '+name+' — '+error.message);}}
(async()=>{
  await test('plural Customers opens retained history without implicit order rebuild',async()=>{
    const f=fixture();await f.run("renderProjectTab('vessel-a','customers')");
    assert.match(f.node('projectTabContent').innerHTML,/Customer History/);
    assert.match(f.node('projectTabContent').innerHTML,/Alpha Customer/);
  });
  await test('legacy singular customer route remains Experience',async()=>{
    const f=fixture();f.run("projectTabsHtml=(p,tab)=>'<h3>'+tab+'</h3>'");
    await f.run("renderProjectTab('vessel-a','customer')");assert.equal(f.node('projectTabContent').innerHTML,'<h3>experience</h3>');
  });
  await test('Customers excludes foreign and conflicting-scope embedded rows',()=>{
    const f=fixture(),html=f.ctx.projectTabsHtml(f.a,'customers');assert.match(html,/1 CUSTOMERS/);assert.doesNotMatch(html,/Foreign embedded|Conflicting scope|Beta Customer/);
  });
  await test('Customers repeat count uses only exact-vessel records',()=>{
    const f=fixture(),html=f.ctx.projectTabsHtml(f.a,'customers');assert.match(html,/<strong>2<\/strong>/);assert.doesNotMatch(html,/engine-wide|<strong>75<\/strong>|<strong>73<\/strong>/);assert.match(html,/REPEAT CUSTOMER/);
  });
  await test('vessel switching replaces customer names, purchases and totals',async()=>{
    const f=fixture();await f.run("renderProjectTab('vessel-a','customers')");f.ctx.engineActiveProjectId=f.b.id;
    await f.run("renderProjectTab('vessel-b','customers')");const html=f.node('projectTabContent').innerHTML;
    assert.match(html,/Beta Customer/);assert.match(html,/Beta purchase/);assert.match(html,/<strong>73<\/strong>/);assert.doesNotMatch(html,/Alpha Customer|Alpha purchase|<strong>75<\/strong>/);
  });
  await test('empty retained directory renders empty history without writes',async()=>{
    const f=fixture();f.directory['vessel-a']={};await f.run("renderProjectTab('vessel-a','customers')");assert.match(f.node('projectTabContent').innerHTML,/No retained customers yet/);
  });
  await test('latest purchase rejects explicit foreign scope without hiding retained local history',()=>{
    const f=fixture(),customer=f.directory['vessel-a']['email:shared@example.invalid'];
    customer.purchases.unshift({projectId:'vessel-b',description:'Foreign scoped purchase'},{isolation:{projectId:'vessel-b'},description:'Foreign isolated purchase'});
    const html=f.ctx.projectTabsHtml(f.a,'customers');assert.match(html,/Alpha purchase/);assert.doesNotMatch(html,/Foreign scoped purchase|Foreign isolated purchase/);
  });
  await test('another vessel cannot make a single local purchase look like repeat business',()=>{
    const f=fixture();f.directory['vessel-a']['email:shared@example.invalid'].orderCount=1;
    const html=f.ctx.projectTabsHtml(f.a,'customers');assert.match(html,/<strong>1<\/strong>/);assert.doesNotMatch(html,/REPEAT CUSTOMER|<strong>74<\/strong>/);
  });
  await test('explicit rebuild keeps mutation authorization and exact-vessel target',async()=>{
    const f=fixture(),before=JSON.stringify(f.directory),betaBefore=JSON.stringify(f.directory['vessel-b']);
    f.ctx.getMergedOrders=async()=>[{projectId:'vessel-a',id:'synthetic-a',customerName:'Rebuilt Alpha',customerEmail:'alpha@example.invalid',price:11,createdAt:'2026-01-01'},{projectId:'vessel-b',id:'synthetic-b',customerName:'Foreign order',customerEmail:'foreign@example.invalid',price:77,createdAt:'2026-01-02'}];
    f.ctx.requireEngineProjectMutation=()=>false;f.ctx.logActivity=()=>{};
    await f.run("renderProjectTab('vessel-a','customers')");assert.equal(JSON.stringify(f.directory),before);
    assert.equal(typeof f.node('rebuildCustomerHistoryBtn').onclick,'function','Customers must bind explicit rebuild action');
    await f.node('rebuildCustomerHistoryBtn').onclick();assert.equal(JSON.stringify(f.directory),before);
    f.ctx.requireEngineProjectMutation=()=>true;await f.node('rebuildCustomerHistoryBtn').onclick();
    const rows=Object.values(f.directory['vessel-a']);assert.equal(rows.length,1);assert.equal(rows[0].name,'Rebuilt Alpha');assert.equal(rows[0].projectId,'vessel-a');assert.equal(rows[0].orderCount,1);assert.equal(rows[0].purchases[0].orderId,'synthetic-a');assert.equal(JSON.stringify(f.directory['vessel-b']),betaBefore);
  });
  await test('stale rebuild callback cannot repaint after vessel switch',async()=>{
    const f=fixture(),before=JSON.stringify(f.directory);f.ctx.getMergedOrders=async()=>[];f.ctx.requireEngineProjectMutation=()=>true;f.ctx.logActivity=()=>{};
    await f.run("renderProjectTab('vessel-a','customers')");let resolve;f.ctx.getMergedOrders=()=>new Promise(r=>resolve=r);
    assert.equal(typeof f.node('rebuildCustomerHistoryBtn').onclick,'function','Customers must bind explicit rebuild action');
    const pending=f.node('rebuildCustomerHistoryBtn').onclick();f.ctx.engineActiveProjectId=f.b.id;f.ctx.getMergedOrders=async()=>[];
    await f.run("renderProjectTab('vessel-b','customers')");resolve([]);await pending;
    assert.match(f.node('projectTabContent').innerHTML,/Beta Customer/);assert.doesNotMatch(f.node('projectTabContent').innerHTML,/Alpha Customer/);assert.equal(JSON.stringify(f.directory),before);
  });
  await test('revoked mutation access while rebuild reads are pending cannot rewrite retained history',async()=>{
    const f=fixture(),before=JSON.stringify(f.directory);f.ctx.requireEngineProjectMutation=()=>true;f.ctx.logActivity=()=>{};
    await f.run("renderProjectTab('vessel-a','customers')");let resolve;f.ctx.getMergedOrders=()=>new Promise(r=>resolve=r);
    assert.equal(typeof f.node('rebuildCustomerHistoryBtn').onclick,'function','Customers must bind explicit rebuild action');
    const pending=f.node('rebuildCustomerHistoryBtn').onclick();f.ctx.requireEngineProjectMutation=()=>false;resolve([]);await pending;assert.equal(JSON.stringify(f.directory),before);
  });
  for(const destination of ['analytics','away-and-back','new-customers-render','replaced-workspace','hidden-workspace','invalidated-session']){
    await test('pending rebuild cannot mutate or repaint abandoned Customers view: '+destination,async()=>{
      const f=fixture(),before=JSON.stringify(f.directory);f.ctx.requireEngineProjectMutation=()=>true;f.ctx.logActivity=()=>{};
      await f.run("renderProjectTab('vessel-a','customers')");let resolve;f.ctx.getMergedOrders=()=>new Promise(r=>resolve=r);
      const pending=f.node('rebuildCustomerHistoryBtn').onclick();
      if(destination==='analytics'||destination==='away-and-back')await f.run("renderProjectTab('vessel-a','analytics')");
      if(destination==='away-and-back'||destination==='new-customers-render')await f.run("renderProjectTab('vessel-a','customers')");
      if(destination==='replaced-workspace')f.replaceNode('projectTabContent').innerHTML='<h3>Replacement workspace</h3>';
      if(destination==='hidden-workspace')f.node('projectEngineControl').classList.add('hidden');
      if(destination==='invalidated-session')f.ctx.engineWorkspaceNavigationGeneration++;
      const html=f.node('projectTabContent').innerHTML,paints=f.node('projectTabContent').paints;
      resolve([]);await pending;
      assert.equal(JSON.stringify(f.directory),before,'An abandoned rebuild must not rewrite retained history');
      assert.equal(f.node('projectTabContent').innerHTML,html,'An abandoned rebuild must preserve the current view');
      assert.equal(f.node('projectTabContent').paints,paints,'An abandoned rebuild must not repaint a newer render');
    });
  }
  for(const destination of ['analytics','away-and-back','new-customers-render','replaced-workspace','hidden-workspace','invalidated-session']){
    await test('pending settings save cannot repaint abandoned Customers view: '+destination,async()=>{
      const f=fixture(),before=JSON.stringify(f.directory);f.ctx.requireEngineProjectMutation=()=>true;f.ctx.logActivity=()=>{};
      await f.run("renderProjectTab('vessel-a','customers')");let resolve;f.ctx.persistProjectMutation=()=>new Promise(r=>resolve=r);
      f.node('customerHistoryAdminVisible').checked=true;const pending=f.node('saveCustomerHistoryTab').onclick();
      if(destination==='analytics'||destination==='away-and-back')await f.run("renderProjectTab('vessel-a','analytics')");
      if(destination==='away-and-back'||destination==='new-customers-render')await f.run("renderProjectTab('vessel-a','customers')");
      if(destination==='replaced-workspace')f.replaceNode('projectTabContent').innerHTML='<h3>Replacement workspace</h3>';
      if(destination==='hidden-workspace')f.node('projectEngineControl').classList.add('hidden');
      if(destination==='invalidated-session')f.ctx.engineWorkspaceNavigationGeneration++;
      const html=f.node('projectTabContent').innerHTML,paints=f.node('projectTabContent').paints;
      resolve();await pending;
      assert.equal(f.a.customerHistory.adminVisible,true,'An explicitly initiated settings write must retain its intended value');
      assert.equal(JSON.stringify(f.directory),before,'Settings save must not rewrite retained customer records');
      assert.equal(f.node('projectTabContent').innerHTML,html,'Completed settings persistence must preserve the current view');
      assert.equal(f.node('projectTabContent').paints,paints,'Completed settings persistence must not repaint a newer render');
    });
  }
  await test('Attention includes technically ready vessels awaiting Captain order',()=>{
    const f=fixture(),snap=f.ctx.commissioningSnapshot(f.a);assert.equal(snap.ready,true);assert.equal(snap.commissioned,false);assert.equal(f.ctx.fleetDockMatches(f.a,snap,{search:'',filter:'attention'}),true);
  });
  await test('Attention excludes commissioned vessels and preserves search filtering',()=>{
    const f=fixture({captain:true}),snap=f.ctx.commissioningSnapshot(f.a);assert.equal(snap.commissioned,true);assert.equal(f.ctx.fleetDockMatches(f.a,snap,{search:'',filter:'attention'}),false);assert.equal(f.ctx.fleetDockMatches(f.a,snap,{search:'different vessel',filter:'all'}),false);
  });
  await test('missing IndexedDB cannot satisfy recovery tools gate through version default',()=>{
    const f=fixture({db:null});assert.equal(f.ctx.commissioningSnapshot(f.a).rows.find(r=>r.id==='recovery').pass,false);assert.equal(f.ctx.commissioningSnapshot(f.a).ready,false);
  });
  await test('missing recovery module leaves recovery tools gate unmet',()=>{
    const f=fixture({tools:false});assert.equal(f.ctx.commissioningSnapshot(f.a).rows.find(r=>r.id==='recovery').pass,false);
  });
  await test('mission highlights identity setup before later local setup and operating stages',()=>{
    const f=fixture({identity:false,owner:'not_claimed'});f.ctx.renderFleetMissionControl();const html=f.node('fleetMissionRows').innerHTML;
    assert.match(html,/stage-commissioned/);assert.match(html,/fleet-mission-pill current[^>]*>[\s\S]*?IDENTITY/);assert.match(html,/Seal identity and isolation/);
  });
  await test('local owner status and Captain record present local setup without server authority',()=>{
    const f=fixture({captain:true});f.ctx.renderFleetMissionControl();const html=f.node('fleetMissionRows').innerHTML+f.node('fleetMissionSummary').innerHTML;
    assert.match(html,/LOCAL SETUP/);assert.match(html,/LOCAL APPROVAL RECORDED/);assert.match(html,/LOCAL ACTIVE/);assert.doesNotMatch(html,/>AUTHORITY<|authority-state verified|server authority verified/i);
  });
  await test('available tools never present state protection or restore evidence',()=>{
    const f=fixture();f.ctx.renderFleetMissionControl();const html=f.node('fleetMissionRows').innerHTML+f.node('fleetMissionSummary').innerHTML;
    assert.match(html,/RECOVERY TOOLS/);assert.match(html,/restore.*not verified/i);assert.doesNotMatch(html,/STATE PROTECTED|Recovery evidence on record/);
  });
  await test('mission next instruction and highlighted first unmet stage agree',()=>{
    const cases=[{owner:'not_claimed',want:'authority',next:/local owner.*Captain setup/i},{db:null,want:'recovery',next:/local storage.*recovery tools/i}];
    for(const item of cases){const f=fixture(item);f.ctx.renderFleetMissionControl();assert.match(f.node('fleetMissionRows').innerHTML,new RegExp('stage-'+item.want));assert.match(f.ctx.fleetMissionControlState(f.a).next,item.next);}
  });
  await statusRegressions();
  fs.mkdirSync(OUT,{recursive:true});const report={scope:'Offline VM execution of actual app.js workflow functions with synthetic exact-vessel fixtures; no network, email or customer data.',passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length,results};fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify(report,null,2)+'\n');process.exitCode=report.failed?1:0;
})().catch(error=>{console.error(error);process.exitCode=1;});

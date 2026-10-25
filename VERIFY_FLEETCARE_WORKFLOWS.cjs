#!/usr/bin/env node
'use strict';
// Actual app functions, synthetic vessel records, isolated VM: no network or user data.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const ROOT=path.resolve(process.argv[2]||__dirname),OUT=path.resolve(process.argv[3]||path.join(ROOT,'../fleetcare-workflows-evidence'));
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
  fs.mkdirSync(OUT,{recursive:true});const report={scope:'Offline VM execution of actual app.js workflow functions with synthetic exact-vessel fixtures; no network, email or customer data.',passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length,results};fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify(report,null,2)+'\n');process.exitCode=report.failed?1:0;
})().catch(error=>{console.error(error);process.exitCode=1;});

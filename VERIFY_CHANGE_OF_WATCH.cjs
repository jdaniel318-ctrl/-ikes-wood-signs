'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=name=>fs.readFileSync(path.join(__dirname,name),'utf8');
const captain=source('captain.js');
const app=source('app.js');
const owner=source('owner.html');
const take=(s,start,end)=>{const a=s.indexOf(start),b=s.indexOf(end,a+start.length);assert.ok(a>=0&&b>a,start);return s.slice(a,b);};
function node(){
  return {dataset:{},textContent:'',innerHTML:'',isConnected:true,classList:{contains:()=>false},replaceChildren(){this.innerHTML='';},
    focus(){},querySelector(){return node();},querySelectorAll(){return [];}};
}
const elements=new Map();
function byId(id){if(!elements.has(id))elements.set(id,node());return elements.get(id);}
const store=new Map();
const rows=[{projectId:'ship-one',name:'Shop <A>',statusPresentation:{commissioning:{nextGate:{label:'Sea Trial evidence'}}}},
  {projectId:'bf-p-fc2816b8254a4845',name:'VoyageKeeper Recovery Test'}];
const actions=[];
const context=vm.createContext({authorized:true,byId,window:{DarkSkyVesselCommissioning:{preparationCheckpoint:()=>({name:'Draft A',stage:3}),openPreparation:()=>actions.push('draft')},
  BlackFlagOpenCommandResult:r=>actions.push(r.projectId)},fleetSnapshot:()=>rows,openAdmiralGate:(source,target)=>actions.push(target),
  localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)}});
vm.runInContext(take(captain,'  const captainSafe=','\n').trim()+'\n'+take(captain,'  function preparationKey(','  function ensureCaptainCommandMode('),context);
const act=(action,id)=>context.preparationAction({dataset:{prepAction:action,project:id}});
(async()=>{
  context.paintPreparationWatch();
  assert.match(byId('prepDraftButton').textContent,/Draft A · step 3/);
  assert.match(byId('prepWatchChoices').innerHTML,/Shop &lt;A&gt;/);
  await act('add','ship-one');await act('add','bf-p-fc2816b8254a4845');
  assert.equal(store.size,2);assert.match(byId('prepWatchShips').innerHTML,/Exercise vessel · use sample work/);
  await act('open','ship-one');await act('handoff','bf-p-fc2816b8254a4845');await act('draft');
  assert.deepEqual(actions,['ship-one','handoff:bf-p-fc2816b8254a4845','draft']);
  await act('open','missing');assert.equal(actions.length,3);
  context.authorized=false;await act('remove','ship-one');context.paintPreparationWatch();assert.equal(store.size,2);assert.equal(byId('prepWatchShips').innerHTML,'');
  context.authorized=true;context.paintPreparationWatch();assert.match(byId('prepWatchShips').innerHTML,/Shop &lt;A&gt;/);
  await act('remove','ship-one');assert.equal(store.size,1);
  const select={value:'',innerHTML:''}, deck={dataset:{preparationTarget:'bf-p-fc2816b8254a4845'}};
  const token={};let updated=true; const receipt={project_id:'bf-p-fc2816b8254a4845',status:'accepted',accepted_at:'today',candidate_user_id:'user',appointment_id:'test'};
  const db=vm.createContext({deck,current:t=>updated&&t===token,selected:()=>'',validateRecords:(v,a)=>({vessels:v.records,appointments:a.records}),
    rpc:async n=>({records:n.includes('branding')?[{project_id:'bf-p-fc2816b8254a4845',display_name:'Exercise'}]:[receipt]}),
    $:()=>select,safe:String,changeTab(){},message(){},paintHistory(){},paintEvidence(){},paintRoute(){},backend(){},localStorage:context.localStorage});
  vm.runInContext("let vessels,appointments,evidenceReadAt,ready,loadedSession;"+take(captain,'  function verifiedVessels(response){','  async function load(){'),db);
  receipt.revoked_at='yesterday';await db.readRecords(token);assert.equal(store.size,1);assert.equal(select.value,'bf-p-fc2816b8254a4845');
  deck.dataset.preparationTarget='bf-p-42be92cbac12';
  await db.readRecords(token);
  assert.equal(select.value,'bf-p-fc2816b8254a4845','legacy workstation opens the verified server vessel');
  const defaultRpc=db.rpc;
  db.rpc=async n=>n.includes('branding')?{records:[{project_id:'unrelated',display_name:'VoyageKeeper Recovery Test'}]}:{records:[]};
  deck.dataset.preparationTarget='bf-p-42be92cbac12';await db.readRecords(token);
  assert.equal(select.value,'','a matching name cannot substitute for a verified ID');
  assert.equal(deck.dataset.preparationTarget,'bf-p-42be92cbac12');
  db.rpc=async n=>n.includes('branding')?{records:[{project_id:'bf-p-42be92cbac12',display_name:'Exercise'},{project_id:'bf-p-fc2816b8254a4845',display_name:'Exercise'}]}:{records:[]};
  await db.readRecords(token);assert.equal(select.value,'bf-p-42be92cbac12','exact verified ID wins');
  db.rpc=defaultRpc;
  delete receipt.revoked_at;updated=false;assert.equal(await db.readRecords(token),false);assert.equal(store.size,1);
  updated=true;deck.dataset.preparationTarget='not-in-registry';await db.readRecords(token);assert.equal(select.value,'');assert.equal(store.size,1,'an unmatched handoff leaves the shortcut alone');
  const rowsBox={innerHTML:'',replaceChildren(){this.innerHTML='';}},scopeBox={};
  const history=vm.createContext({deck,rowsBox,ready:true,$:id=>id==='harborAppointmentRows'?rowsBox:scopeBox,
    selected:()=>select.value,state(){},safe:String,date:String,appointments:[
      {...receipt,vessel_name:'VoyageKeeper Recovery Test'},{...receipt,status:'revoked',vessel_name:'VoyageKeeper Recovery Test'},
      {...receipt,project_id:'beccas-bloom-shop',vessel_name:'Becca'}]});
  vm.runInContext(take(captain,'  function paintHistory(){','  function evidenceSnapshot(){'),history);
  history.paintHistory();assert.equal(rowsBox.innerHTML,'','unresolved handoff must not expose all-vessel history');
  deck.dataset.preparationTarget='bf-p-42be92cbac12';await db.readRecords(token);
  history.paintHistory();assert.match(scopeBox.textContent,/^2 appointment/);assert.match(rowsBox.innerHTML,/ACCEPTED/);
  assert.match(rowsBox.innerHTML,/REVOKED/);assert.doesNotMatch(rowsBox.innerHTML,/Becca/);
  assert.equal(store.size,0,'a matching accepted receipt retires its shortcut');
  const facade=take(app,'    preparationCheckpoint(){','    openAsEngine:');
  let checkpoint={draftId:'draft',_step:3,name:'Ship C'};let opens=0;
  const ap=vm.createContext({engineSessionUnlocked:true,engineWorkspaceNavigationToken:()=>({}),engineWorkspaceNavigationCurrent:()=>true,readCommissionDraft:()=>checkpoint,recoveryHintDraft:()=>null,
    commissionReceiptNeedsReconciliation:r=>r?.command_state==='unknown',openProjectCommissioning:role=>{assert.equal(role,'captain');opens++;},
    window:{DarkSkyFleetNavigator:{navigate:async()=>({}),state:()=>({target:'engine'})}},$:()=>({click(){}})});
  const api=vm.runInContext('({'+facade+'})',ap);assert.equal(api.preparationCheckpoint().stage,3);
  checkpoint._serverReceipt={command_state:'unknown'};assert.equal(api.preparationCheckpoint().review,true);await api.openPreparation();assert.equal(opens,1);
  ap.engineSessionUnlocked=false;assert.equal(api.preparationCheckpoint(),null);await api.openPreparation();assert.equal(opens,1);
  ap.engineSessionUnlocked=true;ap.COMMISSION_DRAFT_DURABLE_KEY='checkpoint';checkpoint=null;
  const retained={draftId:'offline',_step:5,name:'Ship B'};
  let networkReads=0;
  ap.getSetting=async()=>retained;ap.writeCommissionDraftSafe=(saved,options)=>{assert.equal(options.durable,false);checkpoint=saved;};
  ap.detectActiveCommissionVoyageForResume=async()=>{networkReads++;return null;};
  await api.openPreparation();assert.equal(checkpoint.draftId,'offline');assert.equal(networkReads,0);
  checkpoint=null;let late;ap.getSetting=()=>new Promise(resolve=>{late=resolve;});
  const delayed=api.openPreparation();await new Promise(resolve=>setImmediate(resolve));ap.engineWorkspaceNavigationCurrent=()=>false;
  late(retained);await delayed;assert.equal(checkpoint,null);assert.equal(opens,2);
  assert.match(owner,/livery==='voyagekeeper'\?'<span class="captain-stage-tag">Exercise vessel/);
  assert.match(owner,/watch\?\.has_report && issueCount>0/);assert.match(owner,/Work order from the published Watch report/);
  assert.match(source('fleet_help.js'),/role !== 'admiral' && row.project_id===projectId/);
  assert.match(source('ike_shop.js'),/Ready to send\. Attach the complete request/);
  assert.match(source('countercraft_customer.js'),/Received by Ike’s shop/);
  class Element{
    constructor(tag){this.tag=tag;this.children=[];this.isConnected=true;this.handlers={};this.classList={add(){}};}
    append(...items){this.children.push(...items);}
    replaceChildren(...items){this.children=items;}
    addEventListener(name,fn){this.handlers[name]=fn;}
    setAttribute(key,value){this[key]=value;}
    query(test){for(const child of this.children){if(test(child))return child;const nested=child.query(test);if(nested)return nested;}}
    remove(){this.isConnected=false;}
    focus(){}
    select(){this.selected=true;}
  }
  const ticket={project_id:'ship-one',request_id:'job-19',version:2,status:'open',screen:'Orders',build:'fixture',description:'Operator entered a sample issue.'};
  let isCurrent=true;const copies=[];
  const ui=vm.createContext({window:{},document:{createElement:tag=>new Element(tag)},navigator:{clipboard:{writeText:async text=>copies.push(text)}}});
  vm.runInContext(source('fleet_help.js'),ui);
  const container=new Element('div');
  const mount=(role,records)=>ui.window.DarkSkyFleetHelp.mount(container,{role,projectId:'ship-one',projectName:'Test ship',screen:'Orders',build:'fixture',
    isCurrent:()=>isCurrent,rpc:async()=>({records})});
  const click=async text=>{const button=container.query(n=>n.tag==='button'&&n.textContent===text);assert.ok(button,text);await button.handlers.click();};
  mount('captain',[ticket]);await click('Refresh reports');await click('Copy work order');
  assert.match(copies[0],/ship-one/);assert.match(copies[0],/job-19/);assert.doesNotMatch(copies[0],/entered a sample/);
  const check=container.query(n=>n.type==='checkbox');check.checked=true;check.handlers.change();await click('Copy work order');assert.match(copies[1],/entered a sample/);
  isCurrent=false;await click('Copy work order');assert.equal(copies.length,2);isCurrent=true;
  mount('captain',[{...ticket,project_id:'other'}]);await click('Refresh reports');assert.ok(!container.query(n=>n.textContent==='Copy work order'));
  mount('admiral',[ticket]);await click('Refresh reports');assert.ok(!container.query(n=>n.textContent==='Copy work order'));
  console.log('PASS preparation shortcuts, resume and uncertain receipt, unauthorised state, exact routes, exercise class, checked handoff, work-order and receipt wiring.');
})().catch(e=>{console.error(e);process.exitCode=1;});

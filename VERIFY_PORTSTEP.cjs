'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = name => fs.readFileSync(path.join(__dirname,name),'utf8');
const js = read('app.js');
function block(start,end) {
  const a=js.indexOf(start), b=js.indexOf(end,a+start.length);
  assert.ok(a>=0 && b>a,start);
  return js.slice(a,b);
}
const css=read('styles.css');
const engineHiddenOnCaptain=/body\[data-command-surface="captain"\] #enginePanel,[^{]+\{display:none!important/.test(css);
assert.ok(engineHiddenOnCaptain);
assert.match(read('captain.js'),/<summary>Add a ship to my watch<\/summary>/);
assert.match(css,/\.change-watch \[data-prep-action="open"\][^{]*\{[^}]*background:#efd59b/);
const project={id:'bf-p-fc2816b8254a4845',name:'VoyageKeeper Recovery Test'};
function scenario(){
  const nodes=new Map(), renders=[], faults=[], listeners=new Map();
  function element(id){
    if(nodes.has(id))return nodes.get(id);
    const classes=new Set(),e={id,dataset:{},classList:{add:(...v)=>v.forEach(x=>classes.add(x)),remove:(...v)=>v.forEach(x=>classes.delete(x)),contains:x=>classes.has(x)},setAttribute(){},focus(){},scrollTo(){},addEventListener:(type,fn)=>listeners.set(id+type,fn),click:()=>listeners.get(id+'click')?.()};
    nodes.set(id,e);return e;
  }
  const body=element('body'),window={scrollTo(){},dispatchEvent(){},addEventListener(){}};
  const c=vm.createContext({window,document:{body,getElementById:element},$:element,location:{href:'https://example.test/'},console,URL,
    CustomEvent:class {},requestAnimationFrame:()=>{},setTimeout:()=>{},BUILD_VERSION:'fixture',
    projectById:id=>id===project.id?project:null,canonicalProjectId:x=>x,clearProjectPresentation(){},clearActiveProjectContext(){},clearGraphicsTransientUi(){},syncProjectOperatingLanguage(){},applyProjectControlBrand:async()=>{},scheduleEngineWorkspaceFrame(){},rememberEngineWorkspaceOrigin(){},
    getComputedStyle:el=>({display:el.id==='enginePanel' && body.dataset.commandSurface==='captain' && engineHiddenOnCaptain?'none':'block'}),
    openEnginePanel:async()=>{body.classList.add('engine-mode');element('enginePanel').classList.remove('hidden');},
    renderProjectTab:async(id,tab)=>{vm.runInContext('++projectTabRenderEpoch',c);renders.push([id,tab]);},
    closeEngineWorkspace:el=>el.classList.add('hidden'),seaworthyCommandFailure:label=>faults.push(label),engineCodePads:{clear(){},mount(){},verify:async(input,verify)=>verify('fixture')},
    pendingCaptainDeploymentRoute:null,engineSessionUnlocked:true,isTestAccessActive:()=>false,openCaptainDeploymentRoute:()=>assert.fail(),engineWorkspaceReturnOrigin:null});
  vm.runInContext("let engineWorkspaceNavigationGeneration=0,projectTabRenderEpoch=0,engineActiveProjectId=null,commandSelectedOrderTarget=null,pendingCaptainCommandRoute=null;"+
    block('  const commandRouteAdapters=','  window.DarkSkyReturnToEngine=')+
    block('  function surfaceVisible(','\n')+
    block('  function engineWorkspaceNavigationToken()', '  function invalidateEngineWorkspaceNavigation(')+
    block('  function beginEngineWorkspaceNavigation()', '  function scheduleEngineWorkspaceFrame(')+
    block('  function openEngineWorkspace(el)', '  function closeEngineWorkspace(')+
    block('  async function openProjectEngineControl(', '  async function openCaptainDeploymentRoute(')+
    block('  function closeCaptainSurfacesForEngineRoute()', '  window.addEventListener(\'blackflag:open-command-result\'')+
    block("    if($('engineRoomBtn')) $('engineRoomBtn').addEventListener","    if($('closeEngineBtn'))"),c);
  window.DarkSkyFleetNavigator.register('captain',()=>element('captainQuarters').classList.remove('hidden'));
  window.BlackFlagAuth={verify:async()=>({ok:true,code:'ok'}),unlock:()=>{c.engineSessionUnlocked=true;}};
  element('projectEngineControl').classList.add('hidden');
  return {c,window,element,renders,faults};
}
async function run(){
  const s=scenario(),w=s.window;
  const go=(type='project',id='')=>w.BlackFlagOpenCommandResult({projectId:project.id,type,id});
  await w.DarkSkyFleetNavigator.navigate('captain');
  const result=await go();
  assert.equal(result.ok,true);
  assert.equal(s.element('body').dataset.commandSurface,'engine');
  assert.equal(s.element('pecTitle').textContent,project.name);
  assert.equal(s.element('projectEngineControl').classList.contains('hidden'),false);
  assert.deepEqual(s.renders,[[project.id,'overview']]);
  await go('order','sample');
  assert.equal(s.renders.at(-1)[1],'orders');
  await w.DarkSkyFleetNavigator.navigate('captain');
  await assert.rejects(w.BlackFlagOpenCommandResult({projectId:'missing'}));
  assert.equal(w.DarkSkyFleetNavigator.state().target,'captain');
  s.c.engineSessionUnlocked=false;
  assert.equal((await go()).pendingAuthorization,true);
  await s.element('cancelEngineBtn').click();
  assert.equal(s.element('captainQuarters').classList.contains('hidden'),false);
  assert.equal(vm.runInContext('pendingCaptainCommandRoute',s.c),null);
  await go();
  w.BlackFlagAuth.verify=async()=>({ok:false,code:'incorrect'});
  const count=s.renders.length;
  await s.element('unlockEngineBtn').click();
  assert.equal(s.renders.length,count);
  w.BlackFlagAuth.verify=async()=>({ok:true,code:'ok'});
  await s.element('unlockEngineBtn').click();
  assert.deepEqual(s.renders.at(-1),[project.id,'overview']);
  assert.equal(s.renders.length,count+1);
  await w.DarkSkyFleetNavigator.navigate('captain');
  let finish;
  s.c.openEnginePanel=()=>new Promise(resolve=>{finish=resolve;});
  const late=go();
  await w.DarkSkyFleetNavigator.navigate('captain');
  finish();
  assert.equal((await late).canceled,true);
  assert.equal(s.renders.length,count+1);
  const broken=scenario();
  await broken.window.DarkSkyFleetNavigator.navigate('captain');
  broken.c.renderProjectTab=()=>{throw Error('fixture rendering error');};
  await assert.rejects(broken.window.BlackFlagOpenCommandResult({projectId:project.id}));
  assert.equal(broken.element('body').dataset.commandSurface,'engine');
  assert.equal(broken.element('projectEngineControl').classList.contains('hidden'),true);
  assert.equal(broken.faults.length,1);
  console.log('PASS Captain to visible Engine and exact project, order detail, unknown ship, PIN cancel/decline/resume, later navigation wins');
}
run().catch(err=>{console.error(err);process.exitCode=1;});

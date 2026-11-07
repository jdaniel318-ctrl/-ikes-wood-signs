'use strict';
// Production entry/navigation functions, with browser primitives replaced locally.
// No backend, real credentials, or native password-manager claims.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=name=>fs.readFileSync(__dirname+'/'+name,'utf8'),app=read('app.js'),html=read('index.html');
function fn(name){const start=app.search(new RegExp('  (?:async )?function '+name+'\\('));assert.ok(start>=0,name);return app.slice(start,app.indexOf('\n  }',start)+4);}
function classes(...initial){const values=new Set(initial);return {contains:x=>values.has(x),add:(...xs)=>xs.forEach(x=>values.add(x)),remove:(...xs)=>xs.forEach(x=>values.delete(x)),toggle:(x,on)=>on?values.add(x):values.delete(x)};}
function viewport(){const frames=[],calls=[];const body={classList:classes(),dataset:{}},document={body,documentElement:{},readyState:'complete',getElementById:()=>null,querySelector:()=>null};const c={document,requestAnimationFrame:f=>frames.push(f),addEventListener(){},scrollTo:options=>calls.push(['window',options.top]),console};c.window=c;vm.createContext(c);vm.runInContext(read('fleet_viewport.js'),c);return {c,calls,frames,flush(){while(frames.length)frames.shift()();}};}
test('local PIN gates carry no browser password field semantics and stay visually masked',()=>{
 for(const id of ['captainPinInput','adminPinInput','engineResetPinInput','newAdminPin','confirmAdminPin','adminCurrentPinChange','adminNewPinChange','adminConfirmPinChange']){
  const tag=html.match(new RegExp('<input[^>]*id="'+id+'"[^>]*>'))?.[0];assert.ok(tag,id);
  assert.match(tag,/type="text"/,id+' must not be a browser account password');assert.match(tag,/data-bf-pin/,id);assert.match(tag,/inputmode="numeric"/,id);assert.match(tag,/autocomplete="off"/,id);assert.doesNotMatch(tag,/\sname=/,id);
 }
 assert.match(html,/input\[data-bf-pin\]\s*\{[^}]*-webkit-text-security\s*:\s*disc/, 'Mask must exist before the deferred runtime stylesheet');
 assert.match(app,/<input[^>]*id="ownerLoginPassword"[^>]*type="password"[^>]*autocomplete="current-password"/);
 assert.match(html,/<input[^>]*id="darkSkyAdmiralRecoveryPassword"[^>]*type="password"/);
});
function padFixture(){
 const events=[], listeners={}, leaves={}, mask={}, status={};
 const pad={
   focus(){events.push('focus');}, closest(){return this.hidden ? {} : null;},
   querySelector(selector){return selector==='[data-code-mask]' ? mask : status;},
   addEventListener(type,callback){listeners[type]=callback;}
 };
 const submit={click(){events.push('submit');}};
 const c={window:{addEventListener(type,callback){leaves[type]=callback;}}};
 vm.createContext(c);
 const pads=vm.runInContext(app.slice(0, app.indexOf('\n(() => {'))+'\nengineCodePads',c);
 pads.mount(pad,submit);
 const tap=key=>listeners.click({target:{closest:()=>({dataset:{codeKey:key}})}});
 const type=(key,extra={})=>listeners.keydown({key,target:pad,preventDefault(){},...extra});
 return {pad,pads,submit,tap,type,mask,status,events,leaves,c};
}
test('both Engine entrances have labelled button keypads and no editable credential field',()=>{
 for(const id of ['blackFlagEntryPin','enginePinInput']){
   const markup=html.match(new RegExp('<fieldset id="'+id+'"[\\s\\S]+?</fieldset>'))?.[0];
   assert.ok(markup,id);
   assert.match(markup,/<legend>[^<]+<\/legend>/);
   assert.doesNotMatch(markup,/<input\b|<textarea\b|contenteditable|type="submit"/i);
   const keys=Array.from(markup.matchAll(/<button type="button" data-code-key="([^"]+)"/g),m=>m[1]);
   assert.deepEqual(keys,['1','2','3','4','5','6','7','8','9','clear','0','delete']);
 }
});
test('button and keyboard entry preserve leading zeroes, edit correctly and expose only the digit count',async()=>{
 const f=padFixture(); f.tap('7'); f.tap('clear'); f.tap('0'); f.type('9'); f.type('Backspace'); f.type('2'); f.tap('8'); f.tap('delete');
 f.type('7',{ctrlKey:true}); f.type('6',{repeat:true}); f.type('Enter');
 assert.equal(f.mask.textContent,'●●');assert.equal(f.status.textContent,'2 digits entered');assert.equal(f.events.at(-1),'submit');
 assert.equal('value' in f.pad,false);
 await f.pads.verify(f.pad,code=>{assert.equal(code,'02');assert.equal(f.mask.textContent,'');return {ok:true};});
 for(const digit of '1234567890')f.tap(digit);
 await f.pads.verify(f.pad,code=>assert.equal(code,'12345678'));
});
test('lockout blocks input and submission; pending checks are single-use and page exit invalidates their result',async()=>{
 const f=padFixture(); f.pad.disabled=true; f.tap('1'); f.type('2');
 assert.equal(f.mask.textContent,'');assert.equal(await f.pads.verify(f.pad,()=>assert.fail()),null);
 f.pad.disabled=false;f.tap('1');let resolve;
 const pending=f.pads.verify(f.pad,()=>new Promise(r=>resolve=r));f.tap('5');
 assert.equal(await f.pads.verify(f.pad,()=>assert.fail()),null);assert.equal(f.mask.textContent,'');
 f.leaves.pagehide(); resolve({ok:true});assert.equal(await pending,null);
 f.tap('2'); f.pads.clear(f.pad);assert.equal(f.status.textContent,'0 digits entered');
 f.pad.hidden=true;assert.equal(await f.pads.verify(f.pad,()=>({ok:true})),null);
});
function entry(value,result={ok:false,code:'incorrect'}){
 const f=padFixture(),{c,events,pad,pads,mask}=f;
 const elements={blackFlagEntryPin:pad,blackFlagEntryError:{textContent:''},enginePanel:{classList:classes('hidden')}};
 Object.assign(c,{console,byId:id=>elements[id],document:{body:{classList:classes('boot-locked')}},hideProjectSurfacesBeforeEngine(){events.push('hide');},leaveEntry(){pads.clear(pad);events.push('leave');},resumeActiveCommissionVoyageAfterEngineUnlock:async()=>true,scheduleIronHullFortification(){}});
 Object.assign(c.window,{BlackFlagAuth:{verify:async code=>{events.push(['verify',code,mask.textContent]);return result;},message:()=> 'Incorrect PIN',unlock(){events.push('unlock');}},DarkSkyBoundaryBridge:{prepareEngine(){events.push('prepare');}},scrollTo(){events.push('scroll');}});
 vm.runInContext(fn('unlockFromEntry'),c);
 Array.from(value).forEach(f.tap);return {...f,elements};
}
test('incorrect configured code clears before verification and leaves the primary gate closed',async()=>{
 const f=entry('2468');await f.c.unlockFromEntry();assert.deepEqual(f.events[0],['verify','2468','']);
 assert.ok(!f.events.includes('unlock'));assert.ok(f.c.document.body.classList.contains('boot-locked'));
});
test('accepted configured code follows the existing Engine boundary',async()=>{
 const f=entry('2468',{ok:true});await f.c.unlockFromEntry();assert.deepEqual(f.events[0],['verify','2468','']);
 assert.ok(f.events.includes('unlock'));assert.ok(f.events.includes('prepare'));assert.equal(f.mask.textContent,'');
});
test('locked and unavailable primary gates remain closed after discarding the code',async()=>{
 for(const code of ['locked','startup']){
   const f=entry('2468',{ok:false,code});f.c.window.showPinLock=()=>f.events.push('lockout');await f.c.unlockFromEntry();
   assert.equal(f.mask.textContent,'');assert.ok(!f.events.includes('unlock'));assert.ok(f.c.document.body.classList.contains('boot-locked'));
   if(code==='locked')assert.ok(f.events.includes('lockout'));else assert.match(f.elements.blackFlagEntryError.textContent,/startup is incomplete/);
 }
});
test('secondary Engine gate clears before verification and reports verifier failure without opening',async()=>{
 const start=app.indexOf("    $('unlockEngineBtn').addEventListener('click',async()=>{"),end=app.indexOf('\n    });',start);assert.ok(start>=0&&end>start);
 const f=padFixture();const elements={enginePinInput:f.pad,enginePinError:{textContent:''},unlockEngineBtn:{addEventListener:(_,handler)=>elements.handler=handler}};
 f.c.$=id=>elements[id];f.c.window.BlackFlagAuth={verify:async code=>{assert.equal(code,'24');assert.equal(f.mask.textContent,'');throw Error('offline');}};
 vm.runInContext(app.slice(start,end+8),f.c);f.tap('2');f.tap('4');await elements.handler();
 assert.match(elements.enginePinError.textContent,/startup is incomplete/);
});
test('explicit route anchor resets its real scroll ancestors instead of only window',()=>{const f=viewport(),anchor={isConnected:true,scrollIntoView:o=>f.calls.push(['anchor',o.block])};f.c.BlackFlagViewport.enter({key:'workstation:legacy',reason:'new',anchor});f.flush();assert.deepEqual(f.calls,[['anchor','start']]);});
test('a route invalidated before layout cannot scroll a different surface',()=>{const f=viewport();let current=true;const anchor={isConnected:true,scrollIntoView:()=>f.calls.push('anchor')};f.c.BlackFlagViewport.enter({key:'workstation:legacy',anchor,current:()=>current});current=false;f.flush();assert.deepEqual(f.calls,[]);});
test('detached route targets cannot fall back to scrolling the current window',()=>{const f=viewport();f.c.BlackFlagViewport.enter({anchor:{isConnected:false,scrollIntoView:()=>f.calls.push('detached')}});f.flush();assert.deepEqual(f.calls,[]);});
test('input, resize, background and render never initiate scrolling',()=>{const f=viewport();for(const reason of ['input','resize','recheck','foreground','render'])assert.equal(f.c.BlackFlagViewport.enter({reason}),false);f.flush();assert.deepEqual(f.calls,[]);});
test('latest explicit navigation wins and Back retains its requested position',()=>{const f=viewport();f.c.BlackFlagViewport.enter({key:'old'});f.c.BlackFlagViewport.enter({key:'current',reason:'back',position:140});f.flush();assert.deepEqual(f.calls,[['window',140]]);});
test('vessel selection commits the exact dock anchor while preserving auth and refresh behavior',()=>{
 const f=viewport(),e={};for(const id of ['fleetCommissioningDock','fleetCommissioningFleet','fleetWorkstationTitle','fleetWorkstationHint','fleetWorkstationBack','fleetDockSearch'])e[id]={id,classList:classes(),focus(){},textContent:''};
 const cards=['legacy','ike'].map(projectId=>({dataset:{projectId},hidden:false,querySelector:s=>s==='.wayfinder-vessel-name'?{textContent:projectId}:{focus(){}}}));e.fleetCommissioningFleet.querySelectorAll=()=>cards;e.fleetCommissioningFleet.getAttribute=()=>null;e.fleetCommissioningDock.isConnected=true;e.fleetCommissioningDock.scrollIntoView=()=>f.calls.push('dock');
 Object.assign(f.c,{$:id=>e[id],engineSessionUnlocked:true,experienceTestDeckRequest:0,fleetWorkstationProjectId:'',engineWorkspaceNavigationToken:()=>1,engineWorkspaceNavigationCurrent:()=>f.c.engineSessionUnlocked});f.c.document.body.classList.add('engine-mode');vm.runInContext(fn('setFleetWorkstationView'),f.c);
 assert.equal(f.c.setFleetWorkstationView('legacy'),true);f.flush();assert.deepEqual(f.calls,['dock']);assert.equal(cards[1].hidden,true);f.calls.length=0;
 f.c.setFleetWorkstationView('legacy',{focus:false});f.flush();assert.deepEqual(f.calls,[],'Background roster refresh must retain reading position');f.c.engineSessionUnlocked=false;assert.equal(f.c.setFleetWorkstationView('ike'),false);assert.equal(f.c.fleetWorkstationProjectId,'legacy');
});
test('Engine viewport and app shell have their own full-height dark backgrounds',()=>{const css=read('fleet_viewport.css');assert.match(css,/body\.hw-viewport\.engine-mode\s*,\s*body\.hw-viewport\.engine-mode\s*#app\s*\{[^}]*background\s*:\s*#06151b/);assert.match(css,/body\.hw-viewport\.engine-mode\s*#app\s*\{[^}]*min-height\s*:\s*100dvh/);});
test('shared owner entrance is standalone and never inherits Engine support navigation',()=>{const c={URL,location:{href:'https://fixture.invalid/fleet/index.html?internal=1#private'},projectById:()=>({ownerAccess:{status:'active'}})};vm.createContext(c);vm.runInContext(fn('ownerPartnerEntryLink'),c);const u=new URL(c.ownerPartnerEntryLink('legacy-fixture'));assert.equal(u.pathname,'/fleet/owner.html');assert.equal(u.searchParams.get('project'),'legacy-fixture');assert.equal(u.searchParams.get('view'),'portal');assert.equal(u.searchParams.get('source'),null);assert.equal(u.searchParams.get('internal'),null);assert.equal(u.hash,'');});
test('explicit Engine owner visits retain an optional return route without granting authority',()=>{const c={URL,location:{href:'https://fixture.invalid/fleet/index.html'},projectById:()=>({ownerAccess:{status:'not_claimed'}})};vm.createContext(c);vm.runInContext(fn('ownerPartnerEntryLink'),c);const u=new URL(c.ownerPartnerEntryLink('legacy-fixture',{fromEngine:true}));assert.equal(u.searchParams.get('project'),'legacy-fixture');assert.equal(u.searchParams.get('view'),'login');assert.equal(u.searchParams.get('source'),'engine');assert.deepEqual([...u.searchParams.keys()].sort(),['project','source','view']);});

const owner=read('owner.html').slice(read('owner.html').indexOf("const DB_NAME='blackFlagPlatformV1'"));
function ownerFn(name){const start=owner.search(new RegExp('^(?:async )?function '+name+'\\(','m'));assert.ok(start>=0,name);const lineEnd=owner.indexOf('\n',start),line=owner.slice(start,lineEnd);return line.endsWith('}')?line:owner.slice(start,owner.indexOf('\n}',start)+2);}
function ownerFixture({cached=null,projectId='legacy-fixture',signedIn=false,unauthorized=false,unknown=false,wrongProject=false}={}){
 const elements=new Map(),values=new Map(),requests=[],storageReads=[],writes=[];
 const el=id=>{if(!elements.has(id))elements.set(id,{id,textContent:'',innerHTML:'',value:'',classList:classes(),querySelectorAll:()=>[],addEventListener(){}});return elements.get(id);};
 const auth={access_token:'synthetic-token',expires_at:Date.now()+3600000,user:{id:'fixture-owner',user_metadata:{dark_sky_owner_password_set:true}}};
 const vessel={id:'vessel-fixture',project_id:wrongProject?'foreign':projectId,namespace:'server:legacy-fixture',display_name:'Verified Plumbing',owner_state:'claimed'};
 const c={console,URL,URLSearchParams,Date,Set,projectId,project:null,ownerProjectFromServer:false,db:null,orders:[],source:'',requestedView:'login',location:{search:'?project='+projectId+'&view=login'},engineTrialLaunch:null,localRecoveryAttempt:false,ownerViewEpoch:0,ownerExpiryTimer:0,closeOwnerHelp:null,verifiedOwnerBinding:null,ownerOrderReadError:'',OWNER_SESSION_KEY:'test-owner-session',OWNER_SESSION_TTL_MS:3600000,DB_NAME:'fixture',STORE_PROJECTS:'projects',STORE_SETTINGS:'settings',STORE_ORDERS:'orders',SUPABASE_URL:'https://fixture.invalid',publicOwnerNames:new Map([['legacy-fixture',null]]),$:el,
  sessionStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},
  window:{BlackFlagHeadway:{version:'8.8.20.68'},BlackFlagViewport:{},BlackFlagBusinessDeck:{BUILD:'8.8.20.68'},BlackFlagInput:{build:'8.8.20.68'},CountercraftPrivacy:{isLocked:()=>false}},
  history:{replaceState(){}},openDb:async()=>({}),req:async value=>value,tx:(store,mode='readonly')=>{storageReads.push([store,mode]);if(mode!=='readonly')writes.push(store);return {get:key=>store==='projects'?cached:undefined,getAll:()=>[{id:'FOREIGN',projectId:'foreign'}]};},
  show:id=>c.shown=id,configureOwnerLogin:()=>c.loginProvider=c.usesSupabaseOwner()?'server':'local',bindEngineButtons(){},ensureIkeTestCredential:async()=>{c.localCredentialPrepared=true},renderPortal:()=>c.shown='portal',ownerWitness(){},random:()=> 'fixture-nonce',assertOwnerUnlocked(){},
  currentSupabaseSession:async()=>signedIn?auth:null,supabaseSession:()=>signedIn?auth:null,fetchSupabaseUser:async()=>signedIn?auth.user:null,supaHeaders:()=>({Authorization:'Bearer synthetic-token'}),exchangeHashSession:async()=>{},clearSupabaseSession(){},
  fetch:async url=>{requests.push(url);return {ok:true,json:async()=>url.includes('/fleet_vessels?')?(unknown?[]:[vessel]):unauthorized?[]:[{id:'membership-fixture',vessel_id:vessel.id,user_id:auth.user.id,role:'project_owner',active:true,revoked_at:null}]};}
 };
 vm.createContext(c);for(const name of ['getProject','getOrders','usesSupabaseOwner','setNames','ownerActive','ownerSession','sessionValid','fleetHelpOwnerBinding','retireOwnerHelp','clearSession','ownerAccessMessage','passwordSetupComplete','verifySupabaseMembership','enterSupabaseOwner','resolveLiveOwnerState','capabilities','modules','ownerReturnView','openVerifiedOwnerHome','boot'])vm.runInContext(ownerFn(name),c);
 return {c,el,values,requests,storageReads,writes,auth,vessel};
}
test('cold owner boot reaches generic exact-project sign-in without an Engine registry or server reads',async()=>{const f=ownerFixture();await f.c.boot();assert.equal(f.c.shown,'login');assert.equal(f.c.loginProvider,'server');assert.equal(f.c.project,null);assert.equal(f.el('loginName').textContent,'Business Owner Access');assert.equal(f.requests.length,0);assert.ok(!f.c.localCredentialPrepared);assert.ok(!f.storageReads.some(([s])=>s==='orders'));assert.deepEqual(f.writes,[]);});
test('unknown cold owner route stays server-only and cannot create a local owner session',async()=>{const f=ownerFixture({projectId:'unrecognized-route'});await f.c.boot();assert.equal(f.c.shown,'login');assert.equal(f.c.loginProvider,'server');assert.equal(f.c.project,null);assert.equal(f.c.sessionValid({projectId:'unrecognized-route',authority:'project_owner'}),false);assert.deepEqual(f.writes,[]);});
test('missing local stores cannot block the standalone owner sign-in',async()=>{const f=ownerFixture();f.c.tx=()=>{throw Error('NotFoundError')};await f.c.boot();assert.equal(f.c.shown,'login');assert.equal(f.c.project,null);});
test('unavailable browser storage cannot turn sign-in into an Engine prerequisite',async()=>{const f=ownerFixture();f.c.openDb=async()=>{throw Error('Storage unavailable')};await f.c.boot();assert.equal(f.c.shown,'login');assert.equal(f.c.project,null);});
test('verified cold owner hydrates only server identity in memory and keeps local business tools unavailable',async()=>{const f=ownerFixture({signedIn:true});await f.c.boot();assert.equal(f.c.shown,'portal');assert.equal(f.c.project.id,'legacy-fixture');assert.equal(f.c.project.name,'Verified Plumbing');assert.equal(f.c.project.namespace,'server:legacy-fixture');assert.equal(f.c.ownerProjectFromServer,true);assert.equal(f.c.project.publish,undefined);assert.equal(f.c.project.ownerAccess.credential,undefined);assert.equal(f.c.sessionValid(f.c.ownerSession()),true);assert.deepEqual(Array.from(f.c.modules(),m=>m[0]),['fleet-help','watch','services','settings']);assert.deepEqual(Array.from(f.c.orders),[]);assert.deepEqual(f.writes,[]);assert.ok(f.requests.every(u=>!u.includes('/auth/')&&!u.includes('foreign')));});
for(const [label,options] of [['unauthorized owner',{unauthorized:true}],['unknown vessel',{unknown:true}],['foreign server vessel',{wrongProject:true}]])test(label+' cannot hydrate a project or open the owner portal',async()=>{const f=ownerFixture({signedIn:true,...options});await f.c.boot();assert.equal(f.c.shown,'login');assert.equal(f.c.project,null);assert.equal(f.c.verifiedOwnerBinding,null);assert.equal(f.c.ownerSession(),null);assert.deepEqual(f.writes,[]);});
test('existing cached owner project remains the exact original record with local data policy intact',async()=>{const cached={id:'legacy-fixture',namespace:'local:legacy',name:'Cached Plumbing',ownerAccess:{identityProvider:'supabase',status:'active',capabilities:['orders','branding']},products:[{id:'retained'}]},before=JSON.stringify(cached),f=ownerFixture({cached,signedIn:true});await f.c.boot();assert.equal(f.c.shown,'portal');assert.equal(f.c.project,cached);assert.equal(JSON.stringify(cached),before);assert.equal(f.c.ownerProjectFromServer,false);assert.equal(f.c.sessionValid(f.c.ownerSession()),true);assert.ok(f.c.modules().some(m=>m[0]==='orders'));assert.equal(f.c.orders.length,0,'Other-project order remains excluded');assert.deepEqual(f.writes,[]);});
test('cold owner DB opening aborts implicit creation instead of adding a schema',async()=>{let request,aborts=0;const c={DB_NAME:'fixture',indexedDB:{open:()=>request={transaction:{abort(){aborts++}}}}};vm.createContext(c);vm.runInContext(ownerFn('openDb'),c);const pending=c.openDb();assert.equal(typeof request.onupgradeneeded,'function');request.onupgradeneeded();assert.equal(await pending,null);assert.equal(aborts,1);});
test('fresh owner home explains where local records are and offers only online tools',async()=>{const f=ownerFixture({signedIn:true});await f.c.boot();f.c.esc=String;f.c.openOwnerView=()=>{};f.c.window.BlackFlagBusinessDeck.mountHome=()=>{f.el('businessDeckHome').innerHTML='LOCAL ORDER DECK'};vm.runInContext(ownerFn('renderBusinessHome'),f.c);f.c.renderBusinessHome();const home=f.el('businessDeckHome').innerHTML;assert.match(home,/Verified Plumbing/);assert.match(home,/saved on another device/i);assert.match(home,/data-owner-online="services"/);assert.doesNotMatch(home,/data-owner-online="(?:orders|branding|pricing)"/);});
test('sign-out removes server-only business identity from the unauthenticated screen',async()=>{const f=ownerFixture({signedIn:true});await f.c.boot();f.c.clearSession();assert.equal(f.c.project,null);assert.equal(f.c.ownerProjectFromServer,false);assert.equal(f.el('loginName').textContent,'Business Owner Access');assert.equal(f.c.ownerSession(),null);assert.equal(f.c.verifiedOwnerBinding,null);});
test('cold owner cannot use provisional local credential recovery',async()=>{const f=ownerFixture({signedIn:true});await f.c.boot();f.c.localRecoveryWaitMs=()=>0;vm.runInContext(ownerFn('resetLocalOwnerCredential'),f.c);await assert.rejects(f.c.resetLocalOwnerCredential(),/online owner account/i);assert.equal(f.c.project.ownerAccess.credential,undefined);assert.deepEqual(f.writes,[]);});
function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};}
async function viewFixture(){
 const f=ownerFixture({signedIn:true}),{c}=f;await c.boot();
 const views=[],timers=new Map();Object.assign(c,{esc:String,views,document:{querySelectorAll:()=>[]},workspace:(title,copy,body)=>{views.push(title);f.el('workspace').innerHTML=body;},
 ownerExpiryTimer:0,setTimeout:(cb,ms)=>{const id=timers.size+1;timers.set(id,{cb,ms});return id;},clearTimeout:id=>timers.delete(id),
 alert:message=>{throw Error('Unexpected stale alert: '+message);}});
 for(const name of ['ownerViewGuard','armOwnerExpiry','checkDisplayedOwner','signOutOwner'])if(owner.includes('function '+name+'('))vm.runInContext(ownerFn(name),c);
 for(const name of ['canReadOwnerDeck','ownerWatchRpc','requestFleetService'])vm.runInContext(ownerFn(name),c);
 const from=owner.indexOf('async function renderWorkspace(k)'),to=owner.indexOf('\nasync function boot()',from);
 vm.runInContext(owner.slice(from,to),c);
 const sign=owner.indexOf("$('signOut').onclick="),retry=owner.indexOf(";$('retry').onclick=",sign);vm.runInContext(owner.slice(sign,retry),c);
 return {...f,views,timers};
}
for(const k of ['watch','services'])for(const reason of ['signout','navigation','expiry'])test(k+' discards a delayed read after '+reason,async()=>{
 const f=await viewFixture(),read=deferred(),{c}=f;c.readOwnWatchReport=c.fleetServiceCatalog=()=>read.promise;
 const pending=c.renderWorkspace(k);
 if(reason==='signout')c.clearSession();if(reason==='navigation')c.ownerViewEpoch++;if(reason==='expiry')f.auth.expires_at=Date.now()-1;
 read.resolve(k==='watch'?{record:{current_work:'Private prior owner work'}}:[]);await pending;
 assert.deepEqual(f.views,[],'Stale response must never write workspace');
});
test('sign-out removes authority and private view synchronously even with stalled network logout',async()=>{
 const f=await viewFixture(),{c}=f,network=deferred(),calls=[];f.el('workspace').textContent='private business content';
 c.supaHeaders=token=>({Authorization:'Bearer '+token});c.fetch=(url,init)=>{calls.push(init.headers.Authorization);return network.promise;};
 let authCleared=false;c.clearSupabaseSession=()=>{authCleared=true;};const work=f.el('signOut').onclick();
 assert.equal(authCleared,true);assert.equal(c.ownerSession(),null);assert.equal(c.project,null);assert.equal(c.shown,'login');assert.equal(f.el('workspace').textContent,'');assert.deepEqual(calls,['Bearer synthetic-token']);
 c.shown='subsequent-session';network.resolve({ok:true});await work;assert.equal(c.shown,'subsequent-session');
});
for(const op of ['watch','service'])test('delayed proof cannot start a '+op+' mutation after navigation',async()=>{
 const f=await viewFixture(),{c}=f,proof=deferred(),started=deferred(),writes=[];
 c.verifySupabaseMembership=()=>{started.resolve();return proof.promise;};c.fetch=async(url)=>{writes.push(url);return {ok:true,json:async()=>({})};};
 const work=op==='watch'?c.ownerWatchRpc('vessel_publish_watch_report',{}):c.requestFleetService({capability_id:'cap-fixture'});
 await started.promise;c.ownerViewEpoch++;proof.resolve({ok:true,session:f.auth,user:f.auth.user,vessel:f.vessel});
 await work.catch(()=>{});assert.deepEqual(writes,[]);
});
test('ended Watch handlers cannot refresh or publish from a prior owner view',async()=>{
 const f=await viewFixture(),{c}=f;let reads=0,writes=0;c.readOwnWatchReport=async()=>{reads++;return {};};c.publishOwnWatchReport=async()=>{writes++;return {};};await c.renderWorkspace('watch');
 const refresh=f.el('refreshWatchReport').onclick,publish=f.el('publishWatchReport').onclick;f.el('watchCurrentWork').value='Prior owner data';c.ownerViewEpoch++;
 await refresh();await publish();assert.equal(reads,1);assert.equal(writes,0);assert.equal(f.views.length,1);
});
test('remote-only owner view clears at its active token deadline and again on expired foreground restoration',async()=>{
 for(const path of ['timer','foreground']){
  const f=await viewFixture(),{c}=f;const remaining=5000;f.auth.expires_at=Date.now()+remaining;
  assert.equal(typeof c.armOwnerExpiry,'function');c.armOwnerExpiry();assert.equal(f.timers.size,1);const timer=[...f.timers.values()][0];assert.ok(timer.ms>0&&timer.ms<=remaining);
  f.el('workspace').textContent='Private current work';f.auth.expires_at=Date.now()-1;
  if(path==='timer')timer.cb();else c.checkDisplayedOwner();
  assert.equal(c.shown,'login');assert.equal(c.ownerSession(),null);assert.equal(c.project,null);assert.equal(f.el('workspace').textContent,'');
 }
 assert.match(owner,/addEventListener\('visibilitychange'[^\n]*checkDisplayedOwner/);assert.match(owner,/addEventListener\('pageshow'[^\n]*checkDisplayedOwner/);
});
test('missing owner receipt at its deadline clears a displayed remote workspace',async()=>{
 const f=await viewFixture(),{c}=f;c.armOwnerExpiry();const timer=[...f.timers.values()][0];f.values.delete(c.OWNER_SESSION_KEY);f.el('workspace').textContent='Private data';timer.cb();
 assert.equal(c.shown,'login');assert.equal(c.project,null);assert.equal(f.el('workspace').textContent,'');
});
test('late denied service read cannot disturb the new view or reject into navigation',async()=>{
 const f=await viewFixture(),{c}=f,read=deferred();c.fleetServiceCatalog=async()=>{await read.promise;throw Error('read failed');};
 const pending=c.renderWorkspace('services');c.ownerViewEpoch++;read.resolve();
 await assert.doesNotReject(pending);assert.deepEqual(f.views,[]);
});
test('active owner can publish a report, verify readback and request an offered service',async()=>{
 const f=await viewFixture(),{c}=f,headers=[],work='Review work orders',report={current_work:work,reported_at:new Date().toISOString()};
 c.window.__blackFlagPageRelease={build:'fixture'};c.verifySupabaseMembership=async()=>({ok:true,user:f.auth.user,vessel:f.vessel,session:f.auth});
 c.fetch=async(url,init)=>{headers.push(init.headers.Authorization);return {ok:true,json:async()=>url.includes('publish_watch_report')?{report_id:'fixture-report'}:{record:report}};};
 for(const name of ['readOwnWatchReport','publishOwnWatchReport'])vm.runInContext(ownerFn(name),c);
 await c.renderWorkspace('watch');f.el('watchCurrentWork').value=work;await f.el('publishWatchReport').onclick();assert.match(f.el('watchReportState').textContent,/VERIFIED REPORT SAVED AND READ BACK/);
 await c.requestFleetService({capability_id:'fixture-service'});assert.equal(headers.length,4);assert.ok(headers.every(h=>h==='Bearer synthetic-token'));
});
test('production owner auth client cannot restore a signed-out identity when a late user response arrives',async()=>{
 const setup=owner.match(/^const ownerSupabase=[^\n]+/m)?.[0];assert.ok(setup);
 const values=new Map(),pending=deferred(),g={window:{addEventListener(){},__blackFlagPageRelease:{build:'fixture'}},document:{addEventListener(){}},sessionStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},setTimeout,clearTimeout,AbortController,Date,SUPABASE_URL:'https://fixture.invalid',SUPABASE_KEY:'test-publishable',SUPABASE_SESSION_KEY:'fixture-owner-only',fetch:()=>pending.promise};
 vm.createContext(g);vm.runInContext(read('fleet_supabase.js'),g);const client=vm.runInContext(setup+';ownerSupabase',g);
 client.saveSession({access_token:'fixture-token',user:{id:'fixture-owner'}});const check=client.user(client.readSession());client.clearSession();
 pending.resolve({ok:true,json:async()=>({id:'fixture-owner'})});await check;assert.equal(client.readSession(),null);
});

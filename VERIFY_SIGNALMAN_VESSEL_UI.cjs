'use strict';
// Exercise the actual owner and appointed-Captain routes, session clients and navigation.
// Intercept every request locally. Only Fleet Help's presentation is substituted here;
// the separate UI tests exercise the actual form/list and their response contracts.
const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createRequire}=require('node:module'),{chromium}=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||__dirname,'playwright/package.json'))('playwright');
const root=path.resolve(process.argv[2]||__dirname),origin='https://vessel-fixture.invalid',project='beccas-bloom-shop',user={id:'fixture-person',email:'vessel@example.invalid',user_metadata:{dark_sky_owner_password_set:true}};
let browser;
before(async()=>{const executablePath=[process.env.CHROMIUM_PATH,chromium.executablePath(),'/usr/bin/chromium','/tmp/suretap-browser/chrome'].find(x=>x&&fs.existsSync(x));browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});});
after(async()=>browser?.close());
const witness=`window.__mounts=[];window.DarkSkyFleetHelp={mount(host,options){const lease={host,options,ended:false};window.__mounts.push(lease);host.textContent='Fixture '+options.role+' workspace';return ()=>{lease.ended=true;host.replaceChildren()};}};`;
async function fixture(t,{role='owner',authorized=true,authenticated=true,view='',appointment='accepted',cached=false,provisional=false,interceptHelp=null,needsSetup=false}={}){
 const context=await browser.newContext({viewport:{width:840,height:860}});t.after(()=>context.close());
 const scope=cached?'fixture-business':project;
 const identity={...user,user_metadata:{dark_sky_owner_password_set:!needsSetup}};
 const p=await context.newPage(),calls=[],redirects=[],errors=[],keys={owner:'darkSkySupabaseOwnerSessionV1',captain:'darkSkySupabaseVesselCaptainSessionV1'};
 p.setDefaultTimeout(3200);p.on('pageerror',e=>errors.push(e.message));t.after(()=>assert.deepEqual(errors,[]));
 if(authenticated)await context.addInitScript(({key,role,user})=>{if(!sessionStorage.getItem('fixture-init')){sessionStorage.setItem(key,JSON.stringify({user,expires_at:Date.now()+3600000,access_token:'fixture-'+role,flow_type:''}));sessionStorage.setItem('fixture-init','done');}},{key:keys[role],role,user});
 await context.route('**/*',async route=>{
  const request=route.request(),url=new URL(request.url()),file=url.pathname.slice(1);
  if(url.origin===origin){
   if(file==='seed.html')return route.fulfill({body:'<!doctype html><title>Local fixture setup</title>',contentType:'text/html'});
   if(file==='fleet_help.js')return route.fulfill({body:witness,contentType:'text/javascript'});
   if(file==='fleet_help.css')return route.fulfill({body:'',contentType:'text/css'});
   if(!/^[a-zA-Z0-9_.-]+$/.test(file)||!fs.existsSync(path.join(root,file)))return route.fulfill({status:404,body:''});
   return route.fulfill({path:path.join(root,file)});
  }
  if(url.hostname!=='sjgqqtnuttnkwsoebbqf.supabase.co')return route.abort();
  const json=(value,status=200)=>route.fulfill({json:value,status}),rpc=file.split('/').pop(),body=request.postDataJSON();
  if(file==='auth/v1/logout')return json({});
  if(file==='auth/v1/token'&&url.searchParams.get('grant_type')==='password')return json({access_token:'fixture-owner',expires_in:3600,user:identity});
  if(file==='auth/v1/otp'||file==='auth/v1/recover'){redirects.push(url.searchParams.get('redirect_to'));return json({});}
  if(file==='auth/v1/user'){
   if(request.method()==='PUT')identity.user_metadata=body.data;
   return json(identity);
  }
  if(file==='rest/v1/fleet_vessels')return json([{id:'vessel-A',namespace:cached?'local.'+scope:'beccas',display_name:'Becca Test',project_id:scope}]);
  if(file==='rest/v1/fleet_memberships')return json(authorized?[{id:'owned',vessel_id:'vessel-A',user_id:user.id,role:'project_owner',active:true,revoked_at:null}]:[]);
  if(rpc==='captain_read_my_appointments')return json({records:[{appointment_id:'appoint-A',project_id:project,vessel_name:'Becca Test',candidate_email:user.email,status:appointment,revoked_at:null}]});
  if(rpc==='vessel_captain_verify_access')return json({ok:authorized,project_id:project,vessel_id:'vessel-A',display_name:'Becca Test',appointment_id:'appoint-A',appointment_role:'vessel_captain',membership_role:'operator',operating_model:'operated',lifecycle_state:'active'});
  if(rpc==='vessel_captain_list_business_orders')return json({project_id:project,records:[]});
  if(rpc==='vessel_captain_read_watch_report')return json({project_id:project,has_report:false});
  if(rpc.includes('fleet_help')){calls.push({rpc,body,auth:request.headers().authorization});if(interceptHelp)await interceptHelp();return json({records:[{description:'Scoped server reply'}]});}
  return json({message:'Unexpected fixture endpoint'},403);
 });
 if(cached){
  await p.goto(origin+'/seed.html');
  await p.evaluate(async({scope,provisional})=>{
   const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('blackFlagPlatformV1',1);r.onupgradeneeded=()=>{for(const [name,k] of [['projects','id'],['settings','key'],['orders','id']])r.result.createObjectStore(name,{keyPath:k});};r.onerror=()=>reject(r.error);r.onsuccess=()=>resolve(r.result);});
   await new Promise((resolve,reject)=>{const tx=db.transaction('projects','readwrite');tx.objectStore('projects').put({id:scope,namespace:'local.'+scope,name:'Local business',ownerAccess:{enabled:true,status:'active',capabilities:['orders']}});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();
   if(provisional)sessionStorage.setItem('blackFlagOwnerSessionV1',JSON.stringify({projectId:scope,namespace:'local.'+scope,authority:'project_owner',sessionId:'LOCAL',expiresAt:new Date(Date.now()+3600000).toISOString()}));
  },{scope,provisional});
 }
 const addr=origin+'/owner.html?project='+scope+(role==='captain'?'&surface=vessel-captain':view?'&view='+view:'');
 await p.goto(addr);return {p,calls,redirects,key:keys[role]};
}
const openOwner=async p=>{await p.locator('#portal').waitFor();const entry=p.getByRole('button',{name:/Get fleet help/i}).first();assert(await entry.count(),'The authenticated business owner must have a visible Get fleet help entry');await entry.click();await p.waitForFunction(()=>window.__mounts?.length);};
async function operations(p,role){
 return p.evaluate(async({role,project})=>{const o=__mounts.at(-1).options;const allowed=role==='owner'?'owner_list_fleet_help':'vessel_captain_list_fleet_help';const tryCall=async(name,id)=>{try{await o.rpc(name,{p_project_id:id});return true;}catch{return false;}};
 return {role:o.role,id:o.projectId,projectName:o.projectName,screen:o.screen,build:o.build,active:o.isCurrent(),raw:await o.rpc(allowed,{p_project_id:project}),foreign:await tryCall(allowed,'other-vessel'),wrongOffice:await tryCall(role==='owner'?'vessel_captain_list_fleet_help':'owner_list_fleet_help',project)};},{role,project});
}
for(const role of ['owner','captain'])test(role+' workspace binds the existing account, rejects wrong scope, and retires on navigation and logout',async t=>{
 const {p,calls,key}=await fixture(t,{role});
 if(role==='owner')await openOwner(p);else{await p.locator('#captainStationSignOut').waitFor();assert(await p.evaluate(()=>!!window.__mounts?.length),'The verified appointed Captain must receive the vessel inbox');}
 const info=await operations(p,role);assert.equal(info.role,role);assert.equal(info.id,project);assert.equal(info.projectName,'Becca Test');assert(info.screen&&info.build);assert(info.active);assert.deepEqual(info.raw,{records:[{description:'Scoped server reply'}]});assert.equal(info.foreign,false);assert.equal(info.wrongOffice,false);
 assert.deepEqual(calls,[{rpc:role==='owner'?'owner_list_fleet_help':'vessel_captain_list_fleet_help',body:{p_project_id:project},auth:'Bearer fixture-'+role}]);
 const swap=await p.evaluate(key=>{const before=sessionStorage.getItem(key),s=JSON.parse(before);s.access_token='a-different-session';sessionStorage.setItem(key,JSON.stringify(s));const ok=__mounts.at(-1).options.isCurrent();sessionStorage.setItem(key,before);return ok;},key);assert.equal(swap,false,'A replaced credential invalidates the old workspace');
 if(role==='owner'){await p.getByRole('button',{name:/overview/i}).click();await p.waitForFunction(()=>__mounts[0].ended);await openOwner(p);}else{await p.locator('#captainMyVessels').click();await p.locator('#captainRosterRefresh').waitFor();assert(await p.evaluate(()=>__mounts[0].ended));await p.locator('[data-tb-assignment]').first().click();await p.locator('#captainStationSignOut').waitFor();}
 assert.equal(await p.evaluate(()=>__mounts[0].options.isCurrent()),false);
 await p.locator(role==='owner'?'#signOut':'#captainStationSignOut').click();assert(await p.evaluate(()=>__mounts.every(x=>x.ended&&!x.options.isCurrent())));
 assert.equal(await p.evaluate(async({role,project})=>{try{await __mounts.at(-1).options.rpc(role==='owner'?'owner_list_fleet_help':'vessel_captain_list_fleet_help',{p_project_id:project});return false;}catch{return true;}},{role,project}),true);assert.equal(calls.length,1);
});
test('owner can reload Fleet Help only after a new complete membership check',async t=>{
 const {p}=await fixture(t,{view:'fleet-help'});await p.locator('#portal').waitFor();await p.waitForFunction(()=>window.__mounts?.length);assert.equal(await p.evaluate(()=>__mounts[0].options.isCurrent()),true);await p.reload();await p.waitForFunction(()=>window.__mounts?.length);assert.equal(await p.evaluate(()=>__mounts[0].options.isCurrent()),true);
});
for(const scenario of [{role:'owner',authenticated:false},{role:'owner',authorized:false},{role:'captain',authenticated:false},{role:'captain',authorized:false},{role:'captain',appointment:'pending'}])test('no fleet help before authority: '+JSON.stringify(scenario),async t=>{
 const {p,calls}=await fixture(t,scenario);const marker=scenario.role==='owner'?'#login':scenario.authenticated===false?'#captainLoginForm':scenario.appointment==='pending'?'#captainPendingStatus':'#captainStationRecheck';await p.locator(marker).waitFor();assert.equal(await p.evaluate(()=>window.__mounts?.length||0),0);assert.equal(await p.getByRole('button',{name:/get fleet help/i}).count(),0);assert.equal(calls.length,0);
});

test('a provisional local business owner has no fleet help entry',async t=>{
 const {p,calls}=await fixture(t,{cached:true,provisional:true,authenticated:false,view:'fleet-help'});await p.locator('#portal').waitFor();assert.equal(await p.getByRole('button',{name:/get fleet help/i}).count(),0);assert.equal(calls.length,0);
});
test('converting the owner receipt to local-only retires the live binding even on a cached non-core business',async t=>{
 const {p}=await fixture(t,{cached:true});await openOwner(p);const current=await p.evaluate(()=>{const key='blackFlagOwnerSessionV1',s=JSON.parse(sessionStorage.getItem(key));s.identityProvider='local';s.namespace='local.fixture-business';s.sessionId='LOCAL';sessionStorage.setItem(key,JSON.stringify(s));return __mounts[0].options.isCurrent();});assert.equal(current,false,'Local receipt must not inherit prior server membership');
});

test('global owner entry captures the originating tool and discards its pending reply after leaving',async t=>{
 let release,started;const held=new Promise(resolve=>{release=resolve;}),startedReading=new Promise(resolve=>{started=resolve;});
 const {p}=await fixture(t,{interceptHelp:()=>{started();return held;}});await p.locator('#portal').waitFor();
 await p.locator('[data-owner-online="settings"]').click();await p.waitForURL(/view=settings/);await openOwner(p);
 assert.equal(await p.evaluate(()=>__mounts.at(-1).options.screen),'Owner Bridge · Settings');
 await p.evaluate(project=>{const {rpc}=__mounts.at(-1).options;window.__reply=rpc('owner_list_fleet_help',{p_project_id:project}).then(()=>true,()=>false);},project);
 await startedReading;await p.getByRole('button',{name:/overview/i}).click();release();assert.equal(await p.evaluate(()=>__reply),false);
});
test('Captain lease immediately rejects a changed project route even before a repaint',async t=>{
 const {p,calls}=await fixture(t,{role:'captain'});await p.locator('#captainStationSignOut').waitFor();
 const result=await p.evaluate(async project=>{const o=__mounts[0].options;history.replaceState({},'','?surface=vessel-captain&project=other-vessel');const current=o.isCurrent();try{await o.rpc('vessel_captain_list_fleet_help',{p_project_id:project});return {current,sent:true};}catch{return {current,sent:false};}},project);
 assert.deepEqual(result,{current:false,sent:false});assert.equal(calls.length,0);
});

for(const needsSetup of [false,true])test('signed-out deep link resumes after verified '+(needsSetup?'password setup':'password sign-in'),async t=>{
 const {p}=await fixture(t,{authenticated:false,view:'fleet-help',needsSetup});
 await p.locator('#loginUser').fill(user.email);await p.locator('#loginPass').fill('fixture-password-only');await p.locator('#signIn').click();
 if(needsSetup){
  await p.locator('#passwordSetup').waitFor();assert.equal(await p.evaluate(()=>__mounts.length),0);
  await p.locator('#newPassword').fill('new-fixture-password');await p.locator('#confirmPassword').fill('new-fixture-password');await p.locator('#savePassword').click();
 }
 await p.locator('#portal').waitFor();await p.waitForFunction(()=>window.__mounts.length===1);
 assert.equal(await p.evaluate(()=>__mounts[0].options.isCurrent()),true);
 assert.equal(new URL(p.url()).searchParams.get('view'),'fleet-help');
});
test('email-link redirect preserves only an unambiguous fleet-help view for this business',async t=>{
 for(const [input,expected] of [['fleet-help','fleet-help'],['fleet-help&view=portal','portal'],['fleet-help&project=unrelated','portal'],['https://elsewhere.invalid','portal']]){
  const {p,redirects}=await fixture(t,{authenticated:false,view:input});
  await p.locator('#loginUser').fill(user.email);
  await p.locator('#sendMagicLink').click();await p.waitForFunction(()=>document.getElementById('loginError').textContent.includes('sent.'));
  const backlink=new URL(redirects[0]);assert.equal(backlink.origin,origin);assert.equal(backlink.pathname,'/owner.html');assert.equal(backlink.searchParams.get('project'),project);assert.equal(backlink.searchParams.get('view'),expected);
  if(expected==='fleet-help'){
   backlink.hash='access_token=fixture-link&expires_in=3600&type=magiclink';
   await p.goto('about:blank');await p.goto(backlink.toString());await p.waitForFunction(()=>window.__mounts.length===1);assert.equal(await p.evaluate(()=>__mounts[0].options.isCurrent()),true);
  }
 }
});

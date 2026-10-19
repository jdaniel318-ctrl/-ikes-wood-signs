"""Shipped Workstations markup/CSS + actual app functions; synthetic service boundaries.
No user database, server authorization, or native Safari certification. Usage: RELEASE OUT.
"""
from pathlib import Path
import sys,json,re,base64,shutil,traceback
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]).resolve();out=Path(sys.argv[2]).resolve();out.mkdir(parents=True,exist_ok=True)
src=(root/'app.js').read_text();results=[]
def extract(n):
 m=re.search(r'^  (?:async )?function '+re.escape(n)+r'\(',src,re.M)
 assert m,'missing actual function '+n
 end=src.index('\n  }',m.start())+4
 return src[m.start():end]
names=['dockTraceProtectedIds868','dockTraceStage868','fleetDockMatches','fleetDockPriority','collectDockSourceTrace868','dockTraceShortId868','dockSourceTraceHtml868','noteFleetStorageFailure8838','renderFleetStorageNotice8838','bindFleetDockControls8838','renderFleetCommissioning','projectBrandVisual']
functions='\n'.join(extract(n) for n in names)
doc=BeautifulSoup((root/'index.html').read_text(),'html.parser');dock=str(doc.find(id='fleetCommissioningDock'))
logo='data:image/png;base64,'+base64.b64encode((root/'ike_character.png').read_bytes()).decode()
with sync_playwright() as w:
 browser=w.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 def setup(width=1024,height=640):
  p=browser.new_page(viewport={'width':width,'height':height});p.set_default_timeout(4500);p.route('**/*',lambda r:r.abort());errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  p.set_content('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body class="engine-mode engine-dock-open"><div id="app" class="app-shell"><section id="enginePanel" class="engine-panel modern-engine-room black-flag-engine-shell">'+dock+'</section></div></body></html>')
  p.add_style_tag(content=(root/'styles.css').read_text());p.add_style_tag(content=(root/'fleet_viewport.css').read_text());p.evaluate((root/'fleet_viewport.js').read_text())
  pre=r'''(logo)=>{
    const BUILD_VERSION='8.8.20.38',STORE_PROJECTS='projects',V4_ADMISSION_LEDGER_SETTING='admission';
    let fleetDockFilter='all',fleetDockSearch='',fleetDockRenderEpoch8838=0;
    const RELEASE_CANONICAL_FLEET_IDS_864=['beccas-bloom-shop','bf-p-f92f87e8ec44','bor-north-richmond','grizzly-bear','ikes-wood-signs','mugshot-after-dark'];
    let companies=[...RELEASE_CANONICAL_FLEET_IDS_864,'househull'].map((id,i)=>({id,name:["Becca's Bloom Shop",'Legacy Plumbing','Signal Restoration','Grizzly Bear',"Ike's Wood Signs",'Mugs After Dark','HouseHull'][i],projectCode:['BBS','LP','SIG','GRZ','IKE','MUG','HHL'][i],publish:{status:i===4?'live':'staging'},ownerAccess:{enabled:i===4||i===1,status:'configured'},trial:false}));
    window.testCalls=[];window.testProofs=0;window.testStorageWrites=0;window.testMissing='';window.testDelay=0;
    const initial=JSON.stringify(companies);window.testOriginal=initial;
    const $=id=>document.getElementById(id),$$=sel=>[...document.querySelectorAll(sel)],canonicalProjectId=id=>String(id||'');
    const escapeHtml=s=>String(s??'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
    const normalizeBusinessIdentityText=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
    const projectById=id=>companies.find(p=>p.id===id),projects=()=>companies;
    const ensureProjectGovernance=p=>p,migrateLegacyDeployment=p=>p.trial?[{state:'sea_trial'}]:[],commissioningSnapshot=p=>({ready:false,commissioned:false,total:6,passed:2}),fleetStableCallsign=p=>p.projectCode;
    const readProjectAssets=async(id)=>{if(window.logoDelay)await new Promise(r=>setTimeout(r,window.logoDelay));return id==='ikes-wood-signs'?{projectLogo:logo}:{};};
    const resolverRead869=async(n,f)=>f(),resolverLifelineHtml869=()=>'<p>Prior timing observations, not a new repair.</p>';
    const getAll=async()=>{const ms=window.testDelay;window.testDelay=0;if(ms)await new Promise(r=>setTimeout(r,ms));return structuredClone(companies.filter(p=>p.id!==window.testMissing));};
    const getSetting=async(k)=>k==='companies'?{value:structuredClone(companies)}:{value:{}};
    const readV4AdmissionLedger=()=>Object.fromEntries(companies.map(p=>[p.id,{admitted:true}])),readV4FleetManifest=()=>companies.map(p=>p.id),validV4Admission=()=>true;
    const renderFleetMissionControl=()=>window.testCalls.push(['mission-read']),awaitMemoryRosterReady8612=async()=>true,convergeCanonicalFleetForPresentation=async()=>window.testCalls.push(['converge']),commandDeadline=async p=>p;
    const recordDockProof8610=()=>{window.testProofs++;},proofBarrierAdvance8611=()=>{};
    const showFleetActionStatus=(...a)=>window.testCalls.push(['status',...a]);
    const openExperienceTestDeck=async id=>{window.testCalls.push(['preview',id]);if(window.routeWait)await new Promise(r=>setTimeout(r,window.routeWait));};
    const openProjectEngineControl=async id=>window.testCalls.push(['control',id]),renderProjectTab=async(id,tab)=>window.testCalls.push(['tab',id,tab]);
    const openFleetDockCustomerExperience=async p=>window.testCalls.push(['customer',p.id]),armOwnerRoute=id=>window.testCalls.push(['arm-owner',id]),ownerPartnerEntryLink=id=>'owner.html?project='+encodeURIComponent(id);
    const location={set href(v){window.testCalls.push(['location',v]);}};
    document.addEventListener('click',async e=>{const target=e.target.closest('[data-open-project-control]');if(target)await openProjectEngineControl(target.dataset.openProjectControl);});
  '''
  post=r'''
    window.wf={render:()=>renderFleetCommissioning({skipConvergence:true,viewOnly:true}),query:async(q,f='all')=>{fleetDockSearch=q;fleetDockFilter=f;await renderFleetCommissioning({skipConvergence:true,viewOnly:true});},rows:()=>JSON.stringify(companies),mutateName:(n)=>companies.find(p=>p.id==='ikes-wood-signs').name=n,warning:()=>noteFleetStorageFailure8838('Envelope projection write','localStorage/envelopes',Object.assign(Error('Quota exceeded'),{name:'QuotaExceededError'}))};
    return window.wf.render();
  }'''
  p.evaluate(pre+functions+post,logo)
  p.evaluate("document.documentElement.classList.remove('dark-sky-release-preflight','dark-sky-route-preflight');document.body.classList.remove('boot-locked')")
  return p,errors
 def run(name,fn):
  try:fn();results.append({'name':name,'pass':True});print('PASS',name,flush=True)
  except Exception as e:traceback.print_exc();results.append({'name':name,'pass':False,'error':str(e)});print('FAIL',name,str(e)[:220],flush=True)
 def wait(p):p.wait_for_function("document.getElementById('fleetCommissioningFleet').getAttribute('aria-busy')!=='true'")
 def snapshot(p):return p.evaluate('wf.rows()')
 def happy():
  p,err=setup()
  try:
   assert p.locator('.fleet-dock-card').count()==7
   p.locator('#fleetDockSearch').fill('Ike');wait(p)
   assert p.locator('.fleet-dock-card').count()==1
   assert p.locator('.fleet-dock-card').get_attribute('data-project-id')=='ikes-wood-signs'
   assert '1 vessel shown · 7 loaded' in p.locator('#fleetDockResultCount').inner_text()
   assert p.locator('#fleetDockClearSearch').is_visible()
   assert p.locator('[data-fleet-dock-action="preview"]').is_visible()
   assert not p.evaluate('testCalls.length||testProofs||testStorageWrites'),p.evaluate('testCalls')
   assert snapshot(p)==p.evaluate('testOriginal');assert not err,err
  finally:p.close()
 run('actual filtered renderer shows Ike; no writes, convergence, or proof publisher',happy)
 def empty():
  p,e=setup()
  try:
   p.locator('#fleetDockSearch').fill('zzzz');wait(p)
   assert p.locator('.fleet-dock-card').count()==0
   assert p.locator('[data-fleet-dock-reset]').is_visible()
   assert not p.locator('.wayfinder-source-hold').count()
   p.locator('[data-fleet-dock-reset]').click();wait(p)
   assert p.locator('.fleet-dock-card').count()==7
   assert p.locator('#fleetDockSearch').input_value()==''
  finally:p.close()
 run('empty results and clear-view recover ordinary complete list',empty)
 def clear():
  p,e=setup()
  try:
   p.locator('#fleetDockSearch').fill('Ike');wait(p);p.locator('#fleetDockClearSearch').click();wait(p)
   assert p.locator('.fleet-dock-card').count()==7
   assert p.locator('#fleetDockSearch').evaluate('(e)=>document.activeElement===e')
  finally:p.close()
 run('clear-search remains available and keyboard focus retained',clear)
 def lifecycle():
  p,e=setup()
  try:
   for f,n in [('live',1),('staging',6),('attention',7),('all',7)]:
    p.locator('[data-fleet-dock-filter="'+f+'"]').click();wait(p);assert p.locator('.fleet-dock-card').count()==n,(f,p.locator('body').inner_text())
   assert p.evaluate('testProofs')==0
  finally:p.close()
 run('all lifecycle filter subsets render without false full-roster alarm',lifecycle)
 def missing():
  p,e=setup()
  try:
   p.evaluate("window.testMissing='bf-p-f92f87e8ec44';wf.query('Ike')")
   assert p.locator('.wayfinder-source-hold').count()==1
   assert p.locator('[data-fleet-dock-action]').count()==0
   assert p.locator('#fleetDockClearSearch').is_visible()
   p.evaluate("window.testMissing='';wf.query('Ike')")
   assert p.locator('.fleet-dock-card').count()==1
  finally:p.close()
 run('real source omission holds and same controls remain usable after source recovery',missing)
 def dropped():
  p,e=setup()
  try:
   p.evaluate("""const d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');Object.defineProperty(document.getElementById('fleetCommissioningFleet'),'innerHTML',{get(){return d.get.call(this)},set(v){d.set.call(this,v);this.querySelector('[data-project-id="househull"]')?.remove();}});""")
   p.evaluate("wf.query('HouseHull')")
   assert p.locator('.wayfinder-source-hold').count()==1
   assert p.evaluate("__darkSkyDockSourceTrace868.firstDrop")=='Rendered Fleet Dock cards'
   assert p.locator('[data-fleet-dock-action]').count()==0
  finally:p.close()
 run('post-render expected-card guard catches missing newer non-protected vessel',dropped)
 def race():
  p,e=setup()
  try:
   p.evaluate("async()=>{testDelay=170;const old=wf.query('Ike');await new Promise(r=>setTimeout(r,10));const newer=wf.query('Legacy');await Promise.all([old,newer]);}")
   assert p.locator('.fleet-dock-card').get_attribute('data-project-id')=='bf-p-f92f87e8ec44'
   assert 'Legacy' in p.locator('#fleetDockResultCount').inner_text()
   assert p.evaluate('__darkSkyDockSourceTrace868.view.search')=='Legacy'
   assert not p.locator('#fleetCommissioningFleet').evaluate('e=>e.inert')
   assert not e,e
  finally:p.close()
 run('slow older search cannot overwrite newer cards, controls, or trace',race)
 def stale():
  p,e=setup()
  try:
   p.evaluate("wf.query('Ike')");p.evaluate("window.staleButton=document.querySelector('[data-fleet-dock-action=preview]');testDelay=150;window.nextView=wf.query('Legacy');staleButton.click()")
   p.evaluate('nextView')
   assert not p.evaluate("testCalls.some(c=>c[0]==='preview')")
  finally:p.close()
 run('stale route button does not route after newer view starts',stale)
 def route():
  p,e=setup()
  try:
   p.evaluate("wf.query('Ike')")
   p.locator('[data-fleet-dock-action=preview]').click()
   p.locator('[data-fleet-dock-action=owner]').click()
   p.locator('[data-open-project-control]').click()
   p.locator('.wayfinder-customer-route summary').click();p.locator('[data-fleet-dock-action=customer]').click()
   c=p.evaluate('testCalls');assert ['preview','ikes-wood-signs'] in c;assert ['arm-owner','ikes-wood-signs'] in c;assert ['location','owner.html?project=ikes-wood-signs'] in c;assert ['control','ikes-wood-signs'] in c;assert ['customer','ikes-wood-signs'] in c
   assert not e,e
  finally:p.close()
 run('four existing route interfaces receive exact selected identity, not another business',route)
 def setup_owner():
  p,e=setup()
  try:
   p.evaluate("wf.query('HouseHull')");p.locator('[data-fleet-dock-action=owner]').click()
   assert ['tab','househull','owner'] in p.evaluate('testCalls')
   assert not p.evaluate("testCalls.some(c=>c[0]==='arm-owner'||c[0]==='location')")
   assert 'Not checked here' in p.locator('.wayfinder-not-checked').inner_text()
  finally:p.close()
 run('unconfigured owner route keeps setup path; local status does not grant access',setup_owner)
 def double():
  p,e=setup()
  try:
   p.evaluate("wf.query('Ike')");p.evaluate("routeWait=150;let b=document.querySelector('[data-fleet-dock-action=preview]');b.click();b.click();")
   p.wait_for_timeout(200)
   assert p.evaluate("testCalls.filter(c=>c[0]==='preview').length")==1
  finally:p.close()
 run('double-tap preview is single route operation while pending',double)
 def quota():
  p,e=setup()
  try:
   p.evaluate("wf.warning();wf.query('Ike')")
   assert p.locator('.fleet-dock-card').count()==1
   assert p.locator('#fleetDockStorageNotice').is_visible()
   p.locator('#fleetDockStorageNotice summary').click()
   assert 'localStorage/envelopes' in p.locator('#fleetDockStorageNotice').inner_text()
   assert p.evaluate('testStorageWrites')==0
   assert snapshot(p)==p.evaluate('testOriginal')
   p.screenshot(path=str(out/'quota-separate-warning.png'),full_page=True)
  finally:p.close()
 run('storage warning stays visible and independent of healthy search; no cleanup action',quota)
 def injection():
  p,e=setup()
  try:
   p.evaluate("wf.mutateName('<img src=x onerror=window.PWNED=true>');wf.query('ikes-wood-signs')")
   assert not p.evaluate('!!window.PWNED')
   assert '<img' in p.locator('.wayfinder-vessel-identity strong').inner_text()
   assert not e,e
  finally:p.close()
 run('vessel display text escaped with no injected elements',injection)
 def layout(width,height):
  p,e=setup(width,height)
  try:
   p.evaluate("wf.query('Ike')");p.wait_for_timeout(80)
   assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'horizontal overflow'
   for sel in ['#fleetDockSearch','#fleetDockClearSearch','[data-fleet-dock-action=preview]','[data-fleet-dock-action=owner]','[data-open-project-control]']:
    b=p.locator(sel).bounding_box();assert b and b['height']>=44,(sel,b)
   if width>=1000:
    b=p.locator('[data-open-project-control]').bounding_box();assert b['y']+b['height']<=height,(width,height,b)
   assert p.locator('#fleetCommissioningDock h3').bounding_box()['y']>=0
   p.screenshot(path=str(out/f'compass-ike-{width}-{height}.png'),full_page=True)
   assert not e,e
  finally:p.close()
 for wh in [(1024,640),(1024,768),(1366,900),(768,900),(390,700),(430,800)]:run(f'focused layout {wh[0]}x{wh[1]}',lambda wh=wh:layout(*wh))
 def larger():
  p,e=setup(390,450)
  try:
   p.evaluate("wf.query('Ike')")
   p.add_style_tag(content='#fleetCommissioningDock{font-size:150%} #fleetCommissioningDock button strong{font-size:25px!important} #fleetCommissioningDock p,#fleetCommissioningDock input{font-size:24px!important}')
   assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   p.locator('[data-open-project-control]').scroll_into_view_if_needed();assert p.locator('[data-open-project-control]').is_visible()
  finally:p.close()
 run('narrow keyboard-height and enlarged text permit scrolling without hidden actions',larger)
 def no_scroll():
  p,e=setup(1024,640)
  try:
   p.evaluate("wf.query('Ike')");p.evaluate("document.body.insertAdjacentHTML('beforeend','<div style=height:1800px></div>');scrollTo(0,100)")
   p.evaluate("wf.query('Ike ')")
   assert abs(p.evaluate('scrollY')-100)<2
  finally:p.close()
 run('typing does not force scroll-to-top or reset input',no_scroll)
 def allshot():
  p,e=setup(1366,900)
  try:p.screenshot(path=str(out/'compass-all-vessels.png'),full_page=True)
  finally:p.close()
 allshot();browser.close()
(out/'results.json').write_text(json.dumps(results,indent=2));print('TOTAL',len(results),'PASS',sum(x['pass'] for x in results));sys.exit(0 if all(x['pass'] for x in results) else 1)

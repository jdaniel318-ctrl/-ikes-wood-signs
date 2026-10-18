"""Actual owner.html startup/handlers in isolated DOM with memory IndexedDB-shaped fixture and synthetic auth/GET responses.
Local HTTP navigation is blocked by the environment. Assets are embedded for visual tests. No live network requests; mutation counts checked on the fixture store.
python VERIFY_WORKHORSE_UI.py RELEASE_DIR RESULTS_DIR [--red]
"""
from pathlib import Path
import sys,json,threading,http.server,functools,shutil,base64,traceback
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]).resolve();out=Path(sys.argv[2]).resolve();out.mkdir(parents=True,exist_ok=True)
red='--red' in sys.argv
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
PID='ikes-wood-signs';results=[]
SESSION_JS="""window.DarkSkySupabase={create:()=>{const s={access_token:'LOCAL-FIXTURE-NOT-A-REAL-TOKEN',expires_at:Date.now()+7200000};const user={id:'owner-fixture',email:'owner-fixture@example.invalid',user_metadata:{dark_sky_owner_password_set:true}};return {headers:()=>({}),readSession:()=>s,currentSession:async()=>s,user:async()=>user,saveSession:()=>s,clearSession:()=>{},signOut:async()=>{}};}};"""
def project(pid=PID,name="Ike’s Wood Signs"):
 return {'id':pid,'name':name,'namespace':'bf.project.'+pid,'projectCode':'IKE' if pid==PID else 'SVC','ownerAccess':{'enabled':True,'status':'active','identityProvider':'supabase','capabilities':['orders','pricing','branding','notifications'],'credential':{'testMode':False,'login':'fixture','passwordHash':'fixture-not-real'}},'referenceLibrary':[],'branding':{},'customization':{},'notifications':{}}
def orders(pid=PID):
 a=[]
 for i in range(16):
  a.append({'id':'TEST-'+str(i+1).zfill(3),'projectId':pid,'namespace':'bf.project.'+pid,'wording':'Smoke Hole' if i<4 else 'Sample Sign '+str(i),'customerName':'Sample Customer '+str(i+1),'status':['New','In Production','Ready for Pickup','Picked Up'][i%4],'createdAt':f'2026-10-{i+1:02}T10:00:00Z','price':None if i==4 else 65,'testMode':True,'font':'B','fill':'Black','customerEmail':'sample@example.invalid','customerPhone':'000-000-0000','pricingProof':{'speciesName':'Cedar','lengthFeet':2,'ratePerFoot':9,'ownerVisualVerificationRequired':i==0}})
 a[0]['wording']='  Smoke  Hole!  '
 a[1]['wording']='  Smoke  Hole!  '
 a[0]['notes']='<img src=x onerror="window.__injected=true">'
 a[0]['approvedPreviewData']='javascript:alert(1)'
 a[1]['approvedDesignLock']={'wording':'Other wording','price':99}
 a.append({'id':'FOREIGN-1','projectId':'beccas-bloom-shop','wording':'FOREIGN PROTECTED TEXT','status':'New','price':100})
 a.append({'id':'CONFLICT-1','projectId':pid,'namespace':'bf.project.other','wording':'CONFLICTING IDENTITY','status':'New'})
 return a
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 def setup(width=1024,height=768,pid=PID,name="Ike’s Wood Signs",allow=True,fail_orders=False,fail_saves=False,save_delay=0):
  ctx=browser.new_context(viewport={'width':width,'height':height});p=ctx.new_page();p.set_default_timeout(4500);errors=[];writes=[]
  p.on('pageerror',lambda e:errors.append(str(e)))
  def route(r):
   url=r.request.url
   if url.endswith('/fixture'):
    return r.fulfill(status=200,body='<html><body>Fixture initialization</body></html>',content_type='text/html')
   if '/fleet_supabase.js' in url:return r.fulfill(status=200,body=SESSION_JS,content_type='application/javascript')
   if '.supabase.co/' in url:
    if r.request.method!='GET':writes.append({'url':url,'method':r.request.method});return r.fulfill(status=403,body='{}',content_type='application/json')
    if '/fleet_vessels?' in url:return r.fulfill(json=[{'id':'vessel-fixture','project_id':pid,'namespace':'bf.project.'+pid,'display_name':name,'owner_state':'owner_assigned'}] if allow else [])
    if '/fleet_memberships?' in url:return r.fulfill(json=[{'id':'member-fixture','vessel_id':'vessel-fixture','user_id':'owner-fixture','role':'project_owner','active':True,'revoked_at':None}] if allow else [])
    return r.fulfill(json=[])
   if url.startswith(base):return r.continue_()
   return r.abort()
  p.route('**/*',lambda r:r.abort())
  fixture={'project':project(pid,name),'orders':orders(pid),'settings':{'businessConfig:'+pid:{'ikeSpeciesRates':[{'id':k,'name':n,'rate':r,'enabled':True} for k,n,r in [('pine','Pine',7),('cedar','Cedar',9),('red-oak','Red Oak',12),('white-oak','White Oak',15),('walnut','Walnut',18),('hickory','Hickory',14)]]}}}
  from bs4 import BeautifulSoup
  doc=BeautifulSoup((root/'owner.html').read_text(),'html.parser')
  scripts=[x.string or x.get_text() for x in doc.find_all('script') if not x.get('src')]
  for x in doc.find_all('script'):x.decompose()
  for x in doc.find_all('link',rel='stylesheet'):x.decompose()
  p.set_content(str(doc))
  if (root/'business_deck.css').exists():p.add_style_tag(content=(root/'business_deck.css').read_text())
  p.add_style_tag(content=(root/'fleet_viewport.css').read_text())
  p.evaluate((root/'fleet_viewport.js').read_text())
  p.evaluate((root/'headway_contracts.js').read_text())
  p.evaluate(SESSION_JS)
  if (root/'input_hygiene.js').exists():p.evaluate((root/'input_hygiene.js').read_text())
  if (root/'business_deck.js').exists():p.evaluate((root/'business_deck.js').read_text())
  env=r"""(data)=>{
   window.fixtureWrites=[];
   window.fixtureStore={projects:[structuredClone(data.fixture.project)],orders:structuredClone(data.fixture.orders),settings:Object.entries(data.fixture.settings).map(([key,value])=>({key,value}))};
   const store=window.fixtureStore,session={};window.fixtureSession=session;
   const sessionStorage={getItem:k=>session[k]||null,setItem:(k,v)=>{session[k]=String(v)},removeItem:k=>{delete session[k]}};
   const localStorage={getItem:()=>null,setItem:()=>{throw Error('unexpected localStorage write')}};
   const location={search:'?project='+data.pid+'&view=portal&source=engine',href:'https://workhorse-fixture.invalid/owner.html?project='+data.pid+'&view=portal&source=engine',hash:'',pathname:'/owner.html',replace:()=>{},reload:()=>{}};
   const history={replaceState:()=>{},state:null};
   const response=(value,delay=0)=>{const r={result:structuredClone(value)};setTimeout(()=>r.onsuccess?.(),delay);return r;};
   const db={transaction:(name,mode)=>({objectStore:()=>({get:key=>response(store[name]?.find(x=>(x.id||x.key)===key)),getAll:()=>{if(name==='orders'&&data.fail_orders){const q={error:new Error('fixture unavailable order store')};setTimeout(()=>q.onerror?.(),0);return q;}return response(store[name]||[])},put:row=>{if(mode!=='readwrite')throw Error('unexpected readonly put');window.fixtureWrites.push({store:name,row:structuredClone(row)});if(data.fail_saves){const q={error:new Error('fixture quota failure')};setTimeout(()=>q.onerror?.(),0);return q;}const key=row.id||row.key,i=store[name].findIndex(x=>(x.id||x.key)===key);if(i<0)store[name].push(structuredClone(row));else store[name][i]=structuredClone(row);return response(key,data.save_delay||0)}})})};
   const indexedDB={open:()=>{const r={result:db};setTimeout(()=>r.onsuccess?.(),0);return r;}};
   const fetch=async(url,opts={})=>{
     if((opts.method||'GET')!=='GET'){window.fixtureWrites.push({method:opts.method,url});return {ok:false,status:403,json:async()=>({})};}
     if(url.includes('/fleet_vessels?'))return {ok:true,json:async()=>data.allow?[{id:'vessel-fixture',project_id:data.pid,namespace:'bf.project.'+data.pid,display_name:data.name,owner_state:'owner_assigned'}]:[]};
     if(url.includes('/fleet_memberships?'))return {ok:true,json:async()=>data.allow?[{id:'member-fixture',vessel_id:'vessel-fixture',user_id:'owner-fixture',role:'project_owner',active:true,revoked_at:null}]:[]};
     return {ok:true,json:async()=>[]};
   };
  """
  p.evaluate(env+'\n'.join(scripts)+'}',{'fixture':fixture,'pid':pid,'name':name,'allow':allow,'fail_orders':fail_orders,'fail_saves':fail_saves,'save_delay':save_delay})
  try:p.wait_for_selector('#portal:not(.hidden)' if allow else '#login:not(.hidden)')
  except Exception:
   print('STARTUP STATE',p.locator('body').inner_text(),errors,flush=True);raise
  # Test-only image resolution: release image bytes, no remote fetch.
  assets={n:'data:image/'+('png' if n.endswith('.png') else 'jpeg')+';base64,'+base64.b64encode((root/n).read_bytes()).decode() for n in ['ike_character.png','ike_style_a_ramjet_reference.jpg','ike_style_b_smoke_hole_reference.jpg','signal_restoration_logo.png'] if (root/n).exists()}
  p.evaluate("assets=>{const repair=()=>{document.querySelectorAll('img').forEach(e=>{const s=e.getAttribute('src');if(assets[s])e.src=assets[s];})};new MutationObserver(repair).observe(document.body,{childList:true,subtree:true});repair();}",assets)
  return p,ctx,errors,writes,fixture
 def snapshot(p):
  return p.evaluate('window.fixtureStore')

 def run(name,fn):
  try:fn();results.append({'name':name,'pass':True});print('PASS',name,flush=True)
  except Exception as e:traceback.print_exc();results.append({'name':name,'pass':False,'error':str(e)});print('FAIL',name,str(e)[:180],flush=True)
 def home():
  p,c,e,w,f=setup()
  try:
   assert p.locator('[data-bd-home]').count()==1,'Task-focused home is missing'
   assert p.locator('#businessDeckNav [data-owner-nav="orders"]').count()==1,'Business navigation is missing'
   assert p.locator('[data-home-tab="new"] strong').inner_text()=='4'
   assert p.locator('[data-home-tab="inprogress"] strong').inner_text()=='4'
   assert p.locator('[data-home-tab="ready"] strong').inner_text()=='4'
   assert p.locator('[data-home-tab="closed"] strong').inner_text()=='4'
   assert 'FOREIGN PROTECTED TEXT' not in p.locator('#portal').inner_text()
   assert 'CONFLICTING IDENTITY' not in p.locator('#portal').inner_text()
   assert not p.evaluate('window.fixtureWrites') and not e,(p.evaluate('window.fixtureWrites'),e)
   p.screenshot(path=str(out/'owner-home-1024.png'),full_page=True)
  finally:c.close()
 run('actual authenticated owner startup shows scoped task home',home)
 def summary_detail():
  p,c,e,w,f=setup()
  try:
   if red:p.locator('[data-module="orders"]').click()
   else:p.locator('[data-home-tab="active"]').first.click()
   p.wait_for_timeout(250)
   assert p.locator('#bdOrderSearch').count()==1,'Searchable actionable order queue is missing'
   before=snapshot(p)
   p.locator('#bdOrderSearch').fill('TEST-001')
   p.locator('[data-open-order]').click();p.wait_for_selector('#bdOrderDetail')
   assert p.locator('.bd-exact').inner_text()=='  Smoke  Hole!  '
   assert 'visual length check' in p.locator('#bdOrderDetail').inner_text()
   assert '<img src=x' in p.locator('.bd-notes').inner_text()
   assert p.locator('#bdOrderDetail img').count()==0
   assert p.evaluate('window.__injected') is None
   p.locator('#bdBackOrders').click();p.wait_for_selector('#bdOrderSearch')
   assert p.locator('#bdOrderSearch').input_value()=='TEST-001'
   assert snapshot(p)==before,'Read-only navigation rewrote the fixture'
   assert not p.evaluate('window.fixtureWrites') and not e,(p.evaluate('window.fixtureWrites'),e)
  finally:c.close()
 run('order details are actionable, exact-worded, scoped and read-only',summary_detail)
 if not red:
  def queue():
   p,c,e,w,f=setup()
   try:
    p.locator('[data-home-tab="active"]').first.click();p.wait_for_selector('#bdOrderSearch')
    assert p.locator('.bd-order-card').count()==6
    p.locator('#bdNext').click();assert 'Page 2' in p.locator('#bdPage').inner_text()
    p.locator('[data-order-tab="closed"]').click();assert p.locator('.bd-order-card').count()==4
    p.locator('#bdOrderSearch').fill('  no such record  ');assert 'No matching orders' in p.locator('#bdOrderRows').inner_text()
    p.locator('#bdOrderSearch').fill('');p.locator('[data-order-tab="all"]').click();p.locator('#bdOrderSort').select_option('newest')
    assert 'TEST-016' in p.locator('.bd-order-card').first.inner_text()
    assert not p.evaluate('window.fixtureWrites') and not e,(p.evaluate('window.fixtureWrites'),e)
    p.screenshot(path=str(out/'orders-1024.png'),full_page=True)
   finally:c.close()
  run('search, status groups, six-record pages and sorting work',queue)
  def missing():
   p,c,e,w,f=setup()
   try:
    p.locator('[data-home-tab="active"]').first.click();p.wait_for_selector('#bdOrderSearch');p.locator('#bdOrderSearch').fill('TEST-005');p.locator('[data-open-order]').click();p.wait_for_selector('#bdOrderDetail')
    t=p.locator('#bdOrderDetail').inner_text();assert 'Not recorded on this order' in t;assert 'Not recorded' in t
    assert '$0.00' not in t,'Missing price was invented as zero'
    p.locator('#bdBackOrders').click();p.wait_for_selector('#bdOrderSearch');p.locator('#bdOrderSearch').fill('TEST-002');p.locator('[data-open-order]').click();p.wait_for_selector('#bdOrderDetail')
    t=p.locator('#bdOrderDetail').inner_text();assert 'wording differs' in t and 'order price differs' in t
    assert not p.evaluate('window.fixtureWrites') and not e,(p.evaluate('window.fixtureWrites'),e)
    p.screenshot(path=str(out/'order-detail-1024.png'),full_page=True)
   finally:c.close()
  run('missing price/payment and conflicting approval remain explicit',missing)
  def prices():
   p,c,e,w,f=setup()
   try:
    before=snapshot(p);p.locator('[data-deck-module="pricing"]').click();p.wait_for_selector('#bdCalcSpecies')
    p.locator('#bdCalcSpecies').select_option('cedar');p.locator('#bdCalcLength').fill('24');p.locator('#bdCalcUnit').select_option('in')
    assert '$9.00 × 2 ft = $18.00' in p.locator('#bdCalcResult').inner_text()
    p.locator('[data-enabled="cedar"]').uncheck();assert 'inactive' in p.locator('#bdCalcResult').inner_text()
    assert 'Unsaved' in p.locator('#savePricingState').inner_text(),'Edited rates are falsely labelled as unchanged'
    assert snapshot(p)==before,'Calculation or checkbox auto-saved settings'
    assert p.locator('[data-rate="pine"]').get_attribute('aria-label')=='Pine dollars per linear foot'
    assert not p.evaluate('window.fixtureWrites') and not e,(p.evaluate('window.fixtureWrites'),e)
    p.screenshot(path=str(out/'pricing-1024.png'),full_page=True)
   finally:c.close()
  run('price arithmetic uses inches/feet, labels units, never auto-saves',prices)
  def lettering():
   p,c,e,w,f=setup()
   try:
    before=snapshot(p);p.locator('[data-deck-module="references"]').click();p.wait_for_selector('#bdCheckWording')
    assert not p.locator('#bdAdvancedStyles').evaluate('(e)=>e.open')
    assert p.locator('.bd-style-card').count()==2
    p.locator('#bdCheckWording').fill('  RAMJET ramjet!  ')
    assert p.locator('#bdCheckWording').input_value()=='  RAMJET ramjet!  '
    assert 'r a m j e t !' in p.locator('#bdCoverageResult').inner_text()
    p.locator('#bdCheckWording').fill('RAMJET');assert 'still requires independent verification' in p.locator('#bdCoverageResult').inner_text()
    p.locator('[data-review-style="B"]').click();assert p.locator('#bdAdvancedStyles').evaluate('(e)=>e.open')
    assert p.locator('#sfCompile').count()==1 and p.locator('#sfAdd').count()==1 and p.locator('#sfGraphicCreate').count()==1
    assert 'cutting paths not tested' in p.locator('#bdAdvancedStyles').inner_text()
    assert snapshot(p)==before,'Evidence check/navigation modified stored geometry'
    assert not p.evaluate('window.fixtureWrites') and not e,(p.evaluate('window.fixtureWrites'),e)
    p.locator('#bdAdvancedStyles').evaluate('(e)=>e.open=false');p.evaluate('window.scrollTo(0,0)');p.screenshot(path=str(out/'lettering-1024.png'),full_page=True)
   finally:c.close()
  run('lettering overview preserves exact case, distinguishes evidence, retains advanced controls',lettering)
  def shared():
   p,c,e,w,f=setup(pid='bf-p-f92f87e8ec44',name='Legacy Plumbing')
   try:
    t=p.locator('#portal').inner_text();assert 'Legacy Plumbing' in t;assert 'Ike' not in t;assert not p.locator('[data-deck-module="references"]').count()
    p.locator('[data-home-tab="active"]').first.click();p.wait_for_selector('#bdOrderSearch');p.locator('[data-open-order]').first.click();p.wait_for_selector('#bdOrderDetail')
    t=p.locator('#bdOrderDetail').inner_text();assert 'Requested window (not confirmed)' in t;assert 'SAVED WOOD' not in t
    assert not p.evaluate('window.fixtureWrites') and not e,(p.evaluate('window.fixtureWrites'),e)
    p.screenshot(path=str(out/'legacy-detail-1024.png'),full_page=True)
   finally:c.close()
  run('shared owner deck keeps service identity and requested scheduling separate',shared)
  def deny():
   p,c,e,w,f=setup(allow=False)
   try:
    assert p.locator('#portal').is_hidden();assert not p.locator('[data-bd-home]').count();assert 'not authorized' in p.locator('#loginError').inner_text().lower() or 'not commissioned' in p.locator('#loginError').inner_text().lower();assert not p.evaluate('window.fixtureWrites')
   finally:c.close()
  run('denied owner membership never renders the new business deck',deny)
  def nav():
   p,c,e,w,f=setup()
   try:
    before=snapshot(p)
    p.locator('[data-owner-nav="pricing"]').click();p.wait_for_selector('#bdPriceGuide')
    p.locator('[data-owner-nav="orders"]').click();p.wait_for_selector('#bdOrderSearch')
    p.locator('[data-owner-nav="references"]').click();p.wait_for_selector('#bdLettering')
    p.locator('[data-owner-nav="portal"]').click();assert p.locator('[data-bd-home]').is_visible()
    p.locator('.bd-support summary').click()
    for key in ['watch','services','settings']:assert p.locator('[data-deck-module="'+key+'"]').is_visible()
    assert before==snapshot(p);assert not p.evaluate('window.fixtureWrites') and not e
   finally:c.close()
  run('persistent business navigation and every existing support tool remain reachable',nav)
  def save_pricing():
   p,c,e,w,f=setup()
   try:
    p.locator('[data-owner-nav="pricing"]').click();p.wait_for_selector('#bdPriceGuide');before=snapshot(p)
    p.locator('[data-rate="cedar"]').fill('10');assert 'Unsaved' in p.locator('#savePricingState').inner_text()
    p.locator('#savePricing').dblclick();p.wait_for_timeout(130)
    assert len(p.evaluate('window.fixtureWrites'))==1,'Double click saved more than once'
    after=snapshot(p);assert before['orders']==after['orders'];assert before['projects']==after['projects']
    assert 'saved in this browser' in p.locator('#savePricingState').inner_text()
    p.locator('[data-rate="cedar"]').fill('11');assert 'Unsaved' in p.locator('#savePricingState').inner_text()
    assert not e,e
   finally:c.close()
  run('explicit pricing save changes only settings once and retains order prices',save_pricing)
  def read_fail():
   p,c,e,w,f=setup(fail_orders=True)
   try:
    assert 'Order records could not be read' in p.locator('#businessDeckHome').inner_text()
    assert p.locator('.bd-kpi').count()==0,'Failed read falsely displayed zero counts'
    p.locator('[data-owner-nav="orders"]').click();p.wait_for_selector('#bdOrders')
    assert 'not an empty-order result' in p.locator('#bdOrders').inner_text();assert not p.evaluate('window.fixtureWrites');assert not e
   finally:c.close()
  run('unavailable order store is an explicit hold, never an empty-business claim',read_fail)
  def expired():
   p,c,e,w,f=setup()
   try:
    p.evaluate("()=>{const s=JSON.parse(fixtureSession.blackFlagOwnerSessionV1);s.expiresAt='2000-01-01T00:00:00Z';fixtureSession.blackFlagOwnerSessionV1=JSON.stringify(s);}")
    p.locator('[data-owner-nav="orders"]').click();assert p.locator('#login').is_visible();assert p.locator('#portal').is_hidden();assert not p.evaluate('window.fixtureWrites')
   finally:c.close()
  run('expired owner session cannot navigate into a new record detail',expired)
  def pricing_freeze():
   p,c,e,w,f=setup(save_delay=600)
   try:
    p.locator('[data-owner-nav="pricing"]').click();p.wait_for_selector('#bdPriceGuide')
    assert p.locator('#savePricing').is_disabled(),'Unchanged pricing should not be saved again'
    p.locator('[data-rate="cedar"]').fill('10');p.locator('#savePricing').click()
    assert p.locator('[data-rate="cedar"]').is_disabled(),'Editable rates may drift while a prior save is being confirmed'
    assert p.locator('[data-enabled="cedar"]').is_disabled(),'Availability may drift during save'
    p.wait_for_timeout(650)
    assert not p.locator('[data-rate="cedar"]').is_disabled()
    assert p.locator('#savePricing').is_disabled(),'Confirmed unchanged values should stay disabled'
    assert p.locator('[data-rate="cedar"]').input_value()=='10'
    assert len(p.evaluate('fixtureWrites'))==1
    assert not e,e
   finally:c.close()
  run('pricing fields are frozen during a save so confirmation cannot hide later edits',pricing_freeze)
  def save_failed():
   p,c,e,w,f=setup(fail_saves=True)
   try:
    before=snapshot(p);p.locator('[data-owner-nav="pricing"]').click();p.wait_for_selector('#bdPriceGuide');p.locator('[data-rate="cedar"]').fill('10');p.locator('#savePricing').click();p.wait_for_timeout(120)
    assert 'unconfirmed' in p.locator('#savePricingState').inner_text();assert p.locator('#savePricing').is_disabled();assert len(p.evaluate('fixtureWrites'))==1;assert snapshot(p)==before
    p.wait_for_timeout(150);assert len(p.evaluate('fixtureWrites'))==1
    p.locator('[data-owner-nav="portal"]').click();p.locator('[data-owner-nav="pricing"]').click();p.wait_for_selector('#bdPriceGuide');assert p.locator('[data-rate="cedar"]').input_value()=='9'
    assert not e,e
   finally:c.close()
  run('uncertain local pricing save holds without retry and can reread unchanged settings',save_failed)
  def business(pid,name):
   p,c,e,w,f=setup(pid=pid,name=name)
   try:
    assert p.locator('#portalName').inner_text()==name
    assert not p.locator('[data-owner-nav="references"]').count()
    assert not p.locator('img[src*="ike_character"]').count()
    p.locator('[data-owner-nav="orders"]').click();p.wait_for_selector('#bdOrderSearch');assert 'FOREIGN PROTECTED TEXT' not in p.locator('#bdOrders').inner_text()
    assert not e,e
   finally:c.close()
  for pid,name in [('beccas-bloom-shop','Becca’s Bloom Shop'),('mugshot-after-dark','Mugs After Dark'),('bor-north-richmond','Signal Restoration'),('grizzly-bear','Grizzly Bear')]:run('shared owner identity and queue: '+name,lambda pid=pid,name=name:business(pid,name))
  def layout(width,height):
   p,c,e,w,f=setup(width,height)
   try:
    for view in ['home','orders','pricing','references']:
     if view!='home':
      if p.locator('#backOverview').count() and p.locator('#backOverview').is_visible():p.locator('#backOverview').click()
      if view=='orders':p.locator('[data-home-tab="active"]').first.click();p.wait_for_selector('#bdOrderSearch')
      else:p.locator('[data-deck-module="'+view+'"]').click();p.wait_for_timeout(240)
     assert p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'),(width,view,'horizontal overflow')
     p.screenshot(path=str(out/f'{view}-{width}.png'),full_page=True)
    assert not p.evaluate('window.fixtureWrites') and not e,(p.evaluate('window.fixtureWrites'),e)
   finally:c.close()
  for wh in [(390,844),(768,1024),(1366,1024)]:run(f'owner home/orders/pricing/lettering fit {wh[0]}px',lambda wh=wh:layout(*wh))
 browser.close();server.shutdown()
(out/'results.json').write_text(json.dumps(results,indent=2));print('TOTAL',len(results),'PASS',sum(x['pass'] for x in results));sys.exit(0 if all(x['pass'] for x in results) else 1)

"""Offline actual owner/adapter integration regression. All network calls are simulated.
Run: python VERIFY_SUREFOOT_UI.py RELEASE_DIR OUT_DIR
Synthetic account/order data only. Does not contact the hosted site or Fleet Core.
"""
from pathlib import Path
import sys,json,shutil,traceback,base64
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]).resolve();out=Path(sys.argv[2]).resolve();out.mkdir(parents=True,exist_ok=True)
PID='ikes-wood-signs';results=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 def setup(**options):
  ctx=browser.new_context(viewport={'width':1024,'height':768});page=ctx.new_page();page.set_default_timeout(2500);page.route('**/*',lambda r:r.abort());errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  doc=BeautifulSoup((root/'owner.html').read_text(),'html.parser')
  inline=[x.string or x.get_text() for x in doc.find_all('script') if not x.get('src')]
  for x in doc.find_all('script'):x.decompose()
  for x in doc.find_all('link',rel='stylesheet'):x.decompose()
  page.set_content(str(doc));page.add_style_tag(content=(root/'business_deck.css').read_text())
  page.add_style_tag(content=(root/'fleet_viewport.css').read_text());page.evaluate((root/'fleet_viewport.js').read_text());page.evaluate((root/'headway_contracts.js').read_text())
  # A test-only probe to simulate a changed/expired receipt. Not installed in product code.
  old="boot().catch(e=>{$('failureDetail')"
  new="window.__ownerTest={syncOrders:async()=>{orders=await getOrders();},read:()=>ownerSession(),valid:()=>sessionValid(ownerSession()),setLocalNamespace:x=>{project.namespace=x;},clear:()=>clearSession('fixture-clear')};boot().catch(e=>{$('failureDetail')"
  assert old in inline[-1]
  inline[-1]=inline[-1].replace(old,new)
  env=r'''(cfg)=>{
   const pid='ikes-wood-signs';const localNs=cfg.local_ns??'bf.project.ikes-wood-signs';
   window.fixtureCfg=cfg;window.fixtureCalls=[];window.fixtureWrites=[];window.fixtureNav=[];
   const original={id:pid,name:"Ike's Wood Signs",namespace:localNs,projectCode:'IKE',ownerAccess:{enabled:true,status:'active',identityProvider:'supabase',capabilities:['orders','pricing','branding'],credential:{login:'fixture',testMode:false,passwordHash:'synthetic'}},referenceLibrary:[]};
   const orders=[{id:'FIXTURE-ONE',projectId:pid,namespace:localNs,status:'New',wording:'  Smoke  Hole!  ',price:65,customerName:'Synthetic customer',createdAt:'2026-10-01T10:00:00Z'}, {id:'FOREIGN',projectId:'beccas-bloom-shop',wording:'FOREIGN PRIVATE WORDING',status:'New'}];
   const store={projects:[original],orders,settings:[{key:'businessConfig:'+pid,value:{ikeSpeciesRates:[]}}]};window.fixtureStore=store;
   const mem={};window.fixtureSession=mem;const sessionStorage={getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=String(v)},removeItem:k=>{delete mem[k]}};
   const localStorage={getItem:()=>null,setItem:()=>{throw Error('localStorage mutation forbidden')}};
   mem.darkSkySupabaseOwnerSessionV1=JSON.stringify({access_token:'SYNTHETIC-OFFLINE-ACCESS',expires_at:Date.now()+3600000,refresh_token:'SYNTHETIC-OFFLINE-REFRESH',user:{id:'owner-fixture'},flow_type:''});
   const location={search:'?project='+pid+'&view=portal&source=engine',href:'https://fixture.invalid/owner.html?project='+pid+'&view=portal&source=engine',pathname:'/owner.html',hash:'',reload:()=>{},replace:()=>{}};
   const history={state:null,replaceState:(_s,_t,u)=>window.fixtureNav.push(u)};
   const response=(value)=>{const r={result:structuredClone(value)};setTimeout(()=>r.onsuccess?.(),0);return r;};
   const db={transaction:(name,mode)=>({objectStore:()=>({get:k=>response(store[name].find(x=>(x.id||x.key)===k)),getAll:()=>response(store[name]),put:r=>{window.fixtureWrites.push({store:name,row:r});throw Error('Unexpected record mutation')}})})};
   const indexedDB={open:()=>{const r={result:db};setTimeout(()=>r.onsuccess?.(),0);return r;}};
   const user=()=>({id:cfg.auth_user??'owner-fixture',email:'fixture@example.invalid',user_metadata:{dark_sky_owner_password_set:true}});
   const fetch=async(url,opts={})=>{
    window.fixtureCalls.push({url:String(url),method:opts.method||'GET'});
    if((opts.method||'GET')!=='GET')throw Error('Unexpected mutation or token refresh');
    let body=[];
    if(url.includes('/auth/v1/user'))body=cfg.no_user?null:user();
    else if(url.includes('/fleet_vessels?'))body=cfg.deny_vessel?[]:[{id:cfg.vessel_id??'vessel-fixture',project_id:cfg.server_project??pid,namespace:cfg.server_ns??'ikes-wood-signs',display_name:"Ike's Wood Signs",owner_state:'owner_assigned'}];
    else if(url.includes('/fleet_memberships?'))body=cfg.deny_member?[]:[{id:'membership-fixture',vessel_id:cfg.member_vessel??'vessel-fixture',user_id:cfg.member_user??'owner-fixture',role:cfg.member_role??'project_owner',active:cfg.active!==false,revoked_at:cfg.revoked_at??null}];
    return {ok:true,status:200,json:async()=>body,text:async()=>JSON.stringify(body)};
   };
  '''
  script='\n'.join((root/n).read_text() for n in ['fleet_supabase.js','input_hygiene.js','business_deck.js'])+'\n'+'\n'.join(inline)
  page.evaluate(env+script+'}',options)
  page.wait_for_function("!document.getElementById('portal').classList.contains('hidden')||!document.getElementById('login').classList.contains('hidden')||!document.getElementById('failure').classList.contains('hidden')")
  return page,ctx,errors
 def done(p):
  assert not p.evaluate('window.fixtureWrites'),'navigation mutated saved records'
  assert not [c for c in p.evaluate('window.fixtureCalls') if c['method']!='GET'],'navigation submitted a write'
 def run(name,fn):
  try:fn();results.append({'name':name,'pass':True});print('PASS',name,flush=True)
  except Exception as e:results.append({'name':name,'pass':False,'error':str(e)});traceback.print_exc();print('FAIL',name,str(e),flush=True)
 def go(p):
  p.locator('[data-home-tab="active"]').first.click();p.wait_for_selector('#hwBackupPanel');p.locator('#hwBackupPanel summary').click()
 def legacy(p):
  p.evaluate('''()=>{const original=fixtureStore.orders[0];fixtureStore.orders=Array.from({length:26},(_,i)=>({...structuredClone(original),id:'TEST-'+i,status:i===25?'Picked Up':'New',photoData:'data:image/png;base64,c291cmNl',approvedPreviewData:'data:image/png;base64,cHJldmlldw=='}));fixtureStore.orders[17].legacy={ratio:NaN,range:[Infinity,-Infinity]};fixtureStore.orders.push({id:'FOREIGN',projectId:'beccas-bloom-shop',wording:'FOREIGN PRIVATE WORDING'});}''')
  p.evaluate('async()=>await __ownerTest.syncOrders()')
 def signature(p):return p.evaluate('''()=>fixtureStore.orders.map(r=>({id:r.id,price:r.price,wording:r.wording,photo:r.photoData,preview:r.approvedPreviewData,legacy:r.legacy?{nan:Number.isNaN(r.legacy.ratio),pos:r.legacy.range[0]===Infinity,neg:r.legacy.range[1]===-Infinity}:null}))''')
 def download(p):
  with p.expect_download() as ev:p.locator('#hwExportOrders').click()
  return json.loads(Path(ev.value.path()).read_text())
 def checkfile(p,b):
  payload=b if isinstance(b,bytes) else json.dumps(b).encode()
  p.locator('#hwBackupFile').set_input_files({'name':'synthetic-backup.json','mimeType':'application/json','buffer':payload})
 def roundtrip():
  p,c,e=setup()
  try:
   legacy(p);before=signature(p);go(p);b=download(p);assert b['count']==26;assert b['schema']=='strongbox-business-backup-v2';assert 'FOREIGN PRIVATE WORDING' not in json.dumps(b)
   p.wait_for_function('document.getElementById("hwBackupStatus").textContent.includes("Backup prepared: 26 records")')
   assert p.locator('#hwBackupLegacy').is_visible();assert '/rows/17/legacy/ratio' in p.locator('#hwBackupLegacy').inner_text()
   checkfile(p,b);p.wait_for_function('document.getElementById("hwBackupStatus").textContent.includes("Isolated restore comparison passed: 26 records")')
   exact=p.evaluate('''async b=>{const rows=await BlackFlagHeadway.readBackupRows(b,'ikes-wood-signs');return rows.length===26&&Number.isNaN(rows[17].legacy.ratio)&&rows[17].legacy.range[0]===Infinity&&rows[17].legacy.range[1]===-Infinity&&rows.every(r=>r.photoData==='data:image/png;base64,c291cmNl'&&r.approvedPreviewData==='data:image/png;base64,cHJldmlldw==')}''',b)
   assert exact;assert signature(p)==before;done(p);assert not e,e;p.locator('#hwBackupPanel').scroll_into_view_if_needed();p.screenshot(path=str(out/'strongbox-legacy-backup-check.png'),full_page=False)
   (out/'synthetic-26-backup.json').write_text(json.dumps(b));
  finally:c.close()
 run('actual owner 26-row legacy download and file rehearsal preserves numeric types/media without writes',roundtrip)
 def reject_case(mode):
  p,c,e=setup()
  try:
   legacy(p);before=signature(p);go(p);b=download(p)
   if mode=='wrong-vessel':b['projectId']='beccas-bloom-shop'
   elif mode=='media-damaged':b['rows'][0]=['string','DAMAGED']
   elif mode=='manifest-damaged':b['specialValues']=[]
   elif mode=='invalid-json':b=b'{broken'
   elif mode=='unknown-schema':b['schema']='future-unknown'
   checkfile(p,b);p.wait_for_function('document.getElementById("hwBackupStatus").textContent.includes("Backup rejected")')
   assert p.locator('#hwBackupLegacy').is_hidden();assert signature(p)==before;done(p);assert not e,e
  finally:c.close()
 for mode in ['wrong-vessel','media-damaged','manifest-damaged','invalid-json','unknown-schema']:run('actual file control rejects '+mode+' without original mutations',lambda mode=mode:reject_case(mode))
 def no_export(kind):
  p,c,e=setup();downloads=[];p.on('download',lambda d:downloads.append(d))
  try:
   if kind=='date':p.evaluate('fixtureStore.orders[0].legacyDate=new Date()')
   else:p.evaluate('fixtureStore.orders.push(structuredClone(fixtureStore.orders[0]))')
   go(p);p.locator('#hwExportOrders').click();p.wait_for_function('document.getElementById("hwBackupStatus").textContent.includes("Backup not confirmed")')
   status=p.locator('#hwBackupStatus').inner_text();assert ('unsupported-backup-type: /rows/0/legacyDate' if kind=='date' else 'backup-scope-or-duplicate') in status
   assert not downloads;done(p);assert not e,e
  finally:c.close()
 run('unsupported stored type reports exact field and does not pretend download completed',lambda:no_export('date'))
 run('duplicate stored IDs do not silently reduce backup count',lambda:no_export('duplicate'))
 def lost_receipt():
  p,c,e=setup();downloads=[];p.on('download',lambda d:downloads.append(d))
  try:
   legacy(p);go(p);p.evaluate('''()=>{const H=window.BlackFlagHeadway;window.BlackFlagHeadway={...H,backup:async(...x)=>{await new Promise(r=>setTimeout(r,250));return H.backup(...x)}}}''')
   # The panel captures H at construction; rebuild it after injecting the delay.
   p.locator('#backOverview').click();p.wait_for_selector('[data-home-tab="active"]');go(p)
   p.locator('#hwExportOrders').click();p.evaluate('__ownerTest.clear()');p.wait_for_timeout(600);assert not downloads;done(p);assert not e,e
  finally:c.close()
 run('owner proof lost during async export prevents download',lost_receipt)
 def safe_text():
  p,c,e=setup()
  try:
   legacy(p);p.evaluate('fixtureStore.orders[17].id="<img src=x onerror=window.XSS=1>"');go(p);b=download(p)
   assert '<img src=x' in p.locator('#hwBackupLegacy').inner_text();assert p.locator('#hwBackupLegacy img').count()==0;assert not p.evaluate('window.XSS||false');done(p);assert not e,e
  finally:c.close()
 run('legacy locations and hostile order IDs render as text not markup',safe_text)
 def phone():
  p,c,e=setup()
  try:
   p.set_viewport_size({'width':390,'height':700});legacy(p);go(p);b=download(p);checkfile(p,b);p.wait_for_function('document.getElementById("hwBackupStatus").textContent.includes("Isolated restore comparison passed")')
   assert p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1');done(p);assert not e,e
  finally:c.close()
 run('phone backup diagnostic wraps without horizontal page overflow',phone)
 browser.close()
(out/'results.json').write_text(json.dumps(results,indent=2));print(json.dumps({'passed':sum(x['pass'] for x in results),'total':len(results)}));sys.exit(0 if all(x['pass'] for x in results) else 1)

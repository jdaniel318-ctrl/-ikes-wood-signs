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
  new="window.__ownerTest={read:()=>ownerSession(),valid:()=>sessionValid(ownerSession()),setLocalNamespace:x=>{project.namespace=x;},clear:()=>clearSession('fixture-clear')};boot().catch(e=>{$('failureDetail')"
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
 def export_restore():
  p,c,e=setup(server_ns='ikes-wood-signs')
  try:
   p.evaluate("fixtureStore.orders[0].photoData='data:image/png;base64,c291cmNl';fixtureStore.orders[0].approvedPreviewData='data:image/png;base64,cHJldmlldw==';")
   before=p.evaluate('JSON.stringify(fixtureStore)');p.locator('[data-home-tab="active"]').first.click();p.wait_for_selector('#hwBackupPanel');p.locator('#hwBackupPanel summary').click()
   with p.expect_download() as down:p.locator('#hwExportOrders').click()
   b=json.loads(Path(down.value.path()).read_text());assert b['count']==1;assert b['rows'][0]['photoData']=='data:image/png;base64,c291cmNl';assert b['rows'][0]['approvedPreviewData']=='data:image/png;base64,cHJldmlldw==';assert 'FOREIGN' not in json.dumps(b)
   p.locator('#hwBackupFile').set_input_files({'name':'backup.json','mimeType':'application/json','buffer':json.dumps(b).encode()});p.wait_for_function('document.getElementById("hwBackupStatus").textContent.includes("Isolated restore comparison passed")')
   assert p.evaluate('JSON.stringify(fixtureStore)')==before;done(p);assert not e,e;p.screenshot(path=str(out/'owner-backup-rehearsal.png'),full_page=True)
   b['rows'][0]['wording']='TAMPERED';p.locator('#hwBackupFile').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':json.dumps(b).encode()});p.wait_for_function('document.getElementById("hwBackupStatus").textContent.includes("Backup rejected")');assert p.evaluate('JSON.stringify(fixtureStore)')==before;done(p)
  finally:c.close()
 run('actual owner full-photo backup, isolated restore and tampered rejection without writes',export_restore)
 def denied_export():
  p,c,e=setup()
  try:
   p.locator('[data-home-tab="active"]').first.click();p.wait_for_selector('#hwBackupPanel');p.locator('#hwBackupPanel summary').click();p.evaluate('window.__ownerTest.clear()');p.locator('#hwExportOrders').click();assert p.locator('#portal').is_hidden();done(p)
  finally:c.close()
 run('cleared owner proof cannot export saved records',denied_export)
 browser.close()
(out/'results.json').write_text(json.dumps(results,indent=2));print(json.dumps({'passed':sum(x['pass'] for x in results),'total':len(results)}));sys.exit(0 if all(x['pass'] for x in results) else 1)

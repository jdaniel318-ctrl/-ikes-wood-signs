"""Full owner document + actual IndexedDB, local HTTP only. Supabase responses are simulated.
No remote requests, real user session, or production database is accessed.
Usage: python VERIFY_STRONGBOX_BOOT.py RELEASE_DIR OUTPUT_DIR
"""
from pathlib import Path
import sys,json,shutil,mimetypes,traceback,threading
from urllib.parse import urlparse
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]).resolve();out=Path(sys.argv[2]).resolve();out.mkdir(parents=True,exist_ok=True)
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start();origin=f'http://127.0.0.1:{server.server_port}'
results=[];requests=[]
try:
 with sync_playwright() as w:
  browser=w.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  context=browser.new_context(viewport={'width':1024,'height':768});p=context.new_page();p.set_default_timeout(6000);errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  def route(r):
   u=urlparse(r.request.url);requests.append({'url':r.request.url,'method':r.request.method})
   if u.netloc==urlparse(origin).netloc:
    if u.path=='/seed.html':return r.fulfill(status=200,content_type='text/html',body='<html><body>Isolated test seed</body></html>')
    return r.continue_()
   if u.netloc.endswith('.supabase.co') and r.request.method=='GET':
    data=[]
    if '/auth/v1/user' in u.path:data={'id':'owner-fixture','email':'fixture@example.invalid','user_metadata':{'dark_sky_owner_password_set':True}}
    elif '/fleet_vessels' in u.path:data=[{'id':'vessel-fixture','project_id':'ikes-wood-signs','namespace':'ikes-wood-signs','display_name':"Ike's Wood Signs",'owner_state':'owner_assigned'}]
    elif '/fleet_memberships' in u.path:data=[{'id':'member-fixture','vessel_id':'vessel-fixture','user_id':'owner-fixture','role':'project_owner','active':True,'revoked_at':None}]
    return r.fulfill(status=200,content_type='application/json',headers={'access-control-allow-origin':'*'},body=json.dumps(data))
   if u.netloc.endswith('.supabase.co') and r.request.method=='OPTIONS':return r.fulfill(status=204,headers={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'GET, OPTIONS'})
   return r.abort()
  p.route('**/*',route);p.goto(origin+'/seed.html')
  p.evaluate('''async()=>{
   const pid='ikes-wood-signs',ns='bf.project.'+pid;
   const db=await new Promise((res,rej)=>{const q=indexedDB.open('blackFlagPlatformV1',1);q.onupgradeneeded=()=>{q.result.createObjectStore('projects',{keyPath:'id'});q.result.createObjectStore('orders',{keyPath:'id'});q.result.createObjectStore('settings',{keyPath:'key'})};q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});
   const tx=db.transaction(['projects','orders','settings'],'readwrite');
   tx.objectStore('projects').put({id:pid,name:"Ike's Wood Signs",namespace:ns,projectCode:'IKE',ownerAccess:{enabled:true,status:'active',identityProvider:'supabase',capabilities:['orders','pricing','branding'],credential:{login:'synthetic',testMode:false,passwordHash:'synthetic'}},referenceLibrary:[]});
   for(let i=0;i<26;i++)tx.objectStore('orders').put({id:'TEST-'+i,projectId:pid,namespace:ns,status:i===25?'Picked Up':'New',wording:'  Smoke  Hole!  ',price:65,customerName:'Synthetic customer',photoData:'data:image/png;base64,c291cmNl',approvedPreviewData:'data:image/png;base64,cHJldmlldw==',createdAt:'2026-10-01T10:00:00Z',legacy:i===17?{ratio:NaN,range:[Infinity,-Infinity]}:{}});
   tx.objectStore('orders').put({id:'FOREIGN',projectId:'beccas-bloom-shop',wording:'FOREIGN PRIVATE WORDING'});
   await new Promise((res,rej)=>{tx.oncomplete=res;tx.onabort=()=>rej(tx.error)});db.close();
   sessionStorage.setItem('darkSkySupabaseOwnerSessionV1',JSON.stringify({access_token:'SYNTHETIC-OFFLINE-ACCESS',expires_at:Date.now()+3600000,refresh_token:'SYNTHETIC-OFFLINE-REFRESH',user:{id:'owner-fixture'},flow_type:''}));
  }''')
  p.add_init_script('''window.__testMutations=[];for(const name of ['put','add','delete','clear']){const original=IDBObjectStore.prototype[name];IDBObjectStore.prototype[name]=function(...a){window.__testMutations.push({store:this.name,operation:name});return original.apply(this,a)}}''')
  p.goto(origin+'/owner.html?project=ikes-wood-signs&view=portal&source=engine');p.wait_for_selector('#portal:not(.hidden)');assert 'STRONGBOX TEST' in p.locator('#portal').inner_text()
  p.locator('[data-home-tab="active"]').first.click();p.wait_for_selector('#hwBackupPanel');p.locator('#hwBackupPanel summary').click()
  with p.expect_download() as ev:p.locator('#hwExportOrders').click()
  data=Path(ev.value.path()).read_bytes();b=json.loads(data);assert b['count']==26;assert b['schema']=='strongbox-business-backup-v2'
  p.locator('#hwBackupFile').set_input_files({'name':'downloaded-synthetic.json','mimeType':'application/json','buffer':data})
  p.wait_for_function('document.getElementById("hwBackupStatus").textContent.includes("Isolated restore comparison passed: 26 records")')
  exact=p.evaluate('''async()=>{const db=await new Promise((r,j)=>{let q=indexedDB.open('blackFlagPlatformV1');q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error)});const rows=await new Promise((r,j)=>{let q=db.transaction('orders').objectStore('orders').getAll();q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error)});db.close();const v=rows.find(r=>r.id==='TEST-17');return rows.length===27&&Number.isNaN(v.legacy.ratio)&&v.legacy.range[0]===Infinity&&v.legacy.range[1]===-Infinity}''')
  assert exact;assert not p.evaluate('__testMutations'),p.evaluate('__testMutations');assert not errors,errors
  assert all(r['method'] in ['GET','OPTIONS'] for r in requests),requests
  assert 'FOREIGN PRIVATE WORDING' not in data.decode();p.locator('#hwBackupPanel').scroll_into_view_if_needed();p.screenshot(path=str(out/'strongbox-full-owner-check.png'))
  results.append({'name':'full local-HTTP owner document, real IndexedDB export/file rehearsal, simulated auth, no writes','pass':True,'records':26,'original_store_count':27,'source_and_preview_count':26,'legacy_special_values':3})
  context.close();browser.close()
except Exception as e:
 traceback.print_exc();results.append({'name':'full local-HTTP owner document with real IndexedDB','pass':False,'error':str(e)})
finally:server.shutdown();server.server_close()
(out/'results.json').write_text(json.dumps(results,indent=2));(out/'request-log.json').write_text(json.dumps(requests,indent=2));print(json.dumps(results,indent=2));sys.exit(0 if all(x['pass'] for x in results) else 1)

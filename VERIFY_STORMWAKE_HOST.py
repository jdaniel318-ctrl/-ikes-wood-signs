"""Actual Admiral adapter + compiled opaque player; synthetic auth/fetch/account.
The insecure about:blank fixture supplies SHA-256 using Python hashlib through a
binding. Digests are computed over the actual bytes, including corruption tests.
No account, network or site storage is accessed; this is not a live RLS audit.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import sys,json,traceback,hashlib,os
r=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True);results=[]
legacy={'schema':'fun-solo-v1','stage':6,'history':['shore','hull','cargo','channel','sail','gate'],'help':0,'mistakes':1,'completed':True,'lessons':[],'pennant':'gold'}
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 def setup(ok=True):
  p=b.new_page(viewport={'width':1280,'height':840});p.set_default_timeout(12000);errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.route('**/*',lambda x:x.abort());p.expose_function('__qaDigest',lambda values:list(hashlib.sha256(bytes(values)).digest()));p.set_content('<section id="admiralDeck"><h1>Admiral workspace fixture</h1><button id="funProgramLaunch">OPEN STORMWAKE</button></section>');p.add_style_tag(content=(r/'fun_program.css').read_text());p.add_script_tag(content=(r/'fun_core.js').read_text());p.add_script_tag(content=(r/'stormwake_core.js').read_text());p.evaluate('''v=>{window.__funVerifiedPlayerHtml=v.legacy;window.fixture={ok:v.ok,id:'admiral-test',reusable:true,stamp:100,checks:0,fetches:0,writes:0,html:v.html};Object.defineProperty(crypto,'subtle',{value:{digest:async(_,bytes)=>(new Uint8Array(await __qaDigest(Array.from(new Uint8Array(bytes))))).buffer}});if(!crypto.randomUUID)crypto.randomUUID=()=>String(Math.random()).slice(2)+'-qa-channel';window.DarkSkyAdmiralSession={status:()=>({reusable:fixture.reusable,startedAt:fixture.stamp})};window.BlackFlagV3Identity={productionAuth:{readClientConfig:()=>({url:'https://invalid.test',publishableKey:'synthetic-public-key'})}};window.DarkSkySupabase={create:()=>({readSession:()=>({user:{id:fixture.id},access_token:'NEVER-SEND-TOKEN'}),verifyAdmiralAuthority:async()=>{fixture.checks++;if(fixture.wait)await new Promise(r=>fixture.release=r);return fixture.ok}})};window.fetch=async(url,opt)=>{fixture.fetches++;fixture.request={url:String(url),credentials:opt.credentials};if(fixture.fetchWait)await new Promise(r=>fixture.fetchRelease=r);return new Response(fixture.corrupt?fixture.html+'changed':fixture.html,{status:200});};Storage.prototype.setItem=function(){fixture.writes++;throw Error('No site storage allowed')};}''',{'ok':ok,'legacy':(r/'fun_player.html').read_text(),'html':(r/'stormwake_player.html').read_text()});p.add_script_tag(content=(r/'fun_program.js').read_text());return p,errors
 def open_player():
  p,e=setup();assert p.evaluate('fixture.fetches')==0;p.locator('#funProgramLaunch').click();p.wait_for_selector('#funFrame');f=p.locator('#funFrame').element_handle().content_frame();f.wait_for_selector('#swStart');f.evaluate('window.requestAnimationFrame=()=>0');return p,f,e
 def case(name,fn):
  if os.environ.get('SW_HOST') and os.environ['SW_HOST'] not in name:return
  try:fn();results.append({'name':name,'pass':True});print('PASS',name,flush=True)
  except Exception as e:results.append({'name':name,'pass':False,'error':str(e)});print('FAIL',name,str(e)[:300],flush=True);traceback.print_exc()
 def launch():
  p,f,e=open_player()
  try:
   assert p.evaluate('fixture.fetches')==1;assert p.evaluate('fixture.request.credentials')=='omit';assert p.locator('#funFrame').get_attribute('sandbox')=='allow-scripts';assert f.evaluate("(()=>{try{parent.document.body;return false}catch(e){return true}})()");assert 'NEVER-SEND-TOKEN' not in f.locator('body').inner_text();assert p.evaluate('fixture.writes')==0;assert not e,e
  finally:p.close()
 case('verified lazy launch checks actual player digest and keeps opaque isolation',launch)
 def denied():
  p,e=setup(False)
  try:p.locator('#funProgramLaunch').click();p.wait_for_function('()=>document.querySelector("#funProgramHoldText").textContent.includes("could not")');assert p.evaluate('fixture.fetches')==0;assert p.locator('#funFrame').count()==0
  finally:p.close()
 case('denied Admiral never fetches or opens 3D player',denied)
 def corrupt():
  p,e=setup()
  try:p.evaluate('fixture.corrupt=true');p.locator('#funProgramLaunch').click();p.wait_for_function('()=>document.querySelector("#funProgramHoldText").textContent.includes("does not match")');assert p.locator('#funFrame').count()==0;assert p.get_by_text('PLAY ORIGINAL FIRST LIGHT').is_visible()
  finally:p.close()
 case('corrupt or mixed-release player remains held with original-game recovery route',corrupt)
 def delayed_change():
  p,e=setup()
  try:p.evaluate('fixture.fetchWait=true');p.locator('#funProgramLaunch').click();p.wait_for_function('()=>!!fixture.fetchRelease');p.evaluate('fixture.id="other-account";fixture.fetchRelease()');p.wait_for_function('()=>document.querySelector("#funProgramHoldText").textContent.includes("session changed")');assert p.locator('#funFrame').count()==0
  finally:p.close()
 case('identity changes during delayed graphics download cannot open prior session',delayed_change)
 def cancel():
  p,e=setup()
  try:p.evaluate('fixture.wait=true');p.locator('#funProgramLaunch').click();p.wait_for_function('()=>!!fixture.release');p.locator('#funExit').click();p.evaluate('fixture.release()');p.wait_for_timeout(150);assert p.locator('#funFrame').count()==0
  finally:p.close()
 case('cancelled pending authorization cannot reopen the game',cancel)
 def imports():
  p,f,e=open_player()
  try:
   file=out/'synthetic-legacy.json';file.write_text(json.dumps(legacy));p.locator('#funImport').set_input_files(str(file));p.wait_for_selector('#funCancelImport');assert not f.evaluate('StormwakeSnapshot().legacy.completed');p.locator('#funCancelImport').click();assert not f.evaluate('StormwakeSnapshot().legacy.completed');p.locator('#funImport').set_input_files(str(file));p.wait_for_selector('#funConfirmImport');p.locator('#funConfirmImport').click();f.wait_for_selector('#swStart');
   # Parent message event is asynchronous; wait via Python polling to keep CSP unchanged.
   for _ in range(30):
    if f.evaluate('StormwakeSnapshot().legacy.completed'):break
    p.wait_for_timeout(50)
   assert f.evaluate('StormwakeSnapshot().legacy.completed');assert not f.evaluate('StormwakeSnapshot().mission.complete');assert f.evaluate('StormwakeSnapshot().legacy.pennant')=='gold'
   with p.expect_download() as d:p.locator('#funSaveFile').click()
   saved=out/'synthetic-stormwake.json';d.value.save_as(saved);v=json.loads(saved.read_text());assert v['schema']=='fun-stormwake-v2';assert v['legacy']==legacy;assert not v['mission']['complete'];assert 'NEVER-SEND' not in saved.read_text();assert len(saved.read_bytes())<=8192;assert p.evaluate('fixture.writes')==0
  finally:p.close()
 case('legacy save needs confirmation, preserves pennant and roundtrips new envelope',imports)
 def bad_files():
  p,f,e=open_player()
  try:
   for name,data in [('orders.json','{"schema":"orders","rows":[]}'),('large.json','x'*8193),('unknown.json','{"schema":"fun-stormwake-v6"}')]:
    path=out/name;path.write_text(data);p.locator('#funImport').set_input_files(str(path));p.wait_for_function('()=>document.querySelector("#funProgramStatus").textContent.includes("not loaded")');assert not p.locator('#funImportConfirm').count();assert not f.evaluate('StormwakeSnapshot().mission.complete')
   assert p.evaluate('fixture.writes')==0
  finally:p.close()
 case('malformed unknown and business-shaped imports cannot replace active game',bad_files)
 def expire():
  p,f,e=open_player()
  try:p.evaluate('fixture.reusable=false;dispatchEvent(new Event("darksky:admiral-session-ended"))');assert p.locator('#funFrame').count()==0;assert p.locator('#funSaveFile').is_disabled()
  finally:p.close()
 case('expired Admiral session removes player and disables saves',expire)
 def confirmation_change():
  p,f,e=open_player()
  try:
   file=out/'legacy-confirmation.json';file.write_text(json.dumps(legacy));p.locator('#funImport').set_input_files(str(file));p.wait_for_selector('#funConfirmImport');p.evaluate('fixture.wait=true');p.locator('#funConfirmImport').click();p.wait_for_function('()=>!!fixture.release');p.evaluate('fixture.id="different";fixture.release()');p.wait_for_function('()=>!document.querySelector("#funFrame")');assert not p.locator('#funImportConfirm').count()
  finally:p.close()
 case('account change during final import confirmation does not replace retained run',confirmation_change)
 def forged():
  p,f,e=open_player()
  try:
   p.evaluate("window.postMessage({type:'progress',channel:'forged',state:{schema:'fun-stormwake-v2',mission:{complete:true}}},'*')")
   with p.expect_download() as d:p.locator('#funSaveFile').click()
   path=out/'forged-unchanged.json';d.value.save_as(path);assert not json.loads(path.read_text())['mission']['complete'];p.locator('#funExit').click();assert p.locator('#admiralDeck h1').is_visible();assert not p.locator('#funFrame').count();assert p.evaluate('fixture.writes')==0
  finally:p.close()
 case('forged outer messages cannot award progress; return preserves Admiral workspace',forged)
 b.close()
(out/'results.json').write_text(json.dumps(results,indent=2));print(json.dumps({'passed':sum(x['pass'] for x in results),'failed':sum(not x['pass'] for x in results)}));sys.exit(any(not x['pass'] for x in results))

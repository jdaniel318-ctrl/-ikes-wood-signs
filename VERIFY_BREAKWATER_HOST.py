"""Breakwater saved-voyage preview + actual Admiral adapter and compiled opaque player.
Synthetic auth/fetch/account; child animation is held before player startup.
The locally fulfilled HTTPS fixture uses native browser WebCrypto for SHA-256.
Digests are computed over the actual bytes, including corruption tests.
No account, network or site storage is accessed; this is not a live RLS audit.
This host suite holds child animation frames before any player script runs.
It checks the actual compiled DOM, native WebCrypto and message/file boundary;
rendering and gameplay are exercised by the separate visual/player suites.
The top-level host retains its real animation clock for normal click handling.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import sys,json,traceback,hashlib,os
r=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True);results=[]
inputs=['fun_core.js','stormwake_core.js','fun_program.js','fun_program.css','fun_player.html','stormwake_player.html','stormwake_game.js','stormwake_game.css','STORMWAKE_PLAYER_BUILD.json','VERIFY_BREAKWATER_HOST.py']
(out/'inputs.json').write_text(json.dumps({'scope':'Actual compiled host DOM, digest, explicit import/restore and layout; synthetic account and held child animation; no live service or native device claim','inputs_sha256':{name:hashlib.sha256((r/name).read_bytes()).hexdigest() for name in inputs}},indent=2))
legacy={'schema':'fun-solo-v1','stage':6,'history':['shore','hull','cargo','channel','sail','gate'],'help':0,'mistakes':1,'completed':True,'lessons':[],'pennant':'gold'}
# Install through the browser, so fetched player bytes and their digest remain exact.
# The previous late freeze could only run after a software-rendered frame had
# already starved the selector/driver response it was waiting for.
CHILD_HOST_CLOCK="""if(window!==window.top){
 window.__hostQaNoAnimation=true;
 window.requestAnimationFrame=()=>0;
 window.cancelAnimationFrame=()=>{};
}"""
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=os.environ.get('BLACKFLAG_CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 def setup(ok=True,width=1280,height=840):
  p=b.new_page(viewport={'width':width,'height':height})
  try:
   p.add_init_script(CHILD_HOST_CLOCK)
   p.set_default_timeout(30000);errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.route('**/*',lambda x:x.fulfill(status=200,content_type='text/html',body='<!doctype html><title>Local host verification</title>') if x.request.url=='https://breakwater-host.test/' else x.abort());p.goto('https://breakwater-host.test/');p.set_content('<section id="admiralDeck"><h1>Admiral workspace fixture</h1><button id="funProgramLaunch">OPEN STORMWAKE</button></section>');p.add_style_tag(content=(r/'fun_program.css').read_text());p.add_script_tag(content=(r/'fun_core.js').read_text());p.add_script_tag(content=(r/'stormwake_core.js').read_text());p.evaluate('''v=>{window.__funVerifiedPlayerHtml=v.legacy;window.fixture={ok:v.ok,id:'admiral-test',reusable:true,stamp:100,checks:0,fetches:0,writes:0,html:v.html};if(!crypto.randomUUID)crypto.randomUUID=()=>String(Math.random()).slice(2)+'-qa-channel';window.DarkSkyAdmiralSession={status:()=>({reusable:fixture.reusable,startedAt:fixture.stamp})};window.BlackFlagV3Identity={productionAuth:{readClientConfig:()=>({url:'https://invalid.test',publishableKey:'synthetic-public-key'})}};window.DarkSkySupabase={create:()=>({readSession:()=>({user:{id:fixture.id},access_token:'NEVER-SEND-TOKEN'}),verifyAdmiralAuthority:async()=>{fixture.checks++;if(fixture.wait)await new Promise(r=>fixture.release=r);return fixture.ok}})};window.fetch=async(url,opt)=>{fixture.fetches++;fixture.request={url:String(url),credentials:opt.credentials};if(fixture.fetchWait)await new Promise(r=>fixture.fetchRelease=r);return new Response(fixture.corrupt?fixture.html+'changed':fixture.html,{status:200});};Storage.prototype.setItem=function(){fixture.writes++;throw Error('No site storage allowed')};}''',{'ok':ok,'legacy':(r/'fun_player.html').read_text(),'html':(r/'stormwake_player.html').read_text()});p.add_script_tag(content=(r/'fun_program.js').read_text());return p,errors
  except Exception:
   p.close();raise
 def open_player(width=1280,height=840):
  p,e=setup(width=width,height=height)
  try:
   assert p.evaluate('fixture.fetches')==0;p.locator('#funProgramLaunch').click();p.wait_for_selector('#funFrame');f=p.locator('#funFrame').element_handle().content_frame();f.wait_for_selector('#swStart');assert f.evaluate('window.__hostQaNoAnimation===true'),'Child host clock was not installed before startup';return p,f,e
  except Exception:
   p.close();raise
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
 def save_state(f):
  return f.evaluate("""()=>{const s=StormwakeSnapshot();return {schema:'fun-stormwake-v2',legacy:s.legacy,mission:s.mission,prefs:s.prefs}}""")
 def voyage_fixture(f,complete=True,checkpoint='lighthouse'):
  return f.evaluate("""v=>{const S=BlackFlagStormwake,s=S.fresh();const event=e=>{if(!S.event(s,e).ok)throw Error('Rejected fixture event: '+e.type)};event({type:'talk'});event({type:'collect',id:'rope'});if(v.complete){event({type:'collect',id:'timber'});event({type:'collect',id:'gear'});const work=new S.BridgeWork(s);work.fitGear(s);work.secureBrace(s);work.setHolding(true,s);for(let i=0;i<121;i++)work.step(.05,s);event({type:'rescue'});event({type:'finish'});event({type:'checkpoint',id:v.checkpoint});event({type:'chart'});}event({type:'prefs',prefs:{quality:'low',sound:false,reducedMotion:true}});return S.validate(s)}""",{'complete':complete,'checkpoint':checkpoint})
 def select_save(p,value,name):
  file=out/(name+'.json');file.write_text(json.dumps(value));p.locator('#funImport').set_input_files(str(file));p.wait_for_selector('#funConfirmImport');return p.locator('#funImportSummary').inner_text()
 def confirm_selected(p,f,expected):
  p.locator('#funConfirmImport').click()
  for _ in range(60):
   if save_state(f)==expected:break
   p.wait_for_timeout(50)
  assert save_state(f)==expected,'Confirmed file did not restore exactly'
  assert f.evaluate('StormwakeSnapshot().modal')=='title','Import started gameplay automatically'
  assert p.locator('#funSaveState').get_attribute('data-state')=='loaded','Preview/title changed saved progress'
 def export_exact(p,expected,name):
  with p.expect_download() as d:p.locator('#funSaveFile').click()
  file=out/(name+'.json');d.value.save_as(file);assert json.loads(file.read_text())==expected;assert len(file.read_bytes())<=8192;assert 'NEVER-SEND' not in file.read_text();assert p.evaluate('fixture.writes')==0
 def title_matches(f,objective,dock,stage,resume=True):
  assert f.locator('#swVoyageObjective').inner_text()==objective
  assert f.locator('#swVoyageDock').inner_text()=='Safe return: '+dock
  assert f.locator('#swVoyageStage').inner_text()=='THE BROKEN PASSAGE · '+str(stage).zfill(2)+' / 06'
  assert f.locator('#swStart').inner_text()==('Resume' if resume else 'Enter')+' the harbor →'
  assert f.evaluate('StormwakeSnapshot().modal')=='title'
  if stage==6:
   assert f.locator('#swVoyageHint').inner_text()=='The chartmaker is home. Explore the harbor or open your journal.'
   assert 'Our chartmaker is stranded beyond it' not in f.locator('#swModal').inner_text()
 def preview_cancel():
  p,f,e=open_player()
  try:
   current=voyage_fixture(f,complete=False);select_save(p,current,'preview-current-voyage');confirm_selected(p,f,current);before=save_state(f)
   candidate=voyage_fixture(f,checkpoint='pier');assert not candidate['legacy']['completed'];preview=select_save(p,candidate,'preview-completed-candidate')
   assert 'The Broken Passage · 6/6' in preview;assert 'Crew home · channel reopened' in preview;assert 'Safe return: Loading pier' in preview;assert 'First Light: not complete.' in preview
   assert save_state(f)==before,'Selecting a file replaced progress before confirmation'
   assert p.evaluate('document.activeElement.id')=='funCancelImport'
   assert p.locator('#funSaveState').get_attribute('data-state')=='loaded'
   p.locator('#funCancelImport').click();assert not p.locator('#funImportConfirm').count();assert save_state(f)==before
   export_exact(p,before,'cancel-retained-voyage');assert not e,e
  finally:p.close()
 case('saved voyage preview describes the candidate before confirmation; cancel keeps exact current progress',preview_cancel)
 def completed_preview(checkpoint,dock):
  p,f,e=open_player()
  try:
   candidate=voyage_fixture(f,checkpoint=checkpoint);assert not candidate['legacy']['completed'];before=save_state(f)
   preview=select_save(p,candidate,'completed-'+checkpoint+'-candidate')
   assert 'The Broken Passage · 6/6' in preview;assert 'Crew home · channel reopened' in preview;assert 'Safe return: '+dock in preview;assert 'First Light: not complete.' in preview
   assert save_state(f)==before;confirm_selected(p,f,candidate);title_matches(f,'Crew home · channel reopened',dock,6)
   export_exact(p,candidate,'completed-'+checkpoint+'-roundtrip');assert not e,e
  finally:p.close()
 case('completed rescue with incomplete First Light previews and resumes at Lighthouse landing with exact roundtrip',lambda:completed_preview('lighthouse','Lighthouse landing'))
 case('completed rescue saved at Loading pier keeps its actual dock in preview, title and exact roundtrip',lambda:completed_preview('pier','Loading pier'))
 def legacy_preview():
  p,f,e=open_player()
  try:
   original={**legacy,'lessons':['function'],'pennant':'teal'};expected=f.evaluate('s=>BlackFlagStormwake.restore(JSON.stringify(s))',original);before=save_state(f)
   preview=select_save(p,original,'preview-original-first-light')
   assert 'The Broken Passage · 1/6' in preview;assert 'Meet Bootstrap by the pier' in preview;assert 'Safe return: Arrival quay' in preview;assert 'First Light complete · teal pennant.' in preview
   assert save_state(f)==before;confirm_selected(p,f,expected);title_matches(f,'Meet Bootstrap by the pier','Arrival quay',1,False)
   assert save_state(f)['legacy']==original;assert not save_state(f)['mission']['complete'];export_exact(p,expected,'preview-original-roundtrip');assert not e,e
  finally:p.close()
 case('original First Light preview keeps its pennant and lessons while the new rescue starts at Arrival quay',legacy_preview)
 def reachable(locator,minimum_height=0):
  bounds=locator.evaluate("""el=>{el.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom,vw:innerWidth,vh:innerHeight,hit:!!hit&&(hit===el||el.contains(hit))}}""")
  assert bounds['w']>0 and bounds['h']>=minimum_height,bounds
  assert bounds['x']>=-.5 and bounds['y']>=-.5 and bounds['right']<=bounds['vw']+.5 and bounds['bottom']<=bounds['vh']+.5,bounds
  assert bounds['hit'],bounds
  return bounds
 def preview_layout():
  measurements=[]
  for width,height in [(1024,480),(1024,360),(768,1024)]:
   p,f,e=open_player(width,height)
   try:
    candidate=voyage_fixture(f,checkpoint='pier');select_save(p,candidate,'layout-'+str(width)+'x'+str(height))
    measured={'viewport':[width,height],'summary':reachable(p.locator('#funImportSummary')),'cancel':reachable(p.locator('#funCancelImport'),44),'confirm':reachable(p.locator('#funConfirmImport'),44)}
    confirm_selected(p,f,candidate);title_matches(f,'Crew home · channel reopened','Loading pier',6)
    measured['title_resume']=reachable(f.locator('#swStart'),44);measured['title_settings']=reachable(f.locator('#swTitleSettings'),44)
    assert save_state(f)==candidate;assert not e,e;measurements.append(measured)
   finally:p.close()
  (out/'voyage-layout-bounds.json').write_text(json.dumps(measurements,indent=2))
 case('saved voyage summary and confirmation/title controls stay reachable in short landscape and portrait',preview_layout)
 def bad_files():
  p,f,e=open_player()
  try:
   for name,data in [('orders.json','{"schema":"orders","rows":[]}'),('large.json','x'*8193),('unknown.json','{"schema":"fun-stormwake-v6"}')]:
    path=out/name;path.write_text(data);p.locator('#funImport').set_input_files(str(path));p.wait_for_function('()=>document.querySelector("#funProgramStatus").textContent.includes("not loaded")');assert not p.locator('#funImportConfirm').count();assert not f.evaluate('StormwakeSnapshot().mission.complete')
   assert p.evaluate('fixture.writes')==0
  finally:p.close()
 case('malformed unknown and business-shaped imports cannot replace active game',bad_files)
 def confirmation_change():
  p,f,e=open_player()
  try:
   file=out/'legacy-confirmation.json';file.write_text(json.dumps(legacy));p.locator('#funImport').set_input_files(str(file));p.wait_for_selector('#funConfirmImport');p.evaluate('fixture.wait=true');p.locator('#funConfirmImport').click();p.wait_for_function('()=>!!fixture.release');p.evaluate('fixture.id="different";fixture.release()');p.wait_for_function('()=>!document.querySelector("#funFrame")');assert not p.locator('#funImportConfirm').count()
  finally:p.close()
 case('account change during final import confirmation does not replace retained run',confirmation_change)
 b.close()
(out/'results.json').write_text(json.dumps(results,indent=2));print(json.dumps({'passed':sum(x['pass'] for x in results),'failed':sum(not x['pass'] for x in results)}));sys.exit(any(not x['pass'] for x in results))

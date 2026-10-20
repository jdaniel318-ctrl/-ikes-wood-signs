"""FUN actual opaque iframe + Admiral gateway. Synthetic account boundaries only.
No live credentials or business stores used. Browser/game source is actual release.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import sys,json,shutil,traceback,os
r=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True);results=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 def setup(width=1024,height=768,authority=True):
  p=b.new_page(viewport={'width':width,'height':height});p.set_default_timeout(5000);errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  p.route('**/*',lambda route:route.abort())
  p.set_content('<html><body><section id="admiralDeck" data-admiral-authority="verified"><h1>Admiral Programs fixture</h1><button id="funProgramLaunch">OPEN FUN</button></section></body></html>')
  p.add_style_tag(content=(r/'fun_program.css').read_text());p.add_script_tag(content=(r/'fun_core.js').read_text())
  p.evaluate('''cfg=>{window.__funVerifiedPlayerHtml=cfg.html; if(!crypto.randomUUID)crypto.randomUUID=()=>"synthetic-channel-"+Math.random().toString(36).slice(2);window.fixture={ok:cfg.ok,id:'admiral-test',reusable:true,stamp:100,checks:0,writes:0};window.DarkSkyAdmiralSession={status:()=>({reusable:fixture.reusable,startedAt:fixture.stamp})};window.BlackFlagV3Identity={productionAuth:{readClientConfig:()=>({url:'https://invalid.test',publishableKey:'synthetic-public-key'})}};window.DarkSkySupabase={create:()=>({readSession:()=>({user:{id:fixture.id},access_token:'NEVER-SEND-THIS-TOKEN-TO-GAME'}),verifyAdmiralAuthority:async()=>{fixture.checks++;if(fixture.wait)await new Promise(resolve=>{fixture.release=resolve;});return fixture.ok;}})};window.fetch=()=>{fixture.writes++;throw Error('No network in gateway fixture');};const set=Storage.prototype.setItem;Storage.prototype.setItem=function(){fixture.writes++;throw Error('No storage writes in game');};}''',{'html':(r/'fun_player.html').read_text(),'ok':authority})
  p.add_script_tag(content=(r/'fun_program.js').read_text());return p,errors
 def opened(width=1024,height=768):
  p,errs=setup(width,height);p.locator('#funProgramLaunch').click();p.wait_for_selector('#funFrame');fr=p.frame_locator('#funFrame');fr.locator('[data-choice="lantern"]').wait_for();return p,fr,errs
 def complete(p,fr):
  for kind,val in [('choice','lantern'),('answer','7'),('answer','4'),('choice','channel'),('answer','6'),('answer','4')]:
   if kind=='choice':fr.locator('[data-choice="'+val+'"]').click()
   else:fr.locator('#answer').fill(val);fr.locator('#answerSubmit').click()
   try:fr.locator('#next').click()
   except Exception:
    print('AT STAGE',val,fr.locator('body').inner_text()[-1600:],flush=True);p.screenshot(path=str(out/'failure.png'));raise
 def case(n,f):
  if os.environ.get('FUN_CASE') and os.environ['FUN_CASE'] not in n:return
  try:f();results.append({'name':n,'pass':True});print('PASS',n,flush=True)
  except Exception as e:results.append({'name':n,'pass':False,'error':str(e)});print('FAIL',n,str(e)[:180],flush=True);traceback.print_exc()
 def gameplay():
  p,fr,errs=opened()
  try:
   # A correct task is a sibling of the Bootstrap journal, not nested inside it.
   assert fr.locator('.journal .task').count()==0,'task wrongly nested in journal'
   fr.locator('[data-choice="crown"]').click();assert 'clues' in fr.locator('#feedback').inner_text()
   fr.locator('#hint').click();assert 'see' in fr.locator('#feedback').inner_text()
   complete(p,fr);assert 'light back' in fr.locator('.task h2').inner_text();assert not errs,errs
   p.screenshot(path=str(out/'FUN-harbor-complete.png'))
   with p.expect_download() as dl:p.locator('#funSaveFile').click()
   file=out/'FUN-synthetic-completed.json';dl.value.save_as(file);v=json.loads(file.read_text());assert v['completed'] and v['stage']==6 and len(v['history'])==6
   assert 'NEVER-SEND' not in file.read_text();assert p.evaluate('fixture.writes')==0
  finally:p.close()
 case('full fictional mission, wrong answer, hint, and private game-only export',gameplay)
 def replay():
  p,fr,e=opened()
  try:
   complete(p,fr);fr.locator('#replay').click();fr.locator('#confirmReplay').click();assert fr.locator('[data-choice="lantern"]').count()==1
  finally:p.close()
 case('replay requires deliberate in-game confirmation and works without browser modals',replay)
 def lesson():
  p,fr,e=opened()
  try:
   fr.locator('#chartNav').click();fr.locator('[data-lesson="derivative"]').click();assert fr.locator('#lessonAnswer').count()==0
   fr.locator('#learned').click();fr.locator('#lessonAnswer').fill('16');fr.locator('#lessonSubmit').first.click();assert 'rate' in fr.locator('.feedback').inner_text()
   fr.locator('#lessonAnswer').fill('8');fr.locator('#lessonSubmit').first.click();assert 'That is it' in fr.locator('.feedback').inner_text()
   fr.locator('#lessonBack').click();fr.locator('[data-lesson="integral"]').click();fr.locator('#learned').click();fr.locator('#lessonAnswer').fill('16');fr.locator('#lessonSubmit').first.click();assert 'That is it' in fr.locator('.feedback').inner_text()
   p.screenshot(path=str(out/'FUN-calculus-sampler.png'))
  finally:p.close()
 case('calculus sampler teaches before independent answer and distinguishes rate/amount',lesson)
 def denied():
  p,e=setup(authority=False)
  try:p.locator('#funProgramLaunch').click();p.wait_for_function('document.querySelector("#funProgramHoldText").textContent.includes("could not")');assert p.locator('#funFrame').count()==0;assert p.evaluate('fixture.checks')==1
  finally:p.close()
 case('missing Admiral authority never opens player',denied)
 def cancelled():
  p,e=setup()
  try:p.evaluate('fixture.wait=true');p.locator('#funProgramLaunch').click();p.wait_for_function('!!fixture.release');p.locator('#funExit').click();p.evaluate('fixture.release()');p.wait_for_timeout(100);assert p.locator('#funFrame').count()==0
  finally:p.close()
 case('cancelled pending entry cannot reopen after late server reply',cancelled)
 def changed():
  p,e=setup()
  try:p.evaluate('fixture.wait=true');p.locator('#funProgramLaunch').click();p.wait_for_function('!!fixture.release');p.evaluate('fixture.id="different";fixture.release()');p.wait_for_timeout(100);assert p.locator('#funFrame').count()==0
  finally:p.close()
 case('account changed during verification is held',changed)
 def expired():
  p,fr,e=opened()
  try:p.evaluate('fixture.reusable=false;window.dispatchEvent(new Event("darksky:admiral-session-ended"))');assert p.locator('#funFrame').count()==0;assert p.locator('#funSaveFile').is_disabled()
  finally:p.close()
 case('session ending destroys the player and disables game-file controls',expired)
 def sandboxed():
  p,fr,e=opened()
  try:
   f=p.locator('#funFrame').element_handle().content_frame();res=f.evaluate('''()=>{let parentDenied=false,storageDenied=false;try{parent.document.body}catch(e){parentDenied=true}try{localStorage.setItem('probe','x')}catch(e){storageDenied=true}return {parentDenied,storageDenied}}''');assert all(res.values()),res
   assert p.locator('#funFrame').get_attribute('sandbox')=='allow-scripts'
   p.evaluate("window.postMessage({type:'progress',channel:'forged',state:{stage:6}},'*')")
   with p.expect_download() as dl:p.locator('#funSaveFile').click()
   fpath=out/'forgery-unchanged.json';dl.value.save_as(fpath);assert json.loads(fpath.read_text())['stage']==0;assert p.evaluate('fixture.writes')==0
  finally:p.close()
 case('opaque game cannot access parent or site storage; forged sender ignored',sandboxed)
 def imports():
  p,fr,e=opened()
  try:
   fr.locator('[data-choice="lantern"]').click();fr.locator('#next').click()
   bad=out/'not-a-game.json';bad.write_text('{"schema":"orders","records":[]}');p.locator('#funImport').set_input_files(str(bad));p.wait_for_function('document.querySelector("#funProgramStatus").textContent.includes("not loaded")');assert '3 + 4' in fr.locator('.question').inner_text()
   with p.expect_download() as dl:p.locator('#funSaveFile').click()
   good=out/'good-game.json';dl.value.save_as(good);p.locator('#funImport').set_input_files(str(good));p.wait_for_function('document.querySelector("#funProgramStatus").textContent.includes("loaded into")');assert '3 + 4' in fr.locator('.question').inner_text();assert p.evaluate('fixture.writes')==0
  finally:p.close()
 case('game file import restores only validated state; business-shaped JSON is rejected',imports)
 def pause():
  p,fr,e=opened()
  try:fr.locator('#pauseBtn').click();assert fr.locator('.pause').is_visible();fr.locator('#resume').click();assert not fr.locator('.pause').count();assert fr.locator('[data-choice="lantern"]').is_visible();p.locator('#funExit').click();assert p.locator('#funProgram').is_hidden();assert p.locator('#admiralDeck h1').is_visible()
  finally:p.close()
 case('pause resume and return do not exit Admiral workspace or reset game',pause)
 for w,h in [(1024,640),(1024,768),(1366,900),(768,900),(390,700),(430,800)]:
  def layout(w=w,h=h):
   p,fr,e=opened(w,h)
   try:
    f=p.locator('#funFrame').element_handle().content_frame();assert f.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'horizontal overflow'
    if w>=1024:
     task=fr.locator('.task').bounding_box();journal=fr.locator('.journal').bounding_box();assert task['y']>=journal['y']+journal['height']-1,'journal/task overlap'
    fr.locator('[data-choice="lantern"]').click();fr.locator('#next').click();fr.locator('#answer').fill('7');fr.locator('#answerSubmit').click();fr.locator('#next').click();p.screenshot(path=str(out/f'FUN-play-{w}-{h}.png'),full_page=True);assert not e,e
   finally:p.close()
  case(f'playable layout {w}x{h} with answer interaction',layout)
 b.close()
(out/'results.json').write_text(json.dumps(results,indent=2));print('TOTAL',len(results),'PASS',sum(x['pass'] for x in results),'FAIL',sum(not x['pass'] for x in results));sys.exit(any(not x['pass'] for x in results))

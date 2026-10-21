"""Isolated real WebGL player scenarios. Synthetic parent/channel and clock; no accounts.
Run DISPLAY=:99 python VERIFY_STORMWAKE_PLAYER.py [release] [output].
Software WebGL screenshots are not native Safari or device FPS measurements.
Synthetic-clock scenarios dispatch DOM clicks (Playwright stability waits need real rAF).
A separate real-clock pointer smoke verifies actual clickable controls.
"""
from pathlib import Path
import json,sys,traceback,os
from playwright.sync_api import sync_playwright
r=Path(sys.argv[1] if len(sys.argv)>1 else Path(__file__).parent);out=Path(sys.argv[2] if len(sys.argv)>2 else r.parent/'qa/player');out.mkdir(parents=True,exist_ok=True)
assert (r/'stormwake_player.html').exists(), 'Compiled Stormwake player must exist before gameplay can pass'
results=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=os.environ.get('BLACKFLAG_CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 def setup(width=1280,height=820,start=True):
  p=browser.new_page(viewport={'width':width,'height':height});p.set_default_timeout(12000);errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.route('**/*',lambda rt:rt.abort())
  p.set_content('<style>html,body{margin:0;width:100%;height:100%;}iframe{width:100%;height:100%;border:0}</style>')
  html=(r/'stormwake_player.html').read_text();clock="<script>window.__qaClock=0;window.__qaQueue=[];window.requestAnimationFrame=cb=>{__qaQueue.push(cb);return 1};window.cancelAnimationFrame=()=>{};window.__qaStep=n=>{for(let i=0;i<n;i++){let a=__qaQueue.splice(0);__qaClock+=50;a.forEach(cb=>cb(__qaClock));}}</script>"
  html=html.replace('<body>','<body>'+clock,1)
  p.evaluate('''html=>{window.qaState=null;window.addEventListener('message',e=>{if(e.data.type==='progress')qaState=e.data.state});const f=document.createElement('iframe');f.id='game';f.setAttribute('sandbox','allow-scripts');f.srcdoc=html;document.body.appendChild(f);}''',html)
  f=p.locator('#game').element_handle().content_frame();f.wait_for_selector('#swLocked');
  if start:
   p.evaluate("document.getElementById('game').contentWindow.postMessage({type:'start',channel:'qa-current-channel',state:{schema:'fun-solo-v1',stage:0,history:[],help:0,mistakes:0,completed:false,lessons:[],pennant:'gold'}},'*')")
   
   try:f.wait_for_selector('#swStart');f.evaluate('__qaStep(3)')
   except Exception:
    print('BOOT ERROR',errors, f.locator('body').inner_text()[:2400],flush=True);raise
  return p,f,errors
 def check(name,fn):
  if os.environ.get('SW_CASE') and os.environ['SW_CASE'] not in name:return
  try:fn();results.append({'name':name,'pass':True});print('PASS',name,flush=True)
  except Exception as e:results.append({'name':name,'pass':False,'error':str(e)});print('FAIL',name,str(e)[:260],flush=True);traceback.print_exc()
 def boot():
  p,f,e=setup()
  try:
   f.locator('#swStart').dispatch_event('click');f.evaluate('__qaStep(18); document.getElementById("swModal").getBoundingClientRect();');s=f.evaluate('StormwakeSnapshot()');assert s['renderer']['frames']>=8 and s['renderer']['triangles']>10000;assert s['mode']=='walk';assert s['modal']=='',s;assert not e,e;f.wait_for_selector('#swModal',state='hidden');f.evaluate('document.getElementById("swCanvas").getContext("webgl").finish()');p.wait_for_timeout(200);p.screenshot(path=str(out/'Stormwake-arrival.png'),timeout=40000)
  finally:p.close()
 check('actual WebGL harbor, articulated character and visible controls',boot)
 def direct():
  p,f,e=setup(start=False)
  try:assert f.locator('#swLocked').is_visible();assert not f.evaluate('!!window.StormwakeSnapshot');
  finally:p.close()
 check('direct player remains locked without parent handshake',direct)

 def frame_steps(f,n):f.evaluate('(n)=>__qaStep(n)',n)
 def accelerate(f):
  f.evaluate("""()=>{const actual=StormGL.Renderer.prototype.draw;let n=0;StormGL.Renderer.prototype.draw=function(...args){if(++n%100===0){actual.apply(this,args);this.gl.finish();}};window.__qaDrive=(tx,tz,max=800,jumpZ=null)=>{let keys=new Set();for(let n=0;n<max;n++){const s=StormwakeSnapshot(),dx=tx-s.player.x,dz=tz-s.player.z;if(s.modal)return {reason:'paused',snapshot:s};if(Math.hypot(dx,dz)<.45){for(const k of keys)dispatchEvent(new KeyboardEvent('keyup',{key:k}));__qaStep(4);return {reason:'arrived',snapshot:StormwakeSnapshot()};}const len=Math.hypot(dx,dz),forward=(dx*Math.sin(s.camYaw)+dz*Math.cos(s.camYaw))/len,side=(-dx*Math.cos(s.camYaw)+dz*Math.sin(s.camYaw))/len,newKeys=new Set();if(forward>.35)newKeys.add('w');if(forward<-.35)newKeys.add('s');if(side>.35)newKeys.add('d');if(side<-.35)newKeys.add('a');for(const k of keys)if(!newKeys.has(k))dispatchEvent(new KeyboardEvent('keyup',{key:k}));for(const k of newKeys)if(!keys.has(k))dispatchEvent(new KeyboardEvent('keydown',{key:k}));keys=newKeys;if(jumpZ!==null&&s.player.grounded&&s.player.z>jumpZ&&s.player.z<jumpZ+.5){dispatchEvent(new KeyboardEvent('keydown',{key:' '}));dispatchEvent(new KeyboardEvent('keyup',{key:' '}));}__qaStep(1);}for(const k of keys)dispatchEvent(new KeyboardEvent('keyup',{key:k}));return {reason:'timeout',snapshot:StormwakeSnapshot()};};}""")
 def drive(f,x,z,jump=None):
  print('WALK',x,z,flush=True);v=f.evaluate('([x,z,j])=>__qaDrive(x,z,800,j)',[x,z,jump]);assert v['reason']=='arrived',v
 def click_act(f):f.locator('#swInteract').dispatch_event('click');frame_steps(f,4)
 def start_play(f):f.locator('#swStart').dispatch_event('click');frame_steps(f,20)
 def walking():
  p,f,e=setup()
  try:
   start_play(f);accelerate(f);drive(f,0,-15);assert f.evaluate('StormwakeSnapshot().near.id')=='talk';click_act(f);f.locator('#swAcceptMission').dispatch_event('click');drive(f,-7,-8);drive(f,-7,-6);click_act(f);assert f.evaluate('StormwakeSnapshot().mission.parts')==['timber'];assert not e,e
  finally:p.close()
 check('walk with real keyboard controls, meet Bootstrap and collect one physical repair',walking)
 def pause_input():
  p,f,e=setup()
  try:
   start_play(f);accelerate(f);f.evaluate("dispatchEvent(new KeyboardEvent('keydown',{key:'w'}));__qaStep(5)");before=f.evaluate('StormwakeSnapshot().player.z');f.locator('#swPause').dispatch_event('click');frame_steps(f,60);assert f.evaluate('StormwakeSnapshot().player.z')==before;f.locator('#swResume').dispatch_event('click');frame_steps(f,20);assert f.evaluate('StormwakeSnapshot().player.z')==before
  finally:p.close()
 check('pause cancels held movement and does not simulate catch-up',pause_input)
 def lessons():
  p,f,e=setup()
  try:
   start_play(f);f.locator('#swJournal').dispatch_event('click');f.locator('#swFunctions').dispatch_event('click');assert f.locator('#swFunctionTurn').is_disabled();assert not f.locator('#swFunctionPractice').is_visible();f.locator('#swTime').fill('3');f.locator('#swTime').dispatch_event('input');assert '9.00' in f.locator('#swDistanceValue').inner_text();assert f.locator('#graphPoint').get_attribute('cx')=='302';f.locator('#swFunctionTurn').dispatch_event('click');f.locator('#swFunctionAnswer').fill('6');f.locator('#swFunctionTry').dispatch_event('click');assert 'Replace' in f.locator('#swFunctionFeedback').inner_text();f.locator('#swFunctionAnswer').fill('9');f.locator('#swFunctionTry').dispatch_event('click');assert 'Exactly' in f.locator('#swFunctionFeedback').inner_text();assert f.evaluate('StormwakeSnapshot().mission.complete')==False;assert 'function' in f.evaluate('StormwakeSnapshot().legacy.lessons')
  finally:p.close()
 check('interactive functions slider moves launch and graph before practice; lesson distinct from rescue',lessons)
 def legacy():
  p,f,e=setup()
  try:
   f.locator('#swOriginal').dispatch_event('click');old=f.frame_locator('#swLegacyShell iframe');old.locator('[data-choice="lantern"]').wait_for();old.locator('[data-choice="lantern"]').dispatch_event('click');old.locator('#next').dispatch_event('click');assert f.evaluate('StormwakeSnapshot().legacy.stage')==1;assert f.evaluate('StormwakeSnapshot().mission.briefed')==False;f.locator('#swLegacyBack').dispatch_event('click');assert f.locator('#swFunctions').is_visible();assert not e,e
  finally:p.close()
 check('original First Light remains playable in a second opaque frame without changing rescue',legacy)
 def wrong_parent():
  p,f,e=setup()
  try:
   start_play(f);before=f.evaluate('StormwakeSnapshot().mission');f.evaluate("window.postMessage({type:'restore',channel:'qa-current-channel',state:{}},'*')");frame_steps(f,4);assert f.evaluate('StormwakeSnapshot().mission')==before;assert f.evaluate("(()=>{try{parent.document.body;return false}catch(e){return true}})()")
  finally:p.close()
 check('opaque child cannot read parent; self-forged restore ignored',wrong_parent)

 def full_mission():
  p,f,e=setup()
  try:
   start_play(f);accelerate(f);drive(f,0,-15);click_act(f);f.locator('#swAcceptMission').dispatch_event('click');drive(f,-7,-8);drive(f,-7,-6);click_act(f);drive(f,0,-2);drive(f,5,2);drive(f,14,2);click_act(f);drive(f,0,9);drive(f,0,13);drive(f,0,20,13.0);click_act(f)
   assert sorted(f.evaluate('StormwakeSnapshot().mission.parts'))==['gear','rope','timber'];drive(f,-1.8,21);click_act(f);assert f.evaluate('StormwakeSnapshot().modal')=='mechanism'
   f.locator('#swBalance').dispatch_event('click');assert not f.evaluate('StormwakeSnapshot().mission.bridgeOpen')
   for _ in range(3):f.locator('#swWeightPlus').dispatch_event('click')
   f.locator('#swBalance').dispatch_event('click');assert f.evaluate('StormwakeSnapshot().mission.bridgeOpen');frame_steps(f,20)
   drive(f,3.6,20);click_act(f);assert f.evaluate('StormwakeSnapshot().mode')=='boat'
   f.evaluate("""()=>{window.__qaSail=(tx,tz,stop=true,max=2200)=>{let held=new Set();for(let n=0;n<max;n++){const s=StormwakeSnapshot(),b=s.boat,dx=tx-b.x,dz=tz-b.z,d=Math.hypot(dx,dz);if(s.modal)return {reason:'modal',snapshot:s};if(d<2.15&&(!stop||Math.abs(b.speed)<.85)){for(const k of held)dispatchEvent(new KeyboardEvent('keyup',{key:k}));__qaStep(1);return {reason:'arrived',snapshot:StormwakeSnapshot()};}const wanted=Math.atan2(dx,dz),err=Math.atan2(Math.sin(wanted-b.yaw),Math.cos(wanted-b.yaw)),keys=new Set();if(d>2.15){keys.add('w');if(err>.08)keys.add('a');if(err<-.08)keys.add('d');}for(const k of held)if(!keys.has(k))dispatchEvent(new KeyboardEvent('keyup',{key:k}));for(const k of keys)if(!held.has(k))dispatchEvent(new KeyboardEvent('keydown',{key:k}));held=keys;__qaStep(1);}for(const k of held)dispatchEvent(new KeyboardEvent('keyup',{key:k}));return {reason:'timeout',snapshot:StormwakeSnapshot()};};}""")
   def sail(x,z,stop=True):
    print('SAIL',x,z,flush=True);result=f.evaluate('([x,z,stop])=>__qaSail(x,z,stop)',[x,z,stop]);assert result['reason']=='arrived',result
   sail(6.4,24.5,False);sail(0,37,False);sail(6.5,46,False);sail(8.6,50.5);click_act(f);assert f.evaluate('StormwakeSnapshot().mode')=='walk';drive(f,18,48.5);click_act(f);f.locator('#swRescue').dispatch_event('click');assert f.evaluate('StormwakeSnapshot().mission.passenger')
   drive(f,11.7,50.5);click_act(f);assert f.evaluate('StormwakeSnapshot().mode')=='boat';sail(-1,45,False);sail(-5.8,34);click_act(f);assert f.evaluate('StormwakeSnapshot().mode')=='walk';drive(f,-14,34);drive(f,-16,31);click_act(f);assert f.evaluate('StormwakeSnapshot().mission.complete');assert f.evaluate('StormwakeSnapshot().modal')=='win';assert not e,e
   (out/'complete-state.json').write_text(json.dumps(f.evaluate('StormwakeSnapshot()'),indent=2))
  finally:p.close()
 check('complete Broken Passage through actual movement, jump, mechanism, boat, rescue and return',full_mission)

 def pause_title():
  p,f,e=setup()
  try:
   p.evaluate("document.getElementById('game').contentWindow.postMessage({type:'pause',channel:'qa-current-channel'},'*')");p.wait_for_timeout(150)
   assert f.locator('#swStart').is_visible(), 'Background or cancelled import must preserve the title'
   assert not f.locator('#swResume').count(), 'A title that was never playing must not get a second pause panel'
   start_play(f);assert f.locator('#swHud').is_visible();assert f.evaluate('StormwakeSnapshot().modal')==''
   before=f.evaluate('StormwakeSnapshot().player.z');f.evaluate("dispatchEvent(new KeyboardEvent('keydown',{key:'w'}));__qaStep(5);dispatchEvent(new KeyboardEvent('keyup',{key:'w'}))")
   assert f.evaluate('StormwakeSnapshot().player.z')!=before, 'Starting after a title hold must keep movement usable';assert not e,e
  finally:p.close()
 check('title hold preserves entry and usable controls',pause_title)

 def resize_blur():
  p,f,e=setup()
  try:
   start_play(f);accelerate(f);f.evaluate("dispatchEvent(new KeyboardEvent('keydown',{key:'w'}));__qaStep(5)");before=f.evaluate('StormwakeSnapshot().player.z')
   f.evaluate('window.__qaResizeEvents=0;addEventListener("resize",()=>__qaResizeEvents++);document.getElementById("swCanvas").getContext("webgl").finish()');p.set_viewport_size({'width':900,'height':700});p.wait_for_timeout(200)
   assert f.evaluate('__qaResizeEvents')>=1, 'The browser must deliver an actual viewport resize'
   assert f.evaluate('StormwakeSnapshot().modal')=='', 'Resize must leave active play uninterrupted'
   frame_steps(f,35);assert f.evaluate('StormwakeSnapshot().player.z')==before, 'Resize must cancel held movement and catch-up'
   f.evaluate("dispatchEvent(new KeyboardEvent('keydown',{key:'w'}));__qaStep(3);dispatchEvent(new Event('blur'))");after=f.evaluate('StormwakeSnapshot().player.z')
   assert after!=before, 'Controls must work after resizing';assert f.locator('#swResume').is_visible();frame_steps(f,20);assert f.evaluate('StormwakeSnapshot().player.z')==after
   f.locator('#swResume').dispatch_event('click');frame_steps(f,20);assert f.evaluate('StormwakeSnapshot().player.z')==after;assert not e,e
  finally:p.close()
 check('resize preserves play while lost focus pauses without stuck keys or catch-up',resize_blur)

 browser.close()
(out/'results.json').write_text(json.dumps(results,indent=2));print(json.dumps({'passed':sum(x['pass'] for x in results),'failed':sum(not x['pass'] for x in results)}));sys.exit(any(not x['pass'] for x in results))

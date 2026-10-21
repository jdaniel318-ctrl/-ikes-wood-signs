"""Saltglass compiled WebGL2 mission, material and bridge integration. Synthetic parent/channel and clock; no accounts.
Run python VERIFY_SALTGLASS_PLAYER.py [release] [output].
Software WebGL canvas captures are not native Safari or device FPS measurements.
Canvas PNGs contain the actual production render, without DOM HUD or controls.
DOM visibility, touch sizes and viewport bounds are asserted separately; bridge
control bounds are recorded as JSON. Draw and PNG export share one browser task
because the production drawing buffer is not preserved between tasks.
Synthetic-clock scenarios dispatch DOM clicks (Playwright stability waits need real rAF).
A separate real-clock pointer smoke verifies actual clickable controls.
"""
from pathlib import Path
import json,sys,traceback,os,hashlib,base64
from playwright.sync_api import sync_playwright
r=Path(sys.argv[1] if len(sys.argv)>1 else Path(__file__).parent);out=Path(sys.argv[2] if len(sys.argv)>2 else r.parent/'qa/player');out.mkdir(parents=True,exist_ok=True)
assert (r/'stormwake_player.html').exists(), 'Compiled Stormwake player must exist before gameplay can pass'
results=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=os.environ.get('BLACKFLAG_CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 def setup(width=1280,height=820,start=True,checkpoint=None,render_full=False,force_legacy=False):
  p=browser.new_page(viewport={'width':width,'height':height},has_touch=True);p.set_default_timeout(30000);errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.on('console',lambda m:errors.append(m.text[:1000]) if m.type=='error' else None);p.route('**/*',lambda rt:rt.abort())
  p.set_content('<style>html,body{margin:0;width:100%;height:100%;}iframe{width:100%;height:100%;border:0}</style>')
  html=(r/'stormwake_player.html').read_text();clock="<script>window.__qaClock=0;window.__qaQueue=[];window.requestAnimationFrame=cb=>{__qaQueue.push(cb);return 1};window.cancelAnimationFrame=()=>{};window.__qaStep=n=>{for(let i=0;i<n;i++){let a=__qaQueue.splice(0);__qaClock+=50;a.forEach(cb=>cb(__qaClock));}}</script>"
  if force_legacy:clock+="<script>(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:original.call(this,type,...args);};})();</script>"
  html=html.replace('<body>','<body>'+clock,1)
  # Only GPU submission is throttled in synthetic-clock behavior cases; world,
  # input, camera, animation, state transitions and actual renderer stay intact.
  # Full draw cadence is used by the initial actual-picture check.
  instrumentation="<script>window.__qaRenderAlways="+('true' if render_full else 'false')+";(()=>{const draw=StormGL.Renderer.prototype.draw;let n=0;StormGL.Renderer.prototype.draw=function(...args){window.__qaRenderer=this;window.__qaRenderNow=()=>{draw.apply(this,args);this.gl.finish();};if(++n<=2||window.__qaRenderAlways||n%100===0)draw.apply(this,args);};})();</script>"
  html=html.replace('</body>',instrumentation+'</body>',1)

  p.evaluate('''html=>{window.qaState=null;window.qaActivities=[];window.addEventListener('message',e=>{if(e.data.type==='progress')qaState=e.data.state;if(e.data.type==='activity')qaActivities.push(e.data)});const f=document.createElement('iframe');f.id='game';f.setAttribute('sandbox','allow-scripts');f.srcdoc=html;document.body.appendChild(f);}''',html)
  f=p.locator('#game').element_handle().content_frame();f.wait_for_selector('#swLocked');
  if start:
   p.evaluate("document.getElementById('game').contentWindow.postMessage({type:'start',channel:'qa-current-channel',state:{schema:'fun-solo-v1',stage:0,history:[],help:0,mistakes:0,completed:false,lessons:[],pennant:'gold'}},'*')")
   
   try:
    f.wait_for_selector('#swStart');f.evaluate('__qaStep(3)')
    if not force_legacy:f.wait_for_function('StormwakeSnapshot().renderer.texturesReady===8 && StormwakeSnapshot().renderer.textureErrors===0',polling=100)
    assert f.evaluate('StormwakeSnapshot().renderer.backend')==('legacy-webgl1' if force_legacy else 'three-webgl2')
   except Exception:
    print('BOOT ERROR',errors, f.locator('body').inner_text()[:2400],flush=True);raise
  if checkpoint is not None:
   p.evaluate("state=>document.getElementById('game').contentWindow.postMessage({type:'restore',channel:'qa-current-channel',state},'*')",checkpoint)
   for _ in range(50):
    if f.evaluate('StormwakeSnapshot().mission')==checkpoint['mission']:break
    p.wait_for_timeout(10)
   assert f.evaluate('StormwakeSnapshot().mission')==checkpoint['mission'], 'Valid parent save restore did not complete'
   f.wait_for_function('StormwakeSnapshot().renderer.texturesReady===8',polling=100)
  return p,f,errors
 def check(name,fn):
  if os.environ.get('SW_CASE') and os.environ['SW_CASE'] not in name:return
  try:fn();results.append({'name':name,'pass':True});print('PASS',name,flush=True)
  except Exception as e:results.append({'name':name,'pass':False,'error':str(e)});print('FAIL',name,str(e)[:260],flush=True);traceback.print_exc()
 def capture_canvas(f,name):
  import zlib
  captured=f.evaluate("()=>{__qaRenderNow();const canvas=document.getElementById('swCanvas');return {png:canvas.toDataURL('image/png'),width:canvas.width,height:canvas.height}}")
  assert captured['png'].startswith('data:image/png;base64,'), 'Canvas export is not a PNG data URL'
  data=base64.b64decode(captured['png'].split(',',1)[1],validate=True)
  assert data[:8]==b'\x89PNG\r\n\x1a\n', 'Canvas export has an invalid PNG signature'
  offset=8;chunks=[];idat_bytes=0;dimensions=None
  while offset<len(data):
   assert offset+12<=len(data), 'Truncated PNG chunk header'
   size=int.from_bytes(data[offset:offset+4],'big');kind=data[offset+4:offset+8];end=offset+12+size
   assert end<=len(data), 'Truncated PNG chunk data'
   payload=data[offset+8:end-4]
   assert zlib.crc32(kind+payload)&0xffffffff==int.from_bytes(data[end-4:end],'big'), 'PNG chunk checksum mismatch'
   if not chunks:
    assert kind==b'IHDR' and size==13, 'PNG must begin with an IHDR chunk'
    dimensions=(int.from_bytes(payload[:4],'big'),int.from_bytes(payload[4:8],'big'))
   if kind==b'IDAT':idat_bytes+=size
   chunks.append(kind);offset=end
   if kind==b'IEND':
    assert size==0 and offset==len(data), 'Invalid PNG end chunk'
    break
  assert chunks and chunks[-1]==b'IEND' and idat_bytes>0, 'PNG image data or end chunk is missing'
  assert dimensions==(captured['width'],captured['height']) and min(dimensions)>0, 'PNG dimensions differ from the actual canvas'
  (out/name).write_bytes(data)
  return {'file':name,'scope':'Actual production WebGL canvas only; DOM HUD and controls excluded','width':dimensions[0],'height':dimensions[1],'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
 def boot():
  p,f,e=setup(render_full=True)
  try:
   f.locator('#swStart').dispatch_event('click');f.evaluate('__qaStep(18); document.getElementById("swModal").getBoundingClientRect();');s=f.evaluate('StormwakeSnapshot()');assert s['renderer']['frames']>=8 and s['renderer']['triangles']>10000;assert s['mode']=='walk';assert s['modal']=='',s;assert not e,e;f.wait_for_selector('#swModal',state='hidden');capture_canvas(f,'Saltglass-arrival-canvas.png')
  finally:p.close()
 check('actual WebGL harbor, articulated character and visible controls',boot)
 def direct():
  p,f,e=setup(start=False)
  try:assert f.locator('#swLocked').is_visible();assert not f.evaluate('!!window.StormwakeSnapshot');
  finally:p.close()
 check('direct player remains locked without parent handshake',direct)

 def frame_steps(f,n):f.evaluate('(n)=>__qaStep(n)',n)
 def accelerate(f):
  f.evaluate("""()=>{window.__qaDrive=(tx,tz,max=800,jumpZ=null)=>{let keys=new Set();for(let n=0;n<max;n++){const s=StormwakeSnapshot(),dx=tx-s.player.x,dz=tz-s.player.z;if(s.modal)return {reason:'paused',snapshot:s};if(Math.hypot(dx,dz)<(([[0,-15],[18,48.5],[-16,31]].some(p=>p[0]===tx&&p[1]===tz))?1.05:.45)){for(const k of keys)dispatchEvent(new KeyboardEvent('keyup',{key:k}));__qaStep(4);return {reason:'arrived',snapshot:StormwakeSnapshot()};}const len=Math.hypot(dx,dz),forward=(dx*Math.sin(s.camYaw)+dz*Math.cos(s.camYaw))/len,side=(-dx*Math.cos(s.camYaw)+dz*Math.sin(s.camYaw))/len,newKeys=new Set();if(forward>.35)newKeys.add('w');if(forward<-.35)newKeys.add('s');if(side>.35)newKeys.add('d');if(side<-.35)newKeys.add('a');for(const k of keys)if(!newKeys.has(k))dispatchEvent(new KeyboardEvent('keyup',{key:k}));for(const k of newKeys)if(!keys.has(k))dispatchEvent(new KeyboardEvent('keydown',{key:k}));keys=newKeys;if(jumpZ!==null&&s.player.grounded&&s.player.z>jumpZ&&s.player.z<jumpZ+.5){dispatchEvent(new KeyboardEvent('keydown',{key:' '}));dispatchEvent(new KeyboardEvent('keyup',{key:' '}));}__qaStep(1);}for(const k of keys)dispatchEvent(new KeyboardEvent('keyup',{key:k}));return {reason:'timeout',snapshot:StormwakeSnapshot()};};}""")
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


 # A valid saved checkpoint exercises the same public restore path as loading a file.
 # The tests never write character position, mission state, bridge work, or input internals.
 def bridge_checkpoint():
  return {'schema':'fun-stormwake-v2',
   'legacy':{'schema':'fun-solo-v1','stage':0,'history':[],'help':0,'mistakes':0,'completed':False,'lessons':[],'pennant':'gold'},
   'mission':{'briefed':True,'parts':['timber','rope','gear'],'weight':1,'bridgeOpen':False,'passenger':False,'complete':False,'chart':False,'checkpoint':'pier'},
   'prefs':{'sound':False,'reducedMotion':False,'quality':'balanced'}}
 def poll(f,expression,want=True):
  for _ in range(80):
   value=f.evaluate(expression)
   if value==want:return value
   f.page.wait_for_timeout(10)
  raise AssertionError({'expression':expression,'wanted':want,'observed':value})
 def touch_button(p,f,selector,down=False):
  box=f.locator(selector).bounding_box();assert box, selector+' is not visible'
  session=p.context.new_cdp_session(p)
  point={'x':box['x']+box['width']/2,'y':box['y']+box['height']/2,'id':7}
  session.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[point]})
  if not down:
   session.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});session.detach()
  return session
 def hold_winch(p,f,frames):
  session=touch_button(p,f,'#swWinch',True)
  poll(f,'StormwakeSnapshot().bridgeWork.holding')
  frame_steps(f,frames)
  session.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});session.detach()
 def open_mechanism(width=1280,height=820):
  p,f,e=setup(width,height,checkpoint=bridge_checkpoint())
  start_play(f);accelerate(f);drive(f,-1.8,21);click_act(f)
  assert f.evaluate('StormwakeSnapshot().modal')=='mechanism'
  return p,f,e
 def repaired_mechanism(width=1280,height=820):
  p,f,e=open_mechanism(width,height)
  assert f.locator('#swFitGear').count()==1, 'The current mission needs a physical repair, not the arithmetic screen'
  assert f.locator('#swWinch').is_disabled()
  assert f.locator('#swSecureBrace').is_disabled()
  touch_button(p,f,'#swFitGear');poll(f,'StormwakeSnapshot().bridgeWork.gear')
  assert f.locator('#swWinch').is_disabled(), 'Gear alone must not make the winch safe'
  touch_button(p,f,'#swSecureBrace');poll(f,'StormwakeSnapshot().bridgeWork.braced')
  assert not f.evaluate('StormwakeSnapshot().mission.bridgeOpen')
  return p,f,e
 def winch_release():
  p,f,e=repaired_mechanism()
  try:
   assert f.evaluate('StormwakeSnapshot().mission.weight')==1, 'No arithmetic answer is required before operating the repaired winch'
   before=f.evaluate('StormwakeSnapshot().bridgeAngle')
   session=touch_button(p,f,'#swWinch',True);poll(f,'StormwakeSnapshot().bridgeWork.holding');frame_steps(f,8)
   partial=f.evaluate('StormwakeSnapshot().bridgeWork.progress');assert 0<partial<1,partial
   session.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});session.detach();poll(f,'StormwakeSnapshot().bridgeWork.holding',False)
   frame_steps(f,80)
   assert f.evaluate('StormwakeSnapshot().bridgeWork.progress')==partial, 'Released winch kept advancing'
   assert f.evaluate('StormwakeSnapshot().bridgeAngle')>before, 'The actual world bridge did not respond'
   assert not f.evaluate('StormwakeSnapshot().mission.bridgeOpen'), 'Partial work opened the navigable channel'
   touch_button(p,f,'#swMechanismClose');poll(f,'StormwakeSnapshot().modal','');click_act(f)
   assert f.evaluate('StormwakeSnapshot().bridgeWork.progress')==partial, 'Stepping away discarded in-tab repairs'
   hold_winch(p,f,180);frame_steps(f,40)
   assert f.evaluate('StormwakeSnapshot().mission.bridgeOpen')
   assert f.evaluate('StormwakeSnapshot().mission.weight')==4, 'Completed bridge must retain the .42 save contract'
   assert f.evaluate('StormwakeSnapshot().bridgeAngle')>1.2
   assert f.evaluate('StormwakeSnapshot().legacy.lessons')==[]
   assert not e,e
  finally:p.close()
 check('trusted touch repairs and raises the real bridge; release stops work and completion saves compatibly',winch_release)
 def winch_interruption():
  p,f,e=repaired_mechanism()
  try:
   session=touch_button(p,f,'#swWinch',True);poll(f,'StormwakeSnapshot().bridgeWork.holding');frame_steps(f,8)
   f.evaluate("dispatchEvent(new Event('blur'))")
   poll(f,'StormwakeSnapshot().bridgeWork.holding',False)
   partial=f.evaluate('StormwakeSnapshot().bridgeWork.progress');frame_steps(f,80)
   assert f.evaluate('StormwakeSnapshot().bridgeWork.progress')==partial
   session.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});session.detach()
   assert f.evaluate('StormwakeSnapshot().modal')=='mechanism', 'Focus loss must preserve the repair panel'
   session=touch_button(p,f,'#swWinch',True);poll(f,'StormwakeSnapshot().bridgeWork.holding');frame_steps(f,8)
   p.evaluate("document.getElementById('game').contentWindow.postMessage({type:'pause',channel:'qa-current-channel',reason:'background'},'*')")
   poll(f,'StormwakeSnapshot().bridgeWork.holding',False)
   partial=f.evaluate('StormwakeSnapshot().bridgeWork.progress');frame_steps(f,100)
   assert f.evaluate('StormwakeSnapshot().bridgeWork.progress')==partial
   assert not f.evaluate('StormwakeSnapshot().mission.bridgeOpen')
   session.send('Input.dispatchTouchEvent',{'type':'touchCancel','touchPoints':[]});session.detach()
   hold_winch(p,f,180);assert f.evaluate('StormwakeSnapshot().mission.bridgeOpen');assert not e,e
  finally:p.close()
 check('focus and parent background pause stop winch work until another deliberate touch',winch_interruption)
 def bridge_layout():
  for width,height in [(1280,820),(768,1024)]:
   p,f,e=repaired_mechanism(width,height)
   try:
    frame_steps(f,100)
    boxes={}
    for selector in ['#swWinch','#swMechanismClose']:
     box=f.locator(selector).bounding_box();assert box,selector
     assert box['x']>=0 and box['y']>=0 and box['x']+box['width']<=width+1 and box['y']+box['height']<=height+1,(selector,box,width,height)
     assert box['height']>=44, 'Touch action is too small'
     boxes[selector]=box
    canvas=capture_canvas(f,'Saltglass-winch-'+str(width)+'x'+str(height)+'-canvas.png')
    (out/('Saltglass-winch-'+str(width)+'x'+str(height)+'-layout.json')).write_text(json.dumps({'scope':'Actual DOM control bounds and separate production WebGL canvas capture','viewport':{'width':width,'height':height},'controls':boxes,'canvas':canvas},indent=2))
    assert not e,e
   finally:p.close()
 check('repair controls fit landscape and portrait touch viewports with actual WebGL canvas captures',bridge_layout)

 def interrupted_pointer_recovery():
  p,f,e=repaired_mechanism()
  try:
   box=f.locator('#swWinch').bounding_box();assert box
   first={'x':box['x']+box['width']*.4,'y':box['y']+box['height']/2,'id':7}
   second={'x':box['x']+box['width']*.6,'y':box['y']+box['height']/2,'id':8}
   session=p.context.new_cdp_session(p)
   session.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[first]})
   poll(f,'StormwakeSnapshot().bridgeWork.holding');frame_steps(f,8)
   f.evaluate("dispatchEvent(new Event('blur'))")
   poll(f,'StormwakeSnapshot().bridgeWork.holding',False)
   partial=f.evaluate('StormwakeSnapshot().bridgeWork.progress');frame_steps(f,40)
   assert f.evaluate('StormwakeSnapshot().bridgeWork.progress')==partial
   # Deliberately omit the first contact's terminal event. A new actual finger
   # must be accepted after interruption even if the browser lost that event.
   session.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[first,second]})
   poll(f,'StormwakeSnapshot().bridgeWork.holding');frame_steps(f,8)
   assert f.evaluate('StormwakeSnapshot().bridgeWork.progress')>partial, 'Old pointer latch blocked a fresh deliberate touch'
   session.send('Input.dispatchTouchEvent',{'type':'touchCancel','touchPoints':[]});session.detach()
   poll(f,'StormwakeSnapshot().bridgeWork.holding',False)
   hold_winch(p,f,180);assert f.evaluate('StormwakeSnapshot().mission.bridgeOpen');assert not e,e
  finally:p.close()
 check('a fresh actual finger can resume winching after interruption loses the first terminal event',interrupted_pointer_recovery)

 def activity_from_real_input():
  p,f,e=setup()
  try:
   assert p.evaluate('qaActivities.length')==0
   f.locator('#swTitleSettings').dispatch_event('pointerdown',{'pointerId':77,'bubbles':True})
   f.locator('#swTitleSettings').dispatch_event('keydown',{'key':'Enter','bubbles':True})
   frame_steps(f,30);p.wait_for_timeout(100)
   assert p.evaluate('qaActivities.length')==0, 'Synthetic input or animation produced activity'
   touch_button(p,f,'#swTitleSettings')
   for _ in range(80):
    if p.evaluate('qaActivities.length'):break
    p.wait_for_timeout(10)
   assert p.evaluate('qaActivities.length')==1, 'Actual trusted game touch did not report activity on the active channel'
   assert p.evaluate('qaActivities[0].channel')=='qa-current-channel'
   f.locator('#swQuality').select_option('low');frame_steps(f,60);p.wait_for_timeout(1100)
   assert p.evaluate('qaActivities.length')==1, 'Progress or elapsed time incorrectly renewed activity'
   touch_button(p,f,'#swSettingsBack')
   for _ in range(80):
    if p.evaluate('qaActivities.length')==2:break
    p.wait_for_timeout(10)
   assert p.evaluate('qaActivities.length')==2, 'Another deliberate touch did not renew activity after throttle interval'
   p.wait_for_timeout(1100)
   f.evaluate("Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'})")
   touch_button(p,f,'#swTitleSettings');p.wait_for_timeout(150)
   assert p.evaluate('qaActivities.length')==2, 'Input while the child reports hidden renewed activity'
   assert not e,e
  finally:p.close()
 check('compiled game reports actual trusted visible input only, never animation or progress',activity_from_real_input)

 def full_mission():
  p,f,e=setup()
  try:
   start_play(f);accelerate(f);drive(f,0,-15);click_act(f);f.locator('#swAcceptMission').dispatch_event('click');drive(f,-7,-8);drive(f,-7,-6);click_act(f);drive(f,0,-2);drive(f,5,2);drive(f,14,2);click_act(f);drive(f,0,9);drive(f,0,13);drive(f,0,20,13.0);click_act(f)
   assert sorted(f.evaluate('StormwakeSnapshot().mission.parts'))==['gear','rope','timber'];drive(f,-1.8,21);click_act(f);assert f.evaluate('StormwakeSnapshot().modal')=='mechanism'
   assert f.locator('#swFitGear').count()==1, 'Rescue requires the mission-linked repair controls'
   assert f.locator('#swWinch').is_disabled(), 'Winch must not open a broken mechanism'
   f.locator('#swFitGear').dispatch_event('click');f.locator('#swSecureBrace').dispatch_event('click')
   hold_winch(p,f,180)
   assert f.evaluate('StormwakeSnapshot().mission.bridgeOpen');frame_steps(f,40)
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
   f.evaluate('window.__qaResizeEvents=0;addEventListener("resize",()=>__qaResizeEvents++);(document.getElementById("swCanvas").getContext("webgl2")||document.getElementById("swCanvas").getContext("webgl")).finish()');p.set_viewport_size({'width':900,'height':700});p.wait_for_timeout(200)
   # The software browser may deliver its native resize after the initial timer.
   # Wait for that real event without advancing simulation or injecting input.
   for _ in range(120):
    if f.evaluate('__qaResizeEvents')>=1:break
    p.wait_for_timeout(100)
   assert f.evaluate('__qaResizeEvents')>=1, 'The browser must deliver an actual viewport resize'
   assert f.evaluate('StormwakeSnapshot().modal')=='', 'Resize must leave active play uninterrupted'
   frame_steps(f,35);assert f.evaluate('StormwakeSnapshot().player.z')==before, 'Resize must cancel held movement and catch-up'
   f.evaluate("dispatchEvent(new KeyboardEvent('keydown',{key:'w'}));__qaStep(3);dispatchEvent(new Event('blur'))");after=f.evaluate('StormwakeSnapshot().player.z')
   assert after!=before, 'Controls must work after resizing';assert f.locator('#swResume').is_visible();frame_steps(f,20);assert f.evaluate('StormwakeSnapshot().player.z')==after
   f.locator('#swResume').dispatch_event('click');frame_steps(f,20);assert f.evaluate('StormwakeSnapshot().player.z')==after;assert not e,e
  finally:p.close()
 check('resize preserves play while lost focus pauses without stuck keys or catch-up',resize_blur)


 def saved_voyage_picture():
  saved=bridge_checkpoint();saved['mission']['parts']=['rope','timber','gear']
  p,f,e=setup(checkpoint=saved)
  try:
   start_play(f);frame_steps(f,50)
   observed=f.evaluate('StormwakeSnapshot()')
   assert observed['mission']==saved['mission'] and observed['prefs']==saved['prefs']
   assert observed['player']['x']==0 and observed['player']['z']==19
   assert observed['renderer']['texturesReady']==8 and observed['renderer']['textureErrors']==0
   png=f.evaluate("()=>{__qaRenderNow();return document.getElementById('swCanvas').toDataURL('image/png')}")
   (out/'Saltglass-saved-voyage-canvas.png').write_bytes(base64.b64decode(png.split(',',1)[1]))
   (out/'saved-voyage-observed.json').write_text(json.dumps(observed,indent=2))
   assert not e,e
  finally:p.close()
 check('known pier-save fixture restores mission and preferences exactly; actual production camera canvas',saved_voyage_picture)

 def crew_clearance():
  p,f,e=setup()
  try:
   start_play(f);accelerate(f);drive(f,0,-15)
   f.evaluate("dispatchEvent(new KeyboardEvent('keydown',{key:'w'}));__qaStep(35);dispatchEvent(new KeyboardEvent('keyup',{key:'w'}))")
   s=f.evaluate('StormwakeSnapshot()');assert .85<=abs(s['player']['z']+15)<1.1,s
   assert s['near']['id']=='talk' and not s['mission']['briefed']
   click_act(f);assert f.locator('#swAcceptMission').is_visible();assert not e,e
  finally:p.close()
 check('actual held walking cannot pass through Bootstrap and talk still works',crew_clearance)


 def context_recovery():
  p,f,e=setup(checkpoint=bridge_checkpoint())
  try:
   start_play(f);before=f.evaluate('StormwakeSnapshot().mission')
   supported=f.evaluate("()=>{window.__qaLostExt=__qaRenderer.gl.getExtension('WEBGL_lose_context');if(!__qaLostExt)return false;__qaLostExt.loseContext();return true;}")
   assert supported,'Browser context-loss extension required for this gate'
   f.wait_for_function('StormwakeSnapshot().contextLost',polling=100)
   assert f.locator('#swRebuild').is_visible()
   p.wait_for_timeout(300);f.evaluate('__qaLostExt.restoreContext()');p.wait_for_timeout(500)
   f.locator('#swRebuild').dispatch_event('click');frame_steps(f,2)
   f.wait_for_function('!StormwakeSnapshot().contextLost && StormwakeSnapshot().renderer.texturesReady===8',polling=100)
   f.evaluate('__qaRenderNow()')
   assert f.evaluate('StormwakeSnapshot().mission')==before
   assert f.evaluate('__qaRenderer.gl.getError()')==0
   assert not e,e
  finally:p.close()
 check('actual WebGL context loss and deliberate rebuild retain the saved mission and reload artwork',context_recovery)

 def legacy_graphics():
  p,f,e=setup(force_legacy=True)
  try:
   start_play(f);s=f.evaluate('StormwakeSnapshot()')
   assert s['renderer']['backend']=='legacy-webgl1' and s['renderer']['frames']>0
   assert s['renderer']['triangles']>10000
   f.evaluate("dispatchEvent(new KeyboardEvent('keydown',{key:'w'}));__qaStep(4);dispatchEvent(new KeyboardEvent('keyup',{key:'w'}))")
   assert f.evaluate('StormwakeSnapshot().player.z')>-21
   assert f.evaluate("document.getElementById('swCanvas').getContext('webgl').getError()") ==0
   assert not e,e
  finally:p.close()
 check('when WebGL2 capability is unavailable the real WebGL1 harbor and walking remain usable',legacy_graphics)

 def quality_modes():
  p,f,e=setup()
  try:
   f.locator('#swTitleSettings').dispatch_event('click')
   for quality in ['low','high','balanced']:
    f.locator('#swQuality').select_option(quality);frame_steps(f,2);f.evaluate('__qaRenderNow()')
    assert f.evaluate('StormwakeSnapshot().prefs.quality')==quality
    assert f.evaluate('__qaRenderer.engine.shadowMap.enabled')==(quality!='low')
    assert f.evaluate('__qaRenderer.gl.getError()')==0
   assert not e,e
  finally:p.close()
 check('all three quality modes resize and render the actual modern scene with the saved preference',quality_modes)

 browser.close()
report={'compiled_html_sha256':hashlib.sha256((r/'stormwake_player.html').read_bytes()).hexdigest(),'results':results,'passed':sum(x['pass'] for x in results),'failed':sum(not x['pass'] for x in results),'scope':'Actual compiled opaque iframe and WebGL2 with all eight embedded maps; synthetic parent/clock; GPU submissions throttled only in behavior cases; actual movement and trusted CDP bridge touches; no native Safari or device performance claim'};(out/'results.json').write_text(json.dumps(report,indent=2));print(json.dumps({'passed':report['passed'],'failed':report['failed']}));sys.exit(bool(report['failed']))

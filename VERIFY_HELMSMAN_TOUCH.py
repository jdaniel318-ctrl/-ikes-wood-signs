"""Helmsman boat controls in actual compiled WebGL player, synthetic parent only.

Usage: CHROMIUM_EXECUTABLE=/path/to/chromium python VERIFY_HELMSMAN_TOUCH.py RELEASE OUTPUT
All page network requests are aborted. CDP delivers actual touch/pointer events.
A deterministic 60Hz animation clock and sparse real renderer draws bound software
GPU cost. Boat.step is wrapped only to observe actual inputs and resulting poses;
no production objects, positions, speed, mission or collision behavior are patched.
This is not a native iPad/Safari performance measurement.
"""
from pathlib import Path
import hashlib,json,os,sys,traceback
from playwright.sync_api import sync_playwright

root=Path(sys.argv[1]).resolve();out=Path(sys.argv[2]).resolve();out.mkdir(parents=True,exist_ok=True)
html=(root/'stormwake_player.html').read_text();results=[];evidence={}
clock="""<script>window.__qaClock=0;window.__qaQueue=[];window.requestAnimationFrame=cb=>{__qaQueue.push(cb);return 1};window.cancelAnimationFrame=()=>{};window.__qaStep=n=>{for(let i=0;i<n;i++){const q=__qaQueue.splice(0);__qaClock+=1000/60;q.forEach(cb=>cb(__qaClock));}};</script>"""
assert '<body>' in html
html=html.replace('<body>','<body>'+clock,1)
state={'schema':'fun-stormwake-v2','legacy':{'schema':'fun-solo-v1','stage':0,'history':[],'help':0,'mistakes':0,'completed':False,'lessons':[],'pennant':'gold'},'mission':{'briefed':True,'parts':['timber','rope','gear'],'weight':4,'bridgeOpen':True,'passenger':False,'complete':False,'chart':False,'checkpoint':'pier'},'prefs':{'sound':False,'reducedMotion':False,'quality':'balanced'}}

with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 def setup():
  ctx=browser.new_context(viewport={'width':1024,'height':700},has_touch=True);p=ctx.new_page();p.set_default_timeout(12000);errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.route('**/*',lambda route:route.abort())
  p.set_content('<style>html,body{margin:0;width:100%;height:100%}iframe{width:100%;height:100%;border:0}</style>')
  p.evaluate("""html=>{const f=document.createElement('iframe');f.id='game';f.setAttribute('sandbox','allow-scripts');f.srcdoc=html;document.body.appendChild(f)}""",html)
  f=p.locator('#game').element_handle().content_frame();f.wait_for_selector('#swLocked')
  p.evaluate("state=>document.getElementById('game').contentWindow.postMessage({type:'start',channel:'helmsman-touch',state},'*')",state);f.wait_for_selector('#swStart')
  f.evaluate("""()=>{const actualDraw=StormGL.Renderer.prototype.draw;let draws=0;StormGL.Renderer.prototype.draw=function(...args){if(++draws===1||draws%300===0||window.__qaDrawOne){window.__qaDrawOne=false;const value=actualDraw.apply(this,args);this.gl.finish();return value}};const actualStep=BlackFlagStormwake.Boat.prototype.step;window.__qaBoatLog=[];BlackFlagStormwake.Boat.prototype.step=function(dt,input,open){const before={x:this.x,z:this.z,yaw:this.yaw,speed:this.speed};const result=actualStep.call(this,dt,input,open);const after={x:this.x,z:this.z,yaw:this.yaw,speed:this.speed};__qaBoatLog.push({dt,input:{...input},before,after,bumped:result.bumped,centerBlocked:BlackFlagStormwake.boatBlocked(this.x,this.z,open),frontBlocked:BlackFlagStormwake.boatBlocked(this.x+Math.sin(this.yaw)*1.1,this.z+Math.cos(this.yaw)*1.1,open)});return result;};}""")
  f.evaluate("window.__qaPointers=[];for(const type of ['pointerdown','pointerup','pointercancel','lostpointercapture'])document.addEventListener(type,e=>__qaPointers.push({type,id:e.pointerId,target:e.target.id}),true)");cdp=ctx.new_cdp_session(p);active={}
  def send(kind):cdp.send('Input.dispatchTouchEvent',{'type':kind,'touchPoints':list(active.values())})
  def wait_thumb(x,y):f.wait_for_function("v=>{const m=new DOMMatrixReadOnly(document.getElementById('swThumb').style.transform);return Math.abs(m.m41-v[0])<.1&&Math.abs(m.m42-v[1])<.1}",arg=[x,y],polling=10)
  def point(i,x,y):return {'id':i,'x':x,'y':y,'radiusX':8,'radiusY':8,'force':1}
  def tap(selector):
   box=f.locator(selector).bounding_box();assert box,selector;active[10]=point(10,box['x']+box['width']/2,box['y']+box['height']/2);send('touchStart');active.pop(10);send('touchEnd');p.wait_for_timeout(20)
  def stick(x,z):
   box=f.locator('#swStick').bounding_box();assert box;r=box['width']*.34;kind='touchMove' if 1 in active else 'touchStart';active[1]=point(1,box['x']+box['width']/2+x*r,box['y']+box['height']/2-z*r);send(kind);length=max(1,(x*x+z*z)**.5);wait_thumb(x*r/length,-z*r/length)
  def release(i):
   seen=f.evaluate('__qaPointers.length');ended=active.pop(i);cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[ended]});f.wait_for_function("v=>__qaPointers.slice(v[0]).some(e=>e.type==='pointerup'&&e.target===v[1])",arg=[seen,'swJump' if i==2 else 'swStick'],polling=10)
  def cancel():
   targets=['swJump' if i==2 else 'swStick' for i in active];seen=f.evaluate('__qaPointers.length');active.clear();send('touchCancel');f.wait_for_function("v=>v[1].every(target=>__qaPointers.slice(v[0]).some(e=>e.type==='pointercancel'&&e.target===target))",arg=[seen,targets],polling=10);wait_thumb(0,0)
  def brake():
   box=f.locator('#swJump').bounding_box();assert box;seen=f.evaluate('__qaPointers.length');active[2]=point(2,box['x']+box['width']/2,box['y']+box['height']/2);send('touchStart');f.wait_for_function("n=>__qaPointers.slice(n).some(e=>e.type==='pointerdown'&&e.target==='swJump')",arg=seen,polling=10)
  def step(n):f.evaluate('(n)=>__qaStep(n)',n)
  def snapshot():return f.evaluate('StormwakeSnapshot()')
  def log():return f.evaluate('__qaBoatLog')
  def shot(name):f.evaluate('__qaDrawOne=true;__qaStep(1)');p.screenshot(path=str(out/name),timeout=40000)
  tap('#swStart');step(2);stick(-1,0);step(36);cancel();step(1);assert snapshot()['near']['id']=='board',snapshot();tap('#swInteract');step(1)
  assert snapshot()['mode']=='boat',snapshot();assert 'Brake' in f.locator('#swJump').inner_text();assert 'THROTTLE' in f.locator('#swStickLabel').inner_text();assert not errors,errors
  return ctx,p,f,errors,stick,release,cancel,brake,step,snapshot,log,shot
 def case(name,fn):
  if os.environ.get('HELMSMAN_CASE') and os.environ['HELMSMAN_CASE'] not in name:return
  try:fn();results.append({'name':name,'pass':True});print('PASS',name,flush=True)
  except Exception as exc:results.append({'name':name,'pass':False,'error':str(exc)});print('FAIL',name,str(exc)[:600],flush=True);traceback.print_exc()
 def propulsion():
  ctx,p,f,errors,stick,release,cancel,brake,step,snap,log,shot=setup()
  try:
   before=snap()['boat'];stick(0,1);step(90);forward=snap()['boat'];assert forward['speed']>2 and forward['z']>before['z']+1,(before,forward)
   stick(0,-1);step(210);reverse=snap()['boat'];assert reverse['speed']<-1 and reverse['z']<forward['z']-.5,(forward,reverse)
   assert any(x['input']['throttle']>.99 for x in log());assert any(x['input']['throttle']<-.99 for x in log());assert not errors,errors
   evidence['propulsion']={'start':before,'forward':forward,'reverse':reverse,'actual_step_count':len(log())};shot('Helmsman-touch-propulsion.png')
  finally:ctx.close()
 case('real touch boards launch and drives forward and reverse',propulsion)
 def brake_lifecycle():
  ctx,p,f,errors,stick,release,cancel,brake,step,snap,log,shot=setup()
  try:
   stick(0,1);step(60);speed=snap()['boat']['speed'];brake();step(30);held=log()[-30:];assert all(abs(x['input']['throttle'])<1e-9 for x in held),held[-1];assert snap()['boat']['speed']<speed-.5
   release(2);step(6);evidence['brake_release_diagnostic']={'events':f.evaluate('__qaPointers'),'last_steps':log()[-8:],'thumb':f.locator('#swThumb').evaluate('(e)=>e.style.transform')};assert log()[-1]['input']['throttle']>.99,'Brake release remained latched while stick was held: '+json.dumps(evidence['brake_release_diagnostic'])
   released_throttle=log()[-1]['input']['throttle'];brake();step(6);assert log()[-1]['input']['throttle']==0;cancel();step(6);assert log()[-1]['input']=={'throttle':0,'steer':0},log()[-1];assert f.locator('#swThumb').evaluate('(e)=>e.style.transform')=='translate(0px, 0px)'
   stick(0,1);step(6);assert log()[-1]['input']['throttle']>.99,'Cancelled brake remained latched on a fresh stick press'
   release(1);step(6);assert log()[-1]['input']=={'throttle':0,'steer':0};assert not errors,errors
   evidence['brake']={'before_brake_speed':speed,'held_samples':len(held),'released_brake_throttle':released_throttle,'final_input':log()[-1]['input'],'actual_step_count':len(log())};shot('Helmsman-touch-brake-cleared.png')
  finally:ctx.close()
 case('simultaneous brake release and cancellation do not latch boat inputs',brake_lifecycle)
 def collision_escape():
  ctx,p,f,errors,stick,release,cancel,brake,step,snap,log,shot=setup()
  # Radial thumbstick directions; diagonals normalize naturally to +/-sqrt(1/2).
  actions=[(0,1,100),(1,1,295),(-1,1,1)]
  try:
   for x,z,n in actions:
    stick(x,z);before_count=len(log());step(n);actual=log()[before_count:];scale=max(1,(x*x+z*z)**.5);assert all(abs(v['input']['throttle']-z/scale)<1e-5 and abs(v['input']['steer']+x/scale)<1e-5 for v in actual),'Touch input had not reached actual Boat.step'
   contact=snap()['boat'];path=log();invalid=[x for x in path if x['centerBlocked'] or x['frontBlocked']];assert any(x['bumped'] for x in path),'Contact path never reached collision'
   stick(0,-1);before_count=len(log());step(600);assert all(v['input']['throttle']<-.99 and abs(v['input']['steer'])<1e-5 for v in log()[before_count:]);escaped=snap()['boat'];distance=((escaped['x']-contact['x'])**2+(escaped['z']-contact['z'])**2)**.5
   evidence['collision']={'actions':[{'joyX':x,'joyZ':z,'frames':n} for x,z,n in actions],'contact':contact,'reverse_after_10_simulated_seconds':escaped,'reverse_distance':distance,'invalid_committed_poses':len(invalid),'first_invalid_pose':invalid[0] if invalid else None,'actual_step_count':len(log())};(out/'collision-evidence.json').write_text(json.dumps(evidence['collision'],indent=2));shot('Helmsman-touch-collision-reverse.png')
   assert not invalid,'Actual thumbstick path committed a blocked boat pose: '+json.dumps(invalid[0])
   assert distance>1,'Reverse could not escape contact: '+json.dumps(evidence['collision']);assert not errors,errors
  finally:ctx.close()
 case('real thumbstick collision path keeps a valid pose and can reverse away',collision_escape)
 browser.close()
summary={'compiled_html_sha256':hashlib.sha256((root/'stormwake_player.html').read_bytes()).hexdigest(),'results':results,'passed':sum(x['pass'] for x in results),'failed':sum(not x['pass'] for x in results),'evidence':evidence,'scope':'Actual compiled iframe and Boat.step; real CDP touch; synthetic parent/checkpoint/60Hz clock; sparse actual WebGL draws; all page network blocked; no native performance claim'}
(out/'results.json').write_text(json.dumps(summary,indent=2));print(json.dumps({'passed':summary['passed'],'failed':summary['failed']}));sys.exit(bool(summary['failed']))

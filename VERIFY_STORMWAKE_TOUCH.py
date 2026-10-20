"""Real-clock, real-pointer WebGL/UI smoke. Software GPU, synthetic parent only.
No camera, account, business data or state-writer test hooks. DISPLAY=:99 on headless Linux.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import sys,json,traceback,os
r=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True);results=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 def setup(w=1280,h=820):
  ctx=b.new_context(viewport={'width':w,'height':h},has_touch=True);p=ctx.new_page();p.set_default_timeout(15000);errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.route('**/*',lambda x:x.abort());p.set_content('<style>html,body{margin:0;width:100%;height:100%}iframe{width:100%;height:100%;border:0}</style>');p.evaluate('''html=>{const f=document.createElement('iframe');f.id='game';f.setAttribute('sandbox','allow-scripts');f.srcdoc=html;document.body.appendChild(f)}''',(r/'stormwake_player.html').read_text());f=p.locator('#game').element_handle().content_frame();f.wait_for_selector('#swLocked');p.evaluate("document.querySelector('#game').contentWindow.postMessage({type:'start',channel:'touch-fixture',state:{schema:'fun-stormwake-v2',legacy:{schema:'fun-solo-v1',stage:6,history:['shore','hull','cargo','channel','sail','gate'],help:0,mistakes:0,completed:true,lessons:[],pennant:'gold'},mission:{briefed:false,parts:[],weight:1,bridgeOpen:false,passenger:false,complete:false,chart:false,checkpoint:'arrival'},prefs:{sound:false,reducedMotion:false,quality:'balanced'}}},'*')");f.wait_for_selector('#swStart');return ctx,p,f,errors
 def case(name,fn):
  if os.environ.get('SW_TOUCH') and os.environ['SW_TOUCH'] not in name:return
  try:fn();results.append({'name':name,'pass':True});print('PASS',name,flush=True)
  except Exception as e:results.append({'name':name,'pass':False,'error':str(e)});print('FAIL',name,str(e)[:320],flush=True);traceback.print_exc()
 def native_pointer():
  ctx,p,f,errs=setup()
  try:
   f.locator('#swStart').click();f.wait_for_selector('#swModal',state='hidden');f.wait_for_function('()=>Math.hypot(StormwakeSnapshot().camera.eye[0]-StormwakeSnapshot().player.x,StormwakeSnapshot().camera.eye[2]-StormwakeSnapshot().player.z)<9',polling=100);p.wait_for_timeout(500);assert f.evaluate('StormwakeSnapshot().renderer.frames')>3
   p.screenshot(path=str(out/'Stormwake-harbor-gameplay.png'));cdp=ctx.new_cdp_session(p);pad=f.locator('#swStick').bounding_box();jump=f.locator('#swJump').bounding_box();assert pad and jump
   def point(i,x,y):return {'id':i,'x':x,'y':y,'radiusX':8,'radiusY':8,'force':1}
   x,y=pad['x']+pad['width']/2,pad['y']+pad['height']/2;a=point(1,x,y);start=f.evaluate('StormwakeSnapshot().player.z');cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[a]});a=point(1,x,y-42);cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[a]});p.wait_for_timeout(650);assert f.evaluate('StormwakeSnapshot().player.z')>start+.1
   f.evaluate("window.__qaJumpMax=1.6;window.__qaWatchJump=true;window.__qaJumpEvents=[];document.addEventListener('pointerdown',e=>__qaJumpEvents.push(e.target.id),true);function observeJump(){__qaJumpMax=Math.max(__qaJumpMax,StormwakeSnapshot().player.y);if(__qaWatchJump)requestAnimationFrame(observeJump)}requestAnimationFrame(observeJump);");j=point(2,jump['x']+jump['width']/2,jump['y']+jump['height']/2);cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[a,j]});f.wait_for_function('()=>__qaJumpMax>1.65',polling=100,timeout=20000);f.evaluate('window.__qaWatchJump=false');assert f.evaluate('__qaJumpMax')>1.65,f.evaluate('({max:__qaJumpMax,events:__qaJumpEvents,s:StormwakeSnapshot()})')
   cdp.send('Input.dispatchTouchEvent',{'type':'touchCancel','touchPoints':[]});stop=f.evaluate('StormwakeSnapshot().player.z');p.wait_for_timeout(350);assert abs(f.evaluate('StormwakeSnapshot().player.z')-stop)<.15
   f.locator('#swJournal').click();assert f.locator('#swFunctions').is_visible();assert f.evaluate('StormwakeSnapshot().modal')=='journal';p.screenshot(path=str(out/'Stormwake-journal.png'));assert not errs,errs
  finally:ctx.close()
 case('real pointer entry and simultaneous touch movement/jump with cancellation',native_pointer)
 for w,h in [(1024,560),(1024,640),(1366,900),(390,700),(430,800)]:
  def layout(w=w,h=h):
   ctx,p,f,errs=setup(w,h)
   try:
    f.locator('#swStart').click();f.wait_for_selector('#swModal',state='hidden');p.wait_for_timeout(400);assert f.evaluate('document.documentElement.scrollWidth<=innerWidth+1');
    for sel in ['#swStick','#swJump','#swInteract','#swRecenter','#swJournal','#swPause']:
     v=f.locator(sel).bounding_box();assert v and v['x']>=0 and v['y']>=0 and v['x']+v['width']<=w+1 and v['y']+v['height']<=h+1,(sel,v);assert v['height']>=44
    f.locator('#swPause').click();f.locator('#swResume').click();assert f.evaluate('StormwakeSnapshot().modal')=='';p.screenshot(path=str(out/f'Stormwake-{w}x{h}.png'));assert not errs,errs
   finally:ctx.close()
  case(f'visible playable controls and scrollable panels {w}x{h}',layout)
 def graphics():
  ctx,p,f,errs=setup()
  try:
   f.locator('#swStart').click();f.evaluate("document.querySelector('#swCanvas').getContext('webgl').getExtension('WEBGL_lose_context').loseContext()");f.wait_for_selector('#swGraphicsLegacy');assert f.evaluate('StormwakeSnapshot().contextLost');assert not f.evaluate('StormwakeSnapshot().mission.complete');f.locator('#swGraphicsLegacy').click();f.frame_locator('#swLegacyShell iframe').locator('#chartNav').wait_for();assert not errs,errs
  finally:ctx.close()
 case('real graphics-context loss pauses safely and offers preserved original game',graphics)
 def sky_horizon():
  ctx,p,f,e=setup(640,480)
  try:
   values=f.evaluate("""()=>{const c=document.createElement('canvas');c.style.width='160px';c.style.height='100px';document.body.appendChild(c);c.width=160;c.height=100;const rr=new StormGL.Renderer(c);rr.draw(new StormGL.Node(),{eye:[0,2,0],target:[0,2,1]},0);const data=new Uint8Array(c.width*4);rr.gl.readPixels(0,0,c.width,1,rr.gl.RGBA,rr.gl.UNSIGNED_BYTE,data);const red=[];for(let i=0;i<data.length;i+=4)red.push(data[i]);rr.dispose();c.remove();return {variation:Math.max(...red)-Math.min(...red),min:Math.min(...red)}}""");assert values['min']>60;assert values['variation']<=2,values
  finally:ctx.close()
 case('sky clouds fade at the horizon instead of making vertical ground-level bands',sky_horizon)

 b.close()
(out/'results.json').write_text(json.dumps(results,indent=2));print(json.dumps({'passed':sum(x['pass'] for x in results),'failed':sum(not x['pass'] for x in results)}));sys.exit(any(not x['pass'] for x in results))

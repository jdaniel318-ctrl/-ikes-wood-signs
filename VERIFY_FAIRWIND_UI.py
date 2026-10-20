"""Actual camera capture with synthetic full video frames + shipped layout.
No device camera, account, backend, or existing storage access."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import sys,shutil,re,json,traceback
r=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True);results=[];src=(r/'app.js').read_text();m=re.search(r'^  function captureCameraPhoto\(',src,re.M);capture=src[m.start():src.index('\n  }',m.start())+4]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 for w,h in [(1366,912),(1024,768),(390,900),(390,700)]:
  for vw,vh in [(1920,1080),(1280,960),(720,1280)]:
   name=f'{w}x{h} full-frame live/review stream {vw}x{vh}';p=b.new_page(viewport={'width':w,'height':h})
   try:
    p.route('**/*',lambda route:route.abort());p.set_content('<html><body class="hw-viewport ikes-project project-mode"><div style="width:92%;margin:20px auto"><div id="cameraPanel" class="camera-panel"><video id="cameraVideo" class="camera-video active" playsinline muted></video><canvas id="cameraCanvas" hidden></canvas></div><div id="photoFrame" class="photo-frame has-photo hidden"><img id="woodPhoto" alt="synthetic frame"></div><p id="photoError"></p><p id="photoHelp"></p></div></body></html>')
    for css in ['styles.css','fleet_viewport.css']:p.add_style_tag(content=(r/css).read_text())
    p.evaluate('''async cfg=>{window.$=id=>document.getElementById(id);window.state={};window.activeProjectId='ikes-wood-signs';window.headwayResetPlank=()=>{};window.analyzeIkePlankPhoto=()=>{};window.stopCamera=()=>{cameraVideo.pause();};window.updateUi=()=>{woodPhoto.src=state.photoData;cameraPanel.classList.add('hidden');photoFrame.classList.remove('hidden');};let c=document.createElement('canvas');c.width=cfg.w;c.height=cfg.h;const ctx=c.getContext('2d');ctx.fillStyle='#d0d5cf';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#133e71';ctx.fillRect(0,0,c.width,20);ctx.fillStyle='#bb7733';ctx.fillRect(0,c.height-20,c.width,20);ctx.fillStyle='#144';ctx.fillRect(0,0,20,c.height);ctx.fillRect(c.width-20,0,20,c.height);cameraVideo.srcObject=c.captureStream(5);window.syntheticStream=cameraVideo.srcObject;await cameraVideo.play();}''',{'w':vw,'h':vh})
    p.wait_for_function('cameraVideo.videoWidth>0');p.add_script_tag(content=capture)
    live=p.evaluate('''()=>{const v=cameraVideo.getBoundingClientRect(),f=cameraPanel.getBoundingClientRect();return {w:v.width,h:v.height,pw:f.width,ph:f.height,fit:getComputedStyle(cameraVideo).objectFit,center:getComputedStyle(cameraVideo).objectPosition}}''')
    p.evaluate('captureCameraPhoto()');p.wait_for_function('woodPhoto.complete&&woodPhoto.naturalWidth>0')
    review=p.evaluate('''()=>{const v=woodPhoto.getBoundingClientRect(),f=photoFrame.getBoundingClientRect();return {w:v.width,h:v.height,pw:f.width,ph:f.height,fit:getComputedStyle(woodPhoto).objectFit,center:getComputedStyle(woodPhoto).objectPosition,cw:cameraCanvas.width,ch:cameraCanvas.height,error:photoError.textContent}}''')
    assert live['fit']==review['fit']=='contain';assert live['center']==review['center']=='50% 50%'
    assert abs(live['pw']-review['pw'])<1 and abs(live['ph']-review['ph'])<1,(live,review)
    assert abs(live['w']-review['w'])<1 and abs(live['h']-review['h'])<1,(live,review)
    assert abs(review['cw']/review['ch']-vw/vh)<.002 and not review['error'],review
    results.append({'name':name,'pass':True});print('PASS',name,flush=True)
   except Exception as e:results.append({'name':name,'pass':False,'error':str(e)});print('FAIL',name,str(e)[:240],flush=True)
   finally:p.evaluate('window.syntheticStream?.getTracks().forEach(t=>t.stop())');p.close()
 b.close()
(out/'results.json').write_text(json.dumps(results,indent=2));print('TOTAL',len(results),'PASS',sum(x['pass'] for x in results));sys.exit(any(not x['pass'] for x in results))

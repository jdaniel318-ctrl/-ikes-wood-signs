"""Actual shipped photo markup/CSS: same full frame before and after capture.
Synthetic video/photo only. No hardware camera, user data, or live services.
"""
import sys, json, shutil, re, base64
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True);results=[]
soup=BeautifulSoup((root/'index.html').read_text(),'html.parser');section=soup.select_one('[data-screen="photo"]');section['class']='screen active'
with sync_playwright() as w:
 browser=w.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 for viewport in [(1024,640),(768,900),(390,700)]:
  for size in [(1920,1080),(1200,900),(900,1200)]:
   p=browser.new_page(viewport={'width':viewport[0],'height':viewport[1]});p.route('**/*',lambda r:r.abort())
   name=f'{viewport[0]}x{viewport[1]} screen, {size[0]}x{size[1]} frame'
   try:
    p.set_content('<html><body class="hw-viewport ikes-project project-mode ikes-flow-active"><div id="app"><main id="customerApp">'+str(section)+'</main></div></body></html>')
    for css in ['styles.css','fleet_viewport.css']:p.add_style_tag(content=(root/css).read_text())
    metrics=p.evaluate('''async([w,h])=>{const video=document.getElementById('cameraVideo'),image=document.getElementById('woodPhoto'),panel=document.getElementById('cameraPanel'),review=document.getElementById('photoFrame');
const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle='#193b46';x.fillRect(0,0,w,h);x.fillStyle='#e3bf68';x.fillRect(0,0,w*.12,h*.12);x.fillStyle='#cc5555';x.fillRect(w*.88,0,w*.12,h*.12);x.fillStyle='#dddddd';x.fillRect(0,h*.88,w*.12,h*.12);x.fillStyle='#339977';x.fillRect(w*.88,h*.88,w*.12,h*.12);
video.srcObject=c.captureStream(2);video.muted=true;await video.play();video.classList.add('active');document.getElementById('cameraIdle').classList.add('hidden');const a=panel.getBoundingClientRect();const live={fit:getComputedStyle(video).objectFit,pos:getComputedStyle(video).objectPosition,width:a.width,height:a.height};image.src=c.toDataURL();await image.decode();review.classList.remove('hidden','placeholder');review.classList.add('has-photo');panel.classList.add('hidden');const b=review.getBoundingClientRect();const after={fit:getComputedStyle(image).objectFit,pos:getComputedStyle(image).objectPosition,width:b.width,height:b.height};video.srcObject.getTracks().forEach(t=>t.stop());return {live,after,overflow:document.documentElement.scrollWidth>innerWidth};}''',size)
    assert metrics['live']['fit']=='contain',metrics
    assert metrics['after']['fit']=='contain',metrics
    assert abs(metrics['live']['width']-metrics['after']['width'])<1.1,metrics
    assert abs(metrics['live']['height']-metrics['after']['height'])<1.1,metrics
    assert metrics['live']['pos']==metrics['after']['pos'],metrics
    assert not metrics['overflow'],metrics
    results.append({'name':name,'pass':True,'metrics':metrics});print('PASS',name,flush=True)
    if viewport==(1024,640) and size==(1200,900):p.screenshot(path=str(out/'review-framing-1024.png'),full_page=True)
   except Exception as e:results.append({'name':name,'pass':False,'error':str(e)});print('FAIL',name,str(e)[:200],flush=True)
   finally:p.close()
 browser.close()
(out/'results.json').write_text(json.dumps(results,indent=2));sys.exit(1 if any(not x['pass'] for x in results) else 0)

"""Actual shipped HTML/CSS with synthetic screen state; no network or records. Not native Safari."""
from pathlib import Path
import sys,json,shutil,base64
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True);res=[]
with sync_playwright() as w:
 browser=w.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 def setup(width=1024,height=640,screen='ike-plank'):
  p=browser.new_page(viewport={'width':width,'height':height});p.route('**/*',lambda r:r.abort())
  s=BeautifulSoup((root/'index.html').read_text(),'html.parser');app=s.find(id='app');main=s.find(id='customerApp');header=app.find('header',recursive=False);section=main.select_one('[data-screen="'+screen+'"]');section['class']=list(set(section.get('class',[])+['active']))
  for e in section.select('img'):
   src=root/e.get('src','');asset=src if src.is_file() else root/'ike_calibration_2ft_cedar_reference.jpg';e['src']='data:image/'+('png' if asset.suffix=='.png' else 'jpeg')+';base64,'+base64.b64encode(asset.read_bytes()).decode()
  for im in header.select('img[src]'):
   f=root/im.get('src','');
   if f.is_file():im['src']='data:image/png;base64,'+base64.b64encode(f.read_bytes()).decode()
  html='<html><head></head><body class="project-mode ikes-project ikes-flow-active"><div id="app" class="app-shell">'+str(header)+'<div id="experienceModeBanner" class="experience-mode-banner"><span><b>PRIVATE PREVIEW • NO RECORDS</b><small>Ike’s Wood Signs</small></span><button>RETURN TO TEST DECK</button></div><main id="customerApp" class="main-panel">'+str(section)+'<div class="mini-brand">Ike duplicate decorative footer</div></main></div></body></html>'
  p.set_content(html);p.add_style_tag(content=(root/'styles.css').read_text())
  if (root/'fleet_viewport.css').exists():p.add_style_tag(content=(root/'fleet_viewport.css').read_text())
  if (root/'fleet_viewport.js').exists():p.evaluate((root/'fleet_viewport.js').read_text())
  p.evaluate("document.documentElement.classList.remove('dark-sky-release-preflight','dark-sky-route-preflight');document.body.classList.remove('boot-locked')")
  p.wait_for_timeout(90);return p
 def run(n,f):
  try:f();res.append({'test':n,'pass':True});print('PASS',n)
  except Exception as e:res.append({'test':n,'pass':False,'error':str(e)});print('FAIL',n,str(e)[:200])
 def nav():
  p=setup(390,700)
  try:
   assert p.evaluate('!!window.BlackFlagViewport'),'navigation adapter missing'
   p.evaluate("document.body.insertAdjacentHTML('beforeend','<div style=\"height:2200px\"></div>');window.scrollTo(0,200);BlackFlagViewport.enter({key:'owner:ikes:orders',reason:'new'});BlackFlagViewport.enter({key:'owner:ikes:list',reason:'back',position:140})")
   p.wait_for_timeout(100);assert abs(p.evaluate('scrollY')-140)<2
   p.evaluate("BlackFlagViewport.enter({key:'same',reason:'input'});BlackFlagViewport.enter({key:'same',reason:'resize'});BlackFlagViewport.enter({key:'same',reason:'recheck'})")
   p.wait_for_timeout(100);assert abs(p.evaluate('scrollY')-140)<2
   p.evaluate("BlackFlagViewport.enter({key:'owner:new',reason:'new'})");p.wait_for_timeout(100);assert p.evaluate('scrollY')==0
  finally:p.close()
 run('new/back cancellation and no reset during input or recheck',nav)
 for width,height in [(1024,640),(1024,768),(1366,900),(768,900),(390,700),(430,800)]:
  def check(width=width,height=height):
   p=setup(width,height)
   try:
    assert p.evaluate('!!window.BlackFlagViewport'),'viewport adapter missing'
    p.evaluate("BlackFlagViewport.enter({key:'customer:ike-plank',reason:'new'})");p.wait_for_timeout(150)
    rect=p.locator('[data-screen="ike-plank"] h2').bounding_box();banner=p.locator('#experienceModeBanner').bounding_box();assert rect and banner and rect['y']>=banner['y']+banner['height']-1,(rect,banner)
    assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'horizontal overflow'
    assert p.locator('#ikeConfirmPlankBtn').evaluate('(e)=>e.getBoundingClientRect().height')>=44
    if width>=1000:assert p.locator('#ikeConfirmPlankBtn').bounding_box()['y']+p.locator('#ikeConfirmPlankBtn').bounding_box()['height']<=height,(p.locator('#ikeConfirmPlankBtn').bounding_box(),height)
    p.screenshot(path=str(out/f'plank-{width}-{height}.png'),full_page=True)
   finally:p.close()
  run(f'plank layout {width}x{height}',check)
 for screen,which in [('welcome','#projectStartButton'),('photo','#startCameraBtn'),('photo-review','#usePhotoBtn')]:
  for width,height in [(1024,640),(390,700)]:
   def task(screen=screen,which=which,width=width,height=height):
    p=setup(width,height,screen='photo' if screen=='photo-review' else screen)
    try:
     if screen=='photo-review':p.evaluate("document.getElementById('cameraPanel').classList.add('hidden');document.getElementById('cameraControls').classList.add('hidden');document.getElementById('photoFrame').classList.remove('hidden','placeholder');document.getElementById('photoFrame').classList.add('has-photo');document.getElementById('photoReviewControls').classList.remove('hidden')")
     p.wait_for_timeout(100);assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1');b=p.locator(which).bounding_box();assert b and b['height']>=44
     p.screenshot(path=str(out/f'{screen}-{width}-{height}.png'),full_page=True)
     if width>=1000:assert b['y']+b['height']<=height,(screen,b,height)
    finally:p.close()
   run(f'{screen} primary action visible {width}x{height}',task)
 browser.close()
(out/'results.json').write_text(json.dumps(res,indent=2));raise SystemExit(0 if all(x['pass'] for x in res) else 1)

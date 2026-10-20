"""Actual Woodwright design/approval functions and event handlers; isolated browser.
Synthetic auth/stock and pricing. Optional photograph is a screenshot-derived diagnostic,
never a claim of camera bytes or CNC geometry. No access to live user storage.
Usage: python VERIFY_WOODWRIGHT_UI.py RELEASE OUT [PHOTO]
"""
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import sys,re,base64,json,shutil,traceback,hashlib,os
from PIL import Image,ImageDraw
root=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True);src=(root/'app.js').read_text();results=[]
if len(sys.argv)>3: pp=Path(sys.argv[3])
else:
 pp=out/'synthetic-board.png';im=Image.new('RGB',(640,360),(192,183,166));ImageDraw.Draw(im).rectangle((120,100,525,278),fill=(180,117,69));im.save(pp)
photo='data:image/png;base64,'+base64.b64encode(pp.read_bytes()).decode()
def extract(n):
 m=re.search(r'^  (?:async )?function '+n+r'\(',src,re.M)
 if not m:raise AssertionError('Missing '+n)
 return src[m.start():src.find('\n  }\n',m.start())+5]
names=['headwayContext','headwayResetPlank','headwayPhotoContext','headwayRefreshRecognition','headwaySizeMarkup','headwayWoodMarkup','headwayPreviewDecision','headwayDraft','headwaySaveJob','headwayRenderPlank','recalcIkePrice','ikeRecognitionForOrder','stageIkeApprovalArtifact','lockIkeApprovedDesign','verifyIkeApprovalCandidate','invalidateIkeApprovedDesignLock','ikeCurrentRenderLock','ikeFastHash','ikeDesignLockHashPayload','ikeCaptureLiveRenderSpec','renderIkeApprovedArtifact','ikeFontBlueprint','ikeImageContentRect','applyPreview','updateUi','updateIkePhotoOrientationFeedback','selectButtons','fillColor','setScreen','ikeAnalyzePlankPixelsProven','runIkeApprovedArtifactAutomatedVoyage']
functions='\n'.join(extract(n) for n in names)
a=src.index('  // WOODWRIGHT FIT ADAPTER:');e=src.index('  function ikeVisualSpeciesEvidence(',a);adapter=src[a:e]
handlers='\n'.join(line for line in src.splitlines() if any("$('"+n+"')?.addEventListener" in line for n in ['ikeFontChoices','ikeFillChoices','woodwrightAreaOk','ikeDesignNextBtn','ikeApproveDesignBtn','ikeEditDesignBtn']))
# Actual wording handler body is exercised through the same input listener expression.
word='''document.getElementById('ikeWordingInput').addEventListener('input',e=>{invalidateIkeApprovedDesignLock();state.wording=String(e.target.value||'');updateUi();});'''
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 def setup(width=1366,height=1024,source=photo,mode='preview'):
  p=b.new_page(viewport={'width':width,'height':height});p.set_default_timeout(5000);errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.route('**/*',lambda r:r.abort())
  soup=BeautifulSoup((root/'index.html').read_text(),'html.parser');main=soup.find(id='customerApp');header=soup.find(id='app').find('header',recursive=False)
  for tag in main.select('script'):tag.decompose()
  for im in header.select('img[src]'):
   f=root/im['src'];
   if f.is_file():im['src']='data:image/png;base64,'+base64.b64encode(f.read_bytes()).decode()
  p.set_content('<html><body class="project-mode ikes-project ikes-flow-active"><div id="app" class="app-shell">'+str(header)+'<div id="experienceModeBanner" class="experience-mode-banner"><span><b>PRIVATE PREVIEW · NO RECORDS</b><small>Woodwright diagnostic • not camera/CNC certification</small></span><button>RETURN TO TEST DECK</button></div>'+str(main)+'</div></body></html>')
  for css in ['styles.css','fleet_viewport.css']:p.add_style_tag(content=(root/css).read_text())
  for js in ['fleet_viewport.js','headway_contracts.js','ike_style_registry.js','woodwright_fit.js']:p.add_script_tag(content=(root/js).read_text())
  p.evaluate('''async(cfg)=>{const $=id=>document.getElementById(id),$$=s=>[...document.querySelectorAll(s)];let activeProjectId='ikes-wood-signs',mode=cfg.mode;const state={current:'ike-design',photoData:cfg.photo,photoOriginalData:cfg.photo,photoQuarterTurns:0,wording:'',font:'B',fontChosen:false,fill:'Black',allowCustomColors:true,letterSize:'Ike Fit',price:0,customColor:'#1f6feb',orientation:'Horizontal',topSide:'Top of photo',plankRecognition:{orientation:'Horizontal',orientationResolved:true,status:'detected'}};
const activeProject=()=>({id:activeProjectId}),currentExperienceContext=()=>({state:mode}),projectById=()=>activeProject(),activeProjectReferences=()=>[],customerExperienceForProject=()=>({businessName:"Ike's Wood Signs"}),businessConfig={businessName:"Ike's Wood Signs"},ikeSpeciesRate=id=>id==='cedar'?9:0,IKE_PRODUCTION_CONTRACT={version:'woodwright-photo-fit-v1-not-production-certified',productionCertified:false};
const currentScreenOrder=()=>['welcome','photo','ike-plank','ike-design','ike-approve','customer','review','done'],saveDraft=()=>{},stopCamera=()=>{},renderSummary=()=>{};
window.__writes=0;window.fetch=()=>{__writes++;throw Error('No network permitted')};window.putOrder=()=>{__writes++;throw Error('No store permitted')};window.alert=m=>window.__alert=m;
'''+adapter+functions+handlers+word+'''
window.wwTest={state,update:updateUi,frame:()=>woodwrightFrame,scene:()=>woodwrightScene,ensure:woodwrightEnsureFrame,ready:woodwrightFitReady,selftest:runIkeApprovedArtifactAutomatedVoyage,stage:stageIkeApprovalArtifact,accept:lockIkeApprovedDesign,save:headwaySaveJob,
 set:(k,v)=>{invalidateIkeApprovedDesignLock();state[k]=v;updateUi();},project:p=>{activeProjectId=p;woodwrightReset();},mode:m=>{mode=m;woodwrightUpdateStatus();},photo:async u=>{invalidateIkeApprovedDesignLock();state.photoData=u;state.photoOriginalData=u;await headwayPhotoContext();updateUi();}};
await headwayPhotoContext();await headwayPreviewDecision('size');await headwayPreviewDecision('wood');setScreen('ike-design');
}''',{'photo':source,'mode':mode})
  return p,errors
 def case(name,f):
  if os.environ.get('WW_CASE') and os.environ['WW_CASE'] not in name:return
  try:f();results.append({'name':name,'pass':True});print('PASS',name,flush=True)
  except Exception as e:results.append({'name':name,'pass':False,'error':str(e)});print('FAIL',name,str(e)[:200],flush=True);traceback.print_exc()
 def home(p,text='HOME',fill='White'):
  p.locator('[data-ike-font="B"]').click();p.locator('#ikeWordingInput').fill(text);p.locator('[data-ike-fill="'+fill+'"]').click();p.evaluate('wwTest.ensure()');p.wait_for_function('wwTest.frame()?.ok===true');p.locator('#ikeWordingInput').blur()
 def fitted():
  p,err=setup()
  try:
   home(p);f=p.evaluate('wwTest.frame()');assert f['proof']['outsidePixels']==0;assert f['region']['x']>.15;assert f['exactText']=='HOME';assert p.locator('#ikeDesignNextBtn').is_disabled();assert p.locator('#woodwrightAreaOk').is_enabled();assert not err,err
   p.screenshot(path=str(out/'woodwright-before-area-confirmation.png'),full_page=True)
   (out/'rendered-composite.png').write_bytes(base64.b64decode(f['composite'].split(',')[1]))
  finally:p.close()
 case('photograph-derived HOME fits inset area; review held before visual confirmation',fitted)
 def approved():
  p,err=setup()
  try:
   home(p);before=p.evaluate('wwTest.frame().composite');p.locator('#woodwrightAreaOk').check();assert p.locator('#ikeDesignNextBtn').is_enabled();p.locator('#ikeDesignNextBtn').click();p.wait_for_function('wwTest.state.current==="ike-approve"');assert p.evaluate('wwTest.state.approvalCandidateData')==before
   p.locator('#ikeApproveDesignBtn').click();p.wait_for_function('wwTest.state.current==="customer"');assert p.evaluate('wwTest.state.approvedPreviewData')==before;assert p.evaluate('wwTest.state.headwayApproval.productionCertified')==False;assert p.evaluate('__writes')==0;assert not err,err
  finally:p.close()
 case('actual Review and Accept buttons reuse exactly the displayed composite, no writes',approved)
 def packet():
  p,err=setup()
  try:
   home(p,'  Home  Hole!  ');p.locator('#woodwrightAreaOk').check();assert p.evaluate('wwTest.stage()');assert p.evaluate('wwTest.accept()');d=p.evaluate('wwTest.save()');assert d['wording']=='  Home  Hole!  ';assert d['price']==18;assert d['photoData'] and d['approvedPreviewData'];assert d['headwayJob']['productionCertified']==False;assert p.evaluate('BlackFlagHeadway.verifyJob(wwTest.state.currentOrder,"ikes-wood-signs")');assert p.evaluate('__writes')==0;assert not err,err
  finally:p.close()
 case('complete private-preview packet preserves exact mixed case/spacing, original photo, $18 and frozen raster',packet)
 def empty():
  p,err=setup()
  try:
   p.locator('[data-ike-font="B"]').click();assert p.locator('#ikeDesignNextBtn').is_disabled();assert not p.locator('.woodwright-ink[src]').count();home(p);p.locator('#woodwrightAreaOk').check();p.locator('#ikeWordingInput').fill('');p.evaluate('wwTest.ensure()');assert p.locator('#ikeDesignNextBtn').is_disabled();assert p.locator('.woodwright-ink').is_hidden();assert not p.evaluate('wwTest.ready()');assert not err,err
  finally:p.close()
 case('blank wording never inserts a sample; clearing removes old ink and readiness',empty)
 for field,val in [('wording','Another word'),('fill','Black'),('font','A'),('price',19)]:
  def stale(field=field,val=val):
   p,err=setup()
   try:
    home(p);p.locator('#woodwrightAreaOk').check();assert p.evaluate('wwTest.stage()');p.evaluate('(v)=>wwTest.set(v[0],v[1])',[field,val]);assert p.evaluate('wwTest.accept()')==False;assert not p.evaluate('!!wwTest.state.headwayApproval')
   finally:p.close()
  case('changed '+field+' cannot accept the prior candidate',stale)
 def photochange():
  p,err=setup()
  try:
   home(p);p.locator('#woodwrightAreaOk').check();p.evaluate('''async()=>{const c=document.createElement('canvas');c.width=640;c.height=360;const x=c.getContext('2d');x.fillStyle='#bba998';x.fillRect(0,0,640,360);await wwTest.photo(c.toDataURL());await wwTest.ensure();}''');assert not p.evaluate('wwTest.ready()');assert p.locator('#woodwrightAreaOk').is_disabled();assert not p.evaluate('!!wwTest.state.headwaySizeDecision');assert not p.locator('.woodwright-ink[src]').count()
  finally:p.close()
 case('replacement ambiguous photo clears old fit, ink, area and sample stock decisions',photochange)
 def darkbg():
  p,err=setup()
  try:
   home(p);p.locator('#woodwrightAreaOk').check();p.evaluate('wwTest.project("beccas-bloom-shop")');assert not p.locator('.woodwright-ink').count();assert not p.evaluate('wwTest.ready()');assert p.evaluate('__writes')==0
  finally:p.close()
 case('cross-vessel reset clears private image fit state without writing',darkbg)
 def unavailable():
  p,err=setup()
  try:
   p.evaluate('window.BlackFlagWoodwright=undefined');p.locator('[data-ike-font="B"]').click();p.locator('#ikeWordingInput').fill('HOME');p.evaluate('wwTest.ensure()');assert p.locator('#ikeDesignNextBtn').is_disabled();assert p.locator('.woodwright-ink').is_hidden();assert 'missing' in p.locator('#woodwrightFitStatus').inner_text()
  finally:p.close()
 case('missing fit runtime fails closed rather than falling back to old positioning',unavailable)
 def liverestriction():
  p,err=setup()
  try:
   home(p);p.locator('#woodwrightAreaOk').check();p.evaluate('wwTest.mode("live")');assert p.locator('#ikeDesignNextBtn').is_disabled();assert not p.evaluate('wwTest.stage()');assert not p.evaluate('wwTest.accept()');assert p.evaluate('__writes')==0
  finally:p.close()
 case('a photo-area checkbox cannot confer production or owner-stock approval',liverestriction)
 def long():
  p,err=setup()
  try:
   home(p,'HOME SWEET HOME IN THE WOODS');f=p.evaluate('wwTest.frame()');assert f['proof']['outsidePixels']==0;assert f['inkBox']['w']<=f['region']['w'];assert not err,err
  finally:p.close()
 case('long wording scales uniformly into the same area without glyph cropping',long)
 def warmblank():
  p,err=setup()
  try:
   result=p.evaluate('''()=>{const c=document.createElement('canvas');c.width=320;c.height=180;const x=c.getContext('2d');x.fillStyle='#c0b7a6';x.fillRect(0,0,320,180);return BlackFlagWoodwright.analyzeImage(c)}''');assert result is None
  finally:p.close()
 case('warm featureless background does not receive a fabricated board boundary',warmblank)
 def rotations():
  p,err=setup()
  try:
   for turns in [1,2,3]:
    p.evaluate('''async({src,turns})=>{const im=await new Promise(r=>{const i=new Image;i.onload=()=>r(i);i.src=src});const c=document.createElement('canvas');c.width=turns%2?im.height:im.width;c.height=turns%2?im.width:im.height;const x=c.getContext('2d');x.translate(c.width/2,c.height/2);x.rotate(turns*Math.PI/2);x.drawImage(im,-im.width/2,-im.height/2);await wwTest.photo(c.toDataURL());wwTest.set('photoQuarterTurns',turns);}''',{'src':photo,'turns':turns});home(p);assert p.evaluate('wwTest.frame().proof.outsidePixels')==0;assert p.locator('#ikeDesignNextBtn').is_disabled()
  finally:p.close()
 case('90/180/270 degree source rotations recompute fit and require new area review',rotations)
 def latest():
  p,err=setup()
  try:
   home(p);p.evaluate('''async()=>{wwTest.set('wording','SLOW');const old=wwTest.ensure();wwTest.set('wording','HOME');await wwTest.ensure();await old;}''');assert p.evaluate('wwTest.frame().exactText')=='HOME';assert not err,err
  finally:p.close()
 case('a stale render cannot overwrite the latest wording',latest)
 def selftest():
  p,err=setup()
  try:
   before=p.evaluate('JSON.stringify(wwTest.state)');result=p.evaluate('wwTest.selftest()');assert result['ok'],result;assert result.get('productionCertified')==False;assert p.evaluate('JSON.stringify(wwTest.state)')==before;assert p.evaluate('__writes')==0
  finally:p.close()
 case('built-in photo-fit selftest verifies the current renderer without changing customer state or claiming CNC',selftest)
 for width,height in [(1366,1024),(1024,768),(1024,640),(768,1024),(390,844),(430,932)]:
  def view(width=width,height=height):
   p,err=setup(width,height)
   try:
    home(p);dims=p.evaluate('''()=>{const c=document.querySelector('.ike-design-preview'),im=c.querySelector('.preview-image').getBoundingClientRect(),ink=c.querySelector('.woodwright-ink').getBoundingClientRect();return{overflow:document.documentElement.scrollWidth>innerWidth+2,im:[im.x,im.y,im.width,im.height],ink:[ink.x,ink.y,ink.width,ink.height]}}''');assert not dims['overflow'],dims;assert all(abs(a-b)<1 for a,b in zip(dims['im'],dims['ink'])),dims;p.locator('#woodwrightAreaOk').check();assert p.locator('#ikeDesignNextBtn').is_enabled();p.wait_for_timeout(200);assert p.locator('#ikeDesignNextBtn').is_enabled();p.screenshot(path=str(out/f'design-{width}x{height}.png'),full_page=True);assert not err,err
   finally:p.close()
  case(f'{width}x{height} no horizontal overflow; photo and ink share identical contain boxes; controls reachable',view)
 b.close()
(out/'results.json').write_text(json.dumps({'photo_sha256':hashlib.sha256(pp.read_bytes()).hexdigest(),'results':results,'passed':sum(x['pass'] for x in results),'failed':sum(not x['pass'] for x in results),'scope':'isolated Chromium, actual functions and markup, synthetic account/network boundaries; not native Safari'},indent=2))
print(json.dumps({'passed':sum(x['pass'] for x in results),'failed':sum(not x['pass'] for x in results)}));sys.exit(1 if any(not x['pass'] for x in results) else 0)

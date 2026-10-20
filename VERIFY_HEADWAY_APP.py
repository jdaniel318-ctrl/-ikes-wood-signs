"""Headway actual app function integrations + actual HTML/CSS. Offline boundaries:
synthetic photo/geometry state, synthetic renderer artifact (not cutting proof), no auth or network.
Exercises unchanged extracted function bodies, not reimplemented contracts. Native Safari pending.
"""
from pathlib import Path
import sys,re,json,shutil,base64,hashlib,traceback
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True);source=(root/'app.js').read_text();results=[]
names=['headwayContext','headwayResetPlank','headwayPhotoContext','headwayRefreshRecognition','headwaySizeMarkup','headwayWoodMarkup','headwayPreviewDecision','headwayDraft','headwaySaveJob','headwayRenderPlank','recalcIkePrice','ikeRecognitionForOrder','stageIkeApprovalArtifact','lockIkeApprovedDesign','verifyIkeApprovalCandidate','invalidateIkeApprovedDesignLock','ikeCurrentRenderLock','ikeFastHash','ikeDesignLockHashPayload','resetRuntimeStateForProject']
def extract(name):
 m=re.search(r'^  (?:async )?function '+name+r'\(',source,re.M)
 if not m:raise AssertionError('Missing actual function '+name)
 return source[m.start():source.find('\n  }\n',m.start())+5]
try:functions=re.search(r'  let fairwindAnalysisEpoch=0;',source).group(0)+'\n'+'\n'.join(extract(n) for n in names)
except Exception as e:
 (out/'results.json').write_text(json.dumps([{'name':'actual app testability','pass':False,'error':str(e)}],indent=2));print(e);sys.exit(1)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 def setup(width=1024,height=768,mode='preview'):
  p=browser.new_page(viewport={'width':width,'height':height});p.set_default_timeout(4000);p.route('**/*',lambda r:r.abort());errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  s=BeautifulSoup((root/'index.html').read_text(),'html.parser');main=s.find(id='customerApp');sec=main.select_one('[data-screen="ike-plank"]');sec['class']=['screen','ike-only-screen','active'];header=s.find(id='app').find('header',recursive=False)
  for im in header.select('img[src]'):
   f=root/im.get('src','');
   if f.is_file():im['src']='data:image/png;base64,'+base64.b64encode(f.read_bytes()).decode()
  html='<html><head></head><body class="project-mode ikes-project ikes-flow-active"><div id="app" class="app-shell">'+str(header)+'<div id="experienceModeBanner" class="experience-mode-banner"><span><b>PRIVATE PREVIEW · NO RECORDS</b><small>Ike’s Wood Signs</small></span><button>RETURN TO TEST DECK</button></div><main id="customerApp" class="main-panel">'+str(sec)+'<span id="doneOrderId"></span><span id="doneOrderRecordNote"></span><img id="doneApprovedPreview"></main></div></body></html>'
  p.set_content(html)
  for css in ['styles.css','fleet_viewport.css']:p.add_style_tag(content=(root/css).read_text())
  for js in ['fleet_viewport.js','headway_contracts.js','business_deck.js']:p.evaluate((root/js).read_text())
  photo='data:image/jpeg;base64,'+base64.b64encode((root/'ike_calibration_2ft_cedar_reference.jpg').read_bytes()).decode()
  code=r'''(cfg)=>{const $=id=>document.getElementById(id);let activeProjectId='ikes-wood-signs',experienceMode=cfg.mode;const state={photoData:cfg.photo,photoOriginalData:cfg.photo,wording:'  Smoke  Hole!  ',font:'B',fontChosen:true,fill:'Black',letterSize:'Ike Fit',price:0,customColor:'#111111',orientation:'Horizontal',topSide:'Top of photo',photoQuarterTurns:0,customerName:'Synthetic job',customerEmail:'synthetic@example.invalid',customerPhone:'000-000-0000',contactPreference:'Text',plankRecognition:{status:'detected',orientation:'Horizontal',orientationResolved:true,speciesName:'Cedar',speciesId:'cedar',speciesResolved:true,lengthFeet:4,lengthResolved:true,usableRegion:{x:.1,y:.1,w:.8,h:.8,source:'synthetic-region'},obstacleAvoidance:'unverified'}};
 const customerExperienceForProject=()=>({defaultPrice:0,wordingDefault:'Different business'});const activeProject=()=>({id:activeProjectId}),currentExperienceContext=()=>({state:experienceMode}),ikeSpeciesRate=id=>id==='cedar'?9:0,IKE_PRODUCTION_CONTRACT='synthetic-render-contract';const ikeCaptureLiveRenderSpec=()=>({version:'synthetic',testOnly:true});
 // Woodwright gates are exercised with real pixels in VERIFY_WOODWRIGHT_UI. This inherited contract suite retains its explicitly synthetic renderer boundary.
 const woodwrightReset=()=>{},woodwrightPrepareReview=async()=>true,woodwrightFitReady=()=>true;
 const renderIkeApprovedArtifact=async()=>{if(window.__renderDelay)await new Promise(r=>setTimeout(r,120));return 'data:image/png;base64,c3ludGhldGljLXByZXZpZXc=';};
 let writes=0;window.__headwayWrites=()=>writes;window.fetch=()=>{writes++;throw Error('NETWORK FORBIDDEN');};window.putOrder=()=>{writes++;throw Error('PERSISTENCE FORBIDDEN');};
 function updateUi(){headwayRefreshRecognition();headwayRenderPlank();}
 '''+functions+r'''
 window.hwTest={state,setMode:m=>experienceMode=m,setProject:p=>activeProjectId=p,render:updateUi,context:headwayContext,photo:headwayPhotoContext,choose:headwayPreviewDecision,draft:headwayDraft,stage:stageIkeApprovalArtifact,accept:lockIkeApprovedDesign,save:headwaySaveJob,reset:headwayResetPlank,switchProject:resetRuntimeStateForProject,invalidate:invalidateIkeApprovedDesignLock};
 document.querySelector('#ikeLengthAssist').addEventListener('click',e=>{if(e.target.closest('[data-hw-size]'))headwayPreviewDecision('size').catch(x=>window.__hwError=x.message);});
 document.querySelector('#ikeSpeciesAssist').addEventListener('click',e=>{if(e.target.closest('[data-hw-wood]'))headwayPreviewDecision('wood').catch(x=>window.__hwError=x.message);});
 updateUi();window.BlackFlagViewport.enter({key:'customer:ikes-wood-signs:ike-plank',reason:'new'});
 }'''
  p.evaluate(code,{'photo':photo,'mode':mode});p.wait_for_timeout(100);return p,errors
 def run(name,fn):
  try:fn();results.append({'name':name,'pass':True});print('PASS',name,flush=True)
  except Exception as e:results.append({'name':name,'pass':False,'error':str(e)});traceback.print_exc();print('FAIL',name,str(e)[:200],flush=True)
 def ready(p):
  p.locator('[data-hw-size]').click();p.wait_for_function('hwTest.state.headwaySizeDecision?.nominalFeet===2');p.locator('[data-hw-wood]').click();p.wait_for_function('hwTest.state.plankRecognition.speciesResolved===true')
 def separate():
  p,e=setup()
  try:
   assert p.locator('#ikeConfirmPlankBtn').is_disabled();assert p.evaluate('hwTest.state.plankRecognition.lengthResolved')==False
   p.locator('[data-hw-size]').click();p.wait_for_function('!!hwTest.state.headwaySizeDecision');assert p.locator('#ikeConfirmPlankBtn').is_disabled();assert p.evaluate('hwTest.state.price')==0
   p.locator('[data-hw-wood]').click();p.wait_for_function('hwTest.state.price===18');assert p.locator('#ikeConfirmPlankBtn').is_enabled();assert 'test' in p.locator('#ikeDetectedSize').inner_text();assert p.evaluate('__headwayWrites()')==0;assert not e,e
   p.screenshot(path=str(out/'preview-plank-ready.png'),full_page=True)
  finally:p.close()
 run('actual sample-size and wood actions are separate, nominal and no-write',separate)
 for mode in ['live','sea_trial']:
  def held(mode=mode):
   p,e=setup(mode=mode)
   try:
    assert p.locator('[data-hw-size]').count()==0;assert p.locator('[data-hw-wood]').count()==0;assert p.locator('#ikeConfirmPlankBtn').is_disabled();assert 'not activated' in p.locator('#ikeLengthAssist').inner_text();assert p.evaluate("async()=>{try{await hwTest.choose('size');return false}catch(e){return true}}")
   finally:p.close()
  run(mode+' cannot activate preview fixtures or owner authority',held)
 def changedphoto():
  p,e=setup()
  try:
   ready(p);p.evaluate("hwTest.state.photoOriginalData='data:image/png;base64,bmV3';hwTest.state.photoData=hwTest.state.photoOriginalData;hwTest.render()");assert p.locator('#ikeConfirmPlankBtn').is_disabled();assert p.evaluate('hwTest.state.plankRecognition.lengthResolved')==False
   p.evaluate('async()=>await hwTest.photo()');assert p.evaluate('hwTest.state.headwaySizeDecision') is None
  finally:p.close()
 run('replacement photo invalidates nominal and wood decisions',changedphoto)
 def rotated():
  p,e=setup()
  try:
   ready(p);original=p.evaluate('hwTest.state.headwayPhotoHash');p.evaluate("hwTest.state.photoQuarterTurns=1;hwTest.state.orientation='Vertical';hwTest.state.photoData='data:image/png;base64,cm90YXRlZA==';hwTest.render()");assert p.evaluate('hwTest.context().photoHash')==original;assert p.locator('#ikeConfirmPlankBtn').is_enabled();assert p.evaluate('hwTest.draft().photoOriginalData===hwTest.state.photoOriginalData')
  finally:p.close()
 run('rotation retains original photo lineage and nominal category',rotated)
 def approvejob():
  p,e=setup()
  try:
   ready(p);assert p.evaluate('hwTest.stage()');p.wait_for_timeout(60);assert p.evaluate('hwTest.accept()');a=p.evaluate('hwTest.state.headwayApproval');assert a['approvedAt']>=a['generatedAt'];row=p.evaluate('hwTest.save()');assert row['wording']=='  Smoke  Hole!  ';assert row['price']==18;assert row['photoData'] and row['photoOriginalData'] and row['approvedPreviewData'];assert p.evaluate('BlackFlagHeadway.verifyJob(hwTest.state.currentOrder,"ikes-wood-signs")');first=row['id'];assert p.evaluate('hwTest.save()')['id']==first;assert p.evaluate('__headwayWrites()')==0
   assert p.locator('#doneOrderId').inner_text()=='PREVIEW-NO-RECORD';assert not e,e
   (out/'synthetic-job-summary.json').write_text(json.dumps({'id':first,'wording':row['wording'],'price':row['price'],'both_media_retained':True,'approvedAt':a['approvedAt'],'generatedAt':a['generatedAt'],'writes':0},indent=2))
  finally:p.close()
 run('actual staging, acceptance and preview handoff retain both photos and exact job',approvejob)
 for field,val in [('wording','Changed words'),('price',19),('font','A'),('orientation','Vertical')]:
  def stale(field=field,val=val):
   p,e=setup()
   try:
    ready(p);assert p.evaluate('hwTest.stage()');p.evaluate('(v)=>hwTest.state[v[0]]=v[1]',[field,val]);assert p.evaluate('hwTest.accept()')==False
   finally:p.close()
  run('actual approval rejects changed '+field,stale)
 def raced():
  p,e=setup()
  try:
   ready(p);p.evaluate("window.__renderDelay=true;window.__stage=hwTest.stage();setTimeout(()=>hwTest.state.wording='Changed during render',30)");assert p.evaluate('__stage')==False;assert not p.evaluate('!!hwTest.state.headwayApproval')
  finally:p.close()
 run('draft changed during renderer await does not gain approval',raced)
 def savedstale():
  p,e=setup()
  try:
   ready(p);assert p.evaluate('hwTest.stage()');assert p.evaluate('hwTest.accept()');p.evaluate("hwTest.state.wording='Changed after acceptance'");assert p.evaluate('async()=>{try{await hwTest.save();return false}catch(e){return e.message.includes("changed")}}');assert p.evaluate('__headwayWrites()')==0
  finally:p.close()
 run('actual submit rejects edits after customer acceptance',savedstale)
 def switching():
  p,e=setup()
  try:
   ready(p);p.evaluate("hwTest.setProject('beccas-bloom-shop');hwTest.switchProject({id:'beccas-bloom-shop'})");assert p.evaluate('hwTest.state.photoOriginalData')=='';assert p.evaluate('hwTest.state.headwayPhotoHash')=='';assert p.evaluate('hwTest.state.headwaySizeDecision') is None;assert p.evaluate('hwTest.state.photoData')=='';assert p.evaluate('hwTest.state.approvedPreviewData')==''
  finally:p.close()
 run('switching business clears transient source lineage and nominal decisions',switching)
 for width,height in [(1024,640),(1366,900),(390,700)]:
  def layout(width=width,height=height):
   p,e=setup(width,height)
   try:
    p.screenshot(path=str(out/f'plank-actions-{width}-{height}.png'),full_page=True)
    box=p.locator('.ike-plank-photo-card').bounding_box();im=p.locator('#ikePlankConfirmPhoto').bounding_box();assert im['height']<=box['height']+1 and im['width']<=box['width']+1,('photo exceeds its viewport',im,box)
    assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1');assert p.locator('[data-hw-size]').evaluate('(e)=>e.getBoundingClientRect().height')>=44
    ready(p);p.evaluate('BlackFlagViewport.enter({key:"ready",reason:"new"})');p.wait_for_timeout(100);p.screenshot(path=str(out/f'plank-ready-{width}-{height}.png'),full_page=True)
    if width>=1000:
     b=p.locator('#ikeConfirmPlankBtn').bounding_box();assert b['y']+b['height']<=height,(b,height)
   finally:p.close()
  run(f'populated photo decisions layout {width}x{height}',layout)
 browser.close()
(out/'results.json').write_text(json.dumps(results,indent=2));print(json.dumps({'passed':sum(r['pass'] for r in results),'total':len(results)}));sys.exit(0 if all(r['pass'] for r in results) else 1)

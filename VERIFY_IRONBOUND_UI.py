"""Local Chromium DOM integration: actual Step-7 functions and markup, simulated RPC boundary.
No network, account, or live commission. Does not claim native Safari/full hosted boot.
"""
import json,re,os,sys,tempfile,shutil
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
r=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path(__file__).resolve().parent
outdir=Path(sys.argv[2]).resolve() if len(sys.argv)>2 else Path(tempfile.mkdtemp(prefix='ironbound-ui-'))
outdir.mkdir(parents=True,exist_ok=True)
s=(r/'app.js').read_text()
def function(name):
 m=re.search(r'^  (?:async )?function '+re.escape(name)+r'\(',s,re.M)
 if not m:raise RuntimeError(name)
 end=s.find('\n  }\n',m.start())
 if end<0:raise RuntimeError(name+' end')
 return s[m.start():end+5]
functions=['commissionDraftClone','writeCommissionDraftSafe','writeCommissionEvidenceSafe','commissionCoordinator','commissionOperationFrozen','commissionProofState','setCommissionServerSyncState','performCommissionVoyageServerSave','saveCommissionVoyageServer','queueCommissionVoyageServerSave','reconcileExistingCommissionOperation','commissionReceiptNeedsReconciliation','ironboundCommissionProofMarkup','refreshCommissionProofStatus','renderCommissioning','handleCommissionAction','bindCommissioningControls','commissionProject','mirrorVerifiedCommission','exportCommissionServerProof','startNextCommissionDraft','commissionError','clearCommissionValidation','validateCommissionDraftFinal','forgeReviewConflicts','commissionPhotoBriefConflict','commissionDraftWithPhotoCorrection','applyCommissionPhotoBrief','freshCommissionDraft','commissionDraftStatusText']
code='\n'.join(function(n) for n in functions)
transport=(r/'fleet_supabase.js').read_text().split('// IRONBOUND_COORDINATOR_BEGIN')[1].split('// IRONBOUND_COORDINATOR_END')[0]
section=BeautifulSoup((r/'index.html').read_text(),'html.parser').find(id='projectCommissioningWorkspace');section['class']=['commissioning-workspace'];section['aria-hidden']='false'
setup=r'''
const $=id=>document.getElementById(id), BUILD_VERSION='8.8.20.30';
const COMMISSION_DRAFT_SESSION_KEY='fixture-session',COMMISSION_DRAFT_KEY='fixture-local',COMMISSION_DRAFT_DURABLE_KEY='fixture-durable';
let commissionStep=7,commissionDraftStorageState={channel:'memory',degraded:true},commissionServerVoyage=null,commissionServerSaveTimer=null,commissionSaveFlight=Promise.resolve(),commissionCommandBusy=false,commissionProofCheck=0,commissionServerPreview=null,commissionController=null,commissionControllerKey='',commissionServerSyncState={state:'safe',message:''},companies=[];
const noop=()=>{};
const commissionStorageError=e=>String(e.name)+': '+String(e.message);
const escapeHtml=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const validEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const refreshCommissionRecoveryStatus=noop,writeCommissionRecoveryHint=noop,bindBusinessIntakeControls=noop,bindVesselForgeControls=noop,bindCommissionRecoveryControls=noop,captureCommissionFields=noop,setCommissionRecoveryDetailsOpen=noop,closeProjectCommissioning=noop;
const commissionRecoveryBannerMarkup=()=>'',commissioningStepMarkup=()=>ironboundCommissionProofMarkup(),commissionServerSyncLabel=()=>commissionServerSyncState.state==='safe'?'SERVER SAFE':'SYNC NEEDED';
const commissionForgeTruthSnapshot=d=>({build:BUILD_VERSION,stage:7,conflicts:forgeReviewConflicts(d),forgePlan:d.forgePlan});
const validateCommissionStep=()=>true,saveCommissionDraft=()=>saveCommissionVoyageServer(commissionDraft),clearCommissionDraft=noop,readCommissionDraft=()=>commissionDraft;
const setSetting=async()=>{throw new DOMException('The quota has been exceeded.','QuotaExceededError');};
const saveCompanies=async()=>{throw new DOMException('The quota has been exceeded.','QuotaExceededError');};
const ensureProjectGovernance=p=>p,normalizeProjectCode=p=>p,projectById=id=>companies.find(p=>p.id===id);
let fixtureMode='success',commandState='verified_not_created',committed=false,calls=[];
const voyage='11111111-1111-4111-8111-111111111111',oldOp='33333333-3333-4333-8333-333333333333',newOp='22222222-2222-4222-8222-222222222222',oldId='bf-p-retired-fixture',newId='bf-p-new-fixture';
let receipt={voyage_id:voyage,operation_id:oldOp,intended_project_id:oldId,preview_fingerprint:'old',command_state:commandState,detail:{operation_closed:true,retry_forbidden:true}};
let commissionDraft={draftId:'fixture-voyage',name:'VoyageKeeper UI Fixture',businessType:'service',description:'Private local regression fixture.',businessBrief:'Private local regression fixture.',primaryOffer:'Service Visit',pricingMode:'manual',customerMode:'guided',photoRequired:false,contactCapture:true,ownerPortal:false,ownerName:'',ownerEmail:'',projectCode:'VRT',orderPrefix:'VRT',forgePlan:{offer:'Service Visit',pricing:'manual',customerMode:'guided',photoRequired:false,scheduling:'As needed'},_step:7,_maxStepReached:7,_serverVoyageId:voyage,_serverReceipt:receipt};
let savedDraft=structuredClone(commissionDraft);
const row=()=>({found:true,status:committed?'commissioned':'active',voyage_id:voyage,draft_key:savedDraft.draftId,safe_stage:7,draft:structuredClone(savedDraft),receipt:structuredClone(receipt)});
function proof(){return {schema:'server-first-operation-proof-v1',voyage_id:voyage,operation_id:receipt.operation_id,command_state:receipt.command_state,intended_project_id:receipt.intended_project_id,preview_fingerprint:receipt.preview_fingerprint,receipt:structuredClone(receipt),canonical_vessel_exists:committed,canonical_matches_operation:committed,blueprint_verified:committed,vessel:committed?{id:'44444444-4444-4444-8444-444444444444',project_id:newId,display_name:'VoyageKeeper UI Fixture',namespace:'bf.project.'+newId,lifecycle_state:'commissioning'}:null,project:committed?{id:newId,name:'VoyageKeeper UI Fixture',namespace:'bf.project.'+newId,published:false,visibility:'private'}:null,handoff:{appointments:[],membership_count:0,entitlement_count:0,isolation_proof:'not_run'}};}
const client={rpc:async(n,b)=>{calls.push({name:n,body:structuredClone(b)});await new Promise(r=>setTimeout(r,15));
 if(n==='save_commissioning_voyage'){savedDraft=structuredClone(b.p_draft);return {voyage_id:voyage,status:'active'};}
 if(n==='read_active_commissioning_voyage'){if(fixtureMode==='photo-save-lost'&&savedDraft._photoCorrectionEvidence)throw Error('Simulated lost correction read-back');return row();}
 if(n==='preview_commissioning_voyage')return {ready:!commissionPhotoBriefConflict(savedDraft),issues:commissionPhotoBriefConflict(savedDraft)?['Saved brief says no photo is required.']:[],voyage_id:voyage,draft_key:savedDraft.draftId,draft_fingerprint:'draft-fingerprint',receipt:structuredClone(receipt)};
 if(n==='prepare_commissioning_operation'){receipt={voyage_id:voyage,operation_id:newOp,intended_project_id:newId,preview_fingerprint:'new-fingerprint',command_state:'prepared',detail:{protocol:'server-first-v1'}};if(fixtureMode==='lost-prepare')throw Error('Simulated lost preparation response');return proof();}
 if(n==='commit_commissioning_operation'){committed=true;receipt.command_state='verified_created';receipt.detail.operation_closed=true;if(fixtureMode==='lost-commit')throw Error('Simulated lost commit response');return proof();}
 if(n==='read_commissioning_operation'){if(committed&&fixtureMode==='lost-read')throw Error('Simulated unavailable read-back');return proof();}
 if(n==='reconcile_commissioning_receipt'){receipt.command_state=committed?'verified_created':'verified_not_created';receipt.detail.operation_closed=true;return proof();}
 throw Error('Unexpected RPC '+n);
}};
const commissioningServerClient=()=>client;
'''
expose='''window.fixture={start:()=>renderCommissioning(),state:()=>commissionProofState(),calls:()=>calls,mode:m=>{fixtureMode=m;if(m==='photo-conflict'||m==='photo-save-lost'){commissionDraft.businessBrief='No photo required. Scheduling as needed.';commissionDraft.photoRequired=true;commissionDraft.forgePlan.photoRequired=true;commissionDraft.forgePlan.evidence=['Photos / visual reference'];commissionDraft.forgePlan.workflow=['Customer request','Collect reference photos'];savedDraft=structuredClone(commissionDraft);renderCommissioning();}},command:()=>commissionProject(),draft:()=>commissionDraft};renderCommissioning();'''
results=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or pw.chromium.executable_path,headless=True,args=['--no-sandbox'])
 for mode in ['success','lost-commit','lost-read','lost-prepare','photo-conflict','photo-save-lost']:
  page=b.new_page(viewport={'width':1024,'height':768});errors=[];page.set_default_timeout(6000);print('SCENARIO',mode,flush=True);page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content('<!doctype html><html><head><style>'+ (r/'styles.css').read_text()+'</style></head><body class="engine-mode engine-workspace-open">'+str(section)+'</body></html>')
  page.evaluate(transport)
  page.evaluate('()=>{'+setup+'\n'+code+'\n'+expose+'}')
  page.evaluate('(m)=>fixture.mode(m)',mode)
  if mode in ['photo-conflict','photo-save-lost']:
   page.wait_for_timeout(80)
   assert page.locator('#commissionNext').is_disabled()
   assert not page.evaluate("fixture.calls().some(x=>x.name==='prepare_commissioning_operation'||x.name==='commit_commissioning_operation')")
   page.locator('[data-apply-photo-brief]').click()
   if mode=='photo-save-lost':
    page.wait_for_function("fixture.draft()._serverRecoveryPending===true")
    assert page.locator('#commissionNext').is_disabled()
    calls=page.evaluate('fixture.calls()')
    assert not any(x['name'] in ['prepare_commissioning_operation','commit_commissioning_operation'] for x in calls)
    assert not errors,errors
    results.append({'scenario':mode,'pass':True,'phase':'correction-readback-held','prepareCount':0,'commitCount':0,'pageErrors':errors})
    page.close();continue
   page.wait_for_function("fixture.draft().photoRequired===false && fixture.draft().forgePlan.photoRequired===false && document.getElementById('commissionNext').disabled===false")
   assert page.evaluate('fixture.draft()._photoCorrectionEvidence.previousPlan.photoRequired') is True
  page.wait_for_function("document.getElementById('commissionNext').disabled===false")
  page.locator('#commissionNext').click(force=True)
  if mode=='lost-prepare':
   page.wait_for_function("fixture.state().phase==='uncertain'")
   page.wait_for_timeout(60)
   assert page.locator('#commissionNext').is_disabled()
   print('RECONCILING',mode,flush=True);page.locator('[data-reconcile-commission]').click()
   page.wait_for_function("fixture.state().phase==='closed'")
  else:
   page.wait_for_function("fixture.state().phase==='prepared' && document.getElementById('commissionNext').disabled===false")
   page.screenshot(path=str(outdir/('prepared-'+mode+'.png')))
   # Two real invocations while the command is pending. Only one commit must reach RPC.
   page.evaluate('()=>{fixture.command().catch(()=>{});fixture.command().catch(()=>{});}')
   page.wait_for_function("['verified','uncertain'].includes(fixture.state().phase)")
   if mode not in ['success','photo-conflict']:
    assert page.locator('#commissionNext').is_disabled()
    page.evaluate("()=>fixture.mode('success')")
    print('RECONCILING',mode,flush=True);page.locator('[data-reconcile-commission]').click()
    page.wait_for_timeout(150);print('RECON READ',page.evaluate('({phase:fixture.state().phase,calls:fixture.calls().map(x=>x.name),validation:document.getElementById("commissionValidation").textContent})'),flush=True);page.wait_for_function("fixture.state().phase==='verified'")
   assert page.locator('#commissionNext').inner_text()=='VERIFIED · NOT PUBLISHED'
   page.wait_for_timeout(80)
   assert page.evaluate('window.__ironboundMirror.cacheSaved') is False
  print('STATE',page.evaluate('fixture.state().phase'),flush=True);calls=page.evaluate('fixture.calls()');state=page.evaluate('fixture.state()')
  expected=0 if mode=='lost-prepare' else 1
  assert sum(x['name']=='commit_commissioning_operation' for x in calls)==expected
  assert sum(x['name']=='prepare_commissioning_operation' for x in calls)==1
  assert not errors,errors
  widths=[]
  for width,height in [(1024,768),(390,844)]:
   page.set_viewport_size({'width':width,'height':height});page.wait_for_timeout(50)
   overflow=page.evaluate('document.querySelector(".ironbound-proof").scrollWidth>document.querySelector(".ironbound-proof").clientWidth+2')
   assert not overflow,(mode,width,'proof panel overflow')
   widths.append({'width':width,'height':height,'proofPanelHorizontalOverflow':overflow})
   if mode in ['success','photo-conflict']:page.screenshot(path=str(outdir/f'proof-{width}.png'))
  results.append({'scenario':mode,'pass':True,'phase':state['phase'],'prepareCount':1,'commitCount':expected,'quotaMirrorFailureHandled':mode!='lost-prepare','pageErrors':errors,'viewports':widths})
  page.close()
 b.close()
out={'scope':'Local Chromium DOM integration of actual Step-7 functions, handlers, markup and CSS. Simulated RPC boundary. No live auth/commission, hosted boot, service-worker or native Safari claim.','browser':'Chromium 144.0.7559.96','results':results}
(outdir/'browser-ui-results.json').write_text(json.dumps(out,indent=2));print(json.dumps(out,indent=2))

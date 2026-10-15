"""Actual owner.html and Watchtower JS; isolated mock RPC only. Never uses live accounts.
Run: python VERIFY_STEADYHAND_UI.py /path/to/release /path/to/results
"""
from pathlib import Path
import sys,json,threading,http.server,functools,shutil,re
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]).resolve();out=Path(sys.argv[2]).resolve();out.mkdir(parents=True,exist_ok=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
PROJECT='bf-p-unit-voyage';EMAIL='captain-test@example.invalid'
SETUP=r'''
window.fixture={signed:true,calls:[],mode:'ok',published:false,work:'Private Captain test: appointment accepted; checking saved watch report.',summary:'Other-vessel access-denial test is still pending.',issues:1};
const f=window.fixture, pid='bf-p-unit-voyage',who={id:'unit-person',email:'captain-test@example.invalid'};
const appt={appointment_id:'unit-appointment',candidate_email:who.email,vessel_name:'VoyageKeeper Test Fixture',project_id:pid,status:'accepted'};
function report(){return {has_report:true,project_id:pid,display_name:appt.vessel_name,report_id:'unit-report',reported_at:'2026-10-05T04:02:39.406Z',current_work:f.work,issue_summary:f.summary,unresolved_issues:f.issues,source_label:'VESSEL CAPTAIN'};}
window.fixture.client={currentSession:async()=>f.signed?{access_token:'LOCAL-FIXTURE-NOT-A-REAL-TOKEN'}:null,user:async()=>who,clearSession:()=>{f.signed=false;},saveSession:()=>{f.signed=true;},signOut:async()=>{f.signed=false;},signInWithPassword:async(email,password)=>{f.calls.push({name:'signInWithPassword',body:{email,password}});f.signed=true;return {};},rpc:async(name,body)=>{f.calls.push({name,body:structuredClone(body)});await new Promise(r=>setTimeout(r,10));
 if(name==='captain_read_my_appointments')return {records:[appt]};
 if(name==='vessel_captain_verify_access')return {ok:body.p_project_id===pid,project_id:pid,display_name:appt.vessel_name,lifecycle_state:'commissioning',operating_model:'captain_operated'};
 if(name==='vessel_captain_list_business_orders')return {project_id:pid,records:[]};
 if(name==='vessel_captain_read_watch_report'){let r=report();if(f.published&&f.mode==='wrong-read')r.current_work='Different report text';if(f.published&&f.mode==='lost-read')throw Error('fixture lost read');return r;}
 if(name==='vessel_captain_publish_watch_report'){
  f.published=true;f.work=body.p_current_work.replace(/^ +| +$/g,'');f.summary=body.p_issue_summary.replace(/^ +| +$/g,'')||null;f.issues=body.p_unresolved_issues;
  if(f.mode==='lost-response')throw Error('fixture response lost');
  if(f.mode==='delayed')await new Promise(r=>setTimeout(r,180));
  let r=report();if(f.mode==='wrong-project')r.project_id='beccas-bloom-shop';if(f.mode==='wrong-work')r.current_work='Changed server text';if(f.mode==='wrong-summary')r.issue_summary='Changed issue summary';if(f.mode==='wrong-count')r.unresolved_issues=5;if(f.mode==='missing-count')delete r.unresolved_issues;if(f.mode==='missing-summary')delete r.issue_summary;return r;
 }
 throw Error('Unexpected fixture RPC '+name);
}};
'''
results=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 def page_for(mode='ok',signed=True,project=PROJECT):
  ctx=browser.new_context(viewport={'width':1024,'height':768});p=ctx.new_page();p.set_default_timeout(2500);errors=[]
  p.on('pageerror',lambda e:errors.append(str(e)))
  from bs4 import BeautifulSoup
  doc=BeautifulSoup((root/'owner.html').read_text(),'html.parser')
  scripts=[el.string or el.get_text() for el in doc.find_all('script') if not el.get('src')]
  for el in doc.find_all('script'):el.decompose()
  p.route('**/*',lambda r:r.abort())
  p.set_content(str(doc))
  p.evaluate(SETUP+f"\nfixture.mode={json.dumps(mode)};fixture.signed={str(signed).lower()};")
  p.evaluate("()=>{window.fetch=async(url,opts)=>{fixture.calls.push({name:'otp',body:JSON.parse(opts.body)});return {ok:true};};}")
  p.evaluate((root/'fleet_supabase.js').read_text()+"\nwindow.DarkSkySupabase={create:()=>fixture.client};")
  if (root/'input_hygiene.js').exists():p.evaluate((root/'input_hygiene.js').read_text())
  p.evaluate(("()=>{const location={search:'?surface=vessel-captain&project=bf-p-unit-voyage',href:'https://blackflag-test.invalid/owner.html?surface=vessel-captain&project=bf-p-unit-voyage',hash:'',pathname:'/owner.html'};const history={replaceState:(_,__,url)=>{fixture.route=url;}};" ).replace("bf-p-unit-voyage",project)+"\n".join(scripts)+"}")
  p.wait_for_selector(('#captainWatchWork' if project==PROJECT else '#captainMyVessels') if signed else '#captainLoginEmail')
  return p,ctx,errors
 def run(name,fn):
  try:fn();results.append({'test':name,'pass':True});print('PASS',name,flush=True)
  except Exception as e:
   import traceback;traceback.print_exc();results.append({'test':name,'pass':False,'error':str(e)});print('FAIL',name,str(e)[:250],flush=True)
 def email():
  p,c,e=page_for(signed=False)
  try:
   p.locator('#captainLoginEmail').fill('\u00a0\u00a0captain-test@example.invalid\u00a0')
   p.locator('#captainMagicBtn').click();p.wait_for_function('fixture.calls.some(c=>c.name==="otp")')
   assert p.locator('#captainLoginEmail').input_value()==EMAIL,'Padded email remains visible'
   assert p.evaluate('fixture.calls.filter(c=>c.name==="otp").length')==1
   assert not e,e
  finally:c.close()
 run('captain email visible and request normalization',email)
 def padded():
  p,c,e=page_for()
  try:
   p.locator('#captainWatchWork').fill('    '+p.evaluate('fixture.work'))
   p.locator('#captainWatchSummary').fill('    '+p.evaluate('fixture.summary')+'   ')
   p.locator('#captainPublishWatch').click();p.wait_for_timeout(180)
   assert p.locator('#captainWatchWork').count()==1,'Saved report wrongly held after server boundary trim'
   assert p.locator('#captainWorkCount').inner_text()=='72 / 160 characters'
   assert p.evaluate('fixture.calls.filter(c=>c.name==="vessel_captain_publish_watch_report").length')==1
   assert 'saved' in p.locator('#captainStationStatus').inner_text().lower()
   assert not e,e
  finally:c.close()
 run('padded saved report is verified with canonical count',padded)
 def bad(mode):
  p,c,e=page_for(mode)
  try:
   p.locator('#captainPublishWatch').click();p.wait_for_timeout(220)
   assert p.locator('#captainStationRecheck').count()==1,mode+' accepted mismatched or uncertain proof'
   assert p.locator('#captainPublishWatch').count()==0,'Write button still available after uncertainty'
   assert p.evaluate('fixture.calls.filter(c=>c.name==="vessel_captain_publish_watch_report").length')==1
   assert not e,e
  finally:c.close()
 for mode in ['wrong-project','wrong-work','wrong-summary','wrong-count','missing-count','missing-summary','wrong-read','lost-response','lost-read']:run(mode+' fails closed without retry',lambda mode=mode:bad(mode))
 def clipboard(p,selector,text):
  p.locator(selector).focus()
  p.evaluate('([selector,text])=>{const f=document.querySelector(selector);try{f.select();}catch(_){} const d=new DataTransfer();d.setData("text/plain",text);f.dispatchEvent(new ClipboardEvent("paste",{bubbles:true,cancelable:true,clipboardData:d}));}',[selector,text])
 def helpers():
  c=browser.new_context();p=c.new_page();p.set_content('''<form><input id="email" type="email"><input id="contact" data-bf-trim="boundary"><textarea id="report" data-bf-trim="boundary" maxlength="160"></textarea><input id="password" type="password" data-bf-trim="boundary"><input id="wording" data-bf-trim="preserve"><textarea id="raw"></textarea><button type="submit">Save</button></form><div id="dynamic"></div>''')
  try:
   p.evaluate((root/'input_hygiene.js').read_text());p.evaluate('()=>{window.submits=0;document.querySelector("form").onsubmit=e=>{e.preventDefault();++window.submits;};}')
   for selector in ['#email','#contact','#report']:
    clipboard(p,selector,'\u00a0\t Alpha  Beta\n  Gamma \r\n')
    # email inputs intentionally strip linefeeds; ordinary reports preserve internal lines.
    if selector!='#email':assert p.locator(selector).input_value()==('Alpha  Beta\n  Gamma' if selector=='#report' else 'Alpha  Beta  Gamma'),(selector,p.locator(selector).input_value())
    assert not p.locator(selector).input_value().startswith((' ','\u00a0','\t'))
   assert p.evaluate('window.submits')==0,'Cleanup submitted a form'
   for selector in ['#password','#wording','#raw']:
    p.locator(selector).fill('  Keep  exact  ');p.locator('#contact').click();assert p.locator(selector).input_value()=='  Keep  exact  '
   p.locator('#contact').fill('Word ');assert p.locator('#contact').input_value()=='Word ','ordinary typing stripped separator'
   p.evaluate('()=>{const e=document.querySelector("#contact");e.value="   Alpha beta  ";e.setSelectionRange(9,9);BlackFlagInput.clean(e);}')
   assert p.evaluate('document.querySelector("#contact").selectionStart')==6,'caret not adjusted for removed prefix'
   p.evaluate('()=>{const f=document.querySelector("#contact");f.dispatchEvent(new CompositionEvent("compositionstart",{bubbles:true}));f.value="  終了  ";f.dispatchEvent(new InputEvent("input",{bubbles:true,isComposing:true,inputType:"insertCompositionText"}));}')
   assert p.locator('#contact').input_value()=='  終了  '
   p.evaluate('()=>{const f=document.querySelector("#contact");f.dispatchEvent(new CompositionEvent("compositionend",{bubbles:true}));f.dispatchEvent(new Event("blur"));}')
   assert p.locator('#contact').input_value()=='終了'
   p.evaluate('()=>{document.querySelector("#dynamic").innerHTML="<input id=late data-bf-trim=boundary>";}')
   clipboard(p,'#late','    Later field    ');assert p.locator('#late').input_value()=='Later field'
   clipboard(p,'#report','    '+'a'*160+'    ');assert p.locator('#report').input_value()=='a'*160,'maxlength lost valid data to pasted whitespace'
   assert p.evaluate('window.submits')==0
  finally:c.close()
 run('paste/autofill/IME/caret/dynamic-field/secret protections',helpers)
 def normalize_surfaces():
  from bs4 import BeautifulSoup
  c=browser.new_context();p=c.new_page()
  fields=[]
  cases={'index.html':['customerName','customerPhone','customerEmail','adminBusinessAddress','fleetDockSearch'], 'app.js':['ownerLoginEmail','hhFieldJob','commissionWebsiteUrl','borNotes','universalNotes'], 'captain.js':['admiralAirlockEmail','harborCaptainEmail','harborCaptainIntent','captainCommandSearchInput'], 'simple_books.js':['taxCounterparty','taxDescription','taxEvidence']}
  for name,ids in cases.items():
   soup=BeautifulSoup((root/name).read_text(),'html.parser')
   for id in ids:
    field=soup.find(id=id);assert field is not None,(name,id);fields.append(str(field))
  p.set_content('<form>'+''.join(fields)+'</form>')
  try:
   p.evaluate((root/'input_hygiene.js').read_text())
   for name,ids in cases.items():
    for id in ids:
     text=EMAIL if 'email' in id.lower() else 'Ordinary  field text'
     clipboard(p,'#'+id,'\u00a0\t'+text+'\u00a0 ')
     assert p.locator('#'+id).input_value()==text,(name,id,p.locator('#'+id).input_value())
  finally:c.close()
 run('actual annotated fields across Engine Admiral owner intake and ledger',normalize_surfaces)
 def roundtrip():
  p,c,e=page_for()
  try:
   p.evaluate('()=>{fixture.client.rpcBase=fixture.client.rpc;fixture.client.rpc=async(n,b)=>fixture.client.rpcBase(n,b);}')
   # Reach actual roster handlers with no sign-in, acceptance, report or commissioning mutation.
   p.locator('#captainMyVessels').click();p.wait_for_selector('[data-tb-assignment]')
   assert p.locator('[data-tb-assignment]').count()==1
   p.locator('[data-tb-assignment]').click();p.wait_for_selector('#captainWatchWork')
   assert p.locator('#captainWatchIssues').input_value()=='1'
   assert p.locator('#captainWatchWork').input_value()==p.evaluate('fixture.work')
   assert not p.evaluate('fixture.calls.some(c=>/publish|accept|commission/.test(c.name))')
   assert not e,e
   for w,h in [(1024,768),(390,844)]:
    p.set_viewport_size({'width':w,'height':h});p.wait_for_timeout(30)
    assert not p.evaluate('document.documentElement.scrollWidth>innerWidth+2'),('station overflow',w)
    p.screenshot(path=str(out/f'captain-station-{w}.png'),full_page=True)
  finally:c.close()
 run('assigned-vessel return is read-only and mobile layout remains usable',roundtrip)
 def double_tap():
  p,c,e=page_for('delayed')
  try:
   p.evaluate('()=>{const b=document.getElementById("captainPublishWatch");b.click();b.click();}')
   p.wait_for_timeout(350)
   assert p.evaluate('fixture.calls.filter(c=>c.name==="vessel_captain_publish_watch_report").length')==1
   assert p.locator('#captainStationRecheck').count()==0
   assert not e,e
  finally:c.close()
 run('double tap sends one report command',double_tap)
 def recheck():
  p,c,e=page_for('lost-response')
  try:
   p.locator('#captainPublishWatch').click();p.wait_for_selector('#captainStationRecheck')
   p.evaluate('()=>{fixture.mode="ok";}');p.locator('#captainStationRecheck').click();p.wait_for_selector('#captainWatchWork')
   assert p.evaluate('fixture.calls.filter(c=>c.name==="vessel_captain_publish_watch_report").length')==1
   assert p.locator('#captainWatchIssues').input_value()=='1'
   assert not e,e
  finally:c.close()
 run('explicit recheck reads saved report without republishing',recheck)
 def overview_ui():
  c=browser.new_context(viewport={'width':1024,'height':768});p=c.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  p.route('**/*',lambda r:r.abort())
  try:
   p.set_content('<style>'+ (root/'styles.css').read_text()+'</style>')
   if (root/'input_hygiene.js').exists():p.evaluate((root/'input_hygiene.js').read_text())
   s=(root/'captain.js').read_text();start=s.index(';(()=>{',s.index('server-attested, read-only Admiral observability.'));end=s.index('\n})();',start)+6
   p.evaluate('()=>{window.DarkSkyAdmiralIdentityStatus=async()=>true;const v={project_id:"bf-p-unit-voyage",display_name:"VoyageKeeper Test Fixture",lifecycle_state:"commissioning",operating_model:"captain_operated",supabase_control_state:"fleet_seeded",settings_present:true,owner_auth_identity_count:0,reported_at:"2000-01-01T00:00:00Z",current_work:"Private Captain test: appointment accepted; checking saved watch report.",issue_summary:"Other-vessel access-denial test is still pending.",unresolved_issues:1};window.DarkSkyReadAdmiralWatch=async()=>({records:[v],read_at:"2026-10-15T01:00:00Z"});window.DarkSkyReadFleetSpine=async()=>({vessels:[],counts:{vessels:1,supabase_settings_rows:1}});}')
   p.evaluate(s[start:end]);p.evaluate('()=>window.DarkSkyOpenFleetWatchtower()');p.wait_for_selector('[data-watch-vessel="bf-p-unit-voyage"]');p.locator('[data-watch-vessel="bf-p-unit-voyage"]').click();p.wait_for_selector('#watchOverviewBody')
   assert 'VESSEL LIFECYCLE' in p.locator('#watchOverviewBody').inner_text()
   assert 'REPORT FRESHNESS' in p.locator('#watchOverviewBody').inner_text()
   assert 'FLEET COMMAND OPERATIONS NOT ENABLED' in p.locator('#watchOverviewBody').inner_text()
   assert p.locator('#watchOverviewBody button').is_disabled()
   assert not errors,errors
   for w,h in [(1024,768),(390,844)]:
    p.set_viewport_size({'width':w,'height':h});p.wait_for_timeout(50)
    p.screenshot(path=str(out/f'admiral-detail-{w}.png'),full_page=True)
    assert not p.evaluate('document.querySelector("#watchOverviewBody").scrollWidth>document.querySelector("#watchOverviewBody").clientWidth+2'),('admiral overflow',w,p.evaluate('[...document.querySelectorAll("#watchOverviewBody *")].filter(e=>e.getBoundingClientRect().right>innerWidth).map(e=>({tag:e.tagName,cls:e.className,width:e.offsetWidth,right:e.getBoundingClientRect().right})).slice(0,10)'))
    p.screenshot(path=str(out/f'admiral-detail-{w}.png'),full_page=True)
  finally:c.close()
 run('actual Admiral detail separates lifecycle freshness ownership and operator status',overview_ui)


 def deny_and_return():
  p,c,e=page_for(project='beccas-bloom-shop')
  try:
   assert 'No appointment for' in p.locator('h2').inner_text()
   assert EMAIL in p.locator('.tb-identity').inner_text()
   assert p.locator('#captainWatchWork').count()==0 and p.locator('#captainPublishWatch').count()==0
   assert not p.evaluate('fixture.calls.some(c=>c.name==="vessel_captain_list_business_orders")'),'Denied route read protected orders'
   p.locator('#captainMyVessels').click();p.wait_for_selector('[data-tb-assignment]');assert p.locator('[data-tb-assignment]').count()==1
   p.locator('[data-tb-assignment]').click();p.wait_for_selector('#captainWatchWork')
   assert p.locator('#captainWatchIssues').input_value()=='1'
   assert not p.evaluate('fixture.calls.some(c=>/publish|accept|commission/.test(c.name))')
   assert not e,e
  finally:c.close()
 run('same-account other-vessel denial and own-vessel restoration',deny_and_return)
 def signout_during_publish():
  p,c,e=page_for('delayed')
  try:
   p.locator('#captainPublishWatch').click();p.locator('#captainStationSignOut').click();p.wait_for_selector('#captainLoginEmail');p.wait_for_timeout(250)
   assert p.locator('#captainWatchWork').count()==0,'late completion repainted data after sign-out'
   assert p.evaluate('fixture.calls.filter(c=>c.name==="vessel_captain_publish_watch_report").length')==1
   assert not e,e
  finally:c.close()
 run('late report completion cannot restore signed-out vessel data',signout_during_publish)

 browser.close()
server.shutdown();(out/'browser-results.json').write_text(json.dumps(results,indent=2))
print(json.dumps({'passed':sum(x['pass'] for x in results),'total':len(results)}))
sys.exit(0 if all(x['pass'] for x in results) else 1)

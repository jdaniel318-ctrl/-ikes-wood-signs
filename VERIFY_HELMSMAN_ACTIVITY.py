"""Offline real Admiral session + FUN host activity-boundary checks.
Actual transport/host modules, synthetic server responses and trusted browser taps.
A tiny scripts-only child exercises the exact activity message contract without WebGL.
No live account/network; accelerated clock. Actual Stormwake input hook is an integration gate.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os, sys, json, traceback
ROOT=Path(sys.argv[1] if len(sys.argv)>1 else __file__).resolve()
if ROOT.is_file(): ROOT=ROOT.parent
CHILD='''<!doctype html><button id="control">Move the launch</button><script>
window.qaChannel='';window.qaState=null;let last=-Infinity;window.qaTrusted=0;
addEventListener('message',e=>{if(e.source!==parent||e.data.type!=='start')return;qaChannel=e.data.channel;qaState=e.data.state;parent.postMessage({channel:qaChannel,type:'ready'},'*');});
for(const type of ['pointerdown','keydown','wheel','touchstart'])document.addEventListener(type,e=>{if(!e.isTrusted||document.visibilityState!=='visible'||!qaChannel)return;qaTrusted++;const now=performance.now();if(now-last<1000)return;last=now;parent.postMessage({channel:qaChannel,type:'activity'},'*');},{capture:true,passive:true});
</script>'''
results=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=os.environ.get('BLACKFLAG_CHROMIUM','/tmp/blacktide-browsers/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell'),headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 def setup():
  context=browser.new_context(has_touch=True);p=context.new_page();p.set_default_timeout(6000)
  p.route('**/*',lambda route:route.fulfill(status=200,content_type='text/html',body='<section id="admiralDeck"><button id="funProgramLaunch">Open game</button></section>') if route.request.is_navigation_request() else route.abort())
  p.goto('https://offline-fixture.invalid/')
  p.evaluate('''html=>{window.qaOffset=0;const realNow=Date.now;Date.now=()=>realNow()+qaOffset;window.qaChecks=0;window.qaNetwork=0;window.__funVerifiedPlayerHtml=html;window.BlackFlagV3Identity={productionAuth:{readClientConfig:()=>({url:'https://synthetic.invalid',publishableKey:'SYNTHETIC-PUBLIC-KEY'})}};window.fetch=async url=>{const u=String(url);let data;if(u.includes('/token?'))data={access_token:'SYNTHETIC',refresh_token:'SYNTHETIC',expires_in:7200,user:{id:'synthetic-admiral'}};else if(u.includes('/auth/v1/user'))data={id:'synthetic-admiral'};else if(u.includes('/fleet_global_authorities?')){qaChecks++;data=[{user_id:'synthetic-admiral',authority_role:'admiral',active:true,revoked_at:null}];}else{qaNetwork++;throw Error('Unexpected offline request');}return{ok:true,json:async()=>data};};}''',CHILD)
  p.add_script_tag(content=(ROOT/'fleet_supabase.js').read_text());p.add_script_tag(content=(ROOT/'fun_core.js').read_text())
  p.evaluate('''async()=>{window.qaClient=DarkSkySupabase.create({url:'https://synthetic.invalid',publishableKey:'SYNTHETIC-PUBLIC-KEY',sessionKey:'darkSkySupabaseAdmiralSessionV1'});await qaClient.signInWithPassword('fixture@example.invalid','SYNTHETIC');if(!await qaClient.verifyAdmiralAuthority())throw Error('Synthetic authority unavailable');}''')
  p.add_script_tag(content=(ROOT/'fun_program.js').read_text());p.locator('#funProgramLaunch').tap();p.wait_for_selector('#funFrame');f=p.locator('#funFrame').element_handle().content_frame();f.wait_for_function('!!qaChannel');return context,p,f
 def state(p):return p.evaluate('DarkSkyAdmiralSession.status()')
 def advance(p,ms):p.evaluate('ms=>qaOffset+=ms',ms)
 def emit(f,kind='activity',channel=None):
  f.evaluate("v=>parent.postMessage({channel:v.channel===null?qaChannel:v.channel,type:v.kind,state:qaState},'*')",{'kind':kind,'channel':channel})
 def settle(p):p.wait_for_timeout(40)
 def case(name,fn):
  c,p,f=setup()
  try:fn(p,f);assert p.evaluate('qaNetwork')==0;results.append({'name':name,'pass':True});print('PASS',name,flush=True)
  except Exception as e:results.append({'name':name,'pass':False,'error':str(e)});print('FAIL',name,str(e),flush=True);traceback.print_exc()
  finally:c.close()
 def trusted(p,f):
  before=state(p);checks=p.evaluate('qaChecks');advance(p,14*60000);f.locator('#control').tap();settle(p);after=state(p)
  assert f.evaluate('qaTrusted')>0
  assert after['lastActivityAt']>before['lastActivityAt']+13*60000,'trusted game input did not renew idle time'
  for key in ['startedAt','checkedAt','receipt']:assert after[key]==before[key],key+' changed on activity'
  assert p.evaluate('qaChecks')==checks,'activity must not impersonate server verification'
  advance(p,2*60000);assert state(p)['reusable'],'active play expired at original idle deadline'
 case('trusted game tap renews only idle and survives original fifteen-minute deadline',trusted)
 def synthetic(p,f):
  before=state(p)['lastActivityAt'];advance(p,60000);f.locator('#control').dispatch_event('pointerdown');emit(f,'progress');emit(f,'ready');settle(p);assert state(p)['lastActivityAt']==before
 case('synthetic child input and automatic progress or ready do not renew idle',synthetic)
 def wrong(p,f):
  before=state(p)['lastActivityAt'];advance(p,60000);emit(f,channel='wrong-channel');ch=f.evaluate('qaChannel')
  p.evaluate("ch=>{window.qaWrongSource=0;addEventListener('message',e=>{if(e.data?.qaWrongSource===true&&e.origin==='null')qaWrongSource++;});const f=document.createElement('iframe');f.setAttribute('sandbox','allow-scripts');f.srcdoc='<script>parent.postMessage('+JSON.stringify({channel:ch,type:'activity',qaWrongSource:true})+',\"*\")<'+'/script>';document.body.appendChild(f);}",ch)
  p.wait_for_function('qaWrongSource===1')
  p.evaluate("ch=>dispatchEvent(new MessageEvent('message',{data:{channel:ch,type:'activity'},source:document.querySelector('#funFrame').contentWindow,origin:'https://wrong.invalid'}))",ch)
  settle(p);assert state(p)['lastActivityAt']==before
 case('wrong channel source and nonopaque origin cannot renew idle',wrong)
 def hidden(p,f):
  before=state(p)['lastActivityAt'];advance(p,60000)
  p.evaluate("document.querySelector('#funProgram').hidden=true");emit(f);settle(p);assert state(p)['lastActivityAt']==before
  p.evaluate("document.querySelector('#funProgram').hidden=false;Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'})");emit(f);settle(p);assert state(p)['lastActivityAt']==before
 case('hidden dialog and hidden parent document ignore child activity',hidden)
 def css_hidden(p,f):
  before=state(p)['lastActivityAt'];advance(p,60000);p.evaluate("document.querySelector('#funProgram').style.display='none'");emit(f);settle(p);assert state(p)['lastActivityAt']==before,'CSS-hidden dialog renewed idle'
 case('CSS-hidden dialog cannot renew idle',css_hidden)

 def direct(p,f):
  stamp=state(p)['startedAt'];advance(p,60000);before=state(p)['lastActivityAt']
  for request in [{'userId':'other-account','startedAt':stamp},{'userId':'synthetic-admiral','startedAt':stamp-1}]:assert p.evaluate('v=>DarkSkyAdmiralSession.noteProgramActivity(v)',request)==False
  assert state(p)['lastActivityAt']==before
  p.evaluate("document.querySelector('#admiralDeck').inert=true")
  assert p.evaluate('v=>DarkSkyAdmiralSession.noteProgramActivity(v)',{'userId':'synthetic-admiral','startedAt':stamp})==False
  assert state(p)['lastActivityAt']==before
 case('session API rejects stale identity stamp and inert workspace',direct)
 def changed_account(p,f):
  before=state(p)['lastActivityAt'];advance(p,60000)
  p.evaluate("(()=>{const k='darkSkySupabaseAdmiralSessionV1',s=JSON.parse(sessionStorage.getItem(k));s.user.id='other-account';sessionStorage.setItem(k,JSON.stringify(s));})()")
  emit(f);settle(p);assert state(p)['lastActivityAt']==before;assert p.locator('#funFrame').count()==0
 case('changed stored account cannot extend or retain the prior game frame',changed_account)
 def expiry(p,f):
  advance(p,15*60000+1);emit(f);settle(p);s=state(p);assert not s['reusable'] and s['reason']=='idle';assert p.locator('#funFrame').count()==0
 case('late activity cannot revive an expired fifteen-minute session',expiry)
 def maximum(p,f):
  for _ in range(5):advance(p,10*60000);emit(f);settle(p);assert state(p)['reusable']
  advance(p,10*60000+1);emit(f);settle(p);s=state(p);assert not s['reusable'] and s['reason']=='maximum-age'
 case('continuous accepted game activity cannot extend sixty-minute absolute window',maximum)
 def save(p,f):
  checks=p.evaluate('qaChecks');advance(p,60000);f.locator('#control').tap();settle(p)
  with p.expect_download() as downloaded:p.locator('#funSaveFile').tap()
  assert downloaded.value.suggested_filename.endswith('.json');assert p.evaluate('qaChecks')==checks+1,'saving must still verify server authority'
 case('save still requires fresh authority verification after activity renewal',save)
 def retain(p,f):
  saved={'schema':'fun-solo-v1','stage':6,'history':['shore','hull','cargo','channel','sail','gate'],'help':0,'mistakes':0,'completed':True,'lessons':[],'pennant':'gold'}
  f.evaluate("s=>parent.postMessage({channel:qaChannel,type:'progress',state:s},'*')",saved);settle(p)
  p.evaluate("DarkSkyAdmiralSession.end('idle')");assert p.locator('#funFrame').count()==0
  p.evaluate("async()=>{await qaClient.signInWithPassword('fixture@example.invalid','SYNTHETIC');await qaClient.verifyAdmiralAuthority();await BlackFlagFUNProgram.open();}")
  p.wait_for_selector('#funFrame');new=p.locator('#funFrame').element_handle().content_frame();new.wait_for_function('!!qaState');assert new.evaluate('qaState.completed')==True
 case('same-document same-account reauthentication retains accepted memory progress',retain)
 browser.close()
print(json.dumps({'passed':sum(x['pass'] for x in results),'failed':sum(not x['pass'] for x in results),'results':results},indent=2))
sys.exit(any(not x['pass'] for x in results))

#!/usr/bin/env python3
"""Offline browser acceptance: real shipped HTML, synthetic Auth responses.
No live authentication, passwords, email, database, or production network access.
Requires Python playwright==1.57.0 and a local Chromium executable.
"""
import argparse, json, os, threading, contextlib, shutil, time, mimetypes, re
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

def run(root: Path, out: Path, executable: str):
    out.mkdir(parents=True, exist_ok=True)
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    origin='https://blackflag-cleardeck-fixture.invalid'
    results=[]; errors=[]; attempted=[]
    user={'id':'00000000-0000-4000-8000-000000000067','email':'captain@example.test'}
    project='fixture-vessel'; state={'records':[],'error':None,'mismatch':False,'puts':0,'reauths':0,'abort':False}
    def check(name,fn):
        try: fn(); results.append({'name':name,'pass':True}); print('PASS',name,flush=True)
        except Exception as e: results.append({'name':name,'pass':False,'error':str(e)[:600]});print('FAIL',name,str(e)[:150],flush=True)
    def ok(v,reason='assertion failed'):
        if not v: raise AssertionError(reason)
    def mock(data):
        u=urlsplit(data['url']);p=u.path;method=data.get('method','GET')
        attempted.append({'path':p,'method':method})
        payload={};status=200
        if p=='/auth/v1/user' and method=='GET':payload=user
        elif p=='/auth/v1/user' and method=='PUT':
            state['puts']+=1
            if state['abort']:return {'abort':True}
            if state['error']:status=state.get('http',422);payload={'code':state['error'],'msg':state.get('raw','Fixture rejection')}
            else:payload={**user,'id':'00000000-0000-4000-8000-000000000099' if state['mismatch'] else user['id']}
        elif p=='/auth/v1/reauthenticate':state['reauths']+=1
        elif p=='/auth/v1/logout':pass
        elif p=='/auth/v1/token':payload={'access_token':'OFFLINE_FIXTURE_ONLY','refresh_token':'OFFLINE_FIXTURE_ONLY','expires_in':3600,'user':user}
        elif p=='/rest/v1/rpc/captain_read_my_appointments':payload={'records':state['records']}
        elif p=='/rest/v1/rpc/vessel_captain_verify_access':payload={'ok':False,'project_id':project}
        else:status=403;payload={'message':'Offline fixture refuses this operation'}
        return {'status':status,'body':payload}
    try:
      with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=executable,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        context=browser.new_context(viewport={'width':1366,'height':1024},device_scale_factor=1)
        # This environment blocks URL navigation by policy. Exercise shipped DOM
        # and scripts offline, with explicit URL/history/storage/Auth fixtures.
        # This is NOT an end-to-end hosted/Safari/service-worker test.
        context.route('**/*',lambda route:route.abort())
        page=context.new_page();page.set_default_timeout(8000);page.on('pageerror',lambda e:errors.append(str(e)))
        page.expose_function('__offlineReply',mock)
        html=(root/'owner.html').read_text()
        scripts=list(re.finditer(r'<script\b([^>]*)>([\s\S]*?)</script>',html,re.I))
        dom=re.sub(r'<script\b[^>]*>[\s\S]*?</script>','',html,flags=re.I)
        dom=re.sub(r'<link\b[^>]*>','',dom,flags=re.I)
        page.set_content(dom)
        page.evaluate("""(user)=>{
          function memory(){const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),clear:()=>m.clear(),key:i=>Array.from(m.keys())[i]||null,get length(){return m.size}};}
          Object.defineProperty(window,'sessionStorage',{value:memory()});
          Object.defineProperty(window,'localStorage',{value:memory()});
          sessionStorage.setItem('darkSkySupabaseVesselCaptainSessionV1',JSON.stringify({access_token:'OFFLINE_FIXTURE_ONLY',refresh_token:'',expires_at:Date.now()+3600000,user}));
          localStorage.setItem('cleardeck-preserve-fixture','keep');
          window.__fixtureLocation={href:'https://blackflag-cleardeck-fixture.invalid/owner.html?surface=vessel-captain',search:'?surface=vessel-captain',hash:'',pathname:'/owner.html'};
          window.__fixtureHistory={replaceState:()=>{}};
          window.fetch=async(url,init={})=>{const r=await window.__offlineReply({url:String(url),method:init.method||'GET'});if(r.abort)throw new TypeError('Failed to fetch');return new Response(JSON.stringify(r.body),{status:r.status,headers:{'Content-Type':'application/json'}});};
        }""",user)
        for match in scripts:
            src=re.search(r'src=["\']([^"\']+)',match.group(1))
            code=(root/src.group(1).split('?')[0]).read_text() if src else match.group(2)
            if not src:code=';(function(location,history){'+code+'})(window.__fixtureLocation,window.__fixtureHistory);'
            page.add_script_tag(content=code)
        page.locator('#captainRosterRefresh').wait_for()
        check('signed-in empty roster uses truthful status',lambda:ok('Signed in — no active vessel assignments' in page.locator('.tb-identity').inner_text()))
        check('signed-in header no longer asks for login',lambda:ok('Only assignments returned' in page.locator('.tb-destination-note').inner_text()))
        page.locator('.tb-security summary').click()
        check('account security opens on empty roster',lambda:ok(page.locator('#captainPasswordForm').is_visible()))
        check('password form identifies exact signed-in account',lambda:ok(page.locator('#captainSecurityEmail').input_value()==user['email'] and page.locator('#captainSecurityEmail').get_attribute('readonly') is not None))
        check('new-password autofill hint present',lambda:ok(page.locator('#captainNewPassword').get_attribute('autocomplete')=='new-password'))
        def submit(p='PrivateFixturePassword-67',confirm=None):
            page.locator('#captainNewPassword').fill(p);page.locator('#captainConfirmPassword').fill(confirm if confirm is not None else p)
            page.locator('#captainSetPassword').click()
            page.wait_for_function("!document.getElementById('captainSetPassword') || !document.getElementById('captainSetPassword').disabled")
        before=state['puts'];submit(confirm='AnotherPrivateFixture-67')
        check('mismatch sends no password request',lambda:ok(state['puts']==before and 'does not match' in page.locator('#captainSecurityStatus').inner_text()))
        for code,expected in [('same_password','matches your current password'),('weak_password','stronger'),('reauthentication_needed','EMAIL SECURITY CODE'),('reauthentication_not_valid','newest'),('session_expired','Sign in again'),('over_request_rate_limit','wait')]:
            state.update(error=code,raw='Untrusted provider text',http=422);submit()
            check('real UI error '+code,lambda expected=expected:ok(expected in page.locator('#captainSecurityStatus').inner_text()))
            check('fields cleared after '+code,lambda:ok(page.locator('#captainNewPassword').input_value()=='' and page.locator('#captainConfirmPassword').input_value()==''))
        state.update(error='unknown_provider_error',raw='SECRET_SENTINEL_NOT_FOR_DISPLAY',http=422);submit()
        check('unknown provider payload not exposed',lambda:ok('SECRET_SENTINEL_NOT_FOR_DISPLAY' not in page.locator('body').inner_text()))
        state.update(error=None,abort=True);submit();state['abort']=False
        check('interrupted response not treated as success',lambda:ok('could not be confirmed' in page.locator('#captainSecurityStatus').inner_text()))
        state.update(error=None,mismatch=True);submit();state['mismatch']=False
        check('mismatched account response not accepted',lambda:ok('did not match' in page.locator('#captainSecurityStatus').inner_text()))
        state.update(error='same_password',http=422);submit()
        page.screenshot(path=str(out/'cleardeck-password-ipad.png'),full_page=True)
        page.set_viewport_size({'width':390,'height':844})
        check('phone has no horizontal overflow',lambda:ok(page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')))
        page.screenshot(path=str(out/'cleardeck-account-phone.png'),full_page=True)
        page.set_viewport_size({'width':1366,'height':1024})
        for status,expected in [('pending','Pending Captain appointment'),('accepted','Appointed Captain'),('suspended','no active vessel assignments'),('revoked','no active vessel assignments')]:
            state['records']=[{'status':status,'project_id':project,'vessel_name':'Fixture Vessel','candidate_email':user['email'],'appointment_id':'fixture-appointment'}]
            page.locator('#captainRosterRefresh').click();page.wait_for_function("status=>document.querySelector('.tb-roster article p')?.textContent.includes('· '+status)",arg=status)
            check('roster UI '+status,lambda expected=expected:ok(expected in page.locator('.tb-identity').inner_text()))
        state['records']=[];page.locator('#captainRosterRefresh').click();page.locator('.tb-security summary').click()
        state.update(error=None,mismatch=False);submit()
        check('matching-account success returns password sign-in',lambda:ok('Account password updated' in page.locator('#captainLoginStatus').inner_text()))
        check('successful update clears Captain session',lambda:ok(page.evaluate("sessionStorage.getItem('darkSkySupabaseVesselCaptainSessionV1')===null")))
        page.locator('#captainLoginEmail').fill(user['email']);page.locator('#captainLoginPassword').fill('PrivateFixturePassword-67');page.locator('#captainLoginBtn').click();page.locator('#captainRosterRefresh').wait_for()
        check('mock password sign-in does not restore assignment',lambda:ok('No current Captain appointments' in page.locator('.tb-roster').inner_text()))
        check('unrelated local data preserved',lambda:ok(page.evaluate("localStorage.getItem('cleardeck-preserve-fixture')==='keep'")))
        check('no appointment/order mutations attempted',lambda:ok(not any(any(x in r['path'] for x in ['accept_appointment','revoke','update_order','publish_watch']) for r in attempted)))
        check('no JavaScript exceptions',lambda:ok(not errors,str(errors)))
        version=browser.version;browser.close()
      report={'scope':'shipped DOM/scripts in Chromium offline; URL/history/storage/Auth fixture; no hosted navigation, live network or credentials','browser':'Chromium '+version,'viewports':['1366x1024','390x844'],'passed':sum(x['pass'] for x in results),'failed':sum(not x['pass'] for x in results),'checks':results,'page_errors':errors,'native_safari':'pending','apple_passwords_faceid':'not tested; passkeys not implemented'}
      (out/'browser-results.json').write_text(json.dumps(report,indent=2)+'\n')
      return 1 if report['failed'] else 0
    finally:server.shutdown();server.server_close()

if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('root',nargs='?',type=Path,default=Path(__file__).parent);p.add_argument('--out',type=Path,required=True);p.add_argument('--executable',default=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'))
 a=p.parse_args()
 if not a.executable:p.error('Provide --executable for an installed Chromium browser.')
 raise SystemExit(run(a.root.resolve(),a.out.resolve(),a.executable))

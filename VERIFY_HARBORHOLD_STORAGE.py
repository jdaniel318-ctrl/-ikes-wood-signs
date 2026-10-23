"""Harborhold native-storage recovery through the real host and compiled player.

All HTTPS responses are fulfilled from the supplied release; external network is
aborted. Account verification and timeouts are synthetic. localStorage quota, IndexedDB and document reload are native browser operations.
Authentication/session expiry are synthetic. Race fixtures hold authority resolution or native IDB open-event delivery. No real accounts or business data are used. Child animation is held before
startup to keep this a host/state check, not a GPU or native Safari performance
claim. Each selected case launches fresh Chromium and has its own temporary
browser context and no real credentials. Browsers are closed between cases to
avoid accumulating software-renderer resources across many compiled scenes.

Usage: python VERIFY_HARBORHOLD_STORAGE.py RELEASE OUTPUT
Optional HARBORHOLD_CASE selects a case by substring.
"""
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright
import hashlib
import json
import os
import sys
import traceback

r = Path(sys.argv[1]).resolve()
out = Path(sys.argv[2]).resolve()
out.mkdir(parents=True, exist_ok=True)
HERE = Path(__file__).resolve()
SCOPE = __doc__.split('Usage:')[0].strip()
ORIGIN = 'https://harborhold-host.test'
DATABASE = 'blackflag-stormwake-voyages-v1'
STORE = 'voyages'
PREFIX = 'blackflag.stormwake.voyage.v1:'
results = []
inputs = ['fun_core.js', 'stormwake_core.js', 'fun_program.js', 'fun_program.css',
          'fun_player.html', 'stormwake_player.html', 'stormwake_game.js',
          'stormwake_game.css', 'STORMWAKE_PLAYER_BUILD.json']
bound = {name: r / name for name in inputs}
bound[HERE.name] = HERE
before_hashes = {name: hashlib.sha256(path.read_bytes()).hexdigest()
                 for name, path in bound.items()}
(out / 'inputs.json').write_text(json.dumps({'scope': SCOPE, 'release': str(r),
    'inputs_sha256': before_hashes}, indent=2))

HOST = '''<!doctype html><html><head><meta charset="utf-8">
<title>Offline Homeward recovery fixture</title>
<link rel="stylesheet" href="fun_program.css"></head><body>
<section id="admiralDeck"><h1>Verified account fixture</h1>
<button id="funProgramLaunch">OPEN STORMWAKE</button></section>
<script src="fun_core.js"></script><script src="stormwake_core.js"></script>
<script src="fun_program.js"></script></body></html>'''

def fixture_script(account='admiral-test', backend='https://invalid.test', ok=True,
                   storage_blocked=False):
    config = json.dumps({'id': account, 'backend': backend, 'ok': ok,
                         'storageBlocked': storage_blocked,
                         'legacy': (r / 'fun_player.html').read_text()})
    return '''(()=>{if(window!==window.top){
      window.__hostQaNoAnimation=true;
      window.__hostQaChannel='';
      window.addEventListener('message',event=>{if(event.source===parent&&event.data?.type==='start')window.__hostQaChannel=event.data.channel;});
      window.requestAnimationFrame=()=>0;window.cancelAnimationFrame=()=>{};
      return;
    }
    const config=''' + config + ''';
    window.__funVerifiedPlayerHtml=config.legacy;
    window.fixture={id:config.id,backend:config.backend,environment:'test',ok:config.ok,reusable:true,
      stamp:100,checks:0,completedChecks:0,reads:[],writes:[],removes:[],storageBlocked:config.storageBlocked,
      nonce:crypto.randomUUID(),idbOpens:[],idbBlocked:false,idbWrites:[],idbWriteBlocked:false,idbHoldOpen:false,idbPendingOpens:[]};
    window.DarkSkyAdmiralSession={status:()=>({reusable:fixture.reusable,startedAt:fixture.stamp})};
    window.BlackFlagV3Identity={productionAuth:{readClientConfig:()=>({
      url:fixture.backend,environment:fixture.environment,env:fixture.environment,publishableKey:'synthetic-public-key'})}};
    window.DarkSkySupabase={create:()=>({
      readSession:()=>({user:{id:fixture.id},access_token:'NEVER-SEND-TOKEN'}),
      verifyAdmiralAuthority:async()=>{fixture.checks++;
        if(fixture.wait)await new Promise(resolve=>fixture.release=resolve);
        fixture.completedChecks++;return fixture.ok;}
    })};
    const get=Storage.prototype.getItem,set=Storage.prototype.setItem,remove=Storage.prototype.removeItem;
    window.__qaNativeStorage={get:(key)=>get.call(localStorage,key),set:(key,value)=>set.call(localStorage,key,value)};
    const open=IDBFactory.prototype.open;
    IDBFactory.prototype.open=function(name,version){fixture.idbOpens.push(String(name));
      if(fixture.idbBlocked)throw new DOMException('Storage blocked','SecurityError');
      const request=Reflect.apply(open,this,arguments);
      if(fixture.idbHoldOpen)request.addEventListener('success',event=>{
        if(!fixture.idbHoldOpen)return;event.stopImmediatePropagation();
        fixture.idbPendingOpens.push(()=>request.dispatchEvent(new Event('success')));
      },{once:true});
      return request;};
    const put=IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put=function(value,key){fixture.idbWrites.push({store:this.name,key:String(key),bytes:typeof value==='string'?value.length*2:null});
      if(fixture.idbWriteBlocked)throw new DOMException('Storage full','QuotaExceededError');
      return Reflect.apply(put,this,arguments);};
    Storage.prototype.getItem=function(key){fixture.reads.push(String(key));
      if(fixture.storageBlocked)throw new DOMException('Storage blocked','SecurityError');
      return get.call(this,key);};
    Storage.prototype.setItem=function(key,value){fixture.writes.push({key:String(key),bytes:String(value).length*2});
      if(fixture.storageBlocked||fixture.writeBlocked)throw new DOMException('Storage blocked','QuotaExceededError');
      return set.call(this,key,value);};
    Storage.prototype.removeItem=function(key){fixture.removes.push(String(key));
      if(fixture.storageBlocked)throw new DOMException('Storage blocked','SecurityError');
      return remove.call(this,key);};
    })();'''

with sync_playwright() as pw:
    browser = None

    def setup(account='admiral-test', backend='https://invalid.test', base='/fleet/',
              ok=True, storage_blocked=False, width=1280, height=840):
        context = browser.new_context(viewport={'width': width, 'height': height},
                                      has_touch=True, accept_downloads=True)
        page = context.new_page()
        errors, requests = [], []
        page.set_default_timeout(30000)
        page.on('pageerror', lambda error: errors.append(str(error)))
        context.add_init_script(fixture_script(account, backend, ok, storage_blocked))
        def respond(route):
            parsed = urlsplit(route.request.url)
            requests.append(route.request.url)
            name = parsed.path.rsplit('/', 1)[-1]
            if parsed.scheme + '://' + parsed.netloc != ORIGIN:
                route.abort()
            elif not name or name == 'index.html':
                route.fulfill(status=200, content_type='text/html', body=HOST)
            elif name in inputs:
                kind = ('text/css' if name.endswith('.css') else
                        'application/javascript' if name.endswith('.js') else 'text/html')
                route.fulfill(status=200, content_type=kind, body=(r / name).read_bytes())
            else:
                route.abort()
        context.route('**/*', respond)
        page.goto(ORIGIN + base + 'index.html')
        return context, page, errors, requests

    def open_player(page):
        page.locator('#funProgramLaunch').click()
        page.wait_for_selector('#funFrame')
        frame = page.locator('#funFrame').element_handle().content_frame()
        frame.wait_for_selector('#swStart')
        assert frame.evaluate('window.__hostQaNoAnimation===true')
        assert page.locator('#funFrame').get_attribute('sandbox') == 'allow-scripts'
        assert frame.evaluate('(()=>{try{parent.document.body;return false}catch(e){return true}})()')
        return frame

    def save_state(frame):
        return frame.evaluate('''()=>{const s=StormwakeSnapshot();return {
          schema:'fun-stormwake-v2',legacy:s.legacy,mission:s.mission,prefs:s.prefs}}''')

    def voyage_fixture(frame, complete=True, checkpoint='lighthouse'):
        return frame.evaluate('''v=>{const S=BlackFlagStormwake,s=S.fresh();
          const event=e=>{if(!S.event(s,e).ok)throw Error('Rejected fixture event: '+e.type)};
          event({type:'talk'});event({type:'collect',id:'rope'});
          if(v.complete){event({type:'collect',id:'timber'});event({type:'collect',id:'gear'});
            const work=new S.BridgeWork(s);work.fitGear(s);work.secureBrace(s);work.setHolding(true,s);
            for(let i=0;i<121;i++)work.step(.05,s);
            event({type:'rescue'});event({type:'finish'});event({type:'checkpoint',id:v.checkpoint});
            event({type:'chart'});}
          event({type:'prefs',prefs:{quality:'low',sound:false,reducedMotion:true}});
          return S.validate(s)}''', {'complete': complete, 'checkpoint': checkpoint})

    def import_voyage(page, frame, voyage, name):
        path=out/(name+'.json');path.write_text(json.dumps(voyage))
        page.locator('#funImport').set_input_files(str(path))
        page.wait_for_selector('#funConfirmImport')
        preview=page.locator('#funImportSummary').inner_text()
        page.locator('#funConfirmImport').click()
        page.wait_for_function("!document.querySelector('#funImportConfirm')")
        page.wait_for_selector('#funFrame')
        frame=page.locator('#funFrame').element_handle().content_frame()
        frame.wait_for_selector('#swStart')
        frame.wait_for_function('mission=>JSON.stringify(StormwakeSnapshot().mission)===JSON.stringify(mission)',arg=voyage['mission'],polling=100)
        assert save_state(frame)==voyage,'Confirmed import changed the expected voyage'
        return preview,frame

    def snapshot(page, frame=None):
        data = {'fixture': page.evaluate('fixture'),
                'badge': page.locator('#funSaveState').inner_text(),
                'badge_state': page.locator('#funSaveState').get_attribute('data-state'),
                'status': page.locator('#funProgramStatus').inner_text()}
        if frame:
            data['voyage'] = save_state(frame)
            data['title_stage'] = frame.locator('#swVoyageStage').inner_text()
            data['title_dock'] = frame.locator('#swVoyageDock').inner_text()
        return data

    def device_records(page):
        return page.evaluate('''async config=>{
          const known=await indexedDB.databases();
          if(!known.some(entry=>entry.name===config.database))return {};
          return await new Promise((resolve,reject)=>{
            const request=indexedDB.open(config.database);
            request.onerror=()=>reject(request.error);
            request.onsuccess=()=>{const db=request.result;
              if(!db.objectStoreNames.contains(config.store)){db.close();resolve({});return;}
              const transaction=db.transaction(config.store,'readonly'),store=transaction.objectStore(config.store);
              const keys=store.getAllKeys(),values=store.getAll();
              transaction.oncomplete=()=>{db.close();resolve(Object.fromEntries(keys.result.map((key,i)=>[key,values.result[i]])));};
              transaction.onerror=()=>{db.close();reject(transaction.error);};
            };
          });
        }''', {'database':DATABASE,'store':STORE})

    def one_device_record(page):
        records=device_records(page)
        assert len(records)==1, ('Expected one scoped game record',list(records))
        key,raw=next(iter(records.items()))
        record=json.loads(raw)
        assert key.startswith(PREFIX) and record['schema']=='stormwake-device-v1'
        assert set(record)=={'schema','scope','savedAt','revision','state'}
        assert set(record['scope'])=={'account','backend','environment','site'}
        assert 'NEVER-SEND-TOKEN' not in raw and 'synthetic-public-key' not in raw
        assert len(raw.encode())<=16384
        return key,raw,record

    def wait_device_state(page, expected):
        page.wait_for_function('''async config=>{
          const known=await indexedDB.databases();
          if(!known.some(entry=>entry.name===config.database))return false;
          return await new Promise(resolve=>{const request=indexedDB.open(config.database);
            request.onerror=()=>resolve(false);
            request.onsuccess=()=>{const db=request.result;
              if(!db.objectStoreNames.contains(config.store)){db.close();resolve(false);return;}
              const transaction=db.transaction(config.store,'readonly');
              const records=transaction.objectStore(config.store).getAll();
              transaction.oncomplete=()=>{db.close();resolve(records.result.some(raw=>{
                try{return JSON.stringify(JSON.parse(raw).state)===JSON.stringify(config.state)}catch(error){return false}
              }));};transaction.onerror=()=>{db.close();resolve(false);};
            };
          });
        }''', arg={'database':DATABASE,'store':STORE,'state':expected}, polling=100)

    def wait_badge(page,state,text):
        try:
            page.wait_for_function("state=>document.querySelector('#funSaveState')?.dataset.state===state",arg=state,polling=100,timeout=10000)
        except Exception as error:
            raise AssertionError('Expected '+state+' device state; observed '+page.locator('#funSaveState').inner_text()+'; '+page.locator('#funProgramStatus').inner_text()) from error
        badge(page,state,text)

    def local_fingerprint(page):
        return page.evaluate('''async()=>{
          const rows=Object.keys(localStorage).sort().map(key=>[key,__qaNativeStorage.get(key)]);
          const payload=JSON.stringify(rows),digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(payload));
          return {keys:rows.length,characters:payload.length,sha256:[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')};
        }''')

    def badge(page, state, text):
        assert page.locator('#funSaveState').get_attribute('data-state') == state, snapshot(page)
        assert page.locator('#funSaveState').inner_text() == text, snapshot(page)

    def tap(page, locator):
        box = locator.bounding_box()
        assert box and box['width'] > 0 and box['height'] > 0
        page.touchscreen.tap(box['x'] + box['width']/2, box['y'] + box['height']/2)

    def exported_voyage(page, expected, name):
        with page.expect_download() as download:
            page.locator('#funSaveFile').click()
        path = out / (name + '.json')
        download.value.save_as(path)
        assert json.loads(path.read_text()) == expected, 'Manual JSON export changed the game state'
        assert path.stat().st_size <= 8192
        assert 'NEVER-SEND-TOKEN' not in path.read_text()

    def clean_game_io(page):
        operations = page.evaluate('({writes:fixture.writes,removes:fixture.removes})')
        assert all(item['key'].startswith(PREFIX) for item in operations['writes']), operations
        assert all(key.startswith(PREFIX) for key in operations['removes']), operations

    def case(name, function):
        global browser
        if os.environ.get('HARBORHOLD_CASE') and os.environ['HARBORHOLD_CASE'] not in name:
            return
        try:
            browser = pw.chromium.launch(
                executable_path=os.environ.get('BLACKFLAG_CHROMIUM', '/usr/bin/chromium'),
                headless=True, args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader',
                                     '--enable-unsafe-swiftshader'])
            function()
            results.append({'name': name, 'pass': True})
            print('PASS', name, flush=True)
        except Exception as error:
            results.append({'name': name, 'pass': False, 'error': str(error)})
            print('FAIL', name, str(error)[:400], flush=True)
            traceback.print_exc()
        finally:
            if browser is not None:
                browser.close()
                browser = None


    def native_quota_recovery():
        context,page,errors,requests=setup()
        observed={'scope':SCOPE,'quota_source':'native localStorage; not a mocked setItem exception'}
        try:
            observed['quota']=page.evaluate("""()=>{
              __qaNativeStorage.set('customer-orders-v1',JSON.stringify({sentinel:'KEEP-BUSINESS-RECORDS',count:7}));
              __qaNativeStorage.set('vessel-branding-v1','KEEP-BRANDING');
              let count=0,characters=0;const failures=[];
              for(const size of [65536,4096,256,16,1]){
                for(let attempt=0;attempt<1000;attempt++){
                  const key='qa-native-quota-'+count;
                  try{__qaNativeStorage.set(key,'x'.repeat(size));count++;characters+=size;}
                  catch(error){if(error.name!=='QuotaExceededError')throw error;failures.push({chunk_size:size,error:error.name});break;}
                  if(attempt===999)throw Error('Native quota fixture exceeded bounded fill attempts');
                }
              }
              fixture.reads=[];fixture.writes=[];fixture.removes=[];fixture.idbOpens=[];
              return {entries:count,characters,native_failures:failures};
            }""")
            assert len(observed['quota']['native_failures'])==5
            before=local_fingerprint(page)
            observed['business_and_storage_before']=before
            frame=open_player(page)
            expected=voyage_fixture(frame)
            observed['preview'],frame=import_voyage(page,frame,expected,'native-quota-completed-save')
            observed['after_import']=snapshot(page,frame)
            wait_badge(page,'saved','SAVED ON THIS DEVICE')
            wait_device_state(page,expected)
            assert one_device_record(page)[2]['state']==expected
            assert local_fingerprint(page)==before,'Saving the game changed existing localStorage/business bytes'
            nonce=page.evaluate('fixture.nonce')
            page.reload()
            assert page.evaluate('fixture.nonce')!=nonce
            frame=open_player(page)
            assert save_state(frame)==expected,'Native-quota recovery lost the completed voyage'
            wait_badge(page,'recovered','VOYAGE RECOVERED')
            assert frame.locator('#swVoyageStage').inner_text()=='THE BROKEN PASSAGE · 06 / 06'
            assert frame.locator('#swVoyageDock').inner_text()=='Safe return: Lighthouse landing'
            tap(page,frame.locator('#swStart'))
            assert frame.locator('#swHud').is_visible()
            assert frame.locator('#swStage').inner_text()=='06 / 06'
            assert frame.locator('#swObjective').inner_text()=='Crew home · channel reopened'
            assert save_state(frame)==expected
            observed['after_reload_resume']=snapshot(page,frame)
            observed['business_and_storage_after']=local_fingerprint(page)
            assert observed['business_and_storage_after']==before
            clean_game_io(page)
            assert not errors,errors
        finally:
            observed['page_errors']=errors
            observed['fulfilled_or_aborted_requests']=requests
            (out/'native-quota-observations.json').write_text(json.dumps(observed,indent=2))
            context.close()

    case('native localStorage quota preserves business data and recovers completed voyage through IndexedDB',native_quota_recovery)


    def device_record(page,key):
        return device_records(page).get(key)

    def write_device_record(page,key,raw):
        page.evaluate('''config=>new Promise((resolve,reject)=>{
          const request=indexedDB.open(config.database,1);
          request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(config.store))request.result.createObjectStore(config.store);};
          request.onerror=()=>reject(request.error);
          request.onsuccess=()=>{const db=request.result,transaction=db.transaction(config.store,'readwrite');
            transaction.objectStore(config.store).put(config.raw,config.key);
            transaction.oncomplete=()=>{db.close();resolve();};
            transaction.onerror=()=>{db.close();reject(transaction.error);};
          };
        })''',{'database':DATABASE,'store':STORE,'key':key,'raw':raw})

    def legacy_fixture(page,expected):
        return page.evaluate(r'''state=>{
          const scope={account:fixture.id,backend:new URL(fixture.backend).href.replace(/\/+$/,''),environment:fixture.environment,site:new URL('.',location.href).href};
          const key='blackflag.stormwake.voyage.v1:'+encodeURIComponent(JSON.stringify(scope));
          const raw=JSON.stringify({schema:'stormwake-device-v1',scope,savedAt:new Date().toISOString(),revision:crypto.randomUUID(),state});
          return {key,raw,scope};
        }''',expected)

    def migrated_legacy():
        context,page,errors,requests=setup()
        observed={}
        try:
            expected=voyage_fixture(page)
            legacy=legacy_fixture(page,expected)
            page.evaluate('v=>{__qaNativeStorage.set(v.key,v.raw);__qaNativeStorage.set("customer-orders-v1","KEEP-LEGACY-BUSINESS");fixture.reads=[];fixture.writes=[];fixture.removes=[];}',legacy)
            before=local_fingerprint(page)
            frame=open_player(page)
            assert save_state(frame)==expected,'Valid .48 device voyage was not recovered'
            wait_badge(page,'recovered','VOYAGE RECOVERED')
            wait_device_state(page,expected)
            assert device_record(page,legacy['key']) is not None
            assert page.evaluate('key=>__qaNativeStorage.get(key)',legacy['key'])==legacy['raw']
            assert local_fingerprint(page)==before
            tap(page,frame.locator('#swTitleSettings'))
            frame.locator('#swQuality').select_option('balanced')
            changed=save_state(frame)
            assert changed['prefs']['quality']=='balanced'
            wait_device_state(page,changed)
            wait_badge(page,'saved','SAVED ON THIS DEVICE')
            assert local_fingerprint(page)==before,'Migration or later progress rewrote legacy/local business storage'
            page.reload();frame=open_player(page)
            assert save_state(frame)==changed,'IndexedDB progress lost precedence over the retained legacy copy'
            wait_badge(page,'recovered','VOYAGE RECOVERED')
            assert page.evaluate('key=>__qaNativeStorage.get(key)',legacy['key'])==legacy['raw']
            observed={'legacy_key':legacy['key'],'legacy_raw_sha256':hashlib.sha256(legacy['raw'].encode()).hexdigest(),'local_storage_before':before,'local_storage_after':local_fingerprint(page),'current_voyage':save_state(frame)}
            clean_game_io(page);assert not errors,errors
        finally:
            (out/'legacy-migration-observations.json').write_text(json.dumps(observed,indent=2));context.close()

    case('valid exact-scope legacy .48 voyage migrates without rewriting its original bytes',migrated_legacy)

    def legacy_read_unavailable():
        context,page,errors,requests=setup(storage_blocked=True)
        observed={}
        try:
            frame=open_player(page)
            assert not save_state(frame)['mission']['briefed']
            assert page.locator('#funSaveState').get_attribute('data-state') in ['unavailable','invalid']
            assert device_records(page)=={},'Unknown inaccessible legacy save was hidden by a fresh automatic save'
            expected=voyage_fixture(frame)
            observed['preview'],frame=import_voyage(page,frame,expected,'legacy-read-blocked-explicit-import')
            wait_device_state(page,expected);wait_badge(page,'saved','SAVED ON THIS DEVICE')
            assert save_state(frame)==expected
            page.reload();frame=open_player(page)
            assert save_state(frame)==expected,'Primary durable save could not recover while legacy reads stayed blocked'
            wait_badge(page,'recovered','VOYAGE RECOVERED')
            observed['recovered']=snapshot(page,frame)
            assert not errors,errors
        finally:
            (out/'legacy-read-unavailable-observations.json').write_text(json.dumps(observed,indent=2));context.close()

    case('inaccessible legacy storage requires explicit import before establishing a new primary save',legacy_read_unavailable)

    def cancelled_pending_open():
        observed={}
        for action in ['close','session-ended']:
            context,page,errors,requests=setup()
            try:
                expected=voyage_fixture(page);legacy=legacy_fixture(page,expected)
                page.evaluate('v=>{__qaNativeStorage.set(v.key,v.raw);fixture.idbHoldOpen=true;fixture.reads=[];fixture.writes=[];fixture.removes=[];}',legacy)
                page.locator('#funProgramLaunch').click()
                page.wait_for_function('fixture.idbPendingOpens.length===1')
                if action=='close':
                    page.evaluate('BlackFlagFUNProgram.close()')
                else:
                    page.evaluate('fixture.reusable=false;window.dispatchEvent(new Event("darksky:admiral-session-ended"))')
                page.evaluate('fixture.idbHoldOpen=false;fixture.idbPendingOpens.splice(0).forEach(release=>release())')
                if action=='session-ended':
                    page.wait_for_function('document.querySelector("#funSaveState")?.dataset.state==="held"')
                else:
                    page.wait_for_function('document.querySelector("#funProgram")?.hidden===true')
                # A fresh native IDB read forms a completion barrier after the released
                # open event. No simulated commit or replacement data is introduced.
                records=device_records(page)
                assert records=={},'Cancelled/expired opening migrated a save after its context ended'
                assert not page.locator('#funFrame').count(),'Cancelled/expired entry created a late game frame'
                assert page.evaluate('key=>__qaNativeStorage.get(key)',legacy['key'])==legacy['raw']
                observed[action]={'record_count':len(records),'frame_count':page.locator('#funFrame').count(),'badge':page.locator('#funSaveState').inner_text(),'idb_write_attempts':page.evaluate('fixture.idbWrites')}
                assert not errors,errors
            finally:context.close()
        (out/'cancelled-pending-open-observations.json').write_text(json.dumps(observed,indent=2))

    case('close and session invalidation prevent delayed migration after native database opening',cancelled_pending_open)


    def scoped_accounts():
        context, page, errors, requests = setup()
        observed = {}
        try:
            page.evaluate("localStorage.setItem('customer-orders-v1','DO-NOT-TOUCH');fixture.reads=[];fixture.writes=[];fixture.removes=[]")
            frame = open_player(page)
            expected = voyage_fixture(frame)
            _,frame=import_voyage(page, frame, expected, 'account-a-completed')
            wait_device_state(page, expected)
            key, original, record = one_device_record(page)
            assert record['scope']['account'] == 'admiral-test'
            assert record['scope']['site'] == ORIGIN + '/fleet/'
            assert record['scope']['backend'].rstrip('/') == 'https://invalid.test'
            observed['account_a_record'] = record
            page.reload()
            page.evaluate("fixture.id='second-admiral'")
            frame = open_player(page)
            assert not save_state(frame)['mission']['briefed'], 'Another account received account A progress'
            assert device_record(page,key) == original, 'Account B overwrote account A save'
            assert frame.locator('#swVoyageStage').inner_text() == 'THE BROKEN PASSAGE · 01 / 06'
            observed['account_b'] = snapshot(page, frame)
            page.evaluate('BlackFlagFUNProgram.close();fixture.id="admiral-test"')
            frame = open_player(page)
            assert save_state(frame) == expected, 'Account A did not recover its own voyage'
            assert page.evaluate("localStorage.getItem('customer-orders-v1')") == 'DO-NOT-TOUCH'
            clean_game_io(page)
            observed['account_a_return'] = snapshot(page, frame)
            assert not errors, errors
        finally:
            (out / 'account-isolation-observations.json').write_text(json.dumps(observed, indent=2))
            context.close()

    case('verified account isolation keeps the other account and business sentinel untouched', scoped_accounts)


    def scoped_deployments():
        context, page, errors, requests = setup()
        observed = {}
        try:
            frame = open_player(page)
            expected = voyage_fixture(frame)
            _,frame=import_voyage(page, frame, expected, 'deployment-a-completed')
            wait_device_state(page, expected)
            key, original, record = one_device_record(page)
            page.goto(ORIGIN + '/other-engine/index.html')
            frame = open_player(page)
            assert not save_state(frame)['mission']['briefed'], 'Different engine path recovered another engine save'
            observed['other_path'] = snapshot(page, frame)
            page.goto(ORIGIN + '/fleet/index.html')
            page.evaluate("fixture.backend='https://second-backend.test'")
            frame = open_player(page)
            assert not save_state(frame)['mission']['briefed'], 'Different backend recovered another backend save'
            observed['other_backend'] = snapshot(page, frame)
            page.evaluate("BlackFlagFUNProgram.close();fixture.backend='https://invalid.test'")
            frame = open_player(page)
            assert save_state(frame) == expected, 'Memory used only account ID rather than the full backend scope'
            page.evaluate("BlackFlagFUNProgram.close();fixture.environment='other-environment'")
            frame = open_player(page)
            assert not save_state(frame)['mission']['briefed'], 'Different configured environment reused the prior memory/save'
            observed['other_environment'] = snapshot(page, frame)
            assert device_record(page,key) == original
            page.goto(ORIGIN + '/fleet/index.html?return=1#voyage')
            frame = open_player(page)
            assert save_state(frame) == expected, 'Query/hash changed the canonical engine scope'
            observed['original_return'] = snapshot(page, frame)
            clean_game_io(page)
            assert not errors, errors
        finally:
            (out / 'deployment-isolation-observations.json').write_text(json.dumps(observed, indent=2))
            context.close()

    case('engine directory backend and environment are isolated while query and hash are ignored', scoped_deployments)


    def denied_authority():
        context, page, errors, requests = setup()
        try:
            frame = open_player(page)
            expected = voyage_fixture(frame)
            _,frame=import_voyage(page, frame, expected, 'denied-auth-source')
            wait_device_state(page, expected)
            page.reload()
            page.evaluate('fixture.ok=false')
            page.locator('#funProgramLaunch').click()
            page.wait_for_function('fixture.checks>0&&document.querySelector("#funSaveState")?.textContent==="ACCESS HELD"')
            assert not page.locator('#funFrame').count()
            assert page.evaluate('fixture.idbOpens') == [], 'Unauthorized recovery opened the game database'
            assert page.evaluate('fixture.reads') == [], 'Game recovery read saved progress before verified authority'
            assert page.evaluate('fixture.writes') == []
            assert 'Crew home' not in page.locator('body').inner_text()
            assert not errors, errors
        finally:
            context.close()

    case('denied authority cannot read or expose a saved voyage', denied_authority)


    def verification_race():
        context, page, errors, requests = setup()
        try:
            page.evaluate('fixture.wait=true')
            page.locator('#funProgramLaunch').click()
            page.wait_for_function('typeof fixture.release==="function"')
            page.evaluate("fixture.backend='https://changed-during-verification.test';fixture.release()")
            page.wait_for_function('document.querySelector("#funSaveState")?.textContent==="ACCESS HELD"')
            assert not page.locator('#funFrame').count(), 'Changed verification context still opened a player'
            assert page.evaluate('fixture.idbOpens') == [], 'Unauthorized recovery opened the game database'
            assert page.evaluate('fixture.reads') == []
            assert page.evaluate('fixture.writes') == []
            assert not errors, errors
        finally:
            context.close()

    case('backend change during asynchronous verification fails closed before recovery', verification_race)


    def corrupt_record():
        context, page, errors, requests = setup()
        observed = {}
        try:
            frame = open_player(page)
            expected = voyage_fixture(frame)
            _,frame=import_voyage(page, frame, expected, 'corrupt-record-source')
            wait_device_state(page, expected)
            key, raw, record = one_device_record(page)
            for label, broken in [('invalid-json', '{unreadable voyage'),
                                  ('future-schema', json.dumps({**record, 'schema': 'stormwake-device-v999'})),
                                  ('wrong-scope', json.dumps({**record, 'scope': {**record['scope'], 'account': 'not-this-account'}}))]:
                write_device_record(page,key,broken)
                page.reload()
                frame = open_player(page)
                assert not save_state(frame)['mission']['briefed']
                badge(page, 'invalid', 'DEVICE SAVE NEEDS ATTENTION')
                assert device_record(page,key) == broken, 'Unusable saved bytes were silently replaced'
                # A real settings change emits a valid progress message. It must not
                # overwrite a quarantined prior voyage either.
                tap(page, frame.locator('#swTitleSettings'))
                frame.locator('#swQuality').select_option('low')
                page.wait_for_function('document.querySelector("#funSaveState")?.dataset.state==="invalid"')
                assert device_record(page,key) == broken
                observed[label] = snapshot(page)
            preview,frame = import_voyage(page, frame, expected, 'deliberate-corrupt-replacement')
            wait_device_state(page, expected)
            assert one_device_record(page)[2]['state'] == expected
            wait_badge(page, 'saved', 'SAVED ON THIS DEVICE')
            observed['explicit_import_preview'] = preview
            observed['replaced_after_confirmation'] = snapshot(page, frame)
            assert not errors, errors
        finally:
            (out / 'corrupt-storage-observations.json').write_text(json.dumps(observed, indent=2))
            context.close()

    case('corrupt future-schema and wrong-scope saves are preserved until a confirmed import', corrupt_record)


    def storage_unavailable():
        context, page, errors, requests = setup(storage_blocked=True)
        page.evaluate("fixture.idbBlocked=true")
        observed = {}
        try:
            frame = open_player(page)
            wait_badge(page, 'unavailable', 'DEVICE SAVE UNAVAILABLE')
            expected = voyage_fixture(frame)
            _,frame=import_voyage(page, frame, expected, 'blocked-storage-import')
            wait_badge(page, 'unavailable', 'DEVICE SAVE UNAVAILABLE')
            assert save_state(frame) == expected
            exported_voyage(page, expected, 'blocked-storage-manual-backup')
            wait_badge(page, 'unavailable', 'DEVICE SAVE UNAVAILABLE')
            observed['after_manual_backup'] = snapshot(page, frame)
            tap(page, frame.locator('#swStart'))
            assert frame.locator('#swStage').inner_text() == '06 / 06'
            assert not errors, errors
        finally:
            (out / 'blocked-storage-observations.json').write_text(json.dumps(observed, indent=2))
            context.close()

    case('blocked device storage remains playable and exportable without a false save-success badge', storage_unavailable)


    def quota_failure():
        context, page, errors, requests = setup()
        observed = {}
        try:
            frame = open_player(page)
            expected = voyage_fixture(frame)
            _,frame=import_voyage(page, frame, expected, 'quota-last-durable-save')
            wait_device_state(page, expected)
            key, original, record = one_device_record(page)
            page.evaluate('fixture.idbWriteBlocked=true')
            changed = voyage_fixture(frame, complete=False)
            _,frame=import_voyage(page, frame, changed, 'quota-current-memory-save')
            wait_badge(page, 'unavailable', 'DEVICE SAVE UNAVAILABLE')
            assert save_state(frame) == changed
            assert device_record(page,key) == original, 'Failed write erased last durable save'
            exported_voyage(page, changed, 'quota-current-manual-backup')
            observed['failed_write'] = snapshot(page, frame)
            page.reload()
            frame = open_player(page)
            assert save_state(frame) == expected, 'Last successful durable save was not recoverable after quota failure'
            badge(page, 'recovered', 'VOYAGE RECOVERED')
            observed['reload'] = snapshot(page, frame)
            assert not errors, errors
        finally:
            (out / 'quota-failure-observations.json').write_text(json.dumps(observed, indent=2))
            context.close()

    case('quota failure keeps the last durable save and permits exporting newer in-memory progress', quota_failure)


    def imports_and_progress():
        context, page, errors, requests = setup()
        observed = {}
        try:
            frame = open_player(page)
            current = voyage_fixture(frame, complete=False)
            _,frame=import_voyage(page, frame, current, 'progress-current')
            wait_device_state(page, current)
            key, original, record = one_device_record(page)
            candidate = voyage_fixture(frame)
            path = out / 'cancelled-completed-candidate.json'
            path.write_text(json.dumps(candidate))
            page.locator('#funImport').set_input_files(str(path))
            page.wait_for_selector('#funConfirmImport')
            assert 'device' in page.locator('#funImportConfirm').inner_text().lower(), 'Import preview omitted the durable-copy replacement'
            page.locator('#funCancelImport').click()
            assert save_state(frame) == current
            assert device_record(page,key) == original, 'Cancelled import changed device storage'
            # Actual settings UI sends the accepted progress message through the
            # opaque child channel; no production state is mutated by the harness.
            tap(page, frame.locator('#swTitleSettings'))
            frame.locator('#swQuality').select_option('balanced')
            changed = save_state(frame)
            assert changed['prefs']['quality'] == 'balanced'
            wait_device_state(page, changed)
            wait_badge(page, 'saved', 'SAVED ON THIS DEVICE')
            exported_voyage(page, changed, 'progress-json-roundtrip')
            observed['settings_saved'] = snapshot(page)
            observed['settings_saved']['voyage'] = changed
            page.reload()
            frame = open_player(page)
            assert save_state(frame) == changed
            observed['reload'] = snapshot(page, frame)
            assert not errors, errors
        finally:
            (out / 'progress-import-observations.json').write_text(json.dumps(observed, indent=2))
            context.close()

    case('cancelled import preserves storage while actual settings progress is saved and exported', imports_and_progress)


    def message_boundary():
        context, page, errors, requests = setup()
        try:
            frame = open_player(page)
            expected = voyage_fixture(frame)
            _,frame=import_voyage(page, frame, expected, 'message-boundary-source')
            wait_device_state(page, expected)
            key, original, record = one_device_record(page)
            channel = frame.evaluate('__hostQaChannel')
            assert channel, 'Fixture did not observe the real startup channel'
            bad_state = voyage_fixture(frame, complete=False)
            page.evaluate('v=>window.postMessage({channel:v.channel,type:"progress",state:v.state},"*")', {'channel': channel, 'state': bad_state})
            frame.evaluate('state=>parent.postMessage({channel:"forged-channel",type:"progress",state},"*")', bad_state)
            frame.evaluate('()=>parent.postMessage({channel:__hostQaChannel,type:"progress",state:{schema:"business-orders",orders:[1]}},"*")')
            page.wait_for_function('document.querySelector("#funProgramStatus").textContent.includes("Unexpected game update rejected")')
            assert device_record(page,key) == original
            assert save_state(frame) == expected
            page.evaluate('fixture.reusable=false')
            frame.evaluate('state=>parent.postMessage({channel:__hostQaChannel,type:"progress",state},"*")', bad_state)
            page.wait_for_function('!document.querySelector("#funFrame")')
            assert device_record(page,key) == original, 'Progress after timeout wrote storage'
            assert not errors, errors
        finally:
            context.close()

    case('forged invalid and expired-session progress cannot modify device storage', message_boundary)


    def stale_tab_conflict():
        context, page, errors, requests = setup()
        observed = {}
        try:
            frame = open_player(page)
            current = voyage_fixture(frame, complete=False)
            _,frame=import_voyage(page, frame, current, 'stale-tab-incomplete')
            wait_device_state(page, current)
            second = context.new_page()
            second.set_default_timeout(30000)
            second.on('pageerror', lambda error: errors.append(str(error)))
            second.goto(ORIGIN + '/fleet/index.html')
            other = open_player(second)
            assert save_state(other) == current
            newer = voyage_fixture(other)
            _,other=import_voyage(second, other, newer, 'newer-tab-complete')
            wait_device_state(second, newer)
            key, latest, record = one_device_record(second)
            tap(page, frame.locator('#swTitleSettings'))
            frame.locator('#swQuality').select_option('balanced')
            page.wait_for_function('document.querySelector("#funSaveState")?.dataset.state==="conflict"')
            badge(page, 'conflict', 'AUTOSAVE PAUSED')
            assert device_record(page,key) == latest, 'Older tab overwrote the newer voyage'
            observed['older_tab'] = snapshot(page)
            observed['newer_record'] = record
            page.reload()
            frame = open_player(page)
            assert save_state(frame) == newer
            badge(page, 'recovered', 'VOYAGE RECOVERED')
            assert not errors, errors
        finally:
            (out / 'stale-tab-observations.json').write_text(json.dumps(observed, indent=2))
            context.close()

    case('older tab cannot overwrite a newer durable voyage', stale_tab_conflict)


    def denied_account_receipt():
        context, page, errors, requests = setup()
        observed = {}
        try:
            frame = open_player(page)
            expected = voyage_fixture(frame)
            _,frame=import_voyage(page, frame, expected, 'receipt-account-a-source')
            wait_device_state(page, expected)
            observed['verified_account_a'] = snapshot(page, frame)
            page.evaluate('BlackFlagFUNProgram.close();fixture.id="unverified-account-b";fixture.ok=false;fixture.reads=[];fixture.writes=[];fixture.idbOpens=[]')
            page.locator('#funProgramLaunch').click()
            page.wait_for_function('document.querySelector("#funProgramHoldText")?.textContent.includes("No game was opened")')
            observed['denied_account_b'] = snapshot(page)
            observed['denied_account_b']['hold'] = page.locator('#funProgramHold').inner_text()
            assert not page.locator('#funFrame').count()
            assert page.locator('#funSaveFile').is_disabled() and page.locator('#funLoadFile').is_disabled()
            assert page.evaluate('fixture.idbOpens') == [], 'Unauthorized recovery opened the game database'
            assert page.evaluate('fixture.reads') == []
            assert page.evaluate('fixture.writes') == []
            badge(page, 'held', 'ACCESS HELD')
            held_text = page.locator('#funProgramHold').inner_text()
            assert 'Lighthouse landing' not in held_text, 'Denied account saw the prior account checkpoint receipt'
            assert 'Your mission is saved' not in held_text, 'Denied account received the prior account save receipt'
            assert 'Your voyage is saved' not in page.locator('#funProgramStatus').inner_text()
            assert not errors, errors
        finally:
            (out / 'denied-account-receipt-observations.json').write_text(json.dumps(observed, indent=2))
            context.close()

    case('receipt for a saved voyage is hidden when a different account is denied verification', denied_account_receipt)

    def pending_import_controls():
        context,page,errors,requests=setup()
        observed={}
        try:
            frame=open_player(page)
            current=voyage_fixture(frame,complete=False)
            _,frame=import_voyage(page,frame,current,'pending-import-current')
            wait_device_state(page,current);wait_badge(page,'saved','SAVED ON THIS DEVICE')
            candidate=voyage_fixture(frame)
            path=out/'pending-import-candidate.json';path.write_text(json.dumps(candidate))
            page.locator('#funImport').set_input_files(str(path))
            page.wait_for_selector('#funConfirmImport')
            page.evaluate('fixture.idbHoldOpen=true')
            page.locator('#funConfirmImport').click()
            page.wait_for_function('fixture.idbPendingOpens.length>0',polling=100)
            assert page.locator('#funCancelImport').is_disabled(),'Import offered cancellation after its commit began'
            assert page.locator('#funConfirmImport').is_disabled()
            assert page.locator('#funSaveFile').is_disabled() and page.locator('#funLoadFile').is_disabled()
            tap(page,page.locator('#funCancelImport'))
            assert page.locator('#funImportConfirm').is_visible()
            assert 'Import cancelled' not in page.locator('#funProgramStatus').inner_text()
            observed['held']={'pending_native_opens':page.evaluate('fixture.idbPendingOpens.length'),
                'cancel_disabled':page.locator('#funCancelImport').is_disabled(),
                'status':page.locator('#funProgramStatus').inner_text()}
            page.evaluate('fixture.idbHoldOpen=false;fixture.idbPendingOpens.splice(0).forEach(release=>release())')
            page.wait_for_function("!document.querySelector('#funImportConfirm')")
            frame=page.locator('#funFrame').element_handle().content_frame()
            frame.wait_for_selector('#swStart')
            assert save_state(frame)==candidate,'Pending import did not install its confirmed voyage'
            wait_device_state(page,candidate);wait_badge(page,'saved','SAVED ON THIS DEVICE')
            assert one_device_record(page)[2]['state']==candidate
            observed['committed']=snapshot(page,frame)
            assert not errors,errors
        finally:
            observed['page_errors']=errors
            (out/'review-pending-import-observations.json').write_text(json.dumps(observed,indent=2))
            context.close()

    case('review regression pending import disables cancellation until native save settles',pending_import_controls)

    def stale_handler_new_import():
        context,page,errors,requests=setup()
        observed={}
        try:
            frame=open_player(page)
            current=voyage_fixture(frame,complete=False)
            _,frame=import_voyage(page,frame,current,'late-handler-current')
            wait_device_state(page,current);wait_badge(page,'saved','SAVED ON THIS DEVICE')
            old_candidate=voyage_fixture(frame)
            path=out/'late-handler-old-candidate.json';path.write_text(json.dumps(old_candidate))
            page.locator('#funImport').set_input_files(str(path))
            page.wait_for_selector('#funConfirmImport')
            page.evaluate('fixture.wait=true;fixture.release=null')
            page.locator('#funConfirmImport').click()
            page.wait_for_function('typeof fixture.release==="function"',polling=100)
            page.evaluate('fixture.oldRelease=fixture.release;BlackFlagFUNProgram.close();fixture.wait=false;fixture.release=null')
            frame=open_player(page)
            assert save_state(frame)==current
            assert page.locator('#funSaveFile').is_enabled() and page.locator('#funLoadFile').is_enabled(),'Closing a pending operation left the reopened game controls disabled'
            latest=voyage_fixture(frame,checkpoint='chartmaker')
            assert latest!=old_candidate
            path=out/'late-handler-new-candidate.json';path.write_text(json.dumps(latest))
            page.locator('#funImport').set_input_files(str(path))
            page.wait_for_selector('#funConfirmImport')
            summary=page.locator('#funImportSummary').inner_text()
            page.evaluate('fixture.idbHoldOpen=true')
            page.locator('#funConfirmImport').click()
            page.wait_for_function('fixture.idbPendingOpens.length>0',polling=100)
            status=page.locator('#funProgramStatus').inner_text()
            checks=page.evaluate('fixture.completedChecks')
            page.evaluate('fixture.oldRelease()')
            page.wait_for_function('count=>fixture.completedChecks===count',arg=checks+1,polling=100)
            assert page.locator('#funImportConfirm').is_visible(),'Old confirmation removed the newer import prompt'
            assert page.locator('#funImportSummary').inner_text()==summary
            assert page.locator('#funConfirmImport').is_disabled() and page.locator('#funCancelImport').is_disabled()
            assert page.locator('#funSaveFile').is_disabled() and page.locator('#funLoadFile').is_disabled(),'Old finally handler re-enabled controls during the newer save'
            assert page.locator('#funProgramStatus').inner_text()==status,'Old handler replaced the newer operation status'
            observed['old_handler_settled']={'completed_verifications':page.evaluate('fixture.completedChecks'),
                'pending_native_opens':page.evaluate('fixture.idbPendingOpens.length'),
                'new_import_summary':summary,'status':status}
            page.evaluate('fixture.idbHoldOpen=false;fixture.idbPendingOpens.splice(0).forEach(release=>release())')
            page.wait_for_function("!document.querySelector('#funImportConfirm')")
            frame=page.locator('#funFrame').element_handle().content_frame()
            frame.wait_for_selector('#swStart')
            assert save_state(frame)==latest,'Late handler or old import replaced the current confirmed voyage'
            wait_device_state(page,latest);wait_badge(page,'saved','SAVED ON THIS DEVICE')
            assert one_device_record(page)[2]['state']==latest
            observed['committed']=snapshot(page,frame)
            assert not errors,errors
        finally:
            observed['page_errors']=errors
            (out/'review-stale-handler-observations.json').write_text(json.dumps(observed,indent=2))
            context.close()

    case('review regression stale confirmation cannot alter a newer pending import',stale_handler_new_import)

    def first_light_reopen_newer_save():
        context,page,errors,requests=setup()
        observed={}
        try:
            frame=open_player(page)
            current=voyage_fixture(frame,complete=False)
            _,frame=import_voyage(page,frame,current,'first-light-old-voyage')
            wait_device_state(page,current);wait_badge(page,'saved','SAVED ON THIS DEVICE')
            page.locator('#funExit').click()
            assert not page.locator('#funFrame').count()
            second=context.new_page();second.set_default_timeout(30000)
            second.on('pageerror',lambda error:errors.append(str(error)))
            second.goto(ORIGIN+'/fleet/index.html')
            other=open_player(second)
            assert save_state(other)==current
            latest=voyage_fixture(other)
            latest=second.evaluate('''state=>{
              const G=BlackFlagFUN;let legacy=G.fresh();
              for(const mission of G.missions){
                const result=G.act(legacy,{type:mission.kind==='choice'?'choose':'answer',value:String(mission.answer),stage:legacy.stage});
                if(!result.ok)throw Error('Legacy fixture action failed');legacy=result.state;
              }
              state.legacy=G.validate(legacy);return BlackFlagStormwake.validate(state);
            }''',latest)
            assert latest['legacy']['completed'] and latest['legacy']['stage']==6
            _,other=import_voyage(second,other,latest,'first-light-newer-voyage')
            wait_device_state(second,latest);wait_badge(second,'saved','SAVED ON THIS DEVICE')
            key,raw,record=one_device_record(second)
            # No reload, focus dispatch, or synthetic progress message is used:
            # original First Light emits ready but no startup save/restore ack.
            page.evaluate('BlackFlagFUNProgram.openLegacy()')
            page.wait_for_selector('#funFrame')
            original=page.locator('#funFrame').element_handle().content_frame()
            original.wait_for_selector('.workspace')
            assert page.locator('#funFrame').get_attribute('sandbox')=='allow-scripts'
            assert original.locator('.task h2').inner_text()=='You brought the light back.','Reopened First Light displayed the old memo'
            assert '6 / 6 chapters complete' in original.locator('.map-stage p').inner_text()
            wait_badge(page,'recovered','VOYAGE RECOVERED')
            assert device_record(page,key)==raw,'First Light reopen rewrote the newer durable record'
            exported_voyage(page,latest,'first-light-reopened-full-backup')
            observed={'legacy_title':original.locator('.task h2').inner_text(),
                'legacy_progress':original.locator('.map-stage p').inner_text(),
                'host':snapshot(page),'newer_record':record}
            assert not errors,errors
        finally:
            observed['page_errors']=errors
            (out/'review-first-light-reopen-observations.json').write_text(json.dumps(observed,indent=2))
            context.close()

    case('review regression First Light reopen recovers another tabs newer durable voyage',first_light_reopen_newer_save)


after_hashes = {name: hashlib.sha256(path.read_bytes()).hexdigest()
                for name, path in bound.items()}
report = {'scope': SCOPE, 'results': results,
          'passed': sum(item['pass'] for item in results),
          'failed': sum(not item['pass'] for item in results),
          'inputs_unchanged': before_hashes == after_hashes,
          'inputs_sha256_before': before_hashes,
          'inputs_sha256_after': after_hashes}
(out / 'results.json').write_text(json.dumps(report, indent=2))
print(json.dumps({key: report[key] for key in ('passed', 'failed', 'inputs_unchanged')}))
sys.exit(bool(report['failed']) or not report['inputs_unchanged'] or not results)

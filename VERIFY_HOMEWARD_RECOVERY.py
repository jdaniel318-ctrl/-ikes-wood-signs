"""Homeward timeout/reload recovery through the real host and compiled player.

All HTTPS responses are fulfilled from the supplied release; external network is
aborted. Account verification and timeouts are synthetic. localStorage and the
document reload are native browser operations. Child animation is held before
startup to keep this a host/state check, not a GPU or native Safari performance
claim. Each selected case launches fresh Chromium and has its own temporary
browser context and no real credentials. Browsers are closed between cases to
avoid accumulating software-renderer resources across many compiled scenes.

Usage: python VERIFY_HOMEWARD_RECOVERY.py RELEASE OUTPUT
Optional HOMEWARD_CASE selects a case by substring.
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
ORIGIN = 'https://homeward-host.test'
PREFIX = 'blackflag.stormwake.voyage.v1:'
results = []
inputs = ['fun_core.js', 'stormwake_core.js', 'fun_program.js', 'fun_program.css',
          'fun_player.html', 'stormwake_player.html', 'stormwake_game.js',
          'stormwake_game.css', 'STORMWAKE_PLAYER_BUILD.json']
bound = {name: r / name for name in inputs}
bound['VERIFY_HOMEWARD_RECOVERY.py'] = HERE
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
      stamp:100,checks:0,reads:[],writes:[],removes:[],storageBlocked:config.storageBlocked,
      nonce:crypto.randomUUID()};
    window.DarkSkyAdmiralSession={status:()=>({reusable:fixture.reusable,startedAt:fixture.stamp})};
    window.BlackFlagV3Identity={productionAuth:{readClientConfig:()=>({
      url:fixture.backend,environment:fixture.environment,env:fixture.environment,publishableKey:'synthetic-public-key'})}};
    window.DarkSkySupabase={create:()=>({
      readSession:()=>({user:{id:fixture.id},access_token:'NEVER-SEND-TOKEN'}),
      verifyAdmiralAuthority:async()=>{fixture.checks++;
        if(fixture.wait)await new Promise(resolve=>fixture.release=resolve);
        return fixture.ok;}
    })};
    const get=Storage.prototype.getItem,set=Storage.prototype.setItem,remove=Storage.prototype.removeItem;
    Storage.prototype.getItem=function(key){fixture.reads.push(String(key));
      if(fixture.storageBlocked)throw new DOMException('Storage blocked','SecurityError');
      return get.call(this,key);};
    Storage.prototype.setItem=function(key,value){fixture.writes.push({key:String(key),value:String(value)});
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
        path = out / (name + '.json')
        path.write_text(json.dumps(voyage))
        page.locator('#funImport').set_input_files(str(path))
        page.wait_for_selector('#funConfirmImport')
        preview = page.locator('#funImportSummary').inner_text()
        page.locator('#funConfirmImport').click()
        frame.wait_for_function('mission=>JSON.stringify(StormwakeSnapshot().mission)===JSON.stringify(mission)',
                                arg=voyage['mission'], polling=100)
        assert save_state(frame) == voyage, 'Confirmed import changed the expected voyage'
        return preview

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
        return page.evaluate('prefix=>Object.fromEntries(Object.keys(localStorage).filter(key=>key.startsWith(prefix)).map(key=>[key,localStorage.getItem(key)]))', PREFIX)

    def one_device_record(page):
        records = device_records(page)
        assert len(records) == 1, ('Expected one scoped game record', list(records))
        key, raw = next(iter(records.items()))
        record = json.loads(raw)
        assert record['schema'] == 'stormwake-device-v1'
        assert set(record) == {'schema', 'scope', 'savedAt', 'revision', 'state'}, record.keys()
        assert set(record['scope']) == {'account', 'backend', 'environment', 'site'}, record['scope']
        assert 'NEVER-SEND-TOKEN' not in raw and 'synthetic-public-key' not in raw
        assert len(raw.encode()) <= 16384, 'Unexpectedly large device record'
        return key, raw, record

    def wait_device_state(page, expected):
        page.wait_for_function('''v=>Object.keys(localStorage).filter(k=>k.startsWith(v.prefix)).some(k=>{
          try{return JSON.stringify(JSON.parse(localStorage.getItem(k)).state)===JSON.stringify(v.state)}catch(e){return false}
        })''', arg={'prefix': PREFIX, 'state': expected}, polling=100)

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
        if os.environ.get('HOMEWARD_CASE') and os.environ['HOMEWARD_CASE'] not in name:
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

    def timeout_reload():
        context, page, errors, requests = setup()
        observed = {'scope': SCOPE}
        try:
            frame = open_player(page)
            expected = voyage_fixture(frame)
            observed['preview'] = import_voyage(page, frame, expected, 'timeout-completed-save')
            observed['before_timeout'] = snapshot(page, frame)
            nonce = page.evaluate('fixture.nonce')
            page.evaluate("fixture.reusable=false;window.dispatchEvent(new Event('darksky:admiral-session-ended'))")
            page.wait_for_function('!document.querySelector("#funFrame")')
            observed['after_timeout'] = snapshot(page)
            assert page.locator('#funSaveFile').is_disabled(), 'Expired session still permits save operations'
            assert page.locator('#funLoadFile').is_disabled(), 'Expired session still permits import operations'
            page.reload()
            assert page.evaluate('fixture.nonce') != nonce, 'Reload did not create a new host document'
            frame = open_player(page)
            observed['after_reload'] = snapshot(page, frame)
            assert save_state(frame) == expected, 'Completed voyage was lost after session timeout and full reload'
            assert frame.locator('#swVoyageStage').inner_text() == 'THE BROKEN PASSAGE · 06 / 06'
            assert frame.locator('#swVoyageDock').inner_text() == 'Safe return: Lighthouse landing'
            badge(page, 'recovered', 'VOYAGE RECOVERED')
            tap(page, frame.locator('#swStart'))
            assert frame.locator('#swHud').is_visible()
            assert frame.locator('#swStage').inner_text() == '06 / 06'
            assert frame.locator('#swObjective').inner_text() == 'Crew home · channel reopened'
            assert save_state(frame) == expected
            observed['after_resume'] = snapshot(page)
            observed['after_resume']['voyage'] = save_state(frame)
            observed['after_resume']['hud_stage'] = frame.locator('#swStage').inner_text()
            clean_game_io(page)
            assert not errors, errors
        finally:
            observed['page_errors'] = errors
            observed['fulfilled_or_aborted_requests'] = requests
            (out / 'timeout-reload-observations.json').write_text(json.dumps(observed, indent=2))
            context.close()

    case('completed voyage survives session timeout and full document reload', timeout_reload)

    def close_and_reopen_tab():
        context, page, errors, requests = setup()
        try:
            frame = open_player(page)
            expected = voyage_fixture(frame, complete=False)
            import_voyage(page, frame, expected, 'closed-tab-incomplete')
            wait_device_state(page, expected)
            page.close()
            page = context.new_page()
            page.set_default_timeout(30000)
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(ORIGIN + '/fleet/index.html')
            frame = open_player(page)
            assert save_state(frame) == expected, 'Closing the tab lost the saved incomplete voyage'
            badge(page, 'recovered', 'VOYAGE RECOVERED')
            assert not errors, errors
        finally:
            context.close()

    case('incomplete voyage survives closing the tab and opening a new tab', close_and_reopen_tab)

    def scoped_accounts():
        context, page, errors, requests = setup()
        observed = {}
        try:
            page.evaluate("localStorage.setItem('customer-orders-v1','DO-NOT-TOUCH');fixture.reads=[];fixture.writes=[];fixture.removes=[]")
            frame = open_player(page)
            expected = voyage_fixture(frame)
            import_voyage(page, frame, expected, 'account-a-completed')
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
            assert page.evaluate('key=>localStorage.getItem(key)', key) == original, 'Account B overwrote account A save'
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
            import_voyage(page, frame, expected, 'deployment-a-completed')
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
            assert page.evaluate('key=>localStorage.getItem(key)', key) == original
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
            import_voyage(page, frame, expected, 'denied-auth-source')
            wait_device_state(page, expected)
            page.reload()
            page.evaluate('fixture.ok=false')
            page.locator('#funProgramLaunch').click()
            page.wait_for_function('fixture.checks>0&&document.querySelector("#funSaveState")?.textContent==="ACCESS HELD"')
            assert not page.locator('#funFrame').count()
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
            import_voyage(page, frame, expected, 'corrupt-record-source')
            wait_device_state(page, expected)
            key, raw, record = one_device_record(page)
            for label, broken in [('invalid-json', '{unreadable voyage'),
                                  ('future-schema', json.dumps({**record, 'schema': 'stormwake-device-v999'})),
                                  ('wrong-scope', json.dumps({**record, 'scope': {**record['scope'], 'account': 'not-this-account'}}))]:
                page.evaluate('v=>localStorage.setItem(v.key,v.raw)', {'key': key, 'raw': broken})
                page.reload()
                frame = open_player(page)
                assert not save_state(frame)['mission']['briefed']
                badge(page, 'invalid', 'DEVICE SAVE NEEDS ATTENTION')
                assert page.evaluate('key=>localStorage.getItem(key)', key) == broken, 'Unusable saved bytes were silently replaced'
                # A real settings change emits a valid progress message. It must not
                # overwrite a quarantined prior voyage either.
                tap(page, frame.locator('#swTitleSettings'))
                frame.locator('#swQuality').select_option('low')
                page.wait_for_function('document.querySelector("#funSaveState")?.dataset.state==="invalid"')
                assert page.evaluate('key=>localStorage.getItem(key)', key) == broken
                observed[label] = snapshot(page)
            preview = import_voyage(page, frame, expected, 'deliberate-corrupt-replacement')
            wait_device_state(page, expected)
            assert one_device_record(page)[2]['state'] == expected
            badge(page, 'saved', 'SAVED ON THIS DEVICE')
            observed['explicit_import_preview'] = preview
            observed['replaced_after_confirmation'] = snapshot(page, frame)
            assert not errors, errors
        finally:
            (out / 'corrupt-storage-observations.json').write_text(json.dumps(observed, indent=2))
            context.close()

    case('corrupt future-schema and wrong-scope saves are preserved until a confirmed import', corrupt_record)

    def storage_unavailable():
        context, page, errors, requests = setup(storage_blocked=True)
        observed = {}
        try:
            frame = open_player(page)
            badge(page, 'unavailable', 'DEVICE SAVE UNAVAILABLE')
            expected = voyage_fixture(frame)
            import_voyage(page, frame, expected, 'blocked-storage-import')
            badge(page, 'unavailable', 'DEVICE SAVE UNAVAILABLE')
            assert save_state(frame) == expected
            exported_voyage(page, expected, 'blocked-storage-manual-backup')
            badge(page, 'unavailable', 'DEVICE SAVE UNAVAILABLE')
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
            import_voyage(page, frame, expected, 'quota-last-durable-save')
            wait_device_state(page, expected)
            key, original, record = one_device_record(page)
            page.evaluate('fixture.writeBlocked=true')
            changed = voyage_fixture(frame, complete=False)
            import_voyage(page, frame, changed, 'quota-current-memory-save')
            badge(page, 'unavailable', 'DEVICE SAVE UNAVAILABLE')
            assert save_state(frame) == changed
            assert page.evaluate('key=>localStorage.getItem(key)', key) == original, 'Failed write erased last durable save'
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
            import_voyage(page, frame, current, 'progress-current')
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
            assert page.evaluate('key=>localStorage.getItem(key)', key) == original, 'Cancelled import changed device storage'
            # Actual settings UI sends the accepted progress message through the
            # opaque child channel; no production state is mutated by the harness.
            tap(page, frame.locator('#swTitleSettings'))
            frame.locator('#swQuality').select_option('balanced')
            changed = save_state(frame)
            assert changed['prefs']['quality'] == 'balanced'
            wait_device_state(page, changed)
            badge(page, 'saved', 'SAVED ON THIS DEVICE')
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
            import_voyage(page, frame, expected, 'message-boundary-source')
            wait_device_state(page, expected)
            key, original, record = one_device_record(page)
            channel = frame.evaluate('__hostQaChannel')
            assert channel, 'Fixture did not observe the real startup channel'
            bad_state = voyage_fixture(frame, complete=False)
            page.evaluate('v=>window.postMessage({channel:v.channel,type:"progress",state:v.state},"*")', {'channel': channel, 'state': bad_state})
            frame.evaluate('state=>parent.postMessage({channel:"forged-channel",type:"progress",state},"*")', bad_state)
            frame.evaluate('()=>parent.postMessage({channel:__hostQaChannel,type:"progress",state:{schema:"business-orders",orders:[1]}},"*")')
            page.wait_for_function('document.querySelector("#funProgramStatus").textContent.includes("Unexpected game update rejected")')
            assert page.evaluate('key=>localStorage.getItem(key)', key) == original
            assert save_state(frame) == expected
            page.evaluate('fixture.reusable=false')
            frame.evaluate('state=>parent.postMessage({channel:__hostQaChannel,type:"progress",state},"*")', bad_state)
            page.wait_for_function('!document.querySelector("#funFrame")')
            assert page.evaluate('key=>localStorage.getItem(key)', key) == original, 'Progress after timeout wrote storage'
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
            import_voyage(page, frame, current, 'stale-tab-incomplete')
            wait_device_state(page, current)
            second = context.new_page()
            second.set_default_timeout(30000)
            second.on('pageerror', lambda error: errors.append(str(error)))
            second.goto(ORIGIN + '/fleet/index.html')
            other = open_player(second)
            assert save_state(other) == current
            newer = voyage_fixture(other)
            import_voyage(second, other, newer, 'newer-tab-complete')
            wait_device_state(second, newer)
            key, latest, record = one_device_record(second)
            tap(page, frame.locator('#swTitleSettings'))
            frame.locator('#swQuality').select_option('balanced')
            page.wait_for_function('document.querySelector("#funSaveState")?.dataset.state==="conflict"')
            badge(page, 'conflict', 'AUTOSAVE PAUSED')
            assert page.evaluate('key=>localStorage.getItem(key)', key) == latest, 'Older tab overwrote the newer voyage'
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
            import_voyage(page, frame, expected, 'receipt-account-a-source')
            wait_device_state(page, expected)
            observed['verified_account_a'] = snapshot(page, frame)
            page.evaluate('BlackFlagFUNProgram.close();fixture.id="unverified-account-b";fixture.ok=false;fixture.reads=[];fixture.writes=[]')
            page.locator('#funProgramLaunch').click()
            page.wait_for_function('document.querySelector("#funProgramHoldText")?.textContent.includes("No game was opened")')
            observed['denied_account_b'] = snapshot(page)
            observed['denied_account_b']['hold'] = page.locator('#funProgramHold').inner_text()
            assert not page.locator('#funFrame').count()
            assert page.locator('#funSaveFile').is_disabled() and page.locator('#funLoadFile').is_disabled()
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

    def cleared_storage_receipt():
        context, page, errors, requests = setup()
        observed = {}
        try:
            frame = open_player(page)
            expected = voyage_fixture(frame)
            import_voyage(page, frame, expected, 'receipt-clear-source')
            wait_device_state(page, expected)
            key, raw, record = one_device_record(page)
            badge(page, 'saved', 'SAVED ON THIS DEVICE')
            observed['before_other_tab_clear'] = snapshot(page, frame)
            page.evaluate('window.__qaStorageEvents=[];window.addEventListener("storage",event=>__qaStorageEvents.push({key:event.key,oldValue:event.oldValue,newValue:event.newValue}))')
            other = context.new_page()
            other.set_default_timeout(30000)
            other.on('pageerror', lambda error: errors.append(str(error)))
            other.goto(ORIGIN + '/fleet/index.html')
            other.evaluate('localStorage.clear()')
            # Wait for the native clear event itself, not for the expected product
            # reaction, so an unfixed badge fails an assertion without a timeout.
            page.wait_for_function('__qaStorageEvents.some(event=>event.key===null)')
            observed['storage_events'] = page.evaluate('__qaStorageEvents')
            observed['after_other_tab_clear'] = snapshot(page, frame)
            assert page.evaluate('key=>localStorage.getItem(key)', key) is None
            badge(page, 'conflict', 'AUTOSAVE PAUSED')
            assert save_state(frame) == expected, 'Clearing device storage discarded the active in-memory voyage'
            assert 'another tab' in page.locator('#funProgramStatus').inner_text().lower()
            assert not errors, errors
        finally:
            (out / 'cleared-storage-receipt-observations.json').write_text(json.dumps(observed, indent=2))
            context.close()

    case('receipt is withdrawn when another tab clears device storage with a null-key event', cleared_storage_receipt)

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

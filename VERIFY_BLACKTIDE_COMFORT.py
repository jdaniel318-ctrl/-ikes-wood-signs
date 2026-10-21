"""Blacktide interaction regressions against the compiled opaque player.
Synthetic parent and clock; no accounts, business records or network requests.
Set BLACKFLAG_CHROMIUM and PYTHONPATH for a locally installed Playwright runtime.
"""
from pathlib import Path
import json, os, sys, traceback
from playwright.sync_api import sync_playwright

r=Path(sys.argv[1] if len(sys.argv)>1 else Path(__file__).parent)
out=Path(sys.argv[2] if len(sys.argv)>2 else r.parent/'qa/comfort')
out.mkdir(parents=True,exist_ok=True)
results=[]
base={'schema':'fun-stormwake-v2','legacy':{'schema':'fun-solo-v1','stage':0,'history':[],'help':0,'mistakes':0,'completed':False,'lessons':[],'pennant':'gold'},'mission':{'briefed':False,'parts':[],'weight':1,'bridgeOpen':False,'passenger':False,'complete':False,'chart':False,'checkpoint':'arrival'},'prefs':{'sound':False,'reducedMotion':False,'quality':'balanced'}}

with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=os.environ.get('BLACKFLAG_CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    def setup(state=None):
        p=browser.new_page(viewport={'width':1024,'height':700});p.set_default_timeout(12000)
        errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.route('**/*',lambda route:route.abort())
        p.set_content('<style>html,body{margin:0;width:100%;height:100%}iframe{width:100%;height:100%;border:0}</style>')
        clock='<script>window.__qaClock=0;window.__qaQueue=[];window.requestAnimationFrame=cb=>{__qaQueue.push(cb);return 1};window.cancelAnimationFrame=()=>{};window.__qaStep=n=>{for(let i=0;i<n;i++){let a=__qaQueue.splice(0);__qaClock+=50;a.forEach(cb=>cb(__qaClock));}}</script>'
        html=(r/'stormwake_player.html').read_text().replace('<body>','<body>'+clock,1)
        p.evaluate("html=>{const f=document.createElement('iframe');f.id='game';f.setAttribute('sandbox','allow-scripts');f.srcdoc=html;document.body.appendChild(f);}",html)
        f=p.locator('#game').element_handle().content_frame();f.wait_for_selector('#swLocked')
        p.evaluate("state=>document.querySelector('#game').contentWindow.postMessage({type:'start',channel:'comfort-test',state},'*')",state or base)
        f.wait_for_selector('#swStart');f.locator('#swStart').dispatch_event('click');f.evaluate('__qaStep(3)')
        return p,f,errors
    def case(name,fn):
        if os.environ.get('BLACKTIDE_CASE') and os.environ['BLACKTIDE_CASE'] not in name:return
        try:fn();results.append({'name':name,'pass':True});print('PASS',name,flush=True)
        except Exception as e:results.append({'name':name,'pass':False,'error':str(e)});print('FAIL',name,str(e)[:300],flush=True);traceback.print_exc()

    def resize():
        p,f,errors=setup()
        try:
            before=f.evaluate('StormwakeSnapshot().mission')
            f.evaluate("dispatchEvent(new KeyboardEvent('keydown',{key:'w'}));__qaStep(3);dispatchEvent(new Event('resize'));__qaStep(4)")
            assert f.evaluate('StormwakeSnapshot().modal')=='', 'A harmless resize interrupts play'
            stop=f.evaluate('StormwakeSnapshot().player.z');f.evaluate('__qaStep(6)')
            assert abs(f.evaluate('StormwakeSnapshot().player.z')-stop)<.01,'Resize left movement held'
            assert f.evaluate('StormwakeSnapshot().mission')==before
            assert not errors,errors
        finally:p.close()
    case('resize preserves play and clears held input',resize)

    def background_choice():
        p,f,errors=setup()
        try:
            f.evaluate("dispatchEvent(new KeyboardEvent('keydown',{key:'w'}));__qaStep(21);dispatchEvent(new KeyboardEvent('keyup',{key:'w'}));__qaStep(1)")
            f.locator('#swInteract').dispatch_event('click');assert f.evaluate('StormwakeSnapshot().modal')=='talk'
            p.evaluate("document.querySelector('#game').contentWindow.postMessage({type:'pause',reason:'background',channel:'comfort-test'},'*')")
            p.wait_for_timeout(100)
            assert f.evaluate('StormwakeSnapshot().modal')=='talk','Background pause replaced an unfinished mission choice'
            assert f.locator('#swAcceptMission').is_visible()
            assert not f.evaluate('StormwakeSnapshot().mission.briefed')
            assert not errors,errors
        finally:p.close()
    case('backgrounding preserves unfinished dialogue',background_choice)

    def background_play():
        p,f,errors=setup()
        try:
            f.evaluate("dispatchEvent(new KeyboardEvent('keydown',{key:'w'}));__qaStep(4)")
            p.evaluate("document.querySelector('#game').contentWindow.postMessage({type:'pause',reason:'background',channel:'comfort-test'},'*')")
            f.wait_for_selector('#swResume');stop=f.evaluate('StormwakeSnapshot().player.z');f.evaluate('__qaStep(10)')
            assert f.evaluate('StormwakeSnapshot().player.z')==stop
            assert 'background' in f.locator('#swModal').inner_text().lower(), 'Pause reason is not explained'
            f.locator('#swResume').dispatch_event('click');f.evaluate('__qaStep(4)')
            assert f.evaluate('StormwakeSnapshot().modal')==''
            assert f.evaluate('StormwakeSnapshot().player.z')==stop
            assert not errors,errors
        finally:p.close()
    case('background play pauses explicitly without stuck movement',background_play)

    def gear_first():
        state=json.loads(json.dumps(base));state['mission'].update(briefed=True,checkpoint='pier')
        p,f,errors=setup(state)
        try:
            f.locator('#swInteract').dispatch_event('click')
            assert f.evaluate('StormwakeSnapshot().mission.parts')==['gear']
            text=f.locator('#swToast').inner_text()
            assert 'All three' not in text,'One recovered gear is falsely announced as all three parts'
            assert 'gear' in text.lower()
            assert not errors,errors
        finally:p.close()
    case('collecting the gear first reports only that item',gear_first)
    browser.close()

(out/'results.json').write_text(json.dumps(results,indent=2))
print(json.dumps({'passed':sum(x['pass'] for x in results),'failed':sum(not x['pass'] for x in results)}))
sys.exit(any(not x['pass'] for x in results))

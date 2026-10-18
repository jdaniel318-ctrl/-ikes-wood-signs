"""Actual new static brief markup; isolated Chromium, no network. Historical brief checked separately."""
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import sys,shutil,json,base64
root=Path(sys.argv[1]).resolve();out=Path(sys.argv[2]).resolve();out.mkdir(parents=True,exist_ok=True);results=[]
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox'])
    for width,height in [(390,844),(768,1024),(1024,768),(1366,1024)]:
        ctx=browser.new_context(viewport={'width':width,'height':height});p=ctx.new_page();p.set_default_timeout(4000);p.route('**/*',lambda r:r.abort());errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
        try:
            s=(root/'keelmark-brief.html').read_text().replace('src="black_flag_platform_icon.png"','src="data:image/png;base64,'+base64.b64encode((root/'black_flag_platform_icon.png').read_bytes()).decode()+'"')
            p.set_content(s)
            assert p.locator('h1').first.inner_text()=='Keelmark.'
            assert p.locator('script,form,input,button').count()==0
            assert 'Iron Square remains an unapproved alternative' in p.locator('body').inner_text()
            for name in ['repair','ship','gates','tools']:assert p.locator('#'+name).count()==1
            assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'collapsed page overflow'
            p.screenshot(path=str(out/f'keelmark-{width}.png'),full_page=True)
            p.locator('#full-plan summary').click()
            assert p.locator('#full-plan').get_attribute('open') is not None
            assert p.locator('.full-plan').is_visible()
            assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'expanded page overflow'
            for a in p.locator('a').all():
                href=a.get_attribute('href')
                if href and not href.startswith('#'):assert (root/href).is_file(),href
            assert not errors,errors
            results.append({'name':f'Keelmark brief {width}px native-details expansion, anchors, identity and no overflow','pass':True})
        except Exception as exc:results.append({'name':f'Keelmark brief {width}px','pass':False,'error':str(exc)})
        finally:ctx.close()
    browser.close()
a=BeautifulSoup((root/'index.html').read_text(),'html.parser').find(id='keelmarkPlanLink')
results.append({'name':'Engine current plan anchor links HouseHull with noopener','pass':bool(a and a.get('href')=='keelmark-brief.html' and 'noopener' in a.get('rel',[]) and 'HouseHull' in a.get_text())})
(out/'results.json').write_text(json.dumps(results,indent=2)+'\n');print(json.dumps(results,indent=2));sys.exit(0 if all(x['pass'] for x in results) else 1)

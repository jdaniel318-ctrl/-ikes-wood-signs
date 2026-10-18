"""Offline static-plan browser checks; no real accounts or record writes.
python VERIFY_CHARTWRIGHT_UI.py RELEASE_DIR RESULTS_DIR
"""
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import sys,shutil,json,base64
root=Path(sys.argv[1]).resolve();out=Path(sys.argv[2]).resolve();out.mkdir(parents=True,exist_ok=True)
results=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 for width,height in [(390,844),(1024,768),(1366,1024)]:
  ctx=browser.new_context(viewport={'width':width,'height':height});p=ctx.new_page();p.set_default_timeout(5000);p.route('**/*',lambda route:route.abort());errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  try:
   source=(root/'chartwright-brief.html').read_text().replace('src="black_flag_platform_icon.png"','src="data:image/png;base64,'+base64.b64encode((root/'black_flag_platform_icon.png').read_bytes()).decode()+'"')
   p.set_content(source)
   assert p.locator('h1').first.inner_text()=='Chartwright.'
   assert p.locator('script, form, input, button').count()==0
   assert p.evaluate('document.documentElement.scrollWidth <= innerWidth+1'), 'closed brief overflows'
   p.screenshot(path=str(out/f'brief-{width}.png'),full_page=True)
   p.locator('#full-plan summary').click()
   assert p.locator('#full-plan').get_attribute('open') is not None
   assert p.locator('.full-plan').is_visible()
   assert p.evaluate('document.documentElement.scrollWidth <= innerWidth+1'), 'expanded plan overflows'
   for id in ['repair','ship','gates','tools']:assert p.locator('#'+id).count()==1
   assert not errors,errors
   results.append({'name':f'planning brief {width}px: labels, anchors, read-only and full plan expansion','pass':True})
  except Exception as e:results.append({'name':f'planning brief {width}px','pass':False,'error':str(e)})
  finally:ctx.close()
 browser.close()
a=BeautifulSoup((root/'index.html').read_text(),'html.parser').find(id='chartwrightPlanLink')
results.append({'name':'actual Engine anchor opens separate static brief with noopener','pass':bool(a and a.get('href')=='chartwright-brief.html' and a.get('target')=='_blank' and 'noopener' in a.get('rel',[]))})
(out/'results.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps({'passed':sum(x['pass'] for x in results),'total':len(results),'results':results},indent=2));sys.exit(0 if all(x['pass'] for x in results) else 1)

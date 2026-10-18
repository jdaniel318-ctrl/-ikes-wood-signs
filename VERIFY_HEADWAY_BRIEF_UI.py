"""Static public-safe Headway brief in isolated Chromium, no network or accounts."""
from pathlib import Path
import sys,json,shutil
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True);results=[]
with sync_playwright() as w:
 b=w.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 for width,height in [(390,844),(1024,768),(1366,900)]:
  p=b.new_page(viewport={'width':width,'height':height});p.route('**/*',lambda r:r.abort())
  try:
   p.set_content((root/'headway-brief.html').read_text());assert p.locator('h1').is_visible();assert p.locator('script,form').count()==0;assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1');assert 'HouseHull remains HouseHull' in p.locator('body').inner_text()
   for href in p.locator('a').evaluate_all('(es)=>es.map(e=>e.getAttribute("href"))'):assert (root/href).is_file(),href
   p.screenshot(path=str(out/f'brief-{width}.png'),full_page=True);results.append({'width':width,'pass':True})
  except Exception as e:results.append({'width':width,'pass':False,'error':str(e)})
  finally:p.close()
 b.close()
(out/'results.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2));sys.exit(0 if all(x['pass'] for x in results) else 1)

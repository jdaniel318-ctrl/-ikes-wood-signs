"""Shipped static Fleet Compass card and CSS; no Auth or live backend integration."""
import argparse,json,re
from pathlib import Path
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
p=argparse.ArgumentParser();p.add_argument('root',type=Path);p.add_argument('--out',type=Path,required=True);a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
s=(a.root/'index.html').read_text();dom=BeautifulSoup(s,'html.parser');card=dom.select_one('#wonderwakePreviewVessel');assert card is not None
checks=[];errors=[];requests=[]
def check(n,v):
 checks.append({'name':n,'pass':bool(v)});print('PASS' if v else 'FAIL',n);assert v,n
check('card is inside existing gated Engine panel',card.find_parent(id='enginePanel') is not None and 'hidden' in dom.select_one('#enginePanel')['class'])
check('not inserted into canonical roster element',card.find_parent(id='fleetCommissioningFleet') is None)
check('existing roster placeholder is retained',len(dom.select('#fleetCommissioningFleet'))==1)
check('existing Fleet Learning Registry is retained',len(dom.select('#fleetLearningRegistry'))==1)
style=dom.select_one('#homeportShipStyle').string
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1366,'height':1024});page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda q:requests.append(q.url))
 page.set_content('<main style="max-width:1240px;margin:36px auto;padding:18px"><h1 style="font:700 25px system-ui;color:#e7ddbd">FLEET COMPASS</h1><p style="color:#b9cacc;font:15px system-ui">Commissioned Admiral Program · dated receipt</p>'+str(card)+'</main>')
 page.add_style_tag(content='body{background:#061a22;font-family:system-ui;margin:0}*{box-sizing:border-box}'+style)
 link=page.locator('#openWonderwakeShip');check('exact standalone ship URL',link.get_attribute('href')=='https://jdaniel318-ctrl.github.io/wonderwake/')
 check('explicit new tab without opener',link.get_attribute('target')=='_blank' and link.get_attribute('rel')=='noopener noreferrer')
 check('no referrer transfer',link.get_attribute('referrerpolicy')=='no-referrer')
 check('no mutation control exists in new entry',page.locator('#wonderwakePreviewVessel button').count()==0)
 check('no hidden project authority ID',page.locator('#wonderwakePreviewVessel [data-project-id]').count()==0)
 check('commissioning date stays visible without expanding details','Commissioned · 31 Oct 2026' in page.locator('.homeport-status').inner_text())
 check('details start folded',not page.locator('.homeport-boundary').evaluate('e=>e.open'))
 page.locator('summary').click();check('native disclosure works through shipped markup',page.locator('.homeport-boundary').evaluate('e=>e.open'))
 check('shared-origin boundary is disclosed','not browser-level isolation' in page.locator('.homeport-boundary').inner_text())
 check('review-only sharing is disclosed','reviewed and adopted deliberately' in page.locator('.homeport-boundary').inner_text())
 page.screenshot(path=str(a.out/'homeport-fleet-entry-ipad.png'),full_page=True)
 page.set_viewport_size({'width':390,'height':844});check('phone layout has no horizontal overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
 page.screenshot(path=str(a.out/'homeport-fleet-entry-phone.png'),full_page=True)
 check('no scripts or network coupled to the ship',not requests and not errors)
 (a.out/'results.json').write_text(json.dumps({'scope':'Actual new HTML/CSS and native link/disclosure semantics only; no Engine Auth or live navigation proof','checks':checks,'errors':errors,'requests':requests},indent=2));b.close()

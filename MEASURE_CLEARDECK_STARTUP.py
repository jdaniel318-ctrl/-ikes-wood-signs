#!/usr/bin/env python3
"""Inventory source dependencies and optionally measure cold/warm public entrypoints.
Usage: python MEASURE_CLEARDECK_STARTUP.py RELEASE --out /outside/release/measure.json
Add --browser to measure entrypoints with a fresh local HTTP server and Chromium.
Never attaches to a user's existing browser, imports credentials, or mutates live data.
"""
import argparse,json,re,os,shutil,threading,time,mimetypes
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer

def inventory(root):
 s=(root/'index.html').read_text()
 arrays={name:json.loads(re.search(r'const '+name+r'=([^;]+)',s).group(1).replace("'",'"')) for name in ['snapshotPaths','presencePaths']}
 paths=list(dict.fromkeys(arrays['snapshotPaths']+arrays['presencePaths']))
 files=[{'path':x,'bytes':(root/x).stat().st_size} for x in paths]
 return {'build':json.loads((root/'DEPLOYMENT_MANIFEST.json').read_text())['build'],'scope':'source sizes; NOT compressed transfer bytes or browser latency','required_body_count':len(files),'required_body_bytes':sum(x['bytes'] for x in files),'files':files,'route_inventory':{'engine':'index.html — verified shell; Admiral authentication excluded','captain':'owner.html?surface=vessel-captain — signed-out shell','designer':'carvewright.html — entrypoint; authoring authority excluded','scheduling':'inside Engine/Admiral; authenticated interactive timing pending','documents':'Quartermaster inside authenticated workspace; export timing pending'},'browser_runs':[]}

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('root',nargs='?',type=Path,default=Path(__file__).parent);p.add_argument('--out',required=True,type=Path);p.add_argument('--browser',action='store_true');p.add_argument('--runs',type=int,default=3);p.add_argument('--executable',default=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'));a=p.parse_args();root=a.root.resolve();out=a.out.resolve()
 if out.is_relative_to(root):p.error('Evidence output must be outside the release directory so inventory remains stable.')
 if not 1<=a.runs<=10:p.error('--runs must be 1–10.')
 report=inventory(root);report['conditions']={'network':'local loopback HTTP; no throttling; outside hosts blocked','cache':'cold = new context; warm = same-context reload; application no-store policy retained','run_count_requested':a.runs,'authentication':'none; no live credentials','physical_device':'not measured; viewport emulation is not native Safari'}
 if a.browser:
  from playwright.sync_api import sync_playwright
  class Quiet(SimpleHTTPRequestHandler):
   def log_message(self,*args):pass
  server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root)));threading.Thread(target=server.serve_forever,daemon=True).start();origin=f'http://127.0.0.1:{server.server_port}'
  try:
   with sync_playwright() as pw:
    b=pw.chromium.launch(executable_path=a.executable,headless=True,args=['--no-sandbox']);report['conditions']['browser']='Chromium '+b.version
    for route in ['index.html','owner.html?surface=vessel-captain','carvewright.html']:
     for i in range(a.runs):
      c=b.new_context(viewport={'width':1366,'height':1024});c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin+'/') else r.abort());page=c.new_page()
      for cache in ['cold','warm']:
       entry={'route':route,'run':i+1,'cache':cache}
       try:
        start=time.perf_counter()
        if cache=='cold':page.goto(origin+'/'+route,wait_until='load',timeout=20000)
        else:page.reload(wait_until='load',timeout=20000)
        page.wait_for_timeout(500)
        entry.update(observation_elapsed_ms=round((time.perf_counter()-start)*1000,2),navigation=page.evaluate("(()=>{const n=performance.getEntriesByType('navigation')[0];return n?{domContentLoadedMs:n.domContentLoadedEventEnd,loadEventMs:n.loadEventEnd}:null})()"),gate_state=page.evaluate("window.__darkSkyReleaseGateState||null"),status='ENTRYPOINT_MEASURED_NOT_WORKFLOW_CERTIFICATION')
       except Exception as e:entry.update(status='NOT_MEASURED',reason=str(e).splitlines()[0][:250])
       report['browser_runs'].append(entry)
      c.close()
    b.close()
  finally:server.shutdown();server.server_close()
 else:report['browser_status']='NOT RUN — add --browser in a browser environment permitting local URL navigation'
 out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'required_bodies':report['required_body_count'],'source_bytes':report['required_body_bytes'],'report':str(out),'browser_runs':len(report['browser_runs'])}))
if __name__=='__main__':main()

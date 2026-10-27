#!/usr/bin/env python3
"""Local loopback cold/new-context and same-context reload observations, not native Safari timings.
No credentials or production traffic. Incomplete boot is NOT_MEASURED.
Requires Python Playwright==1.57.0 with Chromium.
"""
import argparse, json, threading, time, shutil, re
from pathlib import Path
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from functools import partial
from playwright.sync_api import sync_playwright
def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument("root",type=Path);p.add_argument("--out",type=Path,required=True);p.add_argument("--runs",type=int,default=3);p.add_argument("--executable",default=shutil.which("chromium"))
    a=p.parse_args();root=a.root.resolve();out=a.out.resolve()
    if out.is_relative_to(root) or not 1<=a.runs<=10:p.error("Use an external output and 1–10 runs")
    class Handler(SimpleHTTPRequestHandler):
        def log_message(self,*args):pass
    server=ThreadingHTTPServer(("127.0.0.1",0),partial(Handler,directory=str(root)))
    threading.Thread(target=server.serve_forever,daemon=True).start();origin=f"http://127.0.0.1:{server.server_port}"
    report={"schema":"blackflag-loopback-startup-v1","scope":"Isolated loopback Chromium; not production latency or native Safari","conditions":{"external_hosts":"blocked","authentication":"none","cache":"cold=new context; warm=same-context reload; app cache policy unchanged"},"runs":[]}
    try:
        with sync_playwright() as pw:
            b=pw.chromium.launch(executable_path=a.executable,headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
            report["browser"]="Chromium "+b.version
            for i in range(a.runs):
                c=b.new_context(viewport={"width":1366,"height":1024})
                c.route("**/*",lambda r:r.continue_() if r.request.url.startswith(origin+"/") else r.abort())
                page=c.new_page()
                for cache in ["cold","warm"]:
                    record={"run":i+1,"cache":cache}
                    try:
                        if cache=="cold":page.goto(origin+"/",wait_until="domcontentloaded",timeout=15000)
                        else:page.reload(wait_until="domcontentloaded",timeout=15000)
                        page.wait_for_function("window.__darkSkyReleaseGateState==='clear' || window.__darkSkyReleaseGateState==='hold'",timeout=15000)
                        gate=page.evaluate("window.__darkSkyReleaseGateState")
                        observation=page.evaluate("typeof window.BlackFlagStartupReport==='function'?window.BlackFlagStartupReport():null")
                        record.update(gate=gate,observation=observation,status="MEASURED_LOOPBACK_ONLY" if gate=="clear" and observation and observation["status"]=="complete" else "NOT_MEASURED")
                    except Exception as e:record.update(status="NOT_MEASURED",reason=str(e).splitlines()[0][:240])
                    report["runs"].append(record)
                c.close()
            b.close()
    finally:
        server.shutdown();server.server_close()
    out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,indent=2)+"\n")
    print(json.dumps({"runs":len(report["runs"]),"measured":sum(r["status"]=="MEASURED_LOOPBACK_ONLY" for r in report["runs"]),"out":str(out)}))
if __name__=="__main__":main()

#!/usr/bin/env python3
"""Shipped startup collector and DOM disclosure with synthetic phase events.
Not real loader timing, native Safari or authenticated integration.
Requires Playwright==1.57.0 and Chromium. No live network or credentials.
"""
import argparse,json,re,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument("root",type=Path);p.add_argument("--out",type=Path,required=True);p.add_argument("--executable",default=shutil.which("chromium"))
    a=p.parse_args();root=a.root.resolve();out=a.out.resolve()
    if out.is_relative_to(root):p.error("Evidence must be outside source")
    out.mkdir(parents=True,exist_ok=True)
    text=(root/"index.html").read_text()
    script=re.search(r'<script id="blackFlagStartupMetrics">([\s\S]*?)</script>',text).group(1)
    style=re.search(r'<style id="fairleadStartupStyle">([\s\S]*?)</style>',text).group(1)
    start=text.index('<section id="enginePerformanceDeck"')
    section=text[start:text.index('</section>',start)+len('</section>')]
    checks=[];errors=[];attempted=[]
    def check(name,value):
        checks.append({"name":name,"pass":bool(value)});print("PASS" if value else "FAIL",name,flush=True)
    with sync_playwright() as pw:
        b=pw.chromium.launch(executable_path=a.executable,headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
        c=b.new_context(viewport={"width":1366,"height":1024},accept_downloads=True)
        c.route("**/*",lambda r:(attempted.append(r.request.url),r.abort())[-1])
        page=c.new_page();page.on("pageerror",lambda e:errors.append(str(e)))
        css="""body{background:#071b23;color:#e6eef0;font:16px system-ui;margin:0;padding:28px}
        main{max-width:1120px;margin:auto}.engine-performance-deck{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
        .engine-performance-card{background:#0d2933;border:1px solid #34555f;border-radius:16px;padding:20px;overflow:hidden}
        .engine-performance-card-head{display:flex;justify-content:space-between}canvas{display:none}
        .engine-performance-card-head span{font-size:12px;display:block}.engine-performance-card-head strong{font-size:24px;display:block}
        button{background:#125e76;border:1px solid #59a1ba;color:white;border-radius:9px;padding:12px 18px;font-weight:700;cursor:pointer}
        h1{font-size:28px}.fixture{background:#ecd18a;color:#12232b;padding:10px;border-radius:8px}
        @media(max-width:600px){body{padding:14px}.engine-performance-deck{grid-template-columns:1fr}}
        """
        page.set_content('<style>'+css+style+'</style><main><p class="fixture">OFFLINE TEST FIXTURE · synthetic phase events, not measured production speed</p><h1>Engineering Systems</h1>'+section+'</main>')
        page.add_script_tag(content="const DARK_SKY_RELEASE={build:'8.8.20.68'};")
        page.add_script_tag(content=script)
        check("starts collapsed",not page.locator("#fairleadStartupEvidence details").get_attribute("open"))
        page.locator("#fairleadStartupEvidence summary").click()
        check("disclosure opens on tap",page.locator("#fairleadDownloadStartup").is_visible())
        page.evaluate("window.__blackFlagStartupPaint()")
        check("unmeasured is explicit","PENDING" in page.locator("#fairleadStartupStatus").inner_text())
        attempted.clear()
        page.evaluate("window.__blackFlagStartupMetrics.begin('loader');window.__blackFlagStartupMetrics.begin('verification')")
        page.wait_for_timeout(15)
        page.evaluate("window.__blackFlagStartupMetrics.end('verification');window.__blackFlagStartupMetrics.begin('execution')")
        page.wait_for_timeout(15)
        page.evaluate("window.__blackFlagStartupMetrics.end('execution');window.__blackFlagStartupMetrics.end('loader');window.__blackFlagStartupMetrics.finish('complete');window.__blackFlagStartupPaint()")
        report=page.evaluate("window.BlackFlagStartupReport()")
        check("synthetic completion rendered","COMPLETED" in page.locator("#fairleadStartupStatus").inner_text())
        check("positive browser timing observed",report["loader_elapsed_ms"]>0)
        check("not a readiness certificate",report["production_readiness"] is False)
        check("missing worker is not invented","Not recorded" in page.locator("#fairleadStartupWorker").inner_text())
        with page.expect_download() as event:page.locator("#fairleadDownloadStartup").click()
        download=event.value;download.save_as(out/"startup-fixture-download.json")
        exported=json.loads((out/"startup-fixture-download.json").read_text())
        check("JSON export contains current build",exported["build"]=="8.8.20.68")
        check("export is allowlisted",set(exported)<=set(["schema","build","scope","status","loader_elapsed_ms","phases","unfinished_phases","dropped_samples","production_readiness","performance_improvement_claim","privacy","navigation"]))
        check("download does not send a request",len(attempted)==0)
        check("download wording is not saved-file certification","does not prove it was saved" in page.locator("#fairleadStartupDownloadStatus").inner_text())
        page.screenshot(path=str(out/"fairlead-startup-ipad.png"),full_page=True)
        page.set_viewport_size({"width":390,"height":844})
        check("phone no horizontal overflow",page.evaluate("document.documentElement.scrollWidth<=innerWidth+1"))
        page.screenshot(path=str(out/"fairlead-startup-phone.png"),full_page=True)
        page.evaluate("window.__blackFlagStartupMetrics.finish('hold');window.__blackFlagStartupPaint()")
        check("hold overrides completion","HOLD" in page.locator("#fairleadStartupStatus").inner_text())
        # Observe layout under the real shipped stylesheet too; all external requests stay blocked.
        page.set_viewport_size({"width":1366,"height":1024})
        page.add_style_tag(content=(root/"styles.css").read_text())
        page.evaluate("document.body.classList.add('engine-mode','engine-systems-expanded');document.querySelector('main').id='enginePanel';window.__blackFlagStartupMetrics.finish('complete');window.__blackFlagStartupPaint()")
        check("disclosure visible with shipped styles",page.locator("#fairleadDownloadStartup").is_visible())
        check("iPad shipped stylesheet no horizontal overflow",page.evaluate("document.documentElement.scrollWidth<=innerWidth+1"))
        check("startup text readable under shipped theme",page.evaluate("""()=>{
          const lum=rgb=>{const q=rgb.map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*q[0]+.7152*q[1]+.0722*q[2]};
          const bg=lum([24,51,61]);
          return ['#fairleadStartupStatus','#fairleadStartupScope','#fairleadStartupEvidence summary','#fairleadStartupEvidence small'].every(s=>{
            const rgb=getComputedStyle(document.querySelector(s)).color.match(/[\\d.]+/g).slice(0,3).map(Number);return (lum(rgb)+.05)/(bg+.05)>=4.5;
          });
        }"""))

        page.screenshot(path=str(out/"fairlead-startup-shipped-css-ipad.png"),full_page=True)
        page.set_viewport_size({"width":390,"height":844})
        check("phone shipped stylesheet no horizontal overflow",page.evaluate("document.documentElement.scrollWidth<=innerWidth+1"))
        page.screenshot(path=str(out/"fairlead-startup-shipped-css-phone.png"),full_page=True)
        check("zero script exceptions",not errors)
        b.close()
    result={"scope":__doc__,"passed":sum(x["pass"] for x in checks),"failed":sum(not x["pass"] for x in checks),"checks":checks,"errors":errors}
    (out/"results.json").write_text(json.dumps(result,indent=2)+"\n")
    return 1 if result["failed"] else 0
if __name__=="__main__":raise SystemExit(main())

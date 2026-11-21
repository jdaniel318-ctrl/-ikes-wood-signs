#!/usr/bin/env python3
"""Exercise the packaged Engine and Wonderwake in local Chromium. Requires playwright and Chromium.
Run: python VERIFY_ENTRY_BROWSER.py /path/to/full-release
"""
import argparse
import asyncio
import hashlib
import json
import mimetypes
import os
from pathlib import Path
import shutil
from urllib.parse import unquote, urlsplit
from playwright.async_api import async_playwright

SITE = 'https://fleet.invalid'
BASE = '/local-fleet/'
FILE = 'wonderwake.ship.json'


async def verify(root):
    manifest = json.loads((root / 'DEPLOYMENT_MANIFEST.json').read_bytes())
    digest = hashlib.sha256((root / FILE).read_bytes()).hexdigest()
    loads = []
    served = set()
    foreign = []
    errors = []
    reply = 'ok'
    held = asyncio.Event()

    async def serve(route):
        url = urlsplit(route.request.url)
        if url.netloc != 'fleet.invalid' or not url.path.startswith(BASE):
            foreign.append(url.netloc + url.path)
            return await route.abort()
        name = unquote(url.path[len(BASE):]) or 'index.html'
        file = (root / name).resolve()
        if root not in file.parents or not file.is_file():
            return await route.fulfill(status=404)
        served.add(name)
        if name == FILE:
            loads.append(url.query)
            assert url.query == 'sha256=' + digest
            if reply == 'slow':
                await held.wait()
            elif reply == 'corrupt':
                return await route.fulfill(content_type='application/json', body=b'"<!doctype html>tamper"')
            elif reply == 'missing':
                return await route.fulfill(status=404)
        if name == 'wonderwake_content.js' and reply == 'missing-script':
            return await route.fulfill(status=404)
        return await route.fulfill(content_type=mimetypes.guess_type(file.name)[0] or 'application/octet-stream', body=file.read_bytes())

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'), args=['--no-sandbox'])
        try:
            ctx = await browser.new_context(viewport={'width':1100,'height':820}, service_workers='block')
            await ctx.route('**/*', serve)
            await ctx.add_init_script(f"""if (window.top === window) {{
              delete Navigator.prototype.serviceWorker;
              sessionStorage.setItem('darkSkyAutoProving:' + {json.dumps(manifest['build'])},'done');
            }}""")
            page = await ctx.new_page()
            page.set_default_timeout(12000)
            page.on('pageerror', lambda err: errors.append((reply, str(err))))
            await page.goto(SITE + BASE)
            await page.wait_for_function("window.__darkSkyReleaseGateState === 'clear'")
            # Service-worker installation is outside this offline browser test.
            await page.locator('#blackFlagEntryPin').press_sequentially('5615')
            await page.locator('#blackFlagEntryUnlock').click()
            launch = page.locator('#launchWonderwakeFromEngine')
            await launch.wait_for(state='visible')
            # Visit ordinary Engine routes before opening a lesson.
            await page.locator('#clearDeckSystemsToggle').click()
            await page.locator('#engineSystemsDirectory').wait_for(state='visible')
            await page.locator('#engineSystemsDirectory [data-clear-deck-command="systems-close"]').click()
            await page.locator('#engineOperateVessels').click()
            await page.locator('#fleetCommissioningDock').wait_for(state='visible')
            await page.locator('[data-clear-deck-command="projects-close"]').click()
            assert loads == [], loads
            assert not any(s.startswith('wonderwake_') or s in ('wonderwake.css','school-state.js') for s in served)
            print('PASS cold Engine PIN, Engineering and Fleet Dock routes request zero lesson cartridge or runtime files', flush=True)

            harbor = page.locator('#lantern-harbor')
            frame = page.frame_locator('#lantern-stage iframe')
            back = page.locator('#lantern-return')
            retry = page.locator('#lantern-retry')

            async def closed(launcher='launchWonderwakeFromEngine'):
                await harbor.wait_for(state='hidden')
                await page.wait_for_function("history.state?.blackFlagProgram !== 'lantern-harbor'")
                assert await page.locator('#lantern-stage iframe').count() == 0
                assert await page.evaluate('document.activeElement.id') == launcher

            async def ready():
                await page.wait_for_function("""() => {
                  const frame = document.querySelector('#lantern-stage iframe');
                  return frame && !frame.hidden && !!frame.contentWindow.WonderwakeApp;
                }""")
                assert await page.locator('#lantern-stage iframe').count() == 1

            # Delayed response: ensure the chrome is usable, second launch is ignored and
            # a response from a closed attempt cannot install a stale lesson.
            reply = 'slow'
            await launch.evaluate('(el) => {el.click(); el.click()}')
            await page.wait_for_function("document.getElementById('lantern-message').textContent.includes('Opening')")
            for _ in range(100):
                if loads:
                    break
                await asyncio.sleep(.01)
            assert len(loads) == 1 and await back.is_visible()
            await back.click()
            await closed()
            held.set()
            reply = 'ok'
            await launch.click()
            await ready()
            assert len(loads) == 2
            assert await page.locator('#lantern-stage iframe').get_attribute('referrerpolicy') == 'no-referrer'
            assert await page.evaluate('document.querySelector("#lantern-stage iframe").contentWindow.origin === window.origin')
            print('PASS duplicate tap, interrupted load, return focus and successful reopen', flush=True)

            await frame.locator('#learner-management summary').click()
            await frame.locator('#learner-nickname').fill('Harbor test')
            await frame.locator('#add-learner-form button[type=submit]').click()
            await page.wait_for_function("""() => document.querySelector('#lantern-stage iframe')?.contentWindow.WonderwakeApp.hasChosenLearner()""")
            chosen = await page.evaluate("document.querySelector('#lantern-stage iframe').contentWindow.WonderwakeApp.getState().id")
            await back.click()
            await closed()
            await page.evaluate("new Promise(done => {window.addEventListener('popstate', () => done(), {once:true}); history.forward()})")
            await ready()
            await frame.locator('[data-action="select-profile"][data-id="' + chosen + '"]').click()
            await page.wait_for_function("document.querySelector('#lantern-stage iframe').contentWindow.WonderwakeApp.hasChosenLearner()")
            assert await page.evaluate("document.querySelector('#lantern-stage iframe').contentWindow.WonderwakeApp.getState().id") == chosen
            print('PASS new local learner saved in native IndexedDB and reopened through browser Forward', flush=True)

            # Delayed and failed local-save checks keep the actual child alive.
            await page.evaluate("""() => {
              const w = document.querySelector('#lantern-stage iframe').contentWindow;
              w.WonderwakeApp.readyToLeave = () => new Promise(resolve => {window.finishSave = resolve});
            }""")
            await page.evaluate("new Promise(done => {window.addEventListener('popstate', () => done(), {once:true}); history.back()})")
            await page.wait_for_function("typeof window.finishSave === 'function'")
            assert await harbor.is_visible()
            await page.evaluate("new Promise(done => {window.addEventListener('popstate', () => done(), {once:true}); history.forward()})")
            await page.wait_for_function("history.state?.blackFlagProgram === 'lantern-harbor'")
            await page.evaluate('window.finishSave(true)')
            assert await harbor.is_visible()
            await page.evaluate("document.querySelector('#lantern-stage iframe').contentWindow.WonderwakeApp.readyToLeave = async () => false")
            page.once('dialog', lambda d: d.dismiss())
            await page.evaluate("new Promise(done => {window.addEventListener('popstate', () => done(), {once:true}); history.back()})")
            await page.wait_for_function("history.state?.blackFlagProgram === 'lantern-harbor'")
            assert await harbor.is_visible()
            page.once('dialog', lambda d: d.accept())
            await back.click()
            await closed()
            print('PASS delayed save, Back/Forward during save and both unsaved-progress choices', flush=True)

            for mode, msg in [('missing','could not load'), ('corrupt','could not verify'), ('missing-script','lesson files')]:
                reply = mode
                await launch.click()
                await retry.wait_for(state='visible')
                assert msg in await page.locator('#lantern-message').inner_text()
                assert await page.locator('#lantern-stage iframe').count() == 0
                reply = 'ok'
                await retry.click()
                await ready()
                await page.keyboard.press('Escape')
                await closed()
            print('PASS HTTP failure, integrity mismatch, missing child script, retry and Escape', flush=True)

            await page.locator('#engineOperateVessels').click()
            dock = page.locator('#openWonderwakeShip')
            await dock.click()
            await ready()
            await frame.locator('[data-action="select-profile"][data-id="' + chosen + '"]').click()
            await frame.locator('nav [data-action="parent"]').click()
            await frame.locator('[data-return-to-fleet]').first.click()
            await closed('openWonderwakeShip')
            await page.locator('[data-clear-deck-command="projects-close"]').click()
            assert not foreign, foreign
            assert not [error for mode, error in errors if mode != 'missing-script'], errors
            print(f'PASS Fleet Dock launcher and in-lesson return; {len(loads)} deliberate cartridge requests, zero off-origin requests', flush=True)
        finally:
            await browser.close()


if __name__ == '__main__':
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('root', type=Path, nargs='?', default=Path(__file__).parent)
    asyncio.run(verify(cli.parse_args().root.resolve()))

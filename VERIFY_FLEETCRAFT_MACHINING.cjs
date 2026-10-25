#!/usr/bin/env node
'use strict';
// Real Chromium, IndexedDB, CAM and native file downloads in an isolated scope.
// No live stores or external requests. Usage: node VERIFY_FLEETCRAFT_MACHINING.cjs [RELEASE] [EVIDENCE_JSON]
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const {createRequire} = require('node:module');
const runtimeRequire = createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || __dirname, 'playwright/package.json'));
const {chromium} = runtimeRequire('playwright');
const ROOT = path.resolve(process.argv[2] || __dirname);
const OUT = path.resolve(process.argv[3] || path.join(ROOT, '../fleetcraft-machining-evidence.json'));
const ORIGIN = 'https://fleetcraft-machining-fixture.invalid';
const scripts = ['carve_fonts.js', 'fleet_design_assets.js', 'carve_core.js', 'carve_store.js', 'carvewright_core.js', 'carvewright_store.js', 'carvewright_clipper.js', 'carvewright_cam.js', 'carvewright_posts.js', 'carvewright_machining.js'];
const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="carvewright_machining.css"></head><body>' + scripts.map(file => '<script src="' + file + '"></script>').join('') + '</body></html>';
const results = [];
let browser;

async function ready(page) {
  await page.waitForFunction(() => document.querySelector('#carvewrightMachining')?.getAttribute('aria-busy') === 'false');
}
async function fixture() {
  const context = await browser.newContext({viewport: {width: 1024, height: 768}, acceptDownloads: true});
  const page = await context.newPage(), errors = [], blocked = [], downloads = [];
  page.setDefaultTimeout(7000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  page.on('download', download => downloads.push(download.suggestedFilename()));
  await context.route('**/*', route => {
    const url = new URL(route.request().url()), name = decodeURIComponent(url.pathname.slice(1));
    if (url.origin !== ORIGIN || (!scripts.includes(name) && !['index.html', 'carvewright_machining.css'].includes(name))) {
      blocked.push(route.request().url());
      return route.abort();
    }
    return route.fulfill({status: 200, contentType: (name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : 'text/html') + ';charset=utf-8', body: name === 'index.html' ? html : fs.readFileSync(path.join(ROOT, name))});
  });
  await page.goto(ORIGIN + '/index.html');
  await page.evaluate(async () => {
    window.__authorized = true;
    window.__scope = {accountId: 'fleetcraft-machining-fixture', backend: 'offline', environment: 'test', site: location.origin, businessId: 'carvewright'};
    window.__store = CarvewrightStore.create({scope: __scope, guard: () => __authorized});
    let draft = CarvewrightCore.createDraft();
    draft.title = 'Ike’s layered machining fixture';
    draft.text.value = 'A';
    draft.text.sizePercent = 35;
    draft = CarvewrightCore.addGraphicLayer(draft, 'star');
    Object.assign(draft.layers[0], {centerXmm: 480, centerYmm: 100, widthMm: 60, heightMm: 60});
    draft = await CarvewrightCore.review(draft, IkeCarveFonts);
    window.__saved = await __store.save(draft, 0);
    CarvewrightMachining.open({draft: __saved, scope: __scope, guard: () => __authorized, parent: document.body});
  });
  await ready(page);
  await page.locator('#cwmCalculate').click();
  await ready(page);
  await page.locator('[data-cwm-tab="export"]').click();
  assert.equal(await page.locator('#cwmSetupConfirmed').isChecked(), false);
  assert.equal(await page.locator('#cwmPrepare').isDisabled(), true, 'Cutting export still requires setup confirmation.');
  await page.locator('#cwmPreparePreview').click();
  await ready(page);
  await page.locator('#cwmProgramFile').waitFor({state: 'visible'});
  return {page, context, errors, blocked, downloads};
}
async function changedRevision(page) {
  await page.evaluate(async () => {
    const changed = JSON.parse(JSON.stringify(__saved));
    changed.title = 'Newer saved revision';
    changed.review = null;
    await __store.save(changed, __saved.revision);
  });
}
async function readDownload(page, selector) {
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator(selector).click()]);
  const filename = download.suggestedFilename(), downloadedPath = await download.path();
  assert.ok(downloadedPath, 'The browser must produce a native downloaded file.');
  return {filename, bytes: fs.readFileSync(downloadedPath), text: fs.readFileSync(downloadedPath, 'utf8')};
}
async function check(name, fn) {
  if (process.env.FLEETCRAFT_MACHINING_CASE && !name.includes(process.env.FLEETCRAFT_MACHINING_CASE)) return;
  let f;
  const result = {name, pass: false};
  try {
    f = await fixture();
    await fn(f, result);
    assert.deepEqual(f.errors, [], 'No uncaught browser errors.');
    assert.deepEqual(f.blocked, [], 'No external or unapproved requests.');
    result.pass = true;
  } catch (error) {
    result.error = error.stack;
  } finally {
    results.push(result);
    if (f) await f.context.close();
    console.log(JSON.stringify({name, pass: result.pass, error: result.error?.split('\n')[0]}));
  }
}
async function main() {
  browser = await chromium.launch({headless: true, executablePath: process.env.CHROMIUM_PATH || '/tmp/carvewright-signcraft-browser/chrome-linux64/chrome', args: ['--no-sandbox', '--disable-dev-shm-usage']});
  try {
    await check('middle-click cannot download a controller program from a stale revision', async ({page, downloads}) => {
      await changedRevision(page);
      await page.locator('#cwmProgramFile').click({button: 'middle'});
      await page.waitForTimeout(350);
      assert.deepEqual(downloads, [], 'Middle-click must not bypass source validation and download a stale controller program.');
      assert.equal(await page.locator('#cwmDownloads [href^="blob:"]').count(), 0, 'No context-menu link may expose prepared files before validation.');
    });
    await check('preview downloads real program, record and v2 artwork without setup confirmation', async ({page}, result) => {
      const program = await readDownload(page, '#cwmProgramFile');
      const recordFile = await readDownload(page, '#cwmRecordFile');
      const sourceFile = await readDownload(page, '#cwmSourceFile');
      const record = JSON.parse(recordFile.text), source = JSON.parse(sourceFile.text);
      assert.match(program.filename, /-r1-PREVIEW-shopbot-inch\.sbp$/);
      assert.match(program.text, /^' PREVIEW - UNVERIFIED SETUP\r\n/);
      assert.equal(record.exportPurpose, 'controller-preview');
      assert.equal(record.setupConfirmation, null);
      assert.equal(record.physicalMachineAcceptance, false);
      assert.equal(record.post.text, program.text);
      assert.equal(record.post.sha256, crypto.createHash('sha256').update(program.bytes).digest('hex'));
      assert.equal(record.post.validation.pass, true);
      assert.equal(record.source.schema, 'carvewright-job-v2');
      assert.equal(record.source.design.schema, 'carvewright-design-v2');
      assert.equal(record.source.design.revision, 1);
      assert.equal(record.source.design.title, 'Ike’s layered machining fixture');
      assert.equal(record.toolpath.source.artworkSchema, 'carvewright-design-v2');
      assert.equal(record.source.graphicAssets[0].id, 'star');
      assert.deepEqual(source, record.source);
      const controls = await page.locator('#cwmDownloads > button').evaluateAll(buttons => buttons.map(button => ({id: button.id, name: button.dataset.filename, small: button.querySelector('small')?.textContent, href: button.getAttribute('href')})));
      assert.equal(controls.length, 3, 'All three native downloads use guarded buttons.');
      for (const control of controls) { assert.ok(control.name); assert.equal(control.small, control.name); assert.equal(control.href, null); }
      result.programBytes = program.bytes.length;
      result.sourceSchema = source.schema;
    });
    await check('regular download rechecks the latest saved revision and revokes prepared files', async ({page, downloads}) => {
      await changedRevision(page);
      await page.locator('#cwmRecordFile').click();
      await page.waitForFunction(() => /saved design has changed/.test(document.querySelector('#cwmStatus')?.textContent || ''));
      await ready(page);
      assert.deepEqual(downloads, []);
      assert.equal(await page.locator('#cwmDownloads').isVisible(), false);
      assert.equal(await page.locator('#cwmDownloads > *').count(), 0);
      assert.equal(await page.locator('#cwmCalculate').isDisabled(), true);
    });
    await check('revoked authorization closes machining before releasing prepared bytes', async ({page, downloads}) => {
      // Trigger during the interval before the periodic authorization watcher.
      await page.locator('#cwmSourceFile').evaluate(button => { window.__authorized = false; button.click(); });
      await page.waitForFunction(() => !document.querySelector('#carvewrightMachining'));
      assert.deepEqual(downloads, []);
      assert.equal(await page.locator('[href^="blob:"]').count(), 0);
    });
    await check('cutting confirmation is retained and every setup edit invalidates its files', async ({page, downloads}) => {
      await page.locator('#cwmSetupConfirmed').check();
      assert.equal(await page.locator('#cwmPrepare').isEnabled(), true);
      await page.locator('#cwmPrepare').click();
      await ready(page);
      const file = await readDownload(page, '#cwmRecordFile'), record = JSON.parse(file.text);
      assert.equal(record.exportPurpose, 'cutting');
      assert.equal(record.setupConfirmation.sourceFingerprint, record.source.fingerprint);
      assert.match(record.setupConfirmation.setupSha256, /^[a-f0-9]{64}$/);
      assert.ok(record.setupConfirmation.confirmedAt);
      assert.doesNotMatch(record.post.text, /PREVIEW - UNVERIFIED SETUP/);
      const oldButton = await page.locator('#cwmProgramFile').elementHandle();
      await page.locator('[data-cwm-tab="setup"]').click();
      await page.locator('#cwmFeed').fill('750');
      assert.equal(await page.locator('#cwmDownloads > *').count(), 0);
      assert.equal(await page.locator('#cwmSetupConfirmed').isChecked(), false);
      assert.equal(await page.locator('#cwmPrepare').isDisabled(), true);
      assert.equal(await page.locator('#cwmPreparePreview').isDisabled(), true);
      await oldButton.evaluate(button => button.click());
      assert.equal(downloads.length, 1, 'The detached control cannot release a superseded setup.');
    });
  } finally {
    await browser.close();
  }
  const summary = {scope: 'Isolated Chromium with real IndexedDB, CAM and native downloads; no live stores or external requests', passed: results.filter(result => result.pass).length, total: results.length, results};
  fs.mkdirSync(path.dirname(OUT), {recursive: true});
  fs.writeFileSync(OUT, JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify({passed: summary.passed, total: summary.total, evidence: OUT}));
  process.exitCode = summary.passed === summary.total ? 0 : 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });

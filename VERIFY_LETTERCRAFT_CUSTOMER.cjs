#!/usr/bin/env node
'use strict';
// Actual sealed Ike storefront -> typed customer wording -> native request ZIP.
// The local PIN invitation, contacts and photographs are synthetic fixtures only.
// Runtime assets are served unchanged; every external request is blocked.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const {createRequire} = require('node:module');
const {chromium} = createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || __dirname, 'playwright/package.json'))('playwright');
const ROOT = path.resolve(process.argv[2] || __dirname);
const OUT = path.resolve(process.argv[3] || path.join(ROOT, '../lettercraft-customer-evidence'));
const ORIGIN = 'https://lettercraft-customer.invalid';
const files = Object.fromEntries(fs.readdirSync(ROOT).filter(name => fs.statSync(path.join(ROOT, name)).isFile()).map(name => [name, fs.readFileSync(path.join(ROOT, name))]));
const deployment = JSON.parse(files['DEPLOYMENT_MANIFEST.json']);
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const trials = [
  {id: 'customer-01', wording: 'Wild  Current 27', font: 'monoton', label: 'Retroline', name: 'Avery Synthetic', email: 'avery@example.invalid', phone: '555-0101', finish: 'Synthetic natural finish', widthIn: 18, heightIn: 6, thicknessIn: .75},
  {id: 'customer-02', wording: 'Moss & Moon', font: 'berkshire-swash', label: 'Orchard Swash', name: 'Morgan Synthetic', email: 'morgan@example.invalid', phone: '555-0102', finish: 'Synthetic dark finish', widthIn: 20, heightIn: 7, thicknessIn: .625}
];
const expectedFiles = ['README.txt', 'artwork.dxf', 'artwork.svg', 'editable-design.json', 'manifest.json', 'photos/reference-01.jpg', 'preview.png', 'request-brief.html', 'request-brief.txt', 'request.json'];
const results = [], downloads = [], errors = [], blocked = [], served = new Set();
let browser, context, page;
fs.mkdirSync(OUT, {recursive: true});

function invitation() {
  const inviteId = 'lettercraft-customer-local-fixture', pin = '820640';
  const payload = {v: 2, inviteId, project: {id: 'ikes-wood-signs', name: 'Ike’s Wood Signs', type: 'wood-sign', projectTheme: 'ikes', publish: {status: 'test'}, products: [], services: [], offers: []}, assets: {}, pinHash: sha256(inviteId + ':' + pin), createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString(), revision: 'isolated-own-word-fixture', build: deployment.build};
  return {pin, hash: '#client-preview=' + Buffer.from(JSON.stringify(payload)).toString('base64url')};
}

async function ready(id = 'ikeShop') {
  await page.waitForFunction(id => document.getElementById(id)?.getAttribute('aria-busy') === 'false', id);
}

async function confirmPreviewGuards() {
  assert.equal(await page.evaluate(() => __deploymentCustomerContext.clientPreview), true);
  assert.equal(await page.locator('#ishSend').isDisabled(), true, 'Private Preview must never permit sending.');
  assert.match(await page.locator('#ishDelivery').innerText(), /Private Preview.*cannot send email/i);
  const names = await page.evaluate(async () => (await indexedDB.databases()).map(item => item.name));
  assert.ok(!names.includes('blackflag-ike-sign-requests-v1') && !names.includes('blackflag-carvewright-v1'), 'Preview must not open the persistent request or private design stores.');
}

async function uploadSyntheticPhoto(trial, index) {
  const base64 = await page.evaluate(index => {
    const canvas = document.createElement('canvas'); canvas.width = 800; canvas.height = 300;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = index ? '#d7b486' : '#bc8a50'; ctx.fillRect(0, 0, 800, 300);
    ctx.fillStyle = '#76552f'; ctx.fillRect(20, 70 + index * 18, 740, 3); ctx.fillRect(35, 230, 720, 4);
    return canvas.toDataURL('image/png').split(',')[1];
  }, index);
  await page.locator('#ishPhotoInput').setInputFiles({name: trial.id + '-synthetic-reference.png', mimeType: 'image/png', buffer: Buffer.from(base64, 'base64')});
  await ready();
  assert.equal(await page.locator('#ishPhotoList img').count(), 1);
}

function inspectDownloadedZip(filename, extractDirectory) {
  // Independent zipfile CRC/extraction, XML parsing and primitive DXF readback.
  const python = String.raw`
import hashlib, json, pathlib, struct, sys, zipfile, xml.etree.ElementTree as ET
from html.parser import HTMLParser
archive, destination = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
expected = ['README.txt','artwork.dxf','artwork.svg','editable-design.json','manifest.json','photos/reference-01.jpg','preview.png','request-brief.html','request-brief.txt','request.json']
with zipfile.ZipFile(archive) as z:
    names = z.namelist()
    assert len(names) == len(set(names)) and sorted(names) == expected
    assert z.testzip() is None, 'ZIP CRC mismatch'
    z.extractall(destination)
data = {name: (destination/name).read_bytes() for name in names}
info = {name: {'bytes': len(value), 'sha256': hashlib.sha256(value).hexdigest()} for name, value in data.items()}
manifest = json.loads(data['manifest.json'])
assert sorted(item['name'] for item in manifest['files']) == sorted(set(names)-{'manifest.json'})
for item in manifest['files']:
    assert info[item['name']]['bytes'] == item['bytes']
    assert info[item['name']]['sha256'] == item['sha256']
packet = json.loads(data['editable-design.json'])
request = json.loads(data['request.json'])
svg = ET.fromstring(data['artwork.svg'])
ns = {'s': 'http://www.w3.org/2000/svg'}
assert len(svg.findall('.//s:path', ns)) > 0 and not svg.findall('.//s:text', ns)
lines = data['artwork.dxf'].decode('ascii').splitlines()
assert len(lines) % 2 == 0
pairs = [(int(lines[i]), lines[i+1].strip()) for i in range(0, len(lines), 2)]
units = next(int(pairs[i+1][1]) for i, pair in enumerate(pairs) if pair == (9, '$INSUNITS'))
closed = 0
for i, pair in enumerate(pairs):
    if pair == (0, 'LWPOLYLINE'):
        end = next(j for j in range(i+1, len(pairs)) if pairs[j][0] == 0)
        entity = pairs[i+1:end]
        assert next(int(value) for code, value in entity if code == 70) & 1
        points = next(int(value) for code, value in entity if code == 90)
        assert points >= 3 and points == sum(code == 10 for code, value in entity) == sum(code == 20 for code, value in entity)
        closed += 1
assert closed > 0 and units == 4
assert data['preview.png'].startswith(b'\x89PNG\r\n\x1a\n')
assert data['photos/reference-01.jpg'].startswith(b'\xff\xd8\xff')
class Text(HTMLParser):
    def __init__(self): super().__init__(); self.parts = []
    def handle_data(self, value): self.parts.append(value)
html = Text(); html.feed(data['request-brief.html'].decode('utf8'))
print(json.dumps({'files': info, 'packet': {'design': packet['design'], 'productionReady': packet['productionReady'], 'toolpathsIncluded': packet['toolpathsIncluded'], 'geometryCount': len(packet['geometry'])}, 'request': request, 'manifest': manifest, 'svg': {'width': svg.get('width'), 'height': svg.get('height'), 'viewBox': svg.get('viewBox')}, 'dxf': {'unitsCode': units, 'closedPolylines': closed}, 'previewSize': struct.unpack('>II', data['preview.png'][16:24]), 'briefText': data['request-brief.txt'].decode('utf8'), 'briefHtmlText': ''.join(html.parts)}))
`;
  const readback = spawnSync(process.env.CODEX_PRIMARY_RUNTIME_PYTHON || 'python3', ['-c', python, filename, extractDirectory], {encoding: 'utf8', maxBuffer: 8 * 1024 * 1024});
  assert.equal(readback.status, 0, readback.stderr || readback.error?.message);
  return JSON.parse(readback.stdout);
}

async function customerRequest(trial, index) {
  const row = {name: index ? 'New request clears the first customer and exports fresh Orchard Swash wording' : 'Ike storefront exports customer-typed Retroline wording', pass: false};
  results.push(row);
  if (!index) {
    // Exercise the real storefront resize handler, including its project scope.
    await page.setViewportSize({width: 1000, height: 768});
    await page.waitForFunction(() => innerWidth === 1000);
    await page.setViewportSize({width: 1024, height: 768});
    await page.waitForFunction(() => innerWidth === 1024);
    row.storefrontResizeExercised = true;
  }
  if (index) {
    await page.locator('#ishNewRequest').click(); await ready();
    for (const id of ['ishName', 'ishEmail', 'ishPhone', 'ishNotes']) assert.equal(await page.locator('#' + id).inputValue(), '', id + ' must clear.');
    assert.equal(await page.locator('#ishQuantity').inputValue(), '1');
    assert.equal(await page.locator('#ishFinish').inputValue(), 'Black');
    assert.equal(await page.locator('#ishPhotoList img').count(), 0);
    assert.equal(await page.locator('#ishApproval').isChecked(), false);
    assert.equal(await page.locator('#ishPackage').isHidden(), true);
    assert.equal(await page.locator('#ishDesignPreview .ish-empty').count(), 1, 'New request must clear the previous artwork.');
    row.previousCustomerCleared = true;
  }
  const requestId = await page.locator('#ikeShop').getAttribute('data-request-id');
  if (index) assert.notEqual(requestId, downloads[0].requestId);
  await page.locator('#ishEditDesign').click(); await ready('carvewrightStudio');
  assert.equal(await page.locator('#cweWording').inputValue(), '', 'Start from a blank design, not a bundled sample.');
  await page.locator('#cweWording').fill(trial.wording);
  await page.locator('#cweFontPicker').click();
  await page.locator('[data-font="' + trial.font + '"]').click();
  assert.equal(await page.locator('#cweCurrentFontName').innerText(), trial.label);
  assert.equal(await page.locator('#cweWording').inputValue(), trial.wording);
  await page.locator('#cweStockTab').click();
  await page.locator('#cweWidth').fill(String(trial.widthIn));
  await page.locator('#cweHeight').fill(String(trial.heightIn));
  await page.locator('#cweThickness').fill(String(trial.thicknessIn));
  await page.locator('#cweStockId').fill(trial.id + '-SYNTHETIC');
  await page.screenshot({path: path.join(OUT, trial.id + '-typed-design.png'), fullPage: true});
  await page.locator('#cweSave').click();
  await page.waitForFunction(() => !document.querySelector('#carvewrightStudio')); await ready();
  await page.locator('#ishName').fill(trial.name);
  await page.locator('#ishEmail').fill(trial.email);
  await page.locator('#ishPhone').fill(trial.phone);
  await page.locator('#ishQuantity').fill('1');
  await page.locator('#ishFinish').fill(trial.finish);
  await page.locator('#ishNotes').fill('Synthetic browser verification fixture only. These are not the user’s board measurements.');
  await uploadSyntheticPhoto(trial, index);
  await page.locator('#ishApproval').check();
  await page.locator('#ishPrepare').click(); await ready();
  assert.equal(await page.locator('#ishPackage').isVisible(), true);
  await confirmPreviewGuards();
  const pending = page.waitForEvent('download');
  await page.locator('#ishDownload').click();
  const download = await pending, zipPath = path.join(OUT, trial.id + '-synthetic-request.zip');
  await download.saveAs(zipPath);
  assert.equal(await download.failure(), null);
  const archiveSha = sha256(fs.readFileSync(zipPath));
  assert.equal(await page.locator('#ishPackageHash').innerText(), 'Archive SHA-256: ' + archiveSha);
  const extracted = inspectDownloadedZip(zipPath, path.join(OUT, trial.id + '-extracted'));
  assert.deepEqual(Object.keys(extracted.files).sort(), expectedFiles);
  const {design} = extracted.packet, request = extracted.request;
  assert.equal(design.text.value, trial.wording, 'Downloaded wording must retain exact case and spaces.');
  assert.equal(design.text.fontId, trial.font);
  assert.equal(request.id, requestId);
  assert.equal(request.design.id, design.id);
  assert.equal(request.details.quantity, 1);
  assert.equal(request.details.finish, trial.finish);
  assert.deepEqual(request.customer, {name: trial.name, email: trial.email, phone: trial.phone});
  assert.equal(request.photos.length, 1);
  assert.equal(request.photos[0].originalName, trial.id + '-synthetic-reference.png');
  assert.equal(request.productionApproved, false);
  assert.equal(request.approval.kind, 'customer-design-approval');
  assert.equal(request.approval.productionApproved, false);
  assert.equal(request.delivery.status, 'not-sent');
  assert.equal(extracted.manifest.productionApproved, false);
  assert.equal(extracted.manifest.requestId, requestId);
  assert.equal(extracted.packet.productionReady, false);
  assert.equal(extracted.packet.toolpathsIncluded, false);
  assert.ok(extracted.packet.geometryCount > 0);
  const dimensions = [trial.widthIn * 25.4, trial.heightIn * 25.4, trial.thicknessIn * 25.4];
  for (const [i, key] of ['widthMm', 'heightMm', 'thicknessMm'].entries()) assert.ok(Math.abs(design.stock[key] - dimensions[i]) < 1e-8);
  assert.ok(extracted.svg.width.endsWith('mm') && extracted.svg.height.endsWith('mm'));
  assert.ok(Math.abs(parseFloat(extracted.svg.width) - dimensions[0]) < 1e-8);
  assert.ok(Math.abs(parseFloat(extracted.svg.height) - dimensions[1]) < 1e-8);
  assert.ok(extracted.briefText.includes(trial.wording) && extracted.briefHtmlText.includes(trial.wording));
  assert.ok(extracted.previewSize.every(value => value > 0));
  if (index) {
    assert.notEqual(design.id, downloads[0].designId, 'Two requests must have independent editable designs.');
    assert.notEqual(request.photos[0].originalSha256, downloads[0].photoSha256);
    assert.ok(!extracted.briefText.includes(trials[0].name) && !extracted.briefText.includes(trials[0].wording));
    assert.equal(sha256(fs.readFileSync(downloads[0].zipPath)), downloads[0].archiveSha, 'The first downloaded job must remain intact.');
    row.independentRequestsAndDesigns = true;
  }
  downloads.push({requestId, designId: design.id, archiveSha, zipPath, photoSha256: request.photos[0].originalSha256});
  await page.screenshot({path: path.join(OUT, trial.id + '-complete-package.png'), fullPage: true});
  assert.deepEqual(errors, [], 'No page exceptions.');
  assert.deepEqual(blocked, [], 'No external traffic attempted.');
  Object.assign(row, {pass: true, wording: trial.wording, font: trial.font, quantity: 1, requestId, designId: design.id, zipFile: path.basename(zipPath), suggestedFilename: download.suggestedFilename(), zipBytes: fs.statSync(zipPath).size, archiveSha256: archiveSha, files: Object.keys(extracted.files).sort(), crcAndManifestVerified: true, dxfClosedPolylines: extracted.dxf.closedPolylines, productionApproved: false, sendDisabled: true, typedThroughStorefront: true});
  console.log(JSON.stringify({name: row.name, pass: true, wording: row.wording, files: row.files.length}));
}

async function main() {
  const executable = process.env.CHROMIUM_PATH || ['/tmp/carvewright-signcraft-browser/chrome-linux64/chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', chromium.executablePath()].find(filename => fs.existsSync(filename));
  browser = await chromium.launch({headless: true, executablePath: executable, args: ['--no-sandbox', '--disable-dev-shm-usage']});
  context = await browser.newContext({viewport: {width: 1024, height: 768}, hasTouch: true, serviceWorkers: 'block', acceptDownloads: true});
  await context.addInitScript(() => { delete Navigator.prototype.serviceWorker; });
  await context.route('**/*', route => {
    const url = new URL(route.request().url()), name = decodeURIComponent(url.pathname).slice(1) || 'index.html';
    if (url.origin === ORIGIN && !name.includes('/') && files[name] && route.request().method() === 'GET') {
      served.add(name);
      const type = name.endsWith('.js') ? 'text/javascript' : name.endsWith('.html') ? 'text/html' : name.endsWith('.css') ? 'text/css' : name.endsWith('.json') ? 'application/json' : 'application/octet-stream';
      return route.fulfill({body: files[name], contentType: type});
    }
    blocked.push({origin: url.origin, path: url.pathname, method: route.request().method()});
    return route.abort();
  });
  page = await context.newPage(); page.setDefaultTimeout(15000);
  page.on('pageerror', error => errors.push(error.stack || String(error)));
  page.on('dialog', dialog => dialog.accept());
  try {
    const invite = invitation();
    await page.goto(ORIGIN + '/index.html' + invite.hash, {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(() => window.__darkSkyReleaseGateState === 'clear');
    await page.locator('#clientPreviewUnlockPin').fill(invite.pin);
    await page.locator('#clientPreviewUnlockBtn').click();
    await page.waitForFunction(() => !document.querySelector('#clientPreviewGate'));
    assert.equal(await page.locator('#ikeShopEntry').isVisible(), true);
    await page.locator('#ikeShopStart').click(); await ready();
    assert.equal(await page.evaluate(() => IkeShop.build), deployment.build);
    for (const [index, trial] of trials.entries()) await customerRequest(trial, index);
  } catch (error) {
    const row = results.find(item => !item.pass) || {name: 'Actual storefront startup', pass: false};
    if (!results.includes(row)) results.push(row);
    row.error = error.stack;
    await page.screenshot({path: path.join(OUT, 'customer-flow-failure.png'), fullPage: true}).catch(() => {});
    console.error(error.stack);
  } finally {
    const report = {schema: 'lettercraft-customer-verification-v1', scope: 'Actual sealed index, real local client-preview PIN gate, storefront/editor controls and native downloads. All names, contacts, photos and dimensions are synthetic verification fixtures. No send action, live inbox, native Safari or machine acceptance is claimed.', build: deployment.build, seal: deployment.release_seal, passed: results.filter(row => row.pass).length, failed: results.filter(row => !row.pass).length, expectedRequests: 2, completedRequests: downloads.length, privatePreview: true, pageErrors: errors, blockedExternalAttempts: blocked, served: [...served].sort(), results};
    fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({passed: report.passed, failed: report.failed, completedRequests: report.completedRequests}));
    if (report.failed || report.completedRequests !== 2) process.exitCode = 1;
    await context.close(); await browser.close();
  }
}
main().catch(async error => {console.error(error.stack); process.exitCode = 1; await browser?.close();});

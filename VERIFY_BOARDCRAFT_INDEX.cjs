#!/usr/bin/env node
'use strict';
// Sealed index -> real private-preview PIN gate -> Ike storefront -> own photo
// -> shared Board frame -> typed wording -> exact frozen proof and native ZIP.
// Runtime bytes are served unchanged. All contacts, photos and dimensions are
// synthetic fixtures. No provider, account, send, share or email draft is used.
// Usage: node VERIFY_BOARDCRAFT_INDEX.cjs [RELEASE] [EVIDENCE_DIRECTORY]
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const {createRequire} = require('node:module');
const {chromium} = createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || __dirname, 'playwright/package.json'))('playwright');
const ROOT = path.resolve(process.argv[2] || __dirname);
const OUT = path.resolve(process.argv[3] || path.join(ROOT, '../boardcraft-index-evidence'));
const ORIGIN = 'https://boardcraft-index.invalid';
const files = Object.fromEntries(fs.readdirSync(ROOT).filter(name => fs.statSync(path.join(ROOT, name)).isFile()).map(name => [name, fs.readFileSync(path.join(ROOT, name))]));
const deployment = JSON.parse(files['DEPLOYMENT_MANIFEST.json']);
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const canonical = value => Array.isArray(value) ? '[' + value.map(canonical).join(',') + ']' : value && typeof value === 'object' ? '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}' : JSON.stringify(value);
const imageBytes = value => {
  assert.match(value, /^data:image\/(?:png|jpeg);base64,/, 'The observed proof/photo must contain its own inert image bytes.');
  return Buffer.from(value.slice(value.indexOf(',') + 1), 'base64');
};
const approx = (actual, expected, label) => assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) < 1e-8, label + ': ' + actual + ' versus ' + expected);
const trial = {id: 'boardcraft-index-01', wording: 'Wild  Current 27', font: 'monoton', label: 'Retroline', name: 'Avery Synthetic', email: 'avery@example.invalid', phone: '555-0101', finish: 'Synthetic natural finish', widthIn: 18, heightIn: 6, thicknessIn: .75};
const fontChoices = [{id: 'monoton', name: 'Retroline'}, {id: 'berkshire-swash', name: 'Orchard Swash'}];
const expectedFiles = ['README.txt', 'artwork.dxf', 'artwork.svg', 'editable-design.json', 'manifest.json', 'photos/reference-01.jpg', 'preview.png', 'request-brief.html', 'request-brief.txt', 'request.json'];
const requiredServed = ['index.html', 'DEPLOYMENT_MANIFEST.json', 'RELEASE_SEAL.json', 'RELEASE_INVENTORY.json', 'carve_fonts.js', 'fleet_design_assets.js', 'carvewright_core.js', 'boardcraft_photo.js', 'carvewright_studio.js', 'ike_shop_core.js', 'ike_shop_store.js', 'ike_shop_delivery.js', 'ike_shop.js'];
const results = [], downloads = [], errors = [], blocked = [], popups = [], served = new Set();
let browser, context, page, requestId, photoFixture, studioScene, returnedScene, expectedProofSha, frozenProofSha, catalog, sealedRuntimeCount = 0, resetVerified = false;
fs.mkdirSync(OUT, {recursive: true});

function invitation() {
  const inviteId = 'boardcraft-index-local-fixture', pin = '820640';
  const payload = {v: 2, inviteId, project: {id: 'ikes-wood-signs', name: 'Ike’s Wood Signs', type: 'wood-sign', projectTheme: 'ikes', publish: {status: 'test'}, products: [], services: [], offers: []}, assets: {}, pinHash: sha256(inviteId + ':' + pin), createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString(), revision: 'isolated-own-photo-fixture', build: deployment.build};
  return {pin, hash: '#client-preview=' + Buffer.from(JSON.stringify(payload)).toString('base64url')};
}

function verifySealedInputs() {
  const seal = JSON.parse(files['RELEASE_SEAL.json']), inventory = JSON.parse(files['RELEASE_INVENTORY.json']);
  assert.equal(seal.build, deployment.build);
  assert.equal(seal.seal, deployment.release_seal);
  assert.equal(inventory.build, deployment.build);
  assert.equal(inventory.seal, deployment.release_seal);
  assert.ok(deployment.required_runtime_files.includes('boardcraft_photo.js'), 'The shared photo renderer must be in the atomic release.');
  assert.ok(inventory.files.includes('boardcraft_photo.js'), 'The release inventory must include the shared photo renderer.');
  assert.ok(deployment.runtime_integrity.files['boardcraft_photo.js'], 'The loader must seal the photo renderer.');
  for (const [name, expected] of Object.entries(deployment.runtime_integrity.files)) {
    assert.ok(files[name], 'Missing sealed runtime file: ' + name);
    assert.equal(sha256(files[name]), expected, 'Sealed runtime hash mismatch: ' + name);
    sealedRuntimeCount++;
  }
  for (const name of requiredServed) assert.ok(files[name], 'Missing actual-loader dependency: ' + name);
}

async function ready(id = 'ikeShop') {
  await page.waitForFunction(id => document.getElementById(id)?.getAttribute('aria-busy') === 'false', id);
}

async function confirmPreviewGuards() {
  assert.equal(await page.evaluate(() => __deploymentCustomerContext.clientPreview), true);
  for (const id of ['ishSend', 'ishShare', 'ishMail']) assert.equal(await page.locator('#' + id).isDisabled(), true, 'Private Preview must disable ' + id + '.');
  assert.match(await page.locator('#ishDelivery').innerText(), /Private Preview.*cannot send email/i);
  const names = await page.evaluate(async () => (await indexedDB.databases()).map(item => item.name));
  for (const name of ['blackflag-ike-sign-requests-v1', 'blackflag-carvewright-v1', 'blackflag-carve-studio-v1']) assert.ok(!names.includes(name), 'Private Preview must not open ' + name + '.');
  const persisted = await page.evaluate(tokens => Object.keys(localStorage).filter(key => tokens.some(token => localStorage.getItem(key)?.includes(token))), [trial.name, trial.email, trial.wording]);
  assert.deepEqual(persisted, [], 'Customer details and wording must not be copied into persistent browser storage.');
  assert.deepEqual(errors, [], 'No uncaught page errors.');
  assert.deepEqual(blocked, [], 'No external traffic may be attempted.');
  assert.deepEqual(popups, [], 'The preview must not open a sharing or email-draft window.');
}

async function screenshot(name) {
  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({path: path.join(OUT, name + '.png'), fullPage: true});
}

async function check(name, fn) {
  const row = {name, pass: false};
  results.push(row);
  try {
    await fn(row);
    row.pass = true;
    console.log(JSON.stringify({name, pass: true}));
  } catch (error) {
    row.error = error.stack || String(error);
    throw error;
  }
}

async function range(id, value) {
  // Exercise the real native control and its normal input listener. No product
  // function, request object, validation gate or rendering API is replaced.
  await page.locator('#' + id).evaluate((node, value) => {
    node.value = String(value);
    node.dispatchEvent(new Event('input', {bubbles: true}));
  }, value);
  approx(Number(await page.locator('#' + id).inputValue()), value, id);
}

async function readScene(svgSelector, artworkSelector) {
  return page.evaluate(({svgSelector, artworkSelector}) => {
    const svg = document.querySelector(svgSelector), photo = svg.querySelector('image'), artwork = svg.querySelector(artworkSelector), frame = svg.querySelector('#cwePhotoFrame');
    const paths = [...artwork.querySelectorAll('path')].map(node => ({d: node.getAttribute('d'), transform: node.getAttribute('transform')}));
    return {viewBox: svg.getAttribute('viewBox'), photo: {href: photo.getAttribute('href'), width: Number(photo.getAttribute('width')), height: Number(photo.getAttribute('height')), transform: photo.getAttribute('transform'), preserveAspectRatio: photo.getAttribute('preserveAspectRatio')}, artwork: {transform: artwork.getAttribute('transform'), fill: artwork.getAttribute('fill'), paths}, frame: frame ? Object.fromEntries(['x', 'y', 'width', 'height'].map(key => [key, Number(frame.getAttribute(key))])) : null};
  }, {svgSelector, artworkSelector});
}

async function uploadOwnPhoto() {
  // Four different corners make an incorrect rotation or replacement background
  // observable. This is a synthetic fixture, not a customer-supplied photograph.
  const base64 = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 800;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#bc8a50'; ctx.fillRect(0, 0, 1200, 800);
    ctx.fillStyle = '#76552f';
    for (const y of [165, 301, 526, 681]) ctx.fillRect(160, y, 880, 5);
    for (const [x, y, color] of [[0, 0, '#c43931'], [1080, 0, '#3d903d'], [1080, 680, '#3075ba'], [0, 680, '#e2c438']]) { ctx.fillStyle = color; ctx.fillRect(x, y, 120, 120); }
    return canvas.toDataURL('image/png').split(',')[1];
  });
  const original = Buffer.from(base64, 'base64'), name = trial.id + '-synthetic-board.png';
  const pending = page.waitForEvent('filechooser');
  await page.locator('#ishChoosePhoto').click();
  const chooser = await pending;
  await chooser.setFiles({name, mimeType: 'image/png', buffer: original});
  await ready();
  assert.equal(await page.locator('#ishPhotoList img').count(), 1);
  assert.match(await page.locator('#ishPhotoList').innerText(), /your board/i);
  assert.equal(await page.locator('#ishDesignPreview image').count(), 1);
  const normalizedDataUrl = await page.locator('#ishPhotoList img').getAttribute('src');
  const photoId = await page.locator('#ishPhotoList [data-photo-remove]').getAttribute('data-photo-remove');
  return {name, photoId, originalSha256: sha256(original), normalizedSha256: sha256(imageBytes(normalizedDataUrl)), normalizedDataUrl};
}

async function rasterizeVisibleProof() {
  // Independently rasterize the actual storefront SVG observed before approval.
  // The application itself still creates and freezes the downloadable PNG.
  const dataUrl = await page.evaluate(async () => {
    const svg = document.querySelector('#ishDesignPreview > svg');
    const source = new XMLSerializer().serializeToString(svg), viewBox = svg.viewBox.baseVal;
    const url = URL.createObjectURL(new Blob([source], {type: 'image/svg+xml'}));
    try {
      const image = await new Promise((resolve, reject) => { const im = new Image(); im.onload = () => resolve(im); im.onerror = () => reject(Error('Observed storefront SVG did not decode.')); im.src = url; });
      const canvas = document.createElement('canvas'); canvas.width = viewBox.width; canvas.height = viewBox.height;
      const ctx = canvas.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/png');
    } finally { URL.revokeObjectURL(url); }
  });
  return sha256(imageBytes(dataUrl));
}

function inspectDownloadedZip(filename, extractDirectory) {
  // Independent stdlib ZIP CRC, SHA-256, XML and primitive DXF readback.
  const python = String.raw`
import hashlib, json, pathlib, struct, sys, zipfile, xml.etree.ElementTree as ET
from html.parser import HTMLParser
archive, destination = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
expected = ['README.txt','artwork.dxf','artwork.svg','editable-design.json','manifest.json','photos/reference-01.jpg','preview.png','request-brief.html','request-brief.txt','request.json']
with zipfile.ZipFile(archive) as z:
    names = z.namelist()
    assert len(names) == len(set(names)) and sorted(names) == expected, 'Complete request must contain exactly the expected ten files'
    assert z.testzip() is None, 'ZIP CRC mismatch'
    z.extractall(destination)
data = {name: (destination/name).read_bytes() for name in names}
info = {name: {'bytes': len(value), 'sha256': hashlib.sha256(value).hexdigest()} for name, value in data.items()}
manifest = json.loads(data['manifest.json'])
assert len(manifest['files']) == 9
assert sorted(item['name'] for item in manifest['files']) == sorted(set(names)-{'manifest.json'})
for item in manifest['files']:
    assert info[item['name']]['bytes'] == item['bytes'], item['name'] + ' size differs from the manifest'
    assert info[item['name']]['sha256'] == item['sha256'], item['name'] + ' hash differs from the manifest'
packet, request = json.loads(data['editable-design.json']), json.loads(data['request.json'])
svg = ET.fromstring(data['artwork.svg'])
ns = {'s': 'http://www.w3.org/2000/svg'}
paths = svg.findall('.//s:path', ns)
assert paths, 'Portable SVG must contain outlined artwork'
for node in svg.iter():
    assert node.tag.rsplit('}', 1)[-1] in {'svg','metadata','g','path','title','desc'}, 'SVG must remain vector-only'
    assert not any(key.rsplit('}',1)[-1] == 'href' for key in node.attrib), 'SVG must not embed or link a photograph'
assert b'data:image' not in data['artwork.svg']
lines = data['artwork.dxf'].decode('ascii').splitlines()
assert len(lines) % 2 == 0
pairs = [(int(lines[i]), lines[i+1].strip()) for i in range(0, len(lines), 2)]
units = next(int(pairs[i+1][1]) for i, pair in enumerate(pairs) if pair == (9, '$INSUNITS'))
closed, entities, in_entities = 0, [], False
for i, pair in enumerate(pairs):
    if pair == (0, 'SECTION'):
        in_entities = pairs[i+1] == (2, 'ENTITIES')
    elif pair == (0, 'ENDSEC'):
        in_entities = False
    elif in_entities and pair[0] == 0:
        entities.append(pair[1])
        assert pair[1] == 'LWPOLYLINE', 'DXF must contain only vector artwork polylines'
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
print(json.dumps({'files': info, 'packet': {'design': packet['design'], 'fontAssets': packet['fontAssets'], 'fingerprint': packet['fingerprint'], 'productionReady': packet['productionReady'], 'toolpathsIncluded': packet['toolpathsIncluded'], 'geometryCount': len(packet['geometry'])}, 'request': request, 'manifest': manifest, 'svg': {'width': svg.get('width'), 'height': svg.get('height'), 'viewBox': svg.get('viewBox'), 'paths': [{'d': node.get('d'), 'transform': node.get('transform')} for node in paths]}, 'dxf': {'unitsCode': units, 'closedPolylines': closed, 'entityTypes': sorted(set(entities))}, 'previewSize': struct.unpack('>II', data['preview.png'][16:24]), 'briefText': data['request-brief.txt'].decode('utf8'), 'briefHtmlText': ''.join(html.parts)}))
`;
  const readback = spawnSync(process.env.CODEX_PRIMARY_RUNTIME_PYTHON || 'python3', ['-c', python, filename, extractDirectory], {encoding: 'utf8', maxBuffer: 8 * 1024 * 1024});
  assert.equal(readback.status, 0, readback.stderr || readback.error?.message);
  return JSON.parse(readback.stdout);
}

async function verifyPhotoPixels(extractDirectory) {
  const proofUrl = 'data:image/png;base64,' + fs.readFileSync(path.join(extractDirectory, 'preview.png')).toString('base64');
  const photoUrl = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(extractDirectory, 'photos/reference-01.jpg')).toString('base64');
  return page.evaluate(async ({proofUrl, photoUrl}) => {
    const load = src => new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(Error('Downloaded image did not decode.')); image.src = src; });
    const [photo, proof] = await Promise.all([load(photoUrl), load(proofUrl)]);
    const expected = document.createElement('canvas'), actual = document.createElement('canvas');
    expected.width = actual.width = proof.naturalWidth; expected.height = actual.height = proof.naturalHeight;
    const a = actual.getContext('2d'), e = expected.getContext('2d');
    a.drawImage(proof, 0, 0); e.translate(photo.naturalHeight, 0); e.rotate(Math.PI / 2); e.drawImage(photo, 0, 0);
    let maxDifference = 0;
    const corners = [[25, 25], [proof.naturalWidth - 45, 25], [25, proof.naturalHeight - 45], [proof.naturalWidth - 45, proof.naturalHeight - 45]];
    for (const [x, y] of corners) {
      const p = a.getImageData(x, y, 20, 20).data, q = e.getImageData(x, y, 20, 20).data;
      for (let i = 0; i < p.length; i++) maxDifference = Math.max(maxDifference, Math.abs(p[i] - q[i]));
    }
    return {photoSize: [photo.naturalWidth, photo.naturalHeight], proofSize: [proof.naturalWidth, proof.naturalHeight], quarterTurns: 1, cornerChannelDifferenceMax: maxDifference};
  }, {proofUrl, photoUrl});
}

async function main() {
  const executable = process.env.CHROMIUM_PATH || ['/tmp/carvewright-signcraft-browser/chrome-linux64/chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', chromium.executablePath()].find(filename => fs.existsSync(filename));
  try {
    await check('sealed runtime and release identities agree before loading', async row => {
      verifySealedInputs();
      Object.assign(row, {build: deployment.build, seal: deployment.release_seal, verifiedRuntimeHashes: sealedRuntimeCount});
    });
    browser = await chromium.launch({headless: true, executablePath: executable, args: ['--no-sandbox', '--disable-dev-shm-usage']});
    context = await browser.newContext({viewport: {width: 1024, height: 768}, hasTouch: true, serviceWorkers: 'block', acceptDownloads: true});
    // Retain the existing sealed-index harness's isolated service-worker policy.
    // The real atomic loader and all product code execute without substitutions.
    await context.addInitScript(() => { delete Navigator.prototype.serviceWorker; });
    await context.route('**/*', route => {
      const url = new URL(route.request().url()), name = decodeURIComponent(url.pathname).slice(1) || 'index.html';
      if (url.origin === ORIGIN && !name.includes('/') && files[name] && route.request().method() === 'GET') {
        served.add(name);
        const type = name.endsWith('.js') ? 'text/javascript' : name.endsWith('.html') ? 'text/html' : name.endsWith('.css') ? 'text/css' : name.endsWith('.json') ? 'application/json' : name.endsWith('.png') ? 'image/png' : 'application/octet-stream';
        return route.fulfill({body: files[name], contentType: type});
      }
      // Do not record query strings, payloads, credentials or provider keys.
      blocked.push({origin: url.origin, path: url.pathname, method: route.request().method()});
      return route.abort();
    });
    page = await context.newPage(); page.setDefaultTimeout(20000);
    page.on('pageerror', error => errors.push(error.stack || String(error)));
    page.on('dialog', dialog => dialog.accept());
    page.on('popup', popup => { popups.push({opened: true}); popup.close().catch(() => {}); });
    await check('actual index and PIN invitation open the camera-first Ike preview', async row => {
      const invite = invitation();
      await page.goto(ORIGIN + '/index.html' + invite.hash, {waitUntil: 'domcontentloaded'});
      await page.waitForFunction(() => window.__darkSkyReleaseGateState === 'clear');
      await page.locator('#clientPreviewUnlockPin').fill(invite.pin);
      await page.locator('#clientPreviewUnlockBtn').click();
      await page.waitForFunction(() => !document.querySelector('#clientPreviewGate'));
      assert.equal(await page.locator('#ikeShopEntry').isVisible(), true);
      await page.locator('#ikeShopStart').click(); await ready();
      assert.equal(await page.evaluate(() => IkeShop.build), deployment.build);
      assert.equal(await page.locator('#ishCameraInput').getAttribute('capture'), 'environment');
      assert.equal(await page.locator('#ishCameraInput').getAttribute('multiple'), null);
      assert.equal(await page.locator('#ishTakePhoto').isEnabled(), true);
      assert.match(await page.locator('#ishTakePhoto').innerText(), /take.*photo/i);
      assert.equal(await page.locator('#ishQuantity').inputValue(), '1');
      assert.equal(await page.locator('.ish-ike-character').isVisible(), true);
      assert.equal(await page.locator('#ishPhotoList img').count(), 0);
      assert.ok(await page.evaluate(() => !!(document.querySelector('#ishPhotoSection').compareDocumentPosition(document.querySelector('#ishDesignSection')) & Node.DOCUMENT_POSITION_FOLLOWING)), 'Choose a photo before editing the sign.');
      await page.setViewportSize({width: 1000, height: 768});
      await page.waitForFunction(() => innerWidth === 1000);
      await page.setViewportSize({width: 1024, height: 768});
      await page.waitForFunction(() => innerWidth === 1024);
      await confirmPreviewGuards();
      requestId = await page.locator('#ikeShop').getAttribute('data-request-id');
      Object.assign(row, {privatePreview: true, atomicGate: 'clear', cameraControl: true, photoFirst: true, storefrontResizeExercised: true});
    });
    await check('own photo opens Board first and returns the exact framed lettering', async row => {
      photoFixture = await uploadOwnPhoto();
      await page.locator('#ishEditDesign').click(); await ready('carvewrightStudio');
      assert.equal(await page.evaluate(() => CarvewrightStudio.build), deployment.build);
      assert.equal(await page.locator('#cweStockTab').innerText(), 'Board');
      assert.equal(await page.locator('#cweStockTab').getAttribute('aria-selected'), 'true');
      assert.equal(await page.locator('#cweStockPanel').isVisible(), true);
      assert.equal(await page.locator('#cweLetteringPanel').isHidden(), true);
      assert.equal(await page.locator('#cweWording').inputValue(), '', 'Start from blank customer wording.');
      assert.equal(await page.locator('#cweCanvas image').count(), 1);
      assert.equal(sha256(imageBytes(await page.locator('#cweCanvas image').getAttribute('href'))), photoFixture.normalizedSha256);
      assert.equal(await page.locator('#cweMachining').isHidden(), true);
      await page.locator('#cweWidth').fill(String(trial.widthIn));
      await page.locator('#cweHeight').fill(String(trial.heightIn));
      await page.locator('#cweThickness').fill(String(trial.thicknessIn));
      await page.locator('#cweStockId').fill(trial.id + '-SYNTHETIC');
      await page.locator('#cwePhotoRotateRight').click();
      assert.equal(await page.locator('#cweCanvas').getAttribute('viewBox'), '0 0 800 1200');
      await range('cweFrameScale', 72); await range('cweFrameX', 62); await range('cweFrameY', 38);
      await page.locator('#cweFrameApply').click();
      assert.match(await page.locator('#cweFrameState').innerText(), /Area chosen/i);
      await screenshot('boardcraft-index-board-area');
      await page.locator('#cweLetteringTab').click();
      await page.locator('#cweWording').fill(trial.wording);
      await page.locator('#cweFontPicker').click();
      catalog = await page.evaluate(choices => choices.map(choice => {
        const font = IkeCarveFonts.fonts[choice.id];
        return {id: choice.id, name: font?.name, sourceSha256: font?.sourceSha256, glyphCount: Object.keys(font?.glyphs || {}).length, catalogName: BlackFlagDesignAssets.fontLabels[choice.id]?.name, inCatalog: BlackFlagDesignAssets.fontOrder.includes(choice.id)};
      }), fontChoices);
      for (const [i, choice] of fontChoices.entries()) {
        const button = page.locator('[data-font="' + choice.id + '"]');
        assert.equal(await button.isVisible(), true);
        assert.match(await button.innerText(), new RegExp(choice.name));
        assert.ok(await button.locator('svg path').count() > 0, 'Each font has real bundled vector previews.');
        assert.equal(catalog[i].name, choice.name); assert.equal(catalog[i].catalogName, choice.name); assert.equal(catalog[i].inCatalog, true);
        assert.ok(catalog[i].glyphCount > 100); assert.match(catalog[i].sourceSha256, /^[a-f0-9]{64}$/);
      }
      await page.locator('[data-font="' + trial.font + '"]').click();
      assert.equal(await page.locator('#cweCurrentFontName').innerText(), trial.label);
      assert.equal(await page.locator('#cweWording').inputValue(), trial.wording);
      studioScene = await readScene('#cweCanvas', '#cwePhotoArtwork');
      assert.equal(studioScene.photo.transform, 'matrix(0 1 -1 0 800 0)');
      assert.equal(studioScene.photo.preserveAspectRatio, 'xMidYMid meet');
      assert.ok(studioScene.artwork.paths.length > 0);
      await screenshot('boardcraft-index-own-words');
      await page.locator('#cweSave').click();
      await page.waitForFunction(() => !document.querySelector('#carvewrightStudio')); await ready();
      returnedScene = await readScene('#ishDesignPreview > svg', ':scope > g');
      assert.equal(returnedScene.viewBox, studioScene.viewBox);
      assert.deepEqual(returnedScene.photo, studioScene.photo);
      assert.deepEqual(returnedScene.artwork, studioScene.artwork, 'Returning to Ike retains the exact paths, ink and photo-coordinate placement.');
      expectedProofSha = await rasterizeVisibleProof();
      await confirmPreviewGuards();
      Object.assign(row, {wording: trial.wording, chosenFont: trial.font, catalog, photoSha256: photoFixture.normalizedSha256, quarterTurns: 1, viewBox: studioScene.viewBox, artworkPaths: studioScene.artwork.paths.length, exactReturnedScene: true});
    });
    await check('frozen displayed proof and complete native ZIP retain the selected board', async row => {
      await page.locator('#ishName').fill(trial.name);
      await page.locator('#ishEmail').fill(trial.email);
      await page.locator('#ishPhone').fill(trial.phone);
      await page.locator('#ishFinish').fill(trial.finish);
      await page.locator('#ishNotes').fill('Synthetic browser verification fixture only. These are not the user’s board measurements.');
      await page.locator('#ishApproval').check();
      await page.locator('#ishPrepare').click(); await ready();
      assert.equal(await page.locator('#ishPackage').isVisible(), true);
      assert.equal(await page.locator('#ishDesignPreview img').count(), 1);
      assert.match(await page.locator('#ishProofState').innerText(), /Frozen.*exact image.*ZIP/i);
      frozenProofSha = sha256(imageBytes(await page.locator('#ishDesignPreview img').getAttribute('src')));
      assert.equal(frozenProofSha, expectedProofSha, 'The frozen image must be pixel-for-pixel the observed storefront scene.');
      await confirmPreviewGuards();
      const pending = page.waitForEvent('download');
      await page.locator('#ishDownload').click();
      const download = await pending, zipPath = path.join(OUT, trial.id + '-synthetic-request.zip');
      await download.saveAs(zipPath);
      assert.equal(await download.failure(), null);
      const archiveSha = sha256(fs.readFileSync(zipPath)), extractDirectory = path.join(OUT, trial.id + '-extracted');
      assert.equal(await page.locator('#ishPackageHash').innerText(), 'Archive SHA-256: ' + archiveSha);
      const extracted = inspectDownloadedZip(zipPath, extractDirectory), {design} = extracted.packet, request = extracted.request;
      assert.deepEqual(Object.keys(extracted.files).sort(), expectedFiles);
      assert.equal(await page.locator('#ishFiles li').count(), expectedFiles.length);
      assert.equal(design.text.value, trial.wording, 'Downloaded wording must retain exact case and spaces.');
      assert.equal(design.text.fontId, trial.font);
      assert.equal(request.id, requestId); assert.equal(request.design.id, design.id); assert.equal(request.design.revision, request.revision);
      assert.equal(request.details.quantity, 1); assert.equal(request.details.finish, trial.finish);
      assert.deepEqual(request.customer, {name: trial.name, email: trial.email, phone: trial.phone});
      assert.equal(request.photos.length, 1);
      assert.equal(request.photos[0].id, photoFixture.photoId);
      assert.equal(request.photos[0].originalName, photoFixture.name);
      assert.equal(request.photos[0].originalSha256, photoFixture.originalSha256);
      assert.equal(request.photos[0].sha256, photoFixture.normalizedSha256);
      assert.equal(extracted.files['photos/reference-01.jpg'].sha256, photoFixture.normalizedSha256);
      assert.deepEqual(Object.keys(request.board).sort(), ['dimensionsStatus', 'frame', 'frameConfirmed', 'photoId', 'quarterTurns']);
      assert.equal(request.board.photoId, photoFixture.photoId); assert.equal(request.board.quarterTurns, 1);
      assert.equal(request.board.frameConfirmed, true); assert.equal(request.board.dimensionsStatus, 'reference-unconfirmed');
      for (const [key, actual, dimension] of [['x', studioScene.frame.x, 800], ['y', studioScene.frame.y, 1200], ['w', studioScene.frame.width, 800], ['h', studioScene.frame.height, 1200]]) approx(request.board.frame[key], actual / dimension, 'Saved board frame ' + key);
      assert.deepEqual(extracted.previewSize, [800, 1200], 'The PNG retains the quarter-turned photo proportions.');
      assert.equal(request.proof.width, 800); assert.equal(request.proof.height, 1200);
      for (const value of [request.proof.sha256, request.approval.proofSha256, extracted.manifest.proofSha256, extracted.files['preview.png'].sha256]) assert.equal(value, frozenProofSha);
      for (const value of [request.proof.designFingerprint, request.approval.designFingerprint, request.design.fingerprint, extracted.manifest.designFingerprint]) assert.equal(value, extracted.packet.fingerprint);
      const content = {schema: request.schema, projectId: request.projectId, id: request.id, customer: request.customer, details: request.details, designFingerprint: extracted.packet.fingerprint, photos: request.photos.map(p => ({id: p.id, name: p.name, mime: p.mime, sha256: p.sha256, originalName: p.originalName, originalSha256: p.originalSha256, width: p.width, height: p.height})), board: request.board, productionApproved: false};
      assert.equal(sha256(canonical(content)), request.approval.contentFingerprint, 'Approval binds the exact photo, frame, wording and contact details.');
      assert.equal(request.approval.contentFingerprint, extracted.manifest.contentFingerprint);
      assert.deepEqual(request.approval.photoFingerprints, [photoFixture.normalizedSha256]);
      assert.equal(request.productionApproved, false); assert.equal(request.approval.kind, 'customer-design-approval'); assert.equal(request.approval.productionApproved, false);
      assert.equal(request.delivery.status, 'not-sent'); assert.equal(extracted.manifest.deliveryAttempt, null);
      assert.equal(extracted.manifest.productionApproved, false); assert.equal(extracted.manifest.requestId, requestId);
      assert.equal(extracted.packet.productionReady, false); assert.equal(extracted.packet.toolpathsIncluded, false); assert.ok(extracted.packet.geometryCount > 0);
      assert.ok(JSON.stringify(extracted.packet.fontAssets).includes(catalog.find(font => font.id === trial.font).sourceSha256));
      const dimensions = [trial.widthIn * 25.4, trial.heightIn * 25.4, trial.thicknessIn * 25.4];
      for (const [i, key] of ['widthMm', 'heightMm', 'thicknessMm'].entries()) approx(design.stock[key], dimensions[i], key);
      assert.ok(extracted.svg.width.endsWith('mm') && extracted.svg.height.endsWith('mm'));
      approx(parseFloat(extracted.svg.width), dimensions[0], 'SVG width'); approx(parseFloat(extracted.svg.height), dimensions[1], 'SVG height');
      assert.deepEqual(extracted.svg.paths, studioScene.artwork.paths, 'Portable SVG retains only the exact artwork paths, without the photo or frame.');
      assert.ok(extracted.briefText.includes(trial.wording) && extracted.briefHtmlText.includes(trial.wording));
      assert.match(extracted.briefText, /board photograph/i); assert.match(extracted.briefText, /unconfirmed|not calibrated/i);
      const pixels = await verifyPhotoPixels(extractDirectory);
      assert.deepEqual(pixels.photoSize, [1200, 800]); assert.deepEqual(pixels.proofSize, [800, 1200]);
      assert.ok(pixels.cornerChannelDifferenceMax <= 2, 'All four PNG corners must match the chosen JPEG rotated clockwise.');
      downloads.push({requestId, designId: design.id, archiveSha, zipPath, photoSha256: photoFixture.normalizedSha256});
      await screenshot('boardcraft-index-complete-package');
      await confirmPreviewGuards();
      Object.assign(row, {requestId, designId: design.id, quantity: 1, zipFile: path.basename(zipPath), suggestedFilename: download.suggestedFilename(), zipBytes: fs.statSync(zipPath).size, archiveSha256: archiveSha, proofSha256: frozenProofSha, board: request.board, files: extracted.files, crcAndManifestVerified: true, exactDisplayedProof: true, photoPixels: pixels, dxfClosedPolylines: extracted.dxf.closedPolylines, vectorOnlyExports: true, productionApproved: false, sendShareMailDisabled: true});
    });
    await check('New request removes the prior photo, design, contact and package', async row => {
      await page.locator('#ishNewRequest').click(); await ready();
      const freshId = await page.locator('#ikeShop').getAttribute('data-request-id');
      assert.notEqual(freshId, requestId);
      for (const id of ['ishName', 'ishEmail', 'ishPhone', 'ishNotes']) assert.equal(await page.locator('#' + id).inputValue(), '', id + ' must clear.');
      assert.equal(await page.locator('#ishQuantity').inputValue(), '1'); assert.equal(await page.locator('#ishFinish').inputValue(), 'Black');
      assert.equal(await page.locator('#ishPhotoList img').count(), 0);
      assert.equal(await page.locator('#ishApproval').isChecked(), false);
      assert.equal(await page.locator('#ishPackage').isHidden(), true);
      assert.equal(await page.locator('#ishFiles li').count(), 0);
      assert.equal(await page.locator('#ishDownload').isDisabled(), true);
      assert.equal(await page.locator('#ishDesignPreview .ish-empty').count(), 1);
      assert.equal(await page.locator('#ishDesignPreview img, #ishDesignPreview image, #ishDesignPreview path').count(), 0);
      assert.equal(await page.locator('#ishDesignPreview').evaluate(node => node.classList.contains('ish-has-photo')), false);
      assert.equal(sha256(fs.readFileSync(downloads[0].zipPath)), downloads[0].archiveSha, 'Starting fresh must not change the downloaded request.');
      await confirmPreviewGuards();
      for (const name of requiredServed) assert.ok(served.has(name), 'The actual index loader must have fetched ' + name + '.');
      await screenshot('boardcraft-index-fresh-request');
      resetVerified = true;
      Object.assign(row, {previousRequestId: requestId, freshRequestId: freshId, previousCustomerCleared: true, previousBoardCleared: true, downloadRetained: true});
    });
  } catch (error) {
    if (!results.some(row => !row.pass)) results.push({name: 'Actual storefront startup', pass: false, error: error.stack || String(error)});
    if (page) await screenshot('boardcraft-index-failure').catch(() => {});
    console.error(error.stack || String(error));
  } finally {
    const report = {schema: 'boardcraft-index-verification-v1', scope: 'Actual sealed index, local client-preview PIN gate, photo-first storefront, shared Board controls, customer wording and native ZIP. Runtime assets served unchanged; every external request blocked. All names, contacts, images and dimensions are synthetic fixtures. Camera UI semantics are checked; native camera capture, Safari, live inbox receipt and physical CNC acceptance are not claimed.', build: deployment.build, seal: deployment.release_seal, passed: results.filter(row => row.pass).length, failed: results.filter(row => !row.pass).length, expectedRequests: 1, completedRequests: downloads.length, resetVerified, privatePreview: true, runtimeAssetsUnmodified: true, sealedRuntimeHashes: sealedRuntimeCount, pageErrors: errors, blockedExternalAttempts: blocked, popupAttempts: popups, served: [...served].sort(), results};
    fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({passed: report.passed, failed: report.failed, completedRequests: report.completedRequests, resetVerified}));
    if (report.failed || report.completedRequests !== 1 || !resetVerified || errors.length || blocked.length || popups.length) process.exitCode = 1;
    await context?.close(); await browser?.close();
  }
}
main().catch(async error => { console.error(error.stack || String(error)); process.exitCode = 1; await browser?.close(); });

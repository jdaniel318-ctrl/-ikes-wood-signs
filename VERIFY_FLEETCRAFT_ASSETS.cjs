'use strict';
// Guards the release contract: removing outlined assets or replacing them with
// fallback fonts, open strokes, bad coordinates or changed legacy data must fail.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const fonts = require('./carve_fonts.js');
const fontIds = ['studio-sans', 'studio-serif', 'rye', 'cinzel-bold', 'lobster', 'stardos-stencil', 'bree-serif', 'black-ops-one'];
const graphicIds = ['anchor', 'compass', 'pine', 'mountains', 'oak-leaf', 'antlers', 'fish', 'paw', 'cabin', 'campfire', 'wave', 'sun', 'heart', 'star', 'crossed-tools', 'ribbon'];
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');

assert.deepEqual(Object.keys(fonts.fonts), fontIds, 'All eight real outlined fonts must be bundled in the promised order.');
const assetPath = path.join(__dirname, 'fleet_design_assets.js');
assert.ok(fs.existsSync(assetPath), 'The shared vector catalog must be bundled.');
const assets = require(assetPath);
const cam = require('./carvewright_cam.js');
const legacy = require('./carve_core.js');
assert.equal(assets.schema, 'blackflag-design-assets-v1');
assert.deepEqual(assets.fontOrder, fontIds);
assert.deepEqual(assets.graphicOrder, graphicIds);
assert.equal(sha256(JSON.stringify(fonts.fonts['studio-sans'])), '29e101f6d2de87dd00529df8c470764cf73e1096cac6af1a2fcef09f0718960d', 'Legacy Sans outlines, metrics and metadata must be unchanged.');
assert.equal(sha256(JSON.stringify(fonts.fonts['studio-serif'])), '65f8b389d9b7f3e7c1209088bdb01a43333923b42a0205ebe076f54053d999e3', 'Legacy Serif outlines, metrics and metadata must be unchanged.');

function frozenTree(value) {
  if (!value || typeof value !== 'object') return;
  assert.ok(Object.isFrozen(value), 'Public asset data must be immutable.');
  Object.values(value).forEach(frozenTree);
}
function validPath(d, label) {
  assert.equal(typeof d, 'string', label + ' needs an outline.');
  assert.ok(d.startsWith('M') && d.endsWith('Z'), label + ' needs closed contours.');
  assert.ok(!/[^MLHVQCZ0-9.,+\-\s]/.test(d), label + ' uses an unsupported command.');
  assert.equal((d.match(/M/g) || []).length, (d.match(/Z/g) || []).length, label + ' has an open contour.');
  let rings;
  try { rings = cam.flattenPath(d, [1, 0, 0, 1, 0, 0], .01); }
  catch (error) { throw Error(label + ': ' + error.message); }
  assert.ok(rings.length && rings.every(r => r.length >= 3 && r.every(p => Number.isFinite(p.x) && Number.isFinite(p.y))), label + ' must produce finite filled polygons.');
  return rings;
}
frozenTree(fonts);
frozenTree(assets);
function winding(rings, x, y) {
  return rings.reduce((sum, ring) => sum + ring.reduce((w, a, i) => {
    const b = ring[(i + 1) % ring.length];
    const cross = (b.x - a.x)*(y - a.y) - (x - a.x)*(b.y - a.y);
    if (a.y <= y && b.y > y && cross > 0) w++;
    if (a.y > y && b.y <= y && cross < 0) w--;
    return w;
  }, 0), 0);
}
function signedArea(ring) {
  return ring.reduce((sum, p, i) => { const q = ring[(i + 1) % ring.length]; return sum + (p.x*q.y - q.x*p.y)/2; }, 0);
}
// A mirrored antler must union with the head. Its opposite winding would
// cancel the overlap at this point, despite each separate contour looking fine.
assert.ok(winding(validPath(assets.graphics.antlers.d, 'antlers'), 55, 70) > 0, 'Mirrored antlers must preserve positive SVG outer winding through their overlap.');
for (const [id, x, y] of [['anchor',50,17], ['compass',50,50], ['cabin',32,60], ['ribbon',50,45]]) {
  assert.equal(winding(validPath(assets.graphics[id].d, id), x, y), 0, id + ' counter must remain empty with the nonzero fill rule.');
}
const outlines = new Set();
const coverage = {};
for (const id of fontIds) {
  const font = fonts.fonts[id];
  assert.equal(font.id, id);
  assert.ok(assets.fontLabels[id].name && assets.fontLabels[id].description);
  assert.ok(/^[0-9a-f]{64}$/.test(font.sourceSha256));
  assert.ok(font.unitsPerEm > 0 && font.lineHeight > 0);
  assert.ok(Object.keys(font.glyphs).length >= 180, id + ' requires useful Latin and punctuation coverage.');
  assert.ok(!font.glyphs['☃'], 'Unsupported characters must remain absent, never mapped to another glyph.');
  if (id === 'bree-serif') assert.ok(!font.glyphs['¤'], 'Bree Serif has no source currency glyph and must not invent one.');
  for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') assert.ok(font.glyphs[ch] && font.glyphs[ch].d, id + ' must contain real common-letter outlines.');
  let curves = 0;
  for (const [ch, glyph] of Object.entries(font.glyphs)) {
    assert.ok(Number.isFinite(glyph.advance) && glyph.bounds.length === 4 && glyph.bounds.every(Number.isFinite), id + ' has invalid glyph metrics.');
    if (!glyph.d) { assert.ok(/[\s\u00ad]/u.test(ch), id + ' has a visible empty glyph.'); continue; }
    const rings = validPath(glyph.d, id + '/' + ch);
    const areas = rings.map(signedArea).sort((a, b) => Math.abs(b) - Math.abs(a));
    assert.ok(areas[0] < 0, id + '/' + ch + ' must preserve clockwise font outer contours for additive CAM union.');
    if (/[QC]/.test(glyph.d)) curves++;
  }
  // Black Ops One is an intentionally angular source with line-only outlines.
  if (id !== 'black-ops-one') assert.ok(curves > 40, id + ' must preserve its source curves.');
  assert.ok(Object.values(font.kern).every(Number.isFinite), id + ' has invalid kerning.');
  if (id !== 'rye') assert.ok(Object.values(font.kern).some(value => value < 0), id + ' must preserve real source kerning.');
  const draft = legacy.createDraft();
  draft.text.fontId = id;
  draft.text.value = 'AVO';
  assert.ok(legacy.layout(draft, fonts).ok, id + ' must work in the real lettering pipeline.');
  draft.text.value = '☃';
  assert.deepEqual(legacy.validate(draft, fonts).missingGlyphs, ['☃']);
  outlines.add(font.glyphs.A.d);
  coverage[id] = {glyphs: Object.keys(font.glyphs).length, kernPairs: Object.keys(font.kern).length, sourceSha256: font.sourceSha256};
}
assert.equal(outlines.size, 8, 'Every typeface must have distinct actual lettering.');
assert.equal(fonts.fonts['cinzel-bold'].kern['A|V'], -117, 'Cinzel Bold must retain the source A–V kerning.');
assert.equal(fonts.fonts['black-ops-one'].kern['T|o'], -190, 'Black Ops One must retain the source T–o kerning.');
const graphicPaths = new Set();
for (const id of graphicIds) {
  const graphic = assets.graphics[id];
  assert.equal(graphic.id, id);
  assert.ok(graphic.name && graphic.category && graphic.source);
  assert.deepEqual(graphic.viewBox, [0, 0, 100, 100]);
  assert.equal(graphic.sourceSha256, sha256(graphic.d), id + ' exact vector source must be fingerprinted.');
  assert.ok(graphic.bounds.length === 4 && graphic.bounds.every(Number.isFinite));
  const rings = validPath(graphic.d, id);
  const areas = rings.map(signedArea).sort((a, b) => Math.abs(b) - Math.abs(a));
  assert.ok(areas[0] > 0, id + ' SVG outer must flip to clockwise machine-space winding, matching text.');
  const points = rings.flat();
  const actual = [Math.min(...points.map(p => p.x)), Math.min(...points.map(p => p.y)), Math.max(...points.map(p => p.x)), Math.max(...points.map(p => p.y))];
  actual.forEach((value, i) => assert.ok(Math.abs(value - graphic.bounds[i]) < .03, id + ' bounds must match its curves.'));
  assert.ok(graphic.bounds[0] >= 0 && graphic.bounds[1] >= 0 && graphic.bounds[2] <= 100 && graphic.bounds[3] <= 100 && graphic.bounds[2] > graphic.bounds[0] && graphic.bounds[3] > graphic.bounds[1]);
  graphicPaths.add(graphic.d);
}
assert.equal(graphicPaths.size, 16, 'Every graphic must be distinct.');
// Overlapping negative vein cutouts can accidentally leave tiny filled islands.
// Exercise the exact production CAM guard on a useful physical emblem size.
const core = require('./carvewright_core.js');
const leaf = core.addGraphicLayer(core.createDraft(), 'oak-leaf');
const leafBounds = assets.graphics['oak-leaf'].bounds;
leaf.layers[0].heightMm = 100;
leaf.layers[0].widthMm = 100*(leafBounds[2] - leafBounds[0])/(leafBounds[3] - leafBounds[1]);
leaf.layers[0].rotationDeg = 17;
assert.doesNotThrow(() => cam.build(leaf, fonts, cam.defaults(leaf)), 'The rotated oak leaf must have no accidental tiny disconnected cut islands.');
const text = core.createDraft();
text.text.value = 'A';
text.text.sizePercent = 45;
let overlap = core.addTextLayer(text, '1');
overlap.layers[0].text.fontId = 'cinzel-bold';
overlap = core.addGraphicLayer(overlap, 'star');
overlap.layers[1].widthMm = 80;
overlap.layers[1].heightMm = 80;
const star = JSON.parse(JSON.stringify(overlap));
star.text.value = '';
star.layers = star.layers.filter(layer => layer.type === 'graphic');
const cutArea = d => cam.build(d, fonts, cam.defaults(d)).stats.sourceAreaMm2;
assert.ok(cutArea(overlap) >= Math.max(cutArea(text), cutArea(star)), 'Overlapping original text, normalized Cinzel lettering and an emblem must union without cancellation.');
console.log(JSON.stringify({ok: true, fonts: coverage, graphics: graphicIds.length, legacyFontObjectsUnchanged: true}, null, 2));

'use strict';
// Catch missing/unusable new lettering, broken editable exports, and accidental
// rewrites of the eight font objects and sixteen graphics already shipped in .60.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fonts = require('./carve_fonts.js');
const catalog = require('./fleet_design_assets.js');
const core = require('./carvewright_core.js');
const portable = require('./carvewright_portable.js');
const canonical = value => Array.isArray(value) ? '[' + value.map(canonical).join(',') + ']'
  : value && typeof value === 'object' ? '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}'
    : JSON.stringify(value);
const digest = value => crypto.createHash('sha256').update(canonical(value)).digest('hex');
// Independently captured from the delivered Shopcraft .60 catalog.
const previousFonts = {
  'studio-sans': '7608e08c6e184d70d76b3d8fd16eefb1afc565d0d2f20fffa6d057a3e6a2588b',
  'studio-serif': 'b1e3bc3e6dd7b7233169113b77d08b168a02d6f3032e001929dafe2f883a5f1e',
  rye: '7d2ac26f162cd89330b76c18d31b7e106f3a8d51b3382d365c50aa1125d8e3c9',
  'cinzel-bold': '445ca1ee85230a1f0fd49c46d508aa83597b46df9711ce7c8b1a536bfd65fbb7',
  lobster: '29d4e443d466f7d3d58c2196ef1cec1cf9a1dc2ce725f9b1788ca63fd59e6eb1',
  'stardos-stencil': 'f424ebb60a701c213e283adf23d7510aa2b36255650badfb6268cbffb1655590',
  'bree-serif': '557b0961d4c86c2910c0af3061bb5df0f0ca1248a5fca8d1073068c33bbd7269',
  'black-ops-one': '635dab90906be216f8d2aaccdcd25b3024fa3cd9e835432b59416d74e97f274f'
};

async function main() {
  const trials = [
    {id: 'monoton', label: 'Retroline', wording: 'NIGHT TIDE', sourceSha256: '951c4cea65ffede784a7c9672feec5d329a7e1e12216c42d53ecf36c90d04dea'},
    {id: 'berkshire-swash', label: 'Orchard Swash', wording: 'Cedar & Ember', sourceSha256: 'f0c80837dc6f32b89b10894a7e39295db4a00ab697cada682a3f5942c342fe00'}
  ];
  const results = [];
  for (const trial of trials) {
    const font = fonts.fonts[trial.id];
    assert.ok(font, trial.label + ' must be bundled as real outlines.');
    assert.equal(font.sourceSha256, trial.sourceSha256, 'The new family must identify the pinned original source.');
    assert.ok(catalog.fontOrder.includes(trial.id), trial.label + ' must be selectable in the shared editor catalog.');
    assert.equal(catalog.fontLabels[trial.id].name, trial.label);
    assert.equal(font.name, trial.label, 'Generated variants use their own primary names.');
    assert.ok(Object.isFrozen(font) && Object.isFrozen(font.glyphs));
    for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&') {
      assert.ok(font.glyphs[ch]?.d, trial.id + '/' + ch + ' must retain an actual source outline.');
    }
    assert.ok(!font.glyphs['☃'], 'Unsupported glyphs must not use a fallback.');
    const design = core.ensureLayers(core.createDraft());
    design.title = trial.label + ' editable trial';
    design.text.fontId = trial.id;
    design.text.value = trial.wording;
    design.stock.widthMm = 609.6;
    design.stock.heightMm = 203.2;
    design.stock.thicknessMm = 19.05;
    const layout = core.layout(design, fonts);
    assert.equal(layout.ok, true, layout.errors.join(' '));
    assert.equal(layout.blank, false);
    const packet = await core.createPacket(design, fonts);
    const imported = await core.readPacket(JSON.stringify(packet), fonts);
    assert.equal(imported.text.value, trial.wording, 'Import must retain exact mixed case and punctuation.');
    assert.equal(imported.text.fontId, trial.id);
    assert.deepEqual(core.layout(imported, fonts).glyphs, packet.geometry, 'Import must reproduce the exact physical outlines.');
    assert.equal(imported.revision, 0);
    assert.equal(imported.review, null);
    assert.equal(packet.productionReady, false);
    assert.equal(packet.toolpathsIncluded, false);
    const svg = core.toSvg(design, fonts);
    assert.ok(svg.includes('width="609.6mm" height="203.2mm"'));
    assert.ok(!/<text\b/.test(svg), 'SVG must use outlines without browser font dependencies.');
    const dxf = portable.toDxf(design, fonts);
    assert.equal(dxf.units, 'mm');
    assert.ok(dxf.contourCount > 0 && dxf.pointCount > 0);
    const contours = portable.normalizedContours(design, fonts);
    assert.ok(contours.contours.some(contour => contour.hole), 'The trial lettering must retain its counters.');
    results.push({id: trial.id, wording: trial.wording, glyphCount: Object.keys(font.glyphs).length, kerningPairs: Object.keys(font.kern).length, sourceSha256: font.sourceSha256, dxfContours: dxf.contourCount, counters: contours.contours.filter(contour => contour.hole).length, roundTrip: true});
  }
  for (const [id, sha] of Object.entries(previousFonts)) assert.equal(digest(fonts.fonts[id]), sha, 'Previously shipped ' + id + ' changed.');
  assert.deepEqual(catalog.fontOrder.slice(0, 8), Object.keys(previousFonts));
  assert.equal(digest(Object.fromEntries(Object.keys(previousFonts).map(id => [id, catalog.fontLabels[id]]))), 'fe48e5d9dfe93278ffe922d894013104fb518335a9bbf7980dcb7592aa7ee72d');
  assert.equal(digest(catalog.graphics), 'dbe6294acf4e00a2b3c33f02fd963605dac5551cc210c1e3681f20d7ae8beaef', 'Previously shipped graphics changed.');
  assert.equal(digest(catalog.graphicOrder), '8c1554f6ef250dd114d66453ff0588a06c59a24c9b4372348ce033ee0a002596');
  console.log(JSON.stringify({ok: true, trials: results, previousFontsUnchanged: 8, previousGraphicsUnchanged: 16}, null, 2));
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });

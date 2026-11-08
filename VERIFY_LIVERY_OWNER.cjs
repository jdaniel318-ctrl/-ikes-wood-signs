'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const deck = require('./business_deck.js');
const legacy = {id:'bf-p-f92f87e8ec44', name:'Legacy Plumbing', projectCode:'LP'};
const bundled = 'assets/legacy_plumbing_canonical_logo.jpeg';
assert.ok(fs.statSync(path.join(__dirname, bundled)).size > 0);
assert.deepEqual(deck.logoSources({id:'legacy-plumbing'}), [bundled]);
assert.deepEqual(deck.logoSources({...legacy, businessIntake:{visualAssets:{logo:'https://legacyplumbingrva.com/wp-content/uploads/2026/04/LOGO.png'}}}), [bundled]);
assert.match(deck.logo(legacy), /legacy_plumbing_canonical_logo/);
assert.deepEqual(deck.logoSources({...legacy, branding:{logoDataUrl:'assets/custom.png'}}), ['assets/custom.png', bundled]);
const other = {...legacy, id:'other'};
assert.deepEqual(deck.logoSources(other), []);
assert.deepEqual(deck.logoSources({...other,businessIntake:{visualAssets:{logo:'https://example.invalid/mark.png'}}}), ['https://example.invalid/mark.png']);
for (const source of ['javascript:example', '//example.invalid/image.png', '../other.png', 'data:text/html,Hi', 'https://a:b@example.invalid/o']) {
  assert.deepEqual(deck.logoSources({...other, logoData:source}), []);
}
assert.equal(deck.image('https://example.invalid/order.jpg'),'');
assert.match(deck.logo(other), /bd-monogram/);
assert.equal(deck.ownerPalette({...legacy,branding:{primary:'#123456',accent:'#def'}}).primary,'#123456');
assert.equal(deck.ownerPalette({...other,branding:{primary:'url(evil)'}}).primary,deck.ownerPalette(other).primary);
console.log('Owner identity, scoped defaults, brand colors and independent order thumbnails passed.');

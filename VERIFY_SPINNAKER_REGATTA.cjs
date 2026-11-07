'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = name => fs.readFileSync(path.join(__dirname, name));
const engine = read('index.html').toString();
const deck = read('captain.js').toString();
const artwork = ['sail','harbor'];
for (const [index, surface] of [engine, deck].entries()) {
  assert.match(surface, /ADMIRAL TOOL · FLEET LEARNING/);
  assert.doesNotMatch(surface, /black-flag-regatta\.[\w-]+\.chatgpt\.site/i);
  const asset = 'regatta-' + artwork[index] + '.webp';
  assert.ok(surface.includes(asset));
  assert.equal(read(asset).toString('ascii', 8, 12), 'WEBP');
}
assert.match(engine, /data-command-open="regatta"/);
assert.ok(deck.includes("openAdmiralGate('engine', 'regatta')"));
assert.match(deck, /id="regattaHarborLink" disabled/);
assert.match(deck, /if \(!await window.DarkSkyAdmiralIdentityStatus\(\) \|\| !current\(entry\)\)/);
assert.ok(!read('owner.html').includes('regattaHarborLink'));
const bytes = read('regatta-player.json');
assert.ok(deck.includes(crypto.createHash('sha256').update(bytes).digest('hex')));
assert.ok(deck.includes("frame.setAttribute('sandbox','allow-scripts')"));
assert.ok(deck.includes("event.source !== frame.contentWindow || event.origin !== 'null'"));
const player = JSON.parse(bytes).document;
assert.match(player, /connect-src 'none'/);
assert.doesNotMatch(player, /<(?:script|img|link)\b[^>]*\s(?:src|href)="(?!data:)/i);
assert.doesNotMatch(player, /localStorage|sessionStorage|chatgpt\.site/i);
const scripts = Array.from(player.matchAll(/<script>([\s\S]*?)<\/script>/g), m => m[1]);
assert.equal(scripts.length, 4);
for (const script of scripts) new vm.Script(script);
const context = vm.createContext({Image:class {}});
vm.runInContext(scripts.slice(0,3).join('\n')+'\nthis.game=Regatta;',context);
for (let boat = 0; boat < 3; boat++) {
  const race = context.game;
  let outcome;
  race.start(boat,(type,record) => { if (type === 'finish') outcome=record; }, () => .4);
  for (let tick=0; tick<6000 && !outcome; tick++) race.tick(1/60);
  assert.equal(outcome?.id,boat);
  assert.ok(outcome.time > 0 && outcome.rank >= 1 && outcome.rank <= 3);
}
console.log('PASS Regatta entrances, local player integrity, account boundary, artwork and three finishable boats');

'use strict';
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const vm = require('node:vm');
const html = JSON.parse(readFileSync(__dirname + '/brassline.ship.json', 'utf8')).player;
const section = id => html.split('<script id="' + id + '">')[1].split('</script>')[0];
const pref = {matches: false};
function element() {
  const flags = new Set();
  return {
    children: [], style: {}, dataset: {},
    classList: {
      add: (...names) => names.forEach(name => flags.add(name)),
      remove: (...names) => names.forEach(name => flags.delete(name)),
      contains: name => flags.has(name)
    },
    append(...nodes) { this.children.push(...nodes); },
    replaceChildren(...nodes) { this.children = nodes; },
    setAttribute() {},
    animate(frames, options) {
      this.latest = {frames, options, cancel() { this.cancelled = true; }};
      return this.latest;
    }
  };
}
const ctx = vm.createContext({
  matchMedia: () => pref,
  document: {createElement: element},
  getComputedStyle: el => ({transform: el.offsetY}),
  DOMMatrixReadOnly: class { constructor(y) { this.m42 = y; } }
});
const motion = vm.runInContext(section('reel-motion') + '\nBrassMotion', ctx);
function fixture() {
  const col = element();
  const strip = element();
  col.children = [{getBoundingClientRect: () => ({height: 100})}];
  col.querySelector = () => strip;
  return {col, strip};
}
const token = (id, symbol) => symbol;
const symbols = el => el.children.map(ch => ch.children[0]).join('');
const offset = frame => Number(frame.transform.split('calc(')[1].split(' *')[0]);
vm.runInContext(section('rules'), ctx);
for (const id of Object.keys(ctx.BrasslineRules.games)) {
  for (let i = 0; i < 3; i++) {
    const {col, strip} = fixture();
    motion.start(col, i, id, 'AHW', token);
    const tape = symbols(strip);
    const cycle = -offset(strip.latest.frames[0]);
    assert.equal(tape.slice(cycle, cycle + 3), 'AHW');
    assert.equal(tape.slice(0, 3), 'AHW');
    strip.offsetY = -245;
    motion.stop(col, i, id, 'WLA', token);
    const start = -offset(strip.latest.frames[0]);
    assert.ok(Math.abs(start % 1 - .45) < .000001);
    assert.equal(symbols(strip).slice(Math.floor(start), Math.floor(start) + 4), tape.slice(2, 6));
    assert.equal(symbols(strip).slice(0, 3), 'WLA');
    assert.equal(strip.latest.options.duration, [490, 665, 845][i]);
    assert.equal(offset(strip.latest.frames.at(-1)), 0);
    motion.cancel(col);
    assert.equal(col.classList.contains('in-motion'), false);
  }
}
for (const [dir, travel] of [['down', 1], ['up', -1]]) {
  const {col, strip} = fixture();
  motion.stripAt(col, 'vault', 'AKJLA', travel * .42, token);
  assert.equal(symbols(strip), 'AKJLA');
  motion.slide(col, 'vault', 'AKJLA', dir, travel * .42, token);
  assert.ok(Math.abs(offset(strip.latest.frames[0]) - (-1 + travel * .42)) < .000001);
  assert.equal(offset(strip.latest.frames.at(-1)), -1 + travel);
  assert.equal(symbols(strip).slice(1-travel, 4-travel), dir === 'down' ? 'AKJ' : 'JLA');
  strip.latest.onfinish();
  assert.equal(col.classList.contains('in-motion'), false);
  motion.slide(col, 'vault', 'AKJLA', dir, 0, token, true);
  assert.equal(strip.latest.options.duration, 1280);
  assert.equal(offset(strip.latest.frames[0]), -1);
  assert.equal(offset(strip.latest.frames.at(-1)), -1 + travel);
  motion.cancel(col);
  motion.stripAt(col, 'vault', 'AKJLA', .1, token);
  motion.retract(col);
  assert.equal(offset(strip.latest.frames.at(-1)), -1);
}
pref.matches = true;
const {col, strip} = fixture();
motion.start(col, 0, 'vault', 'AHW', token);
motion.slide(col, 'vault', 'AKJLA', 'up', 0, token);
assert.equal(strip.latest, undefined);
console.log('PASS moving strip continuity, touch nudge, reversal, slow replay and reduced motion.');

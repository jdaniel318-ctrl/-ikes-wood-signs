'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const page = JSON.parse(fs.readFileSync(__dirname + '/brassline.ship.json')).player;
const ctx = vm.createContext({});
for (const [, name, code] of page.matchAll(/<script id="([^"]+)">([\s\S]*?)<\/script>/g)) {
  if (['rules', 'cabinet-model', 'bonus-model'].includes(name)) vm.runInContext(code, ctx);
}
const C = ctx.ReelCabinet;
const R = ctx.BrasslineRules;
const B = vm.runInContext('BrassBonus', ctx);
const neverDraw = () => assert.fail('An ineligible spin used the feature draw');
const ids = Object.keys(R.games);
const left = ['AHKAL','LJKAL','LLKAH']; // three center kings
const gap = ['ALAKH','AKWJA','AKJAL']; // Piggy right reel can be raised for 30

function payLine(s) {
  assert.ok(C.paidSpin(s));
  s.board = left;
  C.stop(s);
  C.land(s);
  assert.equal(s.outcome, 'landed');
}
function close(s) {
  const feature = B.begin(s);
  assert.ok(feature);
  assert.ok(B.finish(feature, true));
  assert.equal(B.begin(s), null);
}
for (const id of ids) {
  for (const level of [1, 2, 3]) {
    const s = C.create(id);
    s.nextLevel = level;
    payLine(s);
    assert.equal(B.earn(s, () => .1), false);
    assert.equal(B.earn(s, neverDraw), false);
    payLine(s);
    assert.ok(B.earn(s, () => .1 - Number.EPSILON));
    close(s);
  }
}
for (const [value,expected] of [[1/6, false], [1/6-Number.EPSILON, true]]) {
  const s = C.create('vault');
  assert.ok(C.paidSpin(s));
  s.board = gap;
  C.stop(s); C.land(s); C.nudge(s, {reel:2, dir:'up'});
  assert.equal(C.balance(s), 520);
  assert.equal(B.earn(s, () => value), expected);
  assert.equal(C.balance(s), 520);
  assert.ok(!B.earn(s, neverDraw));
}
const pace = C.createBonusPace();
const cabinets = Object.fromEntries(ids.map(id => [id, C.create(id, null, pace)]));
const parked = cabinets.pirate;
payLine(parked);
payLine(cabinets.train);
assert.ok(B.earn(cabinets.train, () => 0));
close(cabinets.train);
assert.equal(B.earn(parked, neverDraw), false);
const vault = cabinets.vault;
vault.keys = 3;
const paidBeforeFree = pace.paidSpins;
assert.ok(C.paidSpin(vault)); C.stop(vault); C.land(vault);
assert.ok(vault.win > 0); assert.equal(vault.outcome, 'vault');
assert.equal(B.earn(vault, neverDraw), false);
const lesson = C.create('vault', 0, pace);
assert.ok(C.paidSpin(lesson)); C.stop(lesson); C.land(lesson);
assert.equal(B.earn(lesson, neverDraw), false);
const poor = cabinets.harbor;
poor.wagered = 500;
assert.equal(C.paidSpin(poor), false);
poor.topUps += 500;
assert.equal(pace.paidSpins, paidBeforeFree);
for (const id of ['buffalo','jungle','harbor','pirate']) {
  payLine(cabinets[id]);
  assert.equal(B.earn(cabinets[id], neverDraw), false);
}
assert.equal(pace.paidSpins, paidBeforeFree+4);
payLine(vault);
assert.equal(B.earn(vault, () => .6), false); // gap expiry only restores eligibility
payLine(cabinets.train);
assert.ok(B.earn(cabinets.train, () => 0));
close(cabinets.train);
console.log('PASS cutoff boundaries, per-spin draws, full nudge pay, four paid spins across game switches, pending wins, top-ups, practice, and five-line vault awards.');

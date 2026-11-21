'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const cartridge = JSON.parse(fs.readFileSync(path.join(__dirname, 'brassline.ship.json')));
const scripts = new Map(Array.from(
  cartridge.player.matchAll(/<script id="([^"]+)">([\s\S]*?)<\/script>/g),
  match => [match[1], match[2]]
));

function element() {
  return {children: [], classList: {add() {}}, append(child) { this.children.push(child); }};
}
const context = vm.createContext({
  document: {createElement: element, documentElement: {style: {setProperty() {}}}},
  Image: class {}
});
context.window = context;
for (const script of ['rules', 'cabinet-model', 'art', 'harbor-art', 'glass']) {
  vm.runInContext(scripts.get(script), context);
}
const {BrasslineRules: rules, ReelCabinet: cabinet, ReelGlass: glass} = context;
let stops = 0;
for (const [id, game] of Object.entries(rules.games)) {
  const bands = cabinet.stripsFor(id);
  for (const band of bands) {
    for (const symbol of new Set(band)) {
      assert.ok(game.names[symbol] && (game.points[symbol] > 0 || symbol === 'W'), id + symbol);
      const face = glass.token(id, symbol, game.names[symbol]).children[0];
      assert.ok(face instanceof context.Image, id + symbol);
      assert.equal(face.alt, game.names[symbol]);
      assert.match(face.src, /^data:image\/webp;base64,/);
      const webp = Buffer.from(face.src.split(',')[1], 'base64');
      assert.equal(webp.toString('ascii', 8, 12), 'WEBP');
    }
    for (const rank of ['K', 'J']) assert.ok(band.includes(rank), id + rank);
  }
  for (const [rank, value] of Object.entries(id === 'vault' ? {K:25, J:15} : {K:10, J:5})) {
    const indices = bands.map(band => band.indexOf(rank));
    for (const level of [1, 2, 3]) {
      const state = cabinet.create(id);
      state.nextLevel = level;
      let i = 0;
      assert.ok(cabinet.paidSpin(state, () => (indices[i] + 0.5) / bands[i++].length));
      cabinet.stop(state);
      cabinet.land(state);
      assert.equal(state.win, level * value);
      assert.equal(cabinet.balance(state), 500 + level * (value - 10));
    }
  }
  for (let a = 0; a < bands[0].length; a++) {
    for (let b = 0; b < bands[1].length; b++) {
      for (let c = 0; c < bands[2].length; c++) {
        const board = cabinet.boardAt(id, [a, b, c]);
        for (const column of board) assert.match(column, /^[AHLWJK]{5}$/);
        stops++;
      }
    }
  }
}
console.log(stops + ' three-reel stops fully illustrated, including the two hidden nudge positions in each column. All real symbol assets present and card awards verified at all three bets.');

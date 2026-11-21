'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const player = JSON.parse(fs.readFileSync(__dirname + '/brassline.ship.json')).player;
const scripts = new Map([...player.matchAll(/<script id="([^"]+)">([\s\S]*?)<\/script>/g)].map(match => [match[1], match[2]]));
const context = vm.createContext({
  document: {
    documentElement: {style: {setProperty() {}}},
    createElement() { return {children:[], classList:{add() {}}, append(child) {this.children.push(child);}}; }
  },
  Image: class {}
});
context.window = context;
for (const name of ['art','harbor-art','rules','glass','bonus-model']) vm.runInContext(scripts.get(name),context);
const R = context.BrasslineRules;
const G = context.ReelGlass;
const themes = vm.runInContext('BrassBonus.themes',context);
const art = context.cabinetArt;
const faces = {
  jungle: [['jaguar-idol','Jaguar idol'],['jade-frog','Jade frog'],['sun-medallion','Sun medallion']],
  pirate: [['ruby','Crimson ruby'],['doubloons','Doubloons'],['spyglass','Spyglass']],
  train: [['ticket','Express ticket'],['rail-gold','Gold bars'],['rail-lantern','Rail lantern']]
};
const unique = new Set();
for (const [game,entries] of Object.entries(faces)) {
  for (const [i,[key,name]] of entries.entries()) {
    const symbol='AHL'[i];
    const image=G.token(game,symbol,R.games[game].names[symbol]).children[0];
    assert.equal(image.alt,name);
    assert.equal(image.src,art[key]);
    assert.deepEqual(image.src.match(/^data:image\/webp;base64,/)?.length,1);
    unique.add(image.src);
  }
  assert.ok(entries.some(([key])=>key===themes[game].icon));
}
assert.equal(unique.size,9);
for (const game of Object.keys(R.games)) {
  assert.equal(G.token(game,'W').children[0].src,art[R.games[game].wild]);
  assert.equal(G.token(game,'K').children[0].src,art.king);
  assert.equal(G.token(game,'J').children[0].src,art.jack);
}
assert.equal(R.award('train',['H','H','H']),45);
console.log('PASS nine distinct illustrated faces and names, themed bonus prizes, shared rank and wild display, rail gold award.');

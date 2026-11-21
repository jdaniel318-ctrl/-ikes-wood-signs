'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm'),crypto=require('node:crypto');
const read=n=>fs.readFileSync(__dirname+'/'+n);
const host=read('fun_program.js').toString();
for(const name of ['brassline.ship.json','fleet-arcade.ship.json']){
 const bytes=read(name);
 assert.ok(host.includes(crypto.createHash('sha256').update(bytes).digest('hex')),name);
 assert.ok(bytes.length <= (name==='brassline.ship.json'?1200000:3600000));
}
const html=JSON.parse(read('brassline.ship.json')).player;
const source=id=>html.split('<script id="'+id+'">')[1].split('</script>')[0];
const ctx=vm.createContext({});for(const id of ['rules','drill-model'])vm.runInContext(source(id),ctx);
const {BrasslineRules:R,Doubletake:D}=ctx;
let seed=123;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
let sets=0;
for(const game of Object.keys(R.games))for(const mult of [1,2,3])for(let i=0;i<30;i++){
 const s=D.newSet(game,mult,random);assert.equal(s.rounds.length,3);
 let blanks=0;
 for(const [index,round] of s.rounds.entries()){
  assert.equal(s.index,index);assert.equal(s.phase,'pick');const m=R.moves(game,round.board,1);
  const high=Math.max(...m.map(move=>move.value));if(!high)blanks++;
  for(let n=0;n<=6;n++){
   const res=D.evaluate(s,round,n);assert.equal(res.value,n===6?0:m[n].value*mult);
   assert.equal(res.best,high>0?res.value===high*mult:n===6);
  }
  const pick=high?m.findIndex(move=>move.value===high):6;
  D.choose(s,-1);assert.equal(s.phase,'pick');D.choose(s,pick);D.choose(s,(pick+1)%7);
  assert.equal(round.choice,pick);assert.equal(s.phase,'reveal');assert.ok(D.wonRound(s,round));D.next(s);
 }
 assert.equal(blanks,1);assert.equal(s.phase,'summary');sets++;
}
const values=D.bonusValues(random);assert.equal(new Set(values).size,4);assert.ok(values.every(n=>[5,10,15,20,25,30].includes(n)));
const arcade=JSON.parse(read('fleet-arcade.ship.json'));assert.equal(arcade.edition,18);assert.ok(arcade.player.includes("send('arcade-brassline')"));
assert.ok(html.includes('playButtons.forEach(key=>key.onclick=advance)'));assert.ok(html.includes('default-src \'none\''));
console.log(sets+' solo sets across six themes and three multipliers. Both archive digests verified.');

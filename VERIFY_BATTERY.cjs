// Exercise the shipped cartridge through its public game and input API.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const cartridge=JSON.parse(fs.readFileSync(__dirname+'/fleet-arcade.ship.json'));
const source=[...cartridge.player.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function createNinth('));
function start(random=.55) {
  const math=Object.create(Math);math.random=()=>random;
  const env={window:{games:{}},Math:math,Image:class{}};vm.runInNewContext(source,env);
  const slug=env.window.games.sluggers;assert.equal(slug.levels[4],'Protect the Lead');
  let hud='',labels=[],end=null;
  const game=slug.create({hud:s=>hud=s,controls:items=>labels=items.map(i=>i.label),end:(...x)=>end=x,tone(){},crowd(){}},4);
  function step(seconds){for(let i=0;i<Math.round(seconds*120);i++)game.update(1/120);}
  const press=id=>game.input(id,true);
  function pitch(x,y,delay=.72) {
    game.pointer('down',x,y);press('swing');step(delay);press('swing');step(1.4);
    const call=hud;step(2.4);return call;
  }
  return {game,step,press,pitch,hud:()=>hud,labels:()=>labels,end:()=>end};
}
const a=start();assert.match(a.hud(),/Top 9.*Pilots 2, Harbor 3.*2nd/);
a.press('power');assert.match(a.labels()[1],/Changeup/);a.press('aim');assert(!a.hud().includes('Middle ·'));
const pitchSet=a.labels()[1];a.press('swing');a.press('power');assert.equal(a.labels()[1],pitchSet);
a.step(.72);a.press('swing');a.step(1.4);assert.match(a.hud(),/On target/);
console.log('PASS selection, aim, locked delivery and timed release');
const b=start();for(let i=0;i<8;i++){b.pitch(449,223);b.press('power');}
assert.match(b.hud(),/1st \+ 2nd \+ 3rd/);for(let i=0;i<4;i++)b.pitch(449,223);
assert.match(b.hud(),/Pilots 3, Harbor 3/);
console.log('PASS four wide pitches walk each batter and advance only forced runners');
const c=start();for(let i=0;i<9&&!c.end();i++){c.press('power');c.pitch(i%2?382:426,i%2?173:202);}
assert(c.end()?.[0],c.hud());assert.match(c.end()[1],/Save.*Harbor 3, Pilots 2/i);
console.log('PASS three outs protect the lead and skip the home half');
const d=start();let calls=[];for(let i=0;i<4;i++)calls.push(d.pitch(404,188));
assert(calls.some(s=>/double|single|drive/i.test(s)),calls.join(' '));assert.match(d.hud(),/Pilots [3-9], Harbor 3/);
for(let i=0;i<15&&!d.hud().startsWith('Bottom');i++){d.press('power');d.pitch(i%2?382:426,i%2?173:202);}
assert.match(d.hud(),/Bottom 9.*Pilots [3-9], Harbor 3.*0 out.*empty/);assert.equal(d.labels()[0],'Contact');
console.log('PASS hittable strikes concede runs; visitor score carries into a fresh home half');
let bottomScore=d.hud().match(/Pilots (\d+)/)[1];
for(let n=0;n<65&&!d.end();n++)d.step(1);
assert(d.end()&&!d.end()[0],d.hud());assert.match(d.end()[1],new RegExp('Pilots '+bottomScore+'\\.'));
const e=start();e.pitch(404,188);e.pitch(404,188); // Two doubles bring in the tying and go-ahead runs.
for(let n=0;n<18&&!e.hud().startsWith('Bottom');n++){e.press('power');e.pitch(n%2?382:426,n%2?173:202);}
assert.match(e.hud(),/Bottom 9/);
for(let frame=0;frame<18000&&!e.end();frame++){
  // Read what the real renderer presents as the ball approaches the plate.
  const arcs=[];const gradients=()=>({addColorStop(){}});
  const ctx=new Proxy({measureText:t=>({width:t.length*4}),createLinearGradient:gradients,createRadialGradient:gradients,
    arc(x,y,r){arcs.push({x,y,r})}}, {get:(o,k)=>k in o?o[k]:()=>{}});
  e.game.draw(ctx);
  if(arcs.some(p=>Math.abs(p.x-240)<20&&p.y>164&&p.y<191&&p.r>6.4&&p.r<7.6))e.press('power');
  e.step(1/60);
}
assert(e.end()?.[0],e.hud());assert.match(e.end()[1],/Walk-off win/);
console.log('PASS played home half ends both on losses and on a walk-off against carried runs');
const f=start();f.press('swing');f.step(.23);f.press('swing');f.step(2.85);assert.match(f.hud(),/Early release|Fastball/);
const g=start();g.press('swing');g.step(1.13);assert.match(g.labels()[0],/Pitch away/);g.step(5);assert.equal(g.labels()[0],'Start pitch');
console.log('PASS missed release auto-completes; new pitch requires a fresh input');

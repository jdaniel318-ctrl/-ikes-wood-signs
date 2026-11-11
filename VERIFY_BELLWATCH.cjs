// Run the shipped puzzle public methods with a fresh game and synthetic controls per scenario.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = process.argv[2] || __dirname;
const pack = JSON.parse(fs.readFileSync(path.join(root, 'fleet-arcade.ship.json')));
const script = pack.player.match(/<script>([\s\S]*?)<\/script>/)[1];
const context = {window:{}, Image:class {}};
vm.runInNewContext(script
  .replace('window.games.pipeworks=', 'window.boards=boards;window.games.pipeworks=')
  .replace('window.games.dockmaster=', 'window.shifts=shifts;window.games.dockmaster='), context);
function run(id,level) {
  let hud='',film=null,end=null,awards=0,enabled=false;
  const game=context.window.games[id].create({
    hud:v=>hud=v,tone(){},end:(...v)=>{awards++;end=v;},
    replay:v=>film=v,hideReplay:()=>{film=null;},
    controls(items){for(const item of items)if(item.id==='undo')enabled=!item.disabled;}
  },level);
  function advance(seconds=5){for(let i=0;i<Math.round(60*seconds);i++)game.update(1/60);}
  return {game,advance,act:id=>game.input(id,true),hud:()=>hud,film:()=>film,end:()=>end,awards:()=>awards,enabled:()=>enabled};
}
const rotate=m=>((m<<1)&15)|(m>>3);
function solvePipes(b) {
  const w=b.rows[0].length,cells=b.rows.flat(),answer=[];
  function place(i) {
    if(i===cells.length)return true;
    const r=Math.floor(i/w),c=i%w;
    let m=cells[i];
    for(let turns=0;turns<4;turns++,m=rotate(m)) {
      if(!!(m&1)!==(r>0&&!!(answer[i-w].m&4)))continue;
      if(!!(m&8)!==(c>0?!!(answer[i-1].m&2):r===b.inlet))continue;
      if(r===b.rows.length-1&&(m&4))continue;
      if(c===w-1&&!!(m&2)!==b.outlets.includes(r))continue;
      answer[i]={m,turns};if(place(i+1))return true;
    }
    return false;
  }
  assert(place(0));return answer;
}
for(const [level,b] of context.window.boards.entries()) {
  const sol=solvePipes(b), w=b.rows[0].length;
  function complete(withUndo){
    const a=run('pipeworks',level);
    const turn=i=>a.game.pointer('down',b.x+((i%w)+.5)*b.s,b.y+(Math.floor(i/w)+.5)*b.s);
    assert(!a.enabled());a.act('undo');
    if(withUndo){
      const cell=b.rows.flat().findIndex(Boolean);
      turn(cell);assert(a.enabled());a.act('test');a.advance(.1);a.act('undo');assert(!a.enabled());
      assert.match(a.hud(),/Turn undone/);a.advance(5);assert.match(a.hud(),/Turn undone/);
    }
    for(const [i,step] of sol.entries())for(let n=0;n<step.turns;n++)turn(i);
    a.act('test');a.advance(8);assert(a.end()?.[0]);assert.equal(a.awards(),1);
    return a.end()[2];
  }
  assert.equal(complete(false)-complete(true),25,'undo restores the board and keeps the charge for one extra water test');
}
const pipe=run('pipeworks',0);
pipe.act('test');pipe.advance();assert.match(pipe.hud(),/First leak (at row \d+, column \d+|at the inlet)/);
for(let i=0;i<70;i++)pipe.act('rotate');for(let i=0;i<64;i++)pipe.act('undo');assert(!pipe.enabled());
console.log('PASS all three water boards, leak coordinates, bounded independent undo and existing score rules');
function solveShift(s){
 const queue=[{b:1,i:0,j:0,open:s.open,route:[]}],seen=new Set();
 for(const a of queue){
   if(a.i===s.boats.length&&a.j===s.carts.length)return a.route;
   const key=[a.b,a.i,a.j,a.open].join();if(seen.has(key))continue;seen.add(key);
   for(const kind of ['boat','cart','bridge','wait']){
     const b={...a,route:[...a.route,kind]};
     const cargo=kind==='boat'?s.boats[b.i]:kind==='cart'?s.carts[b.j]:null;
     if(['boat','cart'].includes(kind)){
       if(!cargo||(kind==='boat')!==b.open||(cargo[3]&&!s.tide[(b.b-1)%s.tide.length]))continue;
       if(kind==='boat')b.i++;else b.j++;
     }
     if(kind==='bridge')b.open=!b.open;
     b.b+=cargo?.[2]||1;
     if([cargo,s.boats[b.i],s.carts[b.j]].some(x=>x&&x[1]<b.b-1))continue;
     if([s.boats[b.i],s.carts[b.j]].some(x=>x&&x[1]<b.b))continue;
     queue.push(b);
   }
 }
 throw Error('no route');
}
function drawFrame(film,t) {
  const labels=[], grad={addColorStop(){}};
  const c=new Proxy({fillText:a=>labels.push(a),createLinearGradient:()=>grad,createRadialGradient:()=>grad,measureText:s=>({width:s.length*6})},{get:(o,k)=>o[k]||(()=>{})});
  film.draw(c,t);return labels;
}
for(const [level,s] of context.window.shifts.entries()) {
  const route=solveShift(s);
  function play(review){
    const a=run('dockmaster',level);let firstFilm,firstLabels,twoBells=false;
    for(const id of route){
      a.act(id);assert.equal(a.film(),null);a.advance(2);
      if(!['boat','cart'].includes(id))continue;
      const f=a.film();assert.equal(f.label,'Replay crossing');const h=a.hud();
      if(review) {
        for(const t of [0,.25,f.duration]){const labels=drawFrame(f,t);assert(labels.some(v=>v.includes('Due by bell')));if(labels.some(v=>v.startsWith('Bells ')))twoBells=true;}
        assert.equal(a.hud(),h);
        if(!firstFilm){firstFilm=f;firstLabels=drawFrame(f,f.duration);}
      }
    }
    if(review){assert.deepEqual(drawFrame(firstFilm,firstFilm.duration),firstLabels);if(level>0)assert(twoBells);}
    assert(a.end()?.[0]);assert.equal(a.awards(),1);return a.end()[2];
  }
  assert.equal(play(true),play(false));
}
const d=run('dockmaster',0);d.act('boat');d.advance();assert.equal(d.film(),null);
d.act('cart');d.advance();const last=d.film();d.act('boat');assert.equal(d.film(),last);
d.act('bridge');assert.equal(d.film(),null);
console.log('PASS all three harbor shifts, boat/cart replay, no additional bell or score, invalid action preserves last crossing');

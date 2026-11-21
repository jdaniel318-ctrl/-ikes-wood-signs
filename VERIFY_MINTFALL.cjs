'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const doc=JSON.parse(fs.readFileSync(__dirname+'/brassline.ship.json')).player,ctx=vm.createContext({});
for(const [,id,source] of doc.matchAll(/<script id="([^"]+)">([\s\S]*?)<\/script>/g)){
  const code=new vm.Script(source);
  if(['rules','cabinet-model','bonus-model'].includes(id))code.runInContext(ctx);
}
const C=ctx.ReelCabinet,R=ctx.BrasslineRules,B=vm.runInContext('BrassBonus',ctx);
for(const id of Object.keys(R.games)){
  const strips=C.stripsFor(id), buckets={empty:0,nudge:0,landed:0}, first={};
  for(let a=0;a<strips[0].length;a++)for(let b=0;b<strips[1].length;b++)for(let c=0;c<strips[2].length;c++){
    const stops=[a,b,c],board=C.boardAt(id,stops);
    const category=R.award(id,R.line(board))?'landed':R.moves(id,board).some(m=>m.value)?'nudge':'empty';
    buckets[category]++;first[category]??=stops;
  }
  console.log(id,JSON.stringify(buckets));
  for(const [type,stops] of Object.entries(first)){
    const s=C.create(id);let i=0;C.spin(s,()=>{const j=i++;return (stops[j]+.5)/strips[j].length;});assert.equal(i,3);
    assert.deepEqual([...s.stops],stops);C.stop(s);C.land(s);assert.equal(s.outcome||s.phase,type);
  }
  assert.deepEqual(Object.keys(first).sort(),['empty','landed','nudge']);
}
function win(s,spin=1){Object.assign(s,{phase:'settled',outcome:'nudged',win:25,spins:spin});}
const pig=C.create('vault'),pirate=C.create('pirate');win(pig);
assert.ok(B.earn(pig));assert.ok(!B.earn(pig));assert.ok(!B.ready(pirate));
const b=B.begin('mint',pig);
for(let n=0;n<3;n++){assert.ok(B.wave(b));assert.ok(B.take(b,b.sequence.indexOf(25)));assert.ok(!B.take(b,2));}
assert.ok(B.finish(b));assert.equal(pig.score,75);assert.ok(!B.finish(b));assert.equal(pig.keys,0);assert.ok(!B.ready(pig));assert.ok(!B.earn(pig));
const test=B.begin('signal',pirate);
for(let n=0;n<3;n++){B.wave(test,()=>0);test.phase='choose';if(n===0)B.take(test,2);else for(const i of test.sequence)B.take(test,i);}
assert.ok(B.finish(test));assert.equal(test.points,75);assert.equal(pirate.score,0);
win(pirate);assert.ok(B.earn(pirate));const p=B.begin('signal',pirate);B.wave(p);assert.ok(B.ready(pirate));assert.ok(!B.finish(p));
assert.ok(!B.earn(C.create('harbor')));console.log('Mintfall awards, exhibition isolation, abandoned rounds, exhaustion and independent reel stops passed.');

{
const h=doc;const script=id=>h.split('<script id="'+id+'">')[1].split('</script>')[0];
function node(){return {children:[],classList:{add(){},remove(){}},setAttribute(){},style:{},data:{},
  append(x){this.children.push(x)},replaceChildren(...x){this.children=x},
  animate(frames,opts){this.frames=frames;this.opts=opts;return {cancel(){}}}};}
const ctx=vm.createContext({matchMedia:()=>({matches:false}),document:{createElement:node},DOMMatrixReadOnly:class{constructor(v){this.m42=v}},getComputedStyle:n=>({transform:n.y})});
vm.runInContext(script('rules')+script('cabinet-model'),ctx);
const M=vm.runInContext(script('reel-motion')+'\nBrassMotion',ctx);let cases=0;
for(const id of Object.keys(ctx.BrasslineRules.games))for(let i=0;i<3;i++){
 const band=ctx.ReelCabinet.stripsFor(id)[i],n=band.length;
 for(let a=0;a<n;a+=3)for(let b=0;b<n;b++)for(const pos of [.06,7.77,n-.05]){
  const strip=node(),col=node();col.children=[{getBoundingClientRect:()=>({height:100})}];col.querySelector=()=>strip;
  const prev=[0,0,0],dest=[0,0,0];prev[i]=a;dest[i]=b;const win=ctx.ReelCabinet.boardAt(id,prev)[i].slice(1,4),last=ctx.ReelCabinet.boardAt(id,dest)[i].slice(1,4);
  M.roll(col,i,id,win,(_,x)=>x,band,a);const initial=strip.children.map(t=>t.children[0]).join('');
  strip.y=-pos*100;M.dock(col,i,id,last,(_,x)=>x,b);
  const track=strip.children.map(t=>t.children[0]).join('');
  const ix=f=>-parseFloat(f.transform.split('calc(')[1]);const x=ix(strip.frames[0]),end=ix(strip.frames.at(-1));
  assert.equal(track.slice(Math.floor(x),Math.floor(x)+3),initial.slice(Math.floor(pos),Math.floor(pos)+3));
  assert.equal(track.slice(end,end+3),last);assert.ok(x>end);cases++;
 }
}
console.log('Physical reel starts, wraparound continuity, actual stop symbols:',cases);

}

'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=JSON.parse(fs.readFileSync(__dirname+'/brassline.ship.json')).player;
const section=id=>html.split('<script id="'+id+'">')[1].split('</script>')[0];
function element(){
  const flags=new Set();
  return {children:[],classList:{add:(...items)=>items.forEach(i=>flags.add(i)),remove:(...items)=>items.forEach(i=>flags.delete(i)),contains:i=>flags.has(i)},
    style:{},append(...nodes){this.children.push(...nodes);}};
}
let now=0,serial=0;
const queue=new Map(),pref={matches:false};
const env=vm.createContext({
  document:{createElement:element},matchMedia:()=>pref,performance:{now:()=>now},
  requestAnimationFrame:f=>{queue.set(++serial,f);return serial;},cancelAnimationFrame:id=>queue.delete(id)
});
vm.runInContext(section('rules')+section('cabinet-model'),env);
const M=vm.runInContext(section('reel-motion')+'\nBrassMotion',env),C=env.ReelCabinet;
const mod=(x,n)=>(x%n+n)%n;
function tick(at){now=at;const all=[...queue.values()];queue.clear();all.forEach(f=>f(now));}
function col(){
  const c=element(),window=element(),old=element();
  c.querySelector=s=>s==='.drum-window'?window:old;
  return {c,window};
}
function visible(ring){
  assert.equal(ring.children.length,4);
  return ring.children.map(cell=>{
    const active=cell.children.filter(s=>!s.hidden);
    assert.equal(active.length,1);
    const row=Number(cell.style.transform.match(/0,([-0-9.e+]+)%/i)[1])/100;
    return {row,s:active[0].symbol};
  }).sort((a,b)=>a.row-b.row);
}
function coverage(view){
  assert.ok(view[0].row<=.000001 && view[0].row> -1.000001);
  assert.ok(view.at(-1).row+1>=2.999999);
  for(let j=1;j<4;j++)assert.ok(Math.abs(view[j].row-view[j-1].row-1)<.000001);
}
let paths=0,frames=0;
for(const id of Object.keys(env.BrasslineRules.games))for(let i=0;i<3;i++){
  const band=C.stripsFor(id)[i],n=band.length,{c,window}=col();let faces=0;
  function token(_,symbol){faces++;return {symbol};}
  const duration=[490,665,845][i];
  M.prepare(c,id,band,token);const initial=faces;
  for(let a=0;a<n;a+=3)for(let b=0;b<n;b++)for(const turnTime of [0,482,2103]){
    now=0;const at=center=>[-1,0,1].map(k=>band[mod(center+k,n)]).join('');
    M.roll(c,i,id,at(a),token,band,a);
    assert.equal(visible(window).slice(0,3).map(r=>r.s).join(''),at(a));
    tick(turnTime);const before=visible(window);M.dock(c,i,id,at(b),token,b);
    assert.deepEqual(visible(window),before);
    for(const offset of [0,16,82,239,duration-70,duration,duration+16]){
      tick(turnTime+offset);const v=visible(window);coverage(v);frames++;
    }
    assert.equal(visible(window).slice(0,3).map(r=>r.s).join(''),at(b));
    assert.equal(initial,faces);M.cancel(c);assert.equal(queue.size,0);paths++;
  }
  pref.matches=true;M.roll(c,i,id,'AAA',token,band,0);assert.equal(queue.size,0);pref.matches=false;
}
console.log(paths+' stops, '+frames+' frame samples, all reel windows covered and stop symbols correct. Zero new faces were allocated while turning or braking.');

"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const root=__dirname,cart=JSON.parse(fs.readFileSync(root+"/brassline.ship.json")),html=cart.player;
const source=id=>html.split('<script id="'+id+'">')[1].split("</script>")[0];
assert.equal(cart.levels,6);assert.equal(cart.edition,12);
assert.equal(source("practice-circuit"),fs.readFileSync(root+"/fleet_practice_circuit.js","utf8"));
const ctx=vm.createContext({});
for(const id of ["rules","practice-circuit","circuit-model"])vm.runInContext(source(id),ctx);
const {Crossreel:X,FleetPracticeCircuit:F,BrasslineRules:R}=ctx;
const registry=JSON.parse(fs.readFileSync(root+"/FLEET_LEARNING_REGISTRY.json"));assert.ok(registry.learnings.some(item=>item.id==="cross-context-practice"));
assert.equal(R.award("harbor",["A","W","A"]),0);assert.equal(R.award("harbor",["A","A","A"]),80);
assert.equal(R.award("harbor",["W","W","W"]),35);assert.equal(R.award("harbor",["W","H","H"]),20);
let seed=62;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
let boards=0;
for(const station of X.stations){
  assert.notEqual(station.context,station.alternate);
  for(const id of [station.context,station.alternate]){
    const seen=new Set();
    for(let k=0;k<64;k++){
      const r=X.makeRound({skill:station.skill,context:id},random),moves=R.moves(id,r.board),top=Math.max(...moves.map(m=>m.value));
      seen.add(r.board.join("-"));assert.equal(r.phase,"ready");assert.equal(X.grade(r,0),undefined);
      r.phase="read";
      const best=moves.filter(m=>m.value===top);
      if(station.skill!=="lines" && station.skill!=="empty")assert.equal(R.award(id,R.line(r.board)),0,station.skill);
      if(station.skill==="empty" && !R.award(id,R.line(r.board)))assert.equal(top,0);
      if(station.skill==="compare")assert.ok(new Set(moves.filter(m=>m.value).map(m=>m.value)).size>1);
      if(station.skill==="raise"||station.skill==="lower"){assert.ok(top>0);assert.equal(best.length,1);assert.equal(best[0].dir,station.skill==="raise"?"up":"down");}
      if(station.skill==="wild"){assert.ok(top>0);assert.ok(best.every(m=>R.line(r.board,m).includes("W")));}
      if(station.skill==="exception"){
        if(id==="harbor"){assert.equal(top,20);assert.ok(moves.some(m=>R.line(r.board,m).sort().join("")==="AAW"&&m.value===0));}
        else {assert.equal(top,45);assert.ok(moves.some(m=>m.value===30));}
      }
      const count=X.trace(id,r.board).filter(l=>l.value).length;
      if(station.skill==="lines")assert.ok(count>=1&&count<=4);
      const options=station.skill==="empty"?["empty","landed","wild"]:station.skill==="lines"?[0,1,2,3,4,5]:[0,1,2,3,4,5,null];
      for(const pick of options){
        const copy={...r};const result=X.grade(copy,pick);
        assert.equal(result.correct,station.skill==="empty"?pick===(R.award(id,R.line(r.board))?"landed":"empty"):station.skill==="lines"?pick===count:pick!==null&&moves[pick].value===top);
        assert.equal(copy.phase,"review");assert.equal(X.grade(copy,pick),undefined);
      }
      boards++;
    }
    assert.ok(seen.size>1,station.skill+id);
  }
}
for(const mode of ["perfect","miss","assist"]){
 const run=X.start();
 while(F.current(run)){
  const {index,transfer}=run;F.next(run);assert.equal(run.index,index);
  F.record(run,transfer || mode!=="miss",!transfer&&mode==="assist");const length=run.results.length;
  F.record(run,true);assert.equal(run.results.length,length);F.next(run);
 }
 const s=F.summary(run);assert.equal(s.total,7);assert.equal(s.first,mode==="perfect"?7:0);
 assert.equal(s.transferCorrect,mode==="perfect"?0:7);assert.equal(s.transferCorrect,s.transferTotal);
}
console.log(boards+" boards verified across seven skills. All choices, cabinet exceptions, line counts, hints and transfer scoring checked.");

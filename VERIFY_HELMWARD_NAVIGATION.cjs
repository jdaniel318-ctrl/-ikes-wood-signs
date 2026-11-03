'use strict';
// Executes the production selection controller; DOM doubles cover only browser primitives.
const fs=require('fs'),vm=require('vm'),a=require('assert/strict');
const source=fs.readFileSync(require('path').join(__dirname,'app.js'),'utf8');
function fn(name){const start=source.indexOf('  function '+name+'(');a.ok(start>=0,'Missing production function '+name);const end=source.indexOf('\n  }',start);return source.slice(start,end+4);}
function harness(){
 const classes=()=>{const s=new Set();return {add:(...v)=>v.forEach(x=>s.add(x)),remove:(...v)=>v.forEach(x=>s.delete(x)),contains:x=>s.has(x),toggle:(x,on)=>on?s.add(x):s.delete(x)}};
 const el=(id)=>({id,hidden:false,dataset:{},textContent:'',classList:classes(),setAttribute(){},focus(){ctx.focus=id},querySelector(){return null}});
 const elements=Object.fromEntries(['fleetCommissioningDock','fleetCommissioningFleet','fleetWorkstationBack','fleetWorkstationTitle','fleetWorkstationHint','fleetDockSearch'].map(id=>[id,el(id)]));
 const cards=['ike','legacy'].map(id=>{const e=el(id);e.dataset.projectId=id;const select=el('select-'+id),title=el('title-'+id);title.textContent=id==='ike'?'Ike’s Wood Signs':'Legacy Plumbing';e.querySelector=s=>s==='[data-fleet-select]'?select:s==='.wayfinder-vessel-name'?title:el('test-'+id);return e});
 elements.fleetCommissioningFleet.querySelectorAll=()=>cards;elements.fleetCommissioningFleet.getAttribute=()=>null;
 const body=el('body');body.classList.add('engine-mode');
 const ctx={document:{body},$:id=>elements[id],engineSessionUnlocked:true,experienceTestDeckRequest:0,fleetWorkstationProjectId:'',window:{scrollTo(v){ctx.scroll=v.top}},requestAnimationFrame:f=>f(),engineWorkspaceNavigationToken:()=>({}),engineWorkspaceNavigationCurrent:()=>ctx.engineSessionUnlocked,console};
 vm.createContext(ctx);vm.runInContext(fn('setFleetWorkstationView'),ctx);return {ctx,elements,cards};
}
let h=harness();a.equal(h.ctx.setFleetWorkstationView('ike'),true);a.equal(h.cards[0].hidden,false);a.equal(h.cards[1].hidden,true);a.equal(h.ctx.fleetWorkstationProjectId,'ike');a.equal(h.elements.fleetWorkstationBack.hidden,false);a.equal(h.ctx.scroll,0);a.ok(h.ctx.experienceTestDeckRequest>0,'Explicit vessel selection cancels pending test opens');
h.ctx.setFleetWorkstationView('legacy');a.equal(h.cards[0].hidden,true);a.equal(h.cards[1].hidden,false);a.equal(h.elements.fleetWorkstationTitle.textContent,'Legacy Plumbing');
a.equal(h.ctx.setFleetWorkstationView('missing'),false);a.equal(h.ctx.fleetWorkstationProjectId,'legacy');
h.ctx.setFleetWorkstationView('');a.ok(h.cards.every(c=>!c.hidden));a.equal(h.elements.fleetWorkstationBack.hidden,true);a.equal(h.ctx.focus,'select-legacy');
h.ctx.engineSessionUnlocked=false;a.equal(h.ctx.setFleetWorkstationView('ike'),false);a.equal(h.ctx.fleetWorkstationProjectId,'');
h=harness();h.ctx.document.body.classList.add('boot-locked');a.equal(h.ctx.setFleetWorkstationView('ike'),false);
h=harness();h.elements.fleetCommissioningFleet.getAttribute=()=> 'true';a.equal(h.ctx.setFleetWorkstationView('ike'),false);
console.log('PASS vessel selection, isolation, return focus, unknown ID, locked access and busy-render guard');

'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.join(process.argv[2]||__dirname,'app.js'),'utf8');
const start=source.indexOf('  function bindHouseHullFieldStation(p){');
const end=source.indexOf('\n  async function renderProjectControlOverview',start);
assert(start>=0&&end>start);
function run(mode){let saved='',writes=0;const nodes={hhFieldSave:{textContent:'SAVE FIELD DRAFT',addEventListener(_,f){this.click=f;}},hhFieldCalculate:{addEventListener(){}},hhFieldJob:{value:'Example job'},hhFieldMaterial:{value:'Vinyl siding'},hhFieldWaste:{value:'10'},hhWindows:{value:'2'},hhDoors:{value:'1'},hhTrim:{value:'J-channel'},hhTakeoffArea:{textContent:''}};const storage={setItem(k,v){writes++;if(mode==='quota')throw Error('QuotaExceededError');saved=v;},getItem(){return mode==='mismatch'?'':saved;}};const ctx={document:{getElementById:k=>nodes[k]||null,querySelectorAll:()=>[]},localStorage:storage,houseHullFieldKey:()=> 'synthetic',setTimeout(){},Date,Number};vm.createContext(ctx);vm.runInContext(source.slice(start,end)+'\nbindHouseHullFieldStation({id:"synthetic"});',ctx);nodes.hhFieldSave.click();return {nodes,writes,saved};}
for(const mode of ['quota','mismatch']){const r=run(mode);assert.equal(r.nodes.hhFieldSave.textContent,'FIELD DRAFT NOT SAVED');assert.match(r.nodes.hhTakeoffArea.textContent,/Save failed/);assert.equal(r.nodes.hhFieldJob.value,'Example job');}
const ok=run('success');assert.equal(ok.nodes.hhFieldSave.textContent,'FIELD DRAFT SAVED');assert.equal(JSON.parse(ok.saved).job,'Example job');assert.equal(ok.writes,1);
console.log(JSON.stringify({pass:true,checks:3,scope:'Actual HouseHull field handler: quota/readback failure is not saved; verified success preserves entry.'}));

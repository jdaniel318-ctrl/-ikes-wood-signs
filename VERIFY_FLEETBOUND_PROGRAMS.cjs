'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(process.argv[2]||__dirname),source=fs.readFileSync(path.join(root,'captain.js'),'utf8');
const start=source.indexOf("  const $=id=>document.getElementById(id),safe="),end=source.indexOf('\n  install();',start);
assert(start>0&&end>start,'read-only watch module is locatable');
const nodes=new Map();
function node(id) {
  if(nodes.has(id))return nodes.get(id);
  const classes=new Set();
  const element={innerHTML:'',textContent:'',dataset:{},options:[],
    classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c),
      toggle(c,force){if(force)classes.add(c);else classes.delete(c);}},
    querySelector(selector){return node(id+'/'+selector);},
    querySelectorAll(selector){
      if(selector!=='[data-watch-vessel]')return [];
      const markup=node('watchRows').innerHTML+node('watchPrograms').innerHTML;
      return [...markup.matchAll(/data-watch-vessel="([^"]+)"/g)].map(match=>{
        const button=node('vessel/'+match[1]);button.dataset.watchVessel=match[1];return button;});
    },
    closest(){return node('watchWorkspace');},getBoundingClientRect(){return {top:20,height:24,bottom:44};},
    replaceChildren(){this.innerHTML='';this.textContent='';},setAttribute(){},focus(){}};
  nodes.set(id,element);
  return element;
}
const ctx={admiralVesselLogos:new Map(),document:{getElementById:node,querySelectorAll:()=>[],body:node('body')},window:{},requestAnimationFrame:f=>f(),console};vm.createContext(ctx);
vm.runInContext(source.slice(start,end)+'\nlastSync="2026-11-10T06:00:00Z";globalThis.api={render,overview,failWatch,setSecurityLayer,state:()=>({records,programs})};',ctx);
const data=[...Array.from({length:6},(_,i)=>({project_id:'core-'+i,display_name:'Core '+i,mission_class:'independent_business',lifecycle_state:'staging'})),{project_id:'wonderwake',display_name:'Wonderwake',mission_class:'admiral_program',lifecycle_state:'active',operating_model:'fleet_operated',ownership_model:'admiral_owned'}];
let count=0;function check(name,fn){fn();console.log('PASS',name);count++;}
check('server program remains separate from six core vessels',()=>{ctx.api.render(data);assert.equal(ctx.api.state().records.length,6);assert.equal(ctx.api.state().programs.length,1);assert.match(node('watchPrograms').innerHTML,/Wonderwake/);assert.doesNotMatch(node('watchRows').innerHTML,/Wonderwake/);});
check('only a registered active Wonderwake receives the known local launcher',()=>{
  const last=data[data.length-1];
  for(const [patch,expected] of [[{},true],[{lifecycle_state:'suspended'},false],[{reference_only:true},false],[{project_id:'another-school'},false],[{mission_class:'independent_business'},false]]){
    ctx.api.render([{...last,...patch}]);
    assert.equal(node('watchPrograms').innerHTML.includes('id="watchWonderwakeOpen"'),expected);
  }
  ctx.api.render(data);
  assert.match(node('watchPrograms').innerHTML,/data-open-lantern aria-controls="lantern-harbor"/);
  assert.match(node('watchPrograms').innerHTML,/data-watch-vessel="wonderwake"/);
});
check('filter/search rerender retains server programs',()=>{ctx.api.render();ctx.api.render();assert.equal(ctx.api.state().programs.length,1);assert.match(node('watchPrograms').innerHTML,/Wonderwake/);});
check('existing Bootstrap reference remains explicitly a reference',()=>{assert.match(node('watchPrograms').innerHTML,/Bootstrap Build/);assert.match(node('watchPrograms').innerHTML,/Local program/);assert.match(node('watchStatus').textContent,/1 registered program/);});
check('program overview does not present business operating controls',()=>{ctx.api.overview('wonderwake');assert.match(node('watchOverviewBody').innerHTML,/Wonderwake/);assert.match(node('watchOverviewBody').innerHTML,/SEPARATE PROGRAM/);assert.doesNotMatch(node('watchOverviewBody').innerHTML,/OPERATE AS FLEET CAPTAIN/);});
check('business overview retains existing boundary',()=>{ctx.api.overview('core-0');assert.match(node('watchOverviewBody').innerHTML,/OPERATE AS FLEET CAPTAIN — NOT ENABLED/);});
check('failed refresh discards previously read programs',()=>{ctx.api.failWatch('Unavailable');assert.equal(ctx.api.state().programs.length,0);assert.doesNotMatch(node('watchPrograms').innerHTML,/Wonderwake/);});
check('locked workspace discards previously read program state',()=>{ctx.api.render(data);ctx.api.setSecurityLayer(false);assert.equal(ctx.api.state().programs.length,0);assert.equal(ctx.api.state().records.length,0);});
check('branding update includes both program and business records',()=>{const a=source.indexOf("window.addEventListener('darksky:admiral-fleet-updated'"),b=source.indexOf("\n  document.addEventListener(",a);assert(a>=0&&b>a,'branding listener is locatable');const listener=source.slice(a,b);let handler;ctx.window.addEventListener=(_name,fn)=>handler=fn;node('bootstrapFleet').classList.contains=()=>false;ctx.api.render(data);vm.runInContext(listener,ctx);handler({detail:{records:[{project_id:'wonderwake',logo_url:'wonderwake-public.png'}]}});assert.equal(ctx.api.state().programs.length,1);assert.equal(ctx.api.state().programs[0].logo_url,'wonderwake-public.png');assert.match(node('watchPrograms').innerHTML,/Wonderwake/);});
console.log(count+' Fleetbound program checks passed');

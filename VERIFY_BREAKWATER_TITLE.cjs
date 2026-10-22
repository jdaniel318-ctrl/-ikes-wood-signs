'use strict';
// Execute the actual title builder with the real mission core. A minimal panel
// boundary captures its output; compiled DOM/layout are checked by the host suite.
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(process.argv[2]||__dirname),S=require(path.join(root,'stormwake_core.js'));
const source=fs.readFileSync(path.join(root,'stormwake_game.js'),'utf8'),start=source.indexOf('function title(){'),end=source.indexOf('\nfunction pause(',start);
a.ok(start>=0&&end>start,'Could not locate the actual title builder');
function render(state){
  const nodes=new Map(),panelStyle={},observed={resumes:0,toast:null};let html='';
  const $=id=>{if(!nodes.has(id))nodes.set(id,{hidden:true});return nodes.get(id);};
  $('swModal').querySelector=selector=>{a.equal(selector,'.panel');return{style:panelStyle};};
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  vm.runInNewContext(source.slice(start,end)+'\ntitle();',{state,S,$,escape,panel:(kind,value)=>{a.equal(kind,'title');html=value;},resume:()=>observed.resumes++,toast:message=>observed.toast=message,openLegacy:()=>{},settings:()=>{}});
  return{html,nodes,panelStyle,observed};
}
function completed(checkpoint){
  const s=S.fresh(),event=e=>a.equal(S.event(s,e).ok,true);
  event({type:'talk'});for(const id of S.PARTS)event({type:'collect',id});event({type:'weight',delta:3});event({type:'balance'});event({type:'rescue'});event({type:'finish'});event({type:'checkpoint',id:checkpoint});return s;
}
test('completed title describes the recovered crew and the actual saved dock',()=>{
  for(const [checkpoint,dock]of [['lighthouse','Lighthouse landing'],['pier','Loading pier']]){
    const s=completed(checkpoint),before=S.serialize(s),r=render(s);
    a.match(r.html,/id="swVoyageObjective">Crew home · channel reopened</);a.ok(r.html.includes('Safe return: '+dock));a.ok(r.html.includes('THE BROKEN PASSAGE · 06 / 06'));
    a.ok(r.html.includes('The chartmaker is home. Explore the harbor or open your journal.'));a.doesNotMatch(r.html,/Our chartmaker is stranded beyond it/);a.ok(r.html.includes('Resume the harbor →'));a.equal(S.serialize(s),before);
  }
});
test('fresh title gives the first objective and Arrival quay without claiming a file was saved',()=>{
  const s=S.fresh(),before=S.serialize(s),r=render(s);a.ok(r.html.includes('Meet Bootstrap by the pier'));a.ok(r.html.includes('Safe return: Arrival quay'));a.ok(r.html.includes('THE BROKEN PASSAGE · 01 / 06'));a.ok(r.html.includes('Enter the harbor →'));a.doesNotMatch(r.html,/Saved voyage/);a.equal(S.serialize(s),before);
});
test('title contains scrollable controls and only enters play after the existing start action',()=>{
  const s=completed('pier'),before=S.serialize(s),r=render(s);a.equal(r.observed.resumes,0);a.equal(r.panelStyle.overflow,'auto');a.equal(typeof r.nodes.get('swOriginal').onclick,'function');a.equal(typeof r.nodes.get('swTitleSettings').onclick,'function');
  r.nodes.get('swStart').onclick();a.equal(r.observed.resumes,1);a.equal(r.nodes.get('swHud').hidden,false);a.equal(r.observed.toast,'Welcome back. Your last safe checkpoint is ready.');a.equal(S.serialize(s),before);
});

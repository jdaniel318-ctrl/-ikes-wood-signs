/* Shared arcade shell only. No saved account, network or browser storage. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const p=JSON.parse(fs.readFileSync(__dirname+'/fleet-arcade.ship.json')).player;
function section(start,end){const a=p.indexOf(start),b=p.indexOf(end,a);assert(a>=0&&b>a,'Missing shared menu behavior: '+start);return p.slice(a,b);}
const progress=section('  function gameProgress(', '  function shelf()');
const a={catalog:{one:{levels:['First','Second','Third']},two:{levels:['Other']}},records:{}};
vm.runInNewContext(progress+';this.progress=gameProgress',a);
assert.equal(a.progress('one').cleared,0);assert.equal(a.progress('one').next,0);
a.records={'one.0':{clear:true,best:25},'one.2':{clear:true,best:99},'two.0':{clear:true,best:999}};
const before=JSON.stringify(a.records);
assert.equal(a.progress('one').cleared,2);assert.equal(a.progress('one').next,1);assert.equal(a.progress('one').total,3);
assert.equal(a.progress('two').next,-1);assert.equal(a.progress('two').cleared,1);
assert.equal(JSON.stringify(a.records),before,'Reading progress must not change saves');
a.records['one.1']={clear:false,best:4};assert.equal(a.progress('one').next,1);
a.records['one.1'].clear=true;assert.equal(a.progress('one').next,-1);
const nodes=Array.from({length:7},(_,i)=>({dataset:{game:String(i)},getBoundingClientRect:()=>({left:(i%3)*110,top:Math.floor(i/3)*90,width:100})}));
const rows={};vm.runInNewContext(section('  function shelfRow(', '  function padMenu(')+';this.row=shelfRow',rows);
assert.equal(rows.row(nodes,1,1),4);assert.equal(rows.row(nodes,4,-1),1);assert.equal(rows.row(nodes,5,1),6);assert.equal(rows.row(nodes,0,-1),0);
let focus=null,marked=0,back=0,started=0;
const levels=Array.from({length:3},(_,i)=>({focus(){focus=i},scrollIntoView(){}}));
for(const [i,n] of nodes.entries()){n.focus=()=>focus=i;n.scrollIntoView=()=>{};}
const lantern={...nodes[6],dataset:{game:'lantern'},focus(){focus='lantern'}};
const elements={gallery:{children:[...nodes,lantern]},lantern,levels:{children:levels},'play':{click(){started++}},'game-name':{},'back-shelf':{click(){back++}}};
const nav={state:'shelf',selected:'0',level:0,document:{activeElement:nodes[0]},byId:id=>elements[id],shelfRow:rows.row,markLevel(){marked++}};
vm.runInNewContext(section('  function menuKey(', '  function padMenu(')+';this.key=menuKey',nav);
let prevented=0;
function key(code,extra={}){return nav.key({code,preventDefault(){prevented++},target:{closest(){return null}},...extra});}
assert(key('ArrowDown'));assert.equal(focus,3);
nav.document.activeElement=nodes[5];key('ArrowDown');assert.equal(focus,6);
key('Home');assert.equal(focus,0);key('End');assert.equal(focus,'lantern');
assert.equal(key('Tab'),false);assert.equal(key('ArrowRight',{ctrlKey:true}),false);
assert.equal(key('ArrowRight',{target:{closest(){return {}}}}),false,'Native form controls keep arrow keys');
nav.state='chooser';nav.level=1;key('ArrowRight');assert.equal(nav.level,2);assert.equal(marked,1);assert.equal(focus,2);
key('ArrowRight');assert.equal(nav.level,0);key('Escape');assert.equal(back,1);
nav.document.activeElement=levels[1];key('Enter');assert.equal(started,1);assert.equal(nav.level,1);
assert.equal(key('Enter',{repeat:true}),true);assert.equal(started,1,'Held Enter starts only once');
nav.document.activeElement=elements['back-shelf'];assert.equal(key('Enter'),false,'Back button keeps its native action');
for(const state of ['playing','paused','ended']){nav.state=state;assert.equal(key('ArrowRight'),false);}
assert(prevented>0);
console.log('PASS Marquee: per-game progress, gap/all-clear cases, no save mutation, actual-row navigation, keyboard/form/play boundaries.');

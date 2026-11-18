'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const host=fs.readFileSync(__dirname+'/fun_program.js','utf8');
const manifest=JSON.parse(fs.readFileSync(__dirname+'/DEPLOYMENT_MANIFEST.json'));
for(const name of ['fleet-arcade','lantern-run']){
  const path=name+'.ship.json', bytes=fs.readFileSync(__dirname+'/'+path);
  const spec=manifest.lazy_program_assets[path];
  assert.equal(bytes.length,spec.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),spec.sha256);
  assert(host.includes(spec.sha256));
  const cart=JSON.parse(bytes);
  for(const script of cart.player.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);
}
const html=JSON.parse(fs.readFileSync(__dirname+'/fleet-arcade.ship.json')).player;
const opening=html.slice(html.indexOf('  let openingTimer='),html.indexOf("    const scale=selected==="));
const calls=[],elements=new Map();
function byId(id){if(!elements.has(id))elements.set(id,{dataset:{},replaceChildren(){},focus(){}});return elements.get(id);}
const test={byId,document:{hidden:false},window:{scrollTo(){}},catalog:{skullwater:{title:'Skullwater Sprint',levels:['Copperhead Reach']}},selected:'skullwater',level:0,game:null,state:'chooser',coverArt:{skullwater:'cover'},clearReplay(){},stopFrame(){},releaseInput(){},show(){},clearTimeout(id){if(id)test.timer=null;},setTimeout(cb){test.timer=cb;return 1;},enter(){calls.push('start')}};
vm.runInNewContext(opening+"state='playing';enter();}\nthis.play=play;this.begin=beginRound;this.hold=holdOpening;this.stop=stopGame;",test);
test.play();assert.equal(test.state,'opening');assert.equal(calls.length,0);
test.hold();assert.equal(test.timer,null);assert.equal(test.state,'opening');
test.document.hidden=true;test.begin();assert.equal(calls.length,0);
test.document.hidden=false;test.begin();test.begin();assert.equal(calls.length,1);
test.play();const timer=test.timer;timer();assert.equal(calls.length,2);
test.play();test.stop();test.state='shelf';assert.equal(test.timer,null);test.begin();assert.equal(calls.length,2);
console.log('PASS opening waits, handles focus loss and background, starts once, cancels on exit; verified cartridge scripts and digests');

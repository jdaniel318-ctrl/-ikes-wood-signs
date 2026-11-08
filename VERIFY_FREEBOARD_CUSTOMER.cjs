'use strict';
const assert=require('node:assert/strict'),{fixture}=require('./VERIFY_LONGWATCH_IDLE.cjs');
async function openDesign(f){
 await f.start();
 const st=f.flow().state();
 st.request.photos.push({id:'fixture',width:800,height:400,dataUrl:'data:image/jpeg;base64,/9j/2Q=='});
 await f.el('ccResumeBoard').onclick();
 assert.match(f.el('ccApp').innerHTML,/Design your sign/);
}
let count=0;async function test(name,fn){await fn();count++;console.log('PASS',name);}
(async()=>{
await test('the welcome lands at the full shop header for each new customer',async()=>{
 const html=require('node:fs').readFileSync(__dirname+'/countercraft.html','utf8');
 assert.match(html,/<script src="fleet_viewport\.js"><\/script>[\s\S]*<script src="countercraft_customer\.js">/);
 for(const mode of ['preview','live','sea_trial']){
  const arrivals=[];
  const f=fixture(mode,c=>{
   c.history.scrollRestoration='auto';
   c.BlackFlagViewport={landAtHeader(title){
    const main=c.document.getElementById('ccApp');
    assert(main.innerHTML.includes('id="'+title.id+'"'));
    arrivals.push(main.dataset.step);
   }};
  });
  assert.equal(f.c.history.scrollRestoration,'manual');
  assert.deepEqual(arrivals,['welcome']);
  await f.start();assert.equal(arrivals.length,1);
  await f.el('ccExit').onclick();assert.deepEqual(arrivals,['welcome','welcome']);
 }
});
await test('an empty kiosk opens without a plank picture or a required scale card',async()=>{
 for(const mode of ['preview','sea_trial']){
  const f=fixture(mode);await f.start();
  const html=f.el('ccApp').innerHTML;
  assert.doesNotMatch(html,/<img |index card|keep this board/i);
  assert.match(html,/Take a photo/);assert.match(html,/Choose a photo/);
  assert.equal(html.includes('Try a sample board'),mode==='preview');
 }
});
await test('an unrecognized plank offers a card-free scan from the size result',async()=>{
 const f=fixture('preview',c=>{c.CountercraftRecognition={length:()=>({needsSecondPhoto:true}),species:()=>({})};});
 await openDesign(f);const html=f.el('ccApp').innerHTML;
 assert.match(html,/Board size still open/);assert.match(html,/ccChooseSweep/);
 assert.doesNotMatch(html,/Looks like [0-9] ft stock/);
});
await test('ordinary photos retain supported visual stock sizes without assigning exact measurements',async()=>{
 for(const feet of [2,4,6]){
  const f=fixture('preview',c=>{c.CountercraftRecognition={length:()=>({resolved:true,feet}),species:()=>({speciesResolved:false})};});
  await openDesign(f);const html=f.el('ccApp').innerHTML;
  assert(html.includes(feet+' ft stock'));assert.equal(f.flow().state().boardSpec,null);
 }
});
await test('contact input removes leading paste spaces in the visible field',async()=>{const f=fixture();await f.start();f.emit('input',false,'ccEmail',' \u00a0fleet.tester@example.com');assert.equal(f.el('ccEmail').value,'fleet.tester@example.com');assert.equal(f.flow().state().request.customer.email,'fleet.tester@example.com');});
await test('typing a two-word name preserves the temporary trailing space',async()=>{const f=fixture();await f.start();f.emit('input',false,'ccName','Fleet ');assert.equal(f.el('ccName').value,'Fleet ');f.emit('input',false,'ccName','Fleet Tester');assert.equal(f.flow().state().request.customer.name,'Fleet Tester');});
await test('edited sign visibly unchecks placement',async()=>{const f=fixture();await f.start();f.flow().state().request.board={frameConfirmed:true};f.el('ccPlacement').checked=true;f.emit('input',false,'ccWording','Fleet Test 4');assert.equal(f.el('ccPlacement').checked,false);});
await test('design screen has one finish field and no quantity choice',async()=>{const f=fixture();await openDesign(f);f.flow().state().step=2;await f.el('ccBack').onclick();assert(!f.el('ccApp').innerHTML.includes('ccQuantity'));assert.match(f.el('ccActions').innerHTML,/Add contact info/);});
await test('contact validation appears beside the fields and clears on correction',async()=>{const f=fixture();await openDesign(f);f.flow().state().step=2;f.flow().set('name','');await f.el('ccNext').onclick();assert.match(f.el('ccFieldError').textContent,/Enter your name/);assert.equal(f.el('ccFieldError').hidden,false);f.emit('input',false,'ccName','Fleet Tester');assert.equal(f.el('ccFieldError').hidden,true);});
await test('shutter releases the camera and retake acquires a new stream',async()=>{
 const f=fixture('preview',c=>{c.IkeShopCore={...c.IkeShopCore,normalizePhoto:async()=>({id:'fixture-photo',width:800,height:600,mime:'image/jpeg',dataUrl:'data:image/jpeg;base64,/9j/2Q==',sha256:'a'.repeat(64)})};});await f.start();const tracks=[];
 f.c.navigator.mediaDevices={getUserMedia:async()=>{const track={readyState:'live',enabled:true,stop(){this.readyState='ended';}};tracks.push(track);return {getTracks:()=>[track],getVideoTracks:()=>[track]};}};f.c.File=File;f.c.document.createElement=()=>({getContext:()=>({drawImage(){}}),toBlob:cb=>cb(new Blob(['fixture']))});
 f.c.CountercraftRecognition={analyze:async()=>({boardArea:null}),species:()=>({}),length:()=>({})};
 await f.el('ccTake').onclick();assert.equal(f.el('ccCamera').open,true);f.el('ccVideo').videoWidth=800;f.el('ccVideo').videoHeight=600;
 await f.el('ccCapture').onclick();assert.equal(f.el('ccCamera').open,false);assert.equal(tracks[0].readyState,'ended');
 await f.el('ccTake').onclick();assert.equal(tracks.length,2);assert.equal(tracks[1].readyState,'live');await f.el('ccExit').onclick();assert.equal(tracks[1].readyState,'ended');assert.equal(f.el('ccVideo').srcObject,null);
});
await test('background cancels a pending camera permission result',async()=>{const f=fixture();await f.start();let resolve,stopped=false;f.c.navigator.mediaDevices={getUserMedia:()=>new Promise(r=>resolve=r)};const pending=f.el('ccTake').onclick();f.c.document.hidden=true;f.emit('visibilitychange');resolve({getTracks:()=>[{stop(){stopped=true;}}]});await pending;assert.equal(stopped,true);assert.equal(f.el('ccCamera').open,false);});
await test('late prior-customer file picker cannot attach its file to a new session',async()=>{let normalized=0;const f=fixture('preview',c=>{c.IkeShopCore={...c.IkeShopCore,normalizePhoto:async()=>{normalized++;throw Error('Should not read abandoned picker');}};});await f.start();const old=f.el('ccFile').onchange;await f.el('ccExit').onclick();await f.el('ccBegin').onclick();old({target:{files:[{}],dataset:{}}});assert.equal(normalized,0);});
await test('late camera rejection cannot stop the next customer’s stream',async()=>{const f=fixture();await f.start();let reject,stops=0;f.c.navigator.mediaDevices={getUserMedia:()=>new Promise((_,r)=>reject=r)};const old=f.el('ccTake').onclick();await f.el('ccExit').onclick();await f.el('ccBegin').onclick();const track={readyState:'live',stop(){stops++;}};f.c.navigator.mediaDevices.getUserMedia=async()=>({getTracks:()=>[track],getVideoTracks:()=>[track]});await f.el('ccTake').onclick();reject(Error('Old camera closed'));await old;assert.equal(stops,0);assert.equal(f.el('ccCamera').open,true);});
await test('trimming a contact preserves the caret before existing words',async()=>{const f=fixture();await f.start();const n=f.el('ccName');n.value='  Fleet Tester  ';n.selectionStart=7;n.setSelectionRange=(a,b)=>{n.selectionStart=a;n.selectionEnd=b;};n.listeners.blur();assert.equal(n.value,'Fleet Tester');assert.equal(n.selectionStart,5);});
await test('a canceled shutter cannot replace the board when encoding finishes',async()=>{let reads=0,finish;const f=fixture('preview',c=>{c.IkeShopCore={...c.IkeShopCore,normalizePhoto:()=>{reads++;throw Error('Canceled');}};});await f.start();f.c.File=File;f.c.document.createElement=()=>({getContext:()=>({drawImage(){}}),toBlob:cb=>{finish=cb;}});
 f.el('ccVideo').videoWidth=800;f.el('ccVideo').videoHeight=600;const pending=f.el('ccCapture').onclick();f.el('ccCloseCamera').onclick();finish(new Blob(['canceled']));await pending;assert.equal(reads,0);});
console.log('FREEBOARD CUSTOMER:',count,'passed');
})().catch(e=>{console.error(e);process.exitCode=1;});

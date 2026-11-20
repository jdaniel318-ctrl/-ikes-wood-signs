import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dayToOpen,routeLinks,reflow} from './fleet-tools.mjs';
import {trialChange,trialEnabled} from './trials.mjs';
import {previewOffer} from './partner-offer.mjs';
import {ideasFor} from './ideas.mjs';
test('open the day at the destination, keep other dates selectable, protect finished work',()=>{
 assert.equal(dayToOpen('2026-11-12','2026-11-16','America/New_York',new Date('2026-11-15T01:00Z')),'2026-11-14');
 const links=routeLinks('Main & 2nd, Luray');assert.equal(Object.keys(links).length,3);assert.equal(new URL(links.Google).searchParams.get('destination'),'Main & 2nd, Luray');
 assert.deepEqual(reflow([{id:'x',at:'23:10',duration:40}],60),[{id:'x',old:'23:10',at:null}]);
 assert.deepEqual(reflow([{id:'x',at:'15:00',done:true,duration:30}],60),[]);
 assert.equal(ideasFor('Shenandoah, Iowa','2026-11-15').length,0);assert.ok(ideasFor('Luray, VA','2026-11-15').some(i=>i.id==='bluegrass'));assert.ok(!ideasFor('Luray, VA','2026-11-16').some(i=>i.id==='bluegrass'));
});
test('mock capacity respects the trigger, floor and available quantity',()=>{
 const example={capacity:100,booked:29,threshold:30,limit:6,rate:89,floor:65};
 assert.equal(previewOffer(example).units,6);assert.equal(previewOffer({...example,booked:30}).eligible,false);assert.equal(previewOffer({...example,rate:55}).eligible,false);
 assert.equal(previewOffer({...example,limit:300}).units,71);assert.throws(()=>previewOffer({...example,booked:-1}));
});
test('First Mate previews, Captain scopes and reverses, Admiral publishes only the reusable template',()=>{
 const today='2026-11-19',input={vessel:'demo',tool:'schedule-shift'};
 const mate={role:'first-mate',vessels:['demo']},capt={role:'captain',vessels:['demo']},adm={role:'admiral',fleetGovernance:true};
 const proposal=trialChange(null,mate,{...input,action:'propose'},today);
 const approval={...input,action:'approve',revision:1,until:'2026-11-22'};
 for(const actor of [mate,{role:'captain',vessels:['another']},null])assert.throws(()=>trialChange(proposal,actor,approval,today));
 const trial=trialChange(proposal,capt,approval,today);assert.equal(trialEnabled(trial,input.tool,'another',today),false);assert.equal(trialEnabled(trial,input.tool,'demo','2026-11-23'),false);
 const change={...input,revision:2,action:'promote'};assert.throws(()=>trialChange(trial,capt,change,today));
 assert.deepEqual(trialChange(trial,adm,change,today),{tool:input.tool,status:'available-to-propose',automatic_promotion:false});
 assert.equal(trialEnabled(trialChange(trial,capt,{...change,action:'disable'},today),input.tool,'demo',today),false);
});

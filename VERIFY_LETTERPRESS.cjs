'use strict';
const assert=require('node:assert/strict');
const {fixture}=require('./VERIFY_LONGWATCH_IDLE.cjs');
async function check(mode){
  const launches=[];
  const f=fixture(mode, context=>{
    context.CarvewrightStudio={openEmbedded(options){launches.push(options);},close(){}};
  });
  await f.start();
  const state=f.flow().state();
  state.request.photos.push(require('node:vm').runInContext("({id:'fixture',width:800,height:400,dataUrl:'data:image/jpeg;base64,/9j/2Q=='})",f.c));
  await f.el('ccResumeBoard').onclick();
  const html=f.el('ccApp').innerHTML;
  assert.match(html,/<button[^>]*id="ccLayout"[^>]*>Position lettering<\/button>/);
  assert.match(html,/<button[^>]*id="ccAddArtwork"[^>]*>Add artwork<\/button>/);
  assert.match(html,/<details id="ccBoardOptions" class="cc-photo-tools"><summary>Board photo &amp; measurements<\/summary>/);
  assert(html.indexOf('id="ccAddArtwork"')<html.indexOf('id="ccPlacement"'));
  for(const [id,tool] of [['ccProof','lettering'],['ccLayout','lettering'],['ccAddArtwork','artwork']]){
    f.el(id).onclick();
    const launch=launches.at(-1);
    assert(launch,mode+' '+id+' '+f.el('ccStatus').textContent);
    assert.equal(launch.customerTool,tool);
    assert(launch.customerFacing&&launch.guard());
    assert.equal(launch.draft.text.value,'Andie Rose');
    assert.notEqual(launch.draft,state.request.design);
    launch.onClose();
  }
  const oldButton=f.el('ccAddArtwork').onclick;
  await f.el('ccExit').onclick();
  const before=launches.length;
  oldButton();
  assert.equal(launches.length,before);
  assert.equal(launches.at(-1).guard(),false);
}
(async()=>{
  for(const mode of ['preview','sea_trial','live'])await check(mode);
  console.log('PASS separate customer tools, optional measures and expired customer guards in local fixtures');
})().catch(err=>{console.error(err);process.exitCode=1;});

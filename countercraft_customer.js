(function(g){'use strict';
const C=g.CountercraftCore,S=g.IkeShopCore,D=g.CarvewrightCore,F=g.IkeCarveFonts,B=g.BoardcraftPhoto,$=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=p=>p.totalCents===null?'Ike will confirm the price':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(p.totalCents/100);
if(!g.isSecureContext||!g.crypto?.subtle){$('ccApp').innerHTML='<section class="cc-card"><h1>Open Ike’s secure shop link.</h1><p>This browser needs the complete HTTPS site to protect your design and contact details. No request was started.</p></section>';return;}
const params=new URLSearchParams(location.search),launch=g.CountercraftConfig.consumePreview(new URLSearchParams(location.hash.slice(1)).get('launch')),preview=!!launch,tokenRoute=params.has('receipt')||params.has('review'),scope=tokenRoute?g.CountercraftConfig.receiptScope(params):launch?.scope||g.CountercraftConfig.activeLocation(),flow=g.CountercraftFlow.create();
if(launch)history.replaceState({},'',location.pathname+location.search);
if(!scope||params.has('preview')&&!launch){
  $('ccMode').hidden=true;$('ccHelp').hidden=true;
  $('ccApp').innerHTML=params.has('preview')
    ?'<section class="cc-card cc-recovery"><h1>Preview ended.</h1><p>Return to the Engine and open Test Center to start a fresh preview. Refreshing or reopening a preview does not carry its session forward.</p><p>No request was sent from this preview. Its photo and details are not restored here.</p><a class="cc-return" href="index.html">← Return to Engine</a></section>'
    :'<section class="cc-card"><h1>Please ask Ike to open this station.</h1><p>This device is not ready for a customer session. Your details have not been collected.</p></section>';
  return;
}
if(preview)$('ccEngineReturn').hidden=false;
// Engine-only previews allow five extra minutes for screenshot-led testing.
// Live/trial timings stay aligned with the backend idle-v1 session policy.
const idleWarningMs=preview?420000:120000,idleExpiryMs=idleWarningMs+30000;
let sessionEpoch=0,expired=false,lastActivity=Date.now(),lastTouch=0,touchFlight=false,ending=false;
function active(promise){const epoch=sessionEpoch,stale=()=>Object.assign(Error('This customer session has ended.'),{code:'STALE_CUSTOMER'});return Promise.resolve(promise).then(value=>{if(epoch!==sessionEpoch||expired){if(value?.getTracks)value.getTracks().forEach(t=>t.stop());throw stale();}return value;},error=>{if(epoch!==sessionEpoch||expired)throw stale();throw error;});}
let store,session,client,started=false,busy=false,editing=false,stream=null,cameraEpoch=0,checkpointTimer,idleTimer,saveText=preview?'Private Preview · stays in memory':'Starting protected session…',receipt=null,transfer=null,tokenSession=null,tokenRecord=null;
let resumeToken=params.has('resume')?new URLSearchParams(location.hash.slice(1)).get('token'):null;if(resumeToken)history.replaceState({},'',location.pathname+location.search);
const emptyPublication={scope,revision:1,enabled:false,stocks:[],rates:[],recoveryKey:null};
const sampleStock={id:'SAMPLE-24',revision:1,species:'Cedar',nominalInches:24,available:true,actualMm:null};
let pub=emptyPublication;const rawCall=g.CountercraftClient.transport(scope),call=(action,input)=>active(rawCall(action,input));
function status(text,error=false){
 if(expired||!$('ccStatus'))return;
 const local=$('ccFieldError'),step=flow.state().step;
 const field=error?(/Enter your name/.test(text)?'ccName':/email address or phone/.test(text)?'ccEmail':/available contact/.test(text)?'ccContact':/placement on your photo/.test(text)?'ccPlacement':/approval box/.test(text)?'ccApproval':''):'';
 document.querySelectorAll('[aria-invalid="true"]').forEach(n=>{n.removeAttribute('aria-invalid');n.removeAttribute('aria-describedby');});
 if(local){local.textContent=field?text:'';local.hidden=!field;}
 $('ccStatus').textContent=field?'':text;$('ccStatus').dataset.error=String(error&&!field);
 if(field&&local&&step>0){const n=$(field);n?.setAttribute?.('aria-invalid','true');n?.setAttribute?.('aria-describedby','ccFieldError');n?.focus({preventScroll:true});}
}
const fieldError='<p id="ccFieldError" class="cc-field-error" role="alert" hidden></p>';
function words(d){return D.layerList(d).filter(l=>l.type==='text').map(l=>l.text.value).join('\n');}
function currentPrice(){const st=flow.state();return C.price(pub,st.stockId,st.request.details.quantity);}
function snapshot(){const st=flow.state();return {schema:'countercraft-request-v1',request:S.clone(st.request),stockId:st.stockId,boardSpec:S.clone(st.boardSpec),price:currentPrice(),contactPreference:st.contactPreference,requestedPickup:st.requestedPickup,plankEvidence:S.clone(st.plankEvidence),lettering:S.clone(st.lettering),approval:null};}
function savedSpecs(s){const b=C.boardSummary(s);return (b.measured?'<dt>Measured shop board</dt><dd>'+esc(b.dimensions)+' (length × width × thickness) · recorded by Ike</dd>':'<dt>Board size</dt><dd>'+esc(C.photoSizeNote(s)||'Ike will confirm the actual board size.')+'</dd>')+'<dt>'+(b.measured?'Confirmed wood':'Wood appearance')+'</dt><dd>'+esc(b.species)+'</dd><dt>Board / rack</dt><dd>'+esc(b.stockId)+'</dd>'+(b.measured?'<dt>Layout edge margin</dt><dd>'+esc(b.marginInches)+' in on each edge · keep the layout on usable wood</dd>':'')+'<dt>Lettering request</dt><dd>'+esc(s.lettering?'Ike’s Style '+s.lettering.style+(s.lettering.resolved?' · matching proof shown':' · matching proof still needed'):'As shown in this proof')+'</dd>';}
function boardNote(){const b=C.boardSummary(snapshot());return b.measured?'Shop measurements: '+b.dimensions+' · '+b.species+'. Your design uses this size.':'Ike will confirm your board’s measurements before production.';}


function letteringMarkup(){const chosen=flow.state().lettering;return '<details><summary>Prefer Ike’s shop lettering?</summary><p class="cc-note">Add a shop-style reference to your request. Your layout below uses the selected lettering; Ike will show you a matching proof for approval before making the sign.</p><div class="cc-row">'+['A','B'].map(id=>{const p=g.IkeGlyphBench.pack(id);return '<button type="button" class="cc-secondary" data-shop-style="'+id+'" aria-pressed="'+String(chosen?.style===id)+'"><img style="width:100%;max-height:100px;object-fit:contain" src="'+p.anchorImage+'" alt="'+esc(p.anchorText)+' finished sign reference">'+esc(p.label)+'</button>';}).join('')+'</div><button type="button" class="cc-secondary" data-shop-style="">Use my chosen lettering</button><p class="cc-note">'+(chosen?'Requested: Ike’s Style '+chosen.style+'. Ike’s matching proof is still needed.':'Your selected lettering stays in your proof.')+'</p></details>';}
function readyControls(){document.querySelectorAll('#ccApp button,#ccActions button,#ccApp input,#ccApp select,#ccApp textarea').forEach(n=>n.disabled=busy||editing);}
async function run(fn){if(busy||editing||ending||expired)return;const epoch=sessionEpoch;busy=true;readyControls();try{await fn();}catch(e){if(epoch===sessionEpoch)status(e.message||'This step could not finish.',true);}finally{if(epoch===sessionEpoch){busy=false;readyControls();armIdle();}}}
async function checkpoint(){if(preview||!client||!started||receipt)return;clearTimeout(checkpointTimer);await active(client.checkpoint(snapshot()));saveText='Protected on this iPad';const n=document.querySelector('.cc-save');if(n)n.textContent=saveText;}
function changed(){const epoch=sessionEpoch;flow.state().request.approval=null;flow.state().request.proof=null;saveText=preview?'Private Preview · stays in memory':'Saving protected draft…';clearTimeout(checkpointTimer);checkpointTimer=setTimeout(()=>checkpoint().catch(e=>{if(epoch!==sessionEpoch)return;saveText='Draft checkpoint not saved';status(e.message,true);}),450);}
function steps(){return '<ol class="cc-steps">'+['Your plank','Your design','Your details','Review & send'].map((s,i)=>'<li '+(i===flow.state().step?'aria-current="step"':'')+'>'+String(i+1)+'. '+s+'</li>').join('')+'</ol>';}
function buttons(next){$('ccActions').innerHTML=(flow.state().step?'<button id="ccBack" class="cc-secondary">Back</button>':'')+'<span class="cc-save">'+esc(saveText)+'</span><button id="ccNext" class="cc-next">'+esc(next)+'</button>';if($('ccBack'))$('ccBack').onclick=()=>run(async()=>{await checkpoint();flow.back();render();if(flow.state().step===0&&flow.state().request.photos.length)status('Choose a new board photo or use the current design.');});$('ccNext').onclick=nextStep;}
function proofMarkup(){const r=flow.state().request;if(r.proof)return '<img src="'+r.proof.dataUrl+'" alt="The exact sign proof for this request">';if(!r.board&&!r.design.text.value.trim()&&!r.design.layers?.length)return '<div class="cc-empty"><b>Your words here</b><p>Your sign starts blank. Make it yours.</p></div>';try{return r.board?B.scene(r.design,r.photos.find(p=>p.id===r.board.photoId),r.board,F).svg:D.toSvg(r.design,F);}catch(e){return '<p class="cc-note">'+esc(e.message)+'</p>';}}
const swatches = new Map();
function letteringChoices(selected) {
 const styles = [['studio-sans','Block'],['rye','Western'],['lobster','Script']];
 return '<div class="cc-buttons" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:0 0 10px" role="group" aria-label="Lettering samples">'+styles.map(([id,label])=>{
   const name=F.fonts[id].name;
   if(!swatches.has(id)){
     const draft=D.createDraft();
     draft.text.fontId=id;
     draft.text.value='Aa';
     const sample=D.layout(draft,F), box=sample.bounds;
     swatches.set(id,'<svg aria-hidden="true" width="42" height="24" viewBox="'+[box.xMin-1,box.yMin-1,box.width+2,box.height+2].join(' ')+'"><g fill="currentColor">'+D.renderPaths(sample)+'</g></svg>');
   }
   return '<button type="button" style="min-width:0;padding:6px 2px" data-counter-font="'+id+'" aria-label="'+esc(name)+'" aria-pressed="'+(id===selected)+'" class="'+(id===selected?'':'cc-secondary')+'">'+swatches.get(id)+'<small style="display:block">'+esc(label)+'</small></button>';
 }).join('')+'</div>';
}
function photoInputs(){
 return '<input hidden id="ccFile" type="file" accept="image/*"><input hidden id="ccCameraFile" type="file" accept="image/*" capture="environment">';
}
function sweepOption(replacePhotos){
 const hint=replacePhotos?'Use the scan’s board photo and face measurements in place of your current board photos. Your wording carries over.':'Use a scan from the Sightline app to bring in a rectangular board’s photo and measured face dimensions.';
 return '<details class="cc-sweep-option"><summary>Have a saved Sightline scan?</summary><p>'+hint+'</p>'+
   '<button type="button" id="ccChooseSweep" class="cc-secondary">Open saved scan</button><input type="file" id="ccSweepFile" accept=".json,application/json" hidden></details>';
}
function captureStep(){
 const photo=flow.state().request.photos[0];
 const current=photo?'<img src="'+esc(photo.dataUrl)+'" alt="Your board for this sign">':'';
 const next=photo?'<button type="button" id="ccResumeBoard">Keep this board &amp; design</button>':'';
 const sample=preview?'<button type="button" id="ccSample" class="cc-inline">Try a sample board</button>':'';
 return '<h1>Let’s get to know your board.</h1><p class="cc-lead">Take a photo from above with both ends in view. We’ll check its shape and look for a match in Ike’s measured boards.</p>'+
   '<section class="cc-card cc-capture-start">'+current+'<div><h2>'+(photo?'Your board photo':'Add your board photo')+'</h2>'+
   '<div class="cc-buttons">'+next+'<button id="ccTake"'+(photo?' class="cc-secondary"':'')+'>'+(photo?'Retake photo':'Take a photo')+'</button><button id="ccChoose" class="cc-secondary">Choose a photo</button></div>'+
   sample+sweepOption(Boolean(photo))+
   '</div>'+photoInputs()+'</section>';
}
function scaleTrace(card) {
 const pair = p=>p.map(n=>Number(n).toFixed(2)).join(',');
 const endMarks=[...card.across,...card.down].map(p=>'<circle cx="'+Number(p[0])+'" cy="'+Number(p[1])+'" r="3" fill="white"/>').join('');
 return '<polygon points="'+card.reference.map(pair).join(' ')+'" fill="none" stroke="#ffe760"/><polyline points="'+card.across.map(pair).join(' ')+'" stroke="#00eaff"/><polyline points="'+card.down.map(pair).join(' ')+'" stroke="#00eaff"/>'+endMarks;
}
function scaleImage(photo,card) {
 const width=card?.w||photo.width,height=card?.h||photo.height;
 return '<svg class="cc-scale-image" role="img" aria-label="Scale photograph of your board" viewBox="0 0 '+Number(width)+' '+Number(height)+'"><image href="'+esc(photo.dataUrl)+'" width="100%" height="100%"/><g stroke-width="2.3" fill="none">'+(card?scaleTrace(card):'')+'</g></svg>';
}
function scaleMarkup(st){
 const photos=st.request.photos, first=st.plankEvidence[0]||{}, applied=C.photoSizeNote(st);
 if(st.boardSpec)return '<p class="cc-size-result">'+esc(boardNote())+'</p>';
 if(st.stockId)return '<p class="cc-size-result">Board selected. Ike will check its actual dimensions.</p>';
 const scaleIndex=st.plankEvidence[1]?.scaleView?1:0;
 const info=st.plankEvidence[scaleIndex]||{}, photo=photos[scaleIndex], card=info.sizeScan?.card;
 if(applied){
   const trace=first.layoutSize.source==='photo-card'&&card&&info.photoId===first.layoutSize.scalePhotoId
     ?'<details><summary>See measured edges</summary>'+scaleImage(photo,card)+'</details>':'';
   return '<div class="cc-size-result"><strong>'+esc(applied)+'</strong>'+trace+'<button class="cc-inline" id="ccClearSize">Clear this size</button></div>';
 }
 const matched=first.sizeScan?.reference&&first.sizeScan.reference===g.IkePhotoSize?.referenceId&&!first.dismissedMatch;
 const secondary=st.plankEvidence[1];
 const length=g.CountercraftRecognition?.length(first.length,secondary?.length);
 const knownFamily=length?.resolved&&[2,4,6].includes(length.feet);
 const possibleFamily=!knownFamily&&[2,4,6].includes(length?.candidateFeet)&&length.score>=.62;
 const headline=first.nativeScan?'Sightline measurement':matched?'Looks like your measured board':
   knownFamily||possibleFamily?'Looks like '+(knownFamily?length.feet:length.candidateFeet)+' ft stock':'Board size still open';
 const hint=knownFamily||possibleFamily?'This is a stock length suggested by the board’s shape. Ike checks the exact size.':'You can start lettering on this photo now.';
 const species=g.CountercraftRecognition?.species(first.species,secondary?.species);
 const wood=species?.speciesResolved?'<p>Photo suggests '+esc(species.speciesName)+'.</p>':'';
 const moreView=!secondary&&length?.needsSecondPhoto&&photos.length<3?'<button type="button" id="ccSecondView" class="cc-inline">Add another view of this board</button>':'';
 const result=first.nativeScan?'<p>'+esc((first.nativeScan.lengthMm/25.4).toFixed(1))+' × '+esc((first.nativeScan.widthMm/25.4).toFixed(1))+' in from your saved scan.</p><button class="cc-secondary" id="ccUseSweep">Use scan measurements</button>':matched?'':'<p>'+hint+'</p>'+wood+moreView;
 const matchChoice=matched&&!first.nativeScan?'<p>23 9/16 in long × 9 1/4 in wide at center. From the saved tape readings.</p><div class="cc-buttons"><button type="button" id="ccUseMatch" class="cc-secondary">Use these measurements</button><button id="ccDifferent" class="cc-inline">Different board</button></div>':'';
 const replace=scaleIndex===1;
 const upload=(replace||photos.length<3)?'<button id="ccScaleView" class="cc-secondary">'+(replace?'Replace scale photo':'Add scale photo')+'</button>':'';
 const detected=card?'<p>Check the yellow card outline and the two blue board measurements. Select the actual size of your card.</p>'+scaleImage(photo,card)+'<div class="cc-buttons">'+
   ['3x5','4x6'].map(size=>'<button class="cc-secondary" data-card-size="index-'+size+'" data-photo="'+scaleIndex+'">'+size.replace('x',' × ')+' in</button>').join('')+'</div>':'';
 const manual=photo?'<button id="ccMarkEdges" class="cc-inline">Mark the edges yourself</button><div id="ccEdgePicker"></div>':'';
 return '<div class="cc-size-result"><strong>'+esc(headline)+'</strong>'+result+matchChoice+(!first.nativeScan&&!matched?sweepOption(true):'')+
  '<details '+(card&&info.scaleView?'open':'')+'><summary>Optional index-card measurement</summary>'+
  '<p>Lay a blank 3 × 5 or 4 × 6 in index card flat on the wood, near the middle. Take a photo straight down with both ends in view.</p>'+detected+upload+manual+'</details></div>';
}
function openEdgePicker(photo,info,stillCurrent) {
 const host=$('ccEdgePicker'),points=[];
 const prompts=['Card · first corner','Card · other end of the long side','Card · next corner across the short side','Card · last corner','Board · middle of the first end','Board · middle of the opposite end','Board · one side at the midpoint','Board · opposite side at the midpoint'];
 host.innerHTML='<p>Mark the four corners of the card first, then the ends and sides of the board.</p><label>Index card size<select id="ccMarkType"><option value="">Choose size</option><option value="index-3x5">3 × 5 in</option><option value="index-4x6">4 × 6 in</option></select></label><p id="ccMarkPrompt" role="status"></p>'+scaleImage(photo,null)+'<div class="cc-buttons"><button id="ccMarkUndo" class="cc-secondary">Undo last mark</button><button id="ccMarkUse">Use this measurement</button></div>';
 const svg=host.querySelector('svg'),layer=svg.querySelector('g'),type=$('ccMarkType');
 const geometry=()=>({reference:points.slice(0,4),across:points.slice(4,6),down:points.slice(6,8),w:photo.width,h:photo.height});
 function update(){
   layer.innerHTML=points.map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="'+(photo.width*.008)+'" fill="#ffe760" stroke="#192e32"/>').join('');
   if(points.length===8)layer.innerHTML+=scaleTrace(geometry());
   $('ccMarkUndo').disabled=points.length===0;
   $('ccMarkUse').disabled=points.length!==8||!type.value;
   $('ccMarkPrompt').textContent=points.length===8?'Check your lines, then use this measurement.':(points.length+1)+' of 8 · '+prompts[points.length];
 }
 svg.onclick=e=>{
   if(!stillCurrent()||points.length===8)return;
   const transform=svg.getScreenCTM();if(!transform)return;
   const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const mapped=pt.matrixTransform(transform.inverse());
   if(mapped.x<0||mapped.x>photo.width||mapped.y<0||mapped.y>photo.height)return;
   points.push([mapped.x,mapped.y]);update();
 };
 $('ccMarkUndo').onclick=()=>{if(stillCurrent()){points.pop();update();}};
 type.onchange=update;
 $('ccMarkUse').onclick=()=>run(async()=>{
   if(!stillCurrent()||points.length!==8||!type.value)return;
   const card=geometry(), result=g.IkePhotoSize.measure(card,type.value,g.CarvewrightCapture);
   flow.applyPhotoSize({...result,scalePhotoId:photo.id});info.sizeScan={...info.sizeScan,card};
   changed();await checkpoint();render();
 });
 update();
}
function photoTools(st){
 const stock=pub.stocks.filter(x=>x.available);
 return '<details class="cc-photo-tools"><summary>Edit photo or board details</summary><div class="cc-buttons"><button id="ccTake" class="cc-secondary">Retake photo</button><button id="ccChoose" class="cc-secondary">Replace photo</button><button id="ccRotate" class="cc-secondary">Rotate board ↻</button></div>'+
 (stock.length?'<label>Shop inventory (optional)<select id="ccStock"><option value="">Use photographed board</option>'+stock.map(s=>'<option value="'+esc(s.id)+'" '+(s.id===st.stockId?'selected':'')+'>'+esc(s.id+' · '+s.species+' · '+s.nominalInches+' in')+'</option>').join('')+'</select></label>':'')+
 (st.request.photos.length<3?'<button id="ccAddReference" class="cc-secondary">Add a reference photo</button>':'')+'</details>'+photoInputs();
}
function designStep(st) {
 const r=st.request,price=currentPrice(),sample=preview&&st.stockId===sampleStock.id;
 return '<h1>Design your sign</h1><div class="cc-grid cc-design-grid"><section class="cc-card cc-board-work">'+
  '<h2>Your plank</h2><div id="ccProof" class="cc-preview">'+proofMarkup()+'</div>'+
  '<label class="cc-words">Words on your sign<textarea id="ccWording" data-preserve-edge-space spellcheck="false" rows="1" placeholder="Type your wording">'+esc(r.design.text.value)+'</textarea></label>'+
  letteringChoices(r.design.text.fontId)+'</section><section class="cc-card cc-board-settings">'+
  scaleMarkup(st)+'<p class="cc-note">'+(sample?'Example price · ':'')+'<strong id="ccPrice">'+esc(money(price))+'</strong></p>'+
  '<label class="cc-check"><input id="ccPlacement" type="checkbox" '+(r.board?.frameConfirmed?'checked':'')+'>The lettering sits where I want it.</label>'+fieldError+
  '<button id="ccLayout" class="cc-secondary">Position lettering &amp; add artwork</button>'+
  '<details><summary>Lettering and finish</summary><label>Lettering<select id="ccFont">'+Object.entries(F.fonts).map(([id,font])=>'<option value="'+esc(id)+'" '+(id===r.design.text.fontId?'selected':'')+'>'+esc(font.name)+'</option>').join('')+'</select></label>'+
  letteringMarkup()+'<label>Finish<input id="ccFinish" value="'+esc(r.details.finish)+'" maxlength="120"></label></details>'+
  photoTools(st)+'</section></div>';
}
function refreshProof(){const n=$('ccProof');if(n)n.innerHTML=proofMarkup();const price=$('ccPrice');if(price)price.textContent=money(currentPrice());}
function render(){if(expired||ending)return;$('ccExit').hidden=!started;if(!started)return welcome();if(receipt)return showReceipt();const st=flow.state(),r=st.request;$('ccApp').dataset.step=String(st.step);$('ccApp').classList.toggle('cc-plank-step',st.step===0);document.body.classList.toggle('cc-plank-screen',st.step===0);let html=steps();
 if(st.step===0){html+=captureStep();$('ccActions').replaceChildren();}
 if(st.step===1){html+=designStep(st);buttons('Add contact info →');}
 if(st.step===2){html+='<div class="cc-eyebrow">So Ike can review your sign request and get back to you</div><h1>A few details.</h1><p class="cc-lead">'+(preview?'Use made-up contact details for this preview.':'Ike will use your chosen contact method to follow up about this sign.')+'</p>'+(preview?'<button type="button" id="ccSampleContact" class="cc-secondary">Use sample contact details</button>':'')+'<div class="cc-grid"><section class="cc-card"><label>Your name<input id="ccName" autocomplete="off" maxlength="160" value="'+esc(r.customer.name)+'"></label><div class="cc-row"><label>Email<input id="ccEmail" type="email" autocomplete="off" maxlength="254" value="'+esc(r.customer.email)+'"></label><label>Phone<input id="ccPhone" type="tel" autocomplete="off" maxlength="80" value="'+esc(r.customer.phone)+'"></label></div><label>Best way to reach you<select id="ccContact"><option value="email" '+(st.contactPreference==='email'?'selected':'')+'>Email</option><option value="phone" '+(st.contactPreference==='phone'?'selected':'')+'>Phone</option></select></label>'+fieldError+'</section><section class="cc-card"><label>Anything Ike should know?<textarea id="ccNotes" maxlength="5000">'+esc(r.details.notes)+'</textarea></label><label>Requested pickup timing (optional)<input id="ccPickup" maxlength="120" value="'+esc(st.requestedPickup)+'" placeholder="For example, before next weekend"></label><p class="cc-note">This is your request. Ike confirms when the sign can be ready.</p></section></div>';buttons('Review my sign →');}
 if(st.step===3){html+='<div class="cc-eyebrow">One last look</div><h1>Is this your sign?</h1><p class="cc-lead">Check the wording, layout and details below. This exact proof goes to Ike.</p><div class="cc-grid"><section class="cc-card"><div class="cc-preview">'+proofMarkup()+'</div><dl class="cc-summary"><dt>Wording</dt><dd>'+esc(words(r.design)||'Artwork design')+'</dd>'+savedSpecs(snapshot())+'<dt>Finish</dt><dd>'+esc(r.details.finish)+'</dd><dt>Requested pickup</dt><dd>'+esc(st.requestedPickup||'No preference')+'</dd></dl></section><section class="cc-card"><h2>Ready for Ike’s review</h2><p class="cc-price">'+esc(money(currentPrice()))+'</p><p class="cc-note">'+(currentPrice().totalCents===null?'Your design request can be sent now. Ike will confirm the material and price with you.':preview?'Example price for this preview board.':'Published price for this selection. Ike still reviews the board and accepts the job.')+'</p><dl class="cc-summary"><dt>Name</dt><dd>'+esc(r.customer.name)+'</dd><dt>Contact</dt><dd>'+esc(r.customer[st.contactPreference])+'</dd><dt>Notes</dt><dd>'+esc(r.details.notes||'None')+'</dd></dl><label class="cc-check"><input id="ccApproval" type="checkbox">I approve this design and these request details for Ike to review.</label>'+fieldError+'<p class="cc-note">Ike may accept or decline your request. Sending it does not take payment or promise a pickup date.</p></section></div>';buttons(preview?'Finish preview':'Send this design to Ike');}
 $('ccApp').innerHTML=html;bind();$('ccApp').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});readyControls();}
function bind(){const boundEpoch=sessionEpoch,sessionCurrent=()=>boundEpoch===sessionEpoch&&started&&!ending&&!expired&&!flow.state().frozen;document.querySelectorAll('[data-shop-style]').forEach(n=>n.onclick=()=>run(async()=>{flow.set('lettering',n.dataset.shopStyle?{style:n.dataset.shopStyle,resolved:false}:null);changed();render();}));const map={ccWording:'wording',ccFont:'font',ccFinish:'finish',ccName:'name',ccEmail:'email',ccPhone:'phone',ccContact:'contactPreference',ccNotes:'notes',ccPickup:'requestedPickup'};for(const [id,field]of Object.entries(map)){
 const n=$(id);if(!n)continue;const contact=['name','email','phone'].includes(field);
 const update=(finish=false)=>{if(boundEpoch!==sessionEpoch||!started||ending||expired)return;try{
   if(contact){const value=finish?n.value.trim():n.value.trimStart();if(value!==n.value){const caret=n.selectionStart,end=n.selectionEnd??caret,leading=n.value.length-n.value.trimStart().length,adjust=i=>Math.min(value.length,Math.max(0,i-leading));n.value=value;if(caret!==null&&caret!==undefined)try{n.setSelectionRange(adjust(caret),adjust(end));}catch{}}}
   if(flow.set(field,n.value))changed();status('');
   if(field==='wording'||field==='font')refreshProof();
   if(field==='font')document.querySelectorAll('[data-counter-font]').forEach(button=>{
     const selected=button.dataset.counterFont===n.value;
     button.setAttribute('aria-pressed',String(selected));
     button.classList.toggle('cc-secondary',!selected);
   });
   if($('ccPlacement'))$('ccPlacement').checked=!!flow.state().request.board?.frameConfirmed;
 }catch(e){status(e.message,true);}};
 n.addEventListener('input',()=>update(false));
 if(contact){n.addEventListener('blur',()=>update(true));n.addEventListener('paste',()=>setTimeout(()=>update(true),0));}
}
 document.querySelectorAll('[data-counter-font]').forEach(button=>{
   button.onclick=()=>{
     if(!sessionCurrent()||busy||editing)return;
     const select=$('ccFont');
     select.value=button.dataset.counterFont;
     select.dispatchEvent(new Event('input',{bubbles:true}));
   };
 });
 if(preview&&$('ccSampleContact'))$('ccSampleContact').onclick=()=>{
   if(!sessionCurrent()||busy||editing)return;
   flow.set('name','Sample Customer');
   flow.set('email','sample@example.invalid');
   flow.set('phone','');
   flow.set('contactPreference','email');
   changed();render();
 };
 if(preview&&$('ccSample'))$('ccSample').onclick=()=>run(async()=>{
   const response=await active(fetch('ike_calibration_2ft_cedar_reference.jpg'));
   if(!response.ok)throw Error('The sample photo could not load. Try again or choose a photo.');
   const blob=await active(response.blob());
   await addPhoto(new File([blob],'sample-cedar.jpg',{type:'image/jpeg'}),false,true);
 });
 if($('ccResumeBoard'))$('ccResumeBoard').onclick=()=>run(async()=>{flow.next();render();});
 if($('ccUseMatch'))$('ccUseMatch').onclick=()=>run(async()=>{
   const info=flow.state().plankEvidence[0];
   if(info?.sizeScan?.reference!==g.IkePhotoSize.referenceId)return;
   const [lengthMm,widthMm,thicknessMm]=g.IkePhotoSize.referenceMm;
   flow.applyPhotoSize({source:'matched-tape',lengthMm,widthMm,thicknessMm,referenceId:g.IkePhotoSize.referenceId});
   changed();await checkpoint();render();
 });
 if($('ccDifferent'))$('ccDifferent').onclick=()=>run(async()=>{flow.state().plankEvidence[0].dismissedMatch=true;changed();await checkpoint();render();});
 if($('ccClearSize'))$('ccClearSize').onclick=()=>run(async()=>{flow.clearPhotoSize();changed();await checkpoint();render();});
 document.querySelectorAll('[data-card-size]').forEach(button=>button.onclick=()=>run(async()=>{
   const info=flow.state().plankEvidence[Number(button.dataset.photo)];
   const result=g.IkePhotoSize.measure(info.sizeScan.card,button.dataset.cardSize,g.CarvewrightCapture);
   flow.applyPhotoSize({...result,scalePhotoId:info.photoId});
   changed();await checkpoint();render();
 }));
 if($('ccMarkEdges'))$('ccMarkEdges').onclick=()=>{
   if(!sessionCurrent()||busy)return;
   const st=flow.state(),i=st.plankEvidence[1]?.scaleView?1:0,info=st.plankEvidence[i];
   if(!info)return;
   openEdgePicker(st.request.photos[i],info,sessionCurrent);
 };
 if($('ccChooseSweep'))$('ccChooseSweep').onclick=()=>{if(sessionCurrent())$('ccSweepFile').click();};
 if($('ccSweepFile'))$('ccSweepFile').onchange=e=>{
   const file=e.target.files?.[0];e.target.value='';
   if(file&&sessionCurrent())return run(()=>importSweep(file));
 };
 if($('ccUseSweep'))$('ccUseSweep').onclick=()=>run(async()=>{
   if(!sessionCurrent())return;
   const scan=flow.state().plankEvidence[0]?.nativeScan;
   if(scan){flow.applyPhotoSize({source:'native-sweep',...scan});changed();await checkpoint();render();}
 });
 if($('ccSecondView'))$('ccSecondView').onclick=()=>{if(sessionCurrent()){$('ccFile').dataset.extra='1';$('ccFile').click();}};
 if($('ccScaleView'))$('ccScaleView').onclick=()=>{if(sessionCurrent()){$('ccFile').dataset.extra='scale';$('ccFile').click();}};
 if($('ccStock'))$('ccStock').onchange=()=>run(async()=>{flow.selectStock(pub,$('ccStock').value);changed();await checkpoint();render();status(flow.state().boardSpec?'Your shop board’s measurements are ready. Position your design on the photo.':'Board selected. Continue your design; measurements remain to be confirmed.');});
 if($('ccPlacement'))$('ccPlacement').onchange=()=>{if(boundEpoch!==sessionEpoch||!started||ending||expired)return;flow.state().request.board.frameConfirmed=$('ccPlacement').checked;changed();status('');};
 if($('ccApproval'))$('ccApproval').onchange=()=>{if(sessionCurrent())status('');};
 if($('ccLayout'))$('ccLayout').onclick=()=>{if(!sessionCurrent()||busy||editing)return;const epoch=sessionEpoch,st=flow.state(),photo=st.request.photos[0];editing=true;readyControls();try{g.CarvewrightStudio.openEmbedded({customerFacing:true,draft:S.clone(st.request.design),measuredStock:st.boardSpec,boardPhoto:{photo:S.clone(photo),board:S.clone(st.request.board),boardArea:S.clone(st.plankEvidence[0]?.boardArea||null)},parent:$('ccApp'),guard:()=>epoch===sessionEpoch&&started&&!receipt&&!flow.state().frozen,onUse:(design,board)=>{if(epoch!==sessionEpoch)return;flow.useDesign(design,board);changed();},onClose:()=>{if(epoch!==sessionEpoch)return;editing=false;render();}});}catch(e){editing=false;status(e.message,true);readyControls();}};
 if($('ccTake'))$('ccTake').onclick=()=>sessionCurrent()&&run(openCamera);if($('ccChoose'))$('ccChoose').onclick=()=>{$('ccFile').dataset.extra='';$('ccFile').click();};if($('ccAddReference'))$('ccAddReference').onclick=()=>{$('ccFile').dataset.extra='1';$('ccFile').click();};for(const id of ['ccFile','ccCameraFile'])if($(id))$(id).onchange=e=>{if(!sessionCurrent())return;const f=e.target.files?.[0],extra=e.target.dataset.extra||false;if(f)run(()=>addPhoto(f,extra));};if($('ccRotate'))$('ccRotate').onclick=()=>run(async()=>{const r=flow.state().request;r.board=B.createBoard(r.design,r.photos[0],((r.board?.quarterTurns||0)+1)%4,flow.state().plankEvidence[0]?.boardArea);changed();render();status('Board orientation updated. Check the lettering on your board.');});}
async function importSweep(file){
 if(file.size>9*1024*1024)throw Error('Choose a Sightline scan smaller than 9 MB.');
 const input=await active(file.text());
 let packet;
 try{packet=JSON.parse(input);}catch{throw Error('Choose the JSON file saved by Sightline.');}
 const measurement=g.CarvewrightCapture.readNative(packet);
 const jpeg=Uint8Array.from(atob(packet.imageJpegBase64),ch=>ch.charCodeAt(0));
 const face={captureId:measurement.captureId,lengthMm:measurement.widthMm,widthMm:measurement.heightMm};
 await addPhoto(new File([jpeg],'sightline-board.jpg',{type:'image/jpeg'}),false,false,face);
}
async function addPhoto(file,extra=false,sample=false,nativeScan=null){
 const p=await active(S.normalizePhoto(file)),st=flow.state(),r=st.request;
 const info=await active(g.CountercraftRecognition.analyze(p).catch(()=>({species:null,length:null,orientation:null})));
 if(g.IkePhotoSize){
   try{
     const scan=await active(g.IkePhotoSize.analyze(p,g.BlackFlagWoodwright));
     info.sizeScan={reference:scan.reference,card:scan.card};
     if(scan.region)info.boardArea={photoId:p.id,region:{x:scan.region.x,y:scan.region.y,w:scan.region.w,h:scan.region.h},source:'woodwright-inset-candidate',requiresVisualReview:true,productionCertified:false};
   }catch(e){if(e.code==='STALE_CUSTOMER')throw e;}
 }
 info.photoId=p.id;
 if(nativeScan)info.nativeScan=nativeScan;
 if(extra){
   if(extra==='scale'&&r.photos[1]){
     // Keep references supplied for other purposes when replacing a scale photo.
     if(st.plankEvidence[1]?.scaleView){r.photos[1]=p;st.plankEvidence[1]=info;}
     else if(r.photos.length<3){r.photos.splice(1,0,p);st.plankEvidence[1]=info;}
     else throw Error('Three photos are already attached. Replace the primary photo to start a new size check.');
   }else{
     flow.addPhoto(p);
     if(st.plankEvidence.length<2)st.plankEvidence.push(info);
   }
   if(extra==='scale'){
     info.scaleView=true;
     if(st.plankEvidence[0]?.layoutSize?.source==='photo-card')flow.clearPhotoSize();
   }
   if(r.board)r.board.frameConfirmed=false;
 }else{
   // A replacement is a new physical board. Drop the previous stock, scale and secondary views.
   r.photos=[p];st.plankEvidence=[info];
   if(preview)pub=sample?{...emptyPublication,stocks:[sampleStock],rates:[{species:'Cedar',centsPerFoot:1500}]}:emptyPublication;
   flow.selectStock(pub,sample?sampleStock.id:'');
   r.board=B.createBoard(r.design,p,0,info.boardArea);
   if(nativeScan)flow.applyPhotoSize({source:'native-sweep',...nativeScan});
   if(st.step===0)flow.next();
 }
 changed();await checkpoint();render();
 status(sample?'Sample cedar board ready. The $30 price is for practice.':extra==='scale'&&!info.sizeScan?.card?'The card or board edges are unclear. You can keep designing or try a straighter scale photo.':extra?'Reference photograph added.':'');
}
async function openCamera(){const request=++cameraEpoch;try{
 if(!stream?.getVideoTracks().some(t=>t.readyState==='live')){
  const acquired=await active(navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1440},aspectRatio:{ideal:4/3}},audio:false}));
  if(request!==cameraEpoch||document.hidden){acquired.getTracks().forEach(t=>t.stop());return;}stream=acquired;
 }
 const track=stream.getVideoTracks()[0];
 const zoom=track?.getCapabilities?.().zoom;
 if(zoom&&track.applyConstraints)await active(track.applyConstraints({advanced:[{zoom:Math.max(zoom.min,Math.min(1,zoom.max))}]}).catch(()=>{}));
 if(request!==cameraEpoch||document.hidden)return;
 stream.getTracks().forEach(t=>t.enabled=true);$('ccVideo').srcObject=stream;$('ccCamera').showModal();
 }catch(e){if(request!==cameraEpoch)return;const current=!document.hidden;stopCamera();if(current&&!expired&&e.code!=='STALE_CUSTOMER')$('ccCameraFile')?.click();}}
function stopCamera(){
 cameraEpoch++;stream?.getTracks().forEach(track=>track.stop());stream=null;
 if($('ccVideo'))$('ccVideo').srcObject=null;if($('ccCamera')?.open)$('ccCamera').close();
}
$('ccCapture').onclick=()=>run(async()=>{const captureEpoch=cameraEpoch,v=$('ccVideo');if(!v.videoWidth)throw Error('The camera is not ready yet.');const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);const blob=await active(new Promise(resolve=>c.toBlob(resolve,'image/jpeg',.9)));if(captureEpoch!==cameraEpoch||document.hidden)return;if(!blob)throw Error('The photograph could not be saved. Try again.');stopCamera();await addPhoto(new File([blob],'my-plank.jpg',{type:'image/jpeg'}));});$('ccCloseCamera').onclick=stopCamera;$('ccCamera').oncancel=stopCamera;
function nextStep(){return run(async()=>{const st=flow.state();status('');if(st.step===1){C.checkBoard(snapshot(),pub);const layout=D.layout(st.request.design,F);if(!layout.ok)throw Error(layout.errors.join(' '));if(!st.request.board?.frameConfirmed)throw Error('Check the placement on your photo, or open the layout tools.');}if(st.step<3){const previousStep=st.step;flow.next();if(st.step===3){try{st.request=await active(S.review(st.request,F));}catch(e){st.step=previousStep;throw e;}}await checkpoint();render();return;}if(!$('ccApproval')?.checked)throw Error('Check the approval box after reviewing your sign and details.');const approved=await active(C.approve(snapshot(),F));if(preview){flow.freeze();showPreviewHandoff(approved);return;}await active(client.prepare(approved));flow.freeze();try{receipt=await active(client.submit());render();}catch(e){submissionError(e);}});}
function showPreviewHandoff(approved) {
 stopCamera();
 const r=approved.request,price=approved.price;
 const lettering=D.layerList(r.design).filter(layer=>layer.type==='text'&&layer.text.value.trim())
   .map(layer=>F.fonts[layer.text.fontId].name);
 const fields=[
   ['Exact wording',words(r.design)||'Artwork only'],
   ['Lettering',Array.from(new Set(lettering)).join(', ')||'Artwork only'],
   ['Board',approved.stockId||'Ike will match the photographed plank'],
   [price.totalCents===null?'Price':'Example price',money(price)],
   ['Finish',r.details.finish]
 ];
 const size=C.photoSizeNote(approved);if(size)fields.push(['Board size',size]);
 if(approved.lettering)fields.push(['Shop lettering request','Style '+approved.lettering.style+' · matching proof still needed']);
 $('ccApp').dataset.step='complete';
 $('ccApp').innerHTML='<section class="cc-card cc-success"><div class="cc-eyebrow">Private Preview · nothing sent</div>'+
   '<h1>Your preview is complete.</h1><p class="cc-lead">Here’s the design Ike would receive.</p>'+
   '<div class="cc-grid"><div class="cc-preview"><img src="'+esc(r.proof.dataUrl)+'" alt="The sign proof you approved"></div>'+
   '<dl class="cc-summary">'+fields.map(([label,value])=>'<dt>'+esc(label)+'</dt><dd>'+esc(value)+'</dd>').join('')+'</dl></div></section>';
 $('ccActions').innerHTML='<span class="cc-save">Private Preview · memory only</span><button id="ccAgain" class="cc-next">Start another preview</button>';
 $('ccAgain').onclick=nextCustomer;
 $('ccApp').focus({preventScroll:true});
 window.scrollTo({top:0,behavior:'instant'});
}
function submissionError(e){if(expired||ending||e.code==='STALE_CUSTOMER')return;if(e.code==='review-required'){pub=e.publication;flow.reReview();flow.reconcileStock(pub);saveText='Review updated shop details';render();status(e.message,true);}else showUnconfirmed(e.message);}
function showUnconfirmed(message){if(expired||ending)return;$('ccActions').innerHTML='<span class="cc-save">Result unconfirmed · work retained for Ike</span><button id="ccCheck" class="cc-next">Check result</button><button id="ccRetry" class="cc-secondary">Retry same request</button>';status(message,true);$('ccCheck').onclick=()=>run(async()=>{try{const result=await active(client.check());if(result){receipt=result;render();}else status('No complete receipt yet. Retry this same request when the connection is ready, or ask Ike.');}catch(e){submissionError(e);}});$('ccRetry').onclick=()=>run(async()=>{try{receipt=await active(client.submit());render();}catch(e){submissionError(e);}});}
function welcome(){$('ccApp').dataset.step='welcome';window.scrollTo({top:0,behavior:'instant'});$('ccApp').classList.remove('cc-plank-step');document.body.classList.remove('cc-plank-screen');started=false;$('ccExit').hidden=true;$('ccApp').innerHTML='<section class="cc-welcome"><div><div class="cc-eyebrow">Choose your board. Make it yours.</div><h1>Your words.<br>Ike’s craftsmanship.</h1><p class="cc-lead">Choose a board from Ike’s shop, create your design, and see your sign take shape.</p><button id="ccBegin">Design my sign →</button><div class="cc-promise"><span>Boards from Ike’s shop</span><span>Your exact wording</span><span>Ike’s personal review</span></div></div><img class="cc-welcome-art" src="ike_character.png" alt="Ike, ready to help make your sign"></section>';$('ccActions').replaceChildren();$('ccBegin').onclick=()=>{expired=false;return run(async()=>{if(!preview){await active(g.CountercraftPrivacy.sealBrowser());store=g.CountercraftStore.create({scope});session=await active(g.CountercraftClient.start(scope,store,call));if(session.sessionPolicy!=='idle-v1'){const token=session.token;session=null;void rawCall('end',{token}).catch(()=>{});throw Error('Ike needs to update this station’s privacy service before customer use.');}pub=session.publication;client=g.CountercraftClient.create({scope,session,store,call});saveText='Protected on this iPad';if(resumeToken){const restored=await call('resume',{token:session.token,resumeToken});resumeToken=null;flow.restore(restored.snapshot);const updated=flow.reconcileStock(pub);if(flow.state().request.photos.length)flow.next();if(updated.changed)status(updated.message);}}started=true;lastActivity=Date.now();await checkpoint();render();armIdle();});};}
async function nextCustomer(automatic=false){
 if(ending)return;
 if(!automatic&&!receipt&&started&&!preview&&!confirm('Finish this customer session? Protected unfinished work stays on this iPad for Ike.'))return;
 ending=true;const detached=!$('ccApp'),departingClient=client,token=session?.token,reviewToken=tokenSession;
 // Capture the latest draft before blanking the screen. Recovery is owner-only.
 const saved=started&&!receipt&&departingClient?departingClient.checkpoint(snapshot()).catch(()=>{}):Promise.resolve();
 sessionEpoch++;expired=true;clearTimeout(checkpointTimer);clearTimeout(idleTimer);stopCamera();
 if(editing)g.CarvewrightStudio.close(true);editing=false;
 session=null;client=null;transfer=null;receipt=null;tokenSession=null;tokenRecord=null;resumeToken=null;flow.reset();if(preview)pub=emptyPublication;started=false;busy=false;
 $('ccApp')?.replaceChildren();$('ccActions')?.replaceChildren();if($('ccStatus'))$('ccStatus').textContent='';if($('ccCover')?.open)$('ccCover').close();
 // UI is already blank. A slow network must never keep the previous customer visible.
 void saved.finally(()=>departingClient?.end());if(token)void rawCall('end',{token}).catch(()=>{});if(reviewToken)void rawCall('token-end',{token:reviewToken}).catch(()=>{});
 g.CountercraftPrivacy.release();ending=false;if(detached)return;expired=false;welcome();
 if(automatic)status('This station is ready for a new customer. Ask Ike about unfinished work.');
}
function showReceipt(){stopCamera();$('ccApp').dataset.step='complete';window.scrollTo({top:0,behavior:'instant'});const r=flow.state().request;$('ccApp').innerHTML='<div class="cc-grid"><section class="cc-card cc-success"><div class="cc-success-mark">✓</div><div class="cc-eyebrow" style="margin-top:20px">'+esc(receipt.number)+'</div><h1>Received by Ike’s shop.</h1><p class="cc-lead">Your request is awaiting review.</p><p>Ike will check the wood, design and price, then get back to you using your chosen contact method.</p><p class="cc-note">This receipt confirms your complete request arrived. It does not mean the job has been accepted for production.</p><button id="ccKeep" class="cc-secondary">Keep a receipt on my phone</button><div id="ccTransfer" class="cc-transfer"></div></section><section class="cc-card"><div class="cc-preview"><img src="'+r.proof.dataUrl+'" alt="Your submitted sign proof"></div><p class="cc-price">'+esc(money(currentPrice()))+'</p><p>'+esc(words(r.design))+'</p><p>'+esc(C.photoSizeNote(flow.state()))+'</p></section></div>';$('ccActions').innerHTML='<span class="cc-save">Verified shop receipt · revision '+receipt.revision+'</span><button id="ccDone" class="cc-next">Next customer →</button>';$('ccDone').onclick=nextCustomer;$('ccKeep').onclick=()=>run(async()=>{transfer=await call('receipt-token',{token:session.token});const url=new URL(g.CountercraftConfig.link('?receipt=1',scope,transfer.token));const box=$('ccTransfer');box.innerHTML=g.CountercraftQR.svg(url.href)+'<p class="cc-note">Scan with your phone within 15 minutes. This private link opens once. No phone is needed to finish.</p>';});status('Your complete request and its proof were received.');}
async function tokenBoot(){const fragment=new URLSearchParams(location.hash.slice(1)),token=fragment.get('token');history.replaceState({},'',location.pathname+location.search);$('ccMode').textContent='Your private receipt';if(!token)throw Error('This private link is missing or already used. Ask Ike for a fresh link.');const exchanged=await call('exchange',{token});tokenSession=exchanged.token;if(exchanged.kind==='review-session')await active(g.CountercraftPrivacy.sealBrowser());tokenRecord=await call('token-read',{token:tokenSession});const r=tokenRecord.record.snapshot.request,p=tokenRecord.record.snapshot.price,isReview=tokenRecord.kind==='review-session';if(isReview&&tokenRecord.sessionPolicy!=='idle-v1')throw Error('Ike needs to update this station’s privacy service before customer review.');if(isReview){started=true;$('ccExit').hidden=false;lastActivity=Date.now();armIdle();}$('ccMode').textContent=isReview?'Review with Ike':'Your receipt';$('ccApp').innerHTML='<section class="cc-card"><div class="cc-eyebrow">'+esc(tokenRecord.number)+' · revision '+tokenRecord.revision+'</div><h1>'+(isReview?'Check the updated sign.':'Your sign request.')+'</h1><div class="cc-preview"><img src="'+r.proof.dataUrl+'" alt="Exact saved sign proof"></div><dl class="cc-summary"><dt>Wording</dt><dd>'+esc(words(r.design))+'</dd><dt>Finish / quantity</dt><dd>'+esc(r.details.finish)+' · '+r.details.quantity+'</dd>'+savedSpecs(tokenRecord.record.snapshot)+(isReview?'<dt>Ike’s change summary</dt><dd>'+esc(tokenRecord.correctionSummary||'Ask Ike to explain this revision before approving.')+'</dd>':'')+'<dt>Price</dt><dd>'+esc(money(p))+'</dd><dt>Requested pickup</dt><dd>'+esc(tokenRecord.record.snapshot.requestedPickup||'No preference')+'</dd></dl>'+(isReview?'<label class="cc-check"><input type="checkbox" id="ccAmendApprove">I have reviewed this proof, dimensions, material, lettering, quantity and price.</label>':'<p>Received by Ike’s shop. Ike reviews the request before accepting production.</p>')+'</section>';$('ccActions').innerHTML=isReview?'<button id="ccDecline" class="cc-secondary">Ask for another change</button><button id="ccAccept" class="cc-next">Approve this revision</button>':'<button id="ccPrint" class="cc-next">Save / print my receipt</button>';if(isReview){for(const [id,answer]of [['ccDecline','decline'],['ccAccept','accept']])$(id).onclick=()=>run(async()=>{if(answer==='accept'&&!$('ccAmendApprove').checked)throw Error('Review the updated proof and specifications, then check the box.');await call('review-respond',{token:tokenSession,answer,digest:tokenRecord.record.snapshot.approval.digest});tokenSession=null;g.CountercraftPrivacy.release();$('ccActions').innerHTML='<a class="cc-link" href="countercraft.html?shop=1">Finish customer review</a>';status(answer==='accept'?'Your approval was recorded for this revision. Ike still confirms production.':'Your request for another change was recorded.');});}else $('ccPrint').onclick=()=>window.print();}
$('ccExit').onclick=()=>nextCustomer(false);
$('ccHelp').onclick=()=>status('Ask Ike for a hand with this step. Your sign stays on this screen.');$('ccContinue').onclick=()=>{if(Date.now()-lastActivity>=idleExpiryMs)return nextCustomer(true);$('ccCover').close();activity();};$('ccFresh').onclick=()=>nextCustomer(true);$('ccCover').oncancel=e=>e.preventDefault();
function armIdle(){
 clearTimeout(idleTimer);if(!started||ending)return;
 const elapsed=Date.now()-lastActivity;
 if(elapsed>=idleExpiryMs){void nextCustomer(true);return;}
 if(elapsed>=idleWarningMs&&!$('ccCover').open)$('ccCover').showModal();
 idleTimer=setTimeout(armIdle,Math.max(1,(elapsed<idleWarningMs?idleWarningMs:idleExpiryMs)-elapsed));
}
function activity(){
 if(!started||ending||expired)return;
 if(Date.now()-lastActivity>=idleExpiryMs){void nextCustomer(true);return;}
 if($('ccCover').open)return;lastActivity=Date.now();armIdle();
 if(!preview&&(session?.token||tokenSession)&&!touchFlight&&Date.now()-lastTouch>30000){const epoch=sessionEpoch;touchFlight=true;lastTouch=Date.now();void call(tokenSession?'token-touch':'touch',{token:tokenSession||session.token}).catch(()=>{if(epoch===sessionEpoch)void nextCustomer(true);}).finally(()=>{touchFlight=false;});}
}
for(const event of ['pointerdown','keydown','input'])document.addEventListener(event,activity,{passive:true,capture:true});
g.addEventListener('countercraft:locked',()=>{if(started)void nextCustomer(true);});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)armIdle();else stopCamera();});
g.addEventListener('pagehide',()=>{sessionEpoch++;expired=true;clearTimeout(idleTimer);clearTimeout(checkpointTimer);stopCamera();client?.end();tokenSession=null;tokenRecord=null;$('ccApp')?.replaceChildren();$('ccActions')?.replaceChildren();});g.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
$('ccMode').textContent=preview?'Engine preview · nothing sent':scope.mode==='sea_trial'?'Controlled trial · synthetic customers only':'Your private session';
if(params.has('receipt')||params.has('review'))run(tokenBoot);else welcome();
})(globalThis);

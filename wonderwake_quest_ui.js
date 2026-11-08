/* A small connected adventure. The rule engine, not the animation, decides success. */
(function(root){'use strict';
const Q=root.WWQuest,A=root.WWArt,M=root.WWQuestMotion,W=Q.W,H=Q.H;
const clone=s=>JSON.parse(JSON.stringify(s));
const LABELS=['Bridge Bay','Firefly Trail','Lantern Hollow'];
const INSTRUCTIONS=['Fit the planks to the three gaps. Drag, or choose a plank and tap a gap.','Draw or tap a trail from your explorer through all three sparks. Stay out of the water.','Move the lantern to find hidden shapes. Then enter the pictured code.'];
const GLYPHS=['★','☾','❧','◆'];
function symbolIcon(i){const shapes=['<path d="M0 -25 6 -8 24 -8 10 3 15 22 0 11 -15 22 -10 3 -24 -8 -6 -8Z"/>','<path d="M10 -22A24 24 0 1 0 10 22A21 21 0 0 1 10 -22Z"/>','<ellipse rx="14" ry="25" transform="rotate(-26)"/>','<path d="M0 -25 20 0 0 25 -20 0Z"/>'];return '<svg viewBox="-30 -30 60 60" aria-hidden="true" fill="currentColor">'+shapes[i]+'</svg>';}
const COLORS=['#f0c96d','#c5b4ef','#9acc9e','#83ced3'];
function mount(host,opts){
 let state=Q.validate(opts.state||Q.fresh()),c=Q.chapter(state.chapter),viewStep=state.step;
 let history=[],selected=-1,hint=false,stopped=false,frame=0,animation=null,success=false,saveToken=0,saveOK=true,saveBusy=false,hasSaved=false;
 let stretch=1,dirty=true,lastDraw=0,transition=null,celebration=null,effects=[],acceptedRoute=null;
 let pointer=null,ignoreClickUntil=0,keyboard=[...c.start],light=[.1,.5],lastTime=performance.now(),time=0;
 const guard=WWCreative.pointerGuard(),heldKeys=new Set(),blockedKeys=new Set();
 function blockHeldKeys(){for(const code of heldKeys)blockedKeys.add(code);}
 function trackKey(e){
  const code=e.code||e.key;if(!/^(Enter|Space|ArrowLeft|ArrowRight|ArrowUp|ArrowDown)$/.test(code))return;
  if(stopped||(!host.contains(e.target)&&!transition&&!heldKeys.has(code)))return;
  // A new key press also recovers from a lost keyup after browser/app switching.
  if(!e.repeat){heldKeys.add(code);blockedKeys.delete(code);}
  if(transition&&!e.target.closest?.('.quest-skip'))blockedKeys.add(code);
  if(blockedKeys.has(code)){e.preventDefault();e.stopImmediatePropagation();}
 }
 function releaseKey(e){heldKeys.delete(e.code||e.key);blockedKeys.delete(e.code||e.key);}
 root.addEventListener('keydown',trackKey,true);root.addEventListener('keyup',releaseKey,true);
 const sprites={};for(const name of ['hero','fox','tree','pine'])sprites[name]=(ctx,x,y,...args)=>{ctx.save();ctx.translate(x,y);ctx.scale(1,1/stretch);A[name](ctx,0,0,...args);ctx.restore();};
 const hud=document.createElement('div');hud.className='quest-hud';
 hud.innerHTML='<div class="quest-title"><h3 id="quest-heading"></h3><span class="quest-kicker"></span></div><div class="quest-progress"><span class="quest-chapter"></span><span class="quest-save" role="status" aria-live="polite"></span></div>';
 host.innerHTML='<section class="quest-shell"><div class="quest-goal" aria-live="polite"><strong></strong><span></span></div><div class="quest-scene"><div class="quest-surface"><canvas id="quest-canvas" tabindex="0" aria-label="Lantern Trail puzzle board"></canvas><div class="quest-gaps" role="group" aria-label="Place your chosen plank"></div><div class="quest-win" hidden></div><div class="quest-transition" hidden aria-hidden="true"><div class="quest-transition-light">✦</div><p></p><span>THE LANTERN TRAIL</span></div><button type="button" class="quest-skip" data-q="skip" hidden>Skip animation</button></div></div><div class="quest-controls"><div class="quest-dock" role="group" aria-label="Puzzle pieces and actions"><div class="quest-puzzle-tools"></div><div class="quest-actions"></div></div><p class="quest-feedback" role="status" aria-live="polite"></p><div id="quest-more" class="quest-options" role="dialog" aria-label="Puzzle options" hidden><div class="quest-options-head"><strong>A little help</strong><button type="button" data-q="close-more">Done</button></div><p class="quest-instruction"></p><p class="quest-key-tip"></p><button type="button" data-q="reset">Reset this puzzle</button><button type="button" class="quest-finger" hidden>Use finger</button></div></div></section>';
 if(opts.header)opts.header.insertBefore(hud,opts.header.querySelector('.sound-btn'));else host.querySelector('.quest-shell').prepend(hud);
 const el=s=>host.querySelector(s)||hud.querySelector(s),can=el('canvas'),g=can.getContext('2d'),surface=el('.quest-surface');
 can.width=W*2;can.height=H*2;g.scale(2,2);
 const fog=document.createElement('canvas');fog.width=W;fog.height=H;const fg=fog.getContext('2d');
 function motion(){return typeof opts.motion==='function'?opts.motion():opts.motion!==false;}
 function syncMotionControls(){
  el('.quest-skip').hidden=!animation&&!transition&&!celebration;
  can.inert=!!transition;
  el('.quest-controls').inert=!!transition;el('.quest-gaps').inert=!!transition||success;
 }
 function message(text){el('.quest-feedback').textContent=(viewStep===2?state.code.length+' of 3 shapes entered. ':'')+text;}
 function guidance(){
  const goal=el('.quest-goal');
  if(viewStep===0){goal.querySelector('strong').textContent='Build a bridge that fits.';goal.querySelector('span').textContent='Choose a plank, then tap a matching gap. Fill all three.';}
  else if(viewStep===1){goal.querySelector('strong').textContent='Bring all three sparks to the lantern.';goal.querySelector('span').textContent='Start at your explorer. Draw a trail through the sparks and around the water.';}
  else if(viewStep===3){goal.querySelector('strong').textContent='Your lantern is home.';goal.querySelector('span').textContent='Explore the next island, paint a memory, or visit the islands.';}
  else if(viewStep===2){const remaining=c.code.filter(i=>!state.found.includes(i)).length;goal.querySelector('strong').textContent='Match the code to light the lantern.';goal.querySelector('span').textContent=remaining?'Move your finger or Pencil around the dark to find the shapes.':'Tap the shape buttons below to copy the code from left to right.';}
 }

 function saveLabel(){const label=el('.quest-save');label.textContent=saveBusy?'Saving…':saveOK?(hasSaved?'✓ Trail saved':'Saves on device'):'Trail not saved';label.title=saveOK?'Your trail is kept on this device.':'Not saved — use Keep a progress copy on the islands.';label.classList.toggle('save-problem',!saveOK&&!saveBusy);if(!saveOK&&!saveBusy)message(label.title);}

 function persist(){const snapshot=clone(state),token=++saveToken;saveBusy=true;saveLabel();Promise.resolve().then(()=>opts.onChange(snapshot)).then(ok=>{if(stopped||token!==saveToken)return;saveBusy=false;saveOK=ok!==false;hasSaved=saveOK;saveLabel();}).catch(()=>{if(stopped||token!==saveToken)return;saveBusy=false;saveOK=false;saveLabel();});}
 function remember(before){history.push(before);if(history.length>30)history.shift();}
 function commit(before){if(JSON.stringify(before)===JSON.stringify(state))return;remember(before);persist();renderTools();}
 function button(attrs,text){return '<button type="button" '+attrs+'>'+text+'</button>';}
 function renderTools(){
  const focused=document.activeElement,focusAttr=['data-piece','data-gap','data-symbol','data-q'].find(a=>host.contains(focused)&&focused.hasAttribute(a)),focusValue=focusAttr&&focused.getAttribute(focusAttr);
  const restoreFocus=()=>{if(!focusAttr||transition)return;const replacement=host.querySelector('['+focusAttr+'="'+focusValue+'"]');if(replacement&&!replacement.disabled&&!replacement.closest('[inert]'))replacement.focus({preventScroll:true});else can.focus({preventScroll:true});};
  dirty=true;syncMotionControls();guidance();
  const tools=el('.quest-puzzle-tools'),actions=el('.quest-actions');
  el('.quest-kicker').textContent=viewStep<3?c.place+(opts.learnerName?' · '+opts.learnerName:''):'A LITTLE LIGHT, A BIG ADVENTURE';
  el('#quest-heading').textContent=viewStep<3?LABELS[viewStep]:'Lantern lit';
  el('.quest-chapter').textContent=viewStep<3?'Puzzle '+(viewStep+1)+' / 3':state.completed.length+' / 3 islands';
  el('.quest-instruction').textContent=viewStep<3?INSTRUCTIONS[viewStep]:c.name+' is complete. Another island is waiting.';
  el('.quest-win').hidden=viewStep!==3;
  el('.quest-gaps').hidden=viewStep!==0;el('.quest-gaps').innerHTML='';
  el('.quest-key-tip').textContent=viewStep===1?'Keyboard: arrow keys move your guide; Space adds a trail point.':viewStep===2?'Keyboard: focus the board and move the light with arrow keys.':'Choose a plank, then choose its matching gap. Dragging works too.';
  el('[data-q=reset]').hidden=success||viewStep===3;
  el('.quest-finger').hidden=!guard.penSeen();saveLabel();
  if(viewStep===3){
   closeMore();el('.quest-win').innerHTML='<span class="quest-kicker">'+state.completed.length+' OF 3 ISLANDS SHINING</span><h3>A light for '+c.place+'</h3><p>You built, found a way, and brought the lantern home.</p>';
   tools.innerHTML='<div class="quest-lanterns" aria-label="'+state.completed.length+' lanterns lit">'+[0,1,2].map(i=>'<span class="'+(state.completed.includes(i)?'lit':'')+'">✦</span>').join('')+'</div>';
   actions.innerHTML=button('data-q="next-island" class="quest-primary"','Next island')+button('data-q="paint"','Paint a memory')+button('data-q="home"','The islands');
   message(state.completed.length===3?'All three lanterns are home. You can explore the trails again.':'Your next island has a different path to discover.');
   restoreFocus();return;
  }
  if(viewStep===0){
   tools.innerHTML='<div class="quest-planks" role="group" aria-label="Bridge planks">'+c.pieces.map((n,i)=>button('data-piece="'+i+'" class="quest-plank '+(selected===i?'selected':'')+'" aria-label="Plank '+(i+1)+': '+n+' spaces" aria-pressed="'+(selected===i)+'" '+(state.bridge.includes(i)?'disabled':''),'<span class="plank-preview" aria-hidden="true">'+'▰'.repeat(n)+'</span><span>'+n+' '+(n===1?'space':'spaces')+'</span>')).join('')+'</div>';
   el('.quest-gaps').innerHTML=c.gaps.map((n,i)=>button('data-gap="'+i+'" style="left:'+([310,510,710][i]/W*100)+'%;top:'+ (335/H*100)+'%;width:'+Math.max(44,(n*32+10)/W*1000)/10+'%" data-filled="'+(state.bridge[i]>=0)+'" aria-label="Gap '+(i+1)+', '+n+' spaces'+(state.bridge[i]>=0?', filled':'')+'"','<span class="gap-label">'+(state.bridge[i]>=0?'✓ Gap '+(i+1):'Gap '+(i+1))+'</span>')).join('');
  }else if(viewStep===1){
   tools.innerHTML='<div class="quest-trail-tools"><span><b>✦ '+c.sparks.filter(p=>state.trail.some((v,i)=>i&&Q.segmentDistance(p,state.trail[i-1],v)<=38)).length+' / 3</b> sparks on your trail</span></div>';
  }else{
   tools.innerHTML='<div class="quest-code"><div class="quest-code-row"><span>Match this</span><span class="quest-code-target" aria-label="Code: '+c.code.map(i=>Q.SYMBOLS[i]).join(', ')+'">'+c.code.map(i=>'<i style="color:'+COLORS[i]+'">'+symbolIcon(i)+'</i>').join('<span class="quest-code-arrow" aria-hidden="true">→</span>')+'</span></div><div class="quest-code-row"><span>Your code</span><span class="quest-code-answer" aria-label="Your code: '+(state.code.map(i=>Q.SYMBOLS[i]).join(', ')||'empty')+'">'+[0,1,2].map(i=>'<i class="'+(i===state.code.length?'next-slot':'')+'"'+(state.code[i]!==undefined?' style="color:'+COLORS[state.code[i]]+'"':'')+'>'+(state.code[i]===undefined?i+1:symbolIcon(state.code[i]))+'</i>').join('<span class="quest-code-arrow" aria-hidden="true">→</span>')+'</span></div></div><div class="quest-symbols">'+Q.SYMBOLS.map((name,i)=>button('data-symbol="'+i+'" aria-label="'+name+'" '+(!state.found.includes(i)||state.code.length>=3?'disabled':''),'<b style="color:'+COLORS[i]+'">'+(state.found.includes(i)?symbolIcon(i):'?')+'</b><span>'+ (state.found.includes(i)?name:'Hidden')+'</span>')).join('')+'</div>';
  }
  if(success){closeMore();actions.innerHTML=button('data-q="continue" class="quest-primary"',viewStep===0?'Follow the fireflies →':'To the lantern →');}
  else actions.innerHTML=button('data-q="undo" '+(!history.length?'disabled':''),'↶ Undo')+button('data-q="hint" aria-pressed="'+hint+'"',hint?'Hide clue':'Clue')+button('data-q="more" aria-label="More puzzle options" aria-controls="quest-more" aria-expanded="false"','•••<small>More</small>')+button('data-q="check" class="quest-primary" '+(viewStep===2&&state.code.length<3?'disabled':''),viewStep===0?'Cross bridge':viewStep===1?'Follow trail':state.code.length<3?'Choose '+(3-state.code.length)+' shape'+(state.code.length===2?'':'s'):'Light lantern');
  tools.inert=success;
  el('.quest-finger').hidden=!guard.penSeen();saveLabel();restoreFocus();
 }
 const dismissed=new Set();let swallowClick=false;
 const ownsTarget=target=>host.contains(target)||!!opts.header?.contains(target);
 function closeMore(focus=false){el('#quest-more').hidden=true;el('[data-q=more]')?.setAttribute('aria-expanded','false');if(focus)el('[data-q=more]')?.focus({preventScroll:true});}
 function dismissDown(e){
  if(stopped||!ownsTarget(e.target))return;
  if(dismissed.has(e.pointerId)){e.preventDefault();e.stopImmediatePropagation();return;}
  swallowClick=false;
  if(dismissed.size||(!el('#quest-more').hidden&&!el('#quest-more').contains(e.target)&&!e.target.closest('[data-q=more]'))){
   dismissed.add(e.pointerId);swallowClick=true;e.preventDefault();e.stopImmediatePropagation();closeMore();
   if(e.target===can&&e.pointerType==='pen'&&guard.begin(e))guard.cancel();
  }
 }
 function consumeDismiss(e){if(!dismissed.has(e.pointerId))return;e.preventDefault();e.stopImmediatePropagation();if(e.type!=='pointermove')dismissed.delete(e.pointerId);}
 function consumeClick(e){if(swallowClick&&e.detail>0&&ownsTarget(e.target)){e.preventDefault();e.stopImmediatePropagation();}}
 function escapeOptions(e){if(e.key==='Escape'&&!el('#quest-more').hidden){e.preventDefault();e.stopImmediatePropagation();closeMore(true);}}
 document.addEventListener('pointerdown',dismissDown,true);for(const event of ['pointermove','pointerup','pointercancel'])document.addEventListener(event,consumeDismiss,true);document.addEventListener('click',consumeClick,true);document.addEventListener('keydown',escapeOptions,true);
 function pointFrom(e){const r=can.getBoundingClientRect();const p=[(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height];return p.every(v=>v>=0&&v<=1)?p:null;}
 function gapAt(p){if(!p||Math.abs(p[1]*H-335)>82)return -1;const x=p[0]*W;let best=-1;[310,510,710].forEach((v,i)=>{if(Math.abs(x-v)<86)best=i;});return best;}
 function place(gap,piece){const before=clone(state),r=Q.fitBridge(state,gap,piece);if(!r.ok){message('That plank does not fit this gap. Count the spaces and try another.');return;}state=r.state;selected=-1;burst([310,510,710][gap],335,'#f8d47c');commit(before);message('A good fit! '+state.bridge.filter(n=>n>=0).length+' of 3 gaps bridged.');}
 function append(p){if(!p)return;const a=state.trail;if(a.length>=Q.MAX_POINTS){message('This trail has lots of turns. Follow it, Undo, or Reset to try a shorter route.');return;}if(!a.length&&Q.distance(p,c.start)<48)p=[...c.start];if(!a.length||Q.distance(a[a.length-1],p)>3)a.push(p.map(v=>Math.round(v*10000)/10000));keyboard=[...p];}
 function illuminate(p){if(!p)return;light=p;const before=state.found.length;state=Q.reveal(state,p);if(state.found.length>before){const name=Q.SYMBOLS[state.found[state.found.length-1]];burst(light[0]*W,light[1]*H,'#f8d47c');message('You found the '+name+'! Match the shapes in the code.');renderTools();}}
 function down(e){
  dirty=true;
  if(!pointer)ignoreClickUntil=0;
  if(transition||success||viewStep===3||pointer||e.button>0)return;
  const piece=e.target.closest('[data-piece]'),onCanvas=e.target===can;
  if(!onCanvas&&!piece||piece?.disabled)return;
  if(!guard.begin(e))return;e.preventDefault();
  const p=pointFrom(e);pointer={id:e.pointerId,before:clone(state),selectionBefore:selected,piece:piece?Number(piece.dataset.piece):null,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false,target:e.target};
  e.target.setPointerCapture?.(e.pointerId);
  if(piece){selected=pointer.piece;message('Drag to a gap, or tap a gap after choosing.');}
  else if(viewStep===1){append(p);}
  else if(viewStep===2){illuminate(p);}
  can.focus({preventScroll:true});
 }
 function move(e){if(!pointer||!guard.move(e))return;dirty=true;e.preventDefault();if(Math.hypot(e.clientX-pointer.startX,e.clientY-pointer.startY)>7)pointer.moved=true;pointer.x=e.clientX;pointer.y=e.clientY;const p=pointFrom(e);pointer.at=p;
  if(pointer.piece!==null)return;
  if(viewStep===1){const batch=e.getCoalescedEvents?.();for(const event of batch?.length?batch:[e])append(pointFrom(event));}
  else if(viewStep===2)illuminate(p);
 }
 function end(e,cancel=false){if(!pointer||!guard.end(e))return;e.preventDefault();const gesture=pointer;pointer=null;ignoreClickUntil=performance.now()+180;
  if(cancel){state=gesture.before;selected=gesture.selectionBefore;renderTools();message('Move canceled. Your previous progress is kept.');return;}
  const p=pointFrom(e);
  if(gesture.piece!==null){if(gesture.moved){const gap=gapAt(p);if(gap>=0)place(gap,gesture.piece);else{renderTools();message('Drop over a bridge gap, or tap a gap to place this plank.');}}else renderTools();}
  else if(viewStep===0){const gap=gapAt(p);if(gap>=0&&selected>=0)place(gap,selected);else message('Choose a plank below, then tap one of the three gaps.');}
  else{if(viewStep===1)append(p);else illuminate(p);commit(gesture.before);renderTools();}
 }
 function cancelGesture(){if(!pointer)return;state=pointer.before;selected=pointer.selectionBefore;pointer=null;guard.cancel();renderTools();}
 function resetStage(){const before=clone(state);if(viewStep===0){state.bridge=[-1,-1,-1];selected=-1;}else if(viewStep===1){state.trail=[];keyboard=[...c.start];}else{state.found=[];state.code=[];}commit(before);message('A fresh try. There is no hurry.');}
 function check(){
  cancelGesture();const result=Q.advance(state);
  if(!result.ok){const words={bridge:'Fill all three gaps with planks that fit.',start:'Begin your trail at your explorer on the START circle.',water:'Your trail crosses water. Undo a turn or Reset, then go around the blue pools.',sparks:'Bring your trail close to all three golden sparks.',end:'Finish at the lantern marked FINISH.',code:'Compare Your code with Match this, from left to right. Use Undo to change a shape.'};message(words[result.reason]||'Try one more idea.');return;}
  state=result.state;success=true;history=[];acceptedRoute=viewStep===1?M.route(state.trail):null;persist();
  message(viewStep===0?'You made a way across!':viewStep===1?'Every spark is following your trail!':'The lantern is waking up!');
  opts.onSpeak?.(el('.quest-feedback').textContent);
  if(motion())animation={step:viewStep,elapsed:0,duration:[2400,3200,2100][viewStep],progress:0,collected:[],last:[...c.start]};
  renderTools();if(!animation&&viewStep===2)showWin();
 }
 function stageView(step){
  viewStep=step;history=[];selected=-1;hint=false;success=false;acceptedRoute=null;celebration=null;effects=[];
  keyboard=[...c.start];light=[.1,.5];renderTools();
  if(step<3)message(INSTRUCTIONS[step]);
 }
 // Only presentation is delayed. Q.advance and persist have already secured the checkpoint.
 function transitionTo(step,label,prepare){
  if(transition||stopped)return;closeMore();blockHeldKeys();cancelGesture();animation=null;celebration=null;effects=[];
  const change=()=>{if(prepare)prepare();stageView(step);};
  if(!motion()){change();syncMotionControls();can.focus({preventScroll:true});opts.onSpeak?.(INSTRUCTIONS[step]||label);return;}
  transition={elapsed:0,switched:false,change,step,label};
  el('.quest-transition p').textContent=label;el('.quest-transition').hidden=false;
  el('.quest-transition').style.opacity='0';syncMotionControls();dirty=true;
 }
 function finishTransition(skip=false){
  if(!transition)return;blockHeldKeys();const current=transition;
  if(!current.switched){current.switched=true;current.change();}
  transition=null;el('.quest-transition').hidden=true;if(current.step===3&&!skip)startCelebration('island');syncMotionControls();dirty=true;
  can.focus({preventScroll:true});opts.onSpeak?.(INSTRUCTIONS[current.step]||current.label);
 }
 function finishTravel(skip=false){
  blockHeldKeys();animation=null;celebration=null;dirty=true;
  if(viewStep===2){if(skip){stageView(3);syncMotionControls();can.focus({preventScroll:true});}else showWin();}
  else{if(!skip)startCelebration('stage');renderTools();if(skip)can.focus({preventScroll:true});}
 }
 function showWin(){transitionTo(3,'A light for '+c.place);}
 function nextStage(){transitionTo(state.step,viewStep===0?'Follow the fireflies':'Into the lantern hollow');}
 function skipAnimation(){if(transition)finishTransition(true);else if(animation)finishTravel(true);else if(celebration){celebration=null;syncMotionControls();dirty=true;}}
 function startCelebration(kind){if(motion()&&!document.hidden){celebration={kind,born:time};dirty=true;}}
 function visibility(){
  lastTime=performance.now();dirty=true;
  if(!document.hidden)return;
  cancelGesture();celebration=null;effects=[];
  if(animation)finishTravel(true);if(transition)finishTransition(true);syncMotionControls();
 }
 document.addEventListener('visibilitychange',visibility);

 function click(e){const b=e.target.closest('button');if(!b||b.disabled||stopped)return;
  if(b.dataset.q==='more'&&!transition){const tray=el('#quest-more');if(!tray.hidden){closeMore(true);return;}cancelGesture();tray.hidden=false;el('[data-q=more]')?.setAttribute('aria-expanded','true');tray.querySelector('button').focus({preventScroll:true});return;}
  if(performance.now()<ignoreClickUntil&&e.detail>0)return;
  if(b.dataset.q==='skip'){skipAnimation();return;}
  if(transition)return;
  if(pointer)return;
  if(b.dataset.piece!==undefined){selected=Number(b.dataset.piece);renderTools();message('Now tap the gap where this plank fits.');return;}
  if(b.dataset.gap!==undefined){const gap=Number(b.dataset.gap);if(selected>=0)place(gap,selected);else if(state.bridge[gap]>=0){const before=clone(state);state.bridge[gap]=-1;commit(before);message('Plank returned. Choose another idea.');}else message('Choose a plank first.');return;}
  if(b.dataset.symbol!==undefined){const before=clone(state);state.code.push(Number(b.dataset.symbol));commit(before);message(state.code.length===3?'Ready? Try lighting the lantern.':'Choose the next shape in the pictured code.');return;}
  switch(b.dataset.q){
   case'close-more':closeMore(true);break;
   case'undo':if(history.length){state=history.pop();selected=-1;persist();renderTools();message('One move back. Try another idea.');}break;
   case'reset':closeMore();resetStage();el('[data-q=more]')?.focus({preventScroll:true});break;
   case'hint':hint=!hint;renderTools();message(hint?['Count the little spaces. A plank needs the same number.','The dotted trail shows one safe way. You can choose your own.','The faint rings show places to shine your lantern.'][viewStep]:'Clue tucked away. Your progress stays.');break;
   case'check':check();break;
   case'continue':nextStage();break;
   case'next-island':{const next=Q.nextChapter(state);state=next;persist();transitionTo(0,'Next stop: '+Q.chapter(next.chapter).place,()=>{c=Q.chapter(next.chapter);});break;}
   case'home':opts.onHome();break;
   case'paint':opts.onPaint();break;
  }
 }
 function key(e){
  if(pointer){if(e.key.startsWith('Arrow')||e.code==='Space'||e.key==='Enter')e.preventDefault();return;}
  dirty=true;
  if(transition||success||viewStep===3)return;
  if(e.key.startsWith('Arrow')){e.preventDefault();const p=viewStep===2?light:keyboard;p[0]=Math.max(.02,Math.min(.98,p[0]+({ArrowLeft:-.04,ArrowRight:.04}[e.key]||0)));p[1]=Math.max(.04,Math.min(.96,p[1]+({ArrowUp:-.065,ArrowDown:.065}[e.key]||0)));
   if(viewStep===2){const before=clone(state);illuminate([...p]);commit(before);}else keyboard=[...p];
  }
  if((e.code==='Space'||e.key==='Enter')&&viewStep===1){e.preventDefault();const before=clone(state);append([...keyboard]);commit(before);}
 }
 function fit(){const box=el('.quest-scene').getBoundingClientRect(),w=Math.max(1,box.width),h=Math.max(1,box.height);stretch=h/(w*H/W);surface.style.width=w+'px';surface.style.height=h+'px';can.width=W*2;can.height=Math.round(H*2*stretch);g.setTransform(2,0,0,2*stretch,0,0);dirty=true;}
 const observer=new ResizeObserver(fit);observer.observe(el('.quest-scene'));
 host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);host.addEventListener('pointerup',end);const canceled=e=>end(e,true);host.addEventListener('pointercancel',canceled);host.addEventListener('lostpointercapture',canceled);host.addEventListener('click',click);can.addEventListener('keydown',key);
 el('.quest-finger').onclick=()=>{cancelGesture();guard.allowFinger();el('.quest-finger').hidden=true;closeMore(true);message('Finger play is ready.');};
 // Original code-drawn scenery shares the explorer and forest artwork with the islands.
 function text(t,x,y,size=16,color='#345b56',align='center'){g.save();g.translate(x,y);g.scale(1,1/stretch);g.fillStyle=color;g.font='700 '+(size*Math.min(1.8,Math.max(1,650/surface.clientWidth)))+'px system-ui';g.textAlign=align;g.fillText(t,0,0);g.restore();}
 function ground(night=false){
  const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,night?'#102e45':'#c7e5dc');sky.addColorStop(1,night?'#285245':'#8cbe98');g.fillStyle=sky;g.fillRect(0,0,W,H);
  for(let i=0;i<7;i++){const x=(i*181+60)%W;A.ellipse(g,x,500,250,170,night?'#1c4847':'#b2d0a3');}
  for(let i=0;i<13;i++){const x=(i*137+20)%W,y=80+(i%3)*40;sprites.pine(g,x,y,1.05+(i%3)*.2);}
  for(let i=0;i<22;i++){const x=(i*97+30)%W,y=110+(i*47)%410;A.ellipse(g,x,y,4,2,night?'#78a993':'#e2e6b4');}
 }
 function plank(x,y,n,alpha=1){g.save();g.globalAlpha=alpha;const w=n*32;A.round(g,x-w/2,y-18,w,36,6,'#d49b5d');A.round(g,x-w/2+3,y-15,w-6,5,2,'#f3ce8a');for(let j=1;j<n;j++)A.line(g,[[x-w/2+j*32,y-13],[x-w/2+j*32,y+13]],'#916541',2);for(const xx of [x-w/2+9,x+w/2-9])A.ellipse(g,xx,y+9,2.5,2.5,'#735c49');g.restore();}
 function burst(x,y,color){if(!motion())return;effects.push({x,y,color,born:time});if(effects.length>12)effects.shift();dirty=true;}
 function drawEffects(){
  if(!motion()){effects=[];return;}
  effects=effects.filter(e=>time-e.born<.85);
  for(const e of effects){const p=Math.min(1,(time-e.born)/.85);g.save();g.globalAlpha=1-p;
   for(let i=0;i<7;i++){const a=i*Math.PI*2/7;A.star(g,e.x+Math.cos(a)*p*45,e.y+Math.sin(a)*p*30,3+(1-p)*4,e.color,a+p);}
   g.restore();
  }
 }
 function explorer(x,y,size,walking=false,direction=1){
  const stride=walking&&motion()?1:0,cheer=celebration?time-celebration.born:1,hop=motion()&&cheer<.72?Math.sin(Math.PI*cheer/.72)*16:0,bounce=stride*Math.abs(Math.sin(time*5.2))*3+hop;
  g.save();g.translate(x,y);g.scale(direction,1/stretch);g.translate(0,-bounce);
  if(stride)g.rotate(Math.sin(time*5.2)*.025);else if(hop)g.rotate(-Math.sin(cheer/.72*Math.PI*2)*.06);
  A.hero(g,0,0,size,opts.avatar,motion()?time*.82:0,opts.artwork,stride);g.restore();
 }
 function firefly(x,y){
  g.save();g.translate(x,y);g.scale(1,1/stretch);
  const glow=g.createRadialGradient(0,0,0,0,0,12);glow.addColorStop(0,'#fff1a8bb');glow.addColorStop(1,'#ffe89100');g.fillStyle=glow;g.fillRect(-12,-12,24,24);
  A.ellipse(g,-3,-2,3,1.5,'#fff9d18c');A.ellipse(g,3,-2,3,1.5,'#fff9d18c');A.ellipse(g,0,0,2.4,2.4,'#ffe289');g.restore();
 }
 function drawBridge(){
  ground();g.fillStyle='#62b5bd';g.beginPath();g.moveTo(240,0);g.bezierCurveTo(450,170,510,200,770,560);g.lineTo(210,560);g.bezierCurveTo(400,250,200,220,130,0);g.fill();
  for(let i=0;i<16;i++){const y=(i*43+time*7)%H;A.line(g,[[300+(i%3)*32,y],[330+(i%3)*32,y]],'#c8ece570',3);}
  A.island(g,120,380,170,82,130);A.island(g,910,380,150,85,130);
  A.line(g,[[180,333],[850,333]],'#f0dbac',55);A.line(g,[[180,362],[850,362]],'#8e775b',6);A.line(g,[[180,304],[850,304]],'#8e775b',4);
  [310,510,710].forEach((x,i)=>{const width=c.gaps[i]*32;A.round(g,x-width/2-5,313,width+10,45,5,'#285f6c');g.save();g.strokeStyle='#d3e4d6';g.setLineDash([6,6]);g.strokeRect(x-width/2,317,width,36);g.restore();for(let j=1;j<c.gaps[i];j++)A.line(g,[[x-width/2+j*32,320],[x-width/2+j*32,351]],'#9ec8c0',2);if(state.bridge[i]>=0)plank(x,335,c.gaps[i]);text(String(i+1),x,394,23,'#fff9e2');if(hint)text(c.gaps[i]+(c.gaps[i]===1?' space':' spaces'),x,275,18);});
  sprites.tree(g,83,327,.9,true);sprites.tree(g,918,305,.85);sprites.fox(g,875,350-(celebration&&motion()?Math.max(0,Math.sin(Math.min(1,(time-celebration.born)/.9)*Math.PI))*9:0),.85);
  const t=animation?.step===0?animation.progress:success?1:0;explorer(170+t*665,324,1.05,!!animation);
  text('WILLOW & WATER',120,465,14,'#517e6a');text('A WAY TOGETHER',876,470,14,'#517e6a');
  if(pointer?.piece!==null&&pointer?.at)plank(pointer.at[0]*W,pointer.at[1]*H,c.pieces[pointer.piece],.9);
 }
 function lantern(x,y,scale=1,lit=true){g.save();g.translate(x,y);g.scale(scale,scale/stretch);if(lit){const halo=g.createRadialGradient(0,0,1,0,0,58);halo.addColorStop(0,'#fff1ad9c');halo.addColorStop(1,'#fff1ad00');g.fillStyle=halo;g.fillRect(-58,-58,116,116);}A.round(g,-14,-21,28,40,5,lit?'#f5d977':'#809c91');A.line(g,[[-20,-21],[0,-33],[20,-21]],'#467875',6);A.line(g,[[-20,21],[20,21]],'#467875',6);g.restore();}
 function drawTrail(){
  ground();c.water.forEach(p=>{A.ellipse(g,p.x*W,p.y*H,p.r+10,p.r+10,'#8baa8d');A.ellipse(g,p.x*W,p.y*H,p.r,p.r,'#65adb6');A.ellipse(g,p.x*W-8,p.y*H-10,p.r*.7,p.r*.6,'#8cc8c5');A.line(g,[[p.x*W-16,p.y*H],[p.x*W+20,p.y*H]],'#c4ece0',3);});
  if(hint){g.save();g.setLineDash([9,12]);A.line(g,[c.start,...c.sparks,c.end].map(p=>[p[0]*W,p[1]*H]),'#fff9cfbb',10);g.restore();}
  A.ellipse(g,c.start[0]*W,c.start[1]*H,38,28,'#f5ebbb');text('START',c.start[0]*W,c.start[1]*H+52,15);
  if(state.trail.length>1){A.line(g,state.trail.map(p=>[p[0]*W,p[1]*H+4]),'#3d71674d',15);A.line(g,state.trail.map(p=>[p[0]*W,p[1]*H]),'#fff0a6',10);}
  c.sparks.forEach((p,i)=>{if(animation?.collected.includes(i))return;const x=p[0]*W,y=p[1]*H;A.ellipse(g,x,y,27,27,'#fff7c65c');A.star(g,x,y+(motion()?Math.sin(time*2+i)*3:0),17,'#ffe077',0);});
  lantern(c.end[0]*W,c.end[1]*H,1,true);text('FINISH',c.end[0]*W,c.end[1]*H+52,15);
  // A drawn route is a proposal: Comet waits at START until the rule engine accepts it.
  const pose=success&&acceptedRoute?M.sample(acceptedRoute,animation?.progress??1):{point:c.start,direction:1};
  const at=pose.point;explorer(at[0]*W,at[1]*H-5,.8,!!animation,pose.direction);
  if(animation?.step===1){
   c.sparks.forEach((spark,i)=>{if(!animation.collected.includes(i)&&Q.segmentDistance(spark,animation.last,at)<=38){animation.collected.push(i);burst(spark[0]*W,spark[1]*H,'#ffe49a');}});
   animation.last=[...at];
   animation.collected.forEach((n,i)=>{const follower=M.sample(acceptedRoute,Math.max(0,animation.progress-(i+1)*.035)).point;firefly(follower[0]*W,follower[1]*H-24+Math.sin(time*5+i)*5,i);});
  }
  if(success&&!animation&&motion())for(let i=0;i<3;i++)firefly(at[0]*W+Math.cos(time*2+i*2.1)*24,at[1]*H-48+Math.sin(time*2+i*2.1)*12,i);
  if(document.activeElement===can&&!pointer){g.strokeStyle='#326b70';g.lineWidth=3;g.strokeRect(keyboard[0]*W-12,keyboard[1]*H-12,24,24);}
 }
 function symbol(i,x,y){g.save();g.translate(x,y);g.scale(1,1/stretch);g.fillStyle=COLORS[i];if(i===0)A.star(g,0,0,24,COLORS[i]);else if(i===1){A.ellipse(g,0,0,22,22,COLORS[i]);A.ellipse(g,10,-7,19,19,'#315c63');}else if(i===2){g.rotate(-.45);A.ellipse(g,0,0,14,25,COLORS[i]);A.line(g,[[0,20],[0,-15]],'#4d8e78',2);}else A.poly(g,[[0,-25],[20,0],[0,25],[-20,0]],COLORS[i]);g.restore();}
 function drawHollow(){
  ground(true);c.symbols.forEach((p,i)=>{A.ellipse(g,p[0]*W,p[1]*H,41,38,'#315c63');symbol(i,p[0]*W,p[1]*H);});
  fg.clearRect(0,0,W,H);fg.fillStyle='#061d31ee';fg.fillRect(0,0,W,H);fg.save();fg.globalCompositeOperation='destination-out';const glow=fg.createRadialGradient(light[0]*W,light[1]*H,28,light[0]*W,light[1]*H,155);glow.addColorStop(0,'#000');glow.addColorStop(.5,'#000e');glow.addColorStop(1,'#0000');fg.fillStyle=glow;fg.fillRect(0,0,W,H);fg.restore();g.drawImage(fog,0,0);
  c.symbols.forEach((p,i)=>{if(state.found.includes(i)){A.ellipse(g,p[0]*W,p[1]*H,42,38,'#315c63');symbol(i,p[0]*W,p[1]*H);g.strokeStyle='#dcc98b';g.lineWidth=2;g.beginPath();g.arc(p[0]*W,p[1]*H,44,0,Math.PI*2);g.stroke();}else if(hint){g.strokeStyle='#c4d4c96b';g.lineWidth=3;g.beginPath();g.arc(p[0]*W,p[1]*H,46,0,Math.PI*2);g.stroke();}});
  for(let i=0;i<20;i++)A.ellipse(g,(i*97+30)%W,20+(i*39)%H,1.5,1.5,'#efdf9670');
  lantern(light[0]*W,light[1]*H,.8);sprites.hero(g,88,490,.85,opts.avatar,0,opts.artwork);
  if(animation?.step===2){const p=animation.progress,x=light[0]*W,y=light[1]*H,r=55+p*240,glow=g.createRadialGradient(x,y,0,x,y,r);glow.addColorStop(0,'#ffe59888');glow.addColorStop(1,'#ffe59800');g.fillStyle=glow;g.fillRect(x-r,y-r,r*2,r*2);g.save();g.globalAlpha=Math.sin(p*Math.PI)*.6;g.strokeStyle='#ffe6a8';g.lineWidth=3;g.beginPath();g.arc(x,y,25+p*110,0,Math.PI*2);g.stroke();g.restore();}
 }
 function drawWin(){
  ground(true);const beam=g.createRadialGradient(770,190,0,770,190,500);beam.addColorStop(0,'#ffe39caa');beam.addColorStop(1,'#ffe39c00');g.fillStyle=beam;g.fillRect(0,0,W,H);A.island(g,750,450,240,75,120);A.island(g,220,495,260,70,95);
  A.poly(g,[[728,420],[736,205],[792,205],[808,420]],'#f5e5b3');A.round(g,722,174,83,57,6,'#286d7c');A.poly(g,[[708,174],[765,115],[822,174]],'#66bcb7');lantern(765,198,1.1);A.star(g,765,100,17,c.color);
  explorer(240,465,1.5);sprites.fox(g,340,477,1.2);sprites.tree(g,140,470,1,true);sprites.pine(g,910,425,1.1);
  for(let i=0;i<30;i++)A.star(g,(i*89+40)%W,25+(i*67)%H,2+i%3,'#ffdfa1',motion()?time*.1:0);
 }
 function run(now){
  if(stopped)return;const dt=Math.min(.05,(now-lastTime)/1000);lastTime=now;const moving=motion(),visible=!document.hidden;
  if(moving&&visible)time+=dt;
  if(celebration&&(!moving||time-celebration.born>=(celebration.kind==='stage'?1.95:2.6))){celebration=null;syncMotionControls();dirty=true;}
  if(animation){
   if(visible)animation.elapsed+=dt*1000;
   const p=moving?Math.min(1,animation.elapsed/animation.duration):1;animation.progress=p*p*(3-2*p);
   if(p===1)finishTravel();
  }
  if(transition){
   if(visible)transition.elapsed+=dt*1000;
   const p=moving?Math.min(1,transition.elapsed/950):1;
   if(p>=.5&&!transition.switched){transition.switched=true;transition.change();}
   el('.quest-transition').style.opacity=String(p<.4?p/.4:p>.6?(1-p)/.4:1);
   el('.quest-transition-light').style.transform='scale('+(0.8+p*.6)+') rotate('+(p*25)+'deg)';
   if(p===1)finishTransition();
  }
  if(!visible||(!dirty&&(!moving||now-lastDraw<33))){frame=requestAnimationFrame(run);return;}
  dirty=false;lastDraw=now;g.clearRect(0,0,W,H);
  if(viewStep===0)drawBridge();else if(viewStep===1)drawTrail();else if(viewStep===2)drawHollow();else drawWin();
  if(celebration&&moving)A.celebrate(g,W,H,time-celebration.born,celebration.kind);drawEffects();frame=requestAnimationFrame(run);
 }
 renderTools();el('#quest-heading').tabIndex=-1;el('#quest-heading').focus({preventScroll:true});message(viewStep<3?INSTRUCTIONS[viewStep]:'Your lantern is still shining.');fit();opts.onSpeak?.(INSTRUCTIONS[viewStep]||'Your lantern is home.');frame=requestAnimationFrame(run);
 return()=>{stopped=true;hud.remove();document.removeEventListener('visibilitychange',visibility);document.removeEventListener('pointerdown',dismissDown,true);for(const event of ['pointermove','pointerup','pointercancel'])document.removeEventListener(event,consumeDismiss,true);document.removeEventListener('click',consumeClick,true);document.removeEventListener('keydown',escapeOptions,true);dismissed.clear();root.removeEventListener('keydown',trackKey,true);root.removeEventListener('keyup',releaseKey,true);heldKeys.clear();blockedKeys.clear();animation=null;transition=null;celebration=null;effects=[];cancelAnimationFrame(frame);observer.disconnect();guard.cancel();pointer=null;host.removeEventListener('pointerdown',down);host.removeEventListener('pointermove',move);host.removeEventListener('pointerup',end);host.removeEventListener('pointercancel',canceled);host.removeEventListener('lostpointercapture',canceled);host.removeEventListener('click',click);can.removeEventListener('keydown',key);can.width=can.height=fog.width=fog.height=1;};
}
root.WWQuestUI=Object.freeze({version:'0.9.0',mount});
})(globalThis);

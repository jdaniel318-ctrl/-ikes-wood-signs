/* Wonderwake Shadecraft. Local painting; no external drawing service. */
(function(root){'use strict';
const PAPER='#fffdf3';
const COLORS=[['#245e73','Ocean blue'],['#e16d52','Coral red'],['#e8ae39','Sunshine gold'],['#49977c','Leaf green'],['#8368ad','Twilight purple'],['#ffffff','Snow white'],['#243444','Midnight'],['#439dcc','Sky blue'],['#e898b5','Blossom pink'],['#a6c76b','Lime green'],['#a67751','Earth brown'],['#f3c8a0','Peach']];
const NEUTRALS=[['#000000','Pure black'],['#333333','Charcoal gray'],['#666666','Dark gray'],['#999999','Mid gray'],['#cccccc','Light gray'],['#ffffff','Pure white']];
const TOOLS=[['pen','Pen'],['pencil','Pencil'],['marker','Marker'],['eraser','Eraser'],['brush','Soft brush']];
const PATHS={layers:'m12 3 9 5-9 5-9-5 9-5 M3 12l9 5 9-5 M3 16l9 5 9-5',undo:'M9 5 4 10l5 5 M4 10h10a6 6 0 0 1 0 12',redo:'m15 5 5 5-5 5 M20 10H10a6 6 0 0 0 0 12',more:'M5 12h.01M12 12h.01M19 12h.01',gallery:'M4 4h16v16H4z M4 16l5-5 4 4 3-3 4 4 M15 8h.01',close:'m6 6 12 12 M18 6 6 18',download:'M12 3v12m-5-5 5 5 5-5 M4 17v4h16v-4',check:'m5 12 4 4L20 5'};
function icon(name){return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="'+PATHS[name]+'"/></svg>';}
function tip(tool){return '<span class="pen-tip '+tool+'" aria-hidden="true"><i></i></span>';}
const stroke=(...args)=>WWPaint.stroke(...args);
const paint=(...args)=>WWPaint.paint(...args);
// Iterative Ramer-Douglas-Peucker: keep corners, remove redundant samples.
// Tolerance is one quarter of a logical pixel; original exports are never rewritten.
function simplify(points,ratio){
 if(points.length<3)return points;const h=800/ratio,keep=new Uint8Array(points.length);keep[0]=keep[points.length-1]=1;
 // Bound worst-case work for a long zigzag; each window retains its endpoints.
 const ranges=[];for(let a=0;a<points.length-1;a+=256){const b=Math.min(a+256,points.length-1);keep[a]=keep[b]=1;ranges.push([a,b]);}
 while(ranges.length){const [a,b]=ranges.pop(),x=points[a][0]*800,y=points[a][1]*h,dx=points[b][0]*800-x,dy=points[b][1]*h-y,den=dx*dx+dy*dy;
  let max=.25*.25,at=-1;for(let i=a+1;i<b;i++){const px=points[i][0]*800-x,py=points[i][1]*h-y,t=den?Math.max(0,Math.min(1,(px*dx+py*dy)/den)):0,d=(px-t*dx)**2+(py-t*dy)**2;if(d>max){max=d;at=i;}}
  if(at>=0){keep[at]=1;ranges.push([a,at],[at,b]);}
 }return points.filter((_,i)=>keep[i]);
}

function colorFromHSV(h,s,v){
 h=((h%360)+360)%360;s=Math.max(0,Math.min(1,s));v=Math.max(0,Math.min(1,v));
 const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;
 const rgb=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
 return '#'+rgb.map(n=>Math.round((n+m)*255).toString(16).padStart(2,'0')).join('');
}
function hsvFromColor(hex){
 const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255),v=Math.max(r,g,b),d=v-Math.min(r,g,b);
 const h=!d?0:v===r?60*(((g-b)/d+6)%6):v===g?60*((b-r)/d+2):60*((r-g)/d+4);
 return {h,s:v?d/v:0,v};
}

function mount(host,opts={}){
 const compact=!!opts.fit,guided=!!opts.guided&&!compact,limits=root.WWCore.DRAWING_LIMITS;
 const numberInput=!!opts.count&&!!opts.writeNumber&&!compact;
 let answerMode='dots',writtenNumber=null;
 const answerPapers={dots:null,write:null};
 const isCounting=()=>!!opts.count&&answerMode==='dots';
 let strokes=[],redo=[],color=COLORS[0][0],size=compact?4:8,tool='pen',current=null,dirty=false,pending=null,editVersion=0,totalPoints=0,frame=0,disposed=false,paper=null,trayOpener=null;
 const initialConfirmed=!!opts.initial&&opts.initialSaved!==false;
 let saveBusy=false,saveFailed=!!opts.initial&&!initialConfirmed,hasSaved=initialConfirmed,savedVersion=initialConfirmed?0:-1,paperGeneration=0;
 if(opts.initial&&!initialConfirmed)dirty=true;
 const toolSizes={pen:4,pencil:4,marker:14,eraser:24,brush:20,...opts.tools?.sizes};
 const toolOpacities={pen:100,pencil:78,marker:38,eraser:100,brush:25,...opts.tools?.opacities};
 let layers=compact?(opts.initial?.layers?JSON.parse(JSON.stringify(opts.initial.layers)):[{id:1,name:'My drawing',visible:true,locked:false,opacity:100}]):null;
 let activeLayer=layers?.findLast(l=>l.visible&&!l.locked)?.id||layers?.at(-1)?.id;
 if(opts.initial){paper=opts.initial.paper?{...opts.initial.paper}:{width:1600,height:960};strokes=JSON.parse(JSON.stringify(opts.initial.strokes));if(!opts.initial.layers)strokes=strokes.map(s=>({...s,...(s.tool==='eraser'?{tool:'pen',color:PAPER}:{}),layer:1}));totalPoints=strokes.reduce((n,s)=>n+s.points.length,0);}
 let customColors=(opts.tools?.colors||[]).map(c=>c.toLowerCase()),toolSaveRevision=0;
 if(compact)size=toolSizes.pen;
 let trayTimer=0,closingUntil=0,suppressClick=false;
 const dismissedPointers=new Set(),dismissedClicks=new Set();
 const guard=WWCreative.pointerGuard();
 const palette=COLORS.map(([c,n],i)=>'<button type="button" class="paint-color '+(i===0?'selected':'')+'" style="--paint:'+c+'" data-color="'+c+'" aria-label="'+n+'" aria-pressed="'+(i===0)+'"></button>').join('');
 const sizes='<label>Brush <select class="paint-size" aria-label="Brush size"><option value="4">Fine</option><option value="8" selected>Medium</option><option value="14">Bold</option><option value="24">Big</option></select></label>';
 const neutrals=NEUTRALS.map(([c,n])=>'<button type="button" class="paint-color" style="--paint:'+c+'" data-color="'+c+'" aria-label="'+n+'" aria-pressed="false"></button>').join('');
 const save='<button type="button" class="primary paint-save" aria-label="Save to my gallery">'+(compact?icon('check')+'<span>Save</span>':'Save to my gallery')+'</button>';
 const download='<button type="button" class="secondary paint-download">'+(compact?icon('download'):'')+'Download picture</button>';
 host.innerHTML='<section class="paint-workshop '+(compact?'openpaper':'')+'">'+
  (compact?'':'<div class="paint-heading"><span class="eyebrow">'+(opts.count?'PICTURE ANSWER · ONE DOT FOR EACH OBJECT':'YOUR IDEAS, IN COLOR')+'</span><h3></h3><p class="paint-instruction"></p></div><div class="paint-palette" role="group" aria-label="Paint colors">'+palette+sizes+'</div>')+
  '<div class="paint-paper"><div class="paper-surface"><canvas id="paint-canvas" class="paint-canvas" aria-label="Drawing paper: use a finger, Pencil or mouse"></canvas><canvas class="paint-live" aria-hidden="true"></canvas></div></div>'+
  (compact?'<div class="paint-dock" role="toolbar" aria-label="Drawing tools"><button type="button" class="dock-button color-toggle" data-tray="colors" aria-label="Colors" aria-expanded="false" aria-controls="paint-colors"><span class="color-well" style="--paint:'+color+'"></span><small>Colors</small></button><button type="button" class="dock-button pen-toggle" data-tray="pens" aria-label="Choose pen" aria-expanded="false" aria-controls="paint-pens">'+tip(tool)+'<small>Pen</small></button><button type="button" class="dock-button" data-tray="layers" aria-label="Layers" aria-expanded="false" aria-controls="paint-layers">'+icon('layers')+'<small>Layers</small></button><span class="dock-divider"></span><button type="button" class="dock-button paint-undo" aria-label="Undo stroke">'+icon('undo')+'<small>Undo</small></button><button type="button" class="dock-button paint-redo" aria-label="Redo stroke">'+icon('redo')+'<small>Redo</small></button><span class="dock-divider"></span><button type="button" class="dock-button" data-tray="more" aria-label="More drawing options" aria-expanded="false" aria-controls="paint-more">'+icon('more')+'<small>More</small></button></div>':'<div class="learn-controls"><button type="button" class="secondary paint-undo">Undo stroke</button><button type="button" class="secondary paint-clear">Clear paper</button><button type="button" class="secondary paint-finger">Enable finger drawing</button></div>')+
  '<p class="paint-state" role="status">'+(opts.count?'Tap to place one dot. Undo removes one dot.':compact?'Make something only you can imagine. Save to keep it.':'Draw freely. Your picture is temporary until you save it to your gallery.')+'</p>'+
  (compact?'<div class="paint-tray" id="paint-colors" role="dialog" aria-label="Choose a color" hidden><div class="tray-heading"><strong>Colors</strong><button class="tray-close" aria-label="Close color choices">'+icon('close')+'</button></div><div class="paint-palette" role="group" aria-label="Paint colors">'+palette+'</div><p class="color-name">Ocean blue</p></div><div class="paint-tray" id="paint-pens" role="dialog" aria-label="Choose a pen" hidden><div class="tray-heading"><strong>Your drawing tools</strong><button class="tray-close" aria-label="Close pen choices">'+icon('close')+'</button></div><div class="pen-choices" role="group" aria-label="Pen styles">'+TOOLS.map(([t,n])=>'<button type="button" class="pen-choice '+(t===tool?'selected':'')+'" data-tool="'+t+'" aria-pressed="'+(t===tool)+'">'+tip(t)+'<span>'+n+'</span></button>').join('')+'</div><div class="size-choices" role="group" aria-label="Line thickness">'+[4,8,14,24].map((n,i)=>'<button type="button" data-size="'+n+'" aria-label="'+['Fine','Medium','Bold','Big'][i]+' line" aria-pressed="'+(n===size)+'" class="'+(n===size?'selected':'')+'"><i style="--tip-size:'+Math.max(3,n*.7)+'px"></i><small>'+['Fine','Medium','Bold','Big'][i]+'</small></button>').join('')+'</div></div><div class="paint-tray paint-more" id="paint-more" role="dialog" aria-label="More drawing options" hidden><div class="tray-heading"><strong>A little more</strong><button class="tray-close" aria-label="Close drawing options">'+icon('close')+'</button></div>'+download+'<button type="button" class="secondary paint-finger">Enable finger drawing</button><button type="button" class="secondary paint-clear">New paper</button><button type="button" class="secondary" data-action="studio">Build with shapes</button></div>':'<div class="learn-controls">'+save+download+(opts.onAnswer?'<button type="button" class="primary gold paint-answer">'+(opts.count?'Check my picture answer':'Reveal and compare')+'</button>':'')+'</div><div class="paint-compare" role="status"></div>')+'</section>';
 const workshop=host.querySelector('.paint-workshop'),can=host.querySelector('#paint-canvas'),live=host.querySelector('.paint-live'),surface=host.querySelector('.paper-surface'),paperWrap=host.querySelector('.paint-paper'),state=host.querySelector('.paint-state');
 let headerActions=null;
 if(compact){headerActions=document.createElement('div');headerActions.className='paint-header-actions';headerActions.innerHTML='<button type="button" class="paint-gallery" data-action="gallery" aria-label="My picture gallery">'+icon('gallery')+'<span>Gallery</span></button>'+save;(opts.header||workshop).append(headerActions);}
 else{host.querySelector('h3').textContent=opts.title||'Paint a little wonder.';host.querySelector('.paint-instruction').textContent=opts.instruction||'Make a sky, a creature, or a world nobody has seen before.';}

 if(compact){
  const colorTray=host.querySelector('#paint-colors');
  colorTray.innerHTML='<div class="tray-heading"><strong>Colors</strong><button type="button" class="tray-close" aria-label="Close color choices">Done</button></div><div class="palette-view"><section class="neutral-colors"><strong>Black, gray &amp; white</strong><div class="paint-palette neutral-palette" role="group" aria-label="Grayscale colors">'+neutrals+'</div><label class="gray-label" for="gray-slider">Any shade of gray <output class="gray-value">128</output></label><input id="gray-slider" class="gray-slider" type="range" min="0" max="255" value="128" aria-label="Grayscale"><button type="button" class="keep-gray">Keep this gray</button></section><div class="paint-palette" role="group" aria-label="Paint colors">'+palette+'</div><p class="color-name">Ocean blue</p><div class="custom-colors-section"><span class="custom-colors-label">My colors</span><div class="custom-palette paint-palette" role="group" aria-label="My custom colors"></div><p class="custom-empty">Make a color and keep it here.</p></div><button type="button" class="secondary open-color-wheel">Make a color</button><button type="button" class="remove-custom" hidden>Remove selected custom color</button></div><div class="color-maker" hidden><button type="button" class="color-maker-back">← My palette</button><div class="color-wheel-wrap"><canvas class="color-wheel" width="256" height="256" tabindex="0" role="slider" aria-label="Color wheel" aria-valuemin="0" aria-valuemax="359" aria-valuenow="0" aria-describedby="wheel-help"></canvas><span class="color-wheel-cursor" aria-hidden="true"></span></div><p id="wheel-help" class="wheel-help">Slide to mix. Arrow keys change hue and intensity.</p><label class="brightness-label">Intensity <input type="range" class="color-saturation" min="0" max="100" value="100" aria-label="Color intensity"></label><label class="brightness-label">Brightness <input type="range" class="color-brightness" min="0" max="100" value="100" aria-label="Color brightness"></label><div class="custom-color-entry"><span class="custom-color-preview" aria-hidden="true"></span><label>Hex color<input class="custom-color-hex" type="text" value="#ff0000" maxlength="7" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Custom color hex"></label><button type="button" class="primary add-custom-color">Add color</button></div><p class="custom-color-message" role="status"></p></div>';
  host.querySelector('.size-choices').outerHTML='<div class="size-control"><div class="size-label"><label for="pen-size-slider">Pen size</label><output for="pen-size-slider" class="pen-size-value">4</output></div><input id="pen-size-slider" class="pen-size-slider" type="range" min="1" max="40" step="1" value="4" aria-label="Pen size"><div class="pen-size-preview" aria-hidden="true"><i></i></div><small>Slide from fine to broad.</small></div>';
  host.querySelector('.size-control').insertAdjacentHTML('beforeend','<div class="opacity-control"><div class="size-label"><label for="opacity-slider">Pen opacity</label><output class="opacity-value" for="opacity-slider">100%</output></div><input id="opacity-slider" class="opacity-slider" type="range" min="1" max="100" value="100" aria-label="Pen opacity"><small>Light shading ← → Solid color</small></div>');
  workshop.insertAdjacentHTML('beforeend','<div class="paint-tray" id="paint-layers" role="dialog" aria-label="Picture layers" hidden><div class="tray-heading"><strong>Layers</strong><button type="button" class="tray-close" aria-label="Close layers">Done</button></div><p class="layer-help">Draw details above your background.</p><div class="layer-list"></div><button type="button" class="secondary add-layer" aria-label="Add layer">+ Add layer</button><div class="layer-settings"><label for="layer-name">Layer name</label><input id="layer-name" maxlength="24" aria-label="Layer name"><div class="layer-actions"><button type="button" data-layer-action="visible">Hide</button><button type="button" data-layer-action="locked">Lock</button><button type="button" data-layer-action="up">Move up</button><button type="button" data-layer-action="down">Move down</button></div><label class="size-label" for="layer-opacity">Layer opacity <output class="layer-opacity-value">100%</output></label><input id="layer-opacity" type="range" min="1" max="100" value="100" aria-label="Layer opacity"><button type="button" class="remove-layer">Remove this layer</button></div><p class="layer-paper-note">Cream paper stays underneath. Erase only the selected layer.</p></div>');
  host.querySelectorAll('.tray-close').forEach(b=>b.textContent='Done');
 }
 if(guided){
  workshop.classList.add('guided-paper');if(opts.count)workshop.classList.add('count-paper');if(!opts.onAnswer)workshop.classList.add('thinking-paper');
  const dock=document.createElement('div');dock.className='guided-paint-dock';dock.setAttribute('role','group');dock.setAttribute('aria-label','Picture answer controls');
  const more=document.createElement('div');more.id='paint-more';more.className='paint-tray guided-options';more.hidden=true;more.setAttribute('role','dialog');more.setAttribute('aria-label','Picture options');
  more.innerHTML='<div class="tray-heading"><strong>Picture options</strong><button type="button" class="tray-close">Done</button></div>';
  for(const selector of ['.paint-palette','.paint-save','.paint-download','.paint-finger'])more.append(host.querySelector(selector));
  for(const [selector,label] of [['.paint-undo','Undo'],['.paint-clear','Clear']]){const b=host.querySelector(selector);b.setAttribute('aria-label',b.textContent);b.textContent=label;dock.append(b);}
  dock.insertAdjacentHTML('beforeend','<button type="button" class="secondary paint-back">'+(opts.backLabel||'Back to choices')+'</button><button type="button" class="secondary guided-more-toggle" data-tray="more" aria-expanded="false" aria-controls="paint-more">More</button>');
  const answer=host.querySelector('.paint-answer');if(answer){dock.append(answer);if(opts.count){answer.textContent='Check answer';answer.setAttribute('aria-label','Check my picture answer');}}
  host.querySelectorAll('.learn-controls').forEach(n=>n.remove());
  workshop.insertBefore(dock,state);workshop.append(more);
  host.querySelector('.paint-back').onclick=()=>{finish();closeTray();opts.onBack?.();};
  host.querySelector('.paint-heading .eyebrow').textContent=opts.count?'SHOW YOUR ANSWER WITH DOTS':'DRAW YOUR THINKING';
 }
 let numberConfirm=null,numberConfirmButton=null;
 const numberConfirmBackground=[];
 if(numberInput){
  workshop.classList.add('number-paper');
  const modes=document.createElement('div');modes.className='number-modes';modes.setAttribute('role','group');modes.setAttribute('aria-label','How to show your answer');
  modes.innerHTML='<button type="button" data-answer-mode="dots" aria-pressed="true">Tap dots</button><button type="button" data-answer-mode="write" aria-pressed="false">Write number</button>';
  workshop.insertBefore(modes,paperWrap);
  numberConfirm=document.createElement('div');numberConfirm.className='number-confirm';numberConfirm.hidden=true;numberConfirm.setAttribute('role','dialog');numberConfirm.setAttribute('aria-modal','true');numberConfirm.setAttribute('aria-label','Which number did you write?');
  numberConfirm.innerHTML='<div class="number-confirm-card"><h4>Which number did you write?</h4><p>Tap your number, then check it. Your writing stays on the paper.</p><div class="written-number-choices" role="group" aria-label="The number I wrote">'+Array.from({length:21},(_,n)=>'<button type="button" data-written-number="'+n+'" aria-pressed="false">'+n+'</button>').join('')+'</div><div class="number-confirm-actions"><button type="button" class="secondary number-confirm-back">Back to writing</button><button type="button" class="primary gold number-confirm-answer" disabled>Check my number</button></div></div>';
  workshop.append(numberConfirm);numberConfirmButton=numberConfirm.querySelector('.number-confirm-answer');
  modes.querySelectorAll('[data-answer-mode]').forEach(b=>b.onclick=()=>switchAnswerMode(b.dataset.answerMode));
  numberConfirm.querySelectorAll('[data-written-number]').forEach(b=>b.onclick=()=>{writtenNumber=Number(b.dataset.writtenNumber);numberConfirm.querySelectorAll('[data-written-number]').forEach(choice=>choice.setAttribute('aria-pressed',String(choice===b)));numberConfirmButton.disabled=false;numberConfirmButton.textContent='Check '+writtenNumber;});
  numberConfirm.querySelector('.number-confirm-back').onclick=()=>closeNumberConfirm(true);
  numberConfirmButton.onclick=()=>{if(writtenNumber===null||!strokes.length)return;const n=writtenNumber;closeNumberConfirm(true);opts.onAnswer?.(n,host.querySelector('.paint-compare'),host.querySelector('.paint-answer'));};
 }
 function resetWrittenChoice(){
  if(writtenNumber===null)return;writtenNumber=null;if(!numberConfirm)return;
  numberConfirm.querySelectorAll('[data-written-number]').forEach(b=>b.setAttribute('aria-pressed','false'));numberConfirmButton.disabled=true;numberConfirmButton.textContent='Check my number';
 }
 function openNumberConfirm(){
  if(!numberConfirm||!numberConfirm.hidden)return;
  numberConfirm.hidden=false;
  // Keep both pointer and keyboard input inside the confirmation while it is open.
  for(let branch=numberConfirm;branch&&branch!==document.body;branch=branch.parentElement){
   for(const sibling of branch.parentElement?.children||[]){if(sibling===branch)continue;numberConfirmBackground.push([sibling,sibling.inert]);sibling.inert=true;}
  }
  numberConfirm.querySelector(writtenNumber===null?'[data-written-number]':'[data-written-number="'+writtenNumber+'"]')?.focus({preventScroll:true});
 }
 function closeNumberConfirm(focus=false){
  if(!numberConfirm)return;numberConfirm.hidden=true;
  for(const [element,wasInert] of numberConfirmBackground.splice(0))element.inert=wasInert;
  if(focus)host.querySelector('.paint-answer')?.focus({preventScroll:true});
 }
 function syncAnswerMode(){
  if(!numberInput)return;const dots=isCounting();
  workshop.classList.toggle('writing-number',!dots);
  host.querySelectorAll('[data-answer-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.answerMode===answerMode)));
  host.querySelector('.paint-heading .eyebrow').textContent=dots?'SHOW YOUR ANSWER WITH DOTS':'WRITE YOUR NUMBER';
  host.querySelector('.paint-instruction').textContent=dots?'Tap once for each object. One tap makes one dot. Leave it blank for zero.':'Write your answer on the paper. Then choose the number you wrote and check it.';
  can.setAttribute('aria-label',dots?'Tap paper: one tap makes one dot':'Number writing paper: write your answer with a finger, Pencil or mouse');
  const answer=host.querySelector('.paint-answer');if(answer){answer.textContent=dots?'Check answer':'Choose my number';answer.setAttribute('aria-label',dots?'Check my picture answer':'Choose the number I wrote');}
  const undo=host.querySelector('.paint-undo');undo.setAttribute('aria-label',dots?'Undo dot':'Undo stroke');if(!guided)undo.textContent=dots?'Undo dot':'Undo stroke';
  state.textContent=dots?strokes.length+' dots on your paper. Leave it blank for zero.':'Write 0–20. Then choose your number.';
 }
 function switchAnswerMode(mode){
  if(mode===answerMode)return;finish();closeTray();closeNumberConfirm();
  answerPapers[answerMode]={strokes,redo,totalPoints};answerMode=mode;
  const next=answerPapers[mode]||{strokes:[],redo:[],totalPoints:0};strokes=next.strokes;redo=next.redo;totalPoints=next.totalPoints;
  // A saved gallery picture belongs to one paper, never to the other mode.
  dirty=strokes.length>0;pending=null;editVersion++;hasSaved=false;savedVersion=-1;saveFailed=false;paperGeneration++;
  size=isCounting()?24:8;resetWrittenChoice();syncSaveButton();syncAnswerMode();draw();
 }
 const painter=compact?WWPaint.createPainter(can,live):null;
 const saveButton=(headerActions||host).querySelector('.paint-save');
 if(opts.count){host.querySelector('.paint-palette').hidden=true;size=24;}
 const dimensions=()=>paper||{width:800,height:480};
 const ratio=()=>dimensions().width/dimensions().height;
 function historyButtons(){host.querySelector('.paint-undo').disabled=!strokes.length;const r=host.querySelector('.paint-redo');if(r)r.disabled=!redo.length;}
 function draw(){if(compact){painter.rebuild(strokes.filter(s=>s!==current),paper,layers);if(current)painter.preview(current,layers);}else{paint(can,strokes.filter(s=>s!==current),paper);live.width=can.width;live.height=can.height;if(current)stroke(live.getContext('2d'),current,can.width,can.height);}historyButtons();}
 function activeFrame(){frame=0;if(disposed)return;const g=live.getContext('2d');g.clearRect(0,0,live.width,live.height);if(current){if(compact)painter.preview(current,layers);else stroke(g,current,can.width,can.height);}}
 function queueFrame(){if(!frame)frame=requestAnimationFrame(activeFrame);}
 function syncSaveButton(){
  const confirmed=!dirty&&hasSaved&&savedVersion===editVersion;
  const label=saveBusy?'Saving…':confirmed?'Saved to gallery':saveFailed?'Retry save':hasSaved?'Save changes':'Save picture';
  const span=saveButton.querySelector('span');if(span){if(span.textContent!==label)span.textContent=label;}else saveButton.textContent=label;
  saveButton.disabled=saveBusy;saveButton.classList.toggle('saved',confirmed&&!saveBusy);saveButton.classList.toggle('save-failed',saveFailed&&!saveBusy);
  saveButton.setAttribute('aria-busy',String(saveBusy));
  saveButton.setAttribute('aria-label',saveBusy?'Saving picture':confirmed?'Saved to gallery on this device':saveFailed?'Retry save to my gallery':'Save to my gallery');
  saveButton.title=confirmed?'This version is saved in your gallery on this device.':hasSaved?'Your changes need saving.':'Save this picture to your gallery on this device.';
 }
 function edited(){dirty=true;pending=null;editVersion++;saveFailed=false;if(numberInput)resetWrittenChoice();syncSaveButton();}
 function point(e){const b=can.getBoundingClientRect();return [Math.round(Math.max(0,Math.min(1,(e.clientX-b.left)/b.width))*100000)/100000,Math.round(Math.max(0,Math.min(1,(e.clientY-b.top)/b.height))*100000)/100000];}
 function full(){state.textContent='This is a wonderfully detailed picture. Save it, then start a new paper.';}
 function addPoint(e,force=false){if(!current||isCounting())return;const p=point(e),last=current.points.at(-1),dist=Math.hypot((p[0]-last[0])*800,(p[1]-last[1])*800/ratio());if(dist<(force?.01:.5))return;if(totalPoints>=limits.points){full();return;}current.points.push(p);totalPoints++;edited();}
 function finish(e){
  if(e&&!guard.end(e))return;
  if(!e)guard.cancel();if(!current)return;
  if(e?.type==='pointerup')addPoint(e,true);
  const oldLength=current.points.length;if(!isCounting())current.points=simplify(current.points,ratio());totalPoints+=current.points.length-oldLength;
  if(compact)painter.commit(current,layers);else stroke(can.getContext('2d'),current,can.width,can.height);current=null;
  cancelAnimationFrame(frame);frame=0;live.getContext('2d').clearRect(0,0,live.width,live.height);historyButtons();
 }

 function openTray(){return host.querySelector('.paint-tray:not([hidden]):not(.closing)');}
 function closeTray(focus=false,animate=false){
  clearTimeout(trayTimer);trayTimer=0;
  const shown=[...host.querySelectorAll('.paint-tray:not([hidden])')];
  const reduce=document.body.classList.contains('motion-off')||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration=animate&&!reduce?160:0;
  const hide=()=>{shown.forEach(x=>{x.hidden=true;x.classList.remove('closing');});trayTimer=0;};
  if(duration&&shown.length){shown.forEach(x=>x.classList.add('closing'));closingUntil=performance.now()+duration;trayTimer=setTimeout(hide,duration);}
  else{hide();closingUntil=0;}
  host.querySelectorAll('[data-tray]').forEach(x=>x.setAttribute('aria-expanded','false'));
  if(focus)trayOpener?.focus({preventScroll:true});trayOpener=null;
 }
 function toggleTray(button){
  finish();const tray=host.querySelector('#paint-'+button.dataset.tray),wasOpen=tray===openTray();
  closeTray(false,false);if(wasOpen)return;
  trayOpener=button;tray.hidden=false;tray.classList.remove('closing');button.setAttribute('aria-expanded','true');
  tray.querySelector('button').focus({preventScroll:true});
 }
 function dismissOutside(e){
  if(!compact&&!guided)return;
  if(dismissedPointers.has(e.pointerId)){e.preventDefault();e.stopImmediatePropagation();return;}
  dismissedClicks.delete(e.pointerId);suppressClick=false;
  const active=openTray(),inPaper=paperWrap.contains(e.target);
  const dismiss=active&&!active.contains(e.target)&&!e.target.closest('[data-tray]');
  // Every overlapping contact belongs to the same dismissed gesture, even
  // when it begins after the closing animation. Wait for all fingers to lift.
  if(dismissedPointers.size||dismiss||(inPaper&&performance.now()<closingUntil)){
   dismissedPointers.add(e.pointerId);dismissedClicks.add(e.pointerId);
   if(dismissedClicks.size>32)dismissedClicks.delete(dismissedClicks.values().next().value);
   suppressClick=true;e.preventDefault();e.stopImmediatePropagation();
   if(active){finish();closeTray(true,true);state.textContent='Ready to draw.';}
   // A Pencil used to dismiss on the paper still enables the existing palm guard.
   if(inPaper&&e.pointerType==='pen'&&guard.begin(e))guard.cancel();
  }
 }
 function consumeDismissed(e){
  if(!dismissedPointers.has(e.pointerId))return;
  e.preventDefault();e.stopImmediatePropagation();
  if(e.type==='pointerup'||e.type==='pointercancel')dismissedPointers.delete(e.pointerId);
  if(e.type==='pointercancel')dismissedClicks.delete(e.pointerId);
 }
 function consumeClick(e){
  const hasPointer=Number.isFinite(e.pointerId)&&e.pointerId>=0;
  if((hasPointer?dismissedClicks.has(e.pointerId):suppressClick)&&(e.detail>0||e.pointerType)){
   dismissedClicks.delete(e.pointerId);suppressClick=false;e.preventDefault();e.stopImmediatePropagation();
  }
 }
 document.addEventListener('pointerdown',dismissOutside,true);
 for(const event of ['pointermove','pointerup','pointercancel'])document.addEventListener(event,consumeDismissed,true);
 document.addEventListener('click',consumeClick,true);
 can.onpointerdown=e=>{
  if(!guard.begin(e))return;e.preventDefault();
  if(compact){const layer=layers.find(l=>l.id===activeLayer);if(!layer.visible||layer.locked){guard.cancel();state.textContent=layer.locked?'This layer is locked. Unlock it in Layers to draw.':'This layer is hidden. Show it in Layers to draw.';return;}}
  if(strokes.length>=limits.strokes||totalPoints>=limits.points){guard.end(e);full();return;}
  current={color,size,...(compact?{tool,opacity:toolOpacities[tool],layer:activeLayer}:{}),points:[point(e)]};strokes.push(current);totalPoints++;redo=[];edited();
  can.setPointerCapture(e.pointerId);queueFrame();historyButtons();state.textContent=isCounting()?strokes.length+' dots on your paper.':numberInput?'Ready? Choose the number you wrote.':guard.penSeen()?'Pencil ready · fingers rest safely.':'Your ideas, in color.';
 };
 can.onpointermove=e=>{if(isCounting()||!current||!guard.move(e))return;e.preventDefault();const batch=e.getCoalescedEvents?.();for(const pt of batch?.length?batch:[e])addPoint(pt);queueFrame();};
 can.onpointerup=can.onpointercancel=can.onlostpointercapture=finish;

 function syncSizes(){
  const slider=host.querySelector('.pen-size-slider');if(!slider)return;
  const label=TOOLS.find(x=>x[0]===tool)[1]+' size';
  slider.value=String(size);slider.setAttribute('aria-label',label);
  host.querySelector('.size-label label').textContent=label;
  host.querySelector('.pen-size-value').textContent=String(size);
  const actual=size*(tool==='marker'?2:tool==='pencil'?.6:tool==='brush'?3:1);
  host.querySelector('.pen-size-preview i').style.height=Math.min(26,Math.max(1,actual*.6))+'px';
  slider.style.setProperty('--size-progress',((size-1)/39*100)+'%');syncOpacity();
 }
 function syncOpacity(){
  const slider=host.querySelector('.opacity-slider');if(!slider)return;
  const opacity=toolOpacities[tool],label=TOOLS.find(x=>x[0]===tool)[1]+' opacity';
  slider.value=String(opacity);slider.setAttribute('aria-label',label);host.querySelector('.opacity-control label').textContent=label;host.querySelector('.opacity-value').textContent=opacity+'%';host.querySelector('.opacity-control').hidden=tool==='eraser';
  const preview=host.querySelector('.pen-size-preview i');preview.style.opacity=String(opacity/100);preview.style.filter=tool==='brush'?'blur(3px)':'';
 }
 function setColor(c){
  color=c.toLowerCase();if(tool==='eraser')setTool('pen');
  host.querySelectorAll('[data-color]').forEach(b=>{const active=b.dataset.color===color;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
  const channels=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)),gray=host.querySelector('.gray-slider');
  if(gray&&channels.every(n=>n===channels[0])){const n=channels[0];gray.value=String(n);host.querySelector('.gray-value').value=String(n);gray.setAttribute('aria-valuetext',n===0?'Black':n===255?'White':'Gray '+n+' of 255');}
  workshop.style.setProperty('--ink-color',color);
  const well=host.querySelector('.color-well');if(well)well.style.setProperty('--paint',color);
  const name=[...NEUTRALS,...COLORS].find(x=>x[0]===color)?.[1]||'Custom '+color.toUpperCase();
  const caption=host.querySelector('.color-name');if(caption)caption.textContent=name;
  const remove=host.querySelector('.remove-custom');if(remove)remove.hidden=!customColors.includes(color);
 }
 function setSize(n){size=Math.max(1,Math.min(40,Math.round(n)));if(compact)toolSizes[tool]=size;syncSizes();}
 function setTool(t){
  tool=t;host.querySelectorAll('[data-tool]').forEach(b=>{const active=b.dataset.tool===t;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
  const toggle=host.querySelector('.pen-toggle');if(toggle)toggle.innerHTML=tip(t)+'<small>'+TOOLS.find(x=>x[0]===t)[1]+'</small>';
  size=toolSizes[t];syncSizes();
 }
 async function persistTools(message){
  if(!compact||!opts.onToolsChange)return;
  const rev=++toolSaveRevision,atEdit=editVersion;
  try{
   const ok=await opts.onToolsChange({colors:[...customColors],sizes:{...toolSizes},opacities:{...toolOpacities}});
   if(disposed||rev!==toolSaveRevision)return;
   if(!ok)state.textContent='Tool settings are only in this page. Keep a progress copy before leaving.';
   else if(message&&atEdit===editVersion)state.textContent=message;
  }catch(e){if(!disposed&&rev===toolSaveRevision)state.textContent='Tool settings could not be saved. '+e.message;}
 }
 function keepColor(chosen){
  const exists=customColors.includes(chosen)||[...COLORS,...NEUTRALS].some(x=>x[0]===chosen);
  if(!exists&&customColors.length>=16){state.textContent='Your 16 custom colors are full. Remove one from My colors to make room.';return false;}
  if(!exists)customColors.push(chosen);color=chosen;renderCustomColors();setColor(chosen);
  if(!exists)persistTools('Color added to your palette for this explorer.');else state.textContent='That color is ready in your palette.';return true;
 }
 function renderCustomColors(){
  const box=host.querySelector('.custom-palette');if(!box)return;box.replaceChildren();
  customColors.forEach(c=>{const b=document.createElement('button');b.type='button';b.className='paint-color';b.dataset.color=c;b.style.setProperty('--paint',c);b.setAttribute('aria-label','Custom '+c.toUpperCase());b.onclick=()=>setColor(c);box.append(b);});
  host.querySelector('.custom-empty').hidden=customColors.length>0;setColor(color);
 }
 host.querySelectorAll('[data-tray]').forEach(b=>b.onclick=()=>toggleTray(b));
 host.querySelectorAll('.tray-close').forEach(b=>b.onclick=()=>closeTray(true,true));
 host.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>setColor(b.dataset.color));
 host.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));
 const sizeSlider=host.querySelector('.pen-size-slider');
 if(sizeSlider){sizeSlider.oninput=e=>setSize(Number(e.target.value));sizeSlider.onchange=()=>persistTools();}
 if(compact){
  const gray=host.querySelector('.gray-slider'),grayValue=host.querySelector('.gray-value');
  gray.oninput=()=>{finish();const n=Number(gray.value);grayValue.value=String(n);gray.setAttribute('aria-valuetext',n===0?'Black':n===255?'White':'Gray '+n+' of 255');setColor('#'+n.toString(16).padStart(2,'0').repeat(3));};
  host.querySelector('.keep-gray').onclick=()=>keepColor('#'+Number(gray.value).toString(16).padStart(2,'0').repeat(3));
  const opacity=host.querySelector('.opacity-slider');opacity.oninput=()=>{finish();toolOpacities[tool]=Number(opacity.value);syncOpacity();};opacity.onchange=()=>persistTools();
  let mix=hsvFromColor(color),wheelPointer=null,wheelPainted=false;
  const wheel=host.querySelector('.color-wheel'),brightness=host.querySelector('.color-brightness'),saturation=host.querySelector('.color-saturation'),hex=host.querySelector('.custom-color-hex'),message=host.querySelector('.custom-color-message');
  function updateMix(writeHex=true){
   const result=colorFromHSV(mix.h,mix.s,mix.v);
   // The wheel is static. Moving the cursor updates only the preview; brightness
   // uses a compositor filter so a Pencil gesture never rebuilds 65,536 pixels.
   if(!wheelPainted){
    const n=256,r=127.5,g=wheel.getContext('2d'),pixels=g.createImageData(n,n);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const dx=x-r,dy=y-r,saturation=Math.hypot(dx,dy)/r;if(saturation>1)continue;const c=colorFromHSV(Math.atan2(dy,dx)*180/Math.PI,saturation,1),i=(y*n+x)*4;pixels.data[i]=parseInt(c.slice(1,3),16);pixels.data[i+1]=parseInt(c.slice(3,5),16);pixels.data[i+2]=parseInt(c.slice(5,7),16);pixels.data[i+3]=255;}
    g.putImageData(pixels,0,0);wheelPainted=true;
   }
   wheel.style.filter='brightness('+mix.v+')';
   const cursor=host.querySelector('.color-wheel-cursor'),angle=mix.h*Math.PI/180;
   cursor.style.left=(50+Math.cos(angle)*mix.s*48)+'%';cursor.style.top=(50+Math.sin(angle)*mix.s*48)+'%';
   host.querySelector('.custom-color-preview').style.background=result;
   if(writeHex)hex.value=result;hex.setAttribute('aria-invalid','false');brightness.value=String(Math.round(mix.v*100));saturation.value=String(Math.round(mix.s*100));
   wheel.setAttribute('aria-valuenow',String(Math.round(mix.h)%360));wheel.setAttribute('aria-valuetext',result+', hue '+Math.round(mix.h)+', intensity '+Math.round(mix.s*100)+' percent');
  }
  function showPalette(){host.querySelector('.palette-view').hidden=false;host.querySelector('.color-maker').hidden=true;host.querySelector('.open-color-wheel').focus({preventScroll:true});}
  host.querySelector('.open-color-wheel').onclick=()=>{host.querySelector('.palette-view').hidden=true;host.querySelector('.color-maker').hidden=false;mix=hsvFromColor(color);message.textContent='';updateMix();wheel.focus({preventScroll:true});};
  host.querySelector('.color-maker-back').onclick=showPalette;
  function wheelPoint(e){const b=wheel.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;mix.h=(Math.atan2(y,x)*180/Math.PI+360)%360;mix.s=Math.min(1,Math.hypot(x,y)*2);message.textContent='';updateMix();}
  wheel.onpointerdown=e=>{if(wheelPointer!==null||e.button>0)return;e.preventDefault();wheelPointer=e.pointerId;wheel.setPointerCapture(e.pointerId);wheelPoint(e);};
  wheel.onpointermove=e=>{if(wheelPointer!==e.pointerId)return;e.preventDefault();wheelPoint(e);};
  wheel.onpointerup=wheel.onpointercancel=wheel.onlostpointercapture=e=>{if(wheelPointer===e.pointerId)wheelPointer=null;};
  wheel.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')mix.h=(mix.h+355)%360;if(e.key==='ArrowRight')mix.h=(mix.h+5)%360;if(e.key==='ArrowUp')mix.s=Math.min(1,mix.s+.05);if(e.key==='ArrowDown')mix.s=Math.max(0,mix.s-.05);updateMix();};
  saturation.oninput=()=>{mix.s=Number(saturation.value)/100;updateMix();};
  brightness.oninput=()=>{mix.v=Number(brightness.value)/100;updateMix();};
  hex.oninput=()=>{if(/^#[0-9a-f]{6}$/i.test(hex.value)){mix=hsvFromColor(hex.value);message.textContent='';updateMix(false);}else hex.setAttribute('aria-invalid','true');};
  host.querySelector('.add-custom-color').onclick=()=>{
   if(!/^#[0-9a-f]{6}$/i.test(hex.value)){message.textContent='Use a color like #12A3BC.';hex.setAttribute('aria-invalid','true');hex.focus();return;}
   const chosen=hex.value.toLowerCase();if(keepColor(chosen))showPalette();else message.textContent='Your 16 custom colors are full. Remove one from My palette to make room.';
  };
  host.querySelector('.remove-custom').onclick=()=>{customColors=customColors.filter(c=>c!==color);color=COLORS[0][0];renderCustomColors();persistTools('Custom color removed. Your pictures keep their colors.');};
  renderCustomColors();syncSizes();
 }

 function renderLayers(){
  if(!compact)return;const list=host.querySelector('.layer-list');list.replaceChildren();
  [...layers].reverse().forEach(l=>{const b=document.createElement('button');b.type='button';b.className='layer-select';b.dataset.layer=String(l.id);b.setAttribute('aria-pressed',String(l.id===activeLayer));b.textContent=l.name+(l.locked?' · Locked':'')+(!l.visible?' · Hidden':'');b.onclick=()=>{finish();activeLayer=l.id;renderLayers();};list.append(b);});
  const l=layers.find(l=>l.id===activeLayer),i=layers.indexOf(l);host.querySelector('#layer-name').value=l.name;host.querySelector('#layer-opacity').value=String(l.opacity);host.querySelector('.layer-opacity-value').value=l.opacity+'%';
  host.querySelector('[data-layer-action=visible]').textContent=l.visible?'Hide layer':'Show layer';host.querySelector('[data-layer-action=locked]').textContent=l.locked?'Unlock layer':'Lock layer';host.querySelector('[data-layer-action=up]').disabled=i===layers.length-1;host.querySelector('[data-layer-action=down]').disabled=i===0;host.querySelector('.add-layer').disabled=layers.length>=6;host.querySelector('.remove-layer').disabled=layers.length<=1;
 }
 function changedLayers(){edited();painter.compose(layers);renderLayers();}
 if(compact){
  host.querySelector('.add-layer').onclick=()=>{finish();if(layers.length>=6)return;activeLayer=1;while(layers.some(l=>l.id===activeLayer))activeLayer++;layers.push({id:activeLayer,name:'Layer '+activeLayer,visible:true,locked:false,opacity:100});changedLayers();state.textContent='New layer ready. Your other layers stay separate.';};
  host.querySelector('#layer-name').onchange=e=>{const l=layers.find(l=>l.id===activeLayer),name=e.target.value.trim().replace(/[<>\x00-\x1f]/g,'').slice(0,24);l.name=name||l.name;edited();renderLayers();};
  host.querySelectorAll('[data-layer-action]').forEach(b=>b.onclick=()=>{finish();const l=layers.find(l=>l.id===activeLayer),i=layers.indexOf(l),action=b.dataset.layerAction;if(action==='visible')l.visible=!l.visible;else if(action==='locked')l.locked=!l.locked;else{const j=i+(action==='up'?1:-1);if(j<0||j>=layers.length)return;[layers[i],layers[j]]=[layers[j],layers[i]];}changedLayers();});
  host.querySelector('#layer-opacity').oninput=e=>{finish();layers.find(l=>l.id===activeLayer).opacity=Number(e.target.value);edited();painter.compose(layers);host.querySelector('.layer-opacity-value').value=e.target.value+'%';};
  host.querySelector('.remove-layer').onclick=()=>{finish();if(layers.length<=1)return;if(strokes.some(s=>s.layer===activeLayer)&&!confirm('Remove this layer and its marks? Other layers stay.'))return;strokes=strokes.filter(s=>s.layer!==activeLayer);redo=[];totalPoints=strokes.reduce((n,s)=>n+s.points.length,0);layers=layers.filter(l=>l.id!==activeLayer);activeLayer=layers.at(-1).id;edited();draw();renderLayers();};
  renderLayers();
 }
 const sizeSelect=host.querySelector('select');if(sizeSelect)sizeSelect.onchange=e=>setSize(Number(e.target.value));
 const escapeTray=e=>{
  if(numberConfirm&&!numberConfirm.hidden){
   if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeNumberConfirm(true);return;}
   if(e.key==='Tab'){const buttons=[...numberConfirm.querySelectorAll('button:not([disabled])')],first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}return;
  }
  if(e.key==='Escape'&&host.querySelector('.paint-tray:not([hidden])')){e.preventDefault();e.stopPropagation();closeTray(true,true);}};
 // Capture before the app-level Escape handler, even if focus is in the header.
 document.addEventListener('keydown',escapeTray,true);
 host.querySelector('.paint-undo').onclick=()=>{finish();const s=strokes.pop();if(!s)return;redo.push(s);totalPoints-=s.points.length;edited();draw();state.textContent=isCounting()?strokes.length+' dots on your paper.':'Last stroke undone.';};
 const redoButton=host.querySelector('.paint-redo');if(redoButton)redoButton.onclick=()=>{finish();const s=redo.pop();if(!s)return;strokes.push(s);totalPoints+=s.points.length;edited();draw();state.textContent='Stroke restored.';};
 host.querySelector('.paint-clear').onclick=()=>{if(strokes.length&&!confirm('Start a fresh paper? Save this picture to your gallery first to keep it.'))return;finish();strokes=[];redo=[];totalPoints=0;dirty=false;pending=null;editVersion++;hasSaved=false;savedVersion=-1;saveFailed=false;paperGeneration++;resetWrittenChoice();syncSaveButton();if(compact){opts.initial=null;opts.onNewPaper?.();layers=[{id:1,name:'My drawing',visible:true,locked:false,opacity:100}];activeLayer=1;renderLayers();}closeTray(true);draw();state.textContent=isCounting()?'0 dots on your paper. Leave it blank if your answer is zero.':numberInput?'Fresh paper. Write your number, then choose it.':'Fresh paper. What will you make?';};
 host.querySelector('.paint-finger').onclick=()=>{finish();guard.allowFinger();closeTray(true);state.textContent='Finger drawing enabled. Your marks are kept.';};
 saveButton.onclick=async()=>{
  finish();closeTray();if(!strokes.length&&!opts.initial){state.textContent='Draw something first.';return;}
  if(!dirty){state.textContent='This version is already saved. Add a stroke to make a new version.';return;}
  if(saveBusy)return;saveBusy=true;saveFailed=false;syncSaveButton();state.textContent='Saving your picture…';const savingVersion=editVersion,savingPaper=paperGeneration;
  try{if(!pending)pending={title:(opts.initial?.title||opts.title||'My picture').slice(0,80),createdAt:opts.initial?.createdAt??Date.now(),...(compact?{layers:JSON.parse(JSON.stringify(layers))}:{}),...(paper?{paper:{...paper}}:{}),strokes:JSON.parse(JSON.stringify(strokes))};
   const ok=await opts.onSave(pending);if(disposed||savingPaper!==paperGeneration)return;
   if(ok){hasSaved=true;if(editVersion===savingVersion){dirty=false;savedVersion=savingVersion;state.textContent='Saved to your gallery on this device.';}else state.textContent='Earlier picture saved. Your newer edits need another save.';}
   else{saveFailed=true;state.textContent='Picture is still here. Saving failed; download a copy from More.';}
  }catch(e){if(!disposed&&savingPaper===paperGeneration){saveFailed=true;state.textContent=e.message;}}finally{if(!disposed){saveBusy=false;syncSaveButton();}}
 };
 host.querySelector('.paint-download').onclick=()=>{finish();if(!strokes.length){state.textContent='Draw something first.';return;}can.toBlob(blob=>{if(blob)opts.onDownload(blob);},'image/png');closeTray(true);};
 if(opts.onAnswer)host.querySelector('.paint-answer').onclick=()=>{
  finish();
  if(numberInput&&!isCounting()){
   if(!strokes.length){state.textContent='Write your number first. For zero, write 0.';return;}
   closeTray();openNumberConfirm();return;
  }
  if(!strokes.length&&!opts.count){state.textContent='Make your picture first.';return;}
  opts.onAnswer(strokes.length,host.querySelector('.paint-compare'),host.querySelector('.paint-answer'));
 };
 let resizeObserver=null;
 if(compact||guided){const fit=()=>{const r=paperWrap.getBoundingClientRect();if(r.width<1||r.height<1)return;
   if(!paper){const aspect=Math.max(.6,Math.min(2.4,r.width/r.height));paper={width:1600,height:Math.round(1600/aspect)};draw();}
   const w=Math.max(1,Math.min(r.width,r.height*ratio()));surface.style.width=w+'px';surface.style.height=w/ratio()+'px';
  };resizeObserver=new ResizeObserver(fit);resizeObserver.observe(paperWrap);if(compact)fit();}
 draw();setColor(color);syncSaveButton();syncAnswerMode();if(opts.initial)state.textContent=initialConfirmed?'Saved to your gallery on this device.':'This picture is still in this page. Retry save to keep it on this device.';
 return()=>{disposed=true;closeNumberConfirm();painter?.dispose();clearTimeout(trayTimer);document.removeEventListener('pointerdown',dismissOutside,true);for(const event of ['pointermove','pointerup','pointercancel'])document.removeEventListener(event,consumeDismissed,true);document.removeEventListener('click',consumeClick,true);dismissedPointers.clear();dismissedClicks.clear();resizeObserver?.disconnect();cancelAnimationFrame(frame);guard.cancel();current=null;document.removeEventListener('keydown',escapeTray,true);headerActions?.remove();can.onpointerdown=can.onpointermove=can.onpointerup=can.onpointercancel=can.onlostpointercapture=null;};
}
root.WWDrawing=Object.freeze({version:'0.9.0',paint,mount,colorFromHSV});
})(globalThis);


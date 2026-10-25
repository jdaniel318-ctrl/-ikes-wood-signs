/* Carvewright 8.8.20.64 — shared vector editor with optional board-photo placement. */
(function (g) {
  'use strict';
  if (!g.document || g.CarvewrightStudio) return;
  const BUILD = '8.8.20.64';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clone = v => g.structuredClone ? g.structuredClone(v) : JSON.parse(JSON.stringify(v));
  const icon = body => `<svg viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
  const icons = {
    close:icon('<path d="m9 5-7 7 7 7M2 12h20"/>'),save:icon('<path d="M5 3h12l4 4v14H3V3h2Zm2 0v6h10V3M7 21v-8h10v8"/>'),
    export:icon('<path d="M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6"/>'),check:icon('<path d="m5 12 4 4L19 6"/>'),
    layers:icon('<path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5"/>'),plus:icon('<path d="M12 4v16M4 12h16"/>'),
    undo:icon('<path d="M9 5 4 10l5 5M4 10h9a6 6 0 0 1 0 12"/>'),redo:icon('<path d="m15 5 5 5-5 5m5-5h-9a6 6 0 0 0 0 12"/>'),
    duplicate:icon('<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>'),trash:icon('<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>'),
    ruler:icon('<path d="M3 6h18v12H3zM7 6v5m5-5v8m5-8v5"/>')
  };
  const panels=['lettering','objects','stock','review'];
  let current=null;
  const core=()=>g.CarvewrightCore,fonts=()=>g.IkeCarveFonts,catalog=()=>g.BlackFlagDesignAssets,photoCore=()=>g.BoardcraftPhoto;
  const node=(s,id)=>s.root.querySelector('#'+id);
  function alive(s){try{return current===s&&!s.closed&&s.root.open&&s.parent.isConnected&&s.options.guard()===true;}catch(_){return false;}}
  function assertLive(s){if(!alive(s))throw Object.assign(Error('The workspace changed. Reopen Carvewright Studio to continue.'),{code:'AUTH'});}
  function status(s,text,tone='info'){if(current!==s||s.closed)return;const n=node(s,'cweStatus');n.textContent=text;n.dataset.tone=tone;}
  function revoke(s){s.urls.forEach(u=>URL.revokeObjectURL(u));s.urls=[];const n=node(s,'cweDownloads');if(n){n.hidden=true;n.replaceChildren();}}
  const validLayout=s=>s.layout?.ok&&!s.layout.blank;
  const objects=s=>core().layerList(s.draft);
  const selected=s=>objects(s).find(a=>a.id===s.selectedId)||objects(s)[0];
  function writable(d,id){return id==='primary'?{type:'text',text:d.text}:d.layers.find(a=>a.id===id);}
  function controls(s){
    if(current!==s||s.closed)return;
    const disabled=s.busy||!!s.drag||!alive(s),count=objects(s).length,a=selected(s);
    s.root.setAttribute('aria-busy',String(s.busy));
    s.root.querySelectorAll('button,input,select,textarea').forEach(n=>{n.disabled=disabled;});
    node(s,'cweClose').disabled=false;
    for(const id of ['cweReview','cweExportSvg','cweDownloadJob'])node(s,id).disabled=disabled||!validLayout(s);
    node(s,'cweSave').disabled=disabled||(s.embedded?!validLayout(s):!s.layout?.ok);
    node(s,'cweMachining').disabled=s.embedded||disabled||!validLayout(s)||s.dirty||s.draft.revision<1||!s.draft.review;
    node(s,'cweSaveLabel').textContent=s.busy?'Working…':s.embedded?'Use this design':'Save design';
    node(s,'cweUndo').disabled=disabled||!s.undo.length;node(s,'cweRedo').disabled=disabled||!s.redo.length;
    for(const id of ['cweAddText','cweAddGraphic','cweDuplicate'])node(s,id).disabled=disabled||count>=12;
    s.root.querySelectorAll('[data-graphic]').forEach(n=>{n.disabled=disabled||count>=12;});
    node(s,'cweDelete').disabled=disabled||(a.id==='primary'&&!a.text.value);
    if(s.boardPhoto){
      const check=photoCore().validate(s.draft,s.boardPhoto.photo,s.boardPhoto.board,fonts());
      node(s,'cweSave').disabled=node(s,'cweSave').disabled||!check.ok;
      node(s,'cweFrameApply').disabled=disabled||!check.ok;
      node(s,'cweFrameX').disabled=disabled||s.boardPhoto.board.frame.w>=1-1e-9;
      node(s,'cweFrameY').disabled=disabled||s.boardPhoto.board.frame.h>=1-1e-9;
    }
  }
  async function run(s,action){
    if(s.busy||s.drag)return;try{assertLive(s);}catch(_){close(true);return;}
    s.busy=true;controls(s);const generation=s.generation;
    const valid=()=>{assertLive(s);if(generation!==s.generation)throw Error('The design changed before the action completed.');};
    try{await action(valid);valid();}catch(e){if(current===s&&!s.closed){if(e.code==='AUTH'||!alive(s))close(true);else status(s,e.code==='CONFLICT'?'A newer copy was saved in another window. Download this job to keep your edits, then reopen the saved design.':(e.message||'This action could not be completed.'),'error');}}
    finally{if(current===s&&!s.closed){s.busy=false;controls(s);}}
  }
  const units=(s,mm)=>s.unit==='in'?mm/25.4:mm;
  const display=(s,mm)=>Number(units(s,mm).toFixed(s.unit==='in'?3:2));
  const numberValue=v=>v.trim()===''?NaN:Number(v);
  function physicalInput(s,v){const n=numberValue(v)*(s.unit==='in'?25.4:1);return Number.isFinite(n)?Math.round(n*1e9)/1e9:n;}
  function fontPreview(id){
    const f=fonts().fonts[id];if(!f)return '';
    let x=0;const paths=[];
    for(const c of 'Aa'){const glyph=f.glyphs[c];if(!glyph)continue;if(glyph.d)paths.push(`<path d="${esc(glyph.d)}" transform="translate(${x} 0) scale(1 -1)"/>`);x+=glyph.advance;}
    return `<svg class="cwe-font-paths" viewBox="0 ${-f.ascender} ${Math.max(x,1)} ${f.ascender-f.descender}" aria-hidden="true">${paths.join('')}</svg>`;
  }
  function fontCards(){return catalog().fontOrder.map(id=>{const f=catalog().fontLabels[id];return `<button data-font="${esc(id)}" class="cwe-font-option" aria-pressed="false" type="button">${fontPreview(id)}<span><strong>${esc(f.name)}</strong><small>${esc(f.description)}</small></span><span class="cwe-radio"></span></button>`;}).join('');}
  function graphicCards(){return catalog().graphicOrder.map(id=>{const a=catalog().graphics[id];return `<button data-graphic="${esc(id)}" class="cwe-graphic-option" type="button" aria-label="Add ${esc(a.name)}"><svg viewBox="${a.viewBox.join(' ')}" aria-hidden="true"><path d="${esc(a.d)}"/></svg><span>${esc(a.name)}</span></button>`;}).join('');}
  function shell(reference){return `<div class="cwe-shell">
    <header class="cwe-header"><div class="cwe-brand"><span class="cwe-brand-icon">${icons.layers}</span><div><small>DESIGN &amp; PRODUCTION</small><h1 id="cweTitle" tabindex="-1">Carvewright Studio<span>FLEETCRAFT</span></h1></div></div><button id="cweClose" class="cwe-quiet" type="button" aria-label="Back to jobs">${icons.close}<span>Back to jobs</span></button></header>
    <div class="cwe-projectbar"><div class="cwe-project-name"><label for="cweJobTitle">DESIGN NAME</label><input id="cweJobTitle" maxlength="160" autocomplete="off" data-bf-trim="preserve"><span id="cweSavedState">New local design</span></div><div class="cwe-project-actions"><button id="cweUndo" class="cwe-icon-button" type="button" aria-label="Undo" title="Undo">${icons.undo}</button><button id="cweRedo" class="cwe-icon-button" type="button" aria-label="Redo" title="Redo">${icons.redo}</button><button id="cweSave" class="cwe-primary" type="button" aria-label="Save design">${icons.save}<span id="cweSaveLabel">Save design</span></button></div></div>
    <main class="cwe-main"><aside class="cwe-inspector" aria-label="Design controls">
    <div class="cwe-panel-tabs" role="tablist" aria-label="Design controls"><button id="cweLetteringTab" data-panel="lettering" role="tab" aria-controls="cweLetteringPanel" aria-selected="true" type="button">Edit</button><button id="cweObjectsTab" data-panel="objects" role="tab" aria-controls="cweObjectsPanel" aria-selected="false" type="button">Objects</button><button id="cweStockTab" data-panel="stock" role="tab" aria-controls="cweStockPanel" aria-selected="false" type="button">Blank</button><button id="cweReviewTab" data-panel="review" role="tab" aria-controls="cweReviewPanel" aria-selected="false" type="button">Review</button></div>
    <div id="cweSelectionBar" class="cwe-selection-bar"><span><small>SELECTED OBJECT</small><strong id="cweSelectionName">Main lettering</strong></span><button id="cweDuplicate" class="cwe-icon-button" type="button" aria-label="Duplicate selected object" title="Duplicate selected object">${icons.duplicate}</button><button id="cweDelete" class="cwe-icon-button" type="button" aria-label="Delete selected object" title="Delete selected object">${icons.trash}</button></div>
    <div class="cwe-panel-scroll">
    <section id="cweLetteringPanel" class="cwe-control-panel" role="tabpanel" aria-labelledby="cweLetteringTab">
      <div id="cweTextFields"><label class="cwe-label" for="cweWording">Your wording<span>Up to 3 lines</span></label><textarea id="cweWording" rows="2" maxlength="480" data-bf-trim="preserve" autocapitalize="off" autocomplete="off" spellcheck="false" placeholder="Type your sign…"></textarea>
      <button id="cweFontPicker" class="cwe-font-picker" type="button" aria-expanded="false" aria-controls="cweFontChoices"><span id="cweCurrentFontPreview"></span><span><small>LETTERING STYLE</small><strong id="cweCurrentFontName"></strong></span><span aria-hidden="true">⌄</span></button>
      <div id="cweFontChoices" class="cwe-font-choices" hidden><div class="cwe-picker-heading"><strong>${catalog().fontOrder.length} vector lettering styles</strong><button id="cweCloseFonts" type="button" aria-label="Close font choices">Done</button></div><div class="cwe-font-field">${fontCards()}</div><p class="cwe-field-note">Bundled vector outlines. Shop-specific lettering is separate.</p></div>
      <div class="cwe-text-adjustments"><div class="cwe-size-row"><label class="cwe-label" for="cweSizeNumber">Lettering size<span>% of fitted area</span></label><input id="cweSizeNumber" type="number" min="10" max="100" step="1" inputmode="decimal"><output id="cweSizeValue" class="cwe-sr-only">40%</output></div><input id="cweSize" type="range" min="10" max="100" step="1" aria-label="Adjust lettering size"><label class="cwe-label" for="cweTracking">Letter spacing<output id="cweTrackingValue">0.00 em</output></label><input id="cweTracking" type="range" min="-0.1" max="0.5" step="0.01"><div class="cwe-segmented" aria-label="Text alignment"><button data-align="left" type="button" aria-label="Align left">${icon('<path d="M4 5h16M4 10h10M4 15h16M4 20h10"/>')}</button><button data-align="center" type="button" aria-label="Align center">${icon('<path d="M4 5h16M7 10h10M4 15h16M7 20h10"/>')}</button><button data-align="right" type="button" aria-label="Align right">${icon('<path d="M4 5h16M10 10h10M4 15h16M10 20h10"/>')}</button></div></div></div>
      <div id="cweGraphicFields" hidden><p class="cwe-field-note cwe-graphic-note">Closed vector artwork · independent width and height</p><div class="cwe-dimension-grid"><label>Width <span class="cwe-unit"></span><input id="cweGraphicWidth" type="number" step="any" inputmode="decimal"></label><label>Height <span class="cwe-unit"></span><input id="cweGraphicHeight" type="number" step="any" inputmode="decimal"></label></div></div>
      <details id="cweTransform" class="cwe-transform"><summary>Position &amp; rotation <span id="cweTransformSummary">Centered</span></summary><div class="cwe-dimension-grid cwe-position-grid"><label><span id="cweOffsetXLabel">Horizontal offset</span> <span class="cwe-unit"></span><input id="cweOffsetX" type="number" step="any" inputmode="decimal"></label><label><span id="cweOffsetYLabel">Vertical offset</span> <span class="cwe-unit"></span><input id="cweOffsetY" type="number" step="any" inputmode="decimal"></label><label>Rotation °<input id="cweRotation" type="number" min="-360" max="360" step="1" inputmode="decimal"></label><button id="cweCenter" type="button">Center object</button></div><div class="cwe-nudge"><span id="cweNudgeAmount">Nudge</span><button data-nudge="left" type="button" aria-label="Move left">←</button><button data-nudge="up" type="button" aria-label="Move up">↑</button><button data-nudge="down" type="button" aria-label="Move down">↓</button><button data-nudge="right" type="button" aria-label="Move right">→</button></div></details>
      <div class="cwe-ink-row"><span>Artwork color</span><div class="cwe-colors"><button data-ink="#20262d" style="--swatch:#20262d" type="button" aria-label="Charcoal artwork"></button><button data-ink="#f8f3e8" style="--swatch:#f8f3e8" type="button" aria-label="Ivory artwork"></button><button data-ink="#284941" style="--swatch:#284941" type="button" aria-label="Forest artwork"></button><button data-ink="#693b30" style="--swatch:#693b30" type="button" aria-label="Oxide artwork"></button></div></div>
    </section>
    <section id="cweObjectsPanel" class="cwe-control-panel" role="tabpanel" aria-labelledby="cweObjectsTab" hidden><div class="cwe-object-add"><button id="cweAddText" type="button">${icons.plus}Add text</button><button id="cweAddGraphic" type="button" aria-expanded="false" aria-controls="cweGraphicChoices">${icons.plus}Add graphic</button></div><div id="cweGraphicChoices" class="cwe-graphic-choices" hidden><div class="cwe-picker-heading"><strong>16 vector graphics</strong><button id="cweCloseGraphics" type="button">Done</button></div><div class="cwe-graphic-grid">${graphicCards()}</div></div><div class="cwe-layer-heading"><strong>Objects on your blank</strong><span id="cweObjectCount">1 / 12</span></div><div id="cweLayerList" class="cwe-layer-list" aria-label="Select an artwork object"></div><p class="cwe-field-note">Tap an object in the preview or this list. Drag to move it; use Edit for exact dimensions.</p></section>
    <section id="cweStockPanel" class="cwe-control-panel" role="tabpanel" aria-labelledby="cweStockTab" hidden><div class="cwe-label">Display units</div><div class="cwe-segmented"><button data-unit="in" type="button">Inches</button><button data-unit="mm" type="button">Millimeters</button></div><div class="cwe-dimension-grid"><label>Width <span class="cwe-unit"></span><input id="cweWidth" type="number" step="any" inputmode="decimal"></label><label>Height <span class="cwe-unit"></span><input id="cweHeight" type="number" step="any" inputmode="decimal"></label><label>Thickness <span class="cwe-unit"></span><input id="cweThickness" type="number" step="any" inputmode="decimal"></label><label>Edge margin <span class="cwe-unit"></span><input id="cweMargin" type="number" step="any" inputmode="decimal"></label></div><label class="cwe-label" for="cweStockId">Blank identifier</label><input id="cweStockId" maxlength="80" data-bf-trim="preserve" autocomplete="off"><label class="cwe-label" for="cweSpecies">Material appearance</label><select id="cweSpecies"><option value="cedar">Cedar</option><option value="walnut">Walnut</option><option value="oak">Oak</option></select><p class="cwe-field-note">Enter the physical blank dimensions. Wood appearance is illustrative.</p></section>
    <section id="cweReviewPanel" class="cwe-control-panel" role="tabpanel" aria-labelledby="cweReviewTab" hidden><div class="cwe-production-row"><section class="cwe-review-card"><span class="cwe-card-icon">${icons.check}</span><div><small>DESIGN CHECK</small><strong id="cweReviewState">Ready to review</strong><p id="cweReviewDescription">Check the layout before preparing the next step.</p><button id="cweReview" type="button">Mark layout reviewed</button></div></section><section class="cwe-cam-card"><span class="cwe-card-icon">${icons.ruler}</span><div><small>PRODUCTION</small><strong>Prepare this sign for cutting</strong><p>Calculate recessed artwork paths and export a controller program from this saved design.</p><button id="cweMachining" type="button">Prepare machining</button><small id="cweMachiningHelp">Save a reviewed design to prepare cutting paths.</small></div></section></div></section>
    </div></aside>
    <section class="cwe-workbench" aria-label="Sign preview"><div class="cwe-view-toolbar"><div><span class="cwe-green-dot"></span><strong>Layout preview</strong><span id="cwePreviewHint">Tap an object · drag to move</span></div><div class="cwe-view-switch"><button data-view="material" aria-pressed="true" type="button">Material</button><button data-view="outlines" aria-pressed="false" type="button">Outlines</button></div></div><div id="cweViewport" class="cwe-viewport"></div><div class="cwe-preview-meta"><span id="cweBlankSize">24 × 8 in blank</span><span id="cweOutlineCount">Vector artwork</span><button id="cweGuides" type="button" aria-pressed="true">Guides on</button></div><div id="cweGeometryErrors" class="cwe-errors" role="status" hidden></div><p id="cweStatus" class="cwe-status" role="status" aria-live="polite">Opening the local design workspace…</p><div id="cweDownloads" class="cwe-downloads" hidden></div></section></main>
    <footer class="cwe-footer"><div><strong id="cweFooterTitle">Reference design</strong><span>Carvewright ${BUILD} · ${reference?'Local workspace':'Carvewright workspace'}</span></div><div><button id="cweDownloadJob" type="button">${icons.save}<span>Download job</span></button><button id="cweExportSvg" class="cwe-primary" type="button">${icons.export}<span>Export SVG</span></button></div></footer></div>`;}
  function boardControls(){return `<div id="cweBoardPhotoControls" class="cwe-board-photo-controls"><strong>Your board photograph</strong><p class="cwe-field-note">Turn the photograph upright, then place the blue layout area on usable wood. Your photograph keeps its original proportions.</p><div class="cwe-board-frame-actions"><button id="cwePhotoRotateLeft" type="button" aria-label="Rotate board photo left">↶ Rotate left</button><button id="cwePhotoRotateRight" type="button" aria-label="Rotate board photo right">Rotate right ↷</button></div><label class="cwe-label" for="cweFrameScale">Layout area size<output id="cweFrameScaleValue"></output></label><input id="cweFrameScale" type="range" min="10" max="100" step="0.1"><label class="cwe-label" for="cweFrameX">Move area left or right</label><input id="cweFrameX" type="range" min="0" max="100" step="0.1"><label class="cwe-label" for="cweFrameY">Move area up or down</label><input id="cweFrameY" type="range" min="0" max="100" step="0.1"><div class="cwe-board-frame-actions"><button id="cweFrameReset" type="button">Reset area</button><button id="cweFrameApply" class="cwe-primary" type="button">Use this area</button></div><p id="cweFrameState" class="cwe-board-frame-state" role="status"></p><p class="cwe-board-reference">The size below is a reference for your design. Photograph placement does not measure the board. Ike confirms the actual dimensions before production.</p></div>`;}
  function syncBoardControls(s){
    if(!s.boardPhoto)return;
    const b=s.boardPhoto.board,f=b.frame;
    try{const base=photoCore().initialFrame(s.draft,s.boardPhoto.photo,b.quarterTurns),scale=f.w/base.w*100;setValue(s,'cweFrameScale',Number(scale.toFixed(1)));node(s,'cweFrameScaleValue').textContent=Number(scale.toFixed(1))+'%';}catch(_){node(s,'cweFrameScaleValue').textContent='Check dimensions';}
    setValue(s,'cweFrameX',f.w>=1-1e-9?50:Number((f.x/(1-f.w)*100).toFixed(1)));
    setValue(s,'cweFrameY',f.h>=1-1e-9?50:Number((f.y/(1-f.h)*100).toFixed(1)));
    node(s,'cweFrameState').textContent=b.frameConfirmed?'Area chosen. You can adjust the lettering on your photograph.':'Use this area when its whole outline is on usable wood, or choose Use this design to confirm the current area.';
  }
  function setValue(s,id,value,force=false){const n=node(s,id);if(force||document.activeElement!==n)n.value=Number.isFinite(value)||typeof value==='string'?value:'';}
  function dimensions(s,force=false){
    const d=s.draft,a=selected(s),graphic=a.type==='graphic';
    const values={cweWidth:d.stock.widthMm,cweHeight:d.stock.heightMm,cweThickness:d.stock.thicknessMm,cweMargin:d.stock.marginMm,cweOffsetX:graphic?a.centerXmm:a.text.offsetXmm,cweOffsetY:graphic?a.centerYmm:a.text.offsetYmm,cweGraphicWidth:graphic?a.widthMm:0,cweGraphicHeight:graphic?a.heightMm:0};
    for(const [id,value] of Object.entries(values))setValue(s,id,Number.isFinite(value)?display(s,value):'',force);
    setValue(s,'cweRotation',a.rotationDeg??0,force);
    node(s,'cweOffsetXLabel').textContent=graphic?'Center from left':'Horizontal offset';node(s,'cweOffsetYLabel').textContent=graphic?'Center from top':'Vertical offset';
    node(s,'cweTransformSummary').textContent=(Number.isFinite(a.rotationDeg)?a.rotationDeg:0)+'°';
    node(s,'cweNudgeAmount').textContent='Nudge '+(s.unit==='in'?'0.1 in':'1 mm');
    s.root.querySelectorAll('.cwe-unit').forEach(n=>n.textContent=s.unit);s.root.querySelectorAll('[data-unit]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.unit===s.unit)));
  }
  function syncForm(s,force=false){
    const d=s.draft,a=selected(s),text=a.type==='text'?a.text:null;
    for(const [id,value] of Object.entries({cweJobTitle:d.title,cweWording:text?.value||'',cweSize:text?.sizePercent??25,cweSizeNumber:text?.sizePercent??25,cweTracking:text?.trackingEm||0,cweStockId:d.stock.id,cweSpecies:d.appearance.wood}))setValue(s,id,value,force);
    node(s,'cweTextFields').hidden=!text;node(s,'cweGraphicFields').hidden=!!text;node(s,'cweSelectionName').textContent=a.type==='text'?(a.text.value.trim().replace(/\s+/g,' ').slice(0,38)||a.name):a.name;
    node(s,'cweSelectionBar').hidden=s.panel==='stock'||s.panel==='review';
    node(s,'cweSizeValue').textContent=Number.isFinite(text?.sizePercent)?text.sizePercent+'%':'Enter a size';node(s,'cweTrackingValue').textContent=Number(text?.trackingEm||0).toFixed(2)+' em';
    if(text){node(s,'cweCurrentFontName').textContent=catalog().fontLabels[text.fontId]?.name||fonts().fonts[text.fontId]?.name||text.fontId;if(s.previewFont!==text.fontId){node(s,'cweCurrentFontPreview').innerHTML=fontPreview(text.fontId);s.previewFont=text.fontId;}}
    for(const [attr,value] of [['font',text?.fontId],['align',text?.align],['ink',d.appearance.ink],['view',s.view]])s.root.querySelectorAll('[data-'+attr+']').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset[attr]===value)));
    dimensions(s,force);renderLayers(s);syncBoardControls(s);
  }
  function renderLayers(s){
    const all=objects(s);node(s,'cweObjectCount').textContent=all.length+' / 12';
    const html=all.map(a=>`<button type="button" data-layer-select="${esc(a.id)}" aria-pressed="${a.id===s.selectedId}"><span class="cwe-layer-symbol" aria-hidden="true">${a.type==='text'?'T':icons.layers}</span><span><strong>${esc(a.type==='text'?(a.text.value.trim().replace(/\s+/g,' ').slice(0,48)||a.name):a.name)}</strong><small>${esc(a.type==='text'?(catalog().fontLabels[a.text.fontId]?.name||'Lettering'):'Vector graphic')}${a.id==='primary'?' · main':''}</small></span><span class="cwe-radio"></span></button>`).join('');
    const list=node(s,'cweLayerList');if(list.innerHTML!==html){const focused=document.activeElement?.dataset.layerSelect;list.innerHTML=html;if(focused)list.querySelector('[data-layer-select="'+focused+'"]')?.focus({preventScroll:true});}
  }
  function layoutLayers(s){return s.layout.layers?.length?s.layout.layers:[{id:'primary',type:'text',name:'Main lettering',bounds:s.layout.bounds,glyphStart:0,glyphCount:s.layout.glyphs.length}];}
  const finiteBounds=b=>b&&['xMin','yMin','xMax','yMax','width','height'].every(k=>Number.isFinite(b[k]))&&b.width>=0&&b.height>=0;
  function photoScene(s){
    let composed;
    try{composed=photoCore().scene(s.draft,s.boardPhoto.photo,s.boardPhoto.board,fonts());}
    catch(error){s.photoScene=null;node(s,'cweViewport').innerHTML='<div class="cwe-preview-placeholder"><strong>Check the layout area</strong><span>'+esc(error.message)+'</span></div>';return;}
    s.photoScene=composed;
    const {width,height,matrix,framePixels:f}=composed,stroke=Math.max(width,height)/650,w=s.draft.stock.widthMm,h=s.draft.stock.heightMm,margin=s.draft.stock.marginMm,artStroke=stroke/matrix[0];
    let selectedBounds=null;
    const targets=layoutLayers(s).map(a=>{const b=a.bounds;if(a.id===s.selectedId&&finiteBounds(b))selectedBounds=b;return finiteBounds(b)&&a.glyphCount?`<g data-layer-id="${esc(a.id)}" aria-label="${esc(a.name)}" class="cwe-art-object"><rect x="${b.xMin}" y="${b.yMin}" width="${Math.max(b.width,artStroke*8)}" height="${Math.max(b.height,artStroke*8)}" fill="transparent" pointer-events="all"/></g>`:'';}).join('');
    const guides=s.guides&&Number.isFinite(margin)&&margin>=0&&margin<Math.min(w,h)/2?`<rect x="${margin}" y="${margin}" width="${w-margin*2}" height="${h-margin*2}" fill="none" stroke="#ffffff" stroke-opacity=".8" stroke-width="${artStroke}" stroke-dasharray="${artStroke*5} ${artStroke*5}" pointer-events="none"/>`:'';
    const selection=s.panel!=='stock'&&selectedBounds?`<rect x="${selectedBounds.xMin-artStroke*3}" y="${selectedBounds.yMin-artStroke*3}" width="${selectedBounds.width+artStroke*6}" height="${selectedBounds.height+artStroke*6}" fill="none" stroke="#20d6ff" stroke-width="${artStroke*1.5}" stroke-dasharray="${artStroke*6} ${artStroke*4}" pointer-events="none"/>`:'';
    const frame=s.panel==='stock'||s.guides?`<rect id="cwePhotoFrame" ${s.panel==='stock'?'data-board-frame="move"':''} x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" fill="${s.panel==='stock'?'#1675a8':'none'}" fill-opacity=".07" stroke="#159bea" stroke-width="${stroke*2}" stroke-dasharray="${stroke*6} ${stroke*4}" pointer-events="${s.panel==='stock'?'all':'none'}" style="cursor:${s.panel==='stock'?'move':'default'}"/>`:'';
    const art=composed.artworkSvg.replace('<g ','<g id="cwePhotoArtwork" ');
    node(s,'cweViewport').innerHTML=`<svg id="cweCanvas" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="cweCanvasTitle cweCanvasDesc" xmlns="http://www.w3.org/2000/svg"><title id="cweCanvasTitle">${esc(s.draft.title||'Sign design')}</title><desc id="cweCanvasDesc">Exact vector artwork on your board photograph. The layout dimensions are reference dimensions until Ike confirms the wood.</desc>${s.view==='material'?composed.photoSvg:`<rect width="${width}" height="${height}" fill="#f8fafb"/>`}${art}<g transform="matrix(${matrix.join(' ')})">${guides}${selection}${s.panel==='stock'?'':targets}</g>${frame}</svg>`;
    node(s,'cweBlankSize').textContent=`${display(s,w)} × ${display(s,h)} ${s.unit} reference · actual size unconfirmed`;
    node(s,'cwePreviewHint').textContent=s.panel==='stock'?'Drag the blue area · sliders resize and position':'Tap an object · drag to move';
  }
  function scene(s){
    const d=s.draft,w=d.stock.widthMm,h=d.stock.heightMm,margin=d.stock.marginMm;
    if(s.boardPhoto){photoScene(s);return;}
    if(!Number.isFinite(w)||!Number.isFinite(h)||w<25.4||h<25.4||w>3048||h>3048){node(s,'cweViewport').innerHTML='<div class="cwe-preview-placeholder"><strong>Enter valid blank dimensions</strong><span>Your artwork is kept while you adjust the blank.</span></div>';return;}
    const wood=d.appearance.wood,colors=wood==='walnut'?['#694433','#ad8060','#714b35']:wood==='oak'?['#b48650','#e3c18b','#b88952']:['#b77947','#e5b87c','#c78d56'];
    const pad=Math.max(w*.045,h*.13),stroke=Math.max(w/1100,.18),textSize=Math.max(w/65,h/32),vpad=pad+textSize*2,grain=[];
    for(let i=0;i<28;i++){const y=h*(i+.5)/28,delta=Math.sin(i*2.3)*h*.018;grain.push(`<path d="M0 ${y.toFixed(4)} C${(w*.2).toFixed(4)} ${(y+delta).toFixed(4)} ${(w*.48).toFixed(4)} ${(y-delta*1.8).toFixed(4)} ${w} ${(y+delta*.7).toFixed(4)}" fill="none" stroke="${i%3?'#704022':'#fff1cb'}" stroke-opacity="${i%3?'.13':'.22'}" stroke-width="${(stroke*(i%3?.7:1)).toFixed(4)}"/>`);}
    let selectedBounds=null;
    const paths=layoutLayers(s).map(a=>{
      const glyphs=s.layout.glyphs.slice(a.glyphStart,a.glyphStart+a.glyphCount);if(!glyphs.every(p=>typeof p.d==='string'&&Array.isArray(p.matrix)&&p.matrix.length===6&&p.matrix.every(Number.isFinite)))return '';
      const b=a.bounds;if(a.id===s.selectedId&&finiteBounds(b))selectedBounds=b;
      const hit=finiteBounds(b)&&glyphs.length?`<rect x="${b.xMin}" y="${b.yMin}" width="${Math.max(b.width,stroke*8)}" height="${Math.max(b.height,stroke*8)}" fill="transparent" pointer-events="all"/>`:'';
      return `<g data-layer-id="${esc(a.id)}" aria-label="${esc(a.name)}" class="cwe-art-object">${hit}${core().renderPaths({ok:true,glyphs})}</g>`;
    }).join('');
    const guides=s.guides&&Number.isFinite(margin)&&margin>=0&&margin<Math.min(w,h)/2?`<rect x="${margin}" y="${margin}" width="${w-margin*2}" height="${h-margin*2}" fill="none" stroke="${s.view==='material'?'#69482b':'#138b7b'}" stroke-opacity=".48" stroke-width="${stroke}" stroke-dasharray="${stroke*5} ${stroke*5}"/><path d="M${w/2} ${-pad*.35}V${h+pad*.35}M${-pad*.35} ${h/2}H${w+pad*.35}" stroke="#4e6b68" stroke-opacity=".22" stroke-width="${stroke*.8}" stroke-dasharray="${stroke*3} ${stroke*4}"/>`:'';
    const selection=selectedBounds?`<rect class="cwe-selection-outline" x="${selectedBounds.xMin-stroke*4}" y="${selectedBounds.yMin-stroke*4}" width="${selectedBounds.width+stroke*8}" height="${selectedBounds.height+stroke*8}" rx="${stroke*2}" fill="none" stroke="#067e72" stroke-width="${stroke*2}" stroke-dasharray="${stroke*7} ${stroke*4}" pointer-events="none"/>`:'';
    const widthLabel=`${display(s,w)} ${s.unit}`,heightLabel=`${display(s,h)} ${s.unit}`;
    node(s,'cweViewport').innerHTML=`<svg id="cweCanvas" viewBox="${-pad*1.5} ${-vpad} ${w+pad*3} ${h+vpad*2}" role="img" aria-labelledby="cweCanvasTitle cweCanvasDesc" xmlns="http://www.w3.org/2000/svg"><title id="cweCanvasTitle">${esc(d.title||'Sign design')}</title><desc id="cweCanvasDesc">Vector artwork on a ${esc(widthLabel)} by ${esc(heightLabel)} blank. Tap an object to select, then drag to move. Exact controls are under Edit.</desc><defs><linearGradient id="cweWoodGradient" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${colors[0]}"/><stop offset=".24" stop-color="${colors[1]}"/><stop offset=".72" stop-color="${colors[2]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient><clipPath id="cweStockClip"><rect width="${w}" height="${h}" rx="${stroke*2}"/></clipPath></defs><rect x="${stroke*2}" y="${stroke*6}" width="${w}" height="${h}" rx="${stroke*4}" fill="#172d35" opacity=".13"/><rect width="${w}" height="${h}" rx="${stroke*2}" fill="${s.view==='material'?'url(#cweWoodGradient)':'#fff'}" stroke="${s.view==='material'?'#a17043':'#b8c9cd'}" stroke-width="${stroke}"/>${s.view==='material'?`<g clip-path="url(#cweStockClip)">${grain.join('')}<path d="M0 ${stroke*3}H${w}" stroke="#fff0d3" stroke-opacity=".4" stroke-width="${stroke*1.5}"/></g>`:''}${guides}<g id="cweLettering" fill="${esc(d.appearance.ink)}">${paths}</g>${selection}<g fill="#547077" stroke="#8ba3a8" stroke-width="${stroke*.7}"><path d="M0 ${-pad*.7}H${w}M0 ${-pad*.95}V${-pad*.45}M${w} ${-pad*.95}V${-pad*.45}"/><path d="M${w+pad*.7} 0V${h}M${w+pad*.45} 0H${w+pad*.95}M${w+pad*.45} ${h}H${w+pad*.95}"/></g><g fill="#47636b" font-family="system-ui,sans-serif" font-size="${textSize}" text-anchor="middle"><text x="${w/2}" y="${-pad*.95}">${esc(widthLabel)}</text><text transform="translate(${w+pad*1.25} ${h/2}) rotate(90)">${esc(heightLabel)}</text></g></svg>`;
    node(s,'cweBlankSize').textContent=`${display(s,w)} × ${display(s,h)} ${s.unit} blank`;
  }
  function refresh(s){
    s.layout=core().layout(s.draft,fonts());syncForm(s);
    node(s,'cweGuides').setAttribute('aria-pressed',String(s.guides));node(s,'cweGuides').textContent=s.guides?'Guides on':'Guides off';
    const errors=node(s,'cweGeometryErrors');errors.hidden=s.layout.ok;errors.textContent=s.layout.errors.join(' ');
    node(s,'cweOutlineCount').textContent=s.layout.blank?'Blank artwork':`${s.layout.glyphs.length} outlines · ${s.layout.ok?'within margins':'check layout'}`;
    const reviewed=!!s.draft.review;
    node(s,'cweReviewState').textContent=!s.layout.ok?'Check the layout':s.layout.blank?'Add text or a graphic':reviewed?'Layout reviewed locally':'Ready to review';
    node(s,'cweReviewDescription').textContent=reviewed?'Saved review is tied to this exact design. Machining review is still separate.':'Check wording, dimensions and placement. Changes reset this local review.';
    node(s,'cweReview').textContent=reviewed?'Review recorded':'Mark layout reviewed';node(s,'cweFooterTitle').textContent=reviewed?'Locally reviewed layout':'Reference design';
    node(s,'cweSavedState').textContent=s.embedded?(s.dirty?'Changes ready to use':'Design for your sign request'):s.dirty?'Unsaved changes':s.draft.revision?`Saved · revision ${s.draft.revision}`:'New local design';
    node(s,'cweMachiningHelp').textContent=!s.dirty&&s.draft.revision>0&&reviewed?'Fixed-depth pockets · ShopBot, GRBL and LinuxCNC':'Review this layout, then save it before machining.';
    scene(s);controls(s);
  }
  function changed(s,{keepFrameConfirmation=false}={}){s.draft.review=null;if(s.boardPhoto&&!keepFrameConfirmation)s.boardPhoto.board.frameConfirmed=false;s.dirty=true;s.generation++;revoke(s);refresh(s);status(s,s.layout.ok?(s.embedded?'Choose Use this design to confirm the current layout area and return to your sign request.':'Changes are local. Save the design or download a job file.'):'Resolve the layout details before review or export.');}
  const snapshot=s=>({draft:clone(s.draft),selectedId:s.selectedId,board:s.boardPhoto?clone(s.boardPhoto.board):null});
  function remember(s,group=''){if(!group||s.editGroup!==group){s.undo.push(snapshot(s));if(s.undo.length>80)s.undo.shift();}s.editGroup=group;s.redo=[];}
  function applyDraft(s,draft,{selection=s.selectedId,group=''}={}){
    if(JSON.stringify(draft)===JSON.stringify(s.draft)){if(selection!==s.selectedId)selectLayer(s,selection);return;}
    remember(s,group);
    if(s.boardPhoto&&(draft.stock.widthMm!==s.draft.stock.widthMm||draft.stock.heightMm!==s.draft.stock.heightMm)){try{s.boardPhoto.board.frame=photoCore().initialFrame(draft,s.boardPhoto.photo,s.boardPhoto.board.quarterTurns);}catch(_){/* Keep the last frame while a reference dimension is incomplete. */}}
    s.draft=draft;s.selectedId=selection;changed(s);
  }
  function applyBoard(s,board,group='',confirmed=false){if(!s.boardPhoto)return;const next=clone(board);next.frameConfirmed=confirmed;if(JSON.stringify(next)===JSON.stringify(s.boardPhoto.board))return;remember(s,group);s.boardPhoto.board=next;changed(s,{keepFrameConfirmation:confirmed});}
  function boardInput(s,id,value){
    const n=Number(value);if(!Number.isFinite(n)||n<0||n>100)return;
    const b=clone(s.boardPhoto.board),f=b.frame;
    if(id==='cweFrameScale'){
      if(n<10)return;let max;try{max=photoCore().initialFrame(s.draft,s.boardPhoto.photo,b.quarterTurns);}catch(error){status(s,error.message,'error');return;}
      const cx=f.x+f.w/2,cy=f.y+f.h/2;f.w=max.w*n/100;f.h=max.h*n/100;f.x=Math.max(0,Math.min(1-f.w,cx-f.w/2));f.y=Math.max(0,Math.min(1-f.h,cy-f.h/2));
    }else if(id==='cweFrameX')f.x=(1-f.w)*n/100;else if(id==='cweFrameY')f.y=(1-f.h)*n/100;
    applyBoard(s,b,'board:'+id);
  }
  function mutate(s,action,group=''){try{const d=clone(s.draft);const next=action(d)||d;applyDraft(s,next,{group});}catch(e){status(s,e.message||'This edit could not be applied.','error');}}
  function history(s,direction){const from=s[direction],to=s[direction==='undo'?'redo':'undo'];if(!from.length)return;to.push(snapshot(s));const entry=from.pop(),identity={id:s.draft.id,revision:s.draft.revision};s.draft=Object.assign(entry.draft,identity);if(s.boardPhoto&&entry.board)s.boardPhoto.board=clone(entry.board);s.selectedId=entry.selectedId;s.editGroup='';if(!objects(s).some(a=>a.id===s.selectedId))s.selectedId='primary';changed(s);selectLayer(s,s.selectedId);status(s,(direction==='undo'?'Undid':'Redid')+' the last edit. Save to retain this version.');}
  function setPicker(s,kind,open){const pane=s.root.querySelector('.cwe-panel-scroll'),previous=pane.dataset.picker;for(const [name,box,button] of [['font','cweFontChoices','cweFontPicker'],['graphic','cweGraphicChoices','cweAddGraphic']]){const active=open&&name===kind;node(s,box).hidden=!active;node(s,button).setAttribute('aria-expanded',String(active));}pane.dataset.picker=open?kind:'';if(previous||open)pane.scrollTop=0;}
  function setPanel(s,panel){if(!panels.includes(panel))return;const changed=s.panel!==panel;setPicker(s,'',false);s.panel=panel;s.editGroup='';for(const p of panels){const cap=p[0].toUpperCase()+p.slice(1);node(s,'cwe'+cap+'Panel').hidden=p!==panel;node(s,'cwe'+cap+'Tab').setAttribute('aria-selected',String(p===panel));}node(s,'cweSelectionBar').hidden=panel==='stock'||panel==='review';if(changed)s.root.querySelector('.cwe-panel-scroll').scrollTop=0;if(s.boardPhoto)scene(s);}
  function selectLayer(s,id){if(!objects(s).some(a=>a.id===id))return;s.selectedId=id;s.editGroup='';setPicker(s,'',false);node(s,'cweTransform').open=selected(s).type==='graphic';syncForm(s,true);scene(s);controls(s);}
  function nudge(s,direction){const step=s.unit==='in'?2.54:1,dx=direction==='left'?-step:direction==='right'?step:0,dy=direction==='up'?-step:direction==='down'?step:0;mutate(s,d=>{const a=writable(d,s.selectedId);if(a.type==='text'){a.text.offsetXmm+=dx;a.text.offsetYmm+=dy;}else{a.centerXmm+=dx;a.centerYmm+=dy;}});}
  function discard(s){return !s.dirty||g.confirm(s.embedded?'Leave these design changes? Your sign request will keep its previous design.':'Leave these unsaved design changes? Saved copies and downloaded job files stay intact.');}
  function download(s,bytes,type,name,label){
    assertLive(s);revoke(s);const url=URL.createObjectURL(new Blob([bytes],{type}));s.urls.push(url);
    const box=node(s,'cweDownloads'),p=document.createElement('div');p.innerHTML=`<strong>${esc(label)}</strong><span>${esc(name)}</span>`;
    const a=document.createElement('a');a.href=url;a.download=name;a.target='_blank';a.rel='noopener noreferrer';a.className='cwe-download-link';a.textContent='Download file';
    const guard=e=>{if(!alive(s)){e.preventDefault();close(true);}};
    for(const type of ['pointerdown','click','auxclick','contextmenu','keydown','dragstart'])a.addEventListener(type,guard);
    box.append(p,a);box.hidden=false;box.scrollIntoView({block:'nearest',behavior:'smooth'});
  }
  function filename(s,extension){return (s.draft.title.replace(/[^a-z0-9 _-]/gi,'').trim().replace(/\s+/g,'-').slice(0,70)||'Carvewright-design')+'.'+extension;}
  async function click(s,e){
    const b=e.target.closest('button');if(!b||!s.root.contains(b))return;
    if(b.id==='cweClose'){close();return;}if(s.busy||s.drag)return;if(!alive(s)){close(true);return;}
    if(s.embedded&&['cweReview','cweMachining','cweExportSvg','cweDownloadJob'].includes(b.id))return;
    if(s.boardPhoto&&['cwePhotoRotateLeft','cwePhotoRotateRight','cweFrameReset','cweFrameApply'].includes(b.id)){
      try{
        if(b.id==='cweFrameApply'){const check=photoCore().validate(s.draft,s.boardPhoto.photo,s.boardPhoto.board,fonts());if(!check.ok)throw Error(check.errors.join(' '));applyBoard(s,s.boardPhoto.board,'',true);status(s,'Layout area chosen. The physical board size still needs Ike’s confirmation.');}
        else{const next=clone(s.boardPhoto.board);if(b.id!=='cweFrameReset')next.quarterTurns=(next.quarterTurns+(b.id==='cwePhotoRotateRight'?1:3))%4;next.frame=photoCore().initialFrame(s.draft,s.boardPhoto.photo,next.quarterTurns);applyBoard(s,next);status(s,'Place the blue layout area on usable wood, then choose Use this area.');}
      }catch(error){status(s,error.message,'error');}return;
    }
    if(b.dataset.panel){setPanel(s,b.dataset.panel);return;}
    if(b.dataset.unit){s.unit=b.dataset.unit;dimensions(s,true);scene(s);return;}
    if(b.dataset.view){s.view=b.dataset.view;refresh(s);return;}
    if(b.id==='cweGuides'){s.guides=!s.guides;refresh(s);return;}
    if(b.id==='cweUndo'||b.id==='cweRedo'){history(s,b.id==='cweUndo'?'undo':'redo');return;}
    if(b.dataset.layerSelect){selectLayer(s,b.dataset.layerSelect);return;}
    if(b.id==='cweFontPicker'||b.id==='cweCloseFonts'){const open=b.id==='cweFontPicker'&&node(s,'cweFontChoices').hidden;setPicker(s,'font',open);if(!open)node(s,'cweFontPicker').focus({preventScroll:true});return;}
    if(b.id==='cweAddGraphic'||b.id==='cweCloseGraphics'){const open=b.id==='cweAddGraphic'&&node(s,'cweGraphicChoices').hidden;setPicker(s,'graphic',open);if(!open)node(s,'cweAddGraphic').focus({preventScroll:true});return;}
    if(b.id==='cweAddText'||b.dataset.graphic||b.id==='cweDuplicate'){
      try{const next=b.id==='cweAddText'?core().addTextLayer(s.draft):b.dataset.graphic?core().addGraphicLayer(s.draft,b.dataset.graphic):core().duplicateLayer(s.draft,s.selectedId);const id=next.layers[next.layers.length-1].id;applyDraft(s,next,{selection:id});selectLayer(s,id);node(s,'cweGraphicChoices').hidden=true;node(s,'cweAddGraphic').setAttribute('aria-expanded','false');setPanel(s,'lettering');}catch(error){status(s,error.message,'error');}return;
    }
    if(b.id==='cweDelete'){try{const before=objects(s),index=before.findIndex(a=>a.id===s.selectedId),selection=s.selectedId==='primary'?'primary':before[Math.max(0,index-1)].id;applyDraft(s,core().removeLayer(s.draft,s.selectedId),{selection});selectLayer(s,selection);}catch(error){status(s,error.message,'error');}return;}
    if(b.dataset.font){mutate(s,d=>{const a=writable(d,s.selectedId);if(a.type==='text')a.text.fontId=b.dataset.font;});setPicker(s,'font',false);node(s,'cweFontPicker').focus({preventScroll:true});return;}
    if(b.dataset.align){mutate(s,d=>{const a=writable(d,s.selectedId);if(a.type==='text')a.text.align=b.dataset.align;});return;}
    if(b.dataset.ink){mutate(s,d=>{d.appearance.ink=b.dataset.ink;});return;}
    if(b.dataset.nudge){nudge(s,b.dataset.nudge);return;}
    if(b.id==='cweCenter'){mutate(s,d=>{const a=writable(d,s.selectedId);if(a.type==='text'){a.text.offsetXmm=0;a.text.offsetYmm=0;}else{a.centerXmm=d.stock.widthMm/2;a.centerYmm=d.stock.heightMm/2;}});return;}
    await run(s,async valid=>{
      if(b.id==='cweSave'){
        if(!s.layout.ok)throw Error('Resolve layout errors before saving.');
        let board=s.boardPhoto?clone(s.boardPhoto.board):null;
        if(board){const check=photoCore().validate(s.draft,s.boardPhoto.photo,board,fonts());if(!check.ok)throw Error(check.errors.join(' '));}
        if(s.embedded){if(!validLayout(s))throw Error('Add lettering or a graphic before using this design.');const used=clone(s.draft),check=core().validate(used,fonts());if(!check.ok)throw Error(check.errors.join(' '));if(board)board.frameConfirmed=true;await s.options.onUse(used,board);valid();s.dirty=false;close(true);return;}
        const saved=await s.store.save(clone(s.draft),s.draft.revision);valid();s.draft=saved;s.dirty=false;s.editGroup='';refresh(s);if(typeof s.options.onSaved==='function')s.options.onSaved(clone(saved),board);status(s,s.boardPhoto?'Design saved. Board photo placement is a visual reference; actual dimensions remain unconfirmed.':'Design saved to this Carvewright job. Download a job file to keep a portable copy.','success');
      }else if(b.id==='cweReview'){
        const reviewed=await core().review(s.draft,fonts());valid();remember(s);s.draft=reviewed;s.dirty=true;revoke(s);refresh(s);status(s,'Local layout review recorded. Save the design to retain it. This does not release a machining job.','success');
      }else if(b.id==='cweMachining'){
        if(s.dirty||s.draft.revision<1||!validLayout(s)||!await core().reviewMatches(s.draft,fonts()))throw Error('Save a reviewed design before preparing machining.');
        valid();if(!g.CarvewrightMachining?.open)throw Error('The machining workspace is unavailable. Open the complete Carvewright release.');
        g.CarvewrightMachining.open({draft:clone(s.draft),scope:clone(s.options.scope),guard:()=>{assertLive(s);return true;},parent:s.root,referenceOnly:!!s.options.referenceOnly,onClose:()=>{if(alive(s))status(s,'Returned from machining. Your saved artwork is unchanged.');}});
      }else if(b.id==='cweExportSvg'){
        const svg=core().toSvg(s.draft,fonts());valid();download(s,svg,'image/svg+xml',filename(s,'svg'),'SVG artwork prepared');status(s,'Artwork exported in millimeters, at the entered blank size. No cutting paths are included.','success');
      }else if(b.id==='cweDownloadJob'){
        const packet=await core().createPacket(s.draft,fonts());valid();download(s,JSON.stringify(packet,null,2),'application/json',filename(s,'json'),'Portable design file prepared');status(s,'Job file contains the design, exact outlines and source identity. It is not a machine program.','success');
      }
    });
  }
  function input(s,e){
    if(s.busy||!alive(s))return;const n=e.target,lengthFields={cweWidth:'widthMm',cweHeight:'heightMm',cweThickness:'thicknessMm',cweMargin:'marginMm'};
    if(s.boardPhoto&&['cweFrameScale','cweFrameX','cweFrameY'].includes(n.id)){boardInput(s,n.id,n.value);return;}
    const recognized=['cweWording','cweJobTitle','cweStockId','cweSize','cweSizeNumber','cweTracking','cweOffsetX','cweOffsetY','cweRotation','cweGraphicWidth','cweGraphicHeight','cweSpecies',...Object.keys(lengthFields)];if(!recognized.includes(n.id))return;
    mutate(s,d=>{
      if(n.id==='cweRotation'){if(s.selectedId==='primary'){if(!d.primaryTransform)d=core().ensureLayers(d);d.primaryTransform.rotationDeg=numberValue(n.value);}else writable(d,s.selectedId).rotationDeg=numberValue(n.value);return d;}
      const a=writable(d,s.selectedId);
      if(n.id==='cweWording'&&a.type==='text')a.text.value=n.value;
      else if(n.id==='cweJobTitle')d.title=n.value;
      else if(n.id==='cweStockId')d.stock.id=n.value;
      else if((n.id==='cweSize'||n.id==='cweSizeNumber')&&a.type==='text')a.text.sizePercent=numberValue(n.value);
      else if(n.id==='cweTracking'&&a.type==='text')a.text.trackingEm=numberValue(n.value);
      else if(lengthFields[n.id])d.stock[lengthFields[n.id]]=physicalInput(s,n.value);
      else if(n.id==='cweOffsetX'||n.id==='cweOffsetY'){const x=n.id==='cweOffsetX';if(a.type==='text')a.text[x?'offsetXmm':'offsetYmm']=physicalInput(s,n.value);else a[x?'centerXmm':'centerYmm']=physicalInput(s,n.value);}
      else if((n.id==='cweGraphicWidth'||n.id==='cweGraphicHeight')&&a.type==='graphic')a[n.id==='cweGraphicWidth'?'widthMm':'heightMm']=physicalInput(s,n.value);
      else if(n.id==='cweSpecies'){d.appearance.wood=n.value;d.stock.species={cedar:'Cedar',walnut:'Walnut',oak:'Oak'}[n.value];}
    },'input:'+s.selectedId+':'+n.id);
  }
  function scenePoint(s,e){const svg=node(s,'cweCanvas'),matrix=svg?.getScreenCTM();if(!matrix)return null;const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(matrix.inverse());}
  function stockPoint(s,e){const p=scenePoint(s,e);if(!p)return null;return s.boardPhoto?(s.photoScene?photoCore().toStockPoint(s.photoScene.matrix,p):null):p;}
  function pointerDown(s,e){
    if(s.busy||!alive(s)||e.button!==0)return;if(s.drag){cancelDrag(s);return;}
    if(s.boardPhoto&&s.panel==='stock'&&e.target.closest('[data-board-frame]')){
      const point=scenePoint(s,e);if(!point||!s.photoScene)return;s.drag={kind:'board',pointerId:e.pointerId,start:point,clientX:e.clientX,clientY:e.clientY,base:clone(s.draft),baseBoard:clone(s.boardPhoto.board),photoWidth:s.photoScene.width,photoHeight:s.photoScene.height,dirty:s.dirty,undo:s.undo.slice(),redo:s.redo.slice(),changed:false};controls(s);try{node(s,'cweViewport').setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();return;
    }
    const target=e.target.closest('[data-layer-id]');if(!target)return;
    const point=stockPoint(s,e);if(!point)return;
    selectLayer(s,target.dataset.layerId);s.drag={pointerId:e.pointerId,start:point,clientX:e.clientX,clientY:e.clientY,base:clone(s.draft),baseBoard:s.boardPhoto?clone(s.boardPhoto.board):null,id:s.selectedId,dirty:s.dirty,undo:s.undo.slice(),redo:s.redo.slice(),changed:false};controls(s);
    try{node(s,'cweViewport').setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();
  }
  function pointerMove(s,e){
    const drag=s.drag;if(!drag||drag.pointerId!==e.pointerId)return;if(!alive(s)){cancelDrag(s);close(true);return;}
    if(drag.kind==='board'){
      const point=scenePoint(s,e);if(!point)return;if(!drag.changed&&Math.hypot(e.clientX-drag.clientX,e.clientY-drag.clientY)<3)return;
      const next=clone(drag.baseBoard),f=next.frame;f.x=Math.max(0,Math.min(1-f.w,f.x+(point.x-drag.start.x)/drag.photoWidth));f.y=Math.max(0,Math.min(1-f.h,f.y+(point.y-drag.start.y)/drag.photoHeight));applyBoard(s,next,'drag:'+drag.pointerId);drag.changed=true;e.preventDefault();return;
    }
    const point=stockPoint(s,e);if(!point)return;const dx=point.x-drag.start.x,dy=point.y-drag.start.y;
    if(!drag.changed&&Math.hypot(e.clientX-drag.clientX,e.clientY-drag.clientY)<3)return;
    const candidate=clone(drag.base),a=writable(candidate,drag.id);
    if(a.type==='text'){a.text.offsetXmm=Math.round((a.text.offsetXmm+dx)*1e6)/1e6;a.text.offsetYmm=Math.round((a.text.offsetYmm+dy)*1e6)/1e6;}else{a.centerXmm=Math.round((a.centerXmm+dx)*1e6)/1e6;a.centerYmm=Math.round((a.centerYmm+dy)*1e6)/1e6;}
    const layout=core().layout(candidate,fonts()),bounds=layout.layers?.find(l=>l.id===drag.id)?.bounds||(drag.id==='primary'?layout.bounds:null),stock=candidate.stock;
    if(!finiteBounds(bounds)||!Number.isFinite(stock.marginMm)||bounds.xMin<stock.marginMm-1e-6||bounds.yMin<stock.marginMm-1e-6||bounds.xMax>stock.widthMm-stock.marginMm+1e-6||bounds.yMax>stock.heightMm-stock.marginMm+1e-6){status(s,'Keep the selected object inside the blank’s edge margin.');return;}
    applyDraft(s,candidate,{selection:drag.id,group:'drag:'+drag.pointerId});drag.changed=true;e.preventDefault();
  }
  function pointerUp(s,e){if(s.drag?.pointerId!==e.pointerId)return;s.drag=null;s.editGroup='';try{node(s,'cweViewport').releasePointerCapture(e.pointerId);}catch(_){}if(!alive(s))close(true);else controls(s);}
  function cancelDrag(s){const drag=s.drag;if(!drag)return;s.drag=null;s.draft=drag.base;if(s.boardPhoto&&drag.baseBoard)s.boardPhoto.board=drag.baseBoard;s.dirty=drag.dirty;s.undo=drag.undo;s.redo=drag.redo;s.editGroup='';s.generation++;refresh(s);status(s,'Move canceled. The object is back at its previous position.');}
  function close(force=false){
    const s=current;if(!s)return true;if(s.drag)cancelDrag(s);if(!force&&!discard(s))return false;
    s.closed=true;s.generation++;clearInterval(s.timer);if(!s.embedded)g.CarvewrightMachining?.close(true);s.store?.close();revoke(s);current=null;
    if(s.root.open)s.root.close();s.root.remove();if(s.origin?.isConnected)s.origin.focus({preventScroll:true});if(typeof s.options.onClose==='function')s.options.onClose();return true;
  }
  function open(options){return launch(options,false);}
  function openEmbedded(options){return launch(options,true);}
  function launch(options,embedded){
    if(current&&!close())return false;
    if(!options||typeof options.guard!=='function'||options.guard()!==true||(!embedded&&options.scope?.businessId!=='carvewright'))throw Error(embedded?'The sign request is no longer open.':'Open the editor from the Carvewright workspace.');
    if(embedded&&(!options.parent||!options.draft||typeof options.onUse!=='function'))throw Error('The customer editor needs an open request, design and return action.');
    if(!core()?.layerList||!fonts()||!catalog()||(!embedded&&!g.CarvewrightStore))throw Error('Carvewright Studio files are incomplete. Reload the complete release.');
    const parent=options.parent||document.body;if(!parent.isConnected)throw Error('The business workspace is closed.');
    const draft=options.draft?clone(options.draft):core().createDraft(),check=core().validate(draft,fonts());if(!check.ok)throw Error(check.errors.join(' '));
    let boardPhoto=null;
    if(options.boardPhoto){if(!photoCore()?.scene)throw Error('The board photograph editor is unavailable. Reload the complete release.');boardPhoto={photo:Object.freeze(clone(options.boardPhoto.photo)),board:clone(options.boardPhoto.board)};const check=photoCore().validate(draft,boardPhoto.photo,boardPhoto.board,fonts());if(!check.ok)throw Error(check.errors.join(' '));}
    const root=document.createElement('dialog');root.id='carvewrightStudio';root.className='cwe-modal';root.setAttribute('aria-labelledby','cweTitle');root.innerHTML=shell(!!options.referenceOnly);document.body.appendChild(root);
    const s={root,parent,options,embedded,origin:document.activeElement,draft,boardPhoto,photoScene:null,layout:null,store:null,unit:'in',view:'material',guides:true,panel:'lettering',selectedId:'primary',dirty:false,busy:false,closed:false,generation:0,urls:[],timer:null,undo:[],redo:[],editGroup:'',drag:null,previewFont:null};
    if(embedded){root.classList.add('cwe-embedded','cwe-ike-brand');node(s,'cweTitle').textContent='Ike’s Sign Studio';root.querySelector('.cwe-brand-icon').outerHTML='<img class="cwe-ike-character" src="ike_character.png" width="32" height="62" alt="Ike holding a wood sign">';root.querySelector('.cwe-brand small').textContent='IKE’S WOOD SIGNS';node(s,'cweClose').setAttribute('aria-label','Back to sign request');node(s,'cweClose').querySelector('span').textContent='Back to request';node(s,'cweSave').setAttribute('aria-label','Use this design');for(const id of ['cweReviewTab','cweReviewPanel','cweMachining','cweDownloadJob','cweExportSvg'])node(s,id).hidden=true;root.querySelector('.cwe-footer>div>span').textContent='Sign request · Ike confirms wood and machine setup';node(s,'cweStockPanel').querySelector('.cwe-field-note').textContent='Enter your requested blank size. Ike confirms the actual wood and dimensions before production.';}
    if(boardPhoto){root.classList.add('cwe-with-board-photo');node(s,'cweStockTab').textContent='Board';node(s,'cweStockPanel').insertAdjacentHTML('afterbegin',boardControls());root.querySelector('[data-view="material"]').textContent='Your photo';node(s,'cweStockPanel').querySelector('label[for="cweStockId"]').textContent='Board reference';}
    current=s;root.showModal();if(!embedded)try{s.store=g.CarvewrightStore.create({scope:clone(options.scope),guard:()=>{assertLive(s);return true;}});}catch(e){close(true);throw e;}
    root.addEventListener('click',e=>{e.stopPropagation();click(s,e);});root.addEventListener('input',e=>{e.stopPropagation();input(s,e);});root.addEventListener('change',e=>{e.stopPropagation();s.editGroup='';});root.addEventListener('focusout',()=>{s.editGroup='';});
    const viewport=node(s,'cweViewport');viewport.addEventListener('pointerdown',e=>pointerDown(s,e));viewport.addEventListener('pointermove',e=>pointerMove(s,e));viewport.addEventListener('pointerup',e=>pointerUp(s,e));viewport.addEventListener('pointercancel',()=>cancelDrag(s));viewport.addEventListener('lostpointercapture',()=>{if(s.drag)cancelDrag(s);});
    root.addEventListener('cancel',e=>{e.preventDefault();e.stopPropagation();if(s.drag)cancelDrag(s);else close();});
    root.addEventListener('keydown',e=>{
      if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(s.drag)cancelDrag(s);else if(s.root.querySelector('.cwe-panel-scroll').dataset.picker){const kind=s.root.querySelector('.cwe-panel-scroll').dataset.picker;setPicker(s,'',false);node(s,kind==='font'?'cweFontPicker':'cweAddGraphic').focus({preventScroll:true});}else close();return;}
      if(s.busy||s.drag||!alive(s)||e.target.matches('input,textarea,select,[contenteditable]'))return;
      if((e.metaKey||e.ctrlKey)&&['z','y'].includes(e.key.toLowerCase())){e.preventDefault();history(s,e.key.toLowerCase()==='y'||e.shiftKey?'redo':'undo');}
      else if(e.target.closest('[data-layer-select]')&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();nudge(s,e.key.slice(5).toLowerCase());}
    });
    root.addEventListener('close',()=>{if(current===s)close(true);});refresh(s);if(boardPhoto&&!boardPhoto.board.frameConfirmed)setPanel(s,'stock');node(s,'cweTitle').focus({preventScroll:true});
    s.timer=setInterval(()=>{if(!alive(s))close(true);},500);
    run(s,async valid=>{if(s.draft.review&&!await core().reviewMatches(s.draft,fonts())){valid();s.draft.review=null;refresh(s);}valid();status(s,s.embedded?'Tap artwork to select it. Choose Use this design when you are ready.':'Tap artwork to select it. Design changes stay local until you save.');});return true;
  }
  g.addEventListener('beforeunload',e=>{if(current?.dirty){e.preventDefault();e.returnValue='';}});
  for(const event of ['darksky:admiral-session-ended','darksky:admiral-session-unavailable'])g.addEventListener(event,()=>{if(current&&!current.embedded&&!current.options.referenceOnly)close(true);});
  g.addEventListener('darksky:admiral-session-changed',()=>{if(current&&!current.embedded&&!current.options.referenceOnly&&!alive(current))close(true);});
  g.addEventListener('focus',()=>{if(current&&!alive(current))close(true);});
  g.CarvewrightStudio=Object.freeze({build:BUILD,open,openEmbedded,close,isOpen:()=>!!current&&alive(current)});
})(typeof window!=='undefined'?window:globalThis);

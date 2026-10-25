/* Carvewright 8.8.20.57 — independent design editor with a separate local machining workspace. */
(function (g) {
  'use strict';
  if (!g.document || g.CarvewrightStudio) return;
  const BUILD = '8.8.20.57';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clone = v => JSON.parse(JSON.stringify(v));
  const icon = (body, extra='') => `<svg viewBox="0 0 24 24" aria-hidden="true" ${extra}>${body}</svg>`;
  const icons = {
    close: icon('<path d="m9 5-7 7 7 7M2 12h20"/>'),
    save: icon('<path d="M5 3h12l4 4v14H3V3h2Zm2 0v6h10V3M7 21v-8h10v8"/>'),
    export: icon('<path d="M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6"/>'),
    check: icon('<path d="m5 12 4 4L19 6"/>'),
    layers: icon('<path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5"/>'),
    plus: icon('<path d="M12 4v16M4 12h16"/>'),
    folder: icon('<path d="M3 6h7l2 3h9v11H3V6Zm0 3V4h7l2 2h7v3"/>'),
    ruler: icon('<path d="M3 6h18v12H3zM7 6v5m5-5v8m5-8v5"/>')
  };
  let current = null;
  function core() { return g.CarvewrightCore; }
  function fonts() { return g.IkeCarveFonts; }
  function node(s, id) { return s.root.querySelector('#'+id); }
  function alive(s) {
    try { return current === s && !s.closed && s.root.open && s.parent.isConnected && s.options.guard() === true; }
    catch (_) { return false; }
  }
  function assertLive(s) {
    if (!alive(s)) throw Object.assign(Error('The workspace changed. Reopen Carvewright Studio to continue.'), {code:'AUTH'});
  }
  function status(s, text, tone='info') {
    if (current !== s || s.closed) return;
    const n=node(s,'cweStatus'); n.textContent=text; n.dataset.tone=tone;
  }
  function revoke(s) {
    s.urls.forEach(u=>URL.revokeObjectURL(u)); s.urls=[];
    const n=node(s,'cweDownloads'); if(n){n.hidden=true;n.replaceChildren();}
  }
  function validLayout(s) { return s.layout?.ok && !s.layout.blank; }
  function controls(s) {
    if(current!==s || s.closed)return;
    const disabled=s.busy || !alive(s);
    s.root.setAttribute('aria-busy',String(s.busy));
    s.root.querySelectorAll('button,input,select,textarea').forEach(n=>{n.disabled=disabled;});
    node(s,'cweClose').disabled=false;
    for(const id of ['cweReview','cweExportSvg','cweDownloadJob'])node(s,id).disabled=disabled||!validLayout(s);
    node(s,'cweSave').disabled=disabled||!s.layout?.ok;
    node(s,'cweMachining').disabled=disabled||!validLayout(s)||s.dirty||s.draft.revision<1||!s.draft.review;
    node(s,'cweSaveLabel').textContent=s.busy?'Working…':'Save design';
  }
  async function run(s, action) {
    if(s.busy)return;
    try { assertLive(s); } catch(_) { close(true); return; }
    s.busy=true;controls(s);
    const generation=s.generation;
    const valid=()=>{assertLive(s);if(generation!==s.generation)throw Error('The design changed before the action completed.');};
    try { await action(valid); valid(); }
    catch(e) { if(current===s&&!s.closed){if(e.code==='AUTH'||!alive(s))close(true);else status(s,e.code==='CONFLICT'?'A newer copy was saved in another window. Download this job to keep your edits, then reopen the saved design.':(e.message||'This action could not be completed.'),'error');} }
    finally { if(current===s&&!s.closed){s.busy=false;controls(s);} }
  }
  function units(s, mm) { return s.unit==='in'?mm/25.4:mm; }
  function display(s, mm) { return Number(units(s,mm).toFixed(s.unit==='in'?3:2)); }
  function numberValue(v) { return v.trim()===''?NaN:Number(v); }
  function physicalInput(s,v) { const n=numberValue(v)*(s.unit==='in'?25.4:1);return Number.isFinite(n)?Math.round(n*1e9)/1e9:n; }
  function shell(reference) {
    return `<div class="cwe-shell"><header class="cwe-header"><div class="cwe-brand"><span class="cwe-brand-icon">${icons.layers}</span><div><small>DESIGN &amp; PRODUCTION</small><h1 id="cweTitle" tabindex="-1">Carvewright Studio<span>DESIGN WORKSPACE</span></h1></div></div><button id="cweClose" class="cwe-quiet" type="button">${icons.close}<span>Back to jobs</span></button></header>
    <div class="cwe-projectbar"><div class="cwe-project-name"><label for="cweJobTitle">DESIGN NAME</label><input id="cweJobTitle" maxlength="160" autocomplete="off" data-bf-trim="preserve"><span id="cweSavedState">New local design</span></div><div class="cwe-project-actions"><button id="cweSave" class="cwe-primary" type="button">${icons.save}<span id="cweSaveLabel">Save design</span></button></div></div>
    <main class="cwe-main"><aside class="cwe-inspector"><div class="cwe-panel-tabs" role="tablist" aria-label="Design controls"><button id="cweLetteringTab" data-panel="lettering" role="tab" aria-controls="cweLetteringPanel" aria-selected="true" type="button">Lettering</button><button id="cweStockTab" data-panel="stock" role="tab" aria-controls="cweStockPanel" aria-selected="false" type="button">Blank &amp; size</button></div>
    <section id="cweLetteringPanel" class="cwe-control-panel" role="tabpanel" aria-labelledby="cweLetteringTab"><label class="cwe-label" for="cweWording">Your wording<span>Up to 3 lines</span></label><textarea id="cweWording" rows="3" maxlength="480" data-bf-trim="preserve" autocapitalize="off" autocomplete="off" spellcheck="false" placeholder="Type your sign…"></textarea><div class="cwe-field-note">Case, spaces and punctuation stay as entered.</div><fieldset class="cwe-font-field"><legend>Lettering style</legend><button data-font="studio-sans" class="cwe-font-option" aria-pressed="true" type="button"><span class="cwe-font-sample cwe-font-sans">Aa</span><span><strong>Studio Sans Bold</strong><small>Clean &amp; substantial</small></span><span class="cwe-radio"></span></button><button data-font="studio-serif" class="cwe-font-option" aria-pressed="false" type="button"><span class="cwe-font-sample cwe-font-serif">Aa</span><span><strong>Studio Serif Bold</strong><small>Traditional &amp; detailed</small></span><span class="cwe-radio"></span></button></fieldset>
    <label class="cwe-label" for="cweSize">Lettering size<output id="cweSizeValue">85%</output></label><input id="cweSize" type="range" min="10" max="100" step="1"><label class="cwe-label" for="cweTracking">Letter spacing<output id="cweTrackingValue">0.00 em</output></label><input id="cweTracking" type="range" min="-0.1" max="0.5" step="0.01"><div class="cwe-label">Alignment</div><div class="cwe-segmented"><button data-align="left" type="button" aria-label="Align left">${icon('<path d="M4 5h16M4 10h10M4 15h16M4 20h10"/>')}</button><button data-align="center" type="button" aria-label="Align center">${icon('<path d="M4 5h16M7 10h10M4 15h16M7 20h10"/>')}</button><button data-align="right" type="button" aria-label="Align right">${icon('<path d="M4 5h16M10 10h10M4 15h16M10 20h10"/>')}</button></div>
    <div class="cwe-label">Lettering color</div><div class="cwe-colors"><button data-ink="#20262d" style="--swatch:#20262d" type="button" aria-label="Charcoal lettering"></button><button data-ink="#f8f3e8" style="--swatch:#f8f3e8" type="button" aria-label="Ivory lettering"></button><button data-ink="#284941" style="--swatch:#284941" type="button" aria-label="Forest lettering"></button><button data-ink="#693b30" style="--swatch:#693b30" type="button" aria-label="Oxide lettering"></button></div><div class="cwe-reference-note"><strong>Public reference lettering</strong><p>These bundled outlines let you design now. Shop-specific lettering can be added when its approved vector files are available.</p></div></section>
    <section id="cweStockPanel" class="cwe-control-panel" role="tabpanel" aria-labelledby="cweStockTab" hidden><div class="cwe-label">Display units</div><div class="cwe-segmented"><button data-unit="in" type="button">Inches</button><button data-unit="mm" type="button">Millimeters</button></div><div class="cwe-dimension-grid"><label>Width <span class="cwe-unit"></span><input id="cweWidth" type="number" step="any" inputmode="decimal"></label><label>Height <span class="cwe-unit"></span><input id="cweHeight" type="number" step="any" inputmode="decimal"></label><label>Thickness <span class="cwe-unit"></span><input id="cweThickness" type="number" step="any" inputmode="decimal"></label><label>Edge margin <span class="cwe-unit"></span><input id="cweMargin" type="number" step="any" inputmode="decimal"></label></div><label class="cwe-label" for="cweStockId">Blank identifier</label><input id="cweStockId" maxlength="80" data-bf-trim="preserve" autocomplete="off"><label class="cwe-label" for="cweSpecies">Material appearance</label><select id="cweSpecies"><option value="cedar">Cedar</option><option value="walnut">Walnut</option><option value="oak">Oak</option></select><div class="cwe-dimension-grid cwe-offset-fields"><label>Horizontal offset <span class="cwe-unit"></span><input id="cweOffsetX" type="number" step="any" inputmode="decimal"></label><label>Vertical offset <span class="cwe-unit"></span><input id="cweOffsetY" type="number" step="any" inputmode="decimal"></label></div><button id="cweCenter" class="cwe-full" type="button">Reset position</button><div class="cwe-reference-note"><strong>Reference blank</strong><p>Dimensions are entered here by the operator. Wood appearance is illustrative; it does not measure or identify a physical slab.</p></div></section>
    </aside>
    <section class="cwe-workbench" aria-label="Sign preview"><div class="cwe-view-toolbar"><div><span class="cwe-green-dot"></span><strong>Layout preview</strong><span id="cwePreviewHint">Physical vector outlines</span></div><div class="cwe-view-switch"><button data-view="material" aria-pressed="true" type="button">Material</button><button data-view="outlines" aria-pressed="false" type="button">Outlines</button></div></div><div id="cweViewport" class="cwe-viewport"></div><div class="cwe-preview-meta"><span id="cweBlankSize">24 × 8 in blank</span><span id="cweOutlineCount">Vector lettering</span><button id="cweGuides" type="button" aria-pressed="true">Guides on</button></div><div id="cweGeometryErrors" class="cwe-errors" role="status" hidden></div>
    <div class="cwe-production-row"><section class="cwe-review-card"><span class="cwe-card-icon">${icons.check}</span><div><small>DESIGN CHECK</small><strong id="cweReviewState">Ready to review</strong><p id="cweReviewDescription">Review this layout before preparing the next step.</p><button id="cweReview" type="button">Mark layout reviewed</button></div></section><section class="cwe-cam-card"><span class="cwe-card-icon">${icons.ruler}</span><div><small>PRODUCTION</small><strong>Prepare this sign for cutting</strong><p>Calculate recessed lettering paths and export a controller program from this saved design.</p><button id="cweMachining" type="button">Prepare machining</button><small id="cweMachiningHelp">Save a reviewed design to prepare cutting paths.</small></div></section></div><p id="cweStatus" class="cwe-status" role="status" aria-live="polite">Opening the local design workspace…</p><div id="cweDownloads" class="cwe-downloads" hidden></div></section></main>
    <footer class="cwe-footer"><div><strong id="cweFooterTitle">Reference design</strong><span>Carvewright ${BUILD} · ${reference?'Local workspace':'Carvewright workspace'}</span></div><div><button id="cweDownloadJob" type="button">${icons.save}<span>Download job</span></button><button id="cweExportSvg" class="cwe-primary" type="button">${icons.export}<span>Export SVG</span></button></div></footer></div>`;
  }
  function setForm(s) {
    const d=s.draft;
    for(const [id,value] of Object.entries({cweJobTitle:d.title,cweWording:d.text.value,cweSize:d.text.sizePercent,cweTracking:d.text.trackingEm,cweStockId:d.stock.id,cweSpecies:d.appearance.wood}))node(s,id).value=value;
    dimensions(s);refresh(s);
  }
  function dimensions(s) {
    const d=s.draft;
    for(const [id,value] of Object.entries({cweWidth:d.stock.widthMm,cweHeight:d.stock.heightMm,cweThickness:d.stock.thicknessMm,cweMargin:d.stock.marginMm,cweOffsetX:d.text.offsetXmm,cweOffsetY:d.text.offsetYmm}))node(s,id).value=Number.isFinite(value)?display(s,value):'';
    s.root.querySelectorAll('.cwe-unit').forEach(n=>n.textContent=s.unit);
    s.root.querySelectorAll('[data-unit]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.unit===s.unit)));
  }
  function scene(s) {
    const d=s.draft, w=d.stock.widthMm, h=d.stock.heightMm, margin=d.stock.marginMm;
    if(!Number.isFinite(w)||!Number.isFinite(h)||w<25.4||h<25.4||w>3048||h>3048){node(s,'cweViewport').innerHTML='<div class="cwe-preview-placeholder"><strong>Enter valid blank dimensions</strong><span>Your lettering is kept while you adjust the blank.</span></div>';return;}
    const wood=d.appearance.wood, colors=wood==='walnut'?['#694433','#ad8060','#714b35']:wood==='oak'?['#b48650','#e3c18b','#b88952']:['#b77947','#e5b87c','#c78d56'];
    const pad=Math.max(w*.045,h*.13), stroke=Math.max(w/1100,.18), textSize=Math.max(w/65,h/32), vpad=pad+textSize*2;
    const grain=[];
    for(let i=0;i<28;i++){const y=h*(i+.5)/28,delta=Math.sin(i*2.3)*h*.018;grain.push(`<path d="M0 ${y.toFixed(4)} C${(w*.2).toFixed(4)} ${(y+delta).toFixed(4)} ${(w*.48).toFixed(4)} ${(y-delta*1.8).toFixed(4)} ${w} ${(y+delta*.7).toFixed(4)}" fill="none" stroke="${i%3?'#704022':'#fff1cb'}" stroke-opacity="${i%3?'.13':'.22'}" stroke-width="${(stroke*(i%3?.7:1)).toFixed(4)}"/>`);}
    const paths=s.layout?.ok?core().renderPaths(s.layout):'';
    const guides=s.guides&&Number.isFinite(margin)&&margin>=0&&margin<Math.min(w,h)/2?`<rect x="${margin}" y="${margin}" width="${w-margin*2}" height="${h-margin*2}" fill="none" stroke="${s.view==='material'?'#69482b':'#138b7b'}" stroke-opacity=".48" stroke-width="${stroke}" stroke-dasharray="${stroke*5} ${stroke*5}"/><path d="M${w/2} ${-pad*.35}V${h+pad*.35}M${-pad*.35} ${h/2}H${w+pad*.35}" stroke="#4e6b68" stroke-opacity=".22" stroke-width="${stroke*.8}" stroke-dasharray="${stroke*3} ${stroke*4}"/>`:'';
    const widthLabel=`${display(s,w)} ${s.unit}`,heightLabel=`${display(s,h)} ${s.unit}`;
    node(s,'cweViewport').innerHTML=`<svg id="cweCanvas" viewBox="${-pad*1.5} ${-vpad} ${w+pad*3} ${h+vpad*2}" role="img" aria-labelledby="cweCanvasTitle cweCanvasDesc" xmlns="http://www.w3.org/2000/svg"><title id="cweCanvasTitle">${esc(d.text.value||'Blank sign')}</title><desc id="cweCanvasDesc">Reference lettering layout on a ${esc(widthLabel)} by ${esc(heightLabel)} blank. This is not a simulated cut.</desc><defs><linearGradient id="cweWoodGradient" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${colors[0]}"/><stop offset=".24" stop-color="${colors[1]}"/><stop offset=".72" stop-color="${colors[2]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient><clipPath id="cweStockClip"><rect width="${w}" height="${h}" rx="${stroke*2}"/></clipPath></defs><rect x="${stroke*2}" y="${stroke*6}" width="${w}" height="${h}" rx="${stroke*4}" fill="#172d35" opacity=".13"/><rect width="${w}" height="${h}" rx="${stroke*2}" fill="${s.view==='material'?'url(#cweWoodGradient)':'#fff'}" stroke="${s.view==='material'?'#a17043':'#b8c9cd'}" stroke-width="${stroke}"/>${s.view==='material'?`<g clip-path="url(#cweStockClip)">${grain.join('')}<path d="M0 ${stroke*3}H${w}" stroke="#fff0d3" stroke-opacity=".4" stroke-width="${stroke*1.5}"/></g>`:''}${guides}<g id="cweLettering" fill="${esc(d.appearance.ink)}">${paths}</g><g fill="#547077" stroke="#8ba3a8" stroke-width="${stroke*.7}"><path d="M0 ${-pad*.7}H${w}M0 ${-pad*.95}V${-pad*.45}M${w} ${-pad*.95}V${-pad*.45}"/><path d="M${w+pad*.7} 0V${h}M${w+pad*.45} 0H${w+pad*.95}M${w+pad*.45} ${h}H${w+pad*.95}"/></g><g fill="#47636b" font-family="system-ui,sans-serif" font-size="${textSize}" text-anchor="middle"><text x="${w/2}" y="${-pad*.95}">${esc(widthLabel)}</text><text transform="translate(${w+pad*1.25} ${h/2}) rotate(90)">${esc(heightLabel)}</text></g></svg>`;
    node(s,'cweBlankSize').textContent=`${display(s,w)} × ${display(s,h)} ${s.unit} blank`;
  }
  function refresh(s) {
    s.layout=core().layout(s.draft,fonts());
    node(s,'cweSizeValue').textContent=s.draft.text.sizePercent+'%';
    node(s,'cweTrackingValue').textContent=Number(s.draft.text.trackingEm).toFixed(2)+' em';
    for(const [attr,value] of [['font',s.draft.text.fontId],['align',s.draft.text.align],['ink',s.draft.appearance.ink],['view',s.view]])s.root.querySelectorAll('[data-'+attr+']').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset[attr]===value)));
    node(s,'cweGuides').setAttribute('aria-pressed',String(s.guides));node(s,'cweGuides').textContent=s.guides?'Guides on':'Guides off';
    const errors=node(s,'cweGeometryErrors');errors.hidden=s.layout.ok;errors.textContent=s.layout.errors.join(' ');
    node(s,'cweOutlineCount').textContent=s.layout.blank?'Blank lettering':`${s.layout.glyphs.length} letter outlines · ${s.layout.ok?'within margins':'needs attention'}`;
    const reviewed=!!s.draft.review;
    node(s,'cweReviewState').textContent=!s.layout.ok?'Check the layout':s.layout.blank?'Add your wording':reviewed?'Layout reviewed locally':'Ready to review';
    node(s,'cweReviewDescription').textContent=reviewed?'Saved review is tied to this exact design. Machining review is still separate.':'Check wording, dimensions and placement. Changes reset this local review.';
    node(s,'cweReview').textContent=reviewed?'Review recorded':'Mark layout reviewed';
    node(s,'cweFooterTitle').textContent=reviewed?'Locally reviewed layout':'Reference design';
    node(s,'cweSavedState').textContent=s.dirty?'Unsaved changes':s.draft.revision?`Saved locally · revision ${s.draft.revision}`:'New local design';
    node(s,'cweMachiningHelp').textContent=!s.dirty&&s.draft.revision>0&&reviewed?'Fixed-depth pockets · ShopBot, GRBL and LinuxCNC':'Review this layout, then save it before machining.';
    scene(s);controls(s);
  }
  function changed(s) {
    s.draft.review=null;s.dirty=true;s.generation++;revoke(s);refresh(s);
    status(s,s.layout.ok?'Changes are local. Save the design or download a job file.':'Resolve the layout details before review or export.');
  }
  function discard(s) { return !s.dirty||g.confirm('Leave these unsaved design changes? Saved copies and downloaded job files stay intact.'); }
  function download(s, bytes, type, name, label) {
    assertLive(s);revoke(s);const url=URL.createObjectURL(new Blob([bytes],{type}));s.urls.push(url);
    const box=node(s,'cweDownloads'),p=document.createElement('div');p.innerHTML=`<strong>${esc(label)}</strong><span>${esc(name)}</span>`;
    const a=document.createElement('a');a.href=url;a.download=name;a.target='_blank';a.rel='noopener noreferrer';a.className='cwe-download-link';a.textContent='Download file';a.addEventListener('click',e=>{if(!alive(s)){e.preventDefault();close(true);}});box.append(p,a);box.hidden=false;box.scrollIntoView({block:'nearest',behavior:'smooth'});
  }
  function filename(s, extension) { return (s.draft.title.replace(/[^a-z0-9 _-]/gi,'').trim().replace(/\s+/g,'-').slice(0,70)||'Carvewright-design')+'.'+extension; }
  async function click(s,e) {
    const b=e.target.closest('button');if(!b||!s.root.contains(b))return;
    if(b.id==='cweClose'){close();return;}
    if(s.busy)return;if(!alive(s)){close(true);return;}
    if(b.dataset.panel){s.panel=b.dataset.panel;for(const panel of ['lettering','stock']){const selected=s.panel===panel;node(s,panel==='lettering'?'cweLetteringPanel':'cweStockPanel').hidden=!selected;node(s,panel==='lettering'?'cweLetteringTab':'cweStockTab').setAttribute('aria-selected',String(selected));}return;}
    if(b.dataset.unit){s.unit=b.dataset.unit;dimensions(s);scene(s);return;}
    if(b.dataset.view){s.view=b.dataset.view;refresh(s);return;}
    if(b.id==='cweGuides'){s.guides=!s.guides;refresh(s);return;}
    if(b.dataset.font){s.draft.text.fontId=b.dataset.font;changed(s);return;}
    if(b.dataset.align){s.draft.text.align=b.dataset.align;changed(s);return;}
    if(b.dataset.ink){s.draft.appearance.ink=b.dataset.ink;changed(s);return;}
    if(b.id==='cweCenter'){s.draft.text.offsetXmm=0;s.draft.text.offsetYmm=0;dimensions(s);changed(s);return;}
    await run(s,async valid=>{
      if(b.id==='cweSave'){
        if(!s.layout.ok)throw Error('Resolve layout errors before saving.');
        const saved=await s.store.save(clone(s.draft),s.draft.revision);valid();s.draft=saved;s.dirty=false;refresh(s);if(typeof s.options.onSaved==='function')s.options.onSaved(clone(saved));status(s,'Design saved to this Carvewright job. Download a job file to keep a portable copy.','success');
      } else if(b.id==='cweReview'){
        const reviewed=await core().review(s.draft,fonts());valid();s.draft=reviewed;s.dirty=true;revoke(s);refresh(s);status(s,'Local layout review recorded. Save the design to retain it. This does not release a machining job.','success');
      } else if(b.id==='cweMachining'){
        if(s.dirty||s.draft.revision<1||!validLayout(s)||!await core().reviewMatches(s.draft,fonts()))throw Error('Save a reviewed design before preparing machining.');
        valid();if(!g.CarvewrightMachining?.open)throw Error('The machining workspace is unavailable. Open the complete Carvewright release.');
        g.CarvewrightMachining.open({draft:clone(s.draft),scope:clone(s.options.scope),guard:()=>{assertLive(s);return true;},parent:s.root,referenceOnly:!!s.options.referenceOnly,onClose:()=>{if(alive(s))status(s,'Returned from machining. Your saved artwork is unchanged.');}});
      } else if(b.id==='cweExportSvg'){
        const svg=core().toSvg(s.draft,fonts());valid();download(s,svg,'image/svg+xml',filename(s,'svg'),'SVG artwork prepared');status(s,'Lettering exported in millimeters, at the entered blank size. No cutting paths are included.','success');
      } else if(b.id==='cweDownloadJob'){
        const packet=await core().createPacket(s.draft,fonts());valid();download(s,JSON.stringify(packet,null,2),'application/json',filename(s,'json'),'Portable design file prepared');status(s,'Job file contains the design, exact outlines and source identity. It is not a machine program.','success');
      }
    });
  }
  function input(s,e) {
    if(s.busy||!alive(s))return;const n=e.target,d=s.draft;
    const lengthFields={cweWidth:'widthMm',cweHeight:'heightMm',cweThickness:'thicknessMm',cweMargin:'marginMm'};
    if(n.id==='cweWording')d.text.value=n.value;
    else if(n.id==='cweJobTitle')d.title=n.value;
    else if(n.id==='cweStockId')d.stock.id=n.value;
    else if(n.id==='cweSize')d.text.sizePercent=numberValue(n.value);
    else if(n.id==='cweTracking')d.text.trackingEm=numberValue(n.value);
    else if(lengthFields[n.id])d.stock[lengthFields[n.id]]=physicalInput(s,n.value);
    else if(n.id==='cweOffsetX'||n.id==='cweOffsetY')d.text[n.id==='cweOffsetX'?'offsetXmm':'offsetYmm']=physicalInput(s,n.value);
    else if(n.id==='cweSpecies'){d.appearance.wood=n.value;d.stock.species={cedar:'Cedar',walnut:'Walnut',oak:'Oak'}[n.value];}
    else return;
    changed(s);
  }
  function close(force=false) {
    const s=current;if(!s)return true;if(!force&&!discard(s))return false;
    s.closed=true;s.generation++;clearInterval(s.timer);g.CarvewrightMachining?.close(true);s.store?.close();revoke(s);current=null;
    if(s.root.open)s.root.close();s.root.remove();
    if(s.origin?.isConnected)s.origin.focus({preventScroll:true});
    if(typeof s.options.onClose==='function')s.options.onClose();return true;
  }
  function open(options) {
    if(current&&!close())return false;
    if(!options||typeof options.guard!=='function'||options.guard()!==true||options.scope?.businessId!=='carvewright')throw Error('Open the editor from the Carvewright workspace.');
    if(!core()||!fonts()||!g.CarvewrightStore)throw Error('Carvewright Studio files are incomplete. Reload the complete release.');
    const parent=options.parent||document.body;if(!parent.isConnected)throw Error('The business workspace is closed.');
    const draft=options.draft?clone(options.draft):core().createDraft();
    const check=core().validate(draft,fonts());if(!check.ok)throw Error(check.errors.join(' '));
    const root=document.createElement('dialog');root.id='carvewrightStudio';root.className='cwe-modal';root.setAttribute('aria-labelledby','cweTitle');root.innerHTML=shell(!!options.referenceOnly);document.body.appendChild(root);
    const s={root,parent,options,origin:document.activeElement,draft,layout:null,store:null,unit:'in',view:'material',guides:true,panel:'lettering',dirty:false,busy:false,closed:false,generation:0,urls:[],saved:[],timer:null};
    current=s;root.showModal();
    try{s.store=g.CarvewrightStore.create({scope:clone(options.scope),guard:()=>{assertLive(s);return true;}});}
    catch(e){close(true);throw e;}
    root.addEventListener('click',e=>{e.stopPropagation();click(s,e);});root.addEventListener('input',e=>{e.stopPropagation();input(s,e);});root.addEventListener('change',e=>{e.stopPropagation();});
    root.addEventListener('cancel',e=>{e.preventDefault();e.stopPropagation();close();});
    root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}});
    root.addEventListener('close',()=>{if(current===s)close(true);});
    setForm(s);node(s,'cweTitle').focus({preventScroll:true});
    s.timer=setInterval(()=>{if(!alive(s))close(true);},500);
    run(s,async valid=>{if(s.draft.review&&!await core().reviewMatches(s.draft,fonts())){valid();s.draft.review=null;refresh(s);}valid();status(s,'Design changes stay in this Carvewright job. Save to keep them, or download a portable copy.');});
    return true;
  }
  g.addEventListener('beforeunload',e=>{if(current?.dirty){e.preventDefault();e.returnValue='';}});
  for(const event of ['darksky:admiral-session-ended','darksky:admiral-session-unavailable'])g.addEventListener(event,()=>{if(current&&!current.options.referenceOnly)close(true);});
  g.addEventListener('darksky:admiral-session-changed',()=>{if(current&&!current.options.referenceOnly&&!alive(current))close(true);});
  g.addEventListener('focus',()=>{if(current&&!alive(current))close(true);});
  g.CarvewrightStudio=Object.freeze({build:BUILD,open,close,isOpen:()=>!!current&&alive(current)});
})(typeof window!=='undefined'?window:globalThis);

/* Carvewright 8.8.20.68 — local vector design workspace. No network or machining output. */
(function (g) {
  'use strict';
  if (!g.document || g.IkeCarveStudio) return;
  const BUILD = '8.8.20.68';
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
  function core() { return g.IkeCarveCore; }
  function fonts() { return g.IkeCarveFonts; }
  function node(s, id) { return s.root.querySelector('#'+id); }
  function alive(s) {
    try { return current === s && !s.closed && s.root.open && s.parent.isConnected && s.options.guard() === true; }
    catch (_) { return false; }
  }
  function assertLive(s) {
    if (!alive(s)) throw Object.assign(Error('The workspace changed. Reopen Carve Studio to continue.'), {code:'AUTH'});
  }
  function status(s, text, tone='info') {
    if (current !== s || s.closed) return;
    const n=node(s,'icsStatus'); n.textContent=text; n.dataset.tone=tone;
  }
  function revoke(s) {
    s.urls.forEach(u=>URL.revokeObjectURL(u)); s.urls=[];
    const n=node(s,'icsDownloads'); if(n){n.hidden=true;n.replaceChildren();}
  }
  function validLayout(s) { return s.layout?.ok && !s.layout.blank; }
  function controls(s) {
    if(current!==s || s.closed)return;
    const disabled=s.busy || !alive(s);
    s.root.setAttribute('aria-busy',String(s.busy));
    s.root.querySelectorAll('button,input,select,textarea').forEach(n=>{n.disabled=disabled;});
    node(s,'icsClose').disabled=false;
    for(const id of ['icsReview','icsExportSvg','icsDownloadJob'])node(s,id).disabled=disabled||!validLayout(s);
    node(s,'icsSave').disabled=disabled||!s.layout?.ok;
    node(s,'icsOpenSaved').disabled=disabled||!node(s,'icsSaved').value;
    node(s,'icsSaveLabel').textContent=s.busy?'Working…':'Save design';
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
    return `<div class="ics-shell"><header class="ics-header"><div class="ics-brand"><span class="ics-brand-icon">${icons.layers}</span><div><small>IKE’S WOOD SIGNS</small><h1 id="icsTitle" tabindex="-1">Carve Studio<span>DESIGN WORKSPACE</span></h1></div></div><button id="icsClose" class="ics-quiet" type="button">${icons.close}<span>${reference?'Close studio':'Back to business'}</span></button></header>
    <div class="ics-projectbar"><div class="ics-project-name"><label for="icsJobTitle">DESIGN NAME</label><input id="icsJobTitle" maxlength="80" autocomplete="off" data-bf-trim="preserve"><span id="icsSavedState">New local design</span></div><div class="ics-project-actions"><button id="icsNew" type="button">${icons.plus}<span>New</span></button><button id="icsImport" type="button">${icons.folder}<span>Open job file</span></button><input id="icsImportFile" type="file" accept=".json,application/json" hidden><button id="icsSave" class="ics-primary" type="button">${icons.save}<span id="icsSaveLabel">Save design</span></button></div></div>
    <main class="ics-main"><aside class="ics-inspector"><div class="ics-panel-tabs" role="tablist" aria-label="Design controls"><button id="icsLetteringTab" data-panel="lettering" role="tab" aria-controls="icsLetteringPanel" aria-selected="true" type="button">Lettering</button><button id="icsStockTab" data-panel="stock" role="tab" aria-controls="icsStockPanel" aria-selected="false" type="button">Blank &amp; size</button></div>
    <section id="icsLetteringPanel" class="ics-control-panel" role="tabpanel" aria-labelledby="icsLetteringTab"><label class="ics-label" for="icsWording">Your wording<span>Up to 3 lines</span></label><textarea id="icsWording" rows="3" maxlength="480" data-bf-trim="preserve" autocapitalize="off" autocomplete="off" spellcheck="false" placeholder="Type your sign…"></textarea><div class="ics-field-note">Case, spaces and punctuation stay as entered.</div><fieldset class="ics-font-field"><legend>Lettering style</legend><button data-font="studio-sans" class="ics-font-option" aria-pressed="true" type="button"><span class="ics-font-sample ics-font-sans">Aa</span><span><strong>Studio Sans Bold</strong><small>Clean &amp; substantial</small></span><span class="ics-radio"></span></button><button data-font="studio-serif" class="ics-font-option" aria-pressed="false" type="button"><span class="ics-font-sample ics-font-serif">Aa</span><span><strong>Studio Serif Bold</strong><small>Traditional &amp; detailed</small></span><span class="ics-radio"></span></button></fieldset>
    <label class="ics-label" for="icsSize">Lettering size<output id="icsSizeValue">85%</output></label><input id="icsSize" type="range" min="10" max="100" step="1"><label class="ics-label" for="icsTracking">Letter spacing<output id="icsTrackingValue">0.00 em</output></label><input id="icsTracking" type="range" min="-0.1" max="0.5" step="0.01"><div class="ics-label">Alignment</div><div class="ics-segmented"><button data-align="left" type="button" aria-label="Align left">${icon('<path d="M4 5h16M4 10h10M4 15h16M4 20h10"/>')}</button><button data-align="center" type="button" aria-label="Align center">${icon('<path d="M4 5h16M7 10h10M4 15h16M7 20h10"/>')}</button><button data-align="right" type="button" aria-label="Align right">${icon('<path d="M4 5h16M10 10h10M4 15h16M10 20h10"/>')}</button></div>
    <div class="ics-label">Lettering color</div><div class="ics-colors"><button data-ink="#20262d" style="--swatch:#20262d" type="button" aria-label="Charcoal lettering"></button><button data-ink="#f8f3e8" style="--swatch:#f8f3e8" type="button" aria-label="Ivory lettering"></button><button data-ink="#284941" style="--swatch:#284941" type="button" aria-label="Forest lettering"></button><button data-ink="#693b30" style="--swatch:#693b30" type="button" aria-label="Oxide lettering"></button></div><div class="ics-reference-note"><strong>Public reference lettering</strong><p>These bundled outlines let you design now. Ike’s approved A, B and C alphabets can be added when their vector files are available.</p></div></section>
    <section id="icsStockPanel" class="ics-control-panel" role="tabpanel" aria-labelledby="icsStockTab" hidden><div class="ics-label">Display units</div><div class="ics-segmented"><button data-unit="in" type="button">Inches</button><button data-unit="mm" type="button">Millimeters</button></div><div class="ics-dimension-grid"><label>Width <span class="ics-unit"></span><input id="icsWidth" type="number" step="any" inputmode="decimal"></label><label>Height <span class="ics-unit"></span><input id="icsHeight" type="number" step="any" inputmode="decimal"></label><label>Thickness <span class="ics-unit"></span><input id="icsThickness" type="number" step="any" inputmode="decimal"></label><label>Edge margin <span class="ics-unit"></span><input id="icsMargin" type="number" step="any" inputmode="decimal"></label></div><label class="ics-label" for="icsStockId">Blank identifier</label><input id="icsStockId" maxlength="80" data-bf-trim="preserve" autocomplete="off"><label class="ics-label" for="icsSpecies">Material appearance</label><select id="icsSpecies"><option value="cedar">Cedar</option><option value="walnut">Walnut</option><option value="oak">Oak</option></select><div class="ics-dimension-grid ics-offset-fields"><label>Horizontal offset <span class="ics-unit"></span><input id="icsOffsetX" type="number" step="any" inputmode="decimal"></label><label>Vertical offset <span class="ics-unit"></span><input id="icsOffsetY" type="number" step="any" inputmode="decimal"></label></div><button id="icsCenter" class="ics-full" type="button">Reset position</button><div class="ics-reference-note"><strong>Reference blank</strong><p>Dimensions are entered here by the operator. Wood appearance is illustrative; it does not measure or identify a physical slab.</p></div></section>
    <div class="ics-saved-panel"><label class="ics-label" for="icsSaved">Saved on this device</label><div class="ics-saved-row"><select id="icsSaved"><option value="">No saved designs yet</option></select><button id="icsOpenSaved" type="button">Open</button></div><small>Job files let you move a copy to another device.</small></div></aside>
    <section class="ics-workbench" aria-label="Sign preview"><div class="ics-view-toolbar"><div><span class="ics-green-dot"></span><strong>Layout preview</strong><span id="icsPreviewHint">Physical vector outlines</span></div><div class="ics-view-switch"><button data-view="material" aria-pressed="true" type="button">Material</button><button data-view="outlines" aria-pressed="false" type="button">Outlines</button></div></div><div id="icsViewport" class="ics-viewport"></div><div class="ics-preview-meta"><span id="icsBlankSize">24 × 8 in blank</span><span id="icsOutlineCount">Vector lettering</span><button id="icsGuides" type="button" aria-pressed="true">Guides on</button></div><div id="icsGeometryErrors" class="ics-errors" role="status" hidden></div>
    <div class="ics-production-row"><section class="ics-review-card"><span class="ics-card-icon">${icons.check}</span><div><small>DESIGN CHECK</small><strong id="icsReviewState">Ready to review</strong><p id="icsReviewDescription">Review this layout before preparing the next step.</p><button id="icsReview" type="button">Mark layout reviewed</button></div></section><section class="ics-cam-card"><span class="ics-card-icon">${icons.ruler}</span><div><small>PRODUCTION</small><strong>Prepare a vector handoff</strong><p>SVG contains your lettering at the entered size. Tools, cutting paths and machine settings are a separate step.</p><span class="ics-stage-tag">DESIGN FOUNDATION · NO TOOLPATHS</span></div></section></div><p id="icsStatus" class="ics-status" role="status" aria-live="polite">Opening the local design workspace…</p><div id="icsDownloads" class="ics-downloads" hidden></div></section></main>
    <footer class="ics-footer"><div><strong id="icsFooterTitle">Reference design</strong><span>Carvewright ${BUILD} · ${reference?'Local reference workspace':'Ike’s scoped workspace'}</span></div><div><button id="icsDownloadJob" type="button">${icons.save}<span>Download job</span></button><button id="icsExportSvg" class="ics-primary" type="button">${icons.export}<span>Export SVG</span></button></div></footer></div>`;
  }
  function setForm(s) {
    const d=s.draft;
    for(const [id,value] of Object.entries({icsJobTitle:d.title,icsWording:d.text.value,icsSize:d.text.sizePercent,icsTracking:d.text.trackingEm,icsStockId:d.stock.id,icsSpecies:d.appearance.wood}))node(s,id).value=value;
    dimensions(s);refresh(s);
  }
  function dimensions(s) {
    const d=s.draft;
    for(const [id,value] of Object.entries({icsWidth:d.stock.widthMm,icsHeight:d.stock.heightMm,icsThickness:d.stock.thicknessMm,icsMargin:d.stock.marginMm,icsOffsetX:d.text.offsetXmm,icsOffsetY:d.text.offsetYmm}))node(s,id).value=Number.isFinite(value)?display(s,value):'';
    s.root.querySelectorAll('.ics-unit').forEach(n=>n.textContent=s.unit);
    s.root.querySelectorAll('[data-unit]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.unit===s.unit)));
  }
  function scene(s) {
    const d=s.draft, w=d.stock.widthMm, h=d.stock.heightMm, margin=d.stock.marginMm;
    if(!Number.isFinite(w)||!Number.isFinite(h)||w<25.4||h<25.4||w>3048||h>3048){node(s,'icsViewport').innerHTML='<div class="ics-preview-placeholder"><strong>Enter valid blank dimensions</strong><span>Your lettering is kept while you adjust the blank.</span></div>';return;}
    const wood=d.appearance.wood, colors=wood==='walnut'?['#694433','#ad8060','#714b35']:wood==='oak'?['#b48650','#e3c18b','#b88952']:['#b77947','#e5b87c','#c78d56'];
    const pad=Math.max(w*.045,h*.13), stroke=Math.max(w/1100,.18), textSize=Math.max(w/65,h/32), vpad=pad+textSize*2;
    const grain=[];
    for(let i=0;i<28;i++){const y=h*(i+.5)/28,delta=Math.sin(i*2.3)*h*.018;grain.push(`<path d="M0 ${y.toFixed(4)} C${(w*.2).toFixed(4)} ${(y+delta).toFixed(4)} ${(w*.48).toFixed(4)} ${(y-delta*1.8).toFixed(4)} ${w} ${(y+delta*.7).toFixed(4)}" fill="none" stroke="${i%3?'#704022':'#fff1cb'}" stroke-opacity="${i%3?'.13':'.22'}" stroke-width="${(stroke*(i%3?.7:1)).toFixed(4)}"/>`);}
    const paths=s.layout?.ok?core().renderPaths(s.layout):'';
    const guides=s.guides&&Number.isFinite(margin)&&margin>=0&&margin<Math.min(w,h)/2?`<rect x="${margin}" y="${margin}" width="${w-margin*2}" height="${h-margin*2}" fill="none" stroke="${s.view==='material'?'#69482b':'#138b7b'}" stroke-opacity=".48" stroke-width="${stroke}" stroke-dasharray="${stroke*5} ${stroke*5}"/><path d="M${w/2} ${-pad*.35}V${h+pad*.35}M${-pad*.35} ${h/2}H${w+pad*.35}" stroke="#4e6b68" stroke-opacity=".22" stroke-width="${stroke*.8}" stroke-dasharray="${stroke*3} ${stroke*4}"/>`:'';
    const widthLabel=`${display(s,w)} ${s.unit}`,heightLabel=`${display(s,h)} ${s.unit}`;
    node(s,'icsViewport').innerHTML=`<svg id="icsCanvas" viewBox="${-pad*1.5} ${-vpad} ${w+pad*3} ${h+vpad*2}" role="img" aria-labelledby="icsCanvasTitle icsCanvasDesc" xmlns="http://www.w3.org/2000/svg"><title id="icsCanvasTitle">${esc(d.text.value||'Blank sign')}</title><desc id="icsCanvasDesc">Reference lettering layout on a ${esc(widthLabel)} by ${esc(heightLabel)} blank. This is not a simulated cut.</desc><defs><linearGradient id="icsWoodGradient" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${colors[0]}"/><stop offset=".24" stop-color="${colors[1]}"/><stop offset=".72" stop-color="${colors[2]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient><clipPath id="icsStockClip"><rect width="${w}" height="${h}" rx="${stroke*2}"/></clipPath></defs><rect x="${stroke*2}" y="${stroke*6}" width="${w}" height="${h}" rx="${stroke*4}" fill="#172d35" opacity=".13"/><rect width="${w}" height="${h}" rx="${stroke*2}" fill="${s.view==='material'?'url(#icsWoodGradient)':'#fff'}" stroke="${s.view==='material'?'#a17043':'#b8c9cd'}" stroke-width="${stroke}"/>${s.view==='material'?`<g clip-path="url(#icsStockClip)">${grain.join('')}<path d="M0 ${stroke*3}H${w}" stroke="#fff0d3" stroke-opacity=".4" stroke-width="${stroke*1.5}"/></g>`:''}${guides}<g id="icsLettering" fill="${esc(d.appearance.ink)}">${paths}</g><g fill="#547077" stroke="#8ba3a8" stroke-width="${stroke*.7}"><path d="M0 ${-pad*.7}H${w}M0 ${-pad*.95}V${-pad*.45}M${w} ${-pad*.95}V${-pad*.45}"/><path d="M${w+pad*.7} 0V${h}M${w+pad*.45} 0H${w+pad*.95}M${w+pad*.45} ${h}H${w+pad*.95}"/></g><g fill="#47636b" font-family="system-ui,sans-serif" font-size="${textSize}" text-anchor="middle"><text x="${w/2}" y="${-pad*.95}">${esc(widthLabel)}</text><text transform="translate(${w+pad*1.25} ${h/2}) rotate(90)">${esc(heightLabel)}</text></g></svg>`;
    node(s,'icsBlankSize').textContent=`${display(s,w)} × ${display(s,h)} ${s.unit} blank`;
  }
  function refresh(s) {
    s.layout=core().layout(s.draft,fonts());
    node(s,'icsSizeValue').textContent=s.draft.text.sizePercent+'%';
    node(s,'icsTrackingValue').textContent=Number(s.draft.text.trackingEm).toFixed(2)+' em';
    for(const [attr,value] of [['font',s.draft.text.fontId],['align',s.draft.text.align],['ink',s.draft.appearance.ink],['view',s.view]])s.root.querySelectorAll('[data-'+attr+']').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset[attr]===value)));
    node(s,'icsGuides').setAttribute('aria-pressed',String(s.guides));node(s,'icsGuides').textContent=s.guides?'Guides on':'Guides off';
    const errors=node(s,'icsGeometryErrors');errors.hidden=s.layout.ok;errors.textContent=s.layout.errors.join(' ');
    node(s,'icsOutlineCount').textContent=s.layout.blank?'Blank lettering':`${s.layout.glyphs.length} letter outlines · ${s.layout.ok?'within margins':'needs attention'}`;
    const reviewed=!!s.draft.review;
    node(s,'icsReviewState').textContent=!s.layout.ok?'Check the layout':s.layout.blank?'Add your wording':reviewed?'Layout reviewed locally':'Ready to review';
    node(s,'icsReviewDescription').textContent=reviewed?'Saved review is tied to this exact design. Machining review is still separate.':'Check wording, dimensions and placement. Changes reset this local review.';
    node(s,'icsReview').textContent=reviewed?'Review recorded':'Mark layout reviewed';
    node(s,'icsFooterTitle').textContent=reviewed?'Locally reviewed layout':'Reference design';
    node(s,'icsSavedState').textContent=s.dirty?'Unsaved changes':s.draft.revision?`Saved locally · revision ${s.draft.revision}`:'New local design';
    scene(s);controls(s);
  }
  function changed(s) {
    s.draft.review=null;s.dirty=true;s.generation++;revoke(s);refresh(s);
    status(s,s.layout.ok?'Changes are local. Save the design or download a job file.':'Resolve the layout details before review or export.');
  }
  async function savedList(s, valid=()=>assertLive(s)) {
    const rows=await s.store.list();valid();s.saved=rows;
    const select=node(s,'icsSaved'),old=select.value;
    select.innerHTML='<option value="">'+(rows.length?'Choose a saved design':'No saved designs yet')+'</option>'+rows.map(r=>`<option value="${esc(r.id)}">${esc(r.title)} · r${r.revision}</option>`).join('');
    select.value=rows.some(r=>r.id===s.draft.id)?s.draft.id:(rows.some(r=>r.id===old)?old:'');
    controls(s);
  }
  function discard(s) { return !s.dirty||g.confirm('Leave these unsaved design changes? Saved copies and downloaded job files stay intact.'); }
  function download(s, bytes, type, name, label) {
    assertLive(s);revoke(s);const url=URL.createObjectURL(new Blob([bytes],{type}));s.urls.push(url);
    const box=node(s,'icsDownloads'),p=document.createElement('div');p.innerHTML=`<strong>${esc(label)}</strong><span>${esc(name)}</span>`;
    const a=document.createElement('a');a.href=url;a.download=name;a.target='_blank';a.rel='noopener noreferrer';a.className='ics-download-link';a.textContent='Download file';a.addEventListener('click',e=>{if(!alive(s)){e.preventDefault();close(true);}});box.append(p,a);box.hidden=false;box.scrollIntoView({block:'nearest',behavior:'smooth'});
  }
  function filename(s, extension) { return (s.draft.title.replace(/[^a-z0-9 _-]/gi,'').trim().replace(/\s+/g,'-').slice(0,70)||'Ike-sign')+'.'+extension; }
  async function click(s,e) {
    const b=e.target.closest('button');if(!b||!s.root.contains(b))return;
    if(b.id==='icsClose'){close();return;}
    if(s.busy)return;if(!alive(s)){close(true);return;}
    if(b.dataset.panel){s.panel=b.dataset.panel;for(const panel of ['lettering','stock']){const selected=s.panel===panel;node(s,panel==='lettering'?'icsLetteringPanel':'icsStockPanel').hidden=!selected;node(s,panel==='lettering'?'icsLetteringTab':'icsStockTab').setAttribute('aria-selected',String(selected));}return;}
    if(b.dataset.unit){s.unit=b.dataset.unit;dimensions(s);scene(s);return;}
    if(b.dataset.view){s.view=b.dataset.view;refresh(s);return;}
    if(b.id==='icsGuides'){s.guides=!s.guides;refresh(s);return;}
    if(b.dataset.font){s.draft.text.fontId=b.dataset.font;changed(s);return;}
    if(b.dataset.align){s.draft.text.align=b.dataset.align;changed(s);return;}
    if(b.dataset.ink){s.draft.appearance.ink=b.dataset.ink;changed(s);return;}
    if(b.id==='icsCenter'){s.draft.text.offsetXmm=0;s.draft.text.offsetYmm=0;dimensions(s);changed(s);return;}
    if(b.id==='icsNew'){if(!discard(s))return;s.draft=core().createDraft();s.dirty=false;s.generation++;revoke(s);setForm(s);status(s,'New reference design. Previous saved designs remain in the list.');return;}
    if(b.id==='icsImport'){node(s,'icsImportFile').click();return;}
    await run(s,async valid=>{
      if(b.id==='icsSave'){
        if(!s.layout.ok)throw Error('Resolve layout errors before saving.');
        const saved=await s.store.save(clone(s.draft),s.draft.revision);valid();s.draft=saved;s.dirty=false;await savedList(s,valid);refresh(s);status(s,'Design saved on this device. Download a job file to keep a portable copy.','success');
      } else if(b.id==='icsOpenSaved'){
        if(!discard(s))return;const id=node(s,'icsSaved').value;if(!id)return;
        const loaded=await s.store.load(id);valid();if(!loaded)throw Error('That saved design is no longer available.');
        const check=core().validate(loaded,fonts());if(!check.ok)throw Error('Saved design needs attention: '+check.errors.join(' '));
        if(loaded.review&&!await core().reviewMatches(loaded,fonts()))loaded.review=null;valid();s.draft=loaded;s.dirty=false;revoke(s);setForm(s);status(s,'Saved design opened from this device.','success');
      } else if(b.id==='icsReview'){
        const reviewed=await core().review(s.draft,fonts());valid();s.draft=reviewed;s.dirty=true;revoke(s);refresh(s);status(s,'Local layout review recorded. Save the design to retain it. This does not release a machining job.','success');
      } else if(b.id==='icsExportSvg'){
        const svg=core().toSvg(s.draft,fonts());valid();download(s,svg,'image/svg+xml',filename(s,'svg'),'SVG artwork prepared');status(s,'Lettering exported in millimeters, at the entered blank size. No cutting paths are included.','success');
      } else if(b.id==='icsDownloadJob'){
        const packet=await core().createPacket(s.draft,fonts());valid();download(s,JSON.stringify(packet,null,2),'application/json',filename(s,'json'),'Portable design file prepared');status(s,'Job file contains the design, exact outlines and source identity. It is not a machine program.','success');
      }
    });
  }
  function input(s,e) {
    if(s.busy||!alive(s))return;const n=e.target,d=s.draft;
    const lengthFields={icsWidth:'widthMm',icsHeight:'heightMm',icsThickness:'thicknessMm',icsMargin:'marginMm'};
    if(n.id==='icsWording')d.text.value=n.value;
    else if(n.id==='icsJobTitle')d.title=n.value;
    else if(n.id==='icsStockId')d.stock.id=n.value;
    else if(n.id==='icsSize')d.text.sizePercent=numberValue(n.value);
    else if(n.id==='icsTracking')d.text.trackingEm=numberValue(n.value);
    else if(lengthFields[n.id])d.stock[lengthFields[n.id]]=physicalInput(s,n.value);
    else if(n.id==='icsOffsetX'||n.id==='icsOffsetY')d.text[n.id==='icsOffsetX'?'offsetXmm':'offsetYmm']=physicalInput(s,n.value);
    else if(n.id==='icsSpecies'){d.appearance.wood=n.value;d.stock.species={cedar:'Cedar',walnut:'Walnut',oak:'Oak'}[n.value];}
    else return;
    changed(s);
  }
  async function change(s,e) {
    if(e.target.id==='icsSaved'){controls(s);return;}
    if(e.target.id!=='icsImportFile')return;
    const file=e.target.files?.[0];e.target.value='';if(!file)return;if(!discard(s))return;
    await run(s,async valid=>{
      if(file.size>4*1024*1024)throw Error('Choose a Carve Studio job file smaller than 4 MiB.');
      const text=await file.text();valid();const imported=await core().readPacket(text,fonts());valid();s.draft=imported;s.dirty=true;revoke(s);setForm(s);status(s,'Job file opened as a new design copy. Existing saved designs were kept.','success');
    });
  }
  function close(force=false) {
    const s=current;if(!s)return true;if(!force&&!discard(s))return false;
    s.closed=true;s.generation++;clearInterval(s.timer);s.store?.close();revoke(s);current=null;
    if(s.root.open)s.root.close();s.root.remove();
    if(s.origin?.isConnected)s.origin.focus({preventScroll:true});
    if(typeof s.options.onClose==='function')s.options.onClose();return true;
  }
  function open(options) {
    if(current&&!close())return false;
    if(!options||typeof options.guard!=='function'||options.guard()!==true||options.scope?.businessId!=='ikes-wood-signs')throw Error('Open Carve Studio from the correct business workspace.');
    if(!core()||!fonts()||!g.IkeCarveStore)throw Error('Carve Studio files are incomplete. Reload the complete release.');
    const parent=options.parent||document.body;if(!parent.isConnected)throw Error('The business workspace is closed.');
    const root=document.createElement('dialog');root.id='ikeCarveStudio';root.className='ics-modal';root.setAttribute('aria-labelledby','icsTitle');root.innerHTML=shell(!!options.referenceOnly);document.body.appendChild(root);
    const s={root,parent,options,origin:document.activeElement,draft:core().createDraft(),layout:null,store:null,unit:'in',view:'material',guides:true,panel:'lettering',dirty:false,busy:false,closed:false,generation:0,urls:[],saved:[],timer:null};
    current=s;root.showModal();
    try{s.store=g.IkeCarveStore.create({scope:clone(options.scope),guard:()=>{assertLive(s);return true;}});}
    catch(e){close(true);throw e;}
    root.addEventListener('click',e=>{e.stopPropagation();click(s,e);});root.addEventListener('input',e=>{e.stopPropagation();input(s,e);});root.addEventListener('change',e=>{e.stopPropagation();change(s,e);});
    root.addEventListener('cancel',e=>{e.preventDefault();e.stopPropagation();close();});
    root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}});
    root.addEventListener('close',()=>{if(current===s)close(true);});
    setForm(s);node(s,'icsTitle').focus({preventScroll:true});
    s.timer=setInterval(()=>{if(!alive(s))close(true);},500);
    run(s,async valid=>{await savedList(s,valid);status(s,options.referenceOnly?'Local reference workspace. Designs are saved only in this browser.':'Ike’s design workspace. Saved designs stay in this exact business and account.');});
    return true;
  }
  g.addEventListener('beforeunload',e=>{if(current?.dirty){e.preventDefault();e.returnValue='';}});
  for(const event of ['darksky:admiral-session-ended','darksky:admiral-session-unavailable','darksky:admiral-session-changed'])g.addEventListener(event,()=>{if(current&&!current.options.referenceOnly)close(true);});
  g.addEventListener('focus',()=>{if(current&&!alive(current))close(true);});
  g.IkeCarveStudio=Object.freeze({build:BUILD,open,close,isOpen:()=>!!current&&alive(current)});
})(typeof window!=='undefined'?window:globalThis);

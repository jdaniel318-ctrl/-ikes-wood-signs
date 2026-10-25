/* Black Flag Workhorse — presentation-only business workspace.
   Consumes the already-authorized, exact-project browser snapshot. No fetch,
   direct storage writes, permission changes, order edits or automatic retries.
   An explicit pricing save delegates once to the existing owner save handler. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && typeof root.document !== 'undefined') root.BlackFlagBusinessDeck = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const BUILD = '8.8.20.63';
  const text = v => typeof v === 'string' || typeof v === 'number' ? String(v) : '';
  const escape = v => text(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const first = (...v) => v.find(x => text(x).trim() !== '') ?? '';
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o || {}, k);
  function amount(v) {
    if (v === null || v === undefined || typeof v === 'boolean' || !text(v).trim()) return null;
    const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : null;
  }
  const money = v => amount(v) === null ? 'Not recorded' : '$' + amount(v).toFixed(2);
  function date(v) {
    if (!v || !Number.isFinite(Date.parse(v))) return 'Date not recorded';
    return new Date(v).toLocaleString(undefined, {year:'numeric', month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});
  }
  function scope(rows, projectId) {
    if (!text(projectId)) return [];
    return (Array.isArray(rows) ? rows : []).filter(o => o && o.projectId === projectId &&
      (!o.namespace || o.namespace === 'bf.project.' + projectId) &&
      (!o.isolation?.projectId || o.isolation.projectId === projectId));
  }
  const groups = {
    new: ['new','new loss','requested','request received'],
    inprogress: ['in production','in progress','working','processing'],
    ready: ['ready','ready for pickup','ready for pick up'],
    closed: ['picked up','completed','complete','closed','archived','cancelled','canceled']
  };
  function group(o) {
    const s = text(o?.status).trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
    return Object.keys(groups).find(k => groups[k].includes(s)) || 'other';
  }
  function payment(o) { return text(first(o?.paymentStatus, o?.payment?.status)) || 'Not recorded on this order'; }
  function facts(rows, pid) {
    const f = {all:0,active:0,new:0,inprogress:0,ready:0,closed:0,other:0,unpriced:0,paymentUnknown:0,testing:0,quarantined:0};
    f.quarantined=(Array.isArray(rows)?rows:[]).filter(o=>o?.projectId===pid&&!scope([o],pid).length).length;
    for (const o of scope(rows,pid)) {
      const g=group(o);f.all++;f[g]++;if(g!=='closed')f.active++;
      if(amount(o.price)===null)f.unpriced++;
      if(payment(o)==='Not recorded on this order')f.paymentUnknown++;
      if(o.testMode===true)f.testing++;
    }
    return f;
  }
  function select(rows,pid,opt={}) {
    const tab=opt.tab || 'active', q=text(opt.query).trim().toLocaleLowerCase();
    let a=scope(rows,pid).filter(o => (tab==='all'||(tab==='active'?group(o)!=='closed':group(o)===tab)) &&
      (!q || [o.id,o.customerName,o.customerEmail,o.customerPhone,o.wording,o.productName,o.offerName,o.status].map(text).join(' ').toLocaleLowerCase().includes(q)));
    const stamp=o=>{const n=Date.parse(o.createdAt);return Number.isFinite(n)?n:null;};
    a=a.map((o,i)=>({o,i})).sort((x,y)=>{
      const a=stamp(x.o),b=stamp(y.o);if(a===null&&b===null)return x.i-y.i;if(a===null)return 1;if(b===null)return -1;
      return (opt.sort==='newest'?b-a:a-b) || x.i-y.i;
    }).map(x=>x.o);
    const size=Math.max(1,Math.min(50,Math.floor(Number(opt.pageSize)||8))), pages=Math.max(1,Math.ceil(a.length/size));
    const page=Math.max(1,Math.min(pages,Math.floor(Number(opt.page)||1)));
    return {rows:a.slice((page-1)*size,page*size),total:a.length,page,pages,pageSize:size};
  }
  function image(v) {
    const s=text(v);return /^data:image\/(?:png|jpeg|webp|gif);base64,[a-z0-9+/=\r\n]+$/i.test(s)?s:'';
  }
  function coverage(chars,wording) {
    const w=text(wording),available=new Set(Array.from(text(chars))),missing=[];
    for(const c of Array.from(w))if(!/\s/u.test(c)&&!available.has(c)&&!missing.includes(c))missing.push(c);
    return {wording:w,missing,evidenceOnly:true,productionCertified:false};
  }
  function priceGuide(rate,length,unit) {
    const r=amount(rate),l=amount(length);
    if(r===null||l===null||l<=0||!['in','ft'].includes(unit))return {ok:false,isQuote:false};
    const feet=unit==='in'?l/12:l,subtotal=Math.round((r*feet+Number.EPSILON)*100)/100;
    if(!Number.isFinite(subtotal))return {ok:false,isQuote:false};
    return {ok:true,feet,rate:r,subtotal,isQuote:false};
  }
  function orderView(o,pid) {
    if(!scope([o],pid).length)return null;
    const p=o.pricingProof||{},r=o.plankRecognition||{},lock=o.approvedDesignLock||{};
    return {
      id:text(o.id)||'Identifier not recorded',wording:text(o.wording),customer:text(o.customerName)||'Customer not recorded',
      status:text(o.status)||'Status not recorded',received:date(o.createdAt),price:amount(o.price),payment:payment(o),
      species:text(first(p.speciesName,r.speciesName,o.woodSpecies))||'Not recorded',
      lengthFeet:amount(first(p.lengthFeet,r.lengthFeet))>0?amount(first(p.lengthFeet,r.lengthFeet)):null,
      rate:amount(p.ratePerFoot),font:text(first(o.font,o.fontStyle,lock.font))||'Not recorded',
      orientation:text(first(o.orientation,lock.orientation))||'Not recorded',fill:text(first(o.fill,lock.fill))||'Not recorded',
      notes:text(first(o.productionNotes,o.notes)),phone:text(o.customerPhone),email:text(o.customerEmail),contact:text(o.contactPreference),
      photo:image(o.photoData),preview:image(o.approvedPreviewData),needsLengthReview:p.ownerVisualVerificationRequired===true||r.lengthReviewRequired===true,
      approvalMismatch:own(lock,'wording')&&text(lock.wording)!==text(o.wording),
      priceMismatch:amount(lock.price)!==null&&amount(o.price)!==null&&amount(lock.price)!==amount(o.price),
      approvalRecorded:o.approved===true,approvalTime:date(o.headwayJob?.approval?.approvedAt||lock.approvedAt),generatedTime:date(o.headwayJob?.approval?.generatedAt||lock.generatedAt),nominalOnly:o.pricingProof?.nominalOnly===true||!!o.headwayJob?.nominalSize,jobContract:o.headwayJob?.schema||'',productionVerified:false,testMode:o.testMode===true,
      propertyAddress:text(o.propertyAddress),window:text(first(o.requestedWindow,o.preferredWindow,o.schedulePreference)),
      service:text(first(o.productName,o.offerName,o.engagementLabel))
    };
  }
  function logo(project) {
    const intake=image(project.businessIntake?.visualAssets?.logo);
    if(intake)return '<img src="'+intake+'" alt="'+escape(project.name)+'" class="bd-business-logo">';
    if(project.id==='ikes-wood-signs')return '<img src="ike_character.png" alt="Ike’s Wood Signs" class="bd-business-logo">';
    const src=image(first(project.branding?.logoDataUrl,project.branding?.logoData,project.logoData));
    if(src)return '<img src="'+src+'" alt="'+escape(project.name)+'" class="bd-business-logo">';
    if(project.id==='bor-north-richmond')return '<img src="signal_restoration_logo.png" alt="Signal Restoration" class="bd-business-logo">';
    return '<span class="bd-monogram" aria-hidden="true">'+escape(text(project.projectCode||project.name||'BF').slice(0,3).toUpperCase())+'</span>';
  }
  const mark=(o)=>'<span class="bd-badge bd-'+group(o)+'">'+escape(o.status||'Status not recorded')+'</span>';
  const origin=()=>'<p class="bd-origin">Order source: this browser’s saved business records. A secure owner session is not a cloud-backup claim.</p>';
  function buttons(el,selector,fn){el.querySelectorAll(selector).forEach(b=>b.addEventListener('click',()=>fn(b)));}
  function mountHome({container,project,orders,modules,onOpen,onOrders,readError=''}) {
    const f=facts(orders,project.id),isIke=project.id==='ikes-wood-signs',canOrders=modules.some(m=>m[0]==='orders');
    const itemNames=isIke?{title:'Your workshop. A clearer day.',noun:'signs',active:'Open active orders',progress:'In production',ready:'Ready for pickup'}:{title:'Your business. A clearer day.',noun:'orders',active:'Open active work',progress:'In progress',ready:'Ready'};
    const queue=select(orders,project.id,{tab:'active',pageSize:3}).rows;
    const main=['pricing','references','features','branding'].map(k=>modules.find(m=>m[0]===k)).filter(Boolean);
    const support=modules.filter(m=>!['orders','pricing','references','branding','features'].includes(m[0]));
    container.innerHTML=`<section class="bd-home" data-bd-home><div class="bd-hero"><div class="bd-hero-copy"><span class="bd-kicker">TODAY’S WORK</span><h2>${itemNames.title}</h2><p>${isIke?'Know what to make next. Keep the approved wording, wood and price together.':'Find the work that needs attention, then open the tools for this business.'}</p>${canOrders?'<button type="button" class="btn primary" data-home-tab="active">'+itemNames.active+' <span aria-hidden="true">→</span></button>':''}</div><div class="bd-hero-summary"><span class="bd-kicker">${canOrders?'ACTIVE WORK':'BUSINESS TOOLS'}</span><strong class="bd-hero-count">${readError?'—':canOrders?f.active:'→'}</strong><span>${readError?'Order records need attention':canOrders?f.all+' total saved records':'Configured for this business'}</span><small>Exact business workspace</small></div></div>
    ${readError?'<div class="bd-notice warn" role="alert">Order records could not be read in this tab. Nothing has been deleted or reset. Reload the page before relying on a count.</div>':canOrders?`<div class="bd-kpis">${[['new','New orders'],['inprogress',itemNames.progress],['ready',itemNames.ready],['closed','Completed / closed']].map(([k,label])=>`<button type="button" data-home-tab="${k}" class="bd-kpi"><span>${label}</span><strong>${f[k]}</strong><small>View ${k==='closed'?'history':'records'} →</small></button>`).join('')}</div>`:''}
    ${f.quarantined?'<p class="bd-notice warn">'+f.quarantined+' locally labeled record(s) have conflicting identity metadata. They are withheld from these views, not deleted. Review their identity before use.</p>':''}<div class="bd-home-columns"><section class="bd-home-work"><div class="bd-section-heading"><div><span class="bd-kicker">WORK QUEUE</span><h3>Start with the next order</h3></div>${canOrders?'<button type="button" class="bd-link-button" data-home-tab="all">View all →</button>':''}</div>${!canOrders?'<p class="bd-muted">Order access is not offered by this account’s existing module configuration.</p>':readError?'<p class="bd-muted">Awaiting a successful local read.</p>':queue.length?queue.map(o=>`<div class="bd-mini-order"><div><strong>${escape(first(o.wording,o.productName,o.id,'Untitled order'))}</strong><small>${escape(o.id||'ID not recorded')} · ${escape(o.customerName||'Customer not recorded')}</small></div>${mark(o)}</div>`).join(''):'<div class="bd-empty"><strong>No active records in this snapshot</strong><p>Completed work stays available in history. No records have been moved.</p></div>'}${canOrders?'<p class="bd-muted bd-small">Oldest received first; undated records stay visible. '+(f.other?f.other+' record(s) have other or unrecorded statuses.':'')+'</p>':''}</section><section class="bd-home-tools"><span class="bd-kicker">BUSINESS TOOLS</span><h3>Make the business yours</h3><div class="bd-tool-grid">${main.map(([k,t,d])=>`<button type="button" class="bd-tool" data-deck-module="${k}"><span class="bd-tool-icon" aria-hidden="true">${({pricing:'$',references:'Aa',branding:'◈',features:'⚙'})[k]}</span><span><strong>${escape(t)}</strong><small>${escape(d)}</small></span><b aria-hidden="true">→</b></button>`).join('')}</div></section></div>
    ${!readError&&canOrders?`<div class="bd-insight"><strong>Record clarity</strong><span>${f.unpriced} without a recorded price · ${f.paymentUnknown} without payment status on the order. These are missing fields, not unpaid balances.</span>${f.testing?'<span>'+f.testing+' explicitly marked test record(s). No records reclassified.</span>':''}</div>`:''}
    <details class="bd-support"><summary>Reports, services & account settings <span>Existing tools, kept within reach</span></summary><div class="bd-support-grid">${support.map(([k,t,d])=>`<button type="button" class="bd-tool" data-deck-module="${k}"><span><strong>${escape(t)}</strong><small>${escape(d)}</small></span><b aria-hidden="true">→</b></button>`).join('')}</div></details>${origin()}</section>`;
    buttons(container,'[data-deck-module]',b=>onOpen(b.dataset.deckModule));
    buttons(container,'[data-home-tab]',b=>onOrders(b.dataset.homeTab));
  }
  function mountOrders({container,project,orders,state,onDetail,readError=''}) {
    const all=scope(orders,project.id),f=facts(orders,project.id),isIke=project.id==='ikes-wood-signs';
    if(readError){container.innerHTML='<div class="bd-notice warn">Order storage could not be read. This is not an empty-order result. Reload the page before continuing.</div>';return;}
    const tabs=[['active','Active work'],['new','New'],['inprogress',isIke?'In production':'In progress'],['ready',isIke?'Ready for pickup':'Ready'],['closed','Completed / closed'],['other','Other status'],['all','All records']];
    container.innerHTML=`${f.quarantined?'<p class="bd-notice warn">'+f.quarantined+' locally labeled record(s) are withheld because identity metadata conflicts. No records were deleted.</p>':''}<div class="bd-order-controls"><label class="bd-search-label">Find an order<input type="search" data-bf-trim="boundary" id="bdOrderSearch" placeholder="Order number, customer, wording or contact" value="${escape(state.query||'')}"></label><label>Received order<select id="bdOrderSort"><option value="oldest" ${state.sort!=='newest'?'selected':''}>Oldest first</option><option value="newest" ${state.sort==='newest'?'selected':''}>Newest first</option></select></label></div><nav class="bd-tabs" aria-label="Order status filters">${tabs.map(([k,t])=>`<button type="button" data-order-tab="${k}" aria-pressed="${(state.tab||'active')===k}">${t} <b>${f[k]}</b></button>`).join('')}</nav><div id="bdOrderResult" role="status" aria-live="polite" class="bd-result-count"></div><div id="bdOrderRows" class="bd-order-rows"></div><div class="bd-pagination"><button type="button" id="bdPrev" class="btn ghost">← Previous</button><span id="bdPage"></span><button type="button" id="bdNext" class="btn ghost">Next →</button></div>${origin()}`;
    function refresh() {
      const res=select(all,project.id,state);state.page=res.page;
      container.querySelector('#bdOrderResult').textContent=res.total+' matching record'+(res.total===1?'':'s')+' · '+f.all+' saved for this business';
      container.querySelector('#bdOrderRows').innerHTML=res.rows.length?res.rows.map(o=>`<article class="bd-order-card"><div class="bd-order-top"><span class="bd-order-id">${escape(o.id||'Identifier not recorded')}</span>${mark(o)}</div><div class="bd-order-main"><div><h3>${escape(first(o.wording,o.productName,o.offerName,'Untitled order'))}</h3><p>${escape(o.customerName||'Customer not recorded')}</p><small>Received ${escape(date(o.createdAt))}</small></div><div class="bd-order-price"><small>Recorded price</small><strong>${money(o.price)}</strong><button type="button" class="btn ghost" data-open-order="${all.indexOf(o)}">View order →</button></div></div>${o.pricingProof?.ownerVisualVerificationRequired?'<p class="bd-notice warn compact">Length needs visual review before production.</p>':''}${o.testMode===true?'<small class="bd-test-label">Saved as a test order</small>':''}</article>`).join(''):'<div class="bd-empty"><strong>No matching orders</strong><p>Change the search or status filter. No records have been deleted.</p></div>';
      buttons(container,'[data-open-order]',b=>{state.scrollY=window.scrollY;onDetail(all[Number(b.dataset.openOrder)]);});
      container.querySelector('#bdPage').textContent='Page '+res.page+' of '+res.pages;
      container.querySelector('#bdPrev').disabled=res.page<=1;container.querySelector('#bdNext').disabled=res.page>=res.pages;
      container.querySelectorAll('[data-order-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.orderTab===(state.tab||'active'))));
    }
    container.querySelector('#bdOrderSearch').addEventListener('input',e=>{state.query=e.target.value;state.page=1;refresh();});
    // A blur/change must not replace a row between pointerdown and click.
    container.querySelector('#bdOrderSearch').addEventListener('change',e=>{state.query=e.target.value;});
    container.querySelector('#bdOrderSort').onchange=e=>{state.sort=e.target.value;state.page=1;refresh();};
    buttons(container,'[data-order-tab]',b=>{state.tab=b.dataset.orderTab;state.page=1;refresh();});
    container.querySelector('#bdPrev').onclick=()=>{state.page--;refresh();};container.querySelector('#bdNext').onclick=()=>{state.page++;refresh();};refresh();
  }
  function mountOrderDetail({container,project,order,onBack}) {
    const v=orderView(order,project.id);if(!v){container.innerHTML='<div class="bd-notice warn">This record does not match the current business. No order details displayed.</div>';return;}
    const isIke=project.id==='ikes-wood-signs';
    const pair=(label,value)=>`<div class="bd-fact"><small>${escape(label)}</small><strong>${escape(value)}</strong></div>`;
    container.innerHTML=`<div class="bd-detail-top"><button type="button" id="bdBackOrders" class="btn ghost">← Back to orders</button><span class="bd-badge">RECORD REVIEW · NO EDITS</span></div><div class="bd-detail-heading"><div><span class="bd-kicker">ORDER ${escape(v.id)}</span><h3>${escape(v.customer)}</h3><p>Received ${escape(v.received)}</p></div>${mark(order)}</div>
    ${v.needsLengthReview||v.approvalMismatch||v.priceMismatch?`<div class="bd-notice warn" role="status"><strong>Review before production</strong>${v.needsLengthReview?'<p>The saved record requires a visual length check against the plank photo.</p>':''}${v.approvalMismatch?'<p>The saved approval wording differs from the order wording. Do not assume either is the approved production instruction.</p>':''}${v.priceMismatch?'<p>The order price differs from the saved approval price. This view does not choose or change either amount.</p>':''}</div>`:''}
    <div class="bd-detail-grid"><section class="bd-detail-section"><span class="bd-kicker">${isIke?'EXACT SIGN WORDING':'SAVED REQUEST / WORDING'}</span><pre class="bd-exact">${escape(v.wording||'No wording recorded')}</pre><div class="bd-facts">${isIke?pair('Lettering style',v.font)+pair('Orientation',v.orientation)+pair('Letter fill',v.fill):pair('Service / offer',v.service||'Not recorded')+pair('Service address',v.propertyAddress||'Not recorded')+pair('Requested window (not confirmed)',v.window||'Not recorded')}</div><p class="bd-muted bd-small">Original case and spacing are preserved. Viewing does not approve or change production instructions.</p></section><section class="bd-detail-section"><span class="bd-kicker">PRICE & CUSTOMER</span><div class="bd-facts">${pair('Recorded order price',money(v.price))}${pair('Payment status',v.payment)}${pair('Email',v.email||'Not recorded')}${pair('Phone',v.phone||'Not recorded')}${pair('Contact preference',v.contact||'Not recorded')}</div><p class="bd-muted bd-small">Recorded price is not proof of payment. No customer message is sent by this view.</p></section>
    ${isIke?`<section class="bd-detail-section"><span class="bd-kicker">SAVED WOOD & MEASUREMENT EVIDENCE</span><div class="bd-facts">${pair('Wood species',v.species)}${pair(v.nominalOnly?'Standard pricing size (not exact measurement)':'Saved length',v.lengthFeet===null?'Not recorded':v.lengthFeet+' linear feet')}${pair('Saved rate',v.rate===null?'Not recorded':money(v.rate)+' / linear foot')}</div><p class="bd-muted bd-small">Values are from the order’s existing evidence. They are not newly measured or confirmed by this screen.</p></section>`:''}
    <section class="bd-detail-section"><span class="bd-kicker">APPROVAL & NOTES</span><div class="bd-facts">${pair('Approval flag in record',v.approvalRecorded?'Recorded as approved':'Not recorded as approved')}${pair('Customer approval time',v.approvalTime)}${v.jobContract?pair('Preview generated at',v.generatedTime):''}</div><p class="bd-notes">${escape(v.notes||'No production notes recorded.')}</p><p class="bd-muted bd-small">A saved approval flag is not an independent production-geometry certification.</p></section></div>
    <div class="bd-media-grid">${[['Original saved photo',v.photo],['Saved customer preview',v.preview]].map(([label,src])=>`<section class="bd-detail-section"><span class="bd-kicker">${label}</span>${src?'<img class="bd-order-image" src="'+src+'" alt="'+label+'" loading="lazy">':'<div class="bd-empty">No supported saved image in this record.</div>'}<p class="bd-muted bd-small">${label.includes('preview')?'Preserved snapshot, not regenerated from today’s settings.':'Existing raster image only. No new photo captured.'}</p></section>`).join('')}</div>${origin()}`;
    container.querySelector('#bdBackOrders').onclick=onBack;
  }
  function mountPriceGuide({container,rates}) {
    const guide=document.createElement('section');guide.className='bd-price-guide';guide.id='bdPriceGuide';
    guide.innerHTML=`<div><span class="bd-kicker">OWNER CALCULATION CHECK</span><h3>See the rate in context</h3><p class="bd-muted">Check the arithmetic without changing an order.</p></div><div class="bd-calculator"><label>Wood species<select id="bdCalcSpecies">${rates.map(r=>`<option value="${escape(r.id)}">${escape(r.name)}</option>`).join('')}</select></label><label>Known length<input id="bdCalcLength" type="number" min="0.01" step="0.01" inputmode="decimal" placeholder="Enter a length"></label><label>Units<select id="bdCalcUnit"><option value="ft">Linear feet</option><option value="in">Inches</option></select></label></div><output id="bdCalcResult" class="bd-calc-result" aria-live="polite">Enter a known length to check rate × length.</output><p class="bd-muted bd-small">Arithmetic only—not a customer quote. Uses the current form values; excludes any minimum, rounding rule, tax or extras elsewhere in the business. No existing order is repriced.</p>`;
    const rateContainer=container.querySelector('.rates');if(rateContainer)rateContainer.before(guide);else container.append(guide);
    container.querySelectorAll('[data-rate]').forEach(el=>{
      const row=rates.find(r=>r.id===el.dataset.rate);el.setAttribute('aria-label',(row?.name||'Wood')+' dollars per linear foot');
      const label=document.createElement('span');label.className='bd-rate-unit';label.textContent='$ / linear foot';el.insertAdjacentElement('afterend',label);
    });
    function calc(){const id=guide.querySelector('#bdCalcSpecies').value,rate=Array.from(container.querySelectorAll('[data-rate]')).find(x=>x.dataset.rate===id),active=Array.from(container.querySelectorAll('[data-enabled]')).find(x=>x.dataset.enabled===id),out=guide.querySelector('#bdCalcResult');
      if(active&&!active.checked){out.textContent='This species is inactive in the current form. No customer quote calculated.';return;}
      const r=priceGuide(rate?.value,guide.querySelector('#bdCalcLength').value,guide.querySelector('#bdCalcUnit').value);
      out.textContent=r.ok?money(r.rate)+' × '+Number(r.feet.toFixed(4))+' ft = '+money(r.subtotal)+' base arithmetic':'Enter a valid rate and a positive length.';
    }
    const saveState=container.querySelector('#savePricingState'),saveButton=container.querySelector('#savePricing');
    const signature=()=>JSON.stringify(Array.from(container.querySelectorAll('[data-rate],[data-enabled]')).map(el=>[el.dataset.rate||el.dataset.enabled,el.type==='checkbox'?el.checked:el.value]));
    let savedSignature=signature(),saving=false;
    const editFields=Array.from(container.querySelectorAll('[data-rate],[data-enabled]'));
    const priorDisabled=editFields.map(el=>el.disabled);
    const freeze=locked=>editFields.forEach((el,i)=>{el.disabled=locked||priorDisabled[i];});
    function dirty(){const changed=signature()!==savedSignature;if(saveButton)saveButton.disabled=!changed||saving;if(saveState){saveState.classList.toggle('bd-save-dirty',changed);saveState.textContent=changed?'Unsaved pricing edits in this form. The calculation does not save them.':'No unsaved pricing changes.';}}
    guide.addEventListener('input',calc);guide.addEventListener('change',calc);
    rateContainer?.addEventListener('input',()=>{calc();dirty();});rateContainer?.addEventListener('change',()=>{calc();dirty();});
    if(saveButton&&typeof saveButton.onclick==='function'){
      const originalSave=saveButton.onclick;
      saveButton.onclick=async function(event){
        if(saving)return;
        const invalid=Array.from(container.querySelectorAll('[data-rate]')).find(el=>amount(el.value)===null);
        if(invalid){saveState.textContent='Enter a valid nonnegative dollar rate for each species before saving.';saveState.classList.add('bd-save-dirty');invalid.focus();return;}
        saving=true;saveButton.disabled=true;freeze(true);
        try{await originalSave.call(this,event);savedSignature=signature();saving=false;freeze(false);dirty();saveState.textContent='Species pricing saved in this browser. Existing order prices were not changed.';}
        catch(_){saveState.textContent='Pricing save is unconfirmed. Reopen Pricing to read the saved values before another save. No automatic retry was sent.';saveState.classList.add('bd-save-dirty');}
      };
      dirty();
    }

  }
  function mountLettering({container,packs,coverages}) {
    if(container.querySelector('#bdLettering'))return;
    const head=container.querySelector('.workspace-head'),advanced=document.createElement('details');advanced.id='bdAdvancedStyles';advanced.className='bd-advanced';
    advanced.innerHTML='<summary>Advanced production review <span>Evidence, character review, compilation & version history</span></summary><div class="bd-notice warn">Existing engineering workflow. Coverage is not a machining test. Keep publication deliberate; the controls below are not a shortcut to approve an entire alphabet.</div>';
    let next=head?.nextSibling;while(next){const after=next.nextSibling;advanced.appendChild(next);next=after;}
    const overview=document.createElement('section');overview.id='bdLettering';overview.className='bd-lettering';
    overview.innerHTML=`<div class="bd-notice"><strong>Keep the real style. Check the exact wording.</strong><p>These cards separate reference evidence from production approval. Customer case and intentional spacing must remain unchanged.</p></div><div class="bd-style-cards">${packs.map(p=>{const c=coverages[p.id]||{},src=image(p.anchorImage)||({'A':'ike_style_a_ramjet_reference.jpg','B':'ike_style_b_smoke_hole_reference.jpg'}[p.id]||'');return `<article class="bd-style-card"><div class="bd-style-image">${src?'<img src="'+src+'" alt="Style '+escape(p.id)+' reference" loading="lazy">':'<span>Draft · no saved reference image</span>'}</div><div class="bd-style-info"><span class="bd-kicker">STYLE ${escape(p.id)}</span><h3>${escape(p.name||p.label||'Unnamed style')}</h3><span class="bd-badge">${p.geometryCertificationBasis==='bundled-anchor'?'BUNDLED REFERENCE':escape(text(p.status||'draft').toUpperCase())}</span><p>${Array.from(c.chars||'').length} characters represented in loaded evidence · ${Number(c.approvedCount)||0} approved uploads</p><small>${c.lower?'Lowercase evidence: '+escape(c.lower):'Lowercase: no approved evidence listed here.'}</small><button type="button" class="btn ghost" data-review-style="${escape(p.id)}">Review this style →</button></div></article>`;}).join('')}</div><section class="bd-word-check"><span class="bd-kicker">EVIDENCE-ONLY WORDING CHECK</span><div class="bd-calculator"><label>Style<select id="bdCheckStyle">${packs.map(p=>'<option value="'+escape(p.id)+'">Style '+escape(p.id)+' · '+escape(p.name)+'</option>').join('')}</select></label><label class="bd-wording-field">Exact wording<textarea id="bdCheckWording" data-bf-trim="preserve" rows="2" placeholder="Type wording to compare with the loaded evidence"></textarea></label></div><output id="bdCoverageResult" aria-live="polite">No wording entered. Nothing is approved, compiled or published here.</output><p class="bd-muted bd-small">This check compares characters with reference wording. It does not inspect cutting paths or certify production geometry. A photo or green status alone is not proof of a complete alphabet.</p></section><div class="bd-lettering-actions"><button type="button" class="btn ghost" id="bdAddExample">Add a finished-sign example →</button><span>Opens the existing draft-evidence form. Uploading remains a separate action.</span></div>`;
    container.append(overview,advanced);
    // Rename presentation-only inherited badges. Never rewrite pack flags or geometry.
    advanced.querySelectorAll('.bench-score').forEach(el=>{const first=el.querySelector('span');if(first&&/% readiness/.test(first.textContent))first.textContent=first.textContent.replace('% readiness',' / 100 workflow score (not production approval)');el.querySelectorAll('span').forEach(s=>{s.textContent=s.textContent.replace('proven glyphs','evidence-covered characters');});});
    advanced.querySelectorAll('.glyph-bench h4').forEach(el=>{if(el.textContent==='Protected benchmark replay')el.textContent='Reference-character coverage check';});
    advanced.querySelectorAll('.benchmark-row small').forEach(el=>{if(el.textContent==='All required geometry available')el.textContent='Required characters listed; cutting paths not tested here.';});
    advanced.querySelectorAll('.forge-badge.anchor').forEach(el=>{el.textContent=el.textContent.replace('ANCHOR GEOMETRY CERTIFIED','BUNDLED ANCHOR STATUS');});
    const result=overview.querySelector('#bdCoverageResult');function check(){const id=overview.querySelector('#bdCheckStyle').value,w=overview.querySelector('#bdCheckWording').value,r=coverage(coverages[id]?.chars||'',w);result.classList.toggle('bd-coverage-missing',r.missing.length>0);result.textContent=!w.trim()?'No wording entered. Nothing is approved, compiled or published here.':r.missing.length?'No loaded approved evidence for: '+r.missing.join(' ')+' — keep production on review.':'All entered characters appear in the loaded evidence. Production geometry still requires independent verification.';}
    overview.querySelector('#bdCheckWording').addEventListener('input',check);overview.querySelector('#bdCheckStyle').onchange=check;
    buttons(overview,'[data-review-style]',b=>{advanced.open=true;const target=document.getElementById('style-pack-'+b.dataset.reviewStyle);target?.scrollIntoView({behavior:'smooth',block:'start'});});
    overview.querySelector('#bdAddExample').onclick=()=>{advanced.open=true;const target=advanced.querySelector('#sfStyle');target?.scrollIntoView({behavior:'smooth',block:'center'});target?.focus({preventScroll:true});};
  }
  return {BUILD,escape,amount,money,date,scope,group,payment,facts,select,image,coverage,priceGuide,orderView,logo,mountHome,mountOrders,mountOrderDetail,mountPriceGuide,mountLettering};
});

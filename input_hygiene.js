/* Black Flag 8.8.20.55 Quartermaster — field-aware boundary whitespace.
   No network, storage, authority, submission, timer retry, or record migration.
   Unknown fields are preserved. Mark new ordinary fields data-bf-trim="boundary";
   mark production wording, raw imports, credentials and code "preserve". */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) { root.BlackFlagInput = api; if (root.document) api.install(root.document); }
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  const installed = new WeakSet(), composing = new WeakSet(), pasted = new WeakSet(), dirty = new Set();
  const boundary = value => String(value == null ? '' : value).trim();
  const length = value => Array.from(String(value == null ? '' : value)).length;
  function eligible(field) {
    if (!field || !/^(INPUT|TEXTAREA)$/.test(field.tagName || '') || field.disabled || field.readOnly) return false;
    const type = String(field.type || '').toLowerCase();
    if (['password','hidden','file','checkbox','radio','range','color','number','date','time','datetime-local','month','week'].includes(type)) return false;
    if (field.closest('[data-bf-trim="preserve"]')) return false;
    const identity = [field.id,field.name,field.autocomplete].join(' ');
    if (/password|secret|token|signature|one-time-code/i.test(identity)) return false;
    return field.dataset.bfTrim === 'boundary' || ['email','tel','url','search'].includes(type) || /^(name|given-name|family-name|email|tel|username|street-address|address-line[123]|postal-code|organization)$/.test(field.autocomplete || '');
  }
  function notify(field) {
    // Only reflect a user edit in existing input listeners; never dispatch submit/change/click.
    field.dispatchEvent(new Event('input', {bubbles:true}));
    field.dispatchEvent(new CustomEvent('bf:input-normalized', {bubbles:true}));
  }
  function clean(field, emit=false) {
    if (!eligible(field) || composing.has(field)) return String(field?.value || '');
    const old=field.value, next=boundary(old);
    if (next===old) return next;
    let start=null,end=null,direction='none';
    try { start=field.selectionStart;end=field.selectionEnd;direction=field.selectionDirection; } catch (_) {}
    const removed=old.length-old.trimStart().length;
    field.value=next;
    if (start!==null && end!==null) try { field.setSelectionRange(Math.max(0,Math.min(next.length,start-removed)),Math.max(0,Math.min(next.length,end-removed)),direction); } catch (_) {}
    if(emit) notify(field);
    return field.value;
  }
  function read(field) { return clean(field,false); }
  function cleanDirty(doc,form=null) {
    for(const field of Array.from(dirty)) {
      if(!field.isConnected){dirty.delete(field);continue;}
      if(form && field.form!==form && !form.contains(field)) continue;
      clean(field,true);dirty.delete(field);
    }
  }
  function install(doc) {
    if(installed.has(doc))return; installed.add(doc);
    doc.addEventListener('compositionstart',e=>composing.add(e.target),true);
    doc.addEventListener('compositionend',e=>{composing.delete(e.target);if(pasted.has(e.target)){pasted.delete(e.target);clean(e.target,true);}},true);
    doc.addEventListener('paste',e=>{
      const f=e.target;if(!eligible(f))return;dirty.add(f);pasted.add(f);
      if(composing.has(f))return;
      // A whole-field replacement can be trimmed before maxlength discards real text.
      // Other pastes keep native insertion and undo behavior, then normalize on input.
      const text=e.clipboardData?.getData('text/plain');
      let whole=f.value==='';try{whole=whole||(f.selectionStart===0&&f.selectionEnd===f.value.length);}catch(_){}
      if(typeof text==='string' && whole && boundary(text)!==text){
        const next=boundary(text);e.preventDefault();
        // Do not silently truncate an overlong business entry; validation must explain it.
        f.value=next;try{f.setSelectionRange(next.length,next.length);}catch(_){}
        pasted.delete(f);notify(f);
      }
    },true);
    doc.addEventListener('input',e=>{
      const f=e.target;if(!eligible(f))return;dirty.add(f);
      if(e.isComposing||composing.has(f))return;
      if(pasted.has(f)||e.inputType==='insertFromPaste'||e.inputType==='insertReplacementText'){
        pasted.delete(f);clean(f,false);
      }
    },true);
    doc.addEventListener('change',e=>{if(eligible(e.target)){clean(e.target,false);dirty.delete(e.target);}},true);
    doc.addEventListener('blur',e=>{if(dirty.has(e.target)){clean(e.target,true);dirty.delete(e.target);}},true);
    // Capture before HTML validation and existing application handlers read the values.
    doc.addEventListener('click',e=>{const b=e.target?.closest?.('button,input[type="submit"]');if(b)cleanDirty(doc,b.form||null);},true);
    doc.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing&&e.target?.form)cleanDirty(doc,e.target.form);},true);
    doc.addEventListener('submit',e=>cleanDirty(doc,e.target),true);
  }
  function reportPayload(project,work,issues,summary) {
    const p={p_project_id:boundary(project),p_current_work:boundary(work),p_unresolved_issues:Number(issues),p_issue_summary:boundary(summary)};
    if(!p.p_project_id || !Number.isInteger(p.p_unresolved_issues)||p.p_unresolved_issues<0||p.p_unresolved_issues>100000 || length(p.p_current_work)<3||length(p.p_current_work)>160||length(p.p_issue_summary)>500)
      throw new Error('Enter 3–160 characters of current work, a whole issue count, and at most 500 characters of issue summary.');
    return p;
  }
  function reportMatches(row,p,expectedId=null) {
    // Compare canonical submitted bytes. Never normalize a materially different reply.
    // SQL maps an empty issue summary to NULL; only that one equivalence is allowed.
    return !!row && row.project_id===p.p_project_id && row.current_work===p.p_current_work &&
      typeof row.unresolved_issues==='number' && Number.isInteger(row.unresolved_issues) && row.unresolved_issues===p.p_unresolved_issues &&
      Object.prototype.hasOwnProperty.call(row,'issue_summary') && (row.issue_summary===''||row.issue_summary===null?'':row.issue_summary)===p.p_issue_summary &&
      typeof row.report_id==='string' && row.report_id.length>0 && (!expectedId||row.report_id===expectedId) &&
      typeof row.reported_at==='string' && Number.isFinite(Date.parse(row.reported_at));
  }
  return Object.freeze({build:'8.8.20.55',boundary,length,eligible,clean,read,install,reportPayload,reportMatches,isComposing:f=>composing.has(f)});
});

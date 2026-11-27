/* Read-only vessel billing. The host supplies its existing authenticated RPC and session guard. */
(() => {
  'use strict';
  const stateLabels = {
    active:'Active', paid:'Paid', needs_attention:'Needs attention', canceled:'Canceled',
    awaiting_receipt:'Awaiting receipt', trialing:'Trial',
    'invoice.paid':'Paid', 'invoice.payment_failed':'Payment failed',
    'invoice.payment_action_required':'Action required', 'invoice.finalized':'Open',
    'invoice.voided':'Void', 'invoice.marked_uncollectible':'Uncollectible',
    'customer.subscription.created':'Subscription created', 'customer.subscription.updated':'Subscription updated',
    'customer.subscription.deleted':'Canceled'
  };
  function el(tag, text, cls) {
    const element = document.createElement(tag);
    if (text != null) element.textContent = text;
    if (cls) element.className = cls;
    return element;
  }
  function money(minor, currency) {
    if (!Number.isSafeInteger(minor) || !/^[a-z]{3}$/.test(currency || '')) return 'Amount unavailable';
    try {
      const fmt = new Intl.NumberFormat('en-US', { style:'currency', currency:currency.toUpperCase() });
      return fmt.format(minor / 10 ** fmt.resolvedOptions().maximumFractionDigits);
    } catch { return 'Amount unavailable'; }
  }
  function date(value) {
    if (!value || !Number.isFinite(Date.parse(value))) return 'Awaiting confirmation';
    return new Intl.DateTimeFormat('en-US',{ month:'short',day:'numeric',year:'numeric',timeZone:'UTC' }).format(new Date(value));
  }
  function style() {
    if (document.getElementById('bf-vessel-billing-style')) return;
    const sheet=el('style'); sheet.id='bf-vessel-billing-style';
    sheet.textContent=`
      .vb-ledger{color:#182e35;background:#faf9f4;border:1px solid #b7c8c4;border-radius:12px;padding:clamp(14px,2.5vw,26px);margin:12px 0;text-align:left;box-sizing:border-box;max-width:100%;min-width:0;font:16px/1.48 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .vb-ledger *{box-sizing:border-box}.vb-ledger h3,.vb-ledger h4{color:#183b3d!important;text-transform:none!important;letter-spacing:normal!important;margin:0 0 8px!important}
      .vb-ledger h3{font:700 clamp(19px,3vw,25px)/1.2 Georgia,serif!important}.vb-ledger h4{font-size:17px;font-weight:700;line-height:1.3}
      .vb-ledger p{color:#435a5c!important;margin:4px 0 12px!important}.vb-ledger article,.vb-ledger section{display:block!important;position:static!important;border:0!important;background:transparent!important;padding:12px 0!important;min-height:0!important}
      .vb-ledger .vb-invoice{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 12px;border-top:1px solid #c9d4cd;padding:12px 0;align-items:center}
      .vb-ledger .vb-invoice small{grid-column:1/-1;font:13px/1.45 system-ui;color:#516768;overflow-wrap:anywhere}
      .vb-ledger .vb-invoice strong,.vb-ledger h3,.vb-ledger b{overflow-wrap:anywhere}
      .vb-ledger .vb-pill{font:650 13px/1.4 system-ui;padding:3px 9px;border-radius:12px;background:#e0e8e6;color:#23444b;justify-self:end}
      .vb-ledger .vb-good{color:#15533d;background:#d9efdd}.vb-ledger .vb-alert{color:#72390e;background:#ffead0}
      .vb-ledger a{color:#12595f!important;text-decoration:underline;display:inline-flex;align-items:center;min-height:44px;justify-self:start}
      .vb-ledger dl{display:flex;gap:12px 28px;flex-wrap:wrap;margin:12px 0}.vb-ledger dt{font-size:13px;color:#516768}.vb-ledger dd{font-weight:650;margin:2px 0}
      .vb-ledger button{min-height:44px;padding:8px 14px;border:1px solid #567a77;border-radius:8px;font:650 15px system-ui;color:#174447;background:#f2f7f4;cursor:pointer}
      .vb-ledger button:focus-visible,.vb-ledger a:focus-visible{outline:3px solid #836221;outline-offset:2px}
      @media(max-width:430px){.vb-ledger .vb-invoice{grid-template-columns:minmax(0,1fr)}.vb-ledger .vb-pill{justify-self:start}}
    `;
    document.head.append(sheet);
  }
  function badge(code) {
    const good = ['paid','active','invoice.paid'].includes(code);
    const alert = ['needs_attention','canceled','invoice.payment_failed','invoice.payment_action_required','invoice.marked_uncollectible','customer.subscription.deleted'].includes(code);
    return el('span',stateLabels[code] || 'Awaiting confirmation','vb-pill '+(good?'vb-good':alert?'vb-alert':''));
  }
  function row(invoice, admiral) {
    const div=el('div',null,'vb-invoice');
    const title=invoice.invoice_number || invoice.invoice_id || invoice.subscription_id;
    div.append(el('strong',title),badge(invoice.event_type));
    const facts=[];
    if (invoice.subscription_state) facts.push('Subscription status: '+invoice.subscription_state.replaceAll('_',' '));
    if (invoice.invoice_id) facts.push(money(invoice.event_type==='invoice.paid'?invoice.paid_minor:invoice.due_minor,invoice.currency));
    if (invoice.billing_reason==='subscription_cycle') facts.push('Renewal');
    if (invoice.billing_reason==='subscription_create') facts.push('First invoice');
    if (invoice.collection_method==='charge_automatically') facts.push('Automatic collection');
    if (invoice.recorded_at) facts.push('Receipt recorded '+date(invoice.recorded_at));
    div.append(el('small',facts.join(' · ')));
    if (admiral && /^in_[a-zA-Z0-9_]+$/.test(invoice.invoice_id||'')) {
      const link=el('a','Open Stripe test invoice'); link.target='_blank'; link.rel='noopener noreferrer';
      link.href='https://dashboard.stripe.com/test/invoices/'+encodeURIComponent(invoice.invoice_id);
      div.append(link);
    }
    return div;
  }
  function account(item, admiral) {
    const section=el('article');
    section.append(el('h3',admiral?item.vessel+' · '+item.service:item.service),badge(item.status));
    const dl=el('dl');
    const fields=[['Agreed monthly price',money(item.monthly_usd_minor,'usd')]];
    if (item.status!=='canceled') fields.push(['Next billing date',date(item.next_period_at)]);
    for (const [key,value] of fields) {
      const field=el('div'); field.append(el('dt',key),el('dd',value)); dl.append(field);
    }
    section.append(dl,el('h4','Invoice history'));
    if (!item.invoices.length) section.append(el('p','Awaiting the first invoice receipt.'));
    for (const invoice of item.invoices) section.append(row(invoice, admiral));
    return section;
  }
  function mount(host, {read, current, admiral=false, projectId=null}) {
    style();
    const ledger=el('div',null,'vb-ledger');
    const output=el('div'); output.setAttribute('aria-live','polite');
    const refresh=el('button','Refresh receipts'); refresh.type='button';
    ledger.append(output,refresh); host.replaceChildren(ledger);
    let generation=0;
    const active=()=>host.isConnected && ledger.parentElement===host && current();
    async function load() {
      if (!active()) return;
      const turn=++generation;
      refresh.disabled=true;
      output.replaceChildren(el('p','Reading sandbox receipts…'));
      try {
        const data=await read();
        if (!active() || turn!==generation) return;
        if (data?.mode!=='sandbox' || !Array.isArray(data.accounts) ||
            (admiral ? !Array.isArray(data.to_check) : data.project_id!==projectId || data.accounts.some(a=>a.project_id!==projectId))) throw Error();
        const content=document.createDocumentFragment();
        content.append(el('h3',admiral?'Fleet billing · Sandbox':'Billing · Sandbox'));
        if (!data.accounts.length) content.append(el('p',admiral?'No vessel has a linked sandbox subscription.':'This vessel has no linked sandbox subscription.'));
        for (const item of data.accounts) content.append(account(item,admiral));
        if (admiral) {
          const queue=el('section'); queue.append(el('h3','To Check ('+data.to_check.length+')'));
          queue.append(el('p',data.to_check.length?'These receipts need a verified vessel and service assignment.':'Every available receipt has a vessel assignment.'));
          for (const entry of data.to_check) queue.append(row(entry,true));
          content.append(queue);
        }
        output.replaceChildren(content);
      } catch {
        if (active() && turn===generation)
          output.replaceChildren(el('p','Sandbox receipts are unavailable. Check your Fleet Core connection and billing setup, then refresh.'));
      } finally { if (turn===generation) refresh.disabled=false; }
    }
    refresh.onclick=load; load();
    return ()=>{ generation++; if (ledger.parentElement===host) host.replaceChildren(); };
  }
  window.BlackFlagVesselBilling=Object.freeze({mount});
})();

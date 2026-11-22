'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(process.argv[2] || __dirname);
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const page = read('fleet-payments.html');
const program = page.match(/<script>([\s\S]*?)<\/script>/)[1];

async function gateway(config, fragment = '') {
  const elements = new Map();
  for (const m of page.matchAll(/<[^<>]+\bid="([^"]+)"[^<>]*>/g)) {
    elements.set(m[1], {value: m[0].match(/\bvalue="([^"]*)"/)?.[1], hidden: /\bhidden\b/.test(m[0])});
  }
  const historyCalls = [];
  const requests = [];
  const document = {getElementById: id => { assert.ok(elements.has(id), id); return elements.get(id); }};
  const context = {
    document, URL, URLSearchParams, Intl,
    location: {hash: fragment, pathname: '/fleet/fleet-payments.html'},
    history: {replaceState: (...args) => historyCalls.push(args)},
    fetch: async (name, options) => {
      requests.push({name, options});
      return {ok: Boolean(config), json: async () => config};
    }
  };
  await vm.runInNewContext(program, context);
  assert.deepEqual(historyCalls, [[null, '', '/fleet/fleet-payments.html']]);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].name, './fleet-payments-service.json');
  assert.equal(requests[0].options.credentials, 'omit');
  return Object.fromEntries(elements);
}

async function main() {
  const config = {serviceOrigin: 'https://payments.example.org'};
  const values = await gateway(config, '#ship=demo-ship');
  assert.equal(new URL(values.desk.href).pathname, '/manage');
  assert.equal(new URLSearchParams(new URL(values.desk.href).hash.slice(1)).get('ship'), 'demo-ship');
  assert.equal(values.desk.hidden, false);
  assert.equal(values.gross.textContent, '$106.00');
  assert.equal(values.taxDue.textContent, '$6.00');
  assert.equal(values.share.textContent, '-$5.00');
  assert.equal(values.cost.textContent, '-$3.00');
  assert.equal(values.net.textContent, '$98.00');
  assert.equal(values.income.textContent, '$5.00');
  values.rate.value = '0';
  values.example.oninput();
  assert.equal(values.income.textContent, '$0.00');
  values.rate.value = '101.00';
  values.example.oninput();
  assert.ok(values.figures.hidden && values.exampleStatus.textContent);
  const invoice = JSON.stringify({shipId:'boat',reference:'INV-1',subtotalCents:1000,taxCents:50,sourceEnvironment:'staging'});
  const handoff = await gateway(config, '#' + new URLSearchParams({invoice}).toString());
  const target = new URL(handoff.desk.href);
  assert.equal(target.origin, config.serviceOrigin);
  assert.equal(target.search, '');
  assert.equal(new URLSearchParams(target.hash.slice(1)).get('invoice'), invoice);
  assert.equal(handoff.draft.hidden, false);
  // Exercise the actual button's handoff with an amount distinct from the standalone example.
  const ui = read('quartermaster.js');
  const start = ui.indexOf("if(b.id==='qmPaymentDesk'){");
  const end = ui.indexOf('if(!allowed()||busy)return;', start);
  assert.ok(start >= 0 && end > start);
  const openPayment = new Function('b','allowed','busy','dirty','saveError','state','doc','selected','g','actor','location','captain', ui.slice(start, end));
  const saved = {id:'test-doc', status:'finalized', type:'invoice', number:'VKT-00001',
    isSample:false, taxConfirmed:true, business:{name:'VoyageKeeper Recovery Test'},
    lines:[{quantity:'1',unitPrice:'85.25'}], taxRate:'6'};
  let url;
  const globals = {BlackFlagQuartermaster:require('./quartermaster_core.js'), open:href => {url = new URL(href);}};
  const open = (captain=null) => openPayment({id:'qmPaymentDesk'}, () => true, false, false, false,
    {documents:[saved]}, saved, 'ship-vkt', globals, {environment:'staging'}, {href:'https://fleet.example.org/index.html'},captain);
  saved.status = 'draft';
  open();
  assert.equal(url, undefined);
  saved.status = 'finalized';
  open({projectId:'ship-vkt'});assert.equal(url,undefined);
  open();
  assert.equal(url.pathname, '/fleet-payments.html');
  const screen = await gateway(null, url.hash);
  assert.equal(screen.desk.hidden, true);
  assert.equal(screen.invoicePreview.hidden, false);
  assert.equal(screen.invoiceNumber.textContent, 'VKT-00001');
  assert.equal(screen.businessName.textContent, saved.business.name);
  assert.equal(screen.invoiceSubtotal.textContent, '$85.25');
  assert.equal(screen.invoiceTax.textContent, '$5.12');
  assert.equal(screen.invoiceTotal.textContent, '$90.37');
  assert.equal(screen.gross.textContent, '$90.37');
  assert.equal(screen.income.textContent, '$4.26');
  assert.equal(screen.net.textContent, '$83.11');
  assert.equal(screen.exampleAmounts.hidden, true);
  screen.rate.value = '10';
  screen.processor.value = '0';
  screen.example.oninput();
  assert.equal(screen.net.textContent, '$81.84');
  assert.equal(screen.invoiceTotal.textContent, '$90.37');
  const connected = await gateway(config, url.hash);
  const forwarded = new URL(connected.desk.href);
  assert.equal(forwarded.search, '');
  assert.equal(forwarded.hash.includes('businessName'), false);
  const legacyRef = 'VKT-INV-2026-L3838D660222542109F25E519A2AE20D3-000001';
  const legacyData = {...JSON.parse(invoice),reference:legacyRef,taxCents:0};
  const asHash = payload => '#' + new URLSearchParams({invoice:JSON.stringify(payload)});
  const legacy = await gateway(null, asHash(legacyData));
  assert.equal(legacy.invoiceNumber.textContent, legacyRef);
  assert.equal(legacy.businessName.hidden, true);
  assert.equal(legacy.invoiceTax.textContent, '$0.00');
  assert.equal(legacy.invoiceTotal.textContent, '$10.00');
  assert.equal(values.invoicePreview.hidden, true);
  for (const bad of ['#invoice=', '#invoice=%7B', asHash({...legacyData,taxCents:-1}), asHash({...legacyData,subtotalCents:'10000'})]) {
    const blocked = await gateway(config, bad);
    assert.ok(blocked.desk.hidden && blocked.invoicePreview.hidden && blocked.splitPanel.hidden);
    assert.match(blocked.draft.textContent, /Reopen the saved invoice/);
  }
  for (const invalid of [null, {serviceOrigin:'http://example.org'}, {serviceOrigin:'https://example.org/private'}]) {
    const failed = await gateway(invalid);
    assert.ok(failed.desk.hidden && !failed.desk.href && failed.configStatus.textContent);
  }
  for (const file of ['index.html', 'owner.html', 'quartermaster.js']) {
    assert.ok(read(file).includes('fleet-payments.html'), 'Missing link in ' + file);
  }
  assert.ok(!fs.existsSync(path.join(root,'fleet-payments-service.json')), 'Release cannot include a site-specific service origin');
  console.log('PASS Pages gateway, public configuration boundary, pretax split, operator and invoice handoffs.');
}
main().catch(error => {console.error(error); process.exitCode = 1;});

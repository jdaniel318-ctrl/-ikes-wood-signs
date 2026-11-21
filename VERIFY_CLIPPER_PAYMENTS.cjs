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

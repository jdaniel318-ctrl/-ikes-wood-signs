'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
const captain = read('captain.js');
const html = read('launch-billing.html');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const pages = 'https://fleet.example.test/repo/';
const service = 'https://payments.example.test';
const voyage = 'bf-p-fc2816b8254a4845';

function controls(markup) {
  const nodes = new Map();
  for (const match of markup.matchAll(/<[^<>]+\bid="([^"]+)"[^<>]*>/g)) {
    nodes.set(match[1], {
      hidden: /\bhidden\b/.test(match[0]), checked: /\bchecked\b/.test(match[0]),
      textContent: '', children: [],
      append(child) { this.children.push(child); },
      replaceChildren() { this.children = []; },
      removeAttribute(key) { delete this[key]; },
      focus() { this.focused = true; },
      scrollIntoView() {}
    });
  }
  for (const match of markup.matchAll(/<select\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g)) {
    const options = Array.from(match[2].matchAll(/<option\b[^>]*>/g), m => m[0]);
    const initial = options.find(option => /\bselected\b/.test(option)) || options[0];
    nodes.get(match[1]).value = initial.match(/value="([^"]*)"/)[1];
  }
  return id => {
    assert.ok(nodes.has(id), 'Missing control ' + id);
    return nodes.get(id);
  };
}

function section(start, end) {
  const first = captain.indexOf(start);
  const last = captain.indexOf(end, first);
  assert.ok(first >= 0 && last > first, 'Missing agreement section ' + start);
  return captain.slice(first, last);
}

// Execute the same saved-offer handler that follows the agreement editor's verified draft readback.
function savedLink(shipId = voyage, prospective = false) {
  const target = {project_id: shipId, display_name: 'VoyageKeeper Recovery Test', prospective};
  const record = {target, terms: {}};
  const ctx = vm.createContext({
    record, Blob, URL, btoa, allowed: () => ctx.authorized, authorized: true,
    esc: String, BlackFlagQuartermasterPDF: require('./quartermaster_pdf.js')
  });
  const run = code => vm.runInContext(code, ctx);
  run(section(' function cents(v)', ' function channels(d)') +
      section(' const suggestedLaunchFees', ' function displayFeeBalance'));
  const node = controls(run('feePanel()'));
  ctx.$ = node;
  run('showSavedOffer()');
  assert.ok(node('cgBillingReview').hidden && !node('cgBillingReview').href, 'Unsaved suggested fees cannot be billed');
  record.terms.launchFees = {setup:'675.00', deposit:'175.00', monthly:'0'};
  run('showSavedOffer()');
  assert.equal(node('cgBillingReview').hidden, false);
  const link = new URL(node('cgBillingReview').href, pages);
  const launch = {shipId, shipName:target.display_name, setupCents:67500, depositCents:17500, monthlyCents:0, prospective};
  assert.equal(link.origin, new URL(pages).origin);
  assert.equal(link.pathname, '/repo/launch-billing.html');
  assert.equal(link.search, '');
  assert.deepEqual(JSON.parse(new URLSearchParams(link.hash.slice(1)).get('launch')), launch);
  ctx.authorized = false;
  run('showSavedOffer()');
  assert.ok(node('cgBillingReview').hidden && !node('cgBillingReview').href, 'Session loss clears the review link');
  return {link, launch};
}

const ok = body => ({ok:true, json:async () => body});
async function openPage(link, respond) {
  const url = new URL(link, pages);
  const node = controls(html);
  const requests = [], navigation = [];
  const context = {
    URL, URLSearchParams, Intl,
    document:{getElementById:node, createElement:() => ({textContent:''})},
    location:{origin:url.origin, pathname:url.pathname, hash:url.hash, assign:dest => navigation.push(dest)},
    history:{replaceState() {}},
    fetch:async (route, options = {}) => {
      requests.push({route, options});
      return respond(route, options);
    }
  };
  await vm.runInNewContext(script, context, {filename:'launch-billing.html'});
  // A page may launch its initialization without returning its promise.
  await new Promise(resolve => setImmediate(resolve));
  return {node, requests, navigation};
}

function config(origin) {
  return route => {
    assert.equal(route, './fleet-payments-service.json');
    return origin ? ok({serviceOrigin:origin}) : {ok:false};
  };
}

async function rehearsal(link, paid) {
  const {node, requests, navigation} = await openPage(link, config(null));
  assert.equal(node('lab').hidden, false);
  assert.ok(node('checkout').hidden && node('receipt').hidden && node('desk').hidden);
  assert.deepEqual(['setup','deposit','balance','monthly'].map(id => node(id).textContent),
    ['$675.00','$175.00','$500.00','Included · $0.00']);
  assert.equal(node('scenario').value, 'saved');
  if (paid) node('scenario').value = 'paid';
  await node('begin').onclick();
  assert.equal(node('deskSection').hidden, true);
  assert.equal(node('events').children.length, 0);
  assert.match(node('pay').textContent, /\$175\.00/);
  await node('pay').onclick();
  assert.match(node('stageTitle').textContent, /Deposit received/i);
  assert.match(node('sum').textContent, /\$175\.00/);
  await node('pay').onclick(); // Admiral releases handoff.
  assert.equal(node('consentRow').hidden, false);
  assert.equal(node('consent').checked, false);
  assert.match(node('pay').textContent, paid ? /\$599\.00/ : /\$500\.00/);
  if (paid) assert.match(node('consentText').textContent, /\$99\.00 monthly/i);
  await node('pay').onclick();
  assert.match(node('message').textContent, /confirm/i);
  assert.equal(node('events').children.length, 1);
  node('consent').checked = true;
  await node('pay').onclick();
  if (paid) {
    assert.match(node('stageTitle').textContent, /monthly support is active/i);
    assert.match(node('sum').textContent, /\$774\.00/);
    await node('pay').onclick();
    assert.match(node('sum').textContent, /\$873\.00/);
    assert.match(node('events').children[2].textContent, /second month.*\$99\.00/i);
  } else {
    assert.match(node('stageTitle').textContent, /setup complete/i);
    assert.match(node('sum').textContent, /\$675\.00/);
    assert.equal(node('events').children.length, 2);
  }
  assert.equal(node('pay').hidden, true);
  await node('restart').onclick();
  assert.ok(node('receipt').hidden && node('checkout').hidden);
  assert.match(node('monthly').textContent, /\$0\.00/);
  assert.deepEqual(requests.map(r => r.route), ['./fleet-payments-service.json']);
  assert.deepEqual(navigation, []);
}

async function gateways(link, launch) {
  const gateway = await openPage(link, config(service));
  assert.equal(gateway.node('desk').hidden, false);
  const desk = new URL(gateway.node('desk').href);
  assert.equal(desk.origin, service);
  assert.equal(desk.pathname, '/manage');
  assert.equal(desk.search, '');
  assert.deepEqual(JSON.parse(new URLSearchParams(desk.hash.slice(1)).get('launch')), launch);
  assert.equal(gateway.requests[0].options.credentials, 'omit');
  assert.equal(gateway.requests[0].options.redirect, 'error');
  assert.equal(gateway.requests.length, 1);
  assert.deepEqual(gateway.navigation, []);
  const bare = await openPage('./launch-billing.html', config(service));
  assert.ok(bare.node('offer').hidden && bare.node('lab').hidden && bare.node('checkout').hidden);
  assert.equal(bare.node('desk').href, service + '/manage#launchDesk=1');
  for (const origin of [null,'http://payments.example.test','https://user@payments.example.test',
                        service+'/checkout',service+'/?key=example',service+'/#fragment']) {
    const result = await openPage(link, config(origin));
    assert.ok(result.node('desk').hidden && !result.node('desk').href);
    assert.match(result.node('serviceState').textContent, /not connected/i);
  }
  const offline = await openPage(link, () => { throw new TypeError('offline'); });
  assert.ok(offline.node('desk').hidden && !offline.node('desk').href && !offline.node('lab').hidden);
  const other = await openPage(savedLink('independent-vessel').link, config(service));
  assert.ok(other.node('lab').hidden);
  const planned = await openPage(savedLink('planned-vessel', true).link, config(service));
  assert.ok(planned.node('desk').hidden && planned.node('lab').hidden);
  assert.equal(planned.requests.length, 0);
  const invalid = ['%7B', JSON.stringify({...launch, depositCents:67501}),
                   JSON.stringify({...launch, monthlyCents:'9900'})];
  for (const payload of invalid) {
    const result = await openPage('./launch-billing.html#launch='+encodeURIComponent(payload), config(service));
    assert.ok(result.node('offer').hidden && result.node('desk').hidden && result.node('lab').hidden);
    assert.ok(result.node('gatewayNote').textContent);
    assert.equal(result.requests.length, 0);
  }
}

async function ownerRoutes(launch) {
  const token = 'T'.repeat(43);
  const apiRoute = '/v1/launch-pay/' + token;
  const malformed = await openPage(service+'/launch-pay#bad', () => assert.fail('Invalid link reached the API'));
  assert.equal(malformed.requests.length, 0);
  assert.ok(malformed.node('pay').hidden && malformed.node('lab').hidden);
  assert.match(malformed.node('message').textContent || malformed.node('gatewayNote').textContent, /billing link/i);
  const owner = {...launch, shipId:'registered-vessel', monthlyCents:9900,
    depositStatus:'paid', handoffStatus:'ready', supportStatus:'pending', mode:'test'};
  for (const [destination, accepted] of [
    ['https://checkout.stripe.com/c/pay/test-session',true], ['https://checkout.example.test/c/pay/session',false]
  ]) {
    const {node,requests,navigation} = await openPage(service+'/launch-pay#'+token, (route,options) => {
      if (route === apiRoute && !options.method) return ok(owner);
      assert.equal(route, apiRoute+'/checkout');
      assert.equal(options.method, 'POST');
      assert.equal(options.credentials, 'omit');
      assert.equal(options.redirect, 'error');
      assert.deepEqual(JSON.parse(options.body),{stage:'handoff',acceptedTerms:{setupCents:owner.setupCents,depositCents:owner.depositCents,monthlyCents:owner.monthlyCents}});
      return ok({url:destination});
    });
    assert.ok(node('lab').hidden && node('desk').hidden && !node('consentRow').hidden);
    await node('pay').onclick();
    assert.equal(requests.length, 1, 'Unchecked owner consent must not request Checkout');
    node('consent').checked = true;
    await node('pay').onclick();
    assert.equal(requests.length, 2);
    assert.deepEqual(navigation, accepted ? [destination] : []);
    if (!accepted) assert.match(node('message').textContent, /destination could not be verified/i);
  }
}

(async () => {
  const {link,launch} = savedLink();
  await gateways(link, launch);
  await rehearsal(link, false);
  await rehearsal(link, true);
  await ownerRoutes(launch);
  console.log('PASS saved offer import, desk routes, offline availability, isolated rehearsals, consent and owner Checkout routing.');
})().catch(error => {console.error(error); process.exitCode = 1;});

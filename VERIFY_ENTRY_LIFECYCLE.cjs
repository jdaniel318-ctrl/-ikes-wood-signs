#!/usr/bin/env node
'use strict';
// Execute the shipped router with deterministic network, clock, history and child-document fixtures.
const assert = require('node:assert/strict');
const {createHash, webcrypto} = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');

const root = path.resolve(process.argv[2] || __dirname);
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
const router = html.match(/<script id="lantern-launcher"[^>]*>([\s\S]*?)<\/script>/)[1];
const descriptor = html.match(/<dialog id="lantern-harbor"[^>]*data-cartridge="([^"]+)" data-sha256="([a-f0-9]{64})"/);
const [, cartridge, signature] = descriptor;
const bytes = fs.readFileSync(path.join(root,cartridge));
const lesson = JSON.parse(bytes);

function gate() {
  let resolve;
  const promise = new Promise(r => {resolve = r});
  return {promise, resolve};
}

function harness() {
  const timers = new Map(), requests = [], frames = [], els = new Map();
  const stack = [{normal:'Engine'}];
  let position = 0, nextTimer = 0, speechCancelled = 0;
  const state = {confirm:false, prompts:0};
  function element(id) {
    const handlers = new Map();
    const node = {
      id, hidden:false, unavailable:false, inWatch:false, ariaHidden:false, inert:false,
      addEventListener(type,run){handlers.set(type,run)},
      emit(type,event={}){return handlers.get(type)?.(event)},
      focus(){doc.activeElement = this},
      getClientRects(){return this.unavailable ? [] : [{}]},
      closest(selector) {
        return ({'[inert]':this.inert,'[aria-hidden="true"]':this.ariaHidden,
                 '#watchLearningPrograms':this.inWatch,'button[data-open-lantern]':this.isLauncher})[selector] ? this : null;
      }
    };
    if (id) els.set(id,node);
    return node;
  }
  const doc = element();
  doc.baseURI = 'https://fleet.invalid/test-scope/';
  doc.getElementById = id => els.get(id);
  const mounted = [];
  doc.createElement = tag => {
    assert.equal(tag,'iframe');
    const frame = element();
    frame.contentWindow = {speechSynthesis:{cancel(){speechCancelled++}}};
    frames.push(frame);
    return frame;
  };
  const win = element();
  win.confirm = () => {state.prompts++;return state.confirm};
  function move(step) {
    const index = position + step;
    if (index < 0 || index >= stack.length) return;
    position = index;
    win.emit('popstate');
  }
  const history = {
    get state(){return stack[position]},
    pushState(value){stack.splice(position+1,Infinity,value);position++},
    back(){move(-1)}, forward(){move(1)}
  };
  const harbor = element('lantern-harbor');
  harbor.open = false;
  harbor.dataset = {cartridge,sha256:signature};
  harbor.showModal = () => {harbor.open = true};
  harbor.close = () => {harbor.open = false;queueMicrotask(() => harbor.emit('close'))};
  const stage = element('lantern-stage');
  stage.replaceChildren = (...nodes) => mounted.splice(0, Infinity, ...nodes);
  const back = element('lantern-return'), retry = element('lantern-retry');
  const notice = element('lantern-notice'), message = element('lantern-message');
  const buttons = ['launchWonderwakeFromEngine','openWonderwakeShip','watchWonderwakeOpen'].map(id => {
    const node = element(id);
    node.isLauncher = true;
    return node;
  });
  const fetch = (url, opts) => {
    const pending = gate();
    requests.push({url,opts,reply:(body=bytes, status=200) => pending.resolve(new Response(body,{status}))});
    return pending.promise;
  };
  vm.runInNewContext(router,{
    document:doc,window:win,history,fetch,URL,TextDecoder,AbortController,crypto:webcrypto,
    getComputedStyle:() => ({visibility:'visible'}),
    setTimeout(fn){const id=++nextTimer;timers.set(id,fn);return id},
    clearTimeout(id){timers.delete(id)}
  });
  const click = button => doc.emit('click',{target:button});
  return {
    doc,win,harbor,state,history,frames,mounted,buttons,click,back,retry,notice,message,requests,stack,
    timeout(){for(const fn of [...timers.values()]) fn()},
    speechCount:() => speechCancelled,
    async mount(app={readyToLeave:async () => true}) {
      requests.at(-1).reply();
      // Web Crypto yields to its own worker thread.
      const limit=Date.now()+3000;
      while(!mounted.length && Date.now()<limit) await new Promise(resolve=>setTimeout(resolve,2));
      assert.equal(mounted.length,1,'the verified document must mount');
      const frame=mounted[0];
      assert.equal(frame.srcdoc,lesson);
      assert.equal(frame.hidden,true);
      if (app) frame.contentWindow.WonderwakeApp=app;
      frame.emit('load');
      return frame;
    }
  };
}

async function until(condition) {
  const limit = Date.now()+3000;
  while (!condition() && Date.now()<limit) await new Promise(resolve=>setTimeout(resolve,2));
  assert.ok(condition());
}

test('cartridge integrity, program dependencies and CSP script hashes', () => {
  assert.equal(createHash('sha256').update(bytes).digest('hex'),signature);
  assert.equal(cartridge,'wonderwake.ship.json');
  assert.equal(bytes.includes(60),false,'HTML tag openers stay escaped even on direct file navigation');
  assert.match(lesson,/^<!doctype html>/);
  for (const row of lesson.matchAll(/(?:href|src)="([^?"]+)\?v=[^"]+" integrity="sha384-([^"]+)"/g)) {
    assert.equal(createHash('sha384').update(fs.readFileSync(path.join(root,row[1]))).digest('base64'),row[2],row[1]);
  }
  const policy=lesson.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
  for (const match of lesson.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    assert.ok(policy.includes("'sha256-"+createHash('sha256').update(match[1]).digest('base64')+"'"));
  }
  assert.match(lesson,/readyToLeave:async\(\)=>\{await saveChain/);
  assert.ok(!html.includes('id="lantern-document"'));
  assert.equal(html.split(cartridge).length-1,1,'only the dialog references the cartridge; no startup or preload path');
});

test('ordinary navigation, all three eligible launchers, focus and history', async () => {
  for (let i=0;i<3;i++) {
    const h=harness(), button=h.buttons[i];
    h.click(h.back);
    h.history.pushState({normal:'Fleet'});
    h.history.back();
    assert.equal(h.requests.length,0);
    button.unavailable=true;h.click(button);button.unavailable=false;
    button.inert=true;h.click(button);button.inert=false;
    if(i===2){h.click(button);button.inWatch=true;button.ariaHidden=true;h.click(button);button.ariaHidden=false}
    assert.equal(h.requests.length,0);
    h.click(button);h.click(button);
    assert.equal(h.harbor.open,true);
    assert.equal(h.doc.activeElement,h.back);
    assert.match(h.back.textContent,i===2?/My Fleet/:/Black Flag/);
    assert.equal(h.requests.length,1);
    assert.equal(h.history.state.blackFlagLauncher,button.id);
    assert.equal(h.history.state.normal,'Engine');
    const first=h.requests[0];
    assert.equal(first.url.pathname,'/test-scope/'+cartridge);
    assert.equal(first.url.search,'?sha256='+signature);
    assert.equal(first.opts.mode,'same-origin');
    assert.equal(first.opts.referrerPolicy,'no-referrer');
    assert.equal(first.opts.redirect,'error');
    const frame=await h.mount();
    assert.equal(frame.referrerPolicy,'no-referrer');
    assert.equal(frame.hidden,false);
    assert.equal(h.notice.hidden,true);
    h.harbor.emit('wonderwake-return');
    await until(()=>!h.harbor.open);
    assert.equal(h.mounted.length,0);
    assert.equal(h.doc.activeElement,button);
    assert.equal(h.speechCount(),1);
    assert.equal(h.history.state.normal,'Engine');
    h.history.forward();
    assert.equal(h.harbor.open,true);
    assert.equal(h.stack.length,2);
    assert.equal(h.requests.length,2);
  }
});

test('aborted network and stale completion cannot replace a subsequent open', async () => {
  const h=harness();
  h.click(h.buttons[0]);
  const stale=h.requests[0];
  let prevented=false;
  h.harbor.emit('cancel',{preventDefault(){prevented=true}});
  assert.ok(prevented);
  assert.ok(stale.opts.signal.aborted);
  assert.ok(!h.harbor.open);
  h.click(h.buttons[1]);
  stale.reply();
  await new Promise(r=>setImmediate(r));
  assert.equal(h.frames.length,0);
  const frame=await h.mount();
  assert.equal(h.mounted[0],frame);
  h.timeout();
  assert.equal(h.mounted[0],frame);
});

test('all recoverable failures leave one retry action and an operable return', async () => {
  const h=harness();
  h.click(h.buttons[0]);
  h.timeout();
  assert.ok(h.requests[0].opts.signal.aborted);
  assert.match(h.message.textContent,/too long/);
  assert.ok(!h.retry.hidden);
  h.retry.focus();h.retry.emit('click');h.retry.emit('click');
  assert.equal(h.requests.length,2);
  assert.equal(h.doc.activeElement,h.back);
  h.requests.at(-1).reply('not available',404);
  await until(()=>!h.retry.hidden);
  assert.match(h.message.textContent,/could not load/);
  h.retry.emit('click');
  h.requests.at(-1).reply('"<!doctype html>tampered"');
  await until(()=>!h.retry.hidden);
  assert.match(h.message.textContent,/could not verify/);
  assert.equal(h.frames.length,0);
  h.retry.emit('click');
  await h.mount(null);
  assert.match(h.message.textContent,/lesson files/);
  assert.equal(h.mounted.length,0);
  h.retry.emit('click');
  await h.mount();
  assert.equal(h.requests.length,5);
  assert.equal(h.stack.length,2);
});

test('pending local writes, rejected saves, cancelled departure, and Forward during Back', async () => {
  const h=harness(), saved=gate();
  let calls=0;
  h.click(h.buttons[0]);
  const app={readyToLeave(){calls++;return saved.promise}};
  const frame=await h.mount(app);
  h.history.back();
  h.back.emit('click');
  assert.equal(calls,1);
  assert.equal(h.mounted[0],frame);
  h.history.forward();
  saved.resolve(true);
  await new Promise(r=>setImmediate(r));
  assert.equal(h.mounted[0],frame);
  app.readyToLeave=async()=>{throw Error('unreadable write receipt')};
  h.history.back();
  await until(()=>h.state.prompts===1);
  assert.equal(h.mounted[0],frame);
  assert.equal(h.history.state.blackFlagLauncher,h.buttons[0].id);
  h.state.confirm=true;
  h.back.emit('click');
  await until(()=>!h.harbor.open);
  assert.equal(h.mounted.length,0);
  assert.equal(h.speechCount(),1);
});

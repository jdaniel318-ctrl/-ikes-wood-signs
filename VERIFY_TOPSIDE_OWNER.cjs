'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, 'owner.html'), 'utf8');
const source = html.slice(html.indexOf('function landAtOwnerHeader()'), html.indexOf('function renderPortal('));

function enterToday(inDialog=false) {
  const window = new EventTarget();
  const viewport = window.visualViewport = Object.assign(new EventTarget(), {scale:1, offsetTop:0});
  const document = Object.assign(new EventTarget(), {scrollingElement:{}, body:{classList:{add(){},contains(){return false;}},dataset:{}}});
  const dialog = {contains:() => true, parentElement:document.scrollingElement, scrollTop:0};
  const panel = {parentElement:inDialog ? dialog : document.scrollingElement, scrollTop:0};
  const heading = {isConnected:true, dataset:{}, getClientRects:()=>[{}], parentElement:panel, focus(){document.activeElement = this;}};
  Object.assign(document, {readyState:'loading'});
  window.document = document;
  window.scrollTo = ({top}) => { window.scrollY = top; };
  const frames = new Map();
  let sequence = 0;
  const env = {
    window, document, AbortController, $:id => id === 'portalName' ? heading : null,
    requestAnimationFrame(fn){frames.set(++sequence, fn); return sequence;},
    cancelAnimationFrame(id){frames.delete(id);}
  };
  vm.createContext(env);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'fleet_viewport.js'),'utf8'),env);
  if(inDialog) window.BlackFlagViewport.landAtHeader(heading,dialog);
  else vm.runInContext('let stopOwnerLanding = null;\n' + source + '\nlandAtOwnerHeader();',env);
  function paint() {
    for (const [id, fn] of [...frames]) {frames.delete(id); fn();}
  }
  function restore() {
    window.scrollY = panel.scrollTop = 75;
    window.dispatchEvent(new Event('scroll'));
  }
  paint();
  return {window, viewport, document, dialog, heading, panel, paint, restore};
}

test('document scroll restoration resets the page and nested panel even after Safari drops heading focus', () => {
  const f = enterToday();
  f.document.activeElement = f.document.body;
  f.restore();
  f.paint();
  assert.equal(f.window.scrollY, 0);
  assert.equal(f.panel.scrollTop, 0);
  assert.equal(f.document.activeElement, f.document.body);
});
for (const type of ['pointerdown', 'touchstart', 'wheel', 'keydown', 'click', 'pagehide']) {
  test(type + ' cancels a queued correction and allows subsequent scrolling', () => {
    const f = enterToday();
    f.restore();
    f.window.dispatchEvent(new Event(type));
    f.viewport.dispatchEvent(new Event('resize'));
    f.paint();
    assert.equal(f.window.scrollY, 75);
    assert.equal(f.panel.scrollTop, 75);
  });
}
test('moving focus to another destination releases the opening view', () => {
  const f = enterToday();
  f.document.dispatchEvent(new Event('focusin'));
  f.restore();
  f.paint();
  assert.equal(f.window.scrollY, 75);
});
test('zoomed content can be panned', () => {
  const f = enterToday();
  f.viewport.scale = 2;
  f.restore();
  f.paint();
  assert.equal(f.window.scrollY, 75);
});

test('verified dialog resets only its own scroll area and preserves the underlying Engine', () => {
  const f = enterToday(true);
  f.window.scrollY = 245;
  f.dialog.scrollTop = f.panel.scrollTop = 80;
  f.viewport.dispatchEvent(new Event('resize'));
  f.paint();
  assert.equal(f.window.scrollY,245);
  assert.equal(f.dialog.scrollTop,0);
  assert.equal(f.panel.scrollTop,0);
  assert.equal(f.document.activeElement,f.heading);
});
test('replacing the workspace drops the previous landing even if Safari queues another resize', () => {
  const f = enterToday();
  f.restore();
  f.heading.isConnected=false;
  f.paint();
  assert.equal(f.window.scrollY,75);
  assert.equal(f.panel.scrollTop,75);
});

test('only inert landing titles receive the quiet focus style', () => {
  const f=enterToday();
  assert.equal(f.heading.tabIndex,-1);
  assert.ok(Object.hasOwn(f.heading.dataset,'fleetArrivalTitle'));
  const css=fs.readFileSync(path.join(__dirname,'fleet_viewport.css'),'utf8');
  assert.match(css,/:is\(h1,h2,h3\)\[data-fleet-arrival-title\]\[tabindex="-1"\]:focus\s*\{outline:none;\}/);
});

test('a newly opened dialog supersedes a queued scroll from the previous route', () => {
  const f=enterToday(true),api=f.window.BlackFlagViewport;
  f.window.scrollY=245;
  api.enter({reason:'new'});
  api.landAtHeader(f.heading,f.dialog);
  f.paint();f.paint();
  assert.equal(f.window.scrollY,245);
});

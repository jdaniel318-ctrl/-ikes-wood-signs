'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, 'owner.html'), 'utf8');
const source = html.slice(html.indexOf('function landAtOwnerHeader()'), html.indexOf('function renderPortal('));

function enterToday() {
  const window = new EventTarget();
  const viewport = window.visualViewport = Object.assign(new EventTarget(), {scale:1, offsetTop:0});
  const document = Object.assign(new EventTarget(), {scrollingElement:{}, body:{}});
  const panel = {parentElement:document.scrollingElement, scrollTop:0};
  const heading = {parentElement:panel, focus(){document.activeElement = this;}};
  window.scrollTo = ({top}) => { window.scrollY = top; };
  const frames = new Map();
  let sequence = 0;
  const env = {
    window, document, AbortController, $:id => id === 'portalName' ? heading : null,
    requestAnimationFrame(fn){frames.set(++sequence, fn); return sequence;},
    cancelAnimationFrame(id){frames.delete(id);}
  };
  vm.runInNewContext('let stopOwnerLanding = null;\n' + source + '\nlandAtOwnerHeader();', env);
  function paint() {
    for (const [id, fn] of [...frames]) {frames.delete(id); fn();}
  }
  function restore() {
    window.scrollY = panel.scrollTop = 75;
    window.dispatchEvent(new Event('scroll'));
  }
  paint();
  return {window, viewport, document, panel, paint, restore};
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

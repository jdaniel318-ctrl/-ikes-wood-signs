// Optional browser regression. Install Playwright and run with 'webkit' or 'chromium'.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium, webkit, devices } = require('playwright');
const engine = process.argv[2] || 'webkit';
const source = path.resolve(process.argv[3] || __dirname);
const engines = { chromium, webkit };

async function run() {
  assert.ok(engines[engine], 'Choose chromium or webkit');
  const browser = await engines[engine].launch({ executablePath: process.env.STREETWISE_BROWSER_EXECUTABLE });
  try {
    const page = await browser.newPage(devices['iPad Pro 11 landscape']);
    const fixture = `<meta name="viewport" content="width=device-width,initial-scale=1">
      <label>Address<input id="address" autocomplete="street-address"></label>
      <button id="next" type="button">Continue</button>
      <script src="/service_address.js"></script>
      <script>
        window.matches = [];
        window.draft = {};
        address.addEventListener('input', () => { draft.address = address.value; });
        BlackFlagServiceAddress.mount(address, {onMatch(point) { draft.point = point; if(point) matches.push(point); }});
      </script>`;
    await page.route('https://streetwise.test/**', async route => {
      const file = new URL(route.request().url()).pathname.slice(1);
      if (!file) return route.fulfill({contentType:'text/html', body:fixture});
      if (!/^(service_address\.js|streetwise_rva_\d\d\.json)$/.test(file)) return route.abort();
      return route.fulfill({contentType:file.endsWith('.js') ? 'application/javascript' : 'application/json',
        body:await fs.readFile(path.join(source,file))});
    });
    await page.goto('https://streetwise.test/');
    const input = page.getByRole('combobox');
    const option = page.getByRole('option').first();
    async function search(text) {
      await input.fill('');
      await input.fill(text);
      await option.waitFor();
    }
    const example = '900 E Broad St, Richmond, VA 23219';
    await search('900 E bro');
    // Exercise focus loss between press and release irrespective of platform timing.
    await option.evaluate(button => {
      const r = button.getBoundingClientRect();
      const params = {pointerId:9,pointerType:'touch',button:0,isPrimary:true,bubbles:true,cancelable:true,
        clientX:r.left+r.width/2,clientY:r.top+r.height/2};
      button.dispatchEvent(new PointerEvent('pointerdown',params));
      document.getElementById('address').blur();
      if (button.isConnected) button.dispatchEvent(new PointerEvent('pointerup',params));
      if (button.isConnected) button.click();
    });
    assert.equal(await input.inputValue(),example);
    assert.equal(await page.evaluate(() => draft.address),example);
    assert.equal(await page.evaluate(() => draft.point?.address),example);
    assert.equal(await page.evaluate(() => matches.length),1);
    assert.equal(await page.getByRole('option').count(),0);

    await search('101 Mounts Ba');
    await option.tap();
    assert.equal(await input.inputValue(),'101 Mounts Bay Rd, Williamsburg, VA 23185');
    assert.ok(await page.evaluate(() => BlackFlagServiceAddress.mapLink(draft.address,draft.point)));
    assert.equal(await page.locator('a,iframe').count(),0);

    await search('224 Ballard');
    await input.press('ArrowDown');
    await input.press('Enter');
    assert.equal(await input.inputValue(),'224 Ballard St, Yorktown, VA 23690');
    await input.fill('900 E bro');
    assert.equal(await page.evaluate(() => draft.point),null);
    await option.waitFor();
    await page.locator('#next').tap();
    assert.equal(await input.inputValue(),'900 E bro');
    assert.equal(await page.getByRole('option').count(),0);
    console.log('PASS',engine,'selection on focus loss, touch, keyboard, form value, staff coordinates and manual editing');
  } finally {
    await browser.close();
  }
}
run().catch(error => {console.error(error);process.exitCode=1;});

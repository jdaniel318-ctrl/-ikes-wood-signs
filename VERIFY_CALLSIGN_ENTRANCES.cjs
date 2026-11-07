// Offline browser check of the two installed Admiral entrances, with synthetic identities.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {test, before, after} = require('node:test');
const {chromium, webkit} = require('playwright');
const read = n => fs.readFileSync(path.join(__dirname, n), 'utf8');
const source = read('captain.js');
const entryEnd = source.indexOf('  window.DarkSkyOpenMyFleet=');
assert(entryEnd > 0);
const entry = source.slice(source.indexOf('/* Dark Sky 8.8.17 Admiral Commission'), source.indexOf('\n',entryEnd))
  .replace(/const ADMIRAL_PIN\s*=\s*[^;]+;/, "const ADMIRAL_PIN = '123456';") + '\n})();';
let browser;
before(async () => {
  const safari = process.env.BROWSER === 'webkit';
  browser = await (safari ? webkit : chromium).launch({executablePath:
    (safari ? process.env.WEBKIT_PATH : process.env.CHROMIUM_PATH) || undefined});
});
after(() => browser?.close());
for (const prefix of ['admiralAirlock', 'watch']) {
  test(prefix + ' chooses an account before any password request', async () => {
    const page = await browser.newPage();
    page.setDefaultTimeout(3000);
    try {
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.route('**/*', route => route.fulfill({body: '<body><div id="enginePanel"></div><style>.hidden,[hidden]{display:none!important}</style></body>',contentType:'text/html'}));
      await page.goto('https://admiral.example.invalid');
      await page.evaluate(() => {
        window.__darkSkyVerifiedRelease = {build:'test'};
        window.attempts = [];
        window.DarkSkyAdmiralIdentityStatus = async () => window.verified === true;
        window.DarkSkyAuthenticateAdmiral = async (email,secret) => {
          attempts.push(email);
          if (window.holdLogin) await new Promise(resolve => {window.releaseLogin = resolve;});
          if (email !== 'admiral@example.invalid' || secret !== 'fixture') throw Error('Authority denied');
          window.verified = true;
        };
        window.DarkSkyReadAdmiralWatch = async () => ({records:[]});
        window.DarkSkyReadFleetSpine = async () => ({counts:{},vessels:[]});
      });
      await page.addScriptTag({content:entry});
      const address = page.locator('#' + prefix + 'Email');
      const password = page.locator('#' + prefix + 'Password');
      const isOffice = prefix === 'admiralAirlock';
      async function enter() {
        if (isOffice) {
          await page.evaluate(() => DarkSkyOpenMyFleet());
          assert.equal(await page.locator('#admiralAccountAirlock').isVisible(), false);
          await page.locator('#admiralPinInput').fill('123456');
          await page.locator('#admiralUnlockBtn').click();
        } else {
          await page.evaluate(() => DarkSkyOpenFleetWatchtower());
          await page.waitForFunction(() => watchGateStatus.textContent.includes('Second security'));
        }
        await address.waitFor();
      }
      await enter();
      assert.equal(await password.count(),0,'password must be absent until the Admiral chooses an email');
      assert.equal(await address.getAttribute('autocomplete'),'off');
      await address.fill('incomplete');
      await address.press('Enter');
      assert.equal(await password.count(),0);
      assert.deepEqual(await page.evaluate(() => attempts),[]);
      await address.fill('admiral@example.invalid');
      await address.press('Enter');
      await password.waitFor();
      assert.deepEqual(await page.evaluate(() => attempts),[]);
      assert.equal(await address.evaluate(el => el.readOnly),true);
      await password.fill('fixture');
      // Simulate a credential picker replacing the username, even on a read-only field.
      await address.evaluate(el => { el.value = 'owner@example.invalid'; });
      await password.press('Enter');
      assert.deepEqual(await page.evaluate(() => attempts),[]);
      assert.equal(await password.count(),0);
      await address.fill('owner@example.invalid');
      await address.press('Enter');
      await password.fill('fixture');
      await password.press('Enter');
      await page.waitForFunction(() => attempts.length === 1);
      assert.equal(await page.locator('#watchWorkspace').isVisible(),false);
      assert.equal(await password.inputValue(),'');
      await page.getByRole('button',{name:'Change Admiral email'}).click();
      assert.equal(await password.count(),0);
      await address.fill('first@example.invalid');
      await address.press('Enter');
      await page.evaluate(() => {window.holdLogin = true;});
      await password.fill('stale');
      await password.press('Enter');
      await page.waitForFunction(() => !!window.releaseLogin);
      await page.locator(isOffice ? '#admiralGateReturnBtn' : '#watchGateClose').click();
      await enter();
      await page.evaluate(() => {window.holdLogin = false;window.releaseLogin();});
      assert.equal(await password.count(),0);
      assert.equal(await address.inputValue(),'');
      assert.equal(await page.locator('#watchWorkspace').isVisible(),false);
      await address.fill('admiral@example.invalid');
      await address.press('Enter');
      await password.fill('fixture');
      await password.press('Enter');
      await page.locator('#watchWorkspace').waitFor();
      assert.deepEqual(await page.evaluate(() => attempts),['owner@example.invalid','first@example.invalid','admiral@example.invalid']);
      assert.deepEqual(errors,[]);
    } finally {await page.close();}
  });
}

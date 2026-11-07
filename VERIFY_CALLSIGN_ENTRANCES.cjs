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
  test(prefix + ' asks only for a password on a remembered device', async () => {
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
        window.fleetReads = 0;
        window.DarkSkyAdmiralIdentityStatus = async () => {
          if (window.authorityUnavailable) throw Error('Authority unavailable');
          return window.verified === true && !window.authorityDenied;
        };
        window.DarkSkyAuthenticateAdmiral = async (email,secret) => {
          attempts.push(email);
          if (window.holdLogin) await new Promise(resolve => {window.releaseLogin = resolve;});
          if (email !== 'admiral@example.invalid' || secret !== 'fixture') throw Error('Authority denied');
          window.verified = true;
        };
        window.DarkSkyReadAdmiralWatch = async () => { window.fleetReads++; return {records:[]}; };
        window.DarkSkyReadFleetSpine = async () => ({counts:{},vessels:[]});
      });
      await page.addScriptTag({content:entry});
      const address = page.locator('#' + prefix + 'Email');
      const password = page.locator('#' + prefix + 'Password');
      const isOffice = prefix === 'admiralAirlock';
      const form = page.locator(isOffice ? '#admiralSignInForm' : '#watchSecurityForm');
      const choose = form.getByRole('button',{name:'Enter Admiral email',exact:true});
      async function openEntrance() {
        if (isOffice) {
          await page.evaluate(() => DarkSkyOpenMyFleet());
          assert.equal(await page.locator('#admiralAccountAirlock').isVisible(), false);
          assert.equal(await password.count(),0,'no account credentials are mounted before the PIN');
          await page.locator('#admiralPinInput').fill('000000');
          await page.locator('#admiralUnlockBtn').click();
          assert.equal(await page.locator('#admiralAccountAirlock').isVisible(),false);
          assert.equal(await password.count(),0);
          await page.locator('#admiralPinInput').fill('123456');
          await page.locator('#admiralUnlockBtn').click();
        } else {
          await page.evaluate(() => DarkSkyOpenFleetWatchtower());
          await page.waitForFunction(() => watchGateStatus.textContent.includes('Second security'));
        }
        await form.waitFor();
      }
      async function enter() {
        await openEntrance();
        assert.equal(await form.locator('input, textarea, [contenteditable=true]').count(),0,'arrival has no editable credential target');
        await choose.click();
        assert.equal(await form.locator('input').count(),0,'manual account choice has no credential field');
        assert.equal(await address.evaluate(el=>el.tagName),'TEXTAREA');
      }
      await enter();
      assert.equal(await password.count(),0,'password must be absent until the Admiral chooses an email');
      assert.equal(await address.getAttribute('autocomplete'),'off');
      await address.fill('incomplete');
      await address.press('Enter');
      assert.equal(await password.count(),0);
      assert.deepEqual(await page.evaluate(() => attempts),[]);
      await address.fill('admiral@\nexample.invalid');
      await address.press('Enter');
      assert.equal(await password.count(),0);
      await address.fill(' Admiral@Example.Invalid ');
      await address.press('Enter');
      await password.waitFor();
      assert.equal(await password.evaluate(el=>document.activeElement===el),false,'selecting an account must not automatically open the password picker');
      await page.keyboard.press('Tab');
      assert.equal(await password.evaluate(el=>document.activeElement===el),true,'password follows the account choice in keyboard order');
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
      await form.getByLabel('Remember my Admiral email on this device').check();
      await password.fill('fixture');
      await password.press('Enter');
      await page.waitForFunction(() => attempts.length === 1);
      assert.equal(await page.locator('#watchWorkspace').isVisible(),false);
      assert.equal(await password.inputValue(),'');
      await page.getByRole('button',{name:'Edit my sign-in email'}).click();
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
      await form.getByLabel('Remember my Admiral email on this device').check();
      await password.fill('fixture');
      await password.press('Enter');
      await page.locator('#watchWorkspace').waitFor();
      assert.deepEqual(await page.evaluate(() => attempts),['owner@example.invalid','first@example.invalid','admiral@example.invalid']);
      await page.locator('#watchClose').click();
      await page.evaluate(() => { window.verified = false; });
      await openEntrance();
      assert.equal(await password.isVisible(),true,'remembered account opens directly at the password');
      assert.deepEqual(await form.locator('input:visible,textarea:visible').evaluateAll(nodes => nodes.map(n => n.type)),['password']);
      assert.equal(await form.getByRole('button',{name:/Continue as/}).count(),0);
      assert.equal(await password.inputValue(),'');
      assert.equal(await password.evaluate(el=>document.activeElement===el),false);
      assert.equal(await page.locator('#watchWorkspace').isVisible(),false);
      await form.getByRole('button',{name:/Authenticate Admiral/}).click();
      assert.equal(await page.evaluate(() => attempts.length),3,'empty password cannot start a request');
      await password.fill('wrong');
      await password.press('Enter');
      await page.waitForFunction(() => attempts.length === 4);
      assert.equal(await password.inputValue(),'');
      assert.equal(await page.locator('#watchWorkspace').isVisible(),false);
      const readsBefore = await page.evaluate(() => fleetReads);
      for (const failure of ['authorityDenied','authorityUnavailable']) {
        await page.evaluate(key => { window[key] = true; }, failure);
        await password.fill('fixture');
        await password.press('Enter');
        await page.waitForFunction(id => document.getElementById(id).textContent.includes('remains locked'), isOffice ? 'admiralAirlockStatus' : 'watchGateStatus');
        assert.equal(await password.inputValue(),'');
        assert.equal(await page.locator('#watchWorkspace').isVisible(),false);
        assert.equal(await page.evaluate(() => fleetReads),readsBefore);
        await page.evaluate(key => { window[key] = false; window.verified = false; }, failure);
      }
      await password.fill('fixture');
      await password.press('Enter');
      await page.locator('#watchWorkspace').waitFor();
      assert.deepEqual(await page.evaluate(() => attempts.slice(3)),Array(4).fill('admiral@example.invalid'));
      await page.locator('#watchClose').click();
      // Forget on the other entrance and confirm the preference also clears here.
      await page.evaluate(() => { window.verified = false; });
      if (isOffice) {
        await page.evaluate(() => DarkSkyOpenFleetWatchtower());
      } else {
        await page.evaluate(() => DarkSkyOpenMyFleet());
        await page.locator('#admiralPinInput').fill('123456');
        await page.locator('#admiralUnlockBtn').click();
      }
      const other = page.locator(isOffice ? '#watchSecurityForm' : '#admiralSignInForm');
      await other.getByRole('button',{name:'Forget my email on this device'}).click();
      assert.equal(await other.getByRole('button',{name:'Enter Admiral email'}).isVisible(),true);
      await page.locator(isOffice ? '#watchGateClose' : '#admiralGateReturnBtn').click();
      await enter();
      assert.equal(await address.inputValue(),'');
      assert.deepEqual(errors,[]);
    } finally {await page.close();}
  });
}

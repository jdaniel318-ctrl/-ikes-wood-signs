/* Run with Playwright and Chromium. The fixture simulates losing a receipt after a committed write. */
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {chromium} = require('playwright');

(async () => {
  const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH});
  try {
    const page = await browser.newPage();
    await page.route('https://workspace.test/', route => route.fulfill({contentType:'text/html',body:'<main></main>'}));
    await page.goto('https://workspace.test/');
    await page.addScriptTag({path:path.join(__dirname, 'fleet_help.js')});
    await page.evaluate(() => {
      const requests = [];
      let stored = null;
      window.testReports = requests;
      window.DarkSkyFleetHelp.mount(document.querySelector('main'), {
        role:'owner', projectId:'fixture', projectName:'Fixture ship', screen:'Settings', build:'fixture', isCurrent:()=>true,
        async rpc(name, args) {
          if (name === 'owner_list_fleet_help') return {records:stored ? [stored] : []};
          if (name !== 'owner_create_fleet_help') throw Error('Unexpected operation');
          requests.push({...args});
          if (!stored) {
            stored = {project_id:args.p_project_id,request_id:args.p_request_id,screen:args.p_screen,
              description:args.p_description,status:'open',version:1};
            throw Error('Lost connection after saving');
          }
          return stored;
        }
      });
    });
    const description = page.getByLabel('What happened?');
    await description.fill('Fixture report about a stuck button');
    await page.getByRole('button', {name:'Send report'}).click();
    await page.getByRole('button', {name:'Retry same report'}).waitFor();
    assert.ok(await description.isDisabled());
    await page.getByRole('button', {name:'Retry same report'}).click();
    await page.locator('article').getByText('Fixture report about a stuck button').waitFor();
    assert.equal(await page.locator('article').count(), 1);
    assert.equal(await description.inputValue(), '');
    assert.ok(await description.isEnabled());
    const [first, retry] = await page.evaluate(() => window.testReports);
    assert.match(first.p_request_id, /^[0-9a-f-]{36}$/);
    assert.deepEqual(first, retry);
    console.log('PASS owner retry reuses its receipt reference and exact payload after an uncertain write.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error); process.exitCode = 1;});

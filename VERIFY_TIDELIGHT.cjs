/* Offline checks for the exact artwork delivered by the fleet loader. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash, webcrypto } = require('node:crypto');
const read = name => fs.readFileSync(path.join(__dirname, name));
const host = read('fun_program.js').toString();
const loader = host.slice(host.indexOf('const arcadeArtFiles'), host.indexOf('const arcadeSources'));
const ids = ['chalkwing', 'deepbell', 'dockmaster', 'pipeworks', 'riptail', 'skullwater'];
const player = JSON.parse(read('fleet-arcade.ship.json')).player;
const kit = player.slice(player.indexOf('const arcadePaintings ='), player.indexOf('})();',player.indexOf('const arcadePaintings =')) + 5);
const context = { crypto: webcrypto, TextDecoder, lanternAccess: run => run.authorized };
vm.runInNewContext(loader + ';this.spec = arcadeArtFiles', context);
function start() {
  const messages = [];
  const run = { authorized: true, controller: new AbortController(), channel: 'offline',
    player: {contentWindow: {postMessage(message){ messages.push(message); }}} };
  context.lanternSession = run;
  return {run, messages};
}
(async () => {
  assert.deepEqual(Object.keys(context.spec).sort(), ids);
  const names = new Set();
  for (const [id, rule] of Object.entries(context.spec)) {
    assert.equal(rule.file, 'arcade-art-'+id+'.json');
    const bytes = read(rule.file);
    assert.equal(bytes.length, rule.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), rule.sha256);
    for (const [name, uri] of Object.entries(JSON.parse(bytes))) {
      assert(!names.has(name), 'shared sprite key '+name);
      names.add(name);
      assert(uri.startsWith('data:image/webp;base64,'));
      const webp = Buffer.from(uri.split(',')[1], 'base64');
      assert.equal(webp.toString('ascii',0,4), 'RIFF');
      assert.equal(webp.toString('ascii',8,12), 'WEBP');
      assert.equal(webp.readUInt32LE(4)+8, webp.length);
    }
  }
  const rule = context.spec.dockmaster, correct = read(rule.file);
  let fetches = 0;
  context.fetch = async (url,options) => {
    fetches++;
    assert.equal(url, rule.file+'?v='+rule.sha256);
    assert.equal(options.credentials, 'omit');
    assert.equal(options.redirect, 'error');
    return new Response(correct);
  };
  const first = start();
  await context.sendArcadeArt(first.run,'unknown');
  assert.equal(fetches,0);
  await Promise.all([context.sendArcadeArt(first.run,'dockmaster'),context.sendArcadeArt(first.run,'dockmaster')]);
  assert.equal(fetches,1); assert.equal(first.messages.length,1);
  assert.equal(first.messages[0].channel,first.run.channel);
  assert.equal(first.messages[0].assets.milk,JSON.parse(correct).milk);
  const damaged = Buffer.from(correct);damaged[4]^=1;
  for(const sample of [correct.subarray(0,99),damaged]){
    const retry = start();
    context.fetch=async()=>new Response(sample);
    await context.sendArcadeArt(retry.run,'dockmaster');
    assert.equal(retry.messages.length,0);
    context.fetch=async()=>new Response(correct);
    await context.sendArcadeArt(retry.run,'dockmaster');
    assert.equal(retry.messages.length,1);
  }
  for(const change of [() => start(),run => {run.authorized=false;}]){
    const leaving = start();
    let complete;
    context.fetch = () => new Promise(resolve => {complete=resolve;});
    const pending = context.sendArcadeArt(leaving.run,'dockmaster');
    change(leaving.run);complete(new Response(correct));await pending;
    assert.equal(leaving.messages.length,0);
  }
  let bad=true;
  class Sprite {set src(v){queueMicrotask(()=>bad&&v==='cart'?this.onerror():this.onload());}}
  const decoder={Image:Sprite};
  vm.runInNewContext(kit+';this.art=arcadePaintings',decoder);
  const assets={bridge:'pier',cart:'cart'};
  await decoder.art.install('demo',assets);
  assert.equal(decoder.art.ready('demo'),false);
  assert.equal(decoder.art.image('bridge'),undefined);
  assert.equal(decoder.art.paint({},'cart',0,0,1,1),false);
  bad=false;await decoder.art.install('demo',assets);
  assert.equal(decoder.art.ready('demo'),true);
  console.log('PASS six exact bundles, '+names.size+' complete WebPs, one request per title, integrity failure and retry, stale session discard, atomic image decoding and original-art fallback.');
})().catch(error=>{console.error(error);process.exitCode=1;});

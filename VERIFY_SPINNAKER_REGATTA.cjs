'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, file), 'utf8');

const engine = read('index.html');
const controller = read('captain.js');
const owner = read('owner.html');
const endpoint = 'https://black-flag-regatta.tv6m8ysvwt.chatgpt.site/';

const card = engine.match(/<article\b[^>]*aria-labelledby="regattaEngineTitle"[\s\S]*?<\/article>/)?.[0];
assert.ok(card, 'The Engine has a Regatta card');
assert.match(card, /ADMIRAL TOOL · FLEET LEARNING/);
assert.match(card, /<button[^>]*data-command-open="regatta"/);
assert.ok(!engine.includes(endpoint), 'The Engine entrance routes through the Admiral gate');
assert.ok(!owner.includes(endpoint) && !owner.includes('regattaEngineTitle'), 'The owner workspace has no game route');

const match = controller.match(/<a id="regattaHarborLink"([^>]*)>/);
assert.ok(match);
assert.doesNotMatch(match[1], /\bhref=/);
assert.match(match[1], /target="_blank"/);
assert.match(match[1], /rel="noopener noreferrer"/);
assert.match(match[1], /referrerpolicy="no-referrer"/);
assert.equal(controller.split(endpoint).length - 1, 1);
const start = controller.indexOf('const openVerifiedAdmiralDeck=');
const end = controller.indexOf('const showAccountAirlock=', start);
assert.ok(start !== -1 && end > start);
assert.ok(controller.slice(start, end).includes(endpoint), 'A verified deck supplies the fixed game destination');
assert.ok(controller.includes("openAdmiralGate('engine', 'regatta')"));
console.log('PASS Spinnaker Engine entrance, Admiral destination, isolated game link and owner scope');

'use strict';
const assert = require('node:assert/strict');
const { facts, group, mountHome, select } = require('./business_deck.js');

const project = { id: 'sample-vessel', name: 'Sample Vessel' };
function order(id, status, extra = {}) {
  return Object.freeze({ id, projectId: project.id, wording: 'Job ' + id, status, ...extra });
}
const orders = Object.freeze([
  order('pending', 'New Request'),
  order('unknown', 'New custom status'),
  order('finished', 'Completed'),
  order('foreign', 'New Request', { projectId: 'another-vessel' }),
  order('conflict', 'New Request', { namespace: 'bf.project.another-vessel' }),
]);
for (const noun of ['Request', 'Booking', 'Inquiry', 'Partnership', 'Application', 'Reservation', 'Project']) {
  assert.equal(group({ status: 'New ' + noun }), 'new');
}
assert.equal(group({ status: ' NEW_REQUEST ' }), 'new');
const tally = facts(orders, project.id);
assert.equal(tally.all, 3);
assert.equal(tally.active, 2);
assert.equal(tally.other, 1);
assert.equal(tally.quarantined, 1);
assert.deepEqual(select(orders, project.id, { tab: 'new' }).rows, [orders[0]]);

function render(rows, options = {}) {
  const container = { querySelectorAll: () => [] };
  mountHome({ container, project, orders: rows, modules: [['orders']], onDetail() {}, ...options });
  return container.innerHTML;
}
assert.match(render(orders), /<h2>2 active orders<\/h2>/);
assert.match(render([orders[0]]), /<h2>1 active order<\/h2>/);
assert.doesNotMatch(render(orders), /Job (foreign|conflict|finished)/);
assert.match(render([orders[2]]), /No active orders/);
assert.match(render([orders[2]]), /View completed orders/);
assert.doesNotMatch(render([]), /View completed orders/);
assert.match(render([], { readError: 'Unavailable' }), /Order list unavailable/);
assert.doesNotMatch(render(orders, { readError: 'Unavailable' }), /data-today-order|No active orders/);
assert.doesNotMatch(render(orders, { modules: [] }), /data-today-order|Job pending|2 active orders/);
console.log('Daily work status, scope, queue, empty state and unavailable state passed.');

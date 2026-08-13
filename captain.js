(() => {
  'use strict';

  const CAPTAIN_PIN = '19613';
  let authorized = false;

  const byId = (id) => document.getElementById(id);
  const show = (id) => byId(id)?.classList.remove('hidden');
  const hide = (id) => byId(id)?.classList.add('hidden');

  function clearHash() {
    try {
      if (location.hash === '#captainQuartersGate') {
        history.replaceState(null, '', location.pathname + location.search);
      }
    } catch (_) {}
  }

  function openGate() {
    authorized = false;
    hide('captainQuarters');
    const gate = byId('captainQuartersGate');
    const input = byId('captainPinInput');
    const error = byId('captainPinError');

    if (error) error.textContent = '';
    if (input) input.value = '';
    gate?.classList.remove('hidden');
    document.body.classList.add('captain-modal-open');
    requestAnimationFrame(() => input?.focus());
  }

  function closeGate() {
    const input = byId('captainPinInput');
    const error = byId('captainPinError');
    if (input) input.value = '';
    if (error) error.textContent = '';
    hide('captainQuartersGate');
    document.body.classList.remove('captain-modal-open');
    clearHash();
  }

  function playEntrance() {
    const quarters = byId('captainQuarters');
    const entry = byId('captainEntrySequence');
    quarters?.classList.remove('captain-entry-complete');
    entry?.classList.remove('captain-entry-play');
    if (entry) void entry.offsetWidth;
    entry?.classList.add('captain-entry-play');
    window.setTimeout(() => quarters?.classList.add('captain-entry-complete'), 4300);
  }

  function unlock() {
    const input = byId('captainPinInput');
    const error = byId('captainPinError');
    const entered = String(input?.value || '').trim();

    if (entered !== CAPTAIN_PIN) {
      authorized = false;
      if (error) error.textContent = 'Captain authentication failed.';
      if (input) {
        input.value = '';
        input.focus();
      }
      return;
    }

    authorized = true;
    byId('captainPinInput')?.blur();
    hide('captainQuartersGate');
    show('captainQuarters');
    clearHash();
    document.body.classList.add('captain-modal-open', 'captain-authorized');
    playEntrance();
  }

  function secure() {
    authorized = false;
    hide('captainBlueprint');
    hide('captainFleetChart');
    hide('captainQuarters');
    hide('captainQuartersGate');
    byId('captainQuarters')?.classList.remove('captain-entry-complete');
    byId('captainEntrySequence')?.classList.remove('captain-entry-play');
    if (byId('captainPinInput')) byId('captainPinInput').value = '';
    document.body.classList.remove('captain-modal-open', 'captain-authorized');
    clearHash();
  }

  function bind() {
    document.documentElement.classList.add('captain-controller-ready');

    // Direct listeners are safe here because this file loads at the very end of BODY.
    byId('captainModeAccessBtn')?.addEventListener('click', (event) => {
      event.preventDefault();
      openGate();
    });
    byId('captainGateCloseBtn')?.addEventListener('click', (event) => {
      event.preventDefault();
      closeGate();
    });
    byId('captainUnlockBtn')?.addEventListener('click', (event) => {
      event.preventDefault();
      unlock();
    });
    byId('captainQuartersCloseBtn')?.addEventListener('click', secure);
    byId('captainExitBtn')?.addEventListener('click', secure);
    byId('captainBlueprintBtn')?.addEventListener('click', (event) => {
      event.preventDefault();
      show('captainBlueprint');
    });
    byId('captainBlueprintDeskBtn')?.addEventListener('click', (event) => {
      event.preventDefault();
      show('captainBlueprint');
    });
    byId('captainBlueprintClose')?.addEventListener('click', (event) => {
      event.preventDefault();
      hide('captainBlueprint');
    });
    byId('captainDarkSkyChartBtn')?.addEventListener('click', (event) => {
      event.preventDefault();
      show('captainFleetChart');
    });
    byId('captainFleetChartClose')?.addEventListener('click', (event) => {
      event.preventDefault();
      hide('captainFleetChart');
    });
    byId('captainPinInput')?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        unlock();
      }
    });

    // Defensive delegated fallback in case the Engine later recreates the access dock.
    document.addEventListener('click', (event) => {
      const access = event.target.closest?.('#captainModeAccessBtn');
      if (access && access !== byId('captainModeAccessBtn')) {
        event.preventDefault();
        openGate();
      }
    }, true);

    // Native hash fallback may already have exposed the gate before JS booted.
    if (location.hash === '#captainQuartersGate') openGate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  } else {
    bind();
  }

  // Captain authority is never persisted.
  window.addEventListener('pagehide', () => { authorized = false; });
})();

// v2.9.43 — cabin objects are presentation-safe Captain tools.
document.addEventListener('DOMContentLoaded', () => {
  const panel = document.getElementById('captainObjectPanel');
  const title = document.getElementById('captainObjectTitle');
  const copy = document.getElementById('captainObjectCopy');
  const content = {
    log: ["Captain's Log", "A private book for future Captain notes, experiments and mission history. In this build it is intentionally read-only: no project or customer data is changed."],
    cargo: ["Cargo Hold", "Captain-only experimental workshop for prototypes, visual assets, unfinished ideas and reusable discoveries before anything is promoted to the working ship."],
    compass: ["Black Flag Compass", "The compass points toward the next experiment: make the room itself the command surface. It is decorative in this build and carries no production authority."],
    locker: ["Powder Keg Locker", "Powerful ship-level controls berth here. Dangerous actions remain explicit, explained and separately confirmed."],
  };
  document.querySelectorAll('[data-cq-object]').forEach(btn => btn.addEventListener('click', () => {
    const item = content[btn.dataset.cqObject]; if (!item || !panel) return;
    title.textContent = item[0]; copy.textContent = item[1]; document.getElementById('captainPowderControls')?.classList.toggle('hidden', btn.dataset.cqObject !== 'locker'); document.getElementById('captainDarkSkyChartBtn')?.classList.add('cq-map-receded'); panel.classList.remove('hidden');
  }));
  document.getElementById('captainObjectClose')?.addEventListener('click', () => { panel?.classList.add('hidden'); document.getElementById('captainPowderControls')?.classList.add('hidden'); document.getElementById('captainDarkSkyChartBtn')?.classList.remove('cq-map-receded'); });
});

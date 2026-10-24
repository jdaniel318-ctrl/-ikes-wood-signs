/* Carvewright local design persistence. All data is scoped; no service access. */
(function (root, factory) {
  'use strict';
  var common = typeof module === 'object' && module.exports;
  var api = factory(common ? require('./carvewright_core.js') : root.CarvewrightCore, common ? require('./carve_fonts.js') : root.IkeCarveFonts, common ? require('./carve_store.js') : root.IkeCarveStore);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CarvewrightStore = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function (core, fonts, oldStore) {
  'use strict';
  var DB_NAME = 'blackflag-carvewright-v1';
  var STORE_NAME = 'designs';
  var SCOPE_FIELDS = ['accountId', 'backend', 'environment', 'site', 'businessId'];
  var BAD_KEYS = ['__proto__', 'prototype', 'constructor'];

  function fault(code, message, cause) {
    var error = new Error(message);
    error.code = code;
    if (cause) error.cause = cause;
    return error;
  }
  function invalid(message) { throw fault('VALIDATION', message); }
  function plain(value) {
    return value && typeof value === 'object' && !Array.isArray(value) &&
      (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
  }
  function validString(value, max) { return typeof value === 'string' && value.length > 0 && value.length <= max; }
  function jsonClone(value) {
    var nodes = 0;
    function check(item, depth) {
      if (++nodes > 20000 || depth > 12) invalid('Design is too complex.');
      if (item === null || typeof item === 'string' || typeof item === 'boolean') return;
      if (typeof item === 'number') { if (!Number.isFinite(item)) invalid('Design numbers must be finite.'); return; }
      if (!plain(item) && !Array.isArray(item)) invalid('Design must contain plain JSON values.');
      Reflect.ownKeys(item).forEach(function (key) {
        if (Array.isArray(item) && key === 'length') return;
        if (typeof key !== 'string') invalid('Design keys must be strings.');
        if (BAD_KEYS.indexOf(key) !== -1) invalid('Unsafe design property.');
        var descriptor = Object.getOwnPropertyDescriptor(item, key);
        if (!descriptor || !Object.prototype.hasOwnProperty.call(descriptor, 'value') || !descriptor.enumerable) invalid('Design accessors are not supported.');
        check(descriptor.value, depth + 1);
      });
    }
    check(value, 0);
    var text;
    try { text = JSON.stringify(value); } catch (error) { invalid('Design must be serializable JSON.'); }
    if (text.length > 4 * 1024 * 1024) invalid('Design exceeds the local storage size limit.');
    return JSON.parse(text);
  }
  function scopeIdentity(scope) {
    if (!plain(scope) || Reflect.ownKeys(scope).length !== SCOPE_FIELDS.length) invalid('Exact account, backend, environment, site and business scope is required.');
    var tuple = SCOPE_FIELDS.map(function (field) {
      var descriptor = Object.getOwnPropertyDescriptor(scope, field);
      if (!descriptor || !Object.prototype.hasOwnProperty.call(descriptor, 'value')) invalid('Storage scope fields must be own data properties: ' + field + '.');
      var value = descriptor.value;
      if (!validString(value, 2048)) invalid('Invalid storage scope: ' + field + '.');
      return value;
    });
    if (tuple[4] !== 'carvewright') invalid('Carvewright storage requires its local application namespace.');
    return JSON.stringify(tuple);
  }
  function validateDesign(draft, expectedRevision) {
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0 || expectedRevision > Number.MAX_SAFE_INTEGER) invalid('Expected revision must be a nonnegative safe integer.');
    var copy = jsonClone(draft);
    if (!plain(copy)) invalid('Design must be a plain object.');
    if (copy.revision !== expectedRevision) invalid('Design revision must match expected revision.');
    var validation = core.validate(copy, fonts);
    if (!validation.ok) invalid(validation.errors.join(' '));
    var geometry = core.layout(copy, fonts);
    if (!geometry.ok) invalid(geometry.errors.join(' '));
    return copy;
  }

  function create(options) {
    options = options || {};
    var scopeKey = scopeIdentity(options.scope);
    if (typeof options.guard !== 'function') invalid('A live authorization guard is required.');
    var guard = options.guard;
    var provider;
    var providerFailure;
    try {
      provider = Object.prototype.hasOwnProperty.call(options, 'indexedDB') ? options.indexedDB :
        (typeof globalThis !== 'undefined' ? globalThis.indexedDB : undefined);
    } catch (error) { providerFailure = error; }
    var capturedScope = JSON.parse(scopeKey);
    var legacyStore = null;
    var closed = false;
    var database = null;
    var opening = null;
    var pending = new Set();
    var transactions = new Set();

    function authorized() {
      if (closed) throw fault('AUTH', 'Carvewright has been closed.');
      var allowed = false;
      try { allowed = guard() === true; } catch (error) { throw fault('AUTH', 'Carvewright authorization is no longer available.', error); }
      if (!allowed) throw fault('AUTH', 'Carvewright authorization is no longer available.');
    }
    function storageError(error) {
      return error && error.code === 'AUTH' ? error : fault('STORAGE', 'Local design storage failed. No design was reported saved.', error);
    }
    function operationError(error) {
      return error && ['AUTH', 'CONFLICT', 'VALIDATION', 'STORAGE'].indexOf(error.code) !== -1 ? error : storageError(error);
    }
    function openDatabase() {
      authorized();
      if (database) return Promise.resolve(database);
      if (opening) return opening;
      opening = new Promise(function (resolve, reject) {
        var settled = false;
        var request;
        function fail(error) {
          if (settled) return;
          settled = true;
          pending.delete(cancel);
          reject(error);
        }
        function cancel() { fail(fault('AUTH', 'Carvewright was closed before local storage opened.')); }
        pending.add(cancel);
        try {
          if (providerFailure) throw providerFailure;
          if (!provider || typeof provider.open !== 'function') throw new Error('IndexedDB is unavailable.');
          request = provider.open(DB_NAME, 1);
          request.onupgradeneeded = function () {
            try {
              authorized();
              if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME, { keyPath: 'key' });
            } catch (error) {
              try { request.transaction.abort(); } catch (_) { /* Already aborted. */ }
              fail(error.code === 'AUTH' ? error : storageError(error));
            }
          };
          request.onerror = function () { fail(storageError(request.error)); };
          request.onblocked = function () { fail(storageError(new Error('IndexedDB upgrade is blocked. Close older studio tabs.'))); };
          request.onsuccess = function () {
            var db = request.result;
            if (settled) { db.close(); return; }
            try { authorized(); } catch (error) { db.close(); fail(error); return; }
            if (!db.objectStoreNames.contains(STORE_NAME)) { db.close(); fail(storageError(new Error('Design store is missing.'))); return; }
            database = db;
            db.onversionchange = function () { close(); };
            settled = true;
            pending.delete(cancel);
            resolve(db);
          };
        } catch (error) { fail(storageError(error)); }
      });
      return opening;
    }
    async function transact(mode, work) {
      authorized();
      var db = await openDatabase();
      authorized();
      return new Promise(function (resolve, reject) {
        var tx;
        var result;
        var settled = false;
        var failure = null;
        function cleanup() { pending.delete(cancel); if (tx) transactions.delete(tx); }
        function fail(error) {
          if (settled) return;
          failure = error;
          settled = true;
          try { if (tx) tx.abort(); } catch (_) { /* The transaction may already be inactive. */ }
          cleanup();
          reject(error);
        }
        function cancel() { fail(fault('AUTH', 'Carvewright was closed during local storage work.')); }
        function checked(callback) {
          return function () {
            if (settled) return;
            try { authorized(); callback.apply(null, arguments); }
            catch (error) { fail(operationError(error)); }
          };
        }
        try {
          authorized();
          tx = db.transaction(STORE_NAME, mode);
          transactions.add(tx);
          pending.add(cancel);
          tx.onabort = function () { if (!settled) fail(failure || storageError(tx.error)); };
          tx.onerror = function () { if (!settled) fail(storageError(tx.error)); };
          tx.oncomplete = checked(function () { settled = true; cleanup(); resolve(result); });
          work(tx.objectStore(STORE_NAME), checked, function (value) { result = value; });
        } catch (error) { fail(operationError(error)); }
      });
    }
    function recordKey(id) { return JSON.stringify([scopeKey, id]); }
    function readDesign(record, id) {
      if (!record) return null;
      if (record.scopeKey !== scopeKey || record.id !== id || record.key !== recordKey(id)) throw fault('STORAGE', 'Stored design identity is invalid.');
      if (!record.design || record.revision !== record.design.revision || record.design.id !== id) throw fault('STORAGE', 'Stored design revision is invalid.');
      try { return validateDesign(record.design, record.revision); }
      catch (error) { throw fault('STORAGE', 'Stored design is invalid.', error); }
    }
    async function load(id) {
      authorized();
      if (!validString(id, 128)) invalid('Invalid design ID.');
      return transact('readonly', function (store, checked, done) {
        var request = store.get(recordKey(id));
        request.onsuccess = checked(function () { done(readDesign(request.result, id)); });
      });
    }
    async function list() {
      return transact('readonly', function (store, checked, done) {
        var rows = [];
        var request = store.openCursor();
        request.onsuccess = checked(function () {
          var cursor = request.result;
          if (!cursor) { done(rows); return; }
          var row = cursor.value;
          if (row && row.scopeKey === scopeKey) rows.push(readDesign(row, row.id));
          cursor.continue();
        });
      });
    }
    async function save(draft, expectedRevision) {
      authorized();
      if (expectedRevision === Number.MAX_SAFE_INTEGER) invalid('Design revision cannot increment beyond the safe integer limit.');
      // Snapshot before any await: callers cannot mutate identity or content mid-save.
      var copy = validateDesign(draft, expectedRevision);
      return transact('readwrite', function (store, checked, done) {
        var request = store.get(recordKey(copy.id));
        request.onsuccess = checked(function () {
          var previous = readDesign(request.result, copy.id);
          if ((!previous && expectedRevision !== 0) || (previous && previous.revision !== expectedRevision)) throw fault('CONFLICT', 'This design changed in another workspace. Reload it before saving.');
          copy.revision = expectedRevision + 1;
          authorized();
          var put = store.put({ key: recordKey(copy.id), scopeKey: scopeKey, id: copy.id, revision: copy.revision, design: copy });
          put.onsuccess = checked(function () { done(jsonClone(copy)); });
        });
      });
    }
    // The legacy database is opened only by an explicit legacy read action.
    function legacyReader() {
      authorized();
      if (!legacyStore) {
        if (!oldStore || typeof oldStore.create !== 'function') throw fault('STORAGE', 'Legacy local storage is unavailable.');
        var legacyScope = {};
        SCOPE_FIELDS.forEach(function (field, index) { legacyScope[field] = index === 4 ? 'ikes-wood-signs' : capturedScope[index]; });
        legacyStore = oldStore.create({scope: legacyScope, guard: function () { authorized(); return true; }, indexedDB: provider});
      }
      return legacyStore;
    }
    async function listLegacyIke() {
      authorized();
      try { var result = await legacyReader().list(); authorized(); return jsonClone(result); }
      catch (error) { throw operationError(error); }
    }
    async function loadLegacyIke(id) {
      authorized();
      try { var result = await legacyReader().load(id); authorized(); return result === null ? null : jsonClone(result); }
      catch (error) { throw operationError(error); }
    }
    function close() {
      if (closed) return;
      closed = true;
      if (legacyStore) { legacyStore.close(); legacyStore = null; }
      Array.from(pending).forEach(function (cancel) { cancel(); });
      transactions.forEach(function (tx) { try { tx.abort(); } catch (_) { /* Already inactive. */ } });
      transactions.clear();
      if (database) { database.close(); database = null; }
    }
    return { list: list, load: load, save: save, close: close, listLegacyIke: listLegacyIke, loadLegacyIke: loadLegacyIke };
  }
  return { create: create };
}));

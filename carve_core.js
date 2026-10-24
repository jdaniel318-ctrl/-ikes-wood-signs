/* Carve Studio physical vector foundation. Reference layout only; no toolpaths. */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.IkeCarveCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  var DESIGN = 'ike-carve-design-v1', PACKET = 'ike-carve-job-v1';
  var DANGEROUS = ['__proto__', 'prototype', 'constructor'];
  var own = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };
  var clone = function (x) { return JSON.parse(JSON.stringify(x)); };
  function id() {
    if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID();
    if (typeof require === 'function') return require('node:crypto').randomUUID();
    throw new Error('Secure local design identifiers are unavailable in this browser.');
  }
  function createDraft() {
    return {schema: DESIGN, id: id(), revision: 0, title: 'Smoke Hole — reference', projectId: 'ikes-wood-signs',
      stock: {id: 'REFERENCE-24X8', widthMm: 609.6, heightMm: 203.2, thicknessMm: 19.05, marginMm: 12.7, species: 'cedar', reference: true},
      text: {value: 'Smoke Hole!', fontId: 'studio-sans', sizePercent: 85, trackingEm: 0, align: 'center', offsetXmm: 0, offsetYmm: 0},
      appearance: {wood: 'cedar', ink: '#20262d'}, review: null};
  }
  function object(x) { return !!x && typeof x === 'object' && !Array.isArray(x) && (Object.getPrototypeOf(x) === Object.prototype || Object.getPrototypeOf(x) === null); }
  function keys(x, allowed, required, label, errors) {
    if (!object(x)) { errors.push(label + ' must be an object.'); return false; }
    Object.keys(x).forEach(function (k) { if (DANGEROUS.indexOf(k) !== -1 || allowed.indexOf(k) === -1) errors.push('Unknown or unsafe ' + label + ' field: ' + k); });
    required.forEach(function (k) { if (!own(x, k)) errors.push('Missing ' + label + ' field: ' + k); });
    return true;
  }
  function range(x, low, high) { return typeof x === 'number' && Number.isFinite(x) && x >= low && x <= high; }
  function shortString(x, max) { return typeof x === 'string' && x.length > 0 && x.length <= max && !/[\u0000-\u001f\u007f]/.test(x); }
  function fontFor(draft, fonts) {
    return fonts && fonts.schema === 'ike-carve-fonts-v1' && fonts.fonts && draft && draft.text && own(fonts.fonts, draft.text.fontId) ? fonts.fonts[draft.text.fontId] : null;
  }
  function validate(draft, fonts) {
    var errors = [], missingGlyphs = [];
    var dk = ['schema', 'id', 'revision', 'title', 'projectId', 'stock', 'text', 'appearance', 'review'];
    if (!keys(draft, dk, dk, 'design', errors)) return {ok: false, errors: errors, missingGlyphs: missingGlyphs};
    if (draft.schema !== DESIGN) errors.push('Unsupported design schema.');
    if (!shortString(draft.id, 160)) errors.push('A design identifier is required (maximum 160 characters).');
    if (!Number.isSafeInteger(draft.revision) || draft.revision < 0) errors.push('Revision must be a nonnegative safe integer.');
    if (!shortString(draft.title, 160)) errors.push('Title must contain 1–160 characters without control characters.');
    if (draft.projectId !== 'ikes-wood-signs') errors.push('This design must belong to Ike’s Wood Signs.');
    var sk = ['id', 'widthMm', 'heightMm', 'thicknessMm', 'marginMm', 'species', 'reference'];
    if (keys(draft.stock, sk, sk, 'stock', errors)) {
      var s = draft.stock;
      if (!shortString(s.id, 120)) errors.push('Stock identifier must contain 1–120 characters.');
      if (!shortString(s.species, 80)) errors.push('Stock species must contain 1–80 characters.');
      if (s.reference !== true) errors.push('Stock must remain identified as reference stock.');
      if (!range(s.widthMm, 25.4, 3048) || !range(s.heightMm, 25.4, 3048)) errors.push('Stock width and height must be 25.4–3048 mm.');
      if (!range(s.thicknessMm, 1, 150)) errors.push('Stock thickness must be 1–150 mm.');
      if (!range(s.marginMm, 0, 1524) || !(s.marginMm < Math.min(s.widthMm, s.heightMm) / 2)) errors.push('Margin must be nonnegative and less than half the smaller stock dimension.');
    }
    var tk = ['value', 'fontId', 'sizePercent', 'trackingEm', 'align', 'offsetXmm', 'offsetYmm'];
    if (keys(draft.text, tk, tk, 'text', errors)) {
      var t = draft.text, f = fontFor(draft, fonts);
      if (typeof t.value !== 'string' || Array.from(t.value).length > 240) errors.push('Wording must contain at most 240 Unicode characters.');
      else {
        if (t.value.split('\n').length > 3) errors.push('Use at most three lines.');
        if (f && f.glyphs) Array.from(t.value).forEach(function (c) { if (c !== '\n' && !own(f.glyphs, c) && missingGlyphs.indexOf(c) === -1) missingGlyphs.push(c); });
      }
      if (!f) errors.push('Choose one of the bundled reference fonts.');
      if (!range(t.sizePercent, 10, 100)) errors.push('Lettering size must be 10–100 percent.');
      if (!range(t.trackingEm, -0.1, 0.5)) errors.push('Tracking must be −0.1 to 0.5 em.');
      if (['left', 'center', 'right'].indexOf(t.align) === -1) errors.push('Alignment must be left, center or right.');
      if (!draft.stock || !range(t.offsetXmm, -draft.stock.widthMm, draft.stock.widthMm) || !range(t.offsetYmm, -draft.stock.heightMm, draft.stock.heightMm)) errors.push('Offsets must be finite and within the stock dimensions.');
      if (missingGlyphs.length) errors.push('Unsupported characters: ' + missingGlyphs.map(function (c) { return JSON.stringify(c); }).join(', '));
    }
    if (keys(draft.appearance, ['wood', 'ink'], ['wood', 'ink'], 'appearance', errors)) {
      if (['cedar', 'walnut', 'oak'].indexOf(draft.appearance.wood) === -1) errors.push('Wood appearance must be cedar, walnut or oak.');
      if (typeof draft.appearance.ink !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(draft.appearance.ink)) errors.push('Ink must be a six-digit hex color.');
    }
    if (draft.review !== null) {
      var rk = ['kind', 'fingerprint', 'reviewedAt', 'productionReady'];
      if (keys(draft.review, rk, rk, 'review', errors)) {
        if (draft.review.kind !== 'local-layout-review' || draft.review.productionReady !== false || !/^[0-9a-f]{64}$/.test(draft.review.fingerprint) || typeof draft.review.reviewedAt !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(draft.review.reviewedAt) || !Number.isFinite(Date.parse(draft.review.reviewedAt))) errors.push('Invalid local layout review record.');
      }
    }
    return {ok: errors.length === 0, errors: errors, missingGlyphs: missingGlyphs};
  }
  function layout(draft, fonts) {
    var validation = validate(draft, fonts), value = draft && draft.text && typeof draft.text.value === 'string' ? draft.text.value : '';
    var result = {ok: validation.ok, errors: validation.errors.slice(), missingGlyphs: validation.missingGlyphs, glyphs: [], bounds: null, blank: /^\s*$/.test(value), lineCount: value.split('\n').length};
    if (!validation.ok) return result;
    var font = fontFor(draft, fonts), text = draft.text, stock = draft.stock;
    var lines = value.split('\n'), widths = [], raw = [];
    var tracking = text.trackingEm * font.unitsPerEm;
    lines.forEach(function (line, lineIndex) {
      var chars = Array.from(line), x = 0;
      chars.forEach(function (c, i) {
        if (i) x += (font.kern[chars[i - 1] + '|' + c] || 0) + tracking;
        var g = font.glyphs[c];
        if (g.d) raw.push({char: c, d: g.d, x: x, y: -lineIndex * font.lineHeight, bounds: g.bounds, line: lineIndex});
        x += g.advance;
      });
      widths.push(x);
    });
    if (!raw.length) { result.blank = true; return result; }
    result.blank = false;
    var maxWidth = Math.max.apply(null, widths), xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity;
    raw.forEach(function (g) {
      g.x += text.align === 'center' ? (maxWidth - widths[g.line]) / 2 : text.align === 'right' ? maxWidth - widths[g.line] : 0;
      xmin = Math.min(xmin, g.x + g.bounds[0]); ymin = Math.min(ymin, g.y + g.bounds[1]);
      xmax = Math.max(xmax, g.x + g.bounds[2]); ymax = Math.max(ymax, g.y + g.bounds[3]);
    });
    // Fit both ink and logical advance extents. External spaces and blank lines
    // must remain part of placement instead of vanishing during ink recentering.
    var inkXmin = xmin, inkYmin = ymin, inkXmax = xmax, inkYmax = ymax;
    xmin = Math.min(0, xmin); xmax = Math.max(maxWidth, xmax);
    var firstInkLine = raw[0].line, lastInkLine = raw[raw.length - 1].line;
    ymax += firstInkLine * font.lineHeight;
    ymin -= (lines.length - 1 - lastInkLine) * font.lineHeight;
    var iw = stock.widthMm - 2 * stock.marginMm, ih = stock.heightMm - 2 * stock.marginMm;
    var scale = Math.min(iw / (xmax - xmin), ih / (ymax - ymin)) * text.sizePercent / 100;
    if (!Number.isFinite(scale) || scale <= 0) { result.ok = false; result.errors.push('Lettering has no usable outline bounds.'); return result; }
    var w = (xmax - xmin) * scale, h = (ymax - ymin) * scale;
    var left = stock.marginMm + (text.align === 'left' ? 0 : text.align === 'right' ? iw - w : (iw - w) / 2) + text.offsetXmm;
    var top = stock.marginMm + (ih - h) / 2 + text.offsetYmm;
    var tx = left - xmin * scale, ty = top + ymax * scale;
    result.glyphs = raw.map(function (g) { return {char: g.char, d: g.d, matrix: [scale, 0, 0, -scale, tx + g.x * scale, ty - g.y * scale]}; });
    var inkLeft = tx + inkXmin * scale, inkTop = ty - inkYmax * scale;
    var inkRight = tx + inkXmax * scale, inkBottom = ty - inkYmin * scale;
    result.bounds = {xMin: inkLeft, yMin: inkTop, xMax: inkRight, yMax: inkBottom, width: inkRight - inkLeft, height: inkBottom - inkTop};
    var epsilon = 1e-7;
    if (inkLeft < stock.marginMm - epsilon || inkTop < stock.marginMm - epsilon || inkRight > stock.widthMm - stock.marginMm + epsilon || inkBottom > stock.heightMm - stock.marginMm + epsilon) {
      result.ok = false; result.errors.push('Lettering overflows the inset area. Reduce offsets, lettering size or margins.');
    }
    return result;
  }
  function escapeXml(s) { return String(s).replace(/[&<>"']/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'}[c]; }); }
  function renderPaths(result) {
    if (!result || !result.ok || !Array.isArray(result.glyphs)) return '';
    return result.glyphs.map(function (g) { return '<path d="' + escapeXml(g.d) + '" transform="matrix(' + g.matrix.join(' ') + ')"/>'; }).join('\n');
  }
  function usable(draft, fonts) {
    var result = layout(draft, fonts);
    if (!result.ok || result.blank) throw new Error(result.errors.join(' ') || 'Enter supported lettering before review or export.');
    return result;
  }
  function metadataJson(value) {
    // XML 1.0 forbids noncharacters and unpaired surrogate code units even
    // inside JSON text. JSON Unicode escapes retain the original values after
    // decoding without emitting forbidden XML literals or character references.
    return JSON.stringify(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ud800-\udfff\ufffe\uffff]/g, function (c) {
      return '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0');
    });
  }
  function toSvg(draft, fonts) {
    var result = usable(draft, fonts), s = draft.stock;
    var metadata = {schema: DESIGN, title: draft.title, wording: draft.text.value, units: 'mm', font: fontFor(draft, fonts).name, sourceSha256: fontFor(draft, fonts).sourceSha256, referenceLettering: true, productionReady: false, toolpathsIncluded: false, review: 'Local layout review only; not customer approval or machining release.'};
    return '<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="' + s.widthMm + 'mm" height="' + s.heightMm + 'mm" viewBox="0 0 ' + s.widthMm + ' ' + s.heightMm + '">\n<metadata>' + escapeXml(metadataJson(metadata)) + '</metadata>\n<g fill="' + draft.appearance.ink + '" fill-rule="nonzero">\n' + renderPaths(result) + '\n</g>\n</svg>\n';
  }
  function canonical(value) {
    if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
    if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(function (k) { return JSON.stringify(k) + ':' + canonical(value[k]); }).join(',') + '}';
    return JSON.stringify(value);
  }
  function assets(draft, fonts) {
    var f = fontFor(draft, fonts);
    return [{id: f.id, name: f.name, source: f.source, sourceSha256: f.sourceSha256}];
  }
  function content(draft) { return {schema: draft.schema, title: draft.title, projectId: draft.projectId, stock: draft.stock, text: draft.text, appearance: draft.appearance}; }
  async function sha256(s) {
    if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
      var hash = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
      return Array.from(new Uint8Array(hash)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    }
    if (typeof require === 'function') return require('node:crypto').createHash('sha256').update(s).digest('hex');
    throw new Error('SHA-256 is unavailable. Open the studio in a secure browser context.');
  }
  async function fingerprint(draft, fonts) {
    var result = usable(draft, fonts);
    return sha256(canonical({design: content(draft), fontAssets: assets(draft, fonts), geometry: result.glyphs}));
  }
  async function review(draft, fonts) {
    var snapshot = clone(draft), hash = await fingerprint(snapshot, fonts);
    snapshot.review = {kind: 'local-layout-review', fingerprint: hash, reviewedAt: new Date().toISOString(), productionReady: false};
    return snapshot;
  }
  async function reviewMatches(draft, fonts) {
    try { return !!draft.review && draft.review.kind === 'local-layout-review' && draft.review.productionReady === false && draft.review.fingerprint === await fingerprint(draft, fonts); }
    catch (_) { return false; }
  }
  async function createPacket(draft, fonts) {
    var snapshot = clone(draft), result = usable(snapshot, fonts);
    return {schema: PACKET, design: snapshot, fontAssets: assets(snapshot, fonts), geometry: result.glyphs, fingerprint: await fingerprint(snapshot, fonts), productionReady: false, toolpathsIncluded: false};
  }
  function safeTree(value, depth) {
    if (depth > 24) throw new Error('Job file nesting is too deep.');
    if (!value || typeof value !== 'object') return;
    Object.keys(value).forEach(function (k) { if (DANGEROUS.indexOf(k) !== -1) throw new Error('Unsafe job file key.'); safeTree(value[k], depth + 1); });
  }
  async function readPacket(text, fonts) {
    if (typeof text !== 'string' || text.length > 4 * 1024 * 1024 || new TextEncoder().encode(text).byteLength > 4 * 1024 * 1024) throw new Error('Job file must be at most 4 MiB.');
    var p;
    try { p = JSON.parse(text); } catch (_) { throw new Error('Job file is not valid JSON.'); }
    safeTree(p, 0);
    var errors = [], pk = ['schema', 'design', 'fontAssets', 'geometry', 'fingerprint', 'productionReady', 'toolpathsIncluded'];
    if (!keys(p, pk, pk, 'job', errors) || errors.length || p.schema !== PACKET || p.productionReady !== false || p.toolpathsIncluded !== false) throw new Error('Unsupported or malformed job file. ' + errors.join(' '));
    var result = usable(p.design, fonts);
    if (canonical(p.fontAssets) !== canonical(assets(p.design, fonts))) throw new Error('Job font assets do not match the bundled reference fonts.');
    if (canonical(p.geometry) !== canonical(result.glyphs)) throw new Error('Job geometry does not match the exact regenerated paths.');
    if (typeof p.fingerprint !== 'string' || !/^[0-9a-f]{64}$/.test(p.fingerprint) || p.fingerprint !== await fingerprint(p.design, fonts)) throw new Error('Job fingerprint does not match its design and paths.');
    var imported = clone(p.design); imported.id = id(); imported.revision = 0; imported.review = null;
    return imported;
  }
  return Object.freeze({createDraft: createDraft, validate: validate, layout: layout, renderPaths: renderPaths, toSvg: toSvg, fingerprint: fingerprint, review: review, reviewMatches: reviewMatches, createPacket: createPacket, readPacket: readPacket});
});

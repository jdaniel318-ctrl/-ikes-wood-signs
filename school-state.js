/* Only attach this optional field after an explorer enters a school lesson. */
(function (scope) {
  'use strict';
  const subjects = ['Math', 'Spelling', 'Grammar', 'Science', 'Art', 'Music'];
  const bands = ['K–2', '3–5', '6–8', '9–12'];
  const keys = new Set(bands.flatMap((_, band) => subjects.map(subject => subject + '-' + band)));
  const fresh = () => ({current: null, band: 0, records: {}, paths: {}});
  const newRecord = () => ({step: 0, completions: 0, assisted: false, solo: false});
  function validate(value) {
    const clean = fresh();
    function invalid() { throw Error('This school progress record could not be read.'); }
    const dictionary = x => x && typeof x === 'object' && !Array.isArray(x);
    if (!dictionary(value) || !dictionary(value.records) || !dictionary(value.paths)) invalid();
    if (value.current !== null && !keys.has(value.current)) invalid();
    if (!Number.isInteger(value.band) || value.band < 0 || value.band >= bands.length) invalid();
    clean.current = value.current;
    clean.band = value.band;
    for (const [key, r] of Object.entries(value.records)) {
      if (!keys.has(key) || !dictionary(r) || !Number.isInteger(r.step) || r.step < 0 || r.step > 3 ||
        !Number.isInteger(r.completions) || r.completions < 0 || r.completions > 999999 ||
        typeof r.assisted !== 'boolean' || typeof r.solo !== 'boolean' || (r.step === 3 && !r.completions)) invalid();
      clean.records[key] = { step: r.step, completions: r.completions, assisted: r.assisted, solo: r.solo };
    }
    for (const [subject, key] of Object.entries(value.paths)) {
      if (!subjects.includes(subject) || !keys.has(key) || !clean.records[key] || !key.startsWith(subject + '-')) invalid();
      clean.paths[subject] = key;
    }
    if (clean.current !== null && !clean.records[clean.current]) invalid();
    return clean;
  }
  const api = {subjects, bands, fresh, newRecord, validate};
  scope.WWSchoolState = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

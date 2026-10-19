# Strongbox 8.8.20.37 TEST — repair and review notes

## Cause and remedy
Headway used strict new-job canonicalization for archival export. One legacy NaN or infinity caused `nonfinite-data` before Blob/download creation. The repair leaves business validation strict and uses a separate archival codec. v1 finite backups stay compatible; v2 deliberately preserves the special values rather than setting zero/null, dropping fields, or skipping records.

## Test-first record
36 Strongbox contract tests include the reported failure and adverse cases. Against Headway the initial set had 30 expected failures and four existing passes. The first written test file contained an async-arrow syntax error; that was corrected before interpreting the red run. The encoder then passed the new functional tests. A new supported-depth test exposed the greater nesting of the wire representation; a separate bounded envelope budget corrected it (red then green).

The actual owner-page test suite first exposed the missing legacy-location display; the panel gained a text-only report. Tests cover successful export/file selection, bad data, scope, lost owner proof, and narrow phone layout. A final cache-query check found three helpers still carrying .36 query parameters; all three now carry the .37 identity. No behavior test was removed to turn a result green.

## Review scope
This is inline source review and automated regression, not a separately staffed audit. The environment provides no independent reviewer agent. Preservation tests compare all other runtime bytes after reversing only release-label changes, and compare the entire strict job prefix and owner logic outside the backup panel to Headway.

## Limits
No claim that every possible IndexedDB object is supported. Date, Map/Set, BigInt, Blob/typed arrays, accessors, hidden/symbol fields and cyclic data fail explicitly. The codec has bounded depth/node/array limits. Rehearsal is a temporary memory Map, not an actual IndexedDB restore. The exceptional fields in the user's browser remain unknown until the repaired UI reports them. No raw user backup is needed to reproduce the defect.

A full local-HTTP owner/real-IndexedDB test was attempted and blocked at navigation by `net::ERR_BLOCKED_BY_ADMINISTRATOR`. It was not bypassed or repeatedly retried. That pending test script is retained for a suitable environment and is NOT included in the passing-browser count.

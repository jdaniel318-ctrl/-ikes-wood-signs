# Woodwright architecture — 8.8.20.39

See START_HERE_WOODWRIGHT.md and WOODWRIGHT_REPAIR_NOTES.md. This is a TEST update over Wayfinder .38, not a production or native Safari certificate. No database, membership, commissioning or price changes.

## Preserved previous release documentation

# Wayfinder 8.8.20.38 TEST — Fleet Compass

Current installation instructions: **START_HERE_WAYFINDER.md**. Install only over complete Strongbox 8.8.20.37. No SQL, record cleanup, permission change or commissioning.

Search now validates the full protected source before comparing the exact selected-card set. Fleet Compass reuses project logos and the existing preview, owner, control and customer routes. Storage failures are observed separately; quota recovery is not claimed.

See WAYFINDER_REVIEW.md and WAYFINDER_TEST_RESULTS.json for scope and fresh verification limits.

---
## Preserved earlier release documentation (historical, not installation instructions)

# Strongbox 8.8.20.37 TEST — current architecture

This release changes only the archival section of `headway_contracts.js` and the backup panel in `owner.html`, plus release identifiers, instructions, and verification artifacts. `BlackFlagHeadway` remains the interface name for compatibility; new-job schemas and their strict canonicalization are unchanged.

`backup(projectId, rows)` validates supported archival types and exact-vessel rows, then emits v1 for ordinary JSON data or a typed v2 envelope for values JSON cannot preserve. v2 uses typed tuples for every value, not a magic property in arbitrary customer objects. Its exception path manifest is checked along with the payload hash. `readBackupRows` validates and decodes supported versions in memory; `rehearse` copies decoded rows into a new Map, re-encodes and compares values, and returns media/count/exception diagnostics. None of these methods accesses a database or network.

The UI retains its existing exact-owner gate before and after asynchronous reads. It downloads only after an internal rehearsal, and it clears stale diagnostic results on another attempt. Both buttons are disabled while work is unresolved. It renders diagnostic order IDs and field paths using textContent, not HTML. Files larger than the existing 100 MB check limit are explicitly held. It never imports into original IndexedDB.

Other runtime files differ only in version/seal/label strings. Helper cache queries are updated to the Strongbox identity. Authorization, new-order validations, camera/rendering logic, membership, business namespaces, and original artwork remain unchanged. The old Headway build brief remains a labeled planning document for the preserved HouseHull roadmap, not a new estimator launch.

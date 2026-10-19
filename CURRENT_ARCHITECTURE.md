# Strongbox 8.8.20.37 TEST — current architecture

This release changes only the archival section of `headway_contracts.js` and the backup panel in `owner.html`, plus release identifiers, instructions, and verification artifacts. `BlackFlagHeadway` remains the interface name for compatibility; new-job schemas and their strict canonicalization are unchanged.

`backup(projectId, rows)` validates supported archival types and exact-vessel rows, then emits v1 for ordinary JSON data or a typed v2 envelope for values JSON cannot preserve. v2 uses typed tuples for every value, not a magic property in arbitrary customer objects. Its exception path manifest is checked along with the payload hash. `readBackupRows` validates and decodes supported versions in memory; `rehearse` copies decoded rows into a new Map, re-encodes and compares values, and returns media/count/exception diagnostics. None of these methods accesses a database or network.

The UI retains its existing exact-owner gate before and after asynchronous reads. It downloads only after an internal rehearsal, and it clears stale diagnostic results on another attempt. Both buttons are disabled while work is unresolved. It renders diagnostic order IDs and field paths using textContent, not HTML. Files larger than the existing 100 MB check limit are explicitly held. It never imports into original IndexedDB.

Other runtime files differ only in version/seal/label strings. Helper cache queries are updated to the Strongbox identity. Authorization, new-order validations, camera/rendering logic, membership, business namespaces, and original artwork remain unchanged. The old Headway build brief remains a labeled planning document for the preserved HouseHull roadmap, not a new estimator launch.

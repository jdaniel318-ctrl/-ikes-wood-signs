# SDD ledger — plan: KEEPHAVEN_PLAN.md
Ruling: use an isolated extraction of the immutable .88 full backup rather than Git worktree scripts — this is an archive-based project with no Git repository — cost if wrong: source history must be recovered from the preserved ZIPs.
Ruling: proceed with the narrow repair without another design approval — repeated make-it-happen instructions authorize fixes and the user prefers reviewed upload ZIPs — cost if wrong: user may choose not to upload the build.
Pre-flight: Task 1 APIs feed Task 2 Engine handlers; both require a throwing guard, exact verified file and snapshot identity. Task 3 runner packages root-only additions. No conflicts.
Task 1: complete — missing archive API RED, 13/13 archive behavioral cases GREEN; existing 11/11 legacy preservation cases GREEN.
Task 2: complete — missing draft capture and missing handler RED; 6/6 real-handler/capture cases GREEN; app syntax checked.
Ruling: general rescue names the dedicated archive exclusion instead of copying opaque raw archive strings through credential redaction — exact archive files are exported from the archive panel — cost if wrong: a user must save the separate archive file as well.
Final: Ruling: regrade cleanup cancellation as Important — a newly introduced unhandled rejection in a recovery action merits correction — cost if wrong: small extra patch and focused regression test.
Final: fixed restore/migration interaction — absent/incomplete/unreadable marker RED→GREEN; complete marker permits restore.
Final: fixed invalid archive blocking valid archives — core and UI RED→GREEN.
Final: fixed lock-time cleanup null dereference — cancellation RED→GREEN.
Final: Ruling: native iPad behavior remains pending — controlled Chromium checks cannot certify Safari — cost if wrong: device behavior may differ.
Final: Ruling: retain external file requirement — browser commit/readback does not guarantee survival of eviction or power loss — cost if wrong: local archive alone may not survive.
Final: Ruling: document close-other-tabs guidance — LocalStorage has no atomic cross-context compare-and-delete — cost if ignored: concurrent edits between synchronous operations are not fully excluded.
Final: Ruling: leave unrelated startup writes unchanged — narrow repair preserves established fleet behavior while gating the new restore interaction — cost if wrong: other existing quota problems may persist.
Final: Ruling: defer package claims until proof completes — source review cannot certify final ZIPs — cost if wrong: none; packaging remains a release gate.
Task 3: verification complete — 34/34 integrated suites GREEN after all review fixes. Native IndexedDB move/readback/reload/restore and responsive controls checked with synthetic fixtures. Browser download event timed out; no saved-download claim. Native Safari acceptance pending. Packaging gate follows.

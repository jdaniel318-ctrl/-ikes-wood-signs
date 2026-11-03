# Keephaven implementation plan
Goal: free constrained LocalStorage only after exact older Ike records have a verified saved file and a verified on-device archive, without treating old work as current work.
Architecture: extend the existing narrow legacy module with an IndexedDB archive store and guarded, explicit move/restore operations. Use existing Engine authentication and navigation tokens. No startup migration. No remote writes.
Tech stack: browser JavaScript, IndexedDB, static HTML/CSS, Node offline suites, managed browser QA.
Spec: latest device evidence shows verified 2.6 MB older-records file, a differing order and two absent drafts; retain all three while moving them out of LocalStorage only on explicit user action.

## Global constraints
Only the three existing allowlisted older keys. No writes to current orders, drafts, project registry, authority, quarantine, or admissions. Immutable archive snapshots; no archive deletion. Commit then exact readback then recheck source before removing. Timeout/auth/navigation changes must prevent later source removal. All failures accurately reported. Restore only absent legacy keys, never overwrite another value. Saved file remains necessary; browser archive is not a complete backup. Native Safari is a field-test limit. Existing .88 full ZIP stays immutable; new .89 ZIP, source backup, rollback. Root-only source changes and <85 upload files.

## Review focus
1. IndexedDB request success versus transaction commit; abort, blocked open, timeout and late callbacks.
2. Session expiry, navigation and concurrent source changes across asynchronous boundaries.
3. Partial removal/restoration, quota failures and misleading success messages.
4. Archive persistence/discovery/export and collision-free immutability after reload; no promotion into current work.
5. Rescue export coverage and secrets: include the known older draft keys, do not accidentally expose raw archive strings in a supposedly redacted export.

## Task 1: guarded archive core
Files: fleet_legacy_recovery.js; VERIFY_KEEPHAVEN_CORE.cjs.
Interfaces: moveToArchive({storage,indexedDB,entries,savedText,guard,build,timeout}); listArchives({indexedDB,guard}); readArchive(id,options); restoreArchive(id,{storage,indexedDB,guard}). Each guard throws on revoked authority/navigation. Archive database blackFlagOlderIkeArchiveV1, snapshots store. Content-derived id, envelope per-entry digest verification.
RED: Node behavioral tests call missing API and fail assertion. GREEN: exact durable snapshot precedes deletion; list/read survive new API calls; restore absent keys only; failures retain archive and source as applicable. Tests use a transactional in-memory IndexedDB harness only for fault injection; managed browser uses native IndexedDB.

## Task 2: explicit Engine workflow and rescue coverage
Files: app.js, index.html, fleet_storage_safety.js, VERIFY_KEEPHAVEN_UI.cjs.
Interfaces: reuse existing prepared snapshot + verified file, require fresh session token, offer archive button after verification. Separate archive list refresh/export/restore with safe DOM rendering. No automatic DB creation on list. Known draft keys included in general rescue; archive exports remain dedicated exact files with explicit general-rescue exclusion.
RED: extracted real handlers and rescue capture fail expected behavior. GREEN: auth/stale navigation prevent effects; export/download and restore controls work; failures visible.

## Task 3: QA, review, package
Files: release metadata, VERIFY_RELEASE_ALL.cjs, KEEPHAVEN_GUIDE.md, KEEPHAVEN_LEDGER.md, KEEPHAVEN_EVIDENCE.json.
Run core and UI tests, managed native IndexedDB roundtrip/failure UI checks, full integrated suite, final fresh review, regression fixes if needed, then sealed build and package reconstruction/rollback checks. Expected all suites green and no source changes from verification. Persist final artifacts.

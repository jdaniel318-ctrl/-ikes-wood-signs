# Dark Sky 8.8.17.11 — Release Acceptance

## Evidence scope

Functional tests executed the shipped ledger JavaScript in Chromium with isolated synthetic records and a serialized in-memory IndexedDB adapter. Layout used the real browser renderer at 1366×1024, 1024×1366 and 390×844. Native IndexedDB and native download/reload behavior were NOT tested in this environment. No test data, simulated storage, authentication stubs, or export interception ships in the release.

The original-field fixtures were reconstructed for testing from the supplied current CSV and screenshots. They are not copies of the iPad's inaccessible historical database and must not be treated as recovered user evidence.

## Passing isolated cases

1. **Recovery and discoverable corrections — PASS.** Four recovered history records; two transaction buttons; legacy approval not promoted.
2. **Preview and cancel are read-only — PASS.** Complete durable book unchanged.
3. **No-op blocked — PASS.** No needless history record added.
4. **Append-only correction and double-tap guard — PASS.** Exactly one new correction; initial four raw records byte-equivalent as objects; $2 unchanged; queue zero.
5. **Fresh-document reconstruction and recovery idempotence — PASS.** Five records and corrected values persist; no re-import or original-history enrichment.
6. **Both exports reconcile — PASS.** CSV two rows/$2/current ready statuses; full history five exact raw records including old mistake, lineage and valid SHA-256.
7. **Separate approval requires evidence and attestation — PASS.** Unchecked form cannot stage approval; checked preview still does not save; cancellation leaves five records.
8. **Authority rechecked at confirmation — PASS.** Locked Captain session creates no correction.
9. **Stale preview across tabs rejected — PASS.** Newer correction retained; stale tab adds nothing.
10. **Concurrent independent corrections — PASS.** Two parallel saves survive; no lost ledger write.
11. **Write failure rollback and retry — PASS.** Forced storage failure adds no record; retry adds exactly one correction.
12. **Queue preview and completion — PASS.** Legacy approval exits via explicit Ready selection; one previewed correction; totals unchanged.
13. **Approval save and export labels — PASS.** Evidence, attestation and exact prior revision retained; CSV does not label approval independently verified.
14. **All records reachable — PASS.** Pagination exposes all 32 transactions with a correction action.
15. **Browser layout ipad-landscape — PASS.** Correction preview and export controls within viewport; vertical scrolling remains available.
16. **Browser layout ipad-portrait — PASS.** Correction preview and export controls within viewport; vertical scrolling remains available.
17. **Browser layout iphone — PASS.** Correction preview and export controls within viewport; vertical scrolling remains available.
18. **Safe CSV and lossless scoped JSON — PASS.** Formula-like fields escaped only in CSV; exact multiline/raw text remains in JSON; other books excluded; foreign key rejected.

## Packaging and static gates

- **File budget and production-only payload — PASS.** 85 flat production files; no fixtures or harness
- **Inventory — PASS.** 85 files match inventory exactly
- **JavaScript syntax — PASS.** 10 external JavaScript files parse
- **JSON syntax — PASS.** 48 JSON / webmanifest files parse
- **Inline script syntax — PASS.** 5 inline JavaScript blocks parse
- **Static HTML identities — PASS.** 568 static IDs checked; no duplicates per page
- **Static local references — PASS.** 41 HTML / CSS local references exist
- **Required runtime files — PASS.** 45 deployment runtime dependencies present
- **Release identity — PASS.** 9 page/runtime/manifest sources agree on build; declared seals match; active ledger and Captain header match
- **Active ledger wiring — PASS.** Verified loader points to simple_books.js and its stylesheet, not the dormant legacy module
- **Service worker contract — PASS.** Identity sentinel only; no fetch handler added
- **Protected baseline — PASS.** All media/brand assets, SQL files, owner page, core/project runtime, style registry and fleet identity contracts are byte-identical to the baseline. This is a file comparison, not a full-site runtime regression result.
- **Checksum and extracted archive — PASS.** 84 SHA-256 file checksums, 85 inventoried files and archive CRC verified again from the extracted final ZIP. CHECKSUMS.sha256 is excluded from its own hash list.
- **Handoff shape — PASS.** One top-level DarkSky881711-LedgerCloseout folder; matching ZIP name; no test harnesses or fixtures. All ZIP entries use the same release timestamp.

Release packaging time: 2026-09-25T23:40:09+00:00.

## iPad field gates — not yet passed for this build

- [ ] Existing site opens on 8.8.17.11 without mixed-build recovery or cross-project first paint.
- [ ] Engine/Captain authentication works through the normal protected route; Admiral authority remains separate.
- [ ] Correct the intended original test entry using only its reference and review state, with a reason and a preview.
- [ ] Exactly one correction is saved; $2.00 Money In, $0.00 Money Out, $2.00 remaining, and To Check 0.
- [ ] Same records and corrected values remain after a normal Safari refresh and sign-in; original IDs do not change.
- [ ] Actual CSV download has two current rows; actual full-history JSON has five records for the known four-record starting fixture.
- [ ] Every old value remains in history; no new payment, deleted original, or duplicate correction appears.

Cloud synchronization, authenticated server backup, independent accountant verification, and restore-from-export are outside this release and remain unverified.

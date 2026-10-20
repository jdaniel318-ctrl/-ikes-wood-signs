# Woodwright 8.8.20.39 — current TEST report

See WOODWRIGHT_TEST_REPORT.md, WOODWRIGHT_TEST_RESULTS.json, and the external final package proof. 212 Node / 156 isolated Chromium / 13 package tests. Full HTTP boot blocked; native Safari pending; no production or quota certification.

## Prior release report (historical)

# Wayfinder 8.8.20.38 TEST — Fleet Compass

Current installation instructions: **START_HERE_WAYFINDER.md**. Install only over complete Strongbox 8.8.20.37. No SQL, record cleanup, permission change or commissioning.

Search now validates the full protected source before comparing the exact selected-card set. Fleet Compass reuses project logos and the existing preview, owner, control and customer routes. Storage failures are observed separately; quota recovery is not claimed.

See WAYFINDER_REVIEW.md and WAYFINDER_TEST_RESULTS.json for scope and fresh verification limits.

---
## Preserved earlier release documentation (historical, not installation instructions)

# Strongbox 8.8.20.37 TEST — final verification report

Checked: 2026-10-18T23:50:18.801257+00:00. Narrow backup repair on complete Headway 8.8.20.36. Not a production launch, native Safari certification, cloud backup or database restore.

## The repair
Headway's archive export called strict new-job canonicalization and rejected legacy NaN/infinities before download. Strongbox separates archival preservation from business validation. JSON-safe records retain the old v1 format. Records needing lossless special-value representation use `strongbox-business-backup-v2` with typed tuples and a checked exception-location manifest. Old v1 archives remain readable. New v2 files require Strongbox or a compatible reader.

NaN, both infinities, negative zero, undefined values, sparse arrays and null-prototype plain objects are preserved rather than corrected, dropped or changed to a normal number. Original source and preview strings, exact wording and existing fields are retained when present. New-job prices and measurements still reject invalid numbers. Unsupported types fail explicitly with a field path; arbitrary IndexedDB type support is not claimed.

The actual owner export and file controls show an escaped list of affected order IDs/paths. The existing owner gate is rechecked before and after asynchronous reads. No export/rehearsal handler writes to the original order database. A downloaded-file check reconstructs only an in-memory Map; it does not import into IndexedDB or verify disaster recovery.

## Fresh passing checks
- **167 Node checks:** Strongbox archive contracts 36; current release/preservation 22; inherited Headway job contracts 49; Workhorse 24; SteadyHand 20; Ironbound 16.
- **112 isolated Chromium scenarios:** Strongbox actual owner controls 11; inherited Headway app 16, viewport 13, owner backup 2, brief 3; SureFoot 21; Workhorse UI 21; SteadyHand UI 19; Ironbound UI 6.
- **13 offline package-verifier unit tests.** Final extracted ZIP checks are recorded separately in the external Package Proof.

The 26-row synthetic case retains 26 source strings and 26 preview strings, preserves three nested NaN/infinity values, includes completed work, excludes a foreign-business row, and leaves the fixture's original records unchanged. These are test records, NOT access to the user's 26 saved orders. The real affected fields are still unknown until the repaired panel reports them.

Negative tests cover wrong scope, conflicting namespace, duplicated IDs, altered payload or exception manifest, invalid JSON/schema, malformed typed tags, marker-like literal data, unsafe keys, unsupported types, cycles, bounded nesting, stale owner proof and diagnostic HTML injection. Strict job creation/approval, namespace binding, permissions, pricing behavior, photo rendering and closed commissioning paths remain unchanged.

## Preservation and packaging
Every one of Headway's 148 filenames is retained. Original 16 images, five SQL files, A/B registry/foundry and HouseHull plan are unchanged. Beyond the two backup integration files, executable changes are release identity only. The four current model latches and whitespace policy receive a build-label update only; their predicates are unaltered and tested. Original historical files and prior evidence remain distinct from current results.

The upload is a delta for **Headway .36 only**, with a matching single folder and <=85 files. A separate full snapshot is provided. Three checksum ledgers, manifest/runtime/model hashes, safe ZIP entries and exact reconstruction are verified. Hashes show internal consistency, not authenticity or server authorization.

## Problems encountered and disposition
An initial new test had an async-arrow syntax error and was corrected before the meaningful red run. The unchanged baseline then failed the new legacy-data cases. A supported-depth check exposed typed-wire depth expansion and drove a separate bounded wire-validation budget. Actual UI tests exposed missing location reporting before it was added. The inherited release check found four model build latches still at .36; only those labels were updated. A concurrent browser runner timed out before two suites finished; those suites were rerun sequentially and passed in full. No incomplete run was counted as passed.

**Full local HTTP startup was attempted once and blocked by the environment with `net::ERR_BLOCKED_BY_ADMINISTRATOR`.** It was not bypassed. The retained VERIFY_STRONGBOX_BOOT.py script is an open check, not included in the passing scenario count. Browser passes use shipped source/HTML/CSS with synthetic authentication/network/storage boundaries, not a fully hosted boot or actual production IndexedDB restore. No independent reviewer agent is available; this is inline source review plus automated evidence.

## Live-data and authority limits
No user Safari database, live server, account password, membership, invitation, commissioning operation, hosted deployment, subscription or plugin permission was changed. The app's existing browser-local storage still needs private backup. Real stock/species authorization and new complete-job live/Sea Trial activation remain held as in Headway. Headway's residual Orders opening-position issue is not declared fixed by this backup patch. HouseHull is not newly commissioned.

Follow START_HERE_STRONGBOX.md: upload the small delta, export a private JSON and confirm its download, check that file in isolation, and report the status screenshot. Do not clear Safari data, run SQL, alter orders to force an export, or upload customer backups to GitHub.

## Reproduce
Run `node VERIFY_STRONGBOX.cjs .`, `node VERIFY_STRONGBOX_RELEASE.cjs .`, `node VERIFY_HEADWAY.cjs .`, `node VERIFY_WORKHORSE.cjs .`, `node VERIFY_STEADYHAND.cjs .`, `node VERIFY_IRONBOUND.cjs .`, and `python VERIFY_PACKAGE_TESTS.py`. Run the nine current browser scripts with release/output paths. Old .36-only VERIFY_HEADWAY_RELEASE, .35-only VERIFY_KEELMARK and earlier target-label verifiers remain historical; their behavioral assertions are carried into the explicit .37 release checker.

# Truebound 8.8.20.91 — targeted boundary repair

This update adds a reviewed repair for missing Local ledger and Database mirror boundary records. Your .90 diagnostic identified HouseHull (`househull-exterior`) and VoyageKeeper Recovery Test (`bf-p-42be92cbac12`). Their registry and current-session checks passed; the two stored copies were missing. That report does not establish the historical cause or prove today's admission evidence is sufficient.

## Three steps on the iPad

1. Extract **DarkSky882091-Truebound-Upload.zip**. Upload every file inside its single folder to the existing repository root, replacing matching files and keeping everything else. Commit, wait for Pages deployment, then confirm **8.8.20.91 · TRUEBOUND** in the Engine. Keep your saved private recovery files.
2. Close other Black Flag tabs. Open **Configure Engine → Inspect Ship Integrity → Review missing boundary repair**. Expect the two vessels above and additions for **Local ledger and Database mirror**. Review performs no saves.
3. If those exact additions are offered and the saved identity/admission checks pass, tap **Confirm missing boundary repair** once. Send a screenshot of the result. If blocked, partial, or different vessels appear, send that screen before taking another action.

## What the repair checks

The current registry and session must agree on the required immutable boundary fields, with unique identities. The local and database admission records must both be present, valid and equal; both fleet manifests must include each target. Retirement or admission-review flags block the operation. Missing proof, malformed evidence, and conflicting existing boundary records stop repair; this tool cannot create admission or change authority.

Only absent boundary copies are added. An existing valid copy is reused exactly; a pair is generated from the established schema only when both copies are absent. Existing data is rechecked immediately before each phase. An append-only metadata receipt accompanies the database commit. Orders, customers, projects, admission records, quarantine and archives are not rewritten by the repair.

The database transaction must complete before a local write is attempted. There is no atomic transaction shared by IndexedDB and LocalStorage. If the database saves but the local phase fails or is interrupted, additions remain and the result is partial. A fresh inspection and review can finish only the remaining missing side. Keep other tabs closed: LocalStorage does not provide an atomic cross-tab comparison-and-replace operation.

Both stored copies must read back correctly before the app reports missing boundaries verified. A separate, fresh whole-fleet inspection can still show other findings. The earlier quarantined order reference is preserved and may remain as an informational finding. Repair does not approve a customer experience or make a vessel live.

## Release files

- **Upload.zip**: changed/new root software files over the exact .90 Glasswake baseline. This is the file to install.
- **FullBackup.zip**: complete .91 application software, source, tests and release documents. It does not contain an iPad business-data backup, Supabase data, private media or device drafts.
- **DarkSky882090-RollbackFrom882091.zip**: prior software files. Rollback does not reverse confirmed boundary additions or restore business records; newly added tooling remains unused by the old loader.
- **PackageProof.json**: archive hashes, file counts, exact patch reconstruction and software rollback checks.

Do not clear Safari website data to install the update. No automatic repair, migration or deployment is included. Native iPad Safari acceptance remains pending until you perform the three steps above.

## Verification and reproduction

The focused suite covers corruption, quota errors, transaction aborts/timeouts, stale evidence, navigation changes, partial saves, retries and saved readback. Independent review findings and their failing-then-passing regressions are documented in TRUEBOUND_REVIEW.md. Final offline evidence is in TRUEBOUND_EVIDENCE.json; the package builder reruns all listed suites against the sealed tree.

For a synthetic native-browser fixture, run `python3 -B BUILD_TRUEBOUND_BROWSER_QA.py /absolute/new-qa-directory`, then start the managed preview for that directory. It uses the production module and actual handlers with a disposable synthetic database on the preview origin. Never host this fixture at the live business origin. It is not included in the runtime loader.

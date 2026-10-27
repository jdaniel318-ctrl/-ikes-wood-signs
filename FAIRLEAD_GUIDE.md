# Fairlead 8.8.20.68 — current release
**Purpose:** repeatable software release packaging plus private, truthful startup measurements.
Supported baseline: **Cleardeck 8.8.20.67** (630 files; SHA-256 `74ab64a6582a23d50a88711b53d3278620cfbf97da28168cd2dd4d10bdcef410`).

## Upload — exactly the usual routine
Use `DarkSky882068-Fairlead-Upload.zip` (or byte-identical `Fairlead68.zip`).
Extract, open the one folder, upload ALL inner files to the existing repository root, replace matching files, retain everything else, and commit.
Do not upload the ZIP itself, nest its folder, upload the full backup as a patch, clear Safari data, run SQL, or create an appointment.
Confirm **8.8.20.68 · FAIRLEAD** after deployment. Keep the previous full source as a rollback baseline.

## Delivered
1. `BUILD_RELEASE.py` verifies a sealed candidate against the exact supported prior archive, runs the offline suites and produces matching Upload, FullBackup, software Rollback and evidence outputs. No hand-assembled patch.
2. The builder refuses missing/modified/unlisted files, wrong baselines, removals, symlinks, unsafe archives, failed tests, in-source outputs and source changes during verification.
3. Engineering Systems → existing Engine performance area → **STARTUP MEASUREMENT · THIS PAGE** shows the verified loader interval, file/hash checks, worker/safe-recovery and verified-script execution. A deliberate button exports a small local JSON.
4. The measurements remain in page memory, not business storage. No identity, token, password, PIN, query string, full URL, customer data or raw error is exported. No automatic telemetry or live-service writes are added.
5. Reproducible source-size and optional loopback-browser measurements are available before any future dependency/loading optimization.

## What did NOT change
No auth endpoint, session key, appointment, permission, business workflow, data store, font geometry, delivery integration, scheduler, invoice/ledger rule or encryption behavior changed.
All prior files are retained. Root runtime bodies other than index.html differ only where the existing release identity contract requires a version/seal label change.
The current runtime file dependencies and execution order are preserved. No faster-loading claim is made.
Face ID/passkeys are not implemented. Cleardeck AutoFill groundwork is retained; native behavior remains a device check.
No workflow is activated and no automatic deployment, GitHub write, Supabase query or migration is part of this release.

## Rebuild and verification for the builder — not required on the iPad
Requires Python 3.11+ and Node 22+. No third-party dependency for offline/package checks.
```
node VERIFY_FAIRLEAD_ALL.cjs . ../fairlead-check-evidence
python3 -B BUILD_RELEASE.py . --baseline /path/to/DarkSky882067-Cleardeck-FullBackup.zip --out ../new-fairlead-release-output
```
The output folder must be new and outside the source. A failed verification blocks the release; failure logs are retained separately.
The packager validates the existing seals; it does NOT automatically bless altered files by regenerating hashes.
`SEAL_FAIRLEAD_RELEASE.py` is a separate explicit preparation tool for the reviewed candidate. It changes only local release metadata.
Checksums prove byte consistency, not author authenticity, security certification or production readiness.

## Startup measurement scope
A report describes ONE page load, not a cold/warm benchmark, sign-in latency or full workflow. The loader interval begins after the HTML parser reaches the verified loader; navigation fields are separate.
The worker phase can include existing automatic stale-worker recovery. Manual clean-retry reload begins a new report.
Missing timing APIs report unavailable/null; failed verification reports HOLD, not completion.
Clock values are browser observations, not a promise of speed. Do not compare different networks/devices as an optimization result.
```
python3 -B MEASURE_CLEARDECK_STARTUP.py . --out ../fairlead-source-inventory.json
python MEASURE_FAIRLEAD_STARTUP.py . --out ../fairlead-browser-measurements.json --runs 3 --executable /usr/bin/chromium
```
The browser command requires Python Playwright 1.57.0 and a compatible Chromium installation. It uses an isolated loopback test site and blocks all other hosts. Any blocked/incomplete run is explicitly NOT MEASURED.
Account/browser fixture tests and native Safari checks remain separately labeled; mocks never become server receipts.

## Software rollback only
The generated rollback ZIP restores the changed prior .67 software and its matching manifests together. Keep extra .68 tooling inert; .67 does not execute it.
**Do not restore old business data** for a software rollback. Never re-enable revoked authority to make a test pass.
A rollback overlay leaves the added .68 tool files; strict full-tree .67 inventory audits require a clean .67 source checkout, while its runtime uses the restored .67 manifests and required bodies. Do not delete files on the live site to force an audit green.
FullBackup is the complete application source; it is NOT a backup of server/customer/media records or local-device drafts.

## Native acceptance
One check: enter Engine .68, open Engineering Systems, expand Startup Measurement and download its report. No sign-design/password/appointment repetition is needed.
No complete security audit, private-media recovery, live provider delivery, CNC cut or database restore is certified here.

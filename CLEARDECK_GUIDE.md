# Cleardeck 8.8.20.67 — Current release

Current upload: `DarkSky882067-Cleardeck-Upload.zip`.
Matching full-source archive: `DarkSky882067-Cleardeck-FullBackup.zip`.
Supported baseline: the supplied Ironhaven 8.8.20.66 source (619 files).

Read `UPLOAD_THIS_ONE_BUILD.md`, `CLEARDECK_GUIDE.md`, `CURRENT_BASELINE.json`, and `CLEARDECK_EVIDENCE.json` first.
Run `node VERIFY_CLEARDECK_ALL.cjs . ../cleardeck-check-evidence` on the complete release.
This is an incremental cleanup, not a new platform or database migration.

## Delivered scope

- CD-01: current release documents, web-app manifest, inventory/hashes and a one-command offline check runner. The existing installed-app manifest incorrectly pointed to .64; it now points to .67.
- CD-02: truthful empty/pending/suspended/revoked account labels and specific password-error remedies. Server error codes are used without echoing arbitrary raw payloads. Password success still requires matching account confirmation.
- AutoFill groundwork: explicit username/current-password/new-password names and metadata, account identification in the password form, and a shared-device reminder. Passkeys and Face ID authentication are NOT implemented. Native Apple Passwords behavior is not certified by Chromium tests.
- CD-03: repeatable source inventory and optional cold/warm public-entrypoint measurement harness. No loading dependency was removed; no latency improvement is claimed.

## What remains untouched

All prior source filenames; all existing data stores and server authorization policies; Admiral and owner/Captain separation; appointments; order records; email provider integration; sign geometry/fonts/exports; quotes/invoices; scheduling; ledgers; recovery encryption; and optional game programs.
No live API call, account creation/password update, email, migration, permission change, production deployment or business-record mutation was performed by this build.

## Verification commands

`node VERIFY_CLEARDECK_ALL.cjs . ../cleardeck-check-evidence`

`python VERIFY_CLEARDECK_BROWSER.py . --out ../cleardeck-browser-evidence --executable /path/to/chromium`

`python MEASURE_CLEARDECK_STARTUP.py . --out ../cleardeck-source-inventory.json`

For cold/warm public entrypoint timing in an unrestricted local test environment, add `--browser --runs 3 --executable /path/to/chromium`. Authenticated scheduling and document export timings remain separate acceptance tasks.
Python browser tests require `playwright==1.57.0`; use a clean test environment, never production credentials. The browser harness uses shipped DOM/scripts with synthetic URL/history/storage/Auth because browser URL navigation is blocked in the build environment. It is not hosted end-to-end or native Safari proof.

## Check-only automation

`CLEARDECK_CHECK_ONLY.workflow.yml` is an inert root template, not an enabled workflow. It has read-only repository permission and no deployment step. The existing historical deletion workflow was not run or changed.
There is intentionally no automatic promotion of this candidate to production.

## Rollback

Retain Ironhaven .66 before uploading. A software rollback restores the prior changed runtime and matching manifests together. Extra .67 documentation/test files need not be used by .66.
Do not restore old business data merely to roll back the UI. Do not reactivate revoked memberships. No server rollback is required because this build changes no server schema or data.

## Native acceptance still pending

iPad Safari/account autofill, the hosted first load and installed-web-app update, and any future real password change must be checked on the actual device. Mock success is not a production password-change receipt.
Independent backups, actual server restoration and direct-API revocation testing are not completed by this cleanup.

## Primary references consulted

Apple Password AutoFill HTML input guidance: https://developer.apple.com/documentation/security/enabling-password-autofill-on-an-html-input-element
Supabase Auth error codes: https://supabase.com/docs/guides/auth/debugging/error-codes
These explain metadata and error meanings; they do not certify this release.

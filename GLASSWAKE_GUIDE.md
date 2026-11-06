# Black Flag 8.8.20.90 · Glasswake

Glasswake makes the existing integrity inspection actionable. It shows each affected vessel by name and ID, the failing source, and the specific boundary field that needs investigation. It does not repair or dismiss the two mismatches shown on the Captain’s iPad.

## Install and inspect

1. Extract **DarkSky882090-Glasswake-Upload.zip**. Open its one folder and upload every file inside to the existing GitHub repository root, replacing matching files and keeping all other files. Commit the upload.
2. After GitHub Pages finishes deploying, open Black Flag in the same Safari browser and confirm **8.8.20.90 · GLASSWAKE**. Open **Configure Engine → Inspect Ship Integrity**.
3. Capture the affected project cards and use **Download integrity report** to save `blackflag-882090-integrity-diagnostic.json`. Those results identify the next repair to investigate.

Keep your saved older-records archive and rescue files. Installation requires no clearing of Safari data, restoration, cleanup, or permission changes.

## What the report means

| Check | Inspected source |
| --- | --- |
| Project registry | Stored canonical project record |
| Local ledger | Project envelope held in LocalStorage |
| Database mirror | Project envelope held in database settings |
| Current session | Project record currently loaded in the Engine |

**PASS** means that source met the existing required boundary-field checks. **NEEDS ATTENTION** identifies failing field names; **MISSING** means a required record was absent. **INSPECTION INCOMPLETE** means some sources could not be checked. No result authorizes publication or certifies a complete backup.

The cards concentrate on failed boundary checks. **All findings** contains every reported issue, including registry, order-ownership and informational quarantine findings. Project-scoped findings show both name and ID.

The diagnostic download contains project labels, IDs, build, inspection time, finding codes, check outcomes and failing field names. It excludes raw customer/order records, credential fields, raw field values and free-text issue details. Project labels and IDs may still identify your businesses; review before sharing. It is not a rescue file or backup.

The new displayed/downloadable report stays in memory and clears when Engine access locks or a customer project opens. Late results are discarded after navigation. This is not a promise that all pre-existing application caches are erased.

## Files in this delivery

- **Upload ZIP:** changed/new root files for the complete 8.8.20.89 Keephaven installation.
- **FullBackup ZIP:** complete 8.8.20.90 application source. It contains no device business-data backup.
- **Rollback ZIP:** previous 8.8.20.89 versions of changed software files. Extract and upload its inner files to the root to roll back software. Added diagnostic test/guide files may remain unused. No business data or permissions are restored.
- **PackageProof.json:** package checksums and exact reconstruction/rollback results.

## Verification and limits

The release is checked with the existing offline suites plus new diagnostic regressions, independent code review and a controlled browser fixture using the actual report renderer and styles. Tablet-width and phone-width checks are responsive layout evidence, not native iPad Safari acceptance. Final package proof records the exact ZIPs tested.

No automatic envelope repair, customer publication, cloud upload or backend migration is included. Existing Harborlight backend prerequisites remain pending. The two device mismatches need a fresh inspection after installation before choosing a repair.

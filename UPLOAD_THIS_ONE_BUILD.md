# Cleardeck 8.8.20.67 — Current release

Current upload: `DarkSky882067-Cleardeck-Upload.zip`.
Matching full-source archive: `DarkSky882067-Cleardeck-FullBackup.zip`.
Supported baseline: the supplied Ironhaven 8.8.20.66 source (619 files).

Read `UPLOAD_THIS_ONE_BUILD.md`, `CLEARDECK_GUIDE.md`, `CURRENT_BASELINE.json`, and `CLEARDECK_EVIDENCE.json` first.
Run `node VERIFY_CLEARDECK_ALL.cjs . ../cleardeck-check-evidence` on the complete release.
This is an incremental cleanup, not a new platform or database migration.

## Upload

Extract the Upload ZIP. Open its single folder and upload EVERY FILE INSIDE into the existing repository ROOT. Replace matching files; keep all others. Do not upload the ZIP itself or nest its folder under the website.
The patch must be applied to .66, not an arbitrary older release. All patch files, including manifests and checksums, are required together.
Do not clear Safari data, run SQL or activate the historical dry-dock deletion workflow.

After deployment, reopen the Engine and confirm `8.8.20.67 · CLEARDECK`. The current integrity gate must stay enabled.

## Field acceptance

Use the existing account session where possible. Check that a roster without assignments says no active vessel assignments and Account Security remains available.
Keep passwords out of screenshots. Do not deliberately change a password merely to test wording. Native AutoFill can be checked during the next normal sign-in.
No repeat sign-design or two-board trial is required for this cleanup.

# Fairlead 8.8.20.68 — Current release
Current upload: `DarkSky882068-Fairlead-Upload.zip` (also delivered as byte-identical `Fairlead68.zip`).
Matching complete source: `DarkSky882068-Fairlead-FullBackup.zip`.
Baseline: Cleardeck 8.8.20.67, 630 files. No deletions, database operations or permission changes.
Read `FAIRLEAD_GUIDE.md`, `CURRENT_BASELINE.json` and `FAIRLEAD_EVIDENCE.json`.
Check: `node VERIFY_FAIRLEAD_ALL.cjs . ../fairlead-check-evidence`.
Package: `python3 -B BUILD_RELEASE.py . --baseline /path/to/DarkSky882067-Cleardeck-FullBackup.zip --out ../new-fairlead-output`.

## iPad upload
Extract the Upload ZIP, open its one folder, and upload ALL inner files to the EXISTING repository ROOT. Replace matching files; keep everything else.
Do not upload the ZIP itself, the enclosing folder, or the full backup as the update.
Do not run scripts, SQL, cleanup, resets or new appointments for this update.
After GitHub deployment, check Engine **8.8.20.68 · FAIRLEAD**.
Open **Engineering Systems → STARTUP MEASUREMENT · THIS PAGE** within the existing performance section.
Download the startup report once. It contains timings and release identity, not personal or business content.
No old customer-design or password test needs repeating.

## Source continuity
The update is generated and reconstructed against the exact .67 archive.
FullBackup is complete software source, not Supabase business data or media.
A separate software-only rollback is provided; never restore data or revoked authority to roll back the UI.
No hosted workflow is activated; your upload routine is unchanged.

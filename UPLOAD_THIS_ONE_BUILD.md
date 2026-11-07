# Upload Signalman 8.8.20.99

Use `DarkSky882099-Signalman-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.99 · SIGNALMAN`. Do not clear Safari data, reset records or change permissions.
3. Apply SIGNALMAN_FLEET_HELP.sql once in Fleet Core to enable shared reports.

An owner can report a problem to their vessel’s appointed Captain. The Admiral can read the status and verification note. Test Center controls have their own space in the Legacy Plumbing and Signal Restoration previews.
The upload itself executes no database commands. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

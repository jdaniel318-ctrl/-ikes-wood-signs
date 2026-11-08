# Upload Pilotage 8.8.20.108

Use `DarkSky8820108-Pilotage-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.108 · PILOTAGE`. Do not clear Safari data, reset records or change permissions.
3. Open Operate vessels, find a business and return. In its authorized owner workspace, open a queued order from Today and use Back to Today.

A harbor entrance leads to vessel workstations. Business tools and learning have separate sections. Today shows active work, recognizes vessel intake statuses and opens a queued order directly.
The upload itself executes no database commands. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

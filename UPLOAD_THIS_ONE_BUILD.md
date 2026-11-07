# Upload Spinnaker 8.8.20.106

Use `DarkSky8820106-Spinnaker-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.106 · SPINNAKER`. Do not clear Safari data, reset records or change permissions.
3. In Workspaces & programs select Open Regatta, complete the Admiral entrance, then select Enter Sunset Harbor.

The Engine Room now offers Black Flag Regatta as an Admiral fleet-learning tool. A verified Admiral can open Sunset Harbor in a separate tab and compare practice runs in its Race log.
The upload itself executes no database commands. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

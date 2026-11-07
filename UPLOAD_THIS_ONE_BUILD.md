# Upload Flagstaff 8.8.20.103

Use `DarkSky8820103-Flagstaff-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.103 · FLAGSTAFF`. Do not clear Safari data, reset records or change permissions.
3. Open Admiral My Fleet on the iPad. After the PIN, check that the remembered email offers one sign-in. Continue to see Edit my sign-in email.

The Admiral can continue with the remembered sign-in email, edit it at the password step, or forget it on this device.
The upload itself executes no database commands. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

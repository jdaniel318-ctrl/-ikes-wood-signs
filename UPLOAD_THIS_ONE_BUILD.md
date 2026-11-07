# Upload Nameplate 8.8.20.100

Use `DarkSky8820100-Nameplate-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.100 · NAMEPLATE`. Do not clear Safari data, reset records or change permissions.
3. Open the Legacy Plumbing owner link in a signed-out tab to check the company name and email-first sign-in.

The owner page identifies known businesses before sign-in. Online owners choose an email before entering a password. An autofill change to the chosen email stops the attempt.
The upload itself executes no database commands. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

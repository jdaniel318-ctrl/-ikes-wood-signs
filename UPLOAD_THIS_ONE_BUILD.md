# Upload Slipstream 8.8.20.104

Use `DarkSky8820104-Slipstream-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.104 · SLIPSTREAM`. Do not clear Safari data, reset records or change permissions.
3. Open Admiral My Fleet on your iPad and enter the passage PIN. On a remembered device, a fresh sign-in now asks directly for your Admiral password.

After the passage PIN, a fresh Admiral sign-in on a remembered device asks only for the password. Fleet access still requires active server-verified Admiral authority.
The upload itself executes no database commands. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

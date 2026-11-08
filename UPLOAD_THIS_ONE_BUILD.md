# Upload Livery 8.8.20.109

Use `DarkSky8820109-Livery-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.109 · LIVERY`. Do not clear Safari data, reset records or change permissions.
3. Open a vessel’s Owner Workspace on iPad. Sign in, check the full business header on Today, then open Orders and check the same mark.

Owner workspaces display the vessel logo in the masthead, carry its colors into Today, and open at the business heading following sign-in.
The upload itself executes no database commands. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

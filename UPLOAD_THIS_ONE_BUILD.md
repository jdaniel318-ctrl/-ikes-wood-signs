# Upload Stillwater 8.8.20.131

Use `DarkSky8820131-Stillwater-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.131 · STILLWATER`. Do not clear Safari data, reset records or change permissions.
3. In My Fleet, select Programs & tools, then Open Carvewright. Leave the PIN field empty and tap Back to My Fleet. Check that the Carvewright card returns without a sign-in screen flashing.

Returning from Carvewright now shows a neutral My Fleet status while the existing account check runs. Once verified, Programs & tools opens at the Carvewright card. If fresh sign-in is needed, My Fleet shows the account form.
The upload itself executes no database commands. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

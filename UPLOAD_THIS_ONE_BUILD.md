# Upload Crestline 8.8.20.111

Use `DarkSky8820111-Crestline-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.111 · CRESTLINE`. Do not clear Safari data, reset records or change permissions.
3. Reopen an Owner Workspace in Safari, check the full logo and title on arrival, then scroll. Repeat on a second vessel you have access to.

Vessel owners, appointed Captains and Admiral My Fleet open at a clean heading. The Engine vessel picker and workstation announce their title on entry and return focus to the selected vessel when going back.
The upload itself executes no database commands. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

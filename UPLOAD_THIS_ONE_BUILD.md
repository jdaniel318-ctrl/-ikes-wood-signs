# Upload Longwatch 8.8.20.93

Use `DarkSky882093-Longwatch-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.93 · LONGWATCH`. Do not clear Safari data, reset records or change permissions.
3. Fleet Maintenance should show `FLEET STEWARD · STORAGE & RECOVERY`, without the misleading old app-version prefix.

- Engine private preview: seven minutes of inactivity before the Continue warning, then 30 seconds before reset; five additional minutes for testing.
- Editor input counts as activity even when the editor stops event bubbling.
- Live/trial customer expiry and owner/Engine authentication are unchanged.
- See LONGWATCH_GUIDE.md for installation, test steps and pending field notes.
The upload itself executes no database commands. Read the current guide before enabling new features. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

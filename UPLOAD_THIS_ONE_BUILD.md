# Upload Keydeck 8.8.20.95

Use `DarkSky882095-Keydeck-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.95 · KEYDECK`. Do not clear Safari data, reset records or change permissions.
3. Fleet Maintenance should show `FLEET STEWARD · STORAGE & RECOVERY`, without the misleading old app-version prefix.

Both Engine PIN entrances now accept keypad buttons or hardware-keyboard digits. The code stays outside editable fields and clears when checked or dismissed. See KEYDECK_GUIDE.md for the Legacy private-preview iPad retest.
The upload itself executes no database commands. Read the current guide before enabling new features. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

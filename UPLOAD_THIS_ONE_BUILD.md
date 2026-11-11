# Upload Tidelight 8.8.20.119

Use `DarkSky8820119-Tidelight-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.119 · TIDELIGHT`. Do not clear Safari data, reset records or change permissions.
3. Confirm the Engine release label, open the affected vessel and run its acceptance steps.

Six Fleet Arcade titles gain high-resolution in-play scenes. Dockmaster tracks cargo across a working drawbridge. Skullwater projects marsh water and shoreline along the course. New game art loads only when its title is selected.
The upload itself executes no database commands. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

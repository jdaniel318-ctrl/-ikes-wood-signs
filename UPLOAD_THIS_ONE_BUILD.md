# Upload Pennant Park 8.8.20.112

Use `DarkSky8820112-PennantPark-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.112 · PENNANT PARK`. Do not clear Safari data, reset records or change permissions.
3. Confirm the Engine release label, open the affected vessel and run its acceptance steps.

Harbor Sluggers joins Fleet Arcade. The arcade, Lantern Run, Stormwake and Wonderwake receive play, drawing and navigation improvements. The Engine, Captain and owner workspaces receive focused navigation and data-entry repairs, with updates to customer form handling and selected shop tools.
The upload itself executes no database commands. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

# Upload Flywheel 8.8.20.145

Use `DarkSky8820145-Flywheel-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.145 · FLYWHEEL`. Do not clear Safari data, reset records or change permissions.
3. Open Fleet Arcade → Piggy Vault. Press Play and Stop on several spins and watch the left and center columns during braking.

Ordinary Brassline reels reuse four visible symbol cells per reel, from spin through braking. The same cells carry the stop into place on the iPad.
The upload itself executes no database commands. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

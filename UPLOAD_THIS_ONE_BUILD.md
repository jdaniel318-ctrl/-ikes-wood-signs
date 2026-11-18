# Upload Chartroom 8.8.20.126

Use `DarkSky8820126-Chartroom-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.126 · CHARTROOM`. Do not clear Safari data, reset records or change permissions.
3. Open My Fleet → Programs & tools. In Build & Govern → Delegate select a test vessel and open Review this ship’s features. Opening the review issues no orders.

My Fleet groups programs by use. Delegate opens a feature review for the selected ship. A preview binds to one target. Owner Fleet Services distinguishes unavailable features from eligible upgrade offers. See CHARTROOM_FLEET_REGISTER.md for the handoff guide.
The upload itself executes no database commands. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

# Upload Topside 8.8.20.110

Use `DarkSky8820110-Topside-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.110 · TOPSIDE`. Do not clear Safari data, reset records or change permissions.
3. Open the Owner Workspace from the Engine on iPad, sign in with AutoFill, and check that the entire branded header is visible before touching the page. Scroll down and check that it stays where you leave it.

Owner Today opens with the complete business masthead visible after sign-in or session restoration. Scrolling belongs to the owner as soon as they interact.
The upload itself executes no database commands. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

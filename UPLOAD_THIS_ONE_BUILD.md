# Upload Marquee 8.8.20.124

Use `DarkSky8820124-Marquee-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.124 · MARQUEE`. Do not clear Safari data, reset records or change permissions.
3. Open My Fleet → Programs & tools → Fleet Arcade. Choose a game, check its controls and play. Saved progress should still be present.

Fleet Arcade gets equal game cards with per-game progress and next challenge, touch and keyboard control guides, keyboard menu navigation and a reachable Play button on narrow screens. Existing gameplay, saved scores, Admiral access, ScheduleJoe and Valley Notes are preserved.
The upload itself executes no database commands. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

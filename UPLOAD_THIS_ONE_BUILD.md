# Upload Gangway 8.8.20.130

Use `DarkSky8820130-Gangway-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.130 · GANGWAY`. Do not clear Safari data, reset records or change permissions.
3. In My Fleet, open Programs & tools and choose Carvewright. Verify your access and choose New design. Use Back to My Fleet to return to the same card.

The Carvewright gate names the design workspace. A verified launch opens Carvewright directly. Leaving or canceling from My Fleet returns to its Carvewright card. Engine Room launches return to Engine Room.
The upload itself executes no database commands. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

# Upload Helmward 8.8.20.88

Use `DarkSky882088-Helmward-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.88 · HELMWARD`. Do not clear Safari data, reset records or change permissions.
3. Follow the three field checks in HELMWARD_GUIDE.md: focused workstation, Back routes, and preview refresh recovery.

- Focused fleet vessel chooser and workstations, with main actions at the top.
- Consistent Test Center entrances and visible Back to vessel / Back to Engine routes.
- Expired Engine previews explain the ended session and offer safe recovery.
- No database, publication, account, customer-record or paid-service changes.
The upload itself executes no database commands. Read HELMWARD_GUIDE.md before enabling new features. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

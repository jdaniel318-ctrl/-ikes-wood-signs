# Upload Lifeboat 8.8.20.79

Use the `Upload` folder inside `Lifeboat.zip` (or the separate `DarkSky882079-Lifeboat-Upload.zip` in Support).
1. Extract Lifeboat.zip. Upload every file inside Lifeboat/Upload to the existing repository ROOT, preserving paths; replace matching files and KEEP all other files. Commit the upload.
2. Wait for GitHub Pages, open the Engine and confirm `8.8.20.79 · LIFEBOAT`. Open Configure Engine → Storage & Recovery → Export Captain's Backup.
3. Tap the new Download Captain's Backup link and save to Files. If preparation shows an error, keep the page and capture that message. Keep Safari data intact.

Lifeboat restores Captain backup access when a startup migration fails. Backup controls bind before migrations, report progress independently, fail visibly on unreadable primary orders, and time out safely. Export remains orders and settings only. No cleanup, migration retry or backend change. See LIFEBOAT_GUIDE.md.
The upload itself executes no database commands. Read the current guide before enabling new features. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback uses the supported complete baseline, or the prior changed files in the Rollback folder. Never restore old permissions or business data. New root tooling files remain unused by the old app. See Support/PackageProof.json for the exact added paths if reconstructing the complete baseline.
No passkeys/Face ID or performance gain is claimed.

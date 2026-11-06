# Upload Glasswake 8.8.20.90

Use `DarkSky882090-Glasswake-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.90 · GLASSWAKE`. Do not clear Safari data, reset records or change permissions.
3. Open **Configure Engine → Inspect Ship Integrity**. Read the named project cards, then use **Download integrity report** to save the diagnostic.

- Read-only integrity cards show project names, IDs and the precise failing boundary fields in four sources.
- All findings remain available, including quarantined-order information. Unreadable checks remain incomplete.
- Download a diagnostic JSON with project labels, IDs and check outcomes, excluding raw business records and credential fields.
- Diagnostic memory clears on Engine lock; late results are discarded after navigation.
- No automatic repair, storage migration, backend deployment or change to customer readiness.
The upload itself executes no database commands. Read the current guide before enabling new features. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

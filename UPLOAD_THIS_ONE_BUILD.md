# Upload Plumbline 8.8.20.120

Use `DarkSky8820120-Plumbline-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.120 · PLUMBLINE`. Do not clear Safari data, reset records or change permissions.
3. Open My Fleet, then ScheduleJoe. In a sample lot, move a task onto an inspection and review the dates before saving.

ScheduleJoe previews the crew, old and proposed workdays, and same-unit inspection dates when editing an existing task. A single-task calendar move onto or past an inspection opens the editor for review.
The upload itself executes no database commands. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

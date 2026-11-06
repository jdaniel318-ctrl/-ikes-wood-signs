# Upload Truebound 8.8.20.91

Use `DarkSky882091-Truebound-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.91 · TRUEBOUND`. Do not clear Safari data, reset records or change permissions.
3. Open Configure Engine → Inspect Ship Integrity → Review missing boundary repair. Follow TRUEBOUND_GUIDE.md before confirming the exact proposed additions.

- Explicit missing-only boundary repair after saved identity and admission verification.
- Review exact additions, then confirm; existing conflicting records block repair.
- Transaction commit, saved-copy readback and fresh integrity inspection are separate checks. Interrupted repairs report partial and can be reviewed again.
- No automatic repair, identity reassignment, admission creation, commissioning or customer readiness change.
- See TRUEBOUND_GUIDE.md for the three-step device check.
The upload itself executes no database commands. Read the current guide before enabling new features. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

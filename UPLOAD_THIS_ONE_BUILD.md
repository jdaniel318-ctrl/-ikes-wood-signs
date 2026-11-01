# Upload Keyline 8.8.20.81

Use `DarkSky882081-Keyline-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.81 · KEYLINE`. Do not clear Safari data, reset records or change permissions.
3. Fleet Maintenance should show `FLEET STEWARD · STORAGE & RECOVERY`, without the misleading old app-version prefix.

Keyline standardizes saved-account AutoFill metadata across fleet owner, appointed Captain and Admiral password sign-in fields. Apple controls Face ID or Touch ID for saved credentials. Existing server role, vessel membership, PIN, session and recovery checks are unchanged. No passkey enrollment or biometric authentication protocol is added. See KEYLINE_GUIDE.md.
The upload itself executes no database commands. Read the current guide before enabling new features. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

# Upload Deckplan 8.8.20.169

The iPad download is named `Deckplan.zip`. The release builder names the same upload `DarkSky8820169-Deckplan-Upload.zip`.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.169 · DECKPLAN`. Do not clear Safari data, reset records or change permissions.
3. Open Build & Govern, then select Vessel billing in Govern. Inspect the sandbox receipts and return to Readiness.

Admiral Govern opens to Readiness with full-size entries for Vessel billing and the Fleet ledger. Programs and Reports & recovery open from the top of the deck. Holds and watch items retain their evidence. Sandbox receipts show assignment, payment status and recorded amounts separately.
The upload itself executes no database commands. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

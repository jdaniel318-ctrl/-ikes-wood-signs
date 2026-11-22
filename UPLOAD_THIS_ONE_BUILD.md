# Upload Soundings 8.8.20.154

Use `DarkSky8820154-Soundings-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.154 · SOUNDINGS`. Do not clear Safari data, reset records or change permissions.
3. To make the optional Captain tool available, install SOUNDINGS_CAPTAIN_DOCUMENTS.sql once in the fleet database. Each ship starts with the tool off. In Captain Station, open Ship tools, then Quotes & invoices.

An appointed Captain can opt into private, ship-owned quote and invoice books in the Captain Station. Enter a flat job amount on the first screen, use the ship catalog for itemized work, and search or page through saved documents.
The upload itself executes no database commands. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

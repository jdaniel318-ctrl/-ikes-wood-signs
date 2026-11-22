# Upload Waybill 8.8.20.153

Use `DarkSky8820153-Waybill-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.153 · WAYBILL`. Do not clear Safari data, reset records or change permissions.
3. Open a finalized invoice in Quotes & invoices and select Review in payment desk. Compare its number and total with the invoice preview.

The payment desk shows the invoice number, subtotal, sales tax and total supplied by Quotes & invoices. Its split preview uses the invoice amounts and two adjustable example fees.
The upload itself executes no database commands. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

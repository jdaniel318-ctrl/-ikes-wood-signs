# Steadyhelm 8.8.20.74

This update applies Wonderwake’s lessons to Quotes & Invoices: make the outcome clear, keep controls near the work, and offer the right next step.

## Upload

Use **DarkSky882074-Steadyhelm-Upload.zip** over the complete **8.8.20.73 Fleetbound** installation.

1. Extract the ZIP and open its single folder.
2. Upload **all inner files** to the existing repository root, replace matching files, keep all other files, and commit.
3. After GitHub Pages finishes deploying, reload the Engine and confirm **8.8.20.74 · STEADYHELM**. Quotes & Invoices should show **Quartermaster 8.8.20.74**.

No Safari data clearing, database action, account reset or new PIN is required for this software update. Use your own normal sign-in when needed.

## What changed

- Save, current total and the next step remain below the scrolling document.
- Save feedback distinguishes unsaved, saving, saved and failed. Failed saves keep edits for retry; conflicts block overwrite.
- Invalid amounts display “Review amounts.” Review guidance follows the document’s actual saved state.
- Date fields stay within their columns; the action strip adapts to smaller screens.

The storage schema, document IDs, finalized copies, account guards and PDF renderer are preserved. Records stay in their existing business workspace.

## Three iPad acceptance checks

1. Open the existing sample draft. Change the job name, scroll down and check that **Unsaved changes**, **Save draft**, the total and the next step stay visible. Save and check for **Saved on this device**.
2. In Items & quantities, change the first siding quantity from **8 to 9**. The unchanged sample should show **$6,460.00**. Return it to **8**, save, return to the document list and reopen: the saved name, quantity and **$6,271.00** should remain.
3. Use Review & PDF, then **Prepare PDF → Open PDF in new tab**. Confirm the saved job name, draft/sample labels and **$6,271.00**, then return to the still-open workspace. No finalization is needed for this test.

## Packages and verification

The Upload ZIP is the patch. The FullBackup ZIP is complete application source, not a backup of device drafts, customer records, media or Supabase. The Rollback ZIP restores previous software files only. Never restore old permissions or business data.

Offline checks cover the new save states, failures/retries, stale edits, scope cancellation, six viewport sizes, saved PDF contents, quote-to-invoice workflow and matching-business backup/restore. A fresh reviewer checked the change and confirmed the two review fixes. Physical iPad Safari acceptance remains pending; this package has not been deployed by the assistant.

This is a focused Quotes & Invoices pilot. Other Wonderwake learning candidates remain available for deliberate adaptation; they have not been applied across every ship automatically.

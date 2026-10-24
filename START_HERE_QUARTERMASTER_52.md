# Quartermaster 8.8.20.52 — PDF handoff

## Install

1. Extract the upload ZIP and open its matching folder.
2. Upload every inner file over complete Quartermaster 8.8.20.51. Replace matching names and retain every other repository file.
3. Reopen the site after it updates and confirm **8.8.20.52 · QUARTERMASTER**.

## Open or save a PDF

In your saved quote or invoice, choose **Review & PDF → Prepare PDF**. The ready panel now provides two deliberate choices:

- **Open PDF in new tab** opens a separate browser tab while the original workspace remains in place.
- **Download PDF** requests a file download using the document number as its filename. A browser that previews instead is directed to a separate tab.

Switch back to the existing HouseHull tab to continue. The new-tab link does not create a new quote or invoice, change a saved record, finalize a draft, or send a document to anyone. Existing local records use the same storage and need no migration or reset.

Both actions use the existing prepared saved snapshot and recheck the local session context before opening. The existing Admiral session limits still apply. PDF viewing does not extend them. A separate tab avoids the previous PDF navigation away from HouseHull; this release does not claim to diagnose every sign-in prompt on a physical device.

## Verification

13 focused PDF handoff cases and all 11 existing document workflow scenarios passed in isolated Chromium with real UI, PDF generation and IndexedDB, full host styles and synthetic authority. The .51 missing separate action was first reproduced. Independent review approved the bounded change. All three actual-index startup/integrity cases passed.

The source verifier checks the exact inverse of the declared edits and preserves behavior outside the handoff. Native iPad Safari remains a device observation. The final ZIP is separately checked by exact baseline reconstruction and extraction.

See QUARTERMASTER_PDF_HANDOFF_VALIDATION.json and QUARTERMASTER_PDF_HANDOFF_REVIEW.md for detailed evidence and scope.

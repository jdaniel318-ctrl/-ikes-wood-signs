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

## Focused design

# Quartermaster PDF handoff

The Captain wants a PDF to open separately or download, keeping the HouseHull workspace in place. This is an authorized, focused update over Quartermaster 8.8.20.51.

## Approach
Keep the existing Prepare PDF step and saved-snapshot bytes. Show two deliberate native links: **Open PDF in new tab** (target=_blank, rel=noopener noreferrer, no download attribute) and **Download PDF** (same prepared blob, existing filename/download attribute, target=_blank and rel=noopener noreferrer as a browser preview fallback). Do not launch a window after an asynchronous operation. Both actions retain the existing click-time authority check. Preserve URL revocation when contents, business, or session changes. The new controls wrap using the existing action layout.

Alternatives considered: a new-tab-only action meets workspace continuity but loses the clear save choice; download-only has browser-dependent PDF handling; the selected two native links make the destination explicit while keeping the current workspace. Selection is an implementation judgment within the user request.

## Boundaries
No changes to document numbering, money, rendering, storage, business isolation, authority, session lifetime, other vessels or game behavior. Backup download behavior stays as it was. No live publication, messages, backend writes or credentials. Use release 8.8.20.52, seal quartermaster-882052, release name Quartermaster; keep previous release/history files and exact complete .51 baseline. One matching ZIP folder; no TEST in current filename, folder or heading; at most 85 upload files; fresh uniform America/New_York timestamps.

## Evidence
An isolated native browser fixture must verify actual PDF tab/download behavior while the original workspace/document remains intact, download filename and PDF bytes, stale-session denial, cleanup on changed document, backup compatibility, and reachable controls on iPad and phone. Browser coverage is declared accurately; native iPad Safari acceptance remains the Captain’s device check. Verify exact .51-plus-patch reconstruction and actual-index startup/integrity before delivery.

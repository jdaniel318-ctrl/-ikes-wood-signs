# Quartermaster 8.8.20.53 — the operator workspace

## Install — three steps

1. Extract the upload ZIP and open its matching folder.
2. Upload every inner file over complete Quartermaster 8.8.20.52, replacing matching names and retaining all other repository files.
3. Reopen the site after it updates, confirm **8.8.20.53 · QUARTERMASTER**, and open HouseHull under **Quotes & invoices**.

## What changed

The workspace now has a compact navy masthead, clearer navigation, stronger typography, and a distinct HouseHull overview with an architectural line illustration. True catalog/draft/finalized counts and the main document actions are easier to scan. **Recent documents** exposes up to three saved records from the current business so they can be opened directly through the existing guarded handler. Catalog and business setup remain available; the example kit is a compact secondary section.

The main work area provides one scrolling region. Business selection, the saved-on-device status and backup details remain available. Touch targets, keyboard navigation, small-screen reachability, and the complete Admiral host style cascade are included in the focused checks. Other businesses retain their own identity and records with neutral artwork.

Existing saved parts, quotes, invoices, full document numbers, money calculations and customer PDF rendering are retained. The .52 **Open PDF in new tab** and **Download PDF** flow is preserved. There is no storage migration, SQL action, new external dependency, record reset, automatic order or payment.

## Continue your work

Open your existing quote in **Recent documents**. Its original saved details and number remain intact. The **Quotes & invoices** tab still lists every record. New quote/New invoice and Parts & services use the same saved catalog and business scope as before.

## Verification

12 focused workspace cases, all 11 existing document workflow cases and all 13 PDF handoff cases passed in isolated Chromium using actual production modules, native IndexedDB and synthetic authority. The retained workflow/PDF runners each have only their document-list selector scoped to distinguish the new Overview controls; all assertions remain intact. Independent review approved the bounded source/design changes. The actual-index startup/integrity checks passed all three cases.

The four baseline viewports first demonstrated the absence of direct Recent-document access. Current visual measurements distinguish total scrolling-region height from actually visible overview space. Source verification reverses only the two declared render-function changes and appended CSS, preserving all other behavior after coherent release identity normalization.

Native .53 Safari appearance remains a device observation. User screenshots of .52 already show the PDF in a separate Safari tab and the original quote workspace on return; that behavior is retained and rechecked offline here. The final ZIP is separately verified by exact baseline reconstruction and extracted startup.

See QUARTERMASTER_STUDIO_VALIDATION.json and QUARTERMASTER_STUDIO_REVIEW.md for detailed evidence and limits.

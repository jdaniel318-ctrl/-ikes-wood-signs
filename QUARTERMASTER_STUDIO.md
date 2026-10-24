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

## Design and measurements

# Quartermaster 8.8.20.53 — presentation verification

**Final result: 12 passed, 0 failed.** Chromium 151.0.7922.34 executed the focused presentation matrix against the frozen `.53` runtime. The final machine report is `visual-after/results.json`.

## Method and boundaries

`VERIFY_STUDIO_PRESENTATION.cjs` loads the actual Quartermaster UI, core, font and PDF modules under the complete retained professional Admiral host and CSS. It reuses the `initFixture`, workspace and UI helpers from `VERIFY_QUARTERMASTER_UI.cjs` and the complete host markup from `VERIFY_QUARTERMASTER_PRESENTATION.cjs`. Native IndexedDB stores synthetic fixture data. Every external request is blocked; the suite observed no unexpected requests or uncaught browser errors. No live account, service or production site is accessed.

The fixture follows actual UI actions. The filled HouseHull state is produced with **Create example quote → Overview**, yielding exactly 12 active parts/services, 1 saved draft and 0 finalized copies. Empty, other-business and long-label states are also created through the UI. The fixture does not replace the module's handlers or storage implementation.

This report covers the scoped overview/shell design and routes affected by its scrolling changes. Retained end-to-end workflow and PDF handoff regressions are verified separately by the release task. These are offline Chromium observations; the next native iPad Safari observation remains a device-level check.

## Baseline red: immutable 8.8.20.52

Before production source changes, the immutable `.52` build was exercised at 1024 × 768, 768 × 1024, 390 × 844 and 768 × 480. The new Recent document action was absent in all four viewports. The four intentional missing-feature failures, exact source hashes and baseline screenshots are recorded in `visual-before/`.

The baseline landscape screenshot shows tall repeated chrome and equal-weight overview cards, with sample actions below the initial view. The actual native-IDB state was 12/1/0, matching the requested review state.

## Usable overview space

The new shell puts scope, tabs and status inside the existing main scroller. Its raw height therefore includes those rows and cannot by itself be compared with the old main-content height. The useful comparison below measures the space from the initial overview panel top to the main-scroller bottom, with the disclosure closed and scroll position at the top.

| Viewport | .52 initial overview area | .53 initial overview area | Gain | .53 entire main scroller |
|---|---:|---:|---:|---:|
| 1024 × 768 | 376 px | 463.9 px | +87.9 px | 621 px |
| 768 × 1024 | 536 px | 624.9 px | +88.9 px | 781 px |
| 390 × 844 | 398 px | 492.8 px | +94.8 px | 710 px |
| 768 × 480 | 170 px | 198.4 px | +28.4 px | 346 px |

The final 1024 × 768 screenshot exposes all of these together: New quote, New invoice, the current saved document, catalog, business setup, Load example catalog and Create example quote. The 768 × 1024 overview also fits its complete content. The phone and short views use normal vertical scrolling. The checks scroll and hit-test the controls, so a control cannot pass merely because it exists outside the visible viewport.

The modal uses one main vertical scroller. Horizontal scrolling is limited to the existing tab strip or document/catalog tables. No tested state produces outer-page horizontal overflow.

## Verified behavior

| Focused case | Result |
|---|---|
| filled HouseHull ipad-landscape layout, targets and routes | PASS |
| filled HouseHull ipad-portrait layout, targets and routes | PASS |
| filled HouseHull phone layout, targets and routes | PASS |
| filled HouseHull short layout, targets and routes | PASS |
| empty HouseHull is truthful and actionable | PASS |
| recent document uses guarded reopen without changing saved state or number | PASS |
| other business keeps its identity and records isolated | PASS |
| long escaped identity and recent rows preserve full numbers and last-three order | PASS |
| keyboard tabs, focus and native storage details remain operable | PASS |
| recent open refuses denied authority without changing saved data | PASS |
| recent open cannot survive an expired session | PASS |
| delayed recent open discards an account change before completion | PASS |

### Identity, saved work and rendering

- The filled UI metrics exactly match the 12/1/0 stored state; empty HouseHull shows 0/0/0 with creation and sample actions available.
- Switching to another business removes the HouseHull sample controls, architectural illustration, customer/job text and document number. The other business gets neutral document artwork and its own saved name and record. Switching back restores the unchanged HouseHull state.
- The long-data case saves four documents and verifies exactly the last three in reversed insertion order. Full official numbers remain in the DOM and the reopened editor, including a 62-character number. Business/customer/job values of up to 180 characters include literal SVG/event-attribute markup, which remains escaped text. No injected handler executes.
- Decorative SVGs are hidden from accessibility APIs, unfocusable and non-interactive.
- All **65 original IDs** from the comparable `.52` filled state occur exactly once in the `.53` filled state.

### Authority and storage integrity

Recent document controls use the existing guarded reopen route. A successful open adds exactly one authority verification and preserves the entire stored workspace, including record IDs, official number, revisions, counters, operations, totals and timestamps.

**Inherited storage detail:** the existing `store.load()` uses a read/write transaction and performs one `put` of the unchanged workspace. The legacy Documents open path and the new Recent open path each perform that same one identical-data put. The suite compares those paths and asserts exact before/after workspace equality. It reports `identicalStoragePuts: 1` and `logicalStateChanges: 0`; it does not claim that reopening performs zero physical IndexedDB writes. No storage behavior was changed for this visual release.

Denied authority leaves the overview and records unchanged. An expired session closes the private workspace, and a delayed authority response after an account change is discarded. These denied cases perform no new puts before the attempted action is rejected.

### Controls, keyboard and scrolling

Across all four sizes, visible buttons, summary controls and fields meet the 44 px target threshold, and editable fields use at least 16 px text. Primary/secondary action and active/inactive tab styles remain distinct under the full professional host cascade. The New quote pressed state and keyboard focus are distinct.

Arrow keys, Home, End and tab wrap retain existing tab behavior. Exactly one navigation tab has `tabindex="0"`. Native Tab reaches the Recent document row and its visible focus ring. Enter and Space operate the storage disclosure.

Scroll-and-hit tests cover New quote, New invoice, catalog, business setup, both sample actions, expanded storage details, business fields and backup/restore controls, catalog description/SKU/save controls, customer/terms fields, and saved-document review/PDF/finalization controls. Sticky tabs do not occlude the tested targets.

## Visual inspection

Final screenshots inspected include landscape and portrait tablet, ordinary phone, the other business, and the long-label phone case. The landscape composition shows a compact navy toolbar, clearer HouseHull hierarchy, restrained architectural artwork, true counts and directly available saved work. The long phone case visibly clamps the business heading while retaining full escaped text and title; the rest of the workspace remains scrollable.

Principal evidence images are `workspace-ipad-landscape-overview.png`, `workspace-ipad-portrait-overview.png`, `workspace-phone-overview.png`, `workspace-short-overview.png`, `workspace-empty-househull.png`, `workspace-other-business.png` and `workspace-long-phone.png`, all in `visual-after/`. Screenshots are internal review evidence.

## Reproduction and source identity

From the project directory:

```sh
node qa/VERIFY_STUDIO_PRESENTATION.cjs release qa/visual-after after
```

The verifier also works when bundled beside the runtime and retained utility files, with that directory as its default source root. It uses `CODEX_PRIMARY_RUNTIME_NODE_MODULES` for Playwright and `QUARTERMASTER_CHROMIUM` (or the available local Chromium path) for the browser.

The final report records every source SHA-256 used by this fixture. Principal rendered sources:

| File | SHA-256 |
|---|---|
| quartermaster.js | `c161426540ab968a21403307d4836c52a03c236363bdc314b8963c768b905c02` |
| quartermaster.css | `567e3bf3fe41e0f9c38fc9cfe33fd7f1eaaedacb5b7c1a344173b960980d4dbb` |
| quartermaster_core.js | `5de2d40cb05eeeafb03855e5a374b7fc451982969d187d71632dd908e1051eed` |
| quartermaster_pdf.js | `7e1c51fa7d7a4ae4fcd55a2330b15ff87c6b4ec0c9db548ff2b6a72658a453a1` |

The phone hit-test accounts for the modal's top-layer boundary: clipping is evaluated up to the open dialog and validated with `elementFromPoint`, rather than incorrectly applying the underlying zero-height host body to the modal. This measurement correction affects only the verifier.

# Quartermaster 8.8.20.53 — a focused operator workspace

## User intent
The Captain says the .52 overview can still look better. The screenshot shows HouseHull with 12 parts, 1 saved draft, 0 finalized copies, and oversized stacked header/scope/navigation/status rows above pale equal-weight cards. Make a visibly stronger professional design and a more useful starting point. The Captain has asked for autonomous improvements and ZIPs without repeated approval pauses. New user screenshots show the .52 PDF in a separate Safari tab and the original app still on its quote screen; retain that success.

## Selected design
A compact navy toolbar, restrained teal/brass accents, consistent line icons, a distinct HouseHull overview banner with a code-native architectural line illustration, strong type hierarchy and compact true workspace counts. Recent documents use existing saved-record data and existing guarded open handlers. The primary New quote action is immediate; New invoice, catalog and business setup remain direct. The sample kit becomes a slim secondary strip. Clear active/focus/pressed states and touch targets. The source of truth remains the current business state.

Alternatives considered: repeating the existing pale-card layout with tighter spacing would not materially change the user’s experience; a new sidebar/navigation system would add routing risk and reduce phone space; the chosen compact top toolbar and redesigned overview provide a visible step forward while retaining known navigation. This is the assistant’s design decision within the authorized task.

## Implementation boundaries
Only replace shell() and renderOverview() in quartermaster.js and append scoped quartermaster.css rules. Do not alter other JavaScript functions. Recent documents should use the same data-qm-open-doc handler as the existing document list, show at most 3 records in current reversed insertion order, preserve the full existing document number (visual ellipsis/title allowed), customer/job/status/total from this business only, and escape all dynamic values. Never create invented jobs/counts or short official identifiers.

Keep all existing control IDs, data-qm-tab values, roles and operative labels. Do not duplicate any ID. Keep qmBusiness, qmScopeName, qmStatus, qmContent, qmSaveState, footer, PDF-ready area, saved-on-device/capacity disclosures and accessible local storage facts. HouseHull architectural artwork and sample kit appear only for existing isHouseHull() branch; other businesses receive neutral document artwork and their own escaped identity/data. SVG is decorative, aria-hidden, unfocusable and non-interactive. No new raster/network dependencies or changes to branding logos.

Keep existing authenticated handlers, money/storage schema/numbering/PDF renderer, .52 separate-tab/download links and URL cleanup, session limits, customer routes, unrelated games/business functionality and all historical files. No backend writes, credentials, production interaction or deployment. Current heading/ZIP/folder must omit TEST; matching unique folder, at most 85 update files, fresh Eastern timestamps. Target 8.8.20.53 / quartermaster-882053 / Quartermaster over exact complete 334-file .52 digest 08a0144b24078079032245680bab68e793694d72960fb613d7578c9e8e4050a9.

## Visual acceptance
Make the change visually substantial: stronger HouseHull identity, disciplined navy/ivory/teal/brass hierarchy, attractive but restrained vector art, compressed repeated chrome, and saved work visible. Aim to show all primary overview content with the user’s 12/1/0 state in an iPad landscape viewport; allow normal scrolling where content requires it. Do not reduce readability to force fit. Phone and short viewports must keep scrolling/controls functional. Primary controls >=44px, fields >=16px, no outer horizontal overflow. Native details may expand without trapping content. Maintain a single main scrolling area and the existing tab keyboard behavior.

## Verification
Use real UI and full host CSS with synthetic local data/authority; measure desktop/iPad/phone/short viewports, inspect actual screenshots; check existing and empty HouseHull, other-business isolation, long labels/records, Recent document opening through current guard, nav keyboard/focus/disclosures, and unchanged PDF handoff. Reuse retained workflow and handoff suites with only precise selector adaptation if new read-only recent controls introduce duplicate data selectors. Do not alter assertions to hide regressions. Source inverse map must prove no undeclared runtime differences. Verify current identity, retained models/history, compiler/host hash, actual startup and exact .52+patch reconstruction before durable delivery. Native .53 Safari appearance remains the next device observation.

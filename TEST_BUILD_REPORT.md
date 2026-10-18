# Black Flag 8.8.20.32 — Workhorse TEST

## Decision and scope
A business-workspace improvement based on the complete SteadyHand 8.8.20.31 release, not a new or empty fleet. The shared owner portal now makes daily work easier to find and inspect, with an Ike-specific sign-order detail view, clear price arithmetic, and an evidence-only lettering overview. Existing Captain, Admiral, customer, commissioning, ledger, and production-rendering code is preserved apart from current release identities and required loader metadata.

This is a **TEST BUILD, not a production launch or full server-permission certification**. No live database writes, migrations, deployments, invitations, paid resources, role changes, new reports, order edits, style compilation, or publication were performed while preparing it. No automation was scheduled. The package is delivered for the Captain’s deliberate upload.

## What is new

### 1. A usable owner home across businesses
One compact business header and persistent Today / Orders / Pricing navigation; Ike’s also has Lettering Styles. Real counts are derived from the already-loaded exact-business records: new, in progress, ready, and completed/closed. The first view puts active work and an oldest-received queue ahead of platform reporting. Existing Features, Branding, Fleet Report, Fleet Services and Settings remain reachable. No existing module is deleted.

Unknown status stays visible as other active work. Missing price, missing payment status, and explicitly labeled test records remain distinct. No duplicate classification is inferred from customer names or repeated wording. An unreadable order store creates an explicit hold rather than displaying a false zero. Conflicting same-project identity metadata is withheld with an explicit count; the records are not deleted or reclassified. The root record source is clearly labeled as this browser’s saved business records.

### 2. Searchable orders and actual detail views
The old summary-only cards now have a View order action. Search by saved order identifier, customer, wording, contact details or status; filter by work stage; sort oldest/newest; browse six records per page. Returning from a detail retains the search, stage, sorting and page.

The new detail screen is read-only. It exposes the recorded order number, dates, status, exact case and spacing of sign wording, lettering style, saved species/length/rate, price, recorded payment status, notes, customer fields, and supported saved raster photos/approved-preview snapshots when present. Missing fields stay missing, not invented. Conflicting saved approval wording or price is flagged for review without choosing which is authoritative. Service-business details label requested scheduling windows as not confirmed.

**No new-order creation, status-editing, customer messaging, or production-export workflow was added to the owner portal.** Existing workflows elsewhere remain. This change makes the saved order useful to inspect without adding unreviewed data-writing authority.

### 3. Pricing that explains itself
Existing six-species values and Active checkboxes are unchanged. Rate fields explicitly state dollars per linear foot. A known-length calculator accepts inches or feet and shows rate × length using the current form values. It is clearly arithmetic only, not a quote and not a claim that minimums, taxes, extras or rounding policies have been resolved.

Edits now create an honest unsaved-state message. No-change Save is disabled. An explicit save invokes the existing settings handler once; fields freeze while it completes so a later edit cannot be misrepresented as saved. Unconfirmed writes hold without an automatic retry. Reopening Pricing rereads saved settings. Existing orders are not repriced. This does not introduce a new cloud-backed pricing endpoint.

### 4. Lettering without false promises
Real A/B references are shown in compact cards. A case-sensitive exact-wording checker compares the characters with the evidence loaded in the current workspace, preserves deliberate spaces and lowercase, and never certifies machine geometry. The old foundry controls remain under Advanced production review: uploads, draft styles, evidence editing, segmentation, canonical selection, compilation, certification, publication and history are not removed or bypassed.

Presentation distinguishes workflow scores from production approval and reference-character coverage from cutting-path tests. Bundled anchor flags, A/B registry, geometry and sample images are unchanged. No owner evidence was added, removed or approved. Empty evidence in one loaded view is not proof that earlier files were lost.

### 5. Shared presentation, preserved business identity
The owner deck is shared across businesses; tests cover Ike’s, Legacy Plumbing, Becca’s Bloom Shop, Mugs After Dark, Signal Restoration and Grizzly Bear with synthetic data. Business names, exact project identifiers and saved supported logos remain scoped. Shared services text no longer calls another business “Ike’s.” New controls have readable labels, focus states, touch-friendly sizes and responsive layouts. Customer sign canvases and business-specific customer journeys were not redesigned in this update.

## Verification

- **60 Node checks passed:** 24 new Workhorse checks, 20 inherited SteadyHand checks, and all 16 inherited Ironbound commissioning checks.
- **46 isolated Chromium scenarios passed:** 21 owner-workspace scenarios, 19 SteadyHand report/input/Admiral scenarios, and six Ironbound commissioning scenarios.
- New coverage includes whole owner-script startup into the exact-business fixture, denied and expired owner sessions, search/filter/pagination and detail-return behavior, foreign/conflicting record withholding, missing and zero amounts, text injection/unsafe-image rejection, exact wording/case, no-write navigation and calculators, explicit once-only pricing saves, failed reads, uncertain-save holds, and unchanged order prices.
- A delayed-save regression reproduced editable pricing fields during an in-flight save before the fix. The corrected test verifies the field freeze, one write, and correct post-save dirty state. Earlier red runs reproduced the missing task home/actionable queue, incorrect unchanged-pricing message, absent persistent nav and missing conflict-count behavior.
- Actual owner, order, price and lettering panels were checked at widths 390, 768, 1024 and 1366 pixels. Tested panels had no horizontal overflow. Screenshots contain synthetic sample records, not the user’s real order counts or customers.
- Preserved all **105 baseline filenames**, all **16 image assets**, all **five SQL files**, the A/B style registry and original broad platform CSS. Authentication/membership and geometry declarations received a source comparison. Existing geometry and permission rules were not replaced by the new presentation helper.
- Final packaging verifies runtime/model hashes, archive CRCs, identical checksum ledgers, a single correctly named folder, safe paths, a small delta upload, and byte-exact reconstruction of the full release from SteadyHand plus that delta.

## Test limitations
Full HTTP navigation in the execution environment was blocked with `net::ERR_BLOCKED_BY_ADMINISTRATOR`. The owner tests therefore execute the actual HTML, actual JavaScript handlers and actual release assets in isolated Chromium DOM contexts with an in-memory IndexedDB-shaped fixture and synthetic authentication/read responses. All real network requests are blocked. This is meaningful integration testing, **not** proof of full hosted startup, native iPad paste behavior, service-worker upgrade, real authentication callbacks, or server RLS/revocation. WebKit was unavailable. Native Safari acceptance remains the next step.

One screenshot-heavy owner-suite rerun exceeded a 45-second command budget after 20 passing scenarios; the complete suite was rerun successfully with a longer budget, with all 21 scenarios passing. No failing functional result was suppressed.

Review was a source self-review with automated regressions, not an independent external security review. No false claim is made that every customer form across the fleet is newly field-certified.

## Live read-only checkpoints
Preflight at **2026-10-17 19:36:06 UTC** and postflight at **2026-10-17 20:14:10 UTC** returned the same relevant posture: Ike’s staging/owner-operated/owner-assigned; VoyageKeeper commissioning/Captain-operated/owner-unassigned; four total active memberships; one active global authority; two VoyageKeeper reports. The retired failed operation remains verified-not-created/closed/retry-forbidden, and its successful successor remains verified-created/closed/retry-forbidden. These checks did not fetch customer payloads and do not establish a full database-wide equality proof. No write request was sent.

## Data durability and remaining work
The owner Orders and Pricing path reviewed here still consumes browser-local business records/settings. A successful server owner sign-in does not turn those records into a cloud backup. Do not clear Safari data. No local order was moved, swept, repriced or deleted by this build process.

Remaining gates include complete live backend read/write denial coverage, deliberate revocation/replacement proof, scoped Admiral exports, first-time invitation route improvement, measured production-lettering fidelity, the full customer-to-production order workflow, and a production durability/availability plan. Existing broader readiness holds are not cleared by this UI release. Automatic retry remains forbidden.

## Install and first three iPad checks
1. Use the small **Workhorse Upload ZIP** on top of the existing **SteadyHand 8.8.20.31** site. Extract it and upload the contents of its one folder to the existing repository root. Preserve all other files. No SQL or permission changes. Keep the full recovery ZIP separately, not as a single browser-upload batch.
2. Open Ike’s existing Owner Entrance with its already-assigned owner account. Confirm **WORKHORSE TEST · 8.8.20.32** and the new Today screen. Counts must reflect the records in that browser, not the sample counts in the test screenshots.
3. Open Orders, search an existing wording or identifier, select View order, then Back to orders. Confirm the saved wording, price, status and available image details, and that the list filter remains. Send the new home and order/detail screen. Do not save pricing, compile lettering, change order status or publish a report for this first check.

## Rollback and source reproduction
Keep the complete SteadyHand .31 archive. Rollback restores the complete matching prior runtime and manifests, not individual mixed-version files. No database rollback is needed or authorized; new unused presentation assets need not be deleted. Historical SQL is retained evidence, not installation instructions.

From the extracted full package, run:
```
node VERIFY_WORKHORSE.cjs .
node VERIFY_STEADYHAND.cjs .
node VERIFY_IRONBOUND.cjs .
python VERIFY_WORKHORSE_UI.py . /tmp/workhorse-ui
python VERIFY_STEADYHAND_UI.py . /tmp/steadyhand-ui
python VERIFY_IRONBOUND_UI.py . /tmp/ironbound-ui
```
The Python test harnesses require installed Playwright, BeautifulSoup and Chromium; no new runtime dependency was added to Black Flag.


<details><summary>Retained prior SteadyHand report — historical, not current installation instructions</summary>

# Black Flag 8.8.20.31 — SteadyHand TEST

## Purpose and release boundary
Based on the persistent **DarkSky882030-Ironbound-TEST.zip**, not a rebuilt or empty fleet. This is a frontend hardening TEST BUILD: field-aware paste cleanup, exact report proof, clearer lifecycle/authority/version labels, and responsive observation details. It does not add authority, commission another vessel, change saved reports, run SQL, send invitations, activate a service, or publish a customer site.

**No Supabase migration or dashboard configuration is required. Do not execute the retained historical SQL files.** They are preserved source history, not installation instructions for this build.

## Reproduced defects and changes
### 1. Visible pasted whitespace
The baseline Captain email handler trimmed a request copy without cleaning the displayed field. A browser regression reproduced the visible defect using nonbreaking-space padding. A shared `input_hygiene.js` module now cleans ordinary field boundaries after user paste and autofill replacement, on blur/change, and before existing submit/button handlers consume edited values. Both the visible value and submitted value agree.

The release inventory covers **139 reviewed ordinary input instances** across the Engine, Admiral login and delegation, Captain, owner, commissioning, customer intake and ledger forms. **44 explicitly protected instances** cover passwords/PINs and production wording/examples. Unknown fields, raw imports, readonly/disabled fields and secrets remain untouched by default. Future ordinary fields opt in with `data-bf-trim="boundary"`; meaningful wording/raw content opts out with `data-bf-trim="preserve"`.

Only leading/trailing whitespace is removed. Internal spacing, case and multiline indentation are preserved where the control supports multiline text. Native single-line inputs still apply their own line-ending rules. Caret offset, composition input and dynamically rendered controls are covered. There is no network, storage, permission, submission or retry command in the helper. Existing user-edit listeners continue receiving the normalized user edit. No stored records are swept or rewritten.

### 2. Successful report wrongly called unconfirmed
The baseline reproduced the padded-work false warning. It also accepted a changed issue summary, an omitted issue summary, and an independently reloaded report whose text did not match the new write.

The repaired Captain handler builds one canonical payload and uses it for validation, counters, the command response and an independent saved-report read. It verifies **Project ID, work text, issue count, issue summary, report identifier and a valid report timestamp**. The read must return the same report identifier that was just saved. An empty summary is allowed to round-trip as PostgreSQL NULL; absent or materially changed content is rejected.

ECMAScript whitespace is removed from the outgoing boundaries before the existing SQL trim runs; JavaScript and PostgreSQL trim behavior are not assumed to be identical. The response is not broadly normalized to hide a real mismatch. Character counting uses Unicode code points for report validation, consistent with database character counts.

A lost response, wrong vessel, changed content, missing field or unavailable read-back enters the existing explicit recheck state. **No automatic retry is sent.** Double taps send one command while unresolved, and late completion after sign-out cannot repaint vessel data. Recheck reads the saved report; it does not republish.

### 3. Truthful Admiral observation
The detail view now separates **VESSEL LIFECYCLE**, **REPORT FRESHNESS**, **OWNERSHIP STATUS**, **OPERATING MODEL**, **CAPTAIN REPORT SAVED AT**, and **LAST FLEET READ (NOT A NEW REPORT)**. A stale report is no longer displayed as the vessel lifecycle. Owner-account counts explicitly say they are not Captain counts.

The yellow message is now **FLEET COMMAND OPERATIONS NOT ENABLED**, with an explanation that this is neither backend health nor publication state and does not cancel an accepted exact-vessel Captain's separate station. The operation button remains disabled: no permission bypass was added.

Live interface/adapter build constants now identify **8.8.20.31 / SteadyHand TEST**. Historical model/API versions and historical evidence are retained, not repainted as newly verified evidence. Observation details use three columns where width allows and wrap safely on a narrow screen. Existing logos and images are unchanged.

## Fresh verification
**36 Node checks passed:** 20 SteadyHand helper/report/presentation/syntax/package checks plus all 16 inherited Ironbound commissioning regressions.

**25 isolated Chromium scenarios passed:** 19 SteadyHand actual-handler/markup integrations plus all six inherited Step-7 scenarios. The new coverage includes padded email and report input, substantive mismatch rejection, missing response fields, lost writes/read-backs, double taps, no-republish recheck, sign-out during an in-flight write, same-account other-vessel denial and return, representative annotated fields, secrets/production wording, IME/caret behavior, dynamic fields, and actual Admiral detail rendering. Captain and Admiral detail layouts were checked at **1024×768 and 390×844** without horizontal overflow in the tested panels.

The before/after regression ran against the untouched Ironbound baseline: **five failures were reproduced** in the initial 11-scenario subset and all five then passed on SteadyHand. Test results and source tests are included in the ZIP.

**Test limits:** RPC and authentication boundaries were synthetic; no real user was signed in by the tests and no real vessel command was submitted. Browser event tests exercise actual JavaScript handlers but do not certify the native iPad clipboard or keyboard. The environment blocked local HTTP navigation, so the owner/Watchtower tests executed actual source in isolated Chromium DOM contexts. This does **not** certify a full hosted startup, native Safari, real authentication callback, or service-worker upgrade. Runtime SHA-256 bodies, loader dependency order, inline-script syntax, current model identities, archive CRCs and whole-file checksums are checked separately. This is a self-review with automated regressions, not an independent external security audit.

## Live Fleet Core boundary
A read-only preflight at **2026-10-15 01:26:41 UTC** returned VoyageKeeper Project ID `bf-p-fc2816b8254a4845`, lifecycle `commissioning`, operating model `captain_operated`, one active exact-vessel operator membership, zero fleet-wide authorities, and exactly one saved Captain report (`5e926e87-10f5-4d76-aff4-6d254a0c8fdf`, original timestamp **2026-10-05 04:02:39 UTC**). The old failed operation remained verified-not-created/closed/retry-forbidden; the successful operation remained verified-created/closed/retry-forbidden.

A requested final read-only comparison was **blocked by the tool safety layer**. No post-build live comparison is claimed. No database write, migration, role change, new account, invitation, report submission, appointment change or commissioning request was attempted during this build. The test harnesses never contact live Fleet Core.

## What remains open
The already demonstrated browser allow → deny → return and Admiral-observation checkpoints are historical field evidence for 8.8.20.30, not proof that every new byte in this ZIP is native-device verified. Native acceptance of 8.8.20.31 remains next. Direct backend access-denial coverage, revocation/replacement proof, scoped Admiral exports, the first-time account/invitation route, executed-agreement evidence, end-to-end business order work and production launch remain separate gates. This release neither claims nor clears the existing broader readiness holds. The fleet remains private-test only. Existing reports retain their old words and original timestamps, even when the old test note says “pending.”

## Upload and first three device steps
1. Extract **DarkSky882031-SteadyHand-TEST.zip** and upload the **contents** of its single same-named folder to the existing `/-ikes-wood-signs/` site root, replacing matching files. Preserve browser data. Confirm **8.8.20.31 / STEADYHAND TEST** on the Captain/Admiral surface. Do not re-run SQL, create another project or recommission VoyageKeeper.
2. In the existing VoyageKeeper Captain station, signed in as `voyagekeeper@yahoo.com`, paste **three spaces + `SteadyHand private test: checking report confirmation.` + three spaces** into Current work. Paste **three spaces + `Browser isolation passed; backend and revocation tests remain.` + three spaces** into Issue summary. Keep Open issues at **1**. The accidental boundary padding must disappear; internal wording stays intact.
3. Tap **PUBLISH WATCH UPDATE once**. Only after explicit success, refresh the station once and send the resulting screen. This deliberately adds a new private test report; it does not rewrite/delete the original report. If saving is uncertain, use **RECHECK STATION**; do not republish or repeat the appointment.

The Admiral detail-label check follows this report checkpoint. Do not change report history merely to make a freshness warning disappear.

## Recovery and rollback
Retain the prior Ironbound ZIP. A frontend rollback means restoring that complete matching package, not mixing individual old/new runtime files. It also brings back its known whitespace/read-back/label defects. No database rollback is required or authorized by this frontend-only change. Keep all existing sessions, reports and commissioning guards. Reload/reconnect must never replay a commission or report command.

## Reproduce the offline checks
From the extracted folder: `node VERIFY_STEADYHAND.cjs .` and `node VERIFY_IRONBOUND.cjs .`. With Python Playwright, BeautifulSoup and a local Chromium binary: `python VERIFY_STEADYHAND_UI.py . /tmp/steadyhand-qa` and `python VERIFY_IRONBOUND_UI.py . /tmp/ironbound-qa`. Do not run `VERIFY_IRONBOUND.sql` against production as part of installing this ZIP.

## Technical references
- MDN, paste events: https://developer.mozilla.org/en-US/docs/Web/API/Element/paste_event
- MDN, boundary whitespace: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim
- These explain browser event/whitespace behavior. Claims about Black Flag itself come from its source, the recorded read-only preflight and the attached regression runs.

## Preservation inventory

All **100 baseline filenames** are retained; **16 original image assets** and all existing SQL files are byte-for-byte unchanged. This ZIP contains 105 files. New files: FIELD_WHITESPACE_POLICY.json, STEADYHAND_TEST_EVIDENCE.json, VERIFY_STEADYHAND.cjs, VERIFY_STEADYHAND_UI.py, input_hygiene.js.

</details>

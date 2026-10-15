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

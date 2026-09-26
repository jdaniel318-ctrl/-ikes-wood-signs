# Dark Sky 8.8.17.15 — ClearPassage

Test-site presentation repair based on 8.8.17.14 WatchBeacon. The current work is the Admiral Command Deck entrance, not a new authority grant, working-ship handoff or cloud-storage migration.

## What changed

- A wider, balanced two-column sign-in card on landscape tablets replaces the tall nested account form. Narrow screens stack into one normally scrollable column. The heading, labels and return action remain reachable without scaling the controls.
- One progress display identifies Passage PIN and Admiral account separately. The second step explains account/server-authority verification; it no longer repeats the first-step instructions above another heading.
- A single gate scroll surface tracks the available visual viewport at ordinary zoom, with CSS fallback when that API is unavailable. Pinch zoom is not disabled. Keyboard-sized viewports can scroll; small text is not used to make the form fit.
- No delayed text-input focus on entrance or phase change. A heading receives accessible focus without opening the keyboard. The person chooses the field. The former multi-second operational gate movement is replaced by a short opacity fade, respecting reduced motion. The optional ceremonial Command Deck remains unchanged.
- Explicit cancel clears the password synchronously; hidden-gate cleanup clears PIN/password even when a return controller closes it. Values are not saved as a draft or diagnostic evidence.
- Existing PIN and account authentication handlers, active-server-authority predicates, current findings, readonly observation and fresh-document identity rules remain. Field sizes are at least 18px; buttons at least 48px high.

## Protected scope

All 85 original file paths remain; no deployed test seed, fixture account, or private ledger export is added. Ledger business logic, order records, vessel identities, owner login, security handlers and SQL references are not redesigned. Both Admiral checks remain required by their existing route. A valid in-document Admiral session is handled by the existing policy, not a newly introduced bypass.

The four outstanding warning conditions are not cleared by this release: experimental Ike length inference, live revocation proof, legacy storage quota, and Safari storage attribution. Browser witness fallback is not durable business storage or cloud backup. Working-ship commissioning and appointed-Captain handoff remain unverified.

**Do not run SUPABASE_LEDGER_INTEGRITY_88171.sql as-is.** The known schema mismatch remains a separate migration task. No SQL is needed for this static website update. Do not clear website data.

## First three deployment actions

1. Download DarkSky881715-ClearPassage.zip.
2. Extract and open its one matching folder, DarkSky881715-ClearPassage.
3. Upload all 85 files inside it to the existing test repository root, not the ZIP or enclosing folder.

Confirm **8.8.17.15 · CLEARPASSAGE** on the Engine. Next field check: the same PIN → dedicated account route, with the new tablet layout, then the preserved findings. Test in the user's normal Safari / ChatGPT back-and-forth workflow.

## Verification boundary

Automated tests use the entire shipped Captain module, original markup and styles in isolated Chromium pages. Account transport, storage and visual-viewport events are fixtures. They do not test live Supabase passwords/roles or reproduce a real iPad software keyboard. Ordinary full-site local navigation is blocked by the environment; no browser policy was changed. Native iPad Safari acceptance remains pending.


---
## Retained earlier documentation (historical evidence, not current tests)

# Dark Sky 8.8.17.14 — WatchBeacon

Test-site repair candidate based on 8.8.17.13 KeelGuard. No rank, Known Good, production publication, ownership, membership, or server permission is granted by this ZIP.

## Repaired

- The Admiral findings renderer uses the existing module-scoped `captainSafe` encoder. It no longer references `htmlSafe`, which was private to the cinematic renderer.
- Rendered current card IDs/counts and report identities are checked before a successful display is recorded. Mismatched counts, duplicate/unknown checks, mismatched run history and mismatched details show an explicit error rather than a misleading empty panel.
- A rendering error retains the report, displays an accessible error panel, and offers Retry Display (no readiness rerun) and Download Last Report. Those actions do not clear findings or delete records.
- Closed Admiral deck and gate surfaces remain display:none despite Professional/Cinematic display rules; a closed panel cannot intercept Captain taps.
- A background summary cannot overwrite the deliberately selected report while its cards/export still refer to another run.
- Readiness exports add a separate `findingsDisplay` observation: display result, source run/time, displayed IDs and matching-run flag. This is diagnostic evidence, not a security signature or storage verification.
- All 85 original file paths remain. Both Admiral gates, ledger business logic, canonical vessels, source contracts and historical files remain. No SQL or business-data migration is needed.

## First three deployment actions

1. Download `DarkSky881714-WatchBeacon.zip`.
2. Extract and open its single matching folder `DarkSky881714-WatchBeacon`.
3. Upload all 85 files inside it to the existing test repository root. Do not nest the enclosing folder, upload the ZIP as a site, or clear website data.

Confirm `8.8.17.14 · WATCHBEACON` on the Engine. The next guided test is Captain readiness followed by the separate Admiral PIN/account gates and visible current findings. Warnings should remain visible until their underlying requirements are resolved.

## Verification boundaries

Browser regression uses the entire actual captain.js module in isolated Chromium pages, real DOM/click handlers, and the actual app verifier block. Storage, readiness results and server-account responses are fixtures. Normal full-site local navigation returned ERR_BLOCKED_BY_ADMINISTRATOR; that restriction was not bypassed. Native iPad Safari acceptance and real server-authorization tests remain pending.

The four warning observations in the supplied 8.8.17.13 report were replayed unchanged: Ike length calibration, server-revocation proof, legacy localStorage quota, and Safari storage attribution. This release does not resolve those warning causes, test a business-ledger restore, enable cloud backup, commission working ships or appoint Captains.

**Do not run `SUPABASE_LEDGER_INTEGRITY_88171.sql` as-is.** It is an unchanged historical reference with a known server-schema mismatch. No SQL is required for this upload.

---
## Retained prior-release documentation (historical, not a new test claim)

# Dark Sky 8.8.17.13 — KeelGuard

## Scope and release decision
A test-site hardening release based on the exact Ledger TouchSafe archive. No vessel, media, feature, stored order, ledger record, namespace, authentication check, or existing file is removed. No SQL is executed or required. This build does not commission a live working ship, appoint a Captain, grant Admiral authority, promote Known Good, or verify a cloud backup.

## What changes
- Four current governance models match the runtime after review of their existing predicates. The doctrine, Golden Voyages, command model, and Admiral passage retain all original semantic requirements and nested historical course versions.
- Every versioned data-model file is inventoried by hash with its authored build. Historical models are explicitly retained references, not indiscriminately restamped as newly proven.
- The atomic loader SHA-256-checks the text bodies it executes and the four governance models before application scripts run. Same-build partial uploads can no longer pass simply because their version strings match. Manifest hashes are integrity checks, NOT an independent signature or authority grant.
- Readiness model failures identify the file, expected/found version, digest and failed condition. Network timeouts, HTTP failures, malformed JSON, missing hashes and changed guard conditions fail closed.
- The decision brief covers ALL failures first, then every warning. Passing source/model checks does not claim completed working-ship commissioning or a Captain handoff.
- LocalStorage degradation is WATCH when verified session diagnostics can continue; failed diagnostic fallback remains a HOLD. Neither substitutes for IndexedDB or a cloud backup. No automatic storage purge was added.
- Readiness history is mirrored in page memory and sessionStorage as well as legacy storage, with failures disclosed. Opening a view does not restamp the original report. The report has one run ID/time, snapshot metadata and a timestamped export filename.
- Findings are ordered holds-first, escaped for safe rendering, and carry visible evidence-scope and degraded-storage explanations. Ledger TouchSafe editing, protected amounts, history and exports are preserved.

## Do not run the bundled ledger SQL
`SUPABASE_LEDGER_INTEGRITY_88171.sql` is retained as a historical reference. It does NOT match the reviewed live membership schema and must not be applied as-is. Cloud-ledger migration, separate-device restore, actual membership-revocation tests, Vessel Captain acceptance and Admiral export/advice remain separate readiness work. Uploading this static release does not execute SQL.

## Deploy — first three actions
1. Extract `DarkSky881713-KeelGuard.zip`.
2. Open the single same-named folder.
3. Upload its 85 files to the existing test repository root, not the enclosing folder or ZIP.

Keep the same browser and site. Do not clear website data. Expect **8.8.17.13 · KEELGUARD**. Then run Fleet Readiness once and export the new report. The four diagnosed version holds should clear if the full release is served; real warnings and failures remain visible. A higher WATCH count can correctly expose legacy quota degradation previously called PASS.

No test fixture, browser seed or personal exported ledger is included in this package. Keep prior release ZIPs and both original ledger exports unchanged. A code rollback is not a data restore and must never be used to overwrite the working ledger.

---
## Retained previous release notes (historical)

# Dark Sky 8.8.17.12 — Ledger TouchSafe

Baseline: DarkSky881711-LedgerCloseout.zip. This is a targeted correction-form touch/focus repair, not a cloud cutover. No stored ledger entry is automatically changed.

## Field symptom and repair

The iPad field test reported off-target taps/typing: the payment-reference focus ring was visible while unintended text appeared in the amount field. The precise native Safari failure was not reproduced in this runtime. Inspection found simultaneous smooth scrolling and programmatic text-input focus inside a fixed scrolling ledger overlay; this risky interaction has been removed rather than compensated with guessed screen offsets.

The correction form now opens on a single-column document-flow page. Its input ancestors are not fixed, transformed, animated, or nested scrollers. Only established background command surfaces are temporarily suspended; their display/inert state and scroll positions are restored on Cancel or completion. Authentication and recovery overlays are not hidden by that suspension. Opening the page focuses a non-editable container, never an input; the user chooses the input by a normal tap. No scrolling/focus timers run while typing. A visible Active field indicator reflects native focus.

Review status uses three visible native radio choices, including Ready for accountant. It does not carry forward an old approval selection. Payment-reference labels explicitly bind to the field. The amount, customer and purpose are disabled and hidden until CHANGE AMOUNT OR TRANSACTION DETAILS is deliberately chosen. Any unlocked amount must be a positive plain decimal; letters, scientific notation, signs and more than two decimal places are rejected before a preview. A deliberate amount change remains visible in the before/after preview.

The existing reason, preview, confirmation, append-only history, fresh-authority checks, stale-revision protection, double-confirm protection, recovery and both exports remain. The To Check review subcount now includes unverified legacy approvals.

## First iPad check

Do not save the currently misaligned form or clear website data. Upload every file INSIDE this release folder to the SAME GitHub Pages repository root. Use the same Safari browser and site. Normal reload discards the old unsaved form. No SQL migration is required.

Verify **8.8.17.12 · LEDGER TOUCHSAFE** in the Engine/Fleet Ledger. Open Captain Watch → Open Fleet Ledger → Simple Books → Captain Operations, 2026. Choose CORRECT RECORD on the existing $1 test whose reference starts with Enter. This now opens the document-flow editing page, not a floating form inside the ledger.

Tap Payment reference and replace it with `Test-Check-1002`. The focus outline and Active field indicator must both identify Payment reference; only that field should receive typing. Select Ready for accountant. Reason: `Correct test reference and remove unintended approval.` Keep the amount protected; do not unlock transaction details for this test.

Tap PREVIEW CORRECTION. Verify exactly two changes: the reference and review status. Amount must remain $1.00. Stop before confirming until the input alignment has been checked. Once verified, CONFIRM CORRECTION saves one new history record. Expected known field fixture: two payments, Money In $2.00, Money Out $0.00, remaining $2.00, To Check 0, five total history records. Those expectations are not synthetic records inserted into the real book.

Then normal Safari reload/sign-in and both actual exports remain the closeout checks. Full History JSON is an audit snapshot, not a tested restore feature, independently signed proof, or a Supabase backup.

## Verification limits

21 isolated cases passed using the actual ledger module/styles in Chromium with synthetic fixtures and in-memory storage/authority adapters. Coordinate tapping, real browser text focus, keyboard input and layout were exercised. Viewport resizing is not the native iPad keyboard. Native Safari, native IndexedDB reload persistence, actual downloads and complete fleet integration were not tested here. This is a repair candidate for field verification, not a claim that the device-specific bug is already proven fixed.

Test adapters, fixtures and test exports are not in this ZIP. The original user CSV is not modified or included. Media/branding, SQL, owner page, core project runtime, style registry, project data and auth boundaries are preserved. The release folder/ZIP share one unique name and use normalized timestamps with both local ZIP time and Unix UTC metadata.

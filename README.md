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

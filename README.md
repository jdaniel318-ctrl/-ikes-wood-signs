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

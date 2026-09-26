# 8.8.17.12 — Release Acceptance

## Evidence scope

Chromium 144.0.7559.96 rendered the actual module and styles in an isolated about:blank harness. Navigation is administrator-blocked in this runtime; no browser policy was changed. Storage and authority used synthetic in-memory adapters. WebCrypto was adapted to SHA-256 and export blobs intercepted. These are NOT native Safari, native persistence, real-download, or full-fleet authentication tests. No test adapters/fixtures are shipped. The original device-specific off-target typing has not been reproduced locally.

## Current isolated checks

1. **PASS — Baseline fixture loads four history rows with two $1 payments.** 
2. **PASS — Upgrade preserves two payments and four existing history rows.** 
3. **PASS — Editor uses document flow; no fixed, transformed, or nested scrolling input ancestor.** 
4. **PASS — Background ledger suspended while editing; amount disabled until deliberate unlock.** 
5. **PASS — Coordinate tap and typing reach payment reference only.** 
6. **PASS — Visible review choice responds to coordinate tap.** 
7. **PASS — Coordinate tap and typing reach correction reason only.** 
8. **PASS — Coordinate targeting and drafts survive four viewport sizes; no horizontal overflow.** 1366x460, 1024x768, 768x1024, 390x700. Resize simulation, not native keyboard.
9. **PASS — Preview contains exactly reference and status changes; no write before confirmation.** 
10. **PASS — Edit preview preserves draft and protected amount.** 
11. **PASS — Accidental letters/exponents/signs/excess decimals cannot reach confirmation.** 
12. **PASS — Deliberately unlocked amount change is explicitly shown in preview.** 
13. **PASS — Cancel restores ledger and scrolling without changing any stored entry.** 
14. **PASS — Double confirm appends exactly one verified correction; old rows unchanged; balance $2.00.** 
15. **PASS — Simulated reopening with retained store preserves five history rows without duplicate recovery.** 
16. **PASS — Generated export blobs: CSV reconciles two payments; history JSON verifies five rows and SHA-256.** 
17. **PASS — Repeated editor open/cancel and Escape restore the underlying ledger.** 
18. **PASS — Authority expiration blocks confirmation without new data.** 
19. **PASS — Separate approval retains required attestation and preview; Cancel does not write.** 
20. **PASS — Queue-origin edits retain explicit amount changes in preview and on Edit Changes.** 
21. **PASS — No unhandled JavaScript errors in functional harness.** 

## Packaging gates

Packaging results are checked again from the final extracted ZIP: JavaScript/JSON and inline-script syntax, static HTML IDs/local references, required runtime files, release identity, exact inventory, production-only payload, 84 checksums for 85 files, archive CRC, one same-named release folder, and normalized timestamps. Protected baseline files are compared byte-for-byte; unchanged files are not evidence that all their runtime behaviors were retested.

## Required field gates — pending

- [ ] The existing site and normal Captain route open the new release without a mixed-build hold.
- [ ] Taps focus the labeled field on iPad Safari, including after scrolling, keyboard appearance/dismissal, rotation and screenshots.
- [ ] Typing the payment reference does not alter the amount, reason or purpose.
- [ ] Visible review choices respond and preserve the chosen state.
- [ ] Amount remains protected unless deliberately unlocked.
- [ ] Cancel discards the draft and restores the same ledger/scroll context.
- [ ] Correct only the test reference and unintended approval: preview shows exactly those two changes and unchanged $1 amount.
- [ ] Confirmation adds one correction, leaving two payments/$2 and five history records for the known starting fixture.
- [ ] Normal Safari reload and actual CSV/JSON downloads agree with the saved ledger.

Supabase backup/synchronization, independent accountant approval, and restore-from-export are not proven by this patch.

## Measured static packaging results

PASS: 10 external JavaScript files, 5 inline scripts, 48 JSON/webmanifest files, 568 unique static HTML IDs, 10 resolved local reference paths, 45 required runtime files, and exact 85-file inventory.

Release timestamp: 2026-09-25T20:55:27-04:00 (America/New_York).

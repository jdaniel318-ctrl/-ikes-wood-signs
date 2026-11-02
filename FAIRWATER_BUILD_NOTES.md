# Fairwater — 8.8.20.85

Upgrade from the complete 8.8.20.84 Rosewood source. Upload every file in the upload archive over the repository root, keeping all other files. The full backup is application source only; it is not a backup of customer records or photographs. No deployment, email or database action was performed while building this release.

## Customer changes

- Prepare for Mail leads to Share with Mail, with the intended recipient visible. On devices without file sharing, Download complete ZIP becomes primary and an addressed email draft remains available. The user finishes sending in Mail. Opening a draft does not attach a file.
- Recipient: ikeswoodsigns.orders@yahoo.com. File checksums and detailed contents are in a disclosure. Direct provider delivery remains under Other delivery options, preserving future integration options and existing duplicate-send protections.
- Typing contact information and notes invalidates approval and prepared files without rebuilding unchanged photo/preview nodes. The first edit after approval removes the frozen proof correctly.
- The fleet paste listener honors data-bf-trim="preserve", matching the shared input policy. Validation still occurs at review boundaries.
- Smaller and Larger lettering buttons change size in five-percentage-point steps, clamp to 10–100, and support undo. Supplied board dimensions and pricing length are retained.
- Explicit provider rejection retains HTTP status and does not guess that a paid subscription is required. No provider retry occurs automatically.

## Verification and limits

Focused browser checks use Chromium with synthetic fixtures and intercepted provider/native-share boundaries. Real clipboard checks also ran against the sealed index in isolated preview; no live send occurred. Native iPad Safari paste and Mail attachment behavior still require physical acceptance. Inbox receipt and CNC import/cutting are not certified.

The older VERIFY_SHOPCRAFT_UI.cjs fixture predates required Boardcraft loading and the Ike image asset; it is retained unchanged for history and is not the current customer acceptance harness. Current customer coverage is VERIFY_BOARDCRAFT_CUSTOMER.cjs, VERIFY_FAIRWATER_UI.cjs, VERIFY_ROSEWOOD_UI.cjs and the sealed entry checks. Do not interpret archived test descriptions as evidence for this release.

## Build ledger

1. Isolated Rosewood archive into a sibling Fairwater source tree; baseline 26 offline groups passed.
2. Added behavioral regressions; observed expected failures for preview replacement, missing size buttons, old Mail ordering, unsupported sharing visibility, paste preservation and rejection diagnosis.
3. Implemented bounded runtime changes; customer data schemas and delivery authority unchanged.
4. Independent read-only review: no critical runtime findings. Repaired existing customer harness for collapsed disclosures; added board-size assertions.
5. Final focused checks and exact-source offline package verification recorded in FAIRWATER_EVIDENCE.json and external PackageProof.json. Native acceptance remains pending.

## iPad acceptance

1. Open the saved Andie Rose design; verify board measurements, use Smaller/Larger and Undo, then return to the request.
2. Paste into name and notes, then edit a few characters. Check text and focus remain stable and approval resets after any change.
3. Prepare for Mail, share to Mail, verify ikeswoodsigns.orders@yahoo.com and the ZIP attachment, then send once. Confirm the received ZIP opens and includes the preview, board details and artwork before treating the handoff as accepted.

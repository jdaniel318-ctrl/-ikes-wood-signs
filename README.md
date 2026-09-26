# Dark Sky 8.8.17.11 — Ledger Closeout

Baseline: DarkSky881710-LedgerRecoveryKeel.zip. This is a local-ledger correction and audit-export release, not a cloud cutover.

## What changed

Every transaction now has a visible **CORRECT RECORD** button, including completed records. Older transactions are reachable through **SHOW 25 MORE RECORDS** rather than being permanently hidden after the first twelve rows.

Corrections require a reason, a before-and-after preview, and **CONFIRM CORRECTION**. A save appends one correction with the original transaction ID and previous revision ID. Originals and earlier corrections are not overwritten. No-op changes, stale previews, mismatched book scope, and repeated confirmation taps are blocked. Saves merge against the current durable book in a read/write transaction so parallel saves cannot replace one another's records. Recovery also merges against a fresh durable read; earlier source storage is not deleted.

Ordinary entry and queue-completion controls no longer offer Accountant approved. Ready for accountant is the completion state. A separate **RECORD ACCOUNTANT APPROVAL** action in Record Details requires an actual accountant/firm name, date, safe evidence reference, an explicit operator attestation, and its own preview/confirmation. This does not independently verify an accountant or professional approval. Earlier approved selections without attestation are visibly labeled as unverified legacy selections and return to the attention queue; their saved history is not rewritten.

**ACCOUNTANT TOOLS** provides two distinct exports. The accountant CSV contains one current row per transaction, plus revision IDs/counts, the original creation time and explicit approval basis. The full-history JSON contains the selected book/year's originals, every correction, recorded or explicitly inferred legacy predecessor links, and a SHA-256 checksum of its payload. Historical correction amounts are replacement snapshots, not extra payments. Formula-like text is protected in the CSV presentation; the JSON retains exact stored text. A download request is described as prepared, not as proof the browser saved a file.

The Accounting basis label now distinguishes cash-basis accounting from a payment method such as Check. The review-queue card is visibly actionable. Editor fields and preview layouts adapt to iPad and iPhone widths.

## Closeout on the existing iPad

1. Upload every file inside this release folder to the existing GitHub Pages repository root. Do not upload it as an extra nested site folder. Keep the same browser and website address; do not clear website data. No SQL migration is required for this patch.
2. Verify **8.8.17.11 · LEDGER CLOSEOUT**. Open Captain Watch → Open Fleet Ledger → Simple Books → Captain Operations, 2026.
3. On the existing $1 ledger test whose reference starts with `Enter`, tap **CORRECT RECORD**. Set only Payment reference to `Test-Check-1002` and Review status to **Ready for accountant**. Keep amount, date, name/purpose, and original identity unchanged. Reason: `Correct test reference and remove unintended approval.`
4. Tap **PREVIEW CORRECTION**, check the two before/after values and unchanged $1.00 amount, then tap **CONFIRM CORRECTION** once. The expected book still has two payments and $2.00 Money In, $0.00 Money Out, $2.00 remaining, and To Check 0. With the four preexisting history records from the field test, the new total is five history records, not five payments.
5. Close, refresh normally, sign back in, and reopen that same book. Export both the accountant CSV and full-history JSON from Accountant Tools. Compare the saved values and original IDs. The CSV should have two current rows and the history JSON five original/correction records for this test state.

Do not delete or recreate either payment. This release does not automatically repair, rename, approve, or fabricate any of your existing records.

## Verification and limits

The release includes 18 passing isolated functional/layout cases described in RELEASE_ACCEPTANCE.md. Functional storage tests used a serialized in-memory IndexedDB test adapter; native browser navigation/storage/download testing was not available in this environment. Chromium rendered the correction and export controls at iPad landscape, iPad portrait, and iPhone dimensions. Native iPad Safari saves, actual refresh durability, download behavior, and the full-site authority route remain field checks. These tests are not a claim of production readiness or verified Supabase backup.

All code, JSON, HTML, local-reference, inventory, checksum, archive, and release-identity checks are recorded separately in the acceptance document. Test harnesses, fixtures, test downloads, and the user's uploaded CSV are not in the deployment ZIP.

## Boundaries preserved

The Captain session remains browser-local and separate from Admiral authentication. The new read-only Captain session witness does not grant authority. Admiral corrections require explicit Admiral context and active identity; no old actor label is inherited as authority. Project/program keys remain canonical and corrections/exports use the exact selected book. Fleet Core identities, project assets, owner routes, scheduler behavior, test/private-preview guards, and the service worker's identity-only design are preserved. No server schema, owner record, entitlement, email, or payment service was changed by this build.

This full-history JSON is a portable audit snapshot. It is not an automatic restore feature, a tested restore, an authenticated signature, or a cloud backup.

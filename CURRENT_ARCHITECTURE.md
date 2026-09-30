# Dark Sky 8.8.18.3 — BloomFit

**Decision:** focused Becca customer-experience hardening candidate. This release follows the successful BloomStart field check and the user-observed message/preview issues. It is not a live-order, pricing, contract, billing, signing, or production-handoff certification.

## What changed

- Becca’s card-message limit increases from 32 to **120 characters**.
- Flower messages trim accidental leading/trailing whitespace after paste, on blur, and again before preview/review/submit. Internal spaces and line breaks are preserved.
- **Script** becomes the flower-message default; Classic and Bold remain available.
- The customer preview now keeps the flowers visually primary and presents the message in a lower florist-card panel with length-aware type sizing instead of oversized centered lettering.
- Final/review preview uses the same card-message treatment, and generated approved-preview imagery follows the same lower-panel wrapping intent.
- The flower private-preview/test banner moves away from the business header so it no longer covers the Becca’s Bloom Shop wordmark. Live-customer chrome is unchanged.

## Preserved boundaries

- Photo-first ordering is unchanged in this release.
- Pricing remains unconfigured for Becca’s test project.
- Private Preview remains no-records. No customer/order records are created by preview.
- No Supabase migration, role, appointment, agreement, signature, fee, payment, or commercial activation is performed by this static build.
- Existing Admiral/Captain/session hardening, DraftWatch protections, vessel isolation, contract drafts, and Fleet Core records are retained.

## Field checkpoint

1. Upload all 85 files from the same-named release folder and confirm **8.8.18.3 · BLOOMFIT**.
2. Open Becca’s Bloom Shop through Test/Preview → Private Preview and run Photo → Message → Preview.
3. Paste a message with accidental outer spaces and confirm the counter/preview uses the cleaned text. Try a short and a longer message; flowers should stay visually primary.
4. Confirm the private-preview banner no longer covers Becca’s header.
5. Stop before final submission. Do not approve, Sea Trial, publish, or create a live order for this CX check.

Do not clear website data or run either bundled SQL file.

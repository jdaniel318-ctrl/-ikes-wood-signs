
## 8.8.19.1 FleetIdentity
- Fleet Mission Control now renders each vessel's project-owned canonical logo when available.
- A compact LOGO action routes directly to that exact vessel's Project Graphics → Project Logo / Mark editor.
- Upload/replace still uses the existing project-scoped graphics store and Engine mutation boundary; no cross-vessel asset copy is introduced.
- Saving one Project Logo updates the shared project asset used by Fleet Mission, Project Control, customer shells that consume the logo slot, and project preview surfaces on this browser profile.
- This is presentation/identity only: vessel ID, namespace, owner, Captain, ledger, orders and authority do not change. Cross-device/cloud logo custody is not claimed by this static release.

## 8.8.19.1 — FleetIdentity

FleetIdentity moves Black Flag from feature-by-feature testing toward one fleet operating truth. The Engine now presents a five-stage vessel mission view: Commissioned → Authority Assigned → Operational → Producing → Recoverable, plus explicit Owner/Captain posture and one Next Required Proof per vessel. The panel is read-only and does not manufacture authority, billing, contracts, production state, or server appointments. BloomPrivacy customer-photo protections remain preserved.


## 8.8.18.5 — BloomPrivacy

Becca test-vessel CX hardening: one **ADD FLOWER PHOTO** action delegates source choice to the device (Photos, Camera, or Files). Flower image bytes stay in the active browser session for Private Preview; Sea Trial persistence records metadata only, not the photo/approved-preview bytes. Production flower-photo submission remains held until private production media custody is explicitly commissioned. No fleet financial, customer, ownership, or authority sharing is introduced.

# Dark Sky 8.8.18.4 — BloomPick

**Decision:** focused flower photo-source repair candidate. Native iPad Photo Library/camera acceptance is pending. This static release does not activate a business or grant authority.

## Change

- Separate **CHOOSE SAVED PHOTO** (image file input without `capture`) and **TAKE PHOTO** (image file input requesting `capture="environment"`). The browser/OS controls the native chooser UI.
- Both sources use the same validated image-read path. Confirm Photo stays unavailable while reading, or when there is no decoded image.
- Canceling a chooser or failing to read a replacement preserves the currently chosen photo. A replacement clears the old final approval.
- A new order clears both file inputs and the transient image previews. Delayed reads cannot repopulate a reset, detached, hidden, or different-project shell.
- Read/decode failures and a 20-second read deadline give a persistent local status, not a silent dead end.
- No automatic photo history: the user explicitly chooses their earlier image from the device again.

## Preserved

BloomFit's 120-character flower message, Script default, card styling, normalization, and preview-banner placement remain. Other business templates, contracts, fees, owner/Captain authorities and preview no-records behavior are unchanged except release labels. No database, order, appointment, live publication, email, signature or payment call was performed during this repair. Customer photos and private agreements are not packaged.

## Field checkpoint

1. Upload the 85 application files from the same-named folder; confirm **8.8.18.4 · BLOOMPICK**.
2. Open Becca's Test / Preview → Private Preview. Start the flower flow and select **CHOOSE SAVED PHOTO**. Use the device's Photo Library or Files picker to select the earlier arrangement photo.
3. Confirm the visible image, continue to the message, and stop before order submission. Native chooser behavior is not certified by a Chromium fixture.

Do not clear website data or run either bundled SQL file. Keep private JSON/HTML agreements out of GitHub.

---

## Prior release record (unchanged)

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

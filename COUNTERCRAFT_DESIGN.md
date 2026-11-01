# Countercraft — Ike’s complete customer-to-owner experience

Status: approved by the user for implementation. Countercraft 8.8.20.77 implements this design as a Sea Trial candidate. Native iPad and live customer acceptance remain separate gates.

Prepared 1 November 2026. Source baseline: Black Flag 8.8.20.76 TradeWinds, commit `3282db5`. Countercraft is a working release name; the next version is assigned during implementation.

## Intent and selected approach

The customer picks up Ike’s iPad, photographs a plank, designs a sign, checks the proof, and submits a complete request without someone narrating every step. Ike receives an organized job he can review, amend with the customer, price, accept, and progress through pickup. Preserve the existing sign logic and use lessons from the fleet to make both experiences clearer and more dependable.

The user explicitly selected the complete customer-to-Ike experience. CX means the customer’s self-service journey; EX means Ike’s owner/operator experience receiving and completing that work. The main setting is the shared shop iPad, with the same essential functionality available on iPhone. Existing own-board requests remain supported.

### Approaches considered

| Approach | Benefit and tradeoff | Decision |
|---|---|---|
| Refine the customer journey while retaining the present file/email handoff | Smaller change; improves instructions and touch use, but leaves Ike assembling requests from packages and messages | Not selected |
| Connect guided customer design to a structured owner inbox and job lifecycle | Addresses self-service and the handoff together; needs a new guarded customer intake service and private media handling | Selected by the user |

This is a substantial project within the existing application, delivered as one coherent candidate with independently verified components. It is not a new generic fleet dashboard.

## What exists and what is missing

Read-only source inspection and live backend metadata inspection established:

- The customer welcome currently offers both the traditional guided sign flow and a separate Shopcraft request. The guided flow contains plank analysis, owner-rate pricing, A/B lettering, fit/approval logic and an in-flow camera. Its Headway complete-job path still has explicit non-preview stock/species and backup requirements.
- Shopcraft/Boardcraft already preserve the selected board photograph, vector design, frozen approved proof, contact details and a complete portable package. The local store has exact scope and revision checks. Its customer UI starts a fresh request on reopening; it does not supply an owner request inbox.
- `owner.html` currently reads the selected business’s local IndexedDB orders into `business_deck.js`. Its existing order detail is a review surface, not a full production workflow.
- The live server has `fleet_business_orders`, owner read/upsert/snapshot functions and vessel-Captain status functions. These are not a complete anonymous customer intake contract. Existing upsert/snapshot functions can replace payloads and do not supply the new immutable approval/operation rules.
- No Edge Functions were listed. No stock/customer intake functions or tables were found in the inspected public and `fleet_private` namespaces. These are dependencies to build, not capabilities to assume.
- The live Ike vessel is `staging`, `owner_operated`, `owner_assigned`. This design does not change its lifecycle or appoint anyone.
- TradeWinds supplies useful save/receipt/recovery patterns, but its Admiral-only quote workspaces do not authorize customer submissions and are not an artwork/media store.

The new path will reuse the existing rendering, validation, packaging and owner presentation components through adapters. It will not claim that historical preview profiles are newly verified manufacturing fonts.

## Goals and success criteria

1. A first-time customer can finish one sign request on the iPad without external camera, email-attachment or file-extraction chores on the normal path.
2. A complete receipt identifies the same job and revision Ike opens, including the exact approved proof and all required media.
3. Interruptions preserve recoverable work, uncertain submissions are reconciled, and repeated taps cannot create duplicate jobs.
4. Ike reviews the entire job in one place and handles only decisions requiring his judgment.
5. The next customer cannot see the previous customer’s work or use owner authority.
6. The result strengthens reusable fleet behavior while preserving branding, data boundaries and existing authority.

Success requires an actual iPad submission and independent owner readback, not merely a successful package download or a mock server test. Later production-file acceptance remains separate from a physical machine cut.

## Customer journey

Retain the established guided ordering logic. Consolidate the two competing starts into one prominent **Design my sign** entry, with the relevant stock/own-board choice inside it. Existing deep links remain compatible and route into the correct mode. Existing step identifiers can remain internally; customer wording should describe their current task and progress.

| Moment | Customer experience | Required behavior |
|---|---|---|
| Start | Ike’s name, character, colors and a clear invitation | Fresh customer session, blank contact fields and blank design; no sample words inserted into their sign |
| Photograph | Take the actual plank photo inside the journey; retake or rotate there | Reuse existing capture and image logic; saved-photo fallback; retain image proportions and photo lineage |
| Check the plank | Understand which wood/standard size is known and what needs Ike | Reuse recognition as evidence. An owner-published stock association may supply nominal size/species. An uncertain result becomes a review question rather than an endless photograph loop |
| Make it yours | Enter exact words; select lettering, finish and optional graphics; see changes on the board | Preserve case, intentional spaces, punctuation, orientation, undo and geometry. Basic editing first; existing advanced editor remains reachable |
| Review | Inspect a large readable proof, price or price-review state, quantity and details | Freeze the exact approved layout. Missing required glyphs or invalid geometry need an explanation and an editable correction, never a silent replacement |
| Contact and submit | Enter name and at least one usable contact method, review the complete summary, then deliberately submit | Existing supported contact preference retained. No owner account or Admiral PIN is required of a customer |
| Receipt | See request number, saved revision, proof and the next expectation | Say **Received by Ike’s shop — awaiting review** only after a committed complete server receipt. This does not imply Ike has opened or accepted it |
| Finish | Keep an optional receipt; choose **Next customer** | Remove access to the previous session and return to a clean welcome without clearing all Safari website data |

The final customer approval covers the current complete request. A relevant edit to wording, artwork, photograph, placement, material decision, price, finish or quantity invalidates approval and requires a new review. Contact-only corrections are versioned and visible, but do not pretend to change the original design acceptance time.

### Standard stock, own board and pricing

Keep photo-first recognition and existing owner-controlled species/linear-foot rules. Add a narrowly scoped owner-maintained prepared-stock record: stock identifier, species, nominal pricing length, optional actual dimensions, availability, and revision. The customer may associate the photographed plank with an owner-published stock identifier using a short rack code or a guided selection. QR scanning is an optional enhancement, not a required new customer task.

Photo evidence never silently creates owner confirmation. Nominal pricing length does not establish actual cutting dimensions. A mismatch or uncertain association is retained for Ike’s review.

When the current published stock and pricing rules fully support a price, show the calculated price and its saved basis. If required information is missing, show **Ike will confirm the price** and allow submission as a design request. Do not invent a price, use an unconfigured default, or call the price “estimated.” A request can be complete for review while material, price or production acceptance is still pending.

Owner setup publishes only the necessary customer stock/rate information. It is distinct from saving private settings. Missing setup does not stop design requests; it limits what the app can confirm. Prices and stock revisions are rechecked at submission. A changed rate that affects a displayed price requires a fresh customer review.

Prepared-stock association is not a stock reservation in this release. Two requests for the same unique plank are flagged for Ike; the app does not promise that both have reserved it. Full inventory allocation and payment collection are outside this release.

### iPad interaction and fleet learning

- Wonderwake: one understandable action at a time, feedback beside the action, deliberate finger/Pencil behavior and reliable undo. Subtle transitions respect reduced motion and never delay the next action.
- Highwater: keep the current task and primary controls accessible with Safari chrome and the keyboard visible. Inputs remain readable; narrow/split-screen layouts stack naturally.
- HouseHull: provide a clear final summary and an optional receipt/PDF that opens or downloads without losing the working page.
- TradeWinds: distinguish local draft, uploading, unconfirmed result and verified receipt. Preserve operation identity through recovery.
- Legacy: requested timing and confirmed pickup remain different facts.
- Fleetcare: back navigation preserves the useful place in Ike’s queue; customer routes return to customer context.

Retain Ike’s bright yellow/blue/red/green identity, cartoon character and handmade tone. Keep technical hashes, release labels and platform controls out of the normal live customer journey. Private Preview/Sea Trial retain their honest mode labels.

## Ike’s experience

Extend his existing owner entrance, navigation and business styling. New inbox data comes from the guarded service; historical local orders remain visible with their actual source. Do not silently import, overwrite, reprice or merge them.

The inbox should answer: what arrived, what needs my decision, and what is already underway. A job opens with the frozen proof, plank photo, exact wording, specifications, customer contact, pricing basis and any unresolved decisions. Show meaningful facts; do not invent sales or payment metrics.

Ike can:

1. Review the submission, confirm stock/species/actual dimensions and price, or record a specific question.
2. Create an amendment using the existing design editor. It is a new version with the original proof retained. The changed proof/price needs renewed customer acceptance.
3. Accept the job for production after the applicable review checks, prepare a readable job sheet and the supported artwork package, and record progress through pickup.

### Revisions and corrections

Initial scope supports customer reapproval on the shop iPad. From the owner view, **Review with customer** issues an expiring one-job review session; entering the customer surface must remove privileged access from that browser context. The customer can view the revised proof and deliberately accept or decline it. The response is an event for that exact amendment. Returning to owner actions requires owner authentication.

For a customer who has left, Ike can deliberately open the existing email/phone contact route with a clear correction summary. Sending remains his action. A complete remote customer account/approval portal and automatic notifications are not part of this release. Until acceptance is recorded for the revised content, the amendment remains awaiting customer approval. An owner cannot substitute his own click for the customer’s acceptance.

### Job states

| State | Entry condition / allowed progress |
|---|---|
| Received | Complete initial request committed; enters Ike’s review queue |
| Needs details | Ike records the missing decision or question; existing submitted proof retained |
| Awaiting customer approval | Revised proof, specifications or price is ready for customer review |
| Ready for production | Customer approved the current relevant revision, Ike confirmed required material/price/production-review facts, and he explicitly accepted the job |
| In production | Ike explicitly starts work; snapshot of accepted production facts retained |
| Ready for pickup | Ike records completion; requested date remains separate from any confirmed date |
| Collected | Ike records handoff; history remains available |
| Declined / cancelled | Explicit reason and event; no deletion and no automatic refund/payment implication |

State changes carry expected job version, actor, time and reason where needed. Duplicate commands return the original receipt. A backward correction creates an audited event and cannot silently remove required approvals. Editing the design during production creates an amendment and a hold; it does not overwrite the production snapshot.

“Ready for production” is Ike’s recorded business decision. It does not certify CNC calibration or cause a machine to run. If the selected renderer has no verified exportable geometry, a machine-ready package remains unavailable and the job sheet states the missing check. Existing supported SVG/DXF export uses the approved vector version; no font substitution, photo-as-toolpath or universal machine-code promise.

## Shared iPad privacy and recovery

Customer mode must carry no usable owner/Admiral credential. The new intake capability can act only on its current customer session; it cannot list or read other jobs, change rates or approve production.

Before handing the owner’s browser context to a customer, the app must end its privileged session locally and clear private rendered views/caches. Reopening an owner URL, browser Back, bfcache restoration or another tab must require current authorization. Existing sessions on other devices are not globally signed out. This behavior needs a concrete shared-device acceptance test.

GitHub Pages paths share an origin. Path names and hidden buttons are not browser-origin isolation. The release may claim verified server scope and deliberate shared-device session separation only. If those boundaries cannot be demonstrated with the existing auth storage, shared-device live mode stays disabled until a separate customer origin or equally effective session design is supplied; do not weaken owner authentication to ship.

During the active customer session, save recovery checkpoints after meaningful changes and display failure honestly. Durable kiosk recovery must not expose plaintext customer media or contact details to the next customer. The proposed implementation uses encrypted local recovery with a per-session data key and an owner-recoverable envelope. The envelope’s public key is scoped/versioned by the server; private recovery material remains server-side and is usable only through fresh exact-vessel owner authorization. The implementation plan must specify key generation, custody, rotation, retained old-key access and recovery tests before using this scheme with real data. Encryption primitives and library selection are builder decisions subject to review.

Recovery scope is explicit: **unfinished drafts and retained uncertain-operation payloads are recoverable from their originating iPad**. They are not silently uploaded before submission. Once submission commits, Ike can read the confirmed job from another authorized device. His phone may reconcile a known server operation, but cannot retrieve a draft whose only bytes remain on an offline iPad. The owner recovery queue must label device-only entries accordingly. Losing or clearing that device can lose those unsubmitted drafts; this release does not claim cloud backup of every keystroke.

**Next customer** removes the active customer’s keys/capabilities and private UI, while retaining sealed pending recovery for Ike. An unconfirmed operation stays in the owner recovery queue with its stable identifier; it is not automatically resent. A short idle privacy cover hides personal information; it is not a claim that unfinished work was deleted. Browser storage eviction and a device failure before a completed checkpoint remain explicitly outside any guarantee.

## Backend and data contract

Reuse the existing Supabase project and owner identity. Add a purpose-built intake service; do not call an Admiral quote RPC or expose an owner-upsert function to customers. New normalized job/revision/receipt/media records should live behind narrowly granted interfaces in `fleet_private`, with RLS as defense in depth. The exact table names are left to the implementation plan.

Keep new canonical jobs separate from the legacy mutable order payload until all writers can respect the new invariants. Adapt both sources into the existing owner UI with explicit source/version identity. New jobs must not be editable through old snapshot/upsert/status functions. This avoids weakening the complete-job contract or changing every vessel’s historical orders.

Core entities:

- **Published shop configuration:** exact vessel, backend/environment, site/deployment, mode, publication revision, owner stock/rate revision and allowed customer capabilities.
- **Customer session:** random capability, exact scope, expiry, one active draft, quotas and revocation state. Tokens are never placed in analytics, URLs or ordinary logs.
- **Job:** stable server ID, human-readable request number, exact scope/source, current immutable revision, lifecycle/version and timestamps.
- **Job revision:** canonical request, approved proof reference, design/render version, media manifest, material and pricing decisions, customer acceptance and required-review facts.
- **Media:** immutable bytes, type/size/hash and project/job association. Photos and artwork remain private. A metadata row alone does not mean an upload completed.
- **Operation receipt:** stable operation ID, content digest, outcome and committed revision. Same operation with different content is rejected.
- **Events:** actor/authority, before/after version, explicit action, timestamp and reason. Customer receipt, owner opening, owner acceptance and production are distinct events.

All customer access derives from a server-published exact shop context and scoped session capability. A client URL, local `deployed` flag, a guessed project ID, CORS origin or a publishable API key alone is not authorization.

For this pilot, **Ike enables the shop device once using his existing exact-vessel owner access**. Enroll a revocable device credential bound to the approved shop/deployment and mode. Prefer a non-exportable browser key and server challenges rather than a permanent bearer secret in a URL. A valid enrolled-device proof is required to mint each fresh customer session. The device credential permits intake only; it cannot read submitted jobs, private settings or other customer sessions. End the privileged browser session before handing over the iPad. Revoking enrollment blocks new sessions and further writes under its customer sessions, while preserving all committed jobs. This is a software device authorization, not proof of physical location or hardware attestation.

The intake endpoint remains rate- and byte-limited with request validation and per-vessel circuit limits. A visitor to the ordinary URL does not automatically receive the pilot intake capability. Existing public design/download/email behavior remains available under its current rules until public intake is separately reviewed. No new paid service is presumed. Broader public-web intake must not be enabled merely because the in-shop pilot works.

Owner reads/writes require a verified current auth session and active, unrevoked exact-vessel `project_owner` membership. New paths must check expiry/revocation on the server, not rely only on cached UI state. Do not broaden access to historical aliases. Existing scoped Captain and Admiral duties remain unchanged; Admiral observation is read-only and does not acquire owner mutation rights.

### Submission and reconciliation

1. Customer reviews the complete snapshot. Save its canonical digest and a stable submission operation locally before dispatch.
2. The intake service validates scope, publication/config revision, schema, required inputs and limits. It issues operation-specific staging destinations. Upload normalized photos, proof and artwork using bounded private objects.
3. Validate all required object bytes/types/hashes and pricing/stock decisions. Finalization must protect verified bytes from outstanding upload credentials: staging uploads cannot overwrite committed media. Commit the immutable revision, job and receipt transactionally only after complete asset verification.
4. Read back the exact receipt. The customer sees a received state only for the matching scope, operation and digest. Media failure cannot produce a complete receipt.
5. A timeout is unconfirmed. **Check result** is a read. If the original operation can safely continue, an explicit retry reuses its identity and verified uploaded assets. No refresh, reconnect or login automatically repeats a submission.

Media storage and database commit are not one transaction. The implementation must handle orphan staging objects, expiry and interrupted finalization explicitly. Never delete referenced committed media during cleanup. Do not put large images into Quartermaster snapshots. Retain the existing input normalization and bounded photo count; the plan must derive and test explicit total-job, individual-file and device-storage limits from the current renderer/package limits before activation. Do not solve overflow by silently dropping a photograph.

Private Preview remains memory-only and cannot contact intake or send messages. An explicitly entered Sea Trial uses synthetic data and a distinct server mode/namespace; it does not create a real production job. Ike’s current staging lifecycle must not be silently promoted to live.

## Delivery, receipts and export

The normal submission lands directly in Ike’s inbox, so the customer does not need to extract a ZIP or select a mail application. A successful server receipt is authoritative for that intake, while “Ike has reviewed” requires a later owner event.

Keep optional customer receipt/PDF and the complete owner package. Generate them from the saved revision, not current unsaved settings. The owner can download the board photos, frozen proof, brief and supported editable/vector files together. The existing email handoff remains available deliberately as an alternative/export; it must not silently send a second request after an uncertain inbox submission.

On the **shared shop iPad**, do not download a customer PDF/ZIP or invoke Mail by default. Provide an optional **Keep a receipt on my phone** action while the customer is present. It creates a short-lived, read-only, single-receipt transfer capability displayed as a QR code; the customer opens it on their own phone and can download there. The receipt excludes private owner notes, all other jobs and unnecessary customer contact fields. Use a random secret in the link fragment exchanged for a narrowly scoped session, remove it from the address after exchange, apply no-store/no-referrer behavior, and never log it. Proposed initial limit: one successful redemption within 15 minutes. The customer's phone receipt session lasts at most one hour and can read only the captured committed receipt revision. Next customer removes the shop's copy of the transfer code; an already-issued transfer may remain valid until its short expiry so the customer can finish on their phone. It has no amendment, order-list or owner permission.

Owner-authorized exports remain available with a clear indication that files leave the app. The app cannot erase screenshots, Files downloads, browser history or other operating-system content. Shared-mode acceptance is therefore about no default personal files left on the shop device and no exposure through the app or its privileged session. Existing personal-device download flows remain supported. No customer phone or receipt transfer is required to submit a request.

No automated customer email/SMS, payment capture, refunds, tax advice, machine execution or promised pickup date is introduced by saving or submitting a request.

## Backup, rollout and boundaries

Existing local orders and backup files are preserved. Add a private export for new jobs including revision history, decisions, events and every referenced media object. Validate an export by independent extraction and hash comparison; rehearse restoration into an isolated test store. Do not claim disaster-recovery readiness from a source ZIP or a metadata-only export.

Release in this order: build/test the isolated interfaces; prove the complete synthetic journey; perform the staged iPad-to-owner pilot; then present the verified candidate and activation prerequisites. Backend additions and customer publication are separate deliberate steps. Do not change memberships, passwords, PIN/session limits, fleet commissioning, existing email credentials or other vessels to pass the pilot.

Deliver the established single-folder upload ZIP, full source backup, rollback overlay, evidence and a three-step field guide when implementation is complete. Rollback restores software; it must preserve new server jobs/media and give Ike an export/read path before any older frontend becomes the active interface. Deployment and real customer activation require their own verified readiness and authorization, not an assumption from this design choice.

## Acceptance evidence required

| Area | Evidence |
|---|---|
| Existing logic | Retained representative plank, species/nominal-size, wording/case, A/B and vector proofs; no substitute glyphs or changed approved geometry |
| Standard and unknown material | Owner-published stock/rate yields its correct saved basis; uncertain own-board request completes as review-needed without invented price |
| End-to-end receipt | Customer submits once; independent owner session reads matching ID/revision, wording, proof and every asset |
| Interrupted operation | Lost response after commit reconciles without duplicate; upload failure cannot show received; explicit retry keeps identity |
| Concurrent editing | Two owner sessions cannot overwrite the same version; unchanged approved snapshot remains available |
| Amendment | Ike revises proof/price; old approval cannot authorize new content; customer reapproval is tied to exact version |
| Shared device | Next customer, reload, Back/bfcache, another tab and owner-route attempt cannot expose prior personal details or usable privileged session |
| Isolation | Other-vessel, wrong environment/site, expired/revoked owner, guessed job ID and customer attempts at owner mutations are rejected |
| Files | Downloaded receipt matches saved job; portable package extracts with all required photos/artwork; missing export geometry is explicit |
| Backup | Export and isolated restore reproduce complete synthetic records and media; legacy local records remain unchanged |
| Native device | Real iPad camera, Pencil/finger where supported, keyboard, rotation, Safari share/download and iPhone owner review |

Use targeted meaningful tests, the existing release checks and a fresh code review. Automated browser fixtures, actual backend proof, native Safari evidence and physical machine acceptance must remain separately labeled.

## Decisions proposed by Bootstrap for review

- Start with the in-shop iPad and existing phone compatibility; keep own-board design requests within the same journey.
- Let uncertain material/pricing continue to a complete review request while preserving all evidence and holds.
- Make direct structured inbox delivery the normal path; retain optional portable files.
- Support in-person amended-proof approval in this release; defer a customer account portal and automated messaging.
- Use new immutable job records behind the existing owner experience, preserving legacy records in place.
- Enable intake only on an owner-enrolled shop device during the pilot; visitors to the URL do not gain intake access automatically.
- Recover unfinished work on its originating iPad; confirmed jobs are available across authorized owner devices.
- Offer optional receipt transfer to the customer's own phone, keeping ordinary shared-iPad submission free of downloaded customer files.
- Keep public activation off until staging, recovery, isolation and native-device checks pass.

The builder may settle file names, internal module boundaries, field layout, animation details, search/filter implementation and cryptographic library choices within these contracts. They may not silently change customer/owner authority, pricing policy, approval semantics, publication state, data retention of accepted jobs or the selected end-to-end scope.

## Sources and inspection references

Local source: `index.html`; `app.js` guided Ike/Headway paths; `ike_shop.js`; `ike_shop_core.js`; `ike_shop_store.js`; `ike_shop_delivery.js`; `boardcraft_photo.js`; `carvewright_studio.js`; `owner.html`; `business_deck.js`; `quartermaster_sync.js`; `HEADWAY_HD1_SPEC.md`; `BOARDCRAFT_GUIDE.md`; `HIGHWATER_GUIDE.md`; `TRADEWINDS_GUIDE.md`; `FLEET_LEARNING_REGISTRY.json`.

Live metadata read 1 November 2026: Ike lifecycle/operating model; public order tables and selected function definitions; `fleet_private` table/function inventory; Edge Function inventory. No customer records, media, memberships or configuration were modified.

Current platform references checked during design: [Supabase private storage](https://supabase.com/docs/guides/storage/buckets/fundamentals), [asset access](https://supabase.com/docs/guides/storage/serving/downloads), [Edge Function authentication](https://supabase.com/docs/guides/functions/auth). Recheck current APIs and changelog before implementation; the markdown changelog fetch was unavailable through the browsing service during this design review.

## Builder review

A fresh independent builder reviewed the design on 1 November 2026. Three planning questions concerned who can start pilot sessions, where unfinished recovery exists, and whether customer downloads leave private files on the shared iPad. The explicit defaults above resolve those questions. These are Bootstrap's proposed implementation choices for the Captain's review, not claims of earlier user approval or implemented behavior.

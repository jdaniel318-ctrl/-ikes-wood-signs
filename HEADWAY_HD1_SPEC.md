# Headway 8.8.20.36 TEST — HD-1 build specification

**Status:** Design for Admiral review. Not an implemented update, upload package, or production approval.  
**Prepared:** 18 October 2026.  
**Starting point:** The actual `DarkSky882035-Keelmark-TEST.zip`, SHA-256 `caad2688ec14b80f6e23f8acc6994001df61af63734309acce33c8d43960f058`.  
**Mission:** Make the existing fleet easier to operate, and carry one practical Ike’s sign job from its chosen plank to an honest, complete owner record. Preserve what has already worked.

## 1. Decision for this release

The Admiral approved the heading in the conversation. HD-1 translates that heading into a concrete scope for review before an implementation plan and application changes.

Headway is one release candidate with three separately testable components: **fleet screen behavior**, **Ike’s nominal-size decisions**, and **Ike’s job-record handoff**. Work on each has its own acceptance gate. Passing a layout test does not pass authentication, manufacturing accuracy, or storage durability. A component blocked by an unresolved dependency must be identified as blocked, not disguised by the release name.

A cosmetic-only release would leave the customer trapped at plank confirmation. A broad rewrite or a simultaneous new-estimator launch would add avoidable uncertainty. The chosen course is a targeted change to the existing paths, with isolated tests before a new ZIP.

### Observable results

| Component | User-visible result | Evidence required |
|---|---|---|
| HW-VIEW | A new screen opens with its identity, title, and next action visible; the useful iPad task is compact without tiny text | Fresh load, real sign-in return, navigation, keyboard, orientation and Back-to-list checks |
| IKE-SIZE | A prepared or explicitly accepted nominal two-foot plank does not require repeated photos to resolve fractional inches | Exact-plank/source binding, authorized decision, unchanged geometry, negative and cross-vessel tests |
| IKE-JOB | One new test job retains the selected plank, exact wording, price basis, approval and approved preview through the owner view | Independent read-back and media comparison after a deliberate synthetic submission; adverse storage tests |

## 2. Non-negotiable boundaries

Keep Keelmark’s owner-session repair, separate server identity and browser namespace, normal Ike’s and Legacy logos, per-vessel identity, existing lettering references and geometry, and every historical order. Do not merge repeated orders, reinterpret missing payment status as debt, reprice old work, grant roles, replay commissioning, or create a replacement HouseHull.

No app feature is removed merely to shorten a screen. Reports, settings, services, branding, lettering evidence and engineering tools remain reachable from the proper role. No customer route gains owner or Admiral authority through a URL, a size selection, a test badge, or a copied local receipt.

Private Preview remains a no-record simulation. Sea Trial remains a separate deliberately entered, explicitly labeled test-data path. No new automatic messages, invitations, orders, approvals, submissions or retries are introduced. Failure and unknown outcome remain different states.

Headway must not silently change passwords, installed plugins, paid subscriptions, database schemas, repository deployment settings or server membership. New server writes need a separately reviewed contract and authorization tests before connection to real records.

The proposed number **8.8.20.36** is reserved for the eventual Headway candidate; it has not been applied to Keelmark or any live page by this document.

## 3. HW-VIEW — shared screen behavior

### Scope and architecture

Add a small, presentation-only viewport/navigation adapter and scoped layout styles. Integrate it with existing screen transitions rather than replace the route or authentication system. Proposed new files: `fleet_viewport.js` and `fleet_viewport.css`; final names are fixed in the implementation plan.

Integration sites are `app.js` / `index.html` for the Engine and customer experiences, `owner.html` / `business_deck.js` / `business_deck.css` for owner work, and `captain.js` plus the existing command-surface roots for Captain/Admiral work. HouseHull adopts the common layout contract when its existing prototype is developed; this does not implement or commission that estimator.

The adapter accepts an explicit **surface identity, scroll container, visible header landmarks and navigation reason**. It must have no storage-writing, network, identity-selection or permission-grant behavior.

### Opening-position contract

Fresh entry, successful sign-in landing and deliberate navigation to a different screen begin at that screen’s intended top. First allow the correct destination markup to settle, then position once relative to the actual scroll container and header. A stale asynchronous transition cannot reposition a newer screen.

Returning from an order detail restores that same business’s query, filter, sort, pagination and deliberate list position. Ordinary input, background/foreground switching, receipt rechecks and a resize must not forcibly reset the page. Opening the keyboard may scroll to the focused field; it must not lose entered text or expose another surface.

**Source finding:** `setScreen()` already attempts a top reset (`app.js:11944–11965`), and owner transitions have their own resets (`owner.html:615–631`). Therefore the implementation must first reproduce the clipped-title state and inspect actual container scroll and header overlap. Adding a repeated timer that continually forces top is explicitly rejected.

### iPad and iPhone arrangement

Use one compact company header, a clear task title, direct navigation, and the primary task/action. Size against available browser space with Safari controls present, not the device’s full pixel dimensions. Keep the software-keyboard-closed primary task as the one-screen target.

For Ike’s owner Today: reduce the introductory hero, show real active-work counts and useful queue context, keep Orders prominent, and move secondary tools to a clearly labeled secondary area without deleting them. Do not invent dashboard metrics.

For the customer: photograph/review controls and the next action belong beside or directly below the usable image. Eliminate duplicated decorative header/footer presentation within the task, keeping the underlying artwork available. The private-preview banner must not cover a heading or a control. Hide platform-only tools only through the correct session/surface rules, never by weakening access checks.

On iPhone, stack the same functionality in one column with natural vertical scrolling. Long records and history may use sections, paging or scrolling on either device. Do not use fixed page heights, clipped overflow, forced zoom or tiny text to claim one-screen success. Primary controls target at least 44 × 44 CSS pixels; essential text and inputs target at least 16 CSS pixels. These are Headway design targets, not a claim of complete accessibility certification.

Test representative tablet content viewports of 1024 × 640, 1024 × 768, 1366 × 900, and 768 × 900; phone viewports of 390 × 700 and 430 × 800; and narrower/split-screen layouts. Larger text and keyboard-open tests allow more scrolling, never content loss. Measure the user’s actual Safari content area during field acceptance.

## 4. IKE-SIZE — practical sizes without invented precision

### The approved rule

A board reasonably close to two feet can be treated as a standard two-foot board for Ike’s current pricing and ordering. The photographed SMOKE HOLE! example is accepted in the conversation as nominal two feet. No further tape reading is requested for that example.

This is not a universal rounding rule. No inch tolerance, nearest-foot algorithm, or default allowance for HouseHull has been approved. Standard/pricing length is separate from measured physical length and separate from the usable lettering face.

### Recommended customer flow

**Choose a prepared stock plank → photograph that actual plank → show its accepted standard size → design.**

Use a prepared stock identifier with owner-recorded nominal size where that association exists. Otherwise provide an explicit owner-review path, not repeated photographs to force an algorithm to converge. The customer identifies a plank or requests assistance; the customer does not type a technical length or press an owner-approval button.

Matching a photograph is a suggestion unless tied to a trustworthy exact-stock record. A product label or inventory selector must not be silently manufactured from an aspect-ratio guess. A repeated estimate can corroborate image quality but cannot establish a physical scale or a new owner decision.

The first preview acceptance test uses an explicitly labeled synthetic prepared plank with nominal size 2 ft. It does not hard-code the user’s real photo as a globally accepted calibration sample.

### Decision data and authority

A proposed nominal-size decision records: schema version; exact vessel/project; stock ID or draft-plank ID; source-photo lineage; nominal feet; decision source; decision time; policy revision; and, for a genuine owner action, the verified actor and evidence of the permitted action. Sources are `owner_stock`, `owner_decision`, or `preview_fixture`. A visual suggestion remains a separate candidate and is never converted to `owner_decision` by the customer.

`physicalLengthFeet` remains absent unless separately measured. No access token, password or global authority receipt is stored in a customer-readable decision.

Owner decisions require the existing owner authentication and an exact-vessel permission recheck. A browser-local claim is not server authorization. For non-preview use, the decision must be obtained or validated through a reviewed server-authorized stock/decision path. **The inspected ZIP alone does not establish that such a path already exists.** If it is absent, Headway must keep real owner-acceptance activation held and report that dependency; a mock is never presented as a live owner service. Designing/testing the interface requires no permission migration.

An acceptance is bound to the chosen plank, not every board near the same apparent aspect ratio. Replacing the source photo invalidates a photo-bound decision; retaining a stock decision requires the same verified stock association. Supported rotation retains lineage and transforms the display without changing the nominal size or enlarging the usable face.

### What acceptance does and does not unlock

Use exact wording such as **“Standard size: 2 ft”** and **“Size accepted by owner”** only for an actual authorized decision. Preview uses **“Test standard size: 2 ft — simulation.”** Unknown sizing says **“Needs Ike’s size decision”**, without an endless extra-photo demand.

Accepting size must not automatically accept species, price, customer design, cutting geometry or obstacle clearance. Existing species suggestions remain explicitly distinct from owner confirmation. The headline reflects the entire current gate: use “Size accepted; wood confirmation needed” rather than “Plank ready” when a separate required check remains open.

Price uses the accepted nominal length and applicable configured species rate/rules. Do not replace current rates, infer missing quote rules, or retroactively apply a new size decision to an approved order. Old length-candidate fields remain legacy evidence; Headway does not relabel them as measured facts.

Keep A/B geometry and the real visible plank outline untouched. Nominal length is a commercial category, not permission to stretch artwork over an edge or certify missing characters.

## 5. IKE-JOB — prove the existing save chain

### Reuse before adding

Keelmark already has `stageIkeApprovalArtifact`, `lockIkeApprovedDesign`, `approvedPreviewData`, `approvedDesignLock`, `pricingProof`, `plankRecognition`, and their owner-reader mappings. This release must test and strengthen that chain rather than introduce an unrelated second order system.

Use a versioned, additive job-contract field for **new test records only**, preserving existing compatibility fields. No bulk rewrite of historical records. Display absent legacy values as absent; record a mapping defect separately from a truly missing value.

### Required handoff contents

Preserve the exact business/order/draft revision, source-photo representation and lineage, accepted nominal-size decision, species decision/source, actual wording including case and intentional spacing, style ID/version, orientation/fill, agreed price with its rule revision, staged preview artifact, and customer acceptance time.

Distinguish **preview generated at** from **customer approved at**. In the current source, a timestamp is created while staging the render lock; Headway must explicitly capture the actual acceptance event too, without changing old timestamps.

Bind the approval to the precise draft revision and artifact. Changing size, species, price, photo, style, wording, orientation or fill invalidates the staged approval for the changed draft and requires a new preview/acceptance. Existing approved orders remain immutable; a genuine amendment is a new revision, never an in-place historical rewrite.

The owner view displays the same stored approved image. Never regenerate it from today’s settings and call it the original approval. A hash is an integrity comparison, not an identity signature or proof of manufacturing correctness. Missing geometry must remain an explicit production-review condition.

### Save, read-back and adverse storage contract

A deliberate submission gets a stable operation ID and exactly one write attempt. Freeze the submitted snapshot while pending. A confirmed read-back must match the exact vessel/order/revision and required fields/media before showing the complete-save state. Refresh, navigation, reconnect and sign-in perform reads or reconciliation, not new submissions.

If the result is unknown, retain the operation identity and show **“Save unconfirmed — recheck”**. After read-back establishes that no record exists, any further write requires a new explicit user action; there is no background replay.

**New source finding:** `putOrderWithQuotaRecovery()` currently makes up to three attempts and can omit `photoData` on its last fallback while retaining the approved preview and a degradation flag. A synthetic diagnostic reproduced that exact branch. It is not proof of missing historical photos. For the new complete-job path, do not silently enter this fallback or call a partial-media save complete. Preserve the draft, show a low-storage hold, and offer an explicit recovery/export path. No automatic removal of historical records, reference media or audit history is authorized.

Define the retained source as the chosen, disclosed app-resolution photo representation, separate from the composite approved preview. This is not a promise to keep the full-resolution camera original in the Photos library. Establish the representation before submission; do not omit it during recovery and still label the packet complete.

### Storage readiness before field writes

Before changing a field-test store or adding a new test order, rehearse an exact-vessel export and restore using an isolated synthetic copy. Include both media and metadata, compare hashes/IDs/counts, reject wrong-vessel/conflicting imports, and demonstrate that a malformed backup does not mutate the destination. Restore rehearsal never runs over the user’s original browser database. Export preserves genuinely absent legacy fields/media as absent and reports them; restore verification compares with the exported snapshot, not with information that was never recorded.

A code ZIP, metadata-only mirror or successful login is not a business-data backup. This component does not silently migrate browser-local orders to Supabase. Real server durability, full backend authorization and controlled migration require their own reviewed delivery before production use.

Private Preview executes the review flow in memory with **no persistent order, report, lifecycle, contact or notification writes**. To prove persistence, use isolated automated storage first, then a separately deliberate labeled Sea Trial after the backup gate. Never use the protected VoyageKeeper operations as order probes.

## 6. Source ownership and change map

| Existing source | Headway responsibility | Preserve |
|---|---|---|
| `app.js:setScreen`, command navigator; `index.html`; `styles.css` | Reproduce viewport fault, integrate scoped screen adapter and customer task layout | Route/role separation, camera lifecycle, test boundaries, other businesses |
| `owner.html:sessionValid`, owner navigation; `business_deck.js/.css` | Compact owner surfaces and preserve list-return state | SureFoot exact-business binding; detail view remains non-editing |
| `captain.js`, current command roots/styles | Adopt shared opening/keyboard/scroll behavior | Admiral observation vs operation; permissions and no-repeat commands |
| `app.js:ikeLengthEvidenceFromGeometry`, `ikeCombineLengthEvidence`, `updateUi`, confirmation handler | Separate suggestion, nominal acceptance and exact measurement | Existing geometry/edge detection; no new alphabet |
| `app.js:recalcIkePrice`, `ikeRecognitionForOrder` | Use explicit accepted pricing-length provenance | Existing rates and historical prices |
| `app.js:stageIkeApprovalArtifact`, `lockIkeApprovedDesign`, `saveOrder`, `putOrderWithQuotaRecovery`, `submitOrder` | Complete snapshot, actual acceptance event, once-only save and read-back/hold behavior | Existing approved artifact, customer text, preview/Sea Trial separation |
| `business_deck.js:orderView` | Read the complete new contract with honest legacy fallback | No guessed missing values, no silent repricing, no cross-project records |
| Existing release manifest, inventories, hashes and verifiers | Final package agreement and additive preservation | Historical evidence and unchanged images/SQL retained |

These are ownership boundaries, not a license to rewrite entire large files. New isolated helpers should carry the new contracts; only the relevant integration points should change. Exact helper signatures and tests belong in the implementation plan after HD-1 review.

## 7. Release acceptance and honest reporting

### Baseline checks completed during preparation

The actual Keelmark archive was read and CRC-checked; all 133 file entries were safe to extract. The unmodified source passed **80 Node checks** again: Workhorse 24, SteadyHand 20, Ironbound 16, Keelmark 20. A separate synthetic diagnostic reproduced the three-attempt low-storage branch. **No Headway runtime test has passed because Headway has not been implemented.** No fresh browser, hosted-startup or backend audit is claimed by these checks.

### Required new checks

| Area | Required evidence before claiming completion |
|---|---|
| Screen opening | No covered identity/title/action on every changed surface; stale transition canceled; no forced top on typing/recheck |
| Back navigation | Exact business, query, filter, sort, page and intentional position retained |
| Device behavior | Tablet useful workspace, phone stacking, orientation, larger text, keyboard and modal exit remain usable |
| Nominal size | Authorized exact-plank decision; empty/invalid decision rejected; foreign/expired/copied authority denied; replaced photo cannot inherit another plank’s decision |
| Commercial separation | Accepting 2 ft does not approve species, price or production; HouseHull never inherits Ike’s allowance |
| Job packet | Photo and approved preview both survive independent read-back; exact case/spacing and accepted price unchanged |
| Approval | Changing one bound input invalidates the new draft approval; historical order is untouched |
| Failure handling | Quota abort, unknown outcome, duplicate tap, rejected media, interrupted transition and re-entry cannot silently resubmit or report incomplete data as complete |
| Isolation | Private Preview has no writes; labeled trial writes only in its test scope; no contacts/messages or foreign records |
| Recovery | Full-media exact-vessel backup and isolated restore comparison; wrong-vessel and malformed restore rejected |
| Packaging | One coherent release identity, matching scripts/manifests, baseline preservation and byte-exact delta reconstruction |

Reuse all still-applicable inherited behavioral tests. Keep identity-pinned old-release checks as historical, and adapt target-label checks explicitly for .36; do not delete a failing behavior assertion to turn a suite green. Distinguish simulated browser results, full hosted boot and native Safari field evidence.

### Field handoff after the release is actually built

Use three focused actions at a time. First verify the new version and screen opening; then one nominal-size preview flow; then one properly authorized labeled persistence test only after backup readiness. Do not make the Admiral repeat previously passed checker examples unless a changed dependency requires regression proof.

Package an upload delta from the supported baseline and a separate full recovery snapshot. Keep the upload at no more than **85 files**; never claim its count before packaging. One uniquely matching outer folder, aligned fresh timestamps, preserved historical source and clear install/rollback instructions are required. No ZIP is produced by HD-1.

## 8. Tools and control of work

Use the available local archive/code tools for source inspection and reproducible checks. Use repository-based development and a reviewable branch when actual repository actions are available; verify access by a real read before claiming the repository is connected. Do not install another database or buy another service for this design.

Test browser scenarios in a full startup context when available, with simulated service boundaries clearly labeled; native iPad Safari remains a separate field gate. A failed or blocked connection must not be worked around by broadening privileges. No live database query was required or attempted for this specification.

No paid tool is a prerequisite for writing or reviewing HD-1. Optional external real-device testing and a GitHub release gate remain separately approved workflow improvements, not purchases already made.

## 9. What the Admiral is being asked to approve

Approve the **three-component Headway scope and its boundaries**: fleet-wide viewport behavior, an Ike-specific nominal-size decision rather than repeated-photo precision, and a complete new-job handoff on the existing record system. Production server activation, cloud migration, HouseHull commissioning and broad role changes remain outside that approval.

After review, write the implementation plan with per-component red/green tests, exact files and interfaces, then build and verify the candidate. Keelmark stays the current deployed TEST baseline until a verified replacement is deliberately uploaded.

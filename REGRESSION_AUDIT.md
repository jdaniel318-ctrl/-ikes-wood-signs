# 5.8.0 Helm regression note

- Captain’s Quarters only: clean room asset + responsive real UI.
- No Black Flag authentication, Client Preview isolation, project admin, routing, or customer experience logic changed.
- Captain modal functions remain routed through existing proven controls.

# 5.7.9 Quarterdeck regression note

- Captain’s Quarters-only CSS/JS refinement.
- Black Flag 5615, Project Admin 4353, Captain 19613 unchanged.
- Client Preview pre-paint bulkhead unchanged.
- Real fleet snapshot populates Captain intelligence overlay.
- Captain modal/control IDs retained.

# 5.7.8 — Chartroom regression note

Captain's Quarters visual implementation is scoped to `#captainQuarters.cinematic-cabin-ready` and the Captain controller asset loader. Black Flag authentication, project isolation, Client Preview routing, project customer shells, and authority credentials are not modified by this visual pass.

# 5.7.8 Ironclad Regression Gate

- Engine PIN remains 5615.
- Project Admin default/recovery remains 4353.
- Captain's Quarters remains 19613.
- Client Preview PIN remains unique per invite.
- Black Flag gate DOM hooks from 5.7.3 remain present.
- No authentication/routing logic change in 5.7.8.
- Runtime/cache/manifest versions must all report 5.7.8.

# 5.7.3 Engine Entry Regression Gate

- Entering `5615` at the pre-login Black Flag portal must succeed even if `blackFlagPinSecurityV1.engine.lockedUntil` contains stale future state.
- Successful 5615 entry must clear Engine PIN failure state before crossing the boundary bridge.
- Incorrect PIN attempts retain the established brute-force lockout behavior.
- Project Admin remains 4353; Captain's Quarters remains 19613; Client Preview PINs remain invite-unique.

# Dark Sky 5.7.0 — Cloud Readiness Regression Gate

- Runtime executable references and service-worker cache identity must report 5.7.0.
- No navigation/client-preview path may require the current GitHub Pages origin or repository path.
- Required runtime assets must remain relative/application-local unless they are deliberate project-owned public source assets.
- Losing browser/device-local test state must not be described as a production recovery strategy.
- Project Admin 4353, Black Flag 5615, Captain's Quarters 19613, unique Client Preview PINs, exact Project ID isolation, and test outbound-contact safety remain unchanged.
- Future backend migration may change transport/storage implementation but not customer experience identity or security semantics.

# 5.4.0 Contractor Experience Regression Addendum

Checks required: Legacy Plumbing source assets are selected only for the Legacy Plumbing project; no other project inherits its logo or images. Plumbing preview opens at the landing page, service-card selection opens the guided intake, Back to Home returns to the landing page, and preview submissions do not persist. Project Admin 4353, Black Flag 5615, and Captain's Quarters 19613 remain unchanged.

# 5.3.2 Premium Landing Regression Addendum

- Verify structured intake JSON is parsed, not copied into project description.
- Verify Plumbing preview renders only plumbing/project-owned identity and services.
- Verify Help Now and every service card enters the same project-scoped intake.
- Verify private preview writes no records; Sea Trial writes only marked test records.
- Verify project asset lookup is keyed only to the active Project ID.

# 5.3.2 Preview Regression Addendum

- Accepted business-intake evidence now compiles into a runnable, project-scoped customer configuration instead of remaining advisory only.
- Plumbing intake creates a confidence-first landing page, plumbing-specific service categories, required email/contact capture, and a universal service-request workflow.
- Existing commissioned plumbing projects with intake evidence are upgraded deterministically at read time, so Preview is available without recreating the vessel.
- Project IDs, assets, orders, admin state, and runtime context remain isolated; the compiler never borrows another project's state.
- Authority spine unchanged: Project Admin 4353, Black Flag 5615, Captain's Quarters 19613.

# 5.3.0 Guided Intake Regression Addendum

- Commissioning website analysis tries direct fetch first, then a public-site reader fallback.
- Uploaded files are read locally and are never sent through the public-site fallback.
- Website failure does not block commissioning; file upload and manual Business Brief remain available.
- Intake recommendations remain editable and project-scoped.
- Project Admin 4353 / Engine 5615 / Captain's Quarters 19613 unchanged.

# 5.2.0 Engine Strengthening Regression Addendum

- Commission New Project appears in the Engine hero and routes to the canonical commissioning workspace.
- Project Command remains available and project cards retain exact Project IDs on every action.
- Project cards expose a single visually dominant next action while Control Center/Test/Seaworthiness remain secondary.
- Experience Test Deck copy distinguishes fleet-level Prepare from its Configure/Preview/Approve checklist.
- Project Control header artwork is project-owned, pointer-inert, and rendered beneath protected controls.
- Project Admin 4353, Engine 5615, Captain 19613 remain unchanged.
- No customer/order/asset query was broadened across project namespaces.

# 5.1.0 Authentication Regression Addendum

- Black Flag normal PIN: `5615`.
- Project Admin default/recovery PIN: `4353`.
- Captain's Quarters PIN: `19613`.
- Captain Test Access is session-only and is not a credential rewrite.
- Engine verifier accepts the historical default and an explicitly configured Engine PIN only.
- Project and Captain credentials are not consulted by Engine verification.
- One-time 5.1.0 repair clears only stale Engine lockout state created during the cleanup PIN regression.

# Dark Sky 5.0.3 — Authentication + Isolation Regression Check

## Required authority behavior

- Project Admin accepts 4353 across the fleet.
- Black Flag / Engine Room accepts 5615 in normal mode.
- Black Flag rejects 4353 in normal mode.
- Captain's Quarters remains 19613.
- Captain Test Access can only be enabled by providing valid Engine (5615) and Captain (19613) credentials.
- Once Test Access is active, Engine gates may bypass PIN entry for that browser session only.
- Project Admin continues to require its own project credential even while Test Access is active.

## Isolation behavior

- SIG → Project Admin → Black Flag must clear SIG protected/customer surfaces before Engine rendering.
- Selecting Ike, Mugs, Becca's, Grizzly, or SIG from Black Flag must establish only that immutable Project ID.
- No route may infer Ike as a default project.
- Orders/status writes require matching Project ID.
- Engine selection state and project customer/admin session state remain separate.

## Static checks for this package

- JavaScript syntax validated with Node.
- Duplicate HTML ids checked.
- Runtime asset references checked.
- ZIP integrity checked.

## 5.6.0 Fleet Customer Entry / UX regression targets
- Fresh entry into every customer project resets document + shell scroll to top.
- Private Preview and Test Experience always begin at the project's landing page top.
- Explicit Home returns to landing/top; intra-request Back retains the intended workflow step.
- Signal Restoration opens on a confidence-first landing page before damage-category intake.
- Signal Restoration, Mugs After Dark, Becca's Bloom Shop, Ike's, and universal transactional shells require valid email before final transactional submission.
- Customer visual/state data remains project-scoped; no cross-project fallback branding or scroll state.

## 5.5.1 test-contact gate
- [x] Non-live `tel:`, `sms:`, and `mailto:` actions are intercepted before browser navigation.
- [x] Web3Forms and legacy automatic email delivery fail closed for test/non-live orders.
- [x] Private Preview / Sea Trial request buttons are explicitly labeled as test actions.
- [x] Signal Restoration test calling remains non-live and its request CTA is explicitly marked as a test request.
- [x] LIVE external contact requires a matching deployed customer context.

## 5.6.2 cleanup verification
- Project Command remains project-scoped and preserves one primary lifecycle action plus Client Preview.
- Project Tools remain collapsed by default and retain Control Center, Internal Test, and Seaworthiness.
- Client Preview unique-per-invite PIN behavior remains unchanged.
- Authority contracts unchanged: Project Admin 4353, Black Flag 5615, Captain's Quarters 19613.
- Packaging removes only superseded audit notes; no runtime assets or application modules were removed.

## 5.7.3 Engine entry stabilization
- Black Flag 5615 is treated as a pre-storage entry invariant.
- The Engine transition is atomic: all project/customer/admin surfaces are hidden before the PIN cover is removed, preventing legacy Ike/project flashes.
- A secondary initialization or migration failure no longer revokes an already-authenticated Engine session or reopens the PIN gate.
- Engine render warnings remain visible/recoverable without silently locking the Captain back out.

## 5.7.8 Client Preview pre-paint isolation
- PASS: `index.html` detects `#client-preview=` in the head before body paint and arms `client-preview-preflight`.
- PASS: preflight CSS hides `#app`, Black Flag entry, Engine, Admin, Captain, test banner, and return controls until the Client Preview gate exists.
- PASS: `init()` routes Client Preview before IndexedDB/openDb, migrations, fleet materialization, and normal project restoration.
- PASS: the Black Flag portal does not remove `boot-locked` for Client Preview URLs.
- PASS: Client Preview clears every known project/fleet protected surface before installing its PIN gate.
- PASS: the preflight bulkhead is removed only after the Client Preview gate has been appended.

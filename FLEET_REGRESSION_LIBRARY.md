# Dark Sky 8.2.7 — Keelbook Fleet Regression Library

The Keelbook is the fleet's standing regression memory. A new build inherits lessons from the current working hull **and** the relevant project history; it does not get permission to rediscover solved failures.

## Sources in scope
Regression evidence may be drawn from relevant Dark Sky fleet work: Dark Sky / Black Flag Engine, Captain's Quarters, Admiral's Deck, Ike's / Ike Fit, Sign Stickers, Legacy Plumbing, Signal Restoration, Mugs After Dark, ScheduleJoe and other explicitly fleet-related vessels and hardening passes.

**Explicit exclusion:** the separate project/chat named **The situation** is not a Dark Sky source. Nothing from it may be imported, inferred, copied, learned, referenced, or used as a release requirement unless the Captain explicitly orders that transfer in a later mission.

## Release law
For every structural release:
1. Current build = working hull.
2. Relevant older fleet work = regression evidence.
3. Standing contracts = release gates.
4. Current mission = the only intentional delta.
5. A previously solved defect is a release regression, not a new discovery.

## Mandatory watch stations

### Harbor Light — boot and first paint
- Neutral Dark Sky first paint only until authority/project route is resolved.
- No project branding, logo, customer UI, or prior-vessel content may flash on another route.
- Route resolution is bounded; unresolved startup must fall into an explicit safe recovery/login state rather than hang indefinitely.
- Engine boot cannot depend on decorative/route media.
- Mixed-build execution is blocked before application paint.

### Watertight — authority and isolation
- Project Admin default/recovery PIN 4353 remains valid fleet-wide unless an explicit supported project-specific credential is additionally configured.
- Engine, Captain, Admiral and project-owner authority remain distinct.
- Owner entry must never require Engine authority.
- Test/preview credentials never widen project/admin authority.
- Every business/project remains namespaced by canonical project ID.
- No unauthorized cross-project records, assets, branding, photos, orders, customer information or state.

### True Helm — deterministic navigation
- Project ↔ Engine ↔ Captain ↔ Admiral transitions use explicit in-app routes.
- Browser Back is not a required workflow step.
- Refresh is recovery, not normal navigation.
- Return actions have deterministic destinations and preserve the appropriate session/authority.
- Buttons/tabs/actions look interactive and expose pressed/selected state.

### Mobile Watch — iPhone / iPad
- iPhone and iPad remain first-class surfaces.
- No viewport/scroll locks after horizontal swipes or protected-screen transitions.
- iPad landscape command surfaces remain usable without hidden critical controls.
- Customer content is not obscured by oversized test docks or diagnostics chrome.
- Transient confirmations remain readable long enough; consequential changes also leave durable visible state.

### Clean Wake — customer-surface discipline
- Customer routes do not expose Captain/Engine diagnostics, admin affordances or development chrome.
- Test/private-preview mode blocks real-world contact actions.
- Landing experiences begin at the intended top state and do not accidentally open form-first.
- Standalone vessels remain capable of independent deployment; fleet return controls are testing/operator affordances only.

### Owner Bridge — owner/operator continuity
- Owner/Partner Control Center remains independently accessible and project-scoped.
- Owner capability choices do not silently grant Captain/Admiral authority.
- Existing Overview / Orders / Customers / Operate / Insight / Experience / Access / System information architecture is preserved unless intentionally migrated.
- Shared services fail safely; loss of an optional Captain/Admiral capability must not sink the base owner vessel.

### Grain Guard — Ike's production truth
- Customer preview geometry must be the geometry Ike's machine can actually cut.
- Style A / Style B are fixed production alphabets tied to real machine output, not loose font families.
- Unsupported glyphs, lowercase, punctuation, spacing or fallback fonts are not invented.
- Blank wording renders a blank plank.
- Canonical production geometry is the source for preview, CNC outputs and derived inlay/decal cut paths.
- Customer plank photos/orders remain project-scoped and follow established lifecycle clearing rules.

### Foundry Watch — shared fleet capabilities
- Capability ≠ Vessel ≠ Service Instance.
- Shared schema never means shared visibility.
- Owner/operator vessels remain authoritative over their customers/products/operations.
- Captain/Admiral services receive only fields required by explicit, versioned service contracts.
- Supply-chain services stay at the lowest appropriate shared fleet level.
- Ike's remains its primary sign manufacturer; Foundry support begins as facilitation and may add capacity only when intentionally justified.

### Ledger House — business records and recommendations
- Vessel records remain authoritative and isolated.
- Standard business-event vocabulary may cover orders, deposits, payments, refunds, costs, production, inventory, vendor activity, taxes, service fees and fulfillment.
- AI recommendations are advisory, evidence-bearing and auditable; no consequential silent mutation.
- Aggregated fleet intelligence may inform strategy without exposing private vessel data to other owners.
- Commercial metadata may classify a shared capability as included/free/trial/flat/monthly/per-transaction/custom without forcing billing to be live.

### Quarterdeck — release packaging
- One clearly named top-level release folder.
- Root-upload-safe deployment files remain complete.
- No broken local references or duplicate DOM IDs in protected surfaces.
- JS syntax and JSON parse checks pass.
- Release build, seal, service worker, manifest and runtime expectation agree.
- Checksums are regenerated after final mutation.
- ZIP must be directly usable from iPad/Safari workflows.

## Promotion rule
A release can add new behavior only after it proves the inherited watch stations remain intact. New capability does not excuse regression in an older contract.

## Ike production integrity gate — 8.3.0
A release is HOLD for Ike if: (1) a glyph approaches/crosses the detected usable plank face, (2) the approved artifact/hash differs between Design Review, final customer summary, owner/admin or production export, (3) repeated Place Order creates duplicate IDs, or (4) normal accumulated test state can surface a raw quota exception instead of preserving the approved design and attempting safe storage recovery.


## Fleet Dock bounded first-paint gate — 8.3.5
- Fleet Dock may reconcile canonical registry state, but that work may not block a usable roster indefinitely.
- After a bounded window, paint the already-loaded project roster and mark it as verifying; reconcile in the background and refresh when complete.
- Search/filter interactions must not restart expensive canonical convergence.
- A persistent `READING FLEET` state with existing project data is release-blocking.

## Ike finished-sign face-grid proof — 8.3.5
- Keep the existing robust face-grid / fit-band placement and visible-glyph measurement intact.
- Style A remains anchored to RAMJET; Style B remains anchored to SMOKE HOLE!.
- Customer-facing proof must make the approved shop anchors explicit; no Style C or free-form fallback may be silently introduced.
- Do not alter protected orientation/species detectors while length remains a separate WATCH item.

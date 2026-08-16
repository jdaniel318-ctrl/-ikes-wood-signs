# v4.6.9 — Read-Only Test Deck / Cache Reset

## What 4.6.8 proved
- The screenshot after deployment still showed the same quota failure.
- Review found two separate issues:
  1. Test Experience still had quota-sensitive evidence/audit side effects in its opening path.
  2. The service worker cache identifier and asset manifest had remained on the old 4.6.1 values, so prior releases were not truly advancing the cache namespace.

## Structural repair
- Test Experience opening is now deliberately **read-only**.
- Project resolution uses `rehydrate:false`.
- Opening the deck emits no audit/localStorage write.
- Sea Trial evidence reads use a dedicated read-only order reader; local recovery mirror failures are ignored.
- Evidence-read trouble degrades to a visible read-only warning instead of preventing the deck from opening.
- Oversized disposable audit/telemetry/activity mirrors are relieved at startup; canonical IndexedDB project/order data is untouched.
- Service worker rebuilt with a genuine `dark-sky-v4-6-9-readonly-test-deck` cache and 4.6.9 asset URLs.
- Test Deck VERIFYING badge now shows the running build so deployment/caching can be visually confirmed.

# v4.6.8 — Storage Pressure / Quota Repair

## What the Sea Trial exposed
- Safari reported **“The quota has been exceeded.”** when reopening the Experience Test Deck.
- The customer flow stores full photo and approved-preview media in IndexedDB, but the legacy localStorage recovery mirror was also duplicating those base64 images.
- Audit/activity telemetry were allowed to throw quota errors back into otherwise successful command routes.

## Structural repair
- localStorage order recovery is now metadata-only; full media remains in the canonical IndexedDB order record.
- Existing image-heavy local order backups are compacted automatically during startup.
- Local activity/audit/telemetry logs are bounded and quota-safe.
- Noncritical audit logging can no longer make Experience Test Deck opening fail.
- A successful canonical Sea Trial metadata write remains successful even if a secondary audit/activity log cannot be written.
- No project/order isolation boundary was weakened and no canonical IndexedDB order/photo record is intentionally deleted.

## Preserved
- v4.6.1–4.6.7 customer navigation/media/choice/action recovery.
- v4.6.4 Seaworthiness Command Spine.
- Fleet Commissioning, project isolation, refresh security, Captain's Quarters, and Shipyard.

# v4.6.7 — Customer Journey Action Repair

## Root cause
- Customer navigation, media, and selectable inputs had already been moved to early storage-independent modules.
- Bespoke customer CTAs such as **REVIEW MY ORDER** were still attached later inside `bindEvents()`.
- That allowed the journey to reach Step 9 with a fully rendered Review button that had no active handler.

## Structural repair
- Adds `bindCustomerActionCore()` as the early owner for customer journey CTAs.
- REVIEW MY ORDER, PLACE MY ORDER, START ANOTHER ORDER, COMPLETE, and submission retry now bind before IndexedDB/migrations.
- Removes the duplicate late action bindings so each CTA has a single owner.
- REVIEW failures surface in the customer form error area; order-placement failures surface on the approval screen instead of appearing as dead controls.

## Preserved
- v4.6.1 customer navigation recovery.
- v4.6.5 customer media recovery.
- v4.6.6 customer choice/input recovery.
- v4.6.4 Seaworthiness Command Spine and Fleet Commissioning structure.

# v4.6.6 — Customer Choice Command Repair

## Root cause
- Customer navigation and media controls had already been moved to early, storage-independent command modules.
- Font/style selection (and the other customer choice controls) still depended on the late `bindEvents()` sequence.
- This allowed the customer journey to reach Step 6 while the visible font cards had no active selection handler.

## Structural repair
- Adds `bindCustomerChoiceCore()` as an early-bound customer interaction module.
- Price, orientation, font style, letter fill, contact preference, custom color, top-side, and wording controls now bind before IndexedDB/migrations.
- Removes their duplicate late bindings so each control has one owner.
- Font selection immediately updates selected styling and the sign preview through the existing `updateUi()` / `applyPreview()` path.

## Preserved
- v4.6.1 customer navigation recovery.
- v4.6.5 customer media recovery.
- v4.6.4 Seaworthiness Command Spine and Fleet Commissioning work.
- Refresh security, project isolation, Captain's Quarters, and Shipyard.

# v4.6.5 — Customer Media Command Repair

## Root cause
- Customer step navigation had already been promoted to an early mission-critical binding path.
- Camera and photo controls were still attached later inside the full `bindEvents()` sequence.
- If storage initialization, migrations, or another late binding step was interrupted, the customer could advance to the photo screen while **START CAMERA** had no handler.

## Structural repair
- Adds `bindCustomerMediaCore()` as a dedicated early-bound customer command module.
- START CAMERA, TAKE PICTURE, CANCEL CAMERA, saved-photo fallback, and RETAKE are armed before IndexedDB and migrations.
- Removes the old duplicate late camera/photo bindings so there is one owner for these controls.
- Camera command failures now surface in the photo-step error area instead of appearing as a dead button.
- Updates stale Version 1.2 camera help text.

## Preserved
- v4.6.1 customer navigation recovery.
- v4.6.4 Seaworthiness Command Spine.
- Engine refresh security posture, project isolation, Fleet Commissioning, Captain's Quarters, and Shipyard.

# v4.6.4 — Seaworthiness Refit

## Command spine
- Adds one early capture-phase Seaworthiness Command Spine for the routes that must survive storage, migration, and renderer failures.
- Fleet Commissioning open/close, project-to-Engine return, Project Control close, Experience Test Deck close, and commissioning next-step routing are owned by this spine.
- Core route handlers are armed before IndexedDB and optional initialization work.
- Critical command failures now surface a visible command-route warning instead of leaving a dead-looking control.

## Commissioning Dock refit
- Rebuilds the Fleet Commissioning modal as an operational vessel screen rather than a flat checklist.
- Adds vessel status, visual gate progress, a highlighted next required gate, and an explicit next-workstation action.
- Distinguishes cleared, next-required, and pending commissioning gates.
- Captain's Final Order remains locked until the existing technical commissioning rules are actually satisfied.
- No commissioning standards were weakened or auto-passed.

## Preserved
- v4.6.1 customer navigation recovery.
- v4.6.2 Operation Prove the Fleet.
- v4.6.3 declarative Fleet Commissioning routing.
- Refresh-to-Engine security posture, project isolation, Captain's Quarters, Shipyard, and project-scoped data boundaries.

# v4.6.3 — Commissioning Dock Command Repair

## Root cause
- The permanent **OPEN IKE'S DOCK** control depended on `renderFleetCommissioning()` completing before its click handler was attached.
- If Engine startup or commissioning rendering was interrupted, the control could look fully active while having no action.

## Structural repair
- The permanent dock control now uses the same declarative `data-open-fleet-commissioning` command used by dynamically generated vessel cards.
- A document-level delegated commissioning handler owns the command, so opening a vessel dock no longer depends on the async Fleet Commissioning renderer finishing.
- The renderer-specific `onclick` assignment was removed to eliminate duplicate/competing bindings.
- A visible failure message is now shown if the dock command itself throws.

## Preserved
- v4.6.1 customer-navigation recovery.
- v4.6.2 Operation Prove the Fleet scorecard.
- Engine boot gate, project isolation, Captain's Quarters, Shipyard, and Fleet Commissioning standards.

# v4.6.2 — Operation Prove the Fleet

## Fleet Commissioning becomes the operating scorecard
- Keeps the existing Dark Sky hierarchy; no new Admiralty layer was added.
- Adds an explicit Operation Prove the Fleet mission lane to the existing Fleet Commissioning Dock.
- Shows every current vessel as a commissioning scorecard with status, gate progress, and the next provable move.
- Keeps Ike's as Vessel #1 / reference vessel without automatically treating later projects as equivalent.
- Fleet proof is derived from the existing seven commissioning gates; no new unverified telemetry was invented.
- Captain commissioning remains a deliberate final act after technical gates clear.

## Release posture
- Built directly on v4.6.1 Customer Navigation Recovery.
- Engine boot gate, project isolation, Captain's Quarters, Shipyard, and customer-navigation recovery are preserved.
- Build/cache identifier advanced to 4.6.2.

# v4.6.1 — Customer Navigation Recovery

- Preserves the Dark Sky 4.6 Fleet Commissioning hull and Black Flag boot gate.
- Binds Ike’s core customer step navigation before IndexedDB and migrations.
- Prevents a storage startup interruption from leaving START YOUR SIGN and other basic step controls visually present but unresponsive.
- Leaves persistence-dependent order saving behind the existing database boundary.
- Bumps the service-worker cache so repaired application code replaces stale deployments cleanly.

# Dark Sky 4.5.7 — ScheduleJoe Keel Architecture

- Locked the current organizational backbone as Company → Region → Division → Community → Build / Lot → optional Unit.
- Added the human-readable Build Code pattern `RRR-DDD-CC-LLLL[-U]` and explicitly separated it from an immutable internal Build ID.
- Established Region as read-only for now, with Division and assigned Project Manager holding primary operational authority.
- Separated visibility scope from authority scope and established approval/audit requirements for cross-Division or cross-Region access.
- Established Division and Community as first-class template levels, with explicit template lineage and non-destructive local overrides.
- Kept organization hierarchy, permission scope, and template inheritance as separate architectural systems.
- ScheduleJoe remains a Captain's Quarters Shipyard concept; no Engine commissioning or scheduling automation was added.

# Dark Sky 4.5.4 — ScheduleJoe Shipyard Berth

- Added a Captain's Quarters **Shipyard** command workspace for new-vessel development.
- Added **ScheduleJoe (SJ-01)** as a Captain-only residential construction scheduling concept vessel.
- Added four initial ScheduleJoe working areas: Mission, Build Sequence, Prototype Deck, and Vessel Decisions.
- Added a deliberate ScheduleJoe launch control inside Captain's Quarters plus a Shipyard command tab.
- ScheduleJoe notes persist only as Captain-side shipyard working state.
- ScheduleJoe is **not** enrolled in the Engine project registry and has no customer workflow, deployment manifest, production namespace, or cross-project access.
- No Engine Room workflow, project identity, project isolation, orders, deployment behavior, or existing vessel functionality was changed.

# Dark Sky 4.5.3 — Functional Composition Polish

- Presentation-only refinement below the Engine Room header.
- Tightened telemetry density and operational section spacing for iPad/landscape.
- Removed repeated Black Flag section cues where the primary Engine lockup already establishes platform identity.
- Rebalanced Broadside, Command Deck, Fleet Health, First Mate Watch, and Project Command toward compact command-console layouts.
- Restored left-aligned scanning inside project cards while preserving clear, outlined action buttons.
- No application structure, navigation, project identity, storage, security, or workflow logic changed.

# Changelog

## 4.5.2 — Functional Visual Polish
- Tightened the Engine Room header after iPad review so it behaves like a working command console rather than a landing-page hero.
- Preserved one deliberate Black Flag primary lockup while reducing unnecessary vertical space.
- Centers content within logical groups instead of forcing the full header into a centered stack.
- Keeps the 4.5.1 spacing, action-button clarity, and platform branding discipline.
- Presentation/cache delivery only; no application logic, navigation, project identity, storage, security, or workflow changes.

# v4.5.0 — Trust Release

- Project Command filters now derive from actual launch state: Current = live; Test / Private = Draft, Preparing, Sea Trial, Fleet Ready; Future = intentionally parked/other future state.
- Search indexes project name, code, immutable Project ID, business type, operating-model summary, and customer relationship.
- Fleet rail reports `Showing X of Y projects` after filtering/search.
- Published/Private is a status indicator; workflow no longer hides behind a checkbox.
- Missing admission metadata preserves canonical project data and marks the vessel for admission review instead of deleting its registry row.
- Four Fleet Marks defaults are migration seeds only, not permanent recovery authority.
- Join Fleet and major project-owned settings use project-local persistence rather than whole-fleet rewrites.
- Structural terminology distinguishes Project Envelope from Storage schema; Engine summary exposes build/storage/contract diagnostics.

## 4.4.7 — Forward-Only IndexedDB Migration
- Bumped the primary Dark Sky database schema to 5 so devices previously upgraded through the 3.9 continuity line are never asked to open a lower schema.
- Added a forward-compatible VersionError fallback: if a future/newer schema already exists, Dark Sky reopens that existing schema without attempting a downgrade and validates the required stores.
- Kept project-local persistence and fleet-safe mutation boundaries from 4.4.5/4.4.6.
- Added required-store validation before any project mutation proceeds.

## 4.4.7 — Primary DB Readiness Gate
- Guarantees a live IndexedDB handle before project-local mutations.
- Reopens and retries once for closed, inactive, or undefined DB transaction failures.
- Adds a descriptive storage readiness guard instead of raw `db.transaction` failures.
- Preserves the v4.4.5 project-local persistence boundary and full fleet integrity.

## 4.4.5 — Fleet-safe Project Mutations
- Replaced deployment/outpost full-fleet saves with immutable Project-ID row updates.
- Added one-time primary IndexedDB reconnect for interrupted/closed Safari database connections.
- Canonical project-row read-back now verifies outpost creation without depending on the compatibility settings mirror.
- Project Command reseals/preserves the admitted V4 fleet before rendering; a failed project-local write cannot collapse the visible fleet to the active project.
- Deployment manifest, lifecycle, launch-offer, customer-test, and Experience Sea Trial evidence now use project-local persistence.

# Changelog

## 4.4.3 — Canonical Experience Identity Resolver
- Fixed Test Experience failing on Grizzly Bear with `could not resolve Project ID grizzly-bear`.
- Project lookup now canonicalizes both the requested identity and every current fleet row instead of relying on one strict in-memory equality check.
- Experience Test Deck resolution now verifies the project through memory, the canonical IndexedDB `projects` store, the compatibility settings mirror, and the verified registry backup — always by immutable/canonical Project ID, never by business name.
- A project recovered from a durable registry source is rehydrated into the active fleet collection before Preview / Sea Trial / Live opens, preventing a stale in-memory fleet from stranding the Test Deck.
- Failure diagnostics now report the requested identity, canonical identity, and registry sources searched instead of a silent/dead command.
- Preserved the full v4 hull, Grizzle→Grizzly alias migration, finger-swipe fleet rail, filters, outlined project controls, and no-write Preview / marked-data Sea Trial contracts.

## 4.5.5 — Captain's Shipyard Berth
- Demoted ScheduleJoe from the Captain's Quarters visual headline to a compact starboard Shipyard berth.
- Preserved Captain's Quarters as fleet-command-first while keeping ScheduleJoe one-tap accessible.
- Recorded the hierarchy rule: Captain's Quarters incubates; the Engine operates commissioned vessels.
- Recorded the reuse rule: Engine lessons/primitives may inform Captain projects, but no Engine workflow or capability is inherited automatically.
- No existing Engine, project registry, project identity, order, deployment, or storage structure changed.

## 4.5.6 — ScheduleJoe Hull Design
- Moved ScheduleJoe into an explicit architecture-first phase: architecture before features, reality before automation, stability before polish.
- Reframed the Shipyard workspace around five core hull decisions: Build Model, States, Movement Rules, Permanent Record, and Roles / Permissions.
- Added a First Mate's Table to challenge assumptions in each architecture area instead of treating Captain notes as automatically approved design.
- Kept the existing dirt-to-keys sequence as field evidence rather than promoting it to a locked software template.
- Held Prototype Deck at dock: prototype ideas can be recorded but do not become approved architecture by implication.
- Preserved the Captain's Quarters / Engine boundary and deliberate-reuse rule. No Engine registry, project identity, order, deployment, or storage behavior changed.

## 4.6.0 — Fleet Commissioning
- Added a fleet-level Seaworthiness Dock in the Engine Room.
- Established a seven-gate commissioning standard: identity/ownership, isolation boundary, customer experience approval, Sea Trial evidence, durability/recovery posture, live deployment, and explicit Captain commissioning.
- Made Ike's Wood Signs the first reference vessel for proving and refining the reusable fleet commissioning protocol.
- Added a per-project Commissioning action to Project Command cards.
- Captain commissioning is deliberately locked until the technical fleet gates are clear, and can be revoked without changing project identity or data.
- Commissioning approval is stored separately from project identity, governance, and project data so readiness discipline does not become accidental project architecture.
- Existing project-specific requirements remain project-specific; the fleet gate is a common safety/operational standard, not a forced shared workflow.

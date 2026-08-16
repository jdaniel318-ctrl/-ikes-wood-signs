## v3.8.32 — Fleet Rail Alignment & Join Fleet Repair

- Fixed Join Fleet from Engine project cards by validating the selected outpost with fleet-scoped authorization instead of requiring an already-open Project Control context.
- Added visible JOINING state and fail-closed persistence feedback so a fleet join cannot appear to do nothing.
- Normalized project-card vertical structure so titles, badges, KPIs, launch status, and actions stay on one horizontal visual plane across the fleet rail.
- Preserved iPad/Safari horizontal swipe navigation and clarified the rail instruction: swipe to browse; arrows move one project.
- Project KPI language now follows the customer relationship contract (for example, Partnerships show ENGAGEMENTS instead of ORDERS).
- Private Fleet Ready projects with an already-active outpost now say OUTPOST READY rather than OUTPOST SAILING until the vessel actually joins the live fleet.
- First Mate Watch now reports a tested vessel as Fleet Ready instead of leaving stale Sea Trial wording above the Engine.

## v3.8.31 — Customer Engagement Contracts

- Added a repeatable project-level customer relationship contract: purchase, service request, quote, booking, inquiry, partnership, application, reservation, or custom project.
- Universal customer experience now adapts action labels, detail prompts, confirmation copy, and record semantics to the project relationship instead of assuming every interaction is an order.
- Added editable Customer Relationship control in Project Control → Customer Experience and Commissioning.
- Customer submissions now produce a dedicated durable receipt state with reference, engagement type, submitted offer/request, contact, and fulfillment/timing context.
- Sea Trial receipts return directly to Shipwright; active customer receipts stay on confirmation until the customer deliberately starts another engagement.
- Engagement records remain stored in the existing project-scoped order store for backward compatibility, with `recordType`, `relationshipType`, and customer-action metadata for future migration.

## v3.8.30 — Fleet Commissioning Lane

- Added a single guided project launch state: Draft → Preparing → Sea Trial → Fleet Ready → Live.
- Engine project cards now show launch state and one context-aware Continue Launch / Join Fleet command.
- Project Control Overview now includes a Fleet Commissioning Lane with visible progress and next action.
- Commissioning now hands a new project directly into its next launch step instead of leaving the Captain to find it manually.
- Join Fleet promotes a tested Sea Trial outpost to active service and publishes the project in one Captain-approved operation.
- Quick publishing now routes incomplete projects back into Continue Launch instead of bypassing launch readiness.
- Existing immutable Project ID, universal customer shell, Sea Trial order proof, deployment boundary and presentation-isolation rules remain enforced.

## v3.8.29 — Repeatable Business Understanding
- Replaces the commissioning short-description bottleneck with a 12,000-character Business Brief.
- Preserves the owner-written brief separately from Dark Sky’s structured operating interpretation.
- Adds repeatable operating-model derivation for customer flow, fulfillment, required inputs, scheduling, visual profile, offers, and workflow signals.
- Adds editable Business Brief + Dark Sky Understanding controls in Project Control → Customer Experience.
- Makes the universal customer shell adapt its request prompt and optionally collect timing/fulfillment based on the project operating model.
- Keeps all understanding scoped to the immutable Project ID.

# Dark Sky Changelog

## v3.8.28 — Unified Engine Authentication

- Consolidates every Engine PIN surface onto one authentication controller.
- Recovery PIN `5615` and the configured Engine PIN are accepted consistently at the main Engine gate, legacy Engine modal, and protected Engine reset.
- Uses one shared failure/lockout state across all Engine gates.
- Locked access now shows an explicit countdown/state instead of being misreported as an incorrect PIN.
- Preserves the existing ten-attempt / five-minute lockout policy.

## v3.8.26 — Guided Deployment Launch
- Refit Deployment Shipwright around one obvious next action at a time.
- Added a prominent Step X of 5 / What to do now / Current state guidance band.
- Kept only customer-facing basics visible by default: outpost name, deployment profile, and welcome message.
- Moved idle reset, capability scope, customer-session reset behavior, and device-lock settings under **Advanced Outpost Settings**.
- Moved readiness inspection, outpost health, backward lifecycle controls, pause/retire controls, and diagnostics under **Operational Details**.
- Manifest details remain collapsed separately under Advanced.
- Preserved real Sea Trial order gating, customer-shell isolation, deployment persistence verification, and immutable Project ID boundaries.
- Captain upload package remains consolidated to canonical runtime files, three source-of-truth docs, and referenced assets.

## v3.8.24 — Launch Readiness & Activation Lane
- Shipwright no longer shows Activate as the next action when a universal project has no customer-ready offer.
- Added an inline launch-offer creator so a newly commissioned vessel can become customer-test ready without leaving the deployment workflow.
- Sea Trial completion now requires a real test order through the universal customer shell; opening the shell alone does not count as a completed test.
- Universal Sea Trial customer view includes Return to Shipwright controls and records the tested deployment/order.
- Activation becomes available only after a real customer-ready offer and a recorded Sea Trial customer order.
- Captain upload package remains consolidated to the canonical runtime files, three source-of-truth documents, and referenced assets.

- Rebuilt Deployment Shipwright around **Configure → Save → Sea Trial → Test → Active**.
- Added an iPad-first outpost progress rail and one state-aware Next Step action.
- Marked Draft attract screens as preview-only; removed the implication that an inactive mockup is a live customer button.
- Added **Open Test Outpost** for Sea Trial.
- Real project customer shells open for testing; generic projects open an honest Sea Trial dock and cannot activate until a customer operating model is assigned.
- Converted readiness, health, outpost registry, and manifest details to the shared dark Fleet Visual System.
- Collapsed technical manifest data under Advanced.
- Preserved project/deployment identity, persistence verification, and lifecycle authorization.

# v3.8.21 — Deployment Persistence Confirmation Repair

- Deployment creation now resolves the canonical project record at commit time instead of trusting a captured UI reference.
- Outpost persistence is confirmed by reading the actual IndexedDB `companies` registry after the save.
- A deployment must be attached in memory before save and must exist in persisted storage after save.
- Persisted deployment identity is revalidated against the owning project before the UI reports success.
- Failure rollback now removes the attempted outpost from the current canonical project record.

# v3.8.18 — Wave 1: Fleet Visual System

- Introduced shared Dark Sky surface tokens for hull, panels, inset wells, fields, borders, and readable text.
- Replaced harsh light filler/empty states in Project Control with intentional dark inset wells.
- Standardized dark administrative inputs and focus states across Project Control and Engine-owned project tools.
- Added iPad readability floors for helper text, metadata, KPIs, activity rows, project cards, commissioning labels, inputs, progress steps, and actions.
- Preserved deliberate light surfaces only where they communicate a real artboard/proof/customer-content purpose.
- No routing, identity, commissioning state, authorization, order ownership, or fleet scrolling behavior changed in this wave.

# v3.8.14 — Visual Capability Architecture

- Replaced the three-preview-mode assumption with a composable Visual Presentation Capability contract.
- Added six capability families: visual input, placement, transforms, preview style, approval, and output.
- Added reusable presets for flat surfaces, cylindrical wraps, card/message overlays, curved surfaces, front/back products, multi-zone products, bounded print areas, perspective surfaces, freeform overlays, template overlays, environment placement, vehicle/equipment graphics, arrangements, before/after workflows, and projects with no visual preview.
- Existing working renderers remain explicitly marked AVAILABLE; future renderer contracts are marked FOUNDATION rather than pretending unsupported behavior is production ready.
- Project Control → Customer Experience now allows each project to select a starting visual profile and then customize individual visual capabilities.
- Commissioning now captures a starting visual presentation profile for future projects.
- Migrated existing projects into the visual-capability contract without changing project identity or customer data.
- Added `visual_capability_contracts` to the reusable Dark Sky Fleet Foundation so future ships can reuse the capability language without inheriting Engine-specific UI.

## v3.8.14 — Project-Specific Preview & Customer Review Refit

- Repaired the Project Command Add Project tile to open the canonical commissioning workflow.
- Removed decorative vertical-line fallback texture from real uploaded customer photos.
- Refit Ike's customer review summary for clearer product details, contact information, and price visibility.
- Added project-shell preview geometry metadata so distinct businesses can own distinct presentation behavior.
- Mugs After Dark now uses a cylindrical-wrap lettering simulation in live and approved previews instead of the flat-sign overlay.
- Preserved the v3.8.11 Sea Trials and fleet-foundation boundaries.

# Changelog

## v3.8.28 — Operator Save Feedback
- Simplified deployment save confirmation to operator-friendly “Changes saved · Project isolation confirmed”.
- Preserved manifest revision and bulkhead detail as technical metadata via the status tooltip and Advanced Manifest Details.
- Added a reusable success-state hook (`data-state="success"`) and polite live-region feedback for save confirmations.


## v3.8.11 — Sea Trials & Fleet Foundations
- Added non-destructive end-to-end Sea Trials inside Engine Configuration.
- Added runtime checks for identity invariants, wrong-project authorization, order ownership, deployment sealing, lifecycle transitions, mission navigation, persistence, audit availability, and the production-security boundary.
- Added Ship's Log naming to the existing audit viewer.
- Corrected Structural Status Project Envelopes to use the active schema instead of the stale schema-3 comparison.
- Added `FLEET_FOUNDATIONS.md` and a platform-core Fleet Foundation catalog to distinguish reusable Dark Sky primitives from Engine-specific behavior.
- Added `SEA_TRIALS_AUDIT.md` and permanent regression-voyage doctrine.
- No project data model, Project Control route, Black Flag return, or owner permission was intentionally loosened.

## v3.8.10 — iPad Readability Refit
- Raised small/supporting text throughout Project Control for arm's-length iPad use.
- Increased primary and secondary command labels while preserving the established navigation hierarchy.
- Increased KPI captions, warnings, activity metadata, identity details, Quick Actions, and order supporting text.
- Added a little more vertical room on touch/iPad layouts so larger type does not feel cramped.
- No project identity, authorization, routing, deployment, or Black Flag return logic changed.

## v3.8.6 — iPad Command Usability Refit

## v3.8.10 — iPad Readability Refit
- Removed the duplicate bottom Command Menu from Project Control Overview.
- Added six high-value Quick Actions: Orders, Customers, Deployments, Edit Business, Owner Access, Payments.
- Filtered routine `Project opened` noise from the overview activity feed.
- Reduced Overview vertical bulk by compacting activity and identity panels.
- Preserved 3.8.8 Fleet Health, project identity, isolation, and mission navigation behavior.

- Preserved the v3.8.4 two-level Project Control navigation model.
- Simplified primary command labels by removing tiny secondary descriptions.
- Added iPad-first responsive command sizing with larger type, icons, spacing, and finger-sized tap targets.
- iPad landscape now uses a clear four-column / two-row primary command layout instead of compressing eight controls across one row.
- iPad portrait uses two generous columns rather than a narrow scrolling strip.
- Contextual sub-navigation controls are larger and easier to scan and tap.
- Active/expanded commands receive a stronger instrument-state treatment.
- Cache/version references advanced to v3.8.6.

## v3.8.4 — Command Navigation Refit

- Replaced the dense sixteen-button Project Control rack with a two-level command navigation system.
- Kept Overview, Orders, and Customers permanently one-tap accessible.
- Added primary command zones for Operate, Insight, Experience, Access, and System.
- Added contextual secondary command bays that reveal only the controls relevant to the selected zone.
- Added compact functional icon cues and stronger active/expanded states for faster visual scanning.
- Preserved the mission-critical capture-phase navigation layer and every existing Project Control route.
- Added responsive iPad/phone behavior without changing routing semantics.
- Cache/version references advanced to v3.8.4.

## v3.8.3 — Identity Sync & Order Command Refit

- Engine Project Command now refreshes immediately when Project Control closes, so business-name changes appear without requiring a page reload or unrelated Engine refresh.
- Preserves immutable Project ID / namespace behavior; this is a display synchronization repair, not an identity migration.
- Project Control Orders refitted from an unstyled wide table into responsive command cards with summary counts, status, customer contact, request detail, offer/source, and recorded value.
- Added iPad/mobile responsive order layout while retaining all order detail.
- Cache/version references advanced to v3.8.3.

## v3.8.2 — Immutable Project Identity

- Made the Dark Sky Project ID the permanent identity/security anchor for every project.
- Preserved existing project IDs during migration so no historical references are broken.
- Changed newly commissioned project IDs to opaque `bf-p-*` identities instead of name-derived IDs.
- Added controlled business-name editing inside Project Control → Marketing & Brand.
- Business renames now keep Project ID, namespace, orders, customers, deployments, graphics, and history unchanged.
- Added project-name audit history (`identity.previousNames`) and platform audit events.
- Owner Portal branding changes now use the same safe rename path, so project and customer-facing names stay synchronized.
- Reframed Project Control identity surfaces around Business Name, Project Code, Dark Sky Project ID, and technical namespace.
- Advanced schema to 6, identity version to 3, and policy to 3.4.

## v3.8.0 — Command & Visibility
- Rebuilt Project Control Overview into a project-scoped business cockpit.
- Added grouped command navigation and direct module shortcuts.
- Added verified 30-day revenue/order signals, workload, customer, deployment, and ledger indicators.
- Added rule-based attention queue, latest-order pulse, recent changes, and operating identity.
- Added project Analytics with six-month order volume, status mix, repeat-customer signal, and average recorded order value.
- Explicitly marks visitor/conversion/campaign telemetry as unavailable until real deployment telemetry exists.
- Preserved v3.7.7 authorization, isolation, and deployment-integrity gates.
- Advanced cache and release identity to v3.8.0.

## v3.7.7 — Hull Integrity
- Added fail-closed authorization gates around Project Control mutations and Engine fleet-level project writes.
- Added active owner-session + capability checks around owner order, product, pricing, branding, deployment, staff, notification, and credential mutations.
- Sealed deployment identity to project ID/namespace and validate deployment boundaries during integrity checks.
- Added explicit deployment transition rules and blocked invalid state changes.
- Collection persistence now blocks on critical hull-integrity failures.
- Advanced schema to 5, policy to 3.3, and cache/version references to v3.7.7.
- Added `HULL_INTEGRITY_AUDIT.md` and advanced the next release heading to v3.8 Command & Visibility.

# Changelog

## v3.7.6 — Commissioning & Invitation Refit

- Made Project Commissioning the single supported new-project path and retired the dormant legacy Add Project modal.
- Added commissioning draft recovery, explicit Start Over, step persistence, and inline validation.
- Clarified display-name vs immutable-project-identity language throughout commissioning.
- Reframed business type as a Starting Model rather than a rigid business copy.
- Fixed newly commissioned owner-access state so it matches the canonical invitation lifecycle.
- Bound owner invitations to project ID, namespace, and intended email; claim validation now rejects boundary or owner mismatches.
- Owner claims now use the invited email and standard password rules rather than hard-coded local test credentials.
- Replaced plaintext local owner credential storage with salted one-way hashes, including a migration bridge for old local test credentials.
- Recovery snapshots now omit owner credential secret material and invitation token hashes.
- Bumped Black Flag policy metadata to 3.2 and the service-worker cache to v3.7.6.
- Added commissioning progress guardrails so unreached steps cannot be skipped and final commission runs a complete readiness validation.
- Added a review-stage readiness panel distinguishing project creation, owner handoff, and later deployment commissioning.
- Changing the email identity of an active owner now revokes the old local credential before a new handoff can be issued.
- Added `ISOLATION_AUDIT_STAGE2.md` documenting confirmed boundaries, prototype limits, and the next authorization audit.

## v3.7.5 — Project Registry Foundation

- Preserved v3.7.4 as the pre-refit baseline.
- Added the Dark Sky Platform Blueprint and Current Ship Inventory.
- Added canonical project-registry helpers and schema 4 / policy 3.1 metadata.
- New project IDs are immutable unique IDs independent of display names.
- Reusing a display name no longer blocks project creation; repeated labels are audited and surfaced as integrity warnings instead.
- Add Project and Commissioning now seed lifecycle/registry metadata and unique project namespaces.
- Bumped the service-worker cache to force the corrected build onto iPad/Safari.

# Dark Sky / Black Flag Engine Changelog

## v3.7.4 — Compact Command Header
Compressed the Engine Room command header by roughly one quarter on landscape displays while preserving the approved Black Flag identity, Configure Engine, Engine Secure, and Captain’s Quarters controls. The live performance graph deck is unchanged and remains immediately below the header. This is a visual-density refinement only; no data, security, project, order, or telemetry behavior was intentionally changed.

# Dark Sky / Black Flag — Release Narrative

## v3.7.0 — Cut the Mooring Lines
Dark Sky's underlying storage and runtime boundaries were refit so Black Flag owns the platform technically as well as visually. The active IndexedDB database and local order/draft keys are now platform named. Existing legacy Ike data is copied forward by a one-time compatibility migration, with historical unscoped orders assigned to Ike's only inside that migration/import path. Normal runtime reads no longer infer Ike's when project identity is missing.

Project identity is now required for fleet analytics, customer capture, ledger posting, owner metrics, order filtering, and integrity checks. Project-admin PINs and brute-force lockout state are project scoped. Project feature flags are read from the owning project instead of shared global settings. Newly commissioned projects inherit a platform default workflow rather than an Ike-derived business configuration. Ike's existing Web3Forms route remains explicitly Ike-only so a new project cannot accidentally send through Ike's delivery configuration. Backup exports now identify Dark Sky rather than Ike's.

The v3.7 migration preserves existing orders/settings and includes a reset safeguard so retired legacy settings cannot silently re-import after an Engine settings reset.

## v3.6.8 — Clear Horizon
Removed the ghosted graph/dashboard imagery from the Engine hero backgrounds while preserving the approved Black Flag branding and controls.

## v3.6.7 — Open Seas
Established the Captain-approved Black Flag logo system: full clean lockup for Engine/PIN identity and one compact round mark for every project's return-to-Dark-Sky control. Fixed the screen-reader-only text defect that had made “Return to Dark Sky” appear visibly inside the project button.

## v3.6.6 — Worthy Vessel
Rebuilt Black Flag identity around the approved branding board and standardized the primary lockup and compact platform mark.

## v3.6.5 — Show the Flag
Rebuilt the universal project return control and removed its dependency on fragile/missing logo paths.

## v3.6.4 — Ready to Sail
Completed the final cleanup/stability pass, removed unused assets/debug debris, aligned Dark Sky browser identity, and tightened the deployment package.

## v3.6.3 — Engine Mark Repair
Removed the duplicate Engine Room logo structure that had allowed Safari's broken-image question-mark badge to survive earlier fixes.

## v3.6.2 — Spring Cleaning
Consolidated documentation, removed backups and historical release debris, tightened cache cleanup, and reduced the deployable package without intentionally changing application behavior.

## v3.6.1 — Harbor Repair
Restored the lower-right Black Flag project return control after a legacy isolation CSS rule accidentally hid it.

## v3.6 — Platform Brand Rebuild
Made Black Flag the visual identity of Engine-owned surfaces while preserving independent project branding.

## v3.5–v3.0 — Platform Foundation
The early v3 line introduced Black Flag project commissioning, owner/customer-device boundaries, schema-v3 project envelopes, namespaces, lifecycle states, default-deny isolation metadata, audit/recovery foundations, telemetry, project-scoped operational services, structural integrity checks, and First Mate's Watch.

## 2.9.x lineage
The 2.9 series was the shipyard where the original Ike's Wood Signs application evolved into the multi-project Black Flag Engine, Pirate Mode, Captain's Quarters, deployment fleet, Owner Portal concepts, and the modern Engine Room. Historical compatibility code may remain where required to preserve existing data, but v3.7 is the active Dark Sky platform line.


## v3.7.4 — Control Center Navigation Repair
Replaced the fixed full-screen Engine workspace overlay with a dedicated in-flow workspace screen. This prevents the iPad Safari failure where only the bottom edge of a Control Center rendered while page scrolling was locked. Control Center and Configure Engine now park the command deck, own normal document scrolling, and restore the prior Engine scroll position on return.

## v3.8.1 — Command Deck Repair
- Added a capture-phase mission-critical navigation layer for Project Control tabs, Project Control → Engine, and project → Black Flag return.
- Bound those escape routes before optional feature controls so later setup errors cannot strand the user.
- Raised tap targets above project decoration and hardened iPad touch behavior.
- Rebalanced the Project Control cockpit from white cards to low-glare Dark Sky instrument surfaces.
- Added an explicit in-panel navigation failure state instead of silent dead controls.

## v3.8.8 — Fleet Health Repair
- Restored the missing Fleet Health mount in the Engine.
- Positioned Fleet Health between Structural Status and Waters Ahead.
- Added non-empty loading and render-failure states.
- Isolated per-project fleet-health calculation failures so one project cannot blank the fleet panel.
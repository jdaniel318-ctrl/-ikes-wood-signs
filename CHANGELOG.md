## v3.8.6 — iPad Command Usability Refit

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

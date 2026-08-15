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

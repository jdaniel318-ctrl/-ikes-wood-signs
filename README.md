# Dark Sky v4.7.0 — Engine Shell Stabilization I
This build advances the 4.6.9 Read-Only Test Deck forward without discarding any fleet work. The first Engine-shell stabilization repair makes the Business/Pirate selector live on the pre-login gate, removes the obsolete Pirate CSS gate, and preserves the appearance choice across refreshes without changing authorization.


This build keeps the complete v4 hull and repairs the identity boundary between Project Command and the Experience Test Deck.

Key contracts:
- Canonical V4 project registry + admission ledger + fleet manifest
- Grizzle/Grizzly legacy alias migration sealed to canonical `grizzly-bear`
- V4 baseline fleet reconciliation restores the known Grizzly vessel when a stale three-project registry is encountered
- Filter first, then native finger-swipe horizontal fleet rail
- Outlined Control Center and Test Experience actions
- Native Experience Test Deck: Preview / Sea Trial / Live
- Preview writes no operational records; Sea Trial writes project-scoped marked test records
- Full source files, no service-worker source injection
Experience identity contract:
- Engine project cards pass the vessel identity into one canonical resolver.
- The resolver matches immutable/canonical Project ID across memory, canonical IndexedDB, compatibility mirror, and verified registry backup.
- Legacy aliases are migration inputs only; business names are never used to authorize or resolve the Test Deck.
- Durable registry resolution rehydrates the active fleet row before Preview / Sea Trial / Live.



## V4.4.5 — Fleet-safe project mutations
Outpost and Experience Test mutations now update only the owning canonical project row. They never clear/rewrite the full fleet registry. Primary IndexedDB operations retry once after a closed/interrupted connection, and Project Command reseals the admitted V4 baseline before rendering so a failed project mutation cannot collapse the fleet to one visible vessel.


## V4.5.0 — Primary DB readiness
Project-scoped mutations now guarantee that the primary IndexedDB connection exists before any transaction starts. Safari connection loss or an uninitialized DB handle triggers one controlled reopen/retry. A project mutation still updates only its owning canonical Project ID and never rewrites the fleet.


## V4.5.0 — Forward-only database law
Dark Sky never requests a database schema lower than one already installed on the device. The primary schema is now 5, and VersionError recovery reopens a newer existing schema without downgrade after validating the required stores.


## v4.5 Trust Release
Project identity is preserved before governance metadata is repaired. Project-level actions write one immutable Project ID; missing V4 admission evidence can restrict operation but cannot delete the canonical project row. Project Command filters derive from the actual launch state, and Published/Private is now a status indicator rather than a hidden workflow toggle.


## 4.5.4 Captain's Shipyard
Captain's Quarters now includes a Shipyard workspace. ScheduleJoe is berthed there as a concept vessel for residential construction scheduling. It remains outside the Engine registry until a future explicit commissioning decision.

### 4.5.5 Captain's Shipyard Berth
ScheduleJoe remains a pre-commissioning Captain's Quarters concept. Its launch is intentionally secondary to fleet command. Engine patterns can be reused when they fit ScheduleJoe's needs, but Engine behavior is not automatically inherited by Captain projects.

### 4.5.6 ScheduleJoe — Hull Design
ScheduleJoe is now explicitly in architecture-first development inside Captain's Shipyard. The working sequence is Mission → Build Model → States → Movement Rules → Permanent Record → Roles / Permissions → Vessel Decisions. Prototype ideas remain visible but held at dock until the core model is accepted. A First Mate's Table challenges each area so builder knowledge and system-design concerns are both recorded before software assumptions harden into architecture.

## ScheduleJoe status — 4.5.7
The Shipyard now contains the first three ScheduleJoe foundation systems: Organization, Authority, and Template Lineage. Scheduling logic remains intentionally held at dock until the keel is accepted.


### 4.6 Fleet Commissioning
The Engine Room now includes a Fleet Commissioning / Seaworthiness Dock. Ike's Wood Signs is the first reference vessel. Open a vessel's Commissioning action to see the seven common fleet gates and the Captain's final commissioning order. Project-specific requirements remain inside each project's own Control Center and Test Experience.


## v4.6.2 Heading
Operation Prove the Fleet uses the existing Fleet Commissioning Dock as the fleet operating scorecard. Ike's is the reference vessel; the next strategic proof is a materially different commissioned vessel, followed by a Shipyard-born product. Captain's Quarters remains the fleet-command/R&D layer until the fleet earns a broader command model through demonstrated use.


## v4.6.4 Seaworthiness Refit
Critical navigation is now owned by an early command spine rather than by async render completion. Fleet Commissioning also presents the next provable gate as an operating action, while preserving the existing seven-gate standard.


## v4.6.5 Customer Media Recovery
Camera and photo controls are now armed before storage/migrations, matching the early-bound customer navigation architecture. A customer can no longer reach the photo step with an unbound START CAMERA control because of a later initialization failure.


## v4.6.6 Customer Choice Recovery
All customer selection/input controls—including font style—are now early-bound and storage-independent, matching the navigation and camera recovery architecture.


## v4.6.7 Customer Journey Actions
The remaining bespoke customer CTAs—including REVIEW MY ORDER and PLACE MY ORDER—are now early-bound, completing the storage-independent customer interaction spine.


## v4.6.8 Storage Pressure Repair
Image-heavy order media stays in IndexedDB; the localStorage recovery mirror is metadata-only. Audit and telemetry are bounded and cannot break command routes when Safari storage is under pressure.


## v4.6.9 Read-Only Test Deck
Opening Test Experience is a read-only diagnostic route. It no longer writes audit data or rehydrates project state, and the service worker now advances to a genuinely new cache namespace.

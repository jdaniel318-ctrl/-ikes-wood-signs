# Dark Sky 4.1.3 — First Light

First Light fixes an early-startup DOM-helper ordering fault that could raise `ReferenceError: Can't find variable: $` on Safari/iPad. DOM helpers now initialize before any security/startup path can use them. Black Box health now distinguishes faults from the current runtime session from preserved historical evidence, so resolved history does not keep the Captain in an attention state. No project, order, customer, graphics, admission, quarantine, or V4 envelope architecture is changed.

# Dark Sky 4.1.1 — Clear Horizon

Clear Horizon is a quiet-deck maintenance release on top of Full Sail. It removes obsolete migration-call noise, deduplicates Black Box faults without erasing evidence, and surfaces diagnostic health to Captain and Engine while preserving the commissioned V4 hull.

# Dark Sky / Black Flag — v4.1.1 Full Sail

**Current release:** v4.1.1 — Full Sail

Full Sail is the first post-commissioning capability release. Broadside was the first Dark Sky platform-generation release after the 3.10.x fleet-registry hardening line. It intentionally preserves the proven project registry and security boundaries while adding a higher-level platform contract, recovery discipline, diagnostics, release rings, Captain Lab, and a decision ledger.

## V4 platform contract

1. Nothing disappears during an ordinary upgrade.
2. Nothing crosses project boundaries.
3. Every important change is traceable.
4. Experiments cannot silently alter production.
5. Every vessel can be recovered and carried forward.

## Broadside systems

- Pre-V4 migration gate creates a fleet recovery point once per installation.
- Recovery Vault records fleet-level recovery manifests backed by the existing sanitized snapshot system.
- Black Box records JavaScript failures and unhandled promise rejections locally for Captain/Engine diagnostics.
- Release Rings establish Captain → Private → Selected Live → Fleet promotion stages.
- Captain Lab creates production-write-denied project clones for experiments.
- Captain Decision Ledger records major architectural decisions and rationale.
- Feature flags establish explicit project/fleet/Captain rollout boundaries.
- V4 preflight layers the new platform contract over existing Ship Integrity checks.
- Engine Room exposes Broadside status without replacing project operations.
- Captain's Quarters gains platform-command, recovery, release, experiment, and decision controls while preserving the Engine/Captain authority boundary.

## Compatibility

The existing `BlackFlagV3Core` global remains as a compatibility surface for the mature Engine code, but reports the 4.0 Broadside core/schema. V4-specific capabilities live under `window.DarkSkyV4`.

# Dark Sky / Black Flag — v3.10.2 Registry Rivets

Dark Sky now lets each project relationship contract drive its working language and suggested workflow. Projects inherit reusable operating behavior, then may override it without affecting any other vessel.

# Dark Sky / Black Flag Business Command Platform

**Current release:** v3.10.2 — Registry Rivets

Dark Sky is the platform and shipyard. The Black Flag Engine is the first operational ship: it commissions isolated projects, gives each business a Project Control Center, and launches customer-facing outposts without requiring every new project to inherit Ike's original sign workflow.




## v3.10.2 Registry Rivets

- Narrow cleanup release on top of the sealed 3.10.1 fleet registry.
- Grizzly Bear Project Command now labels its first KPI as **ORDERS**.
- The newly selected Grizzly Bear logo is intentionally left untouched.
- Ship Integrity checks the Grizzly Bear fleet KPI label while preserving canonical identity and alias behavior.

## v3.10.1 canonical registry reconciliation
Project Command now reconciles commissioning state against the canonical IndexedDB `projects` store before it counts or renders the fleet. The immutable Project ID is authoritative: if it exists canonically, Dark Sky clears matching recovery/draft artifacts and renders one normal project card; if it is missing, Dark Sky performs one controlled recovery from the preserved commissioned candidate and verifies the Project ID by reading the canonical store back. A vessel can no longer appear simultaneously as Registry Recovery and Shipyard Draft, and historical journal text can no longer claim a project is verified when the current canonical registry says otherwise.

## v3.9.1 command-watch reliability
First Mate Watch is now a real command router rather than a set of visually active cards with individually rebound click closures. Watch actions route through one controller with busy state, visible success/error feedback, and highlighted destinations. Run Watch and Ship Integrity also expose working state so a command can no longer appear to do nothing. The Watch cards and integrity results use iPad-readable type and clearer signal hierarchy.

## Current release focus
The Deployment Shipwright now guides operators through one plain-language voyage:

**Configure → Save → Sea Trial → Test → Active**

- The current step and required next action are shown prominently.
- Basic outpost settings stay visible; session/device/capability controls are collapsed under **Advanced Outpost Settings**.
- Readiness, health, backward lifecycle controls, and diagnostics are collapsed under **Operational Details**.
- Manifest IDs and technical isolation records remain under **Advanced → Manifest Details**.
- The universal customer shell remains isolated from legacy Ike customer chrome.
- A universal project needs a customer-ready offer and a completed Sea Trial test order before activation.

## Canonical repository files
The Captain upload package intentionally stays lean. Runtime capability is in the code, not in a pile of release-audit documents.

- `index.html`
- `styles.css`
- `app.js`
- `platform_core.js`
- `platform_identity.js`
- `captain.js`
- `sw.js`
- `manifest.webmanifest`
- `README.md`
- `CHANGELOG.md`
- `ARCHITECTURE.md`
- `assets/` referenced by the runtime

Historical build audits are development records and do not need to remain in the live GitHub root once their durable decisions are consolidated into the canonical docs above.

## Platform doctrine
- **Names can change. Identity cannot.** Immutable Project IDs own project data and deployment boundaries.
- **Data isolation and presentation isolation are both required.**
- The Engine is the first ship, not the fleet. Captain's Quarters remains the future shipyard for separate products that reuse proven Dark Sky primitives without inheriting Engine-specific baggage.
- The current GitHub Pages/browser build remains a prototype boundary; unrelated production tenants ultimately require server-side identity, authorization, secret management, and durable storage controls.


## Repeatable business understanding
Every project now preserves a long-form Business Brief and a structured operating model derived from it. The original brief and the structured interpretation are stored separately, so owners/Captain can correct Dark Sky’s understanding without losing the source description. The universal customer shell can use that model for adaptive prompts, fulfillment choices, and scheduling fields.


## Customer Engagement Contracts (v3.8.31)

Dark Sky now treats customer activity as a project-specific engagement rather than assuming every vessel ends in an order. Projects can resolve to purchase, service request, quote, booking, inquiry, partnership, application, reservation, or custom-project relationships. The universal customer shell adapts its action language and confirmation receipt to that relationship. Post-submit receipts persist for the current customer session so a successful submission cannot silently fall back to the form.

## Fleet Commissioning Lane (v3.8.30)
New projects now follow one Captain-facing launch journey: Create → Prepare → Sea Trial → Fleet Ready → Live. Engine project cards and Project Control expose one Continue Launch / Join Fleet action, while the existing deployment, customer-test, immutable identity and isolation rules remain underneath.



### v3.9.6 durable project registry

Project commissioning is now treated as a durable transaction rather than a completed screen flow. The canonical fleet registry lives in a dedicated IndexedDB `projects` object store. Every registry mutation is committed atomically with the legacy `companies` settings mirror, then read back and verified before the UI can declare success or clear a commissioning draft.

Commissioning specifically follows **seal → atomic commit → canonical read-back → Engine render verification → clear draft**. If persistence fails, the pre-commission in-memory registry is restored and the draft remains recoverable. If persistence succeeds but rendering fails, Dark Sky reports that the vessel is safe in the registry instead of pretending it vanished.

### v3.9.6 fleet registry integrity gate repair

Historical Sea Trial findings no longer freeze every project write. Dark Sky compares the proposed registry against the last persisted registry and blocks only newly introduced critical integrity failures. Existing findings stay visible in Structural Certification until repaired. Commissioning still verifies the new immutable Project ID by reading IndexedDB back before clearing its draft.

### v3.9.4 direct-touch fleet rail and registry safeguard

Project Command is now browsed directly by horizontal finger/trackpad scrolling; arrow navigation has been removed. Project commissioning verifies the new Project ID by reading the fleet registry back from IndexedDB before clearing the commissioning draft. A verified local registry backup protects against a transient settings-store failure, and any named commissioning draft that is not yet in the fleet registry is surfaced as a **SHIPYARD DRAFT** card so unfinished work cannot disappear silently.

### v3.9.3 command-surface reliability

Engine Project Command uses an early-bound delegated command bus for filters, project search, project opening, launch/join-fleet, publishing, Fleet Health links, and Add Project. These controls remain actionable even when a later optional initializer fails. Mission-critical navigation is armed before asynchronous boot work.

### v3.9.2 command reliability
Waters Ahead and structural command controls are now attached to an independent early-bound command bus. This prevents a partial boot or migration warning from producing visually healthy but non-interactive command cards, particularly on iPad/Safari.

## v4.1.1 — Orphan Watch

The V4 fleet is commissioned at 4/4. Orphan Watch closes the final structural critical by separating an unknown legacy order from active operations without guessing which project owned it. The complete record is retained in the Recovery Vault, while a durable tombstone prevents stale browser storage from resurrecting it into workload or integrity calculations. This preserves evidence and project isolation at the same time.

# Foundry Fleet Services
> Consolidated in Dark Sky 8.2.8 to keep the deployment lean while retaining the full historical contracts as an AI-readable regression reference.

---

## Source: `FLEET_CAPABILITY_CANDIDATES.md`

# Fleet Capability Candidates — 7.1.0

Dark Sky learns from proven project work without silently turning one vessel's implementation into a fleet mandate.

## Candidate: Plank / Object Intelligence
**Source:** Ike's Wood Signs

Current proven behavior:
- exact customer photo remains project-scoped;
- photo geometry can suggest orientation;
- uncertain physical measurement is never invented;
- conservative safe margins protect previews until segmentation is proven.

Promotion requirements:
1. validated real-world scale source;
2. repeatable dimension accuracy across a Sea Trial set;
3. obstacle/edge detection evidence;
4. failure states that ask for confirmation instead of guessing;
5. project isolation and mobile performance remain clear.

## Candidate: Reference → Lettering Style
**Source:** Ike's Wood Signs

A project may stage a lettering reference image. The image is inspiration/evidence, not automatically an installable font. Promotion requires a managed style extraction/matching path, clear provenance, project ownership, and deterministic preview rendering.

## Promotion rule
Prototype → Sea Trial → Candidate → repeated evidence → Fleet Standard.

No candidate becomes a platform standard because one project likes it.


## 8.2.6 Foundry classification
Existing future-facing work is now registered before new screens or service implementations are multiplied. Foundation candidates include Custom Colors, Artwork/Inlay Production, Customer Payments, Business Event Ledger, Customer/Order Insight, AI Recommendation Registry, and Vendor/Capacity Routing.

The Foundry does not promote these to production automatically. Existing rule remains: evidence and Sea Trial precede promotion. A mature capability may later become a dedicated vessel without changing the consuming project's immutable identity.

---

## Source: `FLEET_LEARNING_REGISTRY.md`

# 8.2.0 Learning — Mission-Specific Fit Controls

Constrained customer sizing is reusable, but control vocabulary/defaults must match the vessel mission. Ike uses aggressive safe face-fit grounded in finished signs; other vessels may use S/M/L, sliders, or other controls.

# Fleet Learning Registry — 8.2.3 Ike Fit

Real Face adds mission-fit confidence to recommendation compression.

- **Strong** — direct mission evidence; may be bulk-staged for review.
- **Plausible** — useful but adaptation evidence must be reviewed first.
- **Experimental** — weak/indirect fit; never bulk-staged by default.

The registry must explain *why* each vessel qualifies. Photo availability alone is not evidence that a classifier belongs in a mission. Doctrine remains centrally inherited; project business logic remains explicit and project-scoped.

---

## Source: `FLEET_SERVICES_CONTRACT.md`

# Dark Sky Fleet Services Contract — 8.2.6 Foundation

## Purpose
Define how independent owner/operator vessels can consume Captain- and Admiral-level capabilities without merging data, authority, branding or business ownership.

## Three distinct objects

### Vessel
An independently governed business or major fleet operation with an immutable identity and its own authoritative business records.

### Capability
A reusable function with an ID, version, owner, lifecycle state, required data contract, authority requirements, commercial mode and rollback path.

### Service Instance
The explicit agreement connecting one vessel to one capability. It records enabled state, capability version, permitted data fields, operational authority, commercial terms, provider/resource route and audit history.

## Service instance minimum fields
- serviceInstanceId
- vesselProjectId
- capabilityId
- capabilityVersion
- status
- enabledByAuthority
- permittedDataFields
- deniedDataFields
- operationMode: advisory | read-only | transactional | managed-operation
- provider/resource route
- commercialMode: included | free | trial | flat-fee | per-transaction | monthly | custom
- effectiveAt
- rollbackCapabilityVersion
- audit reference

## Standard business-event language
Each vessel keeps authoritative records in its own namespace. Fleet services may understand standardized events such as:
- OrderCreated
- DepositReceived
- PaymentCaptured
- RefundIssued
- MaterialPurchased
- VendorCostIncurred
- ProductionStarted
- ProductionCompleted
- FulfillmentRequested
- ShippingPurchased
- FleetServiceFeeCharged
- CustomerBalanceChanged
- InventoryConsumed

The schema is shared. The records are not automatically shared.

## AI recommendation contract
A recommendation includes:
- recommendationId
- source capability
- affected vessel or permitted aggregate scope
- evidence summary
- confidence
- projected impact
- required authority
- commercial/economic implication
- status: Suggested | Reviewed | Approved | Rejected | Deployed | Rolled Back

AI may recommend. Consequential actions remain governed.

## Supply-chain contract
Vendors and fleet-owned resources use a common resource model containing capability, cost basis, lead time, quality evidence, geography, availability/capacity and fallback route. A vessel may route only the production data explicitly allowed by its service instance.

## Ike's initial example
Ike's consumes `fleet.artwork-inlays`.

Permitted initial data:
- immutable Ike's project ID
- production order ID
- canonical approved letter geometry
- approved artwork asset
- physical output dimensions
- material/finish profile
- requested turnaround

Not required for an outside sticker provider:
- broad customer history
- unrelated orders
- owner credentials
- Engine/Captain/Admiral credentials
- other project records

Initial provider route: approved outside contour-cut decal vendor.
Future provider routes: fleet-owned printer/cutter, then optional overflow production resources.

---

## Source: `FOUNDATION_AUDIT_826.md`

# Dark Sky 8.2.6 — Foundry Foundation Audit

This pass intentionally audits future-facing structures already present in Dark Sky and Ike's before expanding Admiral into a larger service layer.

## Mission
Dark Sky is evolving beyond a good Customer Experience and Owner / Partner Control Center into a fleet that can support four operating tiers:

1. Owner / Operator — independent owner directly operates the vessel.
2. Operator / Full Service — fleet performs explicitly contracted operations for the owner for a fee.
3. Captain Fleet — operational shared services, deployment, diagnostics, fulfillment coordination and appropriate supply-chain support.
4. Admiral Fleet — strategy, governance, commercialization, cross-vessel intelligence, capacity, manufacturing and creation of new fleet vessels.

Authority grows by responsibility, not by silent visibility. Project ID remains the sealed business namespace.

## Existing future features found and retained

### Ike's product customization
Existing customer and owner code already recognizes Custom Colors. This remains a vessel-facing product option, but the underlying pattern is classified as a reusable product-upgrade capability rather than a one-off toggle.

### Payments foundation
Project Command already contains payment enablement, hosted-link/integrated/manual modes and provider placeholders for Square, Stripe and PayPal. This is retained as a foundation and classified under Quartermaster. No customer checkout is falsely activated by this pass.

### Ledger and financial permissions
The project ledger already tracks completed orders, revenue, material cost, other direct cost, gross-profit estimate and payment status. Project permissions already anticipate ledger view, cost entry and profit visibility. These are retained and become the starting point for a shared business-event language. Shared schema does not mean shared database.

### Insight / analytics
Project Analytics already reports only signals Dark Sky can prove from stored project-scoped orders, customers, ledgers and deployments, while explicitly refusing to invent visitor/conversion telemetry. This becomes the starting point for Lookout intelligence.

### Customer history
The Engine already retains project customer history and repeat-order context. Cross-project customer matching exists at Engine authority. This pass does not broaden owner visibility. Future AI recommendations must use explicit permissions and appropriate aggregation.

### Fleet Learning Registry
The Fleet Learning Registry already separates doctrine, reusable capability and mission-specific behavior and uses LEARN → CLASSIFY → ADAPT → REVIEW → ADOPT. It remains the upstream learning mechanism feeding capability candidates.

### Fleet Capability Candidates
Existing candidate doctrine already requires Prototype → Sea Trial → Candidate → repeated evidence → Fleet Standard. The new Foundry lifecycle extends, rather than replaces, this discipline.

### Owner / Partner capability choice
Owner Bridge and the standalone owner portal already establish project-scoped owner self-service and approved feature toggles without Engine/Captain authority. This remains the vessel-facing consumption point for approved services.

### Admiral learning / readiness
Admiral already owns release doctrine, calibration replay, decision compression and judgment escalation. The Foundry is added beside these responsibilities as a capability-forging workspace, not as unrestricted project access.

## New structural classification

### The Foundry domains
- Forge — product upgrades, CNC/decal translation, inlays, future manufacturing capacity.
- Quartermaster — payments, fees, deposits, pricing mechanics and commercial operations.
- Ledger House — standardized business events and accounting/export foundations.
- Lookout — permission-aware analytics and AI observations.
- Chart Room — recommendation review and strategic decisions.
- Armory — versioned registry of proven reusable capabilities.
- Dockmaster — explicit vessel-to-service contracts and supply/capacity routing.
- Admiral's Exchange — commercial terms for shared capabilities.
- Shipyard — promotion of mature capabilities into dedicated vessels.

## First classified capability foundations
- `ikes.custom-colors`
- `fleet.artwork-inlays`
- `fleet.payments`
- `fleet.business-ledger`
- `fleet.customer-insight`
- `fleet.ai-recommendations`
- `fleet.vendor-routing`

These are intentionally FOUNDATION status. FOUNDATION means Dark Sky recognizes the contract and ownership boundary; it does not imply that the full production behavior exists.

## Ike's boundary
Ike's remains the sign designer, owner/operator experience and primary sign manufacturer using its current machine. The Foundry may initially create vendor-ready inlay information from Ike's canonical geometry. Later it may manufacture stickers when economics justify equipment, and later still provide optional overflow sign production. None of those stages transfer ownership of the Ike's customer relationship or product design to Admiral.

## Promotion law
Observation → Fleet Learning → Capability Candidate → Foundry Experiment → Sea Trial → Proven Capability → Available/Commercial Capability → Dedicated Vessel when warranted.

A capability can stop at any stage. No capability is promoted solely because one vessel likes it.

## Non-negotiable boundaries
- Capability ≠ Vessel ≠ Service Instance.
- Common schemas never grant common visibility.
- Cross-vessel actions require explicit, versioned service contracts.
- Private vessel records remain isolated unless the authorized service contract requires specific fields.
- AI recommendations are advisory and auditable; no consequential silent mutation.
- Shared services must fail safely so loss of an optional Admiral/Captain service does not sink the owner vessel.
- Supply-chain capability stays at the lowest shared fleet level that can responsibly serve it; promote upward only when scope, economics or authority require it.

---

## Source: `PROVING_GROUND.md`


## 8.2.3 Ike Fit
- Known stale-worker handoffs self-recover only after the incoming runtime snapshot and release identity fully verify.
- Automatic cleanup is constrained to Dark Sky service-worker registrations and application caches; project/customer/order/owner/configuration data is never touched.
- WATCH is now explicitly non-blocking when protected release contracts are clear.
- Deterministic WATCH work is owned by the shipyard; the Admiral is escalated only for judgment, ambiguity, irreversible action, or deliberate Known Good promotion.
- Proving Ground reports all voyages assessed, separates CLEAR/WATCH/HOLD, and keeps WATCH evidence visible after promotion.
# Fleet Proving Ground — 6.9.1

## Purpose
Make fleet hardening rigorous underneath and simple at the helm. The Captain should see fleet status, the highest-priority issue, the next best move, and the Last Known Good release before engineering evidence.

## Required voyages
1. Authority Voyage — Black Flag, Project Admin, Captain authority contracts.
2. Isolation Voyage — canonical Project IDs and project-scoped operational records.
3. Client Preview Voyage — unique invite credential and pre-paint isolation.
4. Staging Safety Voyage — external-contact containment outside Live.
5. Release Integrity Voyage — runtime/manifest/release identity and canonical runtime tree.
6. Command Navigation Voyage — Captain main-room and subview return boundaries.

## Severity
- HOLD: critical contract failure; release is not promotable.
- WATCH: operational evidence needs Captain attention.
- CLEAR: required evidence is currently satisfied.

## Promotion
Development → Candidate → Proving Ground → Cleared → Known Good.
Marking a candidate Known Good records local promotion evidence only. It does not publish or deploy a project.

## Design rule
Status → Problem → Next Move. Engineering evidence is available, never forced into the Captain's primary view.

## 7.2.1 approved artifact integrity
- **Approved Artifact Voyage** verifies that the customer-approved visual is locked before contact/review and stored as the production artifact rather than silently re-rendered later.
- Editing the design invalidates the lock and requires fresh customer approval.

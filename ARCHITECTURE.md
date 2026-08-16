# Dark Sky Architecture — Standing Rules

These rules describe the boundaries that future Black Flag work must preserve unless the Captain explicitly changes course.

## 1. Platform and project identity

Black Flag is the platform identity. Individual businesses remain visually independent inside their project customer and project-admin experiences. Black Flag branding should identify platform-owned transitions and controls without competing with project branding.

Every project shell inherits one small Black Flag return control in the lower-right. That control belongs to the platform, not to project content. It opens the Black Flag Engine authorization gate and must not be replaced by project-specific return implementations or passive “Powered by Black Flag” text.

## 2. Project isolation

Each project has a permanent project identity and namespace. Orders, customers, photos, settings, ledger entries, deployments, owner access, and other project records must remain bound to the owning project. Cross-project reads or writes are denied unless a deliberately shared Black Flag service is designed for that purpose.

Project branding and customer media must never leak between projects.

## 3. Authority boundaries

Customer devices receive customer-session authority only. Project administrators receive project-scoped authority only. Owner access is project scoped. Engine administration is a separate platform authority. Captain's Mode / Captain's Quarters is a separately gated, higher-privilege governance and experimental layer and must not collapse into ordinary super-admin access.

Crossing back toward Black Flag from a project locks Engine authorization and presents the Engine gate again.

## 4. Data and lifecycle

Projects use explicit lifecycle states and retain audit/recovery foundations. Completed operational history should be preserved according to the platform's retention rules rather than silently discarded. Production upgrades must preserve project data across application releases.

## 5. Security boundary

The current static/browser implementation provides client-side structure, policy, scoping, and test workflows. Real external owner/staff production authentication requires server-backed identity, secure sessions, server-side authorization, recovery, and revocation enforcement.

## 6. Development discipline

Prefer shared platform capabilities over hand-coded project exceptions. Runtime project fallbacks are forbidden for project-owned records. Legacy unscoped data may be assigned to a project only inside an explicit, auditable migration/import path. Preserve working IDs and routing contracts during visual-only changes. Validate JavaScript syntax, DOM ID uniqueness, local asset references, service-worker assets, and project boundary controls before release.


## 7. v3.7 storage boundary

The active browser database is Black Flag/Dark Sky owned (`blackFlagPlatformV1`), not project branded. Project-owned records inside that database must carry an explicit `projectId` and isolation envelope. Local order backups and drafts use Black Flag project-scoped keys.

Legacy Ike storage names remain only as read-only compatibility sources for the one-time v3.7 migration. Normal reads, analytics, customer capture, ledgers, owner metrics, integrity checks, and authorization must not infer Ike's from a missing project identity.

Project-admin PIN values and brute-force lockout state are scoped by project. Engine authorization remains a separate platform-wide gate.


## 8. v3.7.5 canonical project registry

Project identity is now explicitly separated from project display names. New projects receive immutable unique IDs from the structural core. Display names are operator-facing labels and may repeat. Authorization and isolation must use `projectId`/namespace, never a name or slug derived from a name. The full forward architecture is defined in `PLATFORM_BLUEPRINT.md`.


## Project identity rule (v3.8.2)

`project.id` is the immutable tenant identity. `project.name` / `identity.displayName` are mutable. `project.namespace` is derived from the immutable ID. The short `projectCode` is a human-facing reference and is not sufficient for authorization. Existing name-derived IDs are preserved as immutable legacy IDs; only new projects receive opaque `bf-p-*` IDs.


## v3.8.6 Project Control navigation
Project Control uses a two-level command model. Overview, Orders, and Customers remain direct. Operate, Insight, Experience, Access, and System reveal contextual second-level controls. Routing continues through the mission-critical `data-project-tab` navigation layer.

## v3.8.10 Overview Coherence
Project Control Overview uses the primary/secondary command navigation as the sole full navigation system. The overview may expose a limited Quick Actions set, but must not duplicate the full command tree. Routine project-open events are not considered meaningful overview activity.


## v3.8.11 — Sea Trials & Fleet Foundations
Sea Trials add a non-destructive runtime certification layer above the existing Hull Integrity checks. They exercise identity invariants, authorization failure paths, resource ownership, deployment boundaries, transition rules, mission navigation mounts, persistence, and audit availability. The production server-auth boundary is surfaced as a caution instead of being hidden.

Dark Sky now explicitly distinguishes reusable fleet primitives from Engine-specific systems. The Engine remains the first operating ship; Captain's Quarters is the future shipyard/governance surface. Future ships may reuse identity, authorization, isolation, lifecycle, audit, telemetry, recovery, deployment-boundary, and integration-contract patterns without inheriting Engine-specific order flows or Project Control UI.


## v3.8.14 — Presentation capability boundary
Project shells may declare a `previewGeometry` capability. This keeps the common order/identity/isolation platform shared while allowing product-specific visualization behavior. Current geometries are `flat-surface` for wood signs, `cylindrical-wrap` for mugs, and `card-overlay` for flowers. Product geometry is presentation capability data, not project identity.


## Visual Presentation Capability Contract — v3.8.14
Projects no longer depend on a single hard-coded preview geometry. Each project owns a `visualPresentation` contract with an immutable versioned shape: profile, input capabilities, placement capabilities, transforms, preview modes, approval stages, outputs, renderer, and optional custom capability IDs. Presets accelerate commissioning but do not constrain later configuration. `AVAILABLE` capabilities have working behavior in the current Engine; `FOUNDATION` capabilities declare supported requirements for future renderers and future ships.


## Launch readiness doctrine (v3.8.24)
A deployment may only become Active after the owning project has a customer-operating shell with at least one customer-ready offer and the selected outpost has completed a real Sea Trial customer order. UI-only interface tests do not satisfy activation readiness. Universal-shell projects can create their first launch offer directly in Deployment Shipwright; specialized shells remain supported.

Release packaging is intentionally consolidated: runtime code remains separated by responsibility, while historical audit notes are retained outside the Captain upload package and distilled into README, CHANGELOG, and ARCHITECTURE.

## v3.8.26 Guided Deployment Launch law
The Deployment Shipwright separates **operator guidance** from **technical diagnostics**.

The default operator surface must answer four questions without requiring manifest knowledge:
1. Which outpost am I editing?
2. What stage is it in?
3. What must I do next?
4. What single primary action advances it?

The launch voyage is **Configure → Save → Sea Trial → Test → Active**. Basic customer-facing configuration remains visible. Session safety, capability scope, device lock, readiness diagnostics, backward lifecycle controls, and manifest internals remain available but are progressively disclosed under Advanced/Operational sections.

This is presentation-only simplification. Project/deployment identity, authorization, persistence verification, test-order gating, and activation rules remain authoritative and may not be bypassed by the guided UI.


## v3.8.27 Engine authentication law

All Engine PIN gates must use the single `BlackFlagAuth.verify()` controller. `5615` remains the test-build recovery/default PIN and the configured Engine PIN remains valid. Authentication failures and lockout state are shared across Engine entry surfaces; no individual screen may implement its own PIN comparison. A lockout must be surfaced as a lockout, never as an incorrect-PIN message.


## Repeatable Business Understanding (v3.8.29)
A project owns two distinct business-understanding records:
1. `businessBrief` — the human-authored source of truth.
2. `operatingModel` — a structured, correctable interpretation derived from the brief plus project capabilities.

The operating model may inform customer flow, fulfillment, scheduling, required inputs, visual presentation, offers, and workflow. Corrections are stored as project-scoped overrides; the original brief is never replaced by the interpretation. This contract is reusable by future Dark Sky ships without inheriting the Business Command Engine UI.


## Fleet Commissioning Lane (v3.8.30)
A project is the vessel; deployments are its outposts. Project creation alone does not imply fleet membership. Dark Sky derives a launch state from real project evidence: business understanding/offers, outpost existence, Sea Trial state, recorded customer test, deployment activation and publishing. The Captain-facing lifecycle is **Draft → Preparing → Sea Trial → Fleet Ready → Live**. `Continue Launch` resolves the next incomplete requirement. `Join Fleet` is the final Captain-approved operation that activates a tested outpost and publishes the project while preserving the immutable Project ID.


## Customer Engagement Contract (v3.8.31)
The universal customer shell no longer assumes every business interaction is an order. Each project resolves a customer relationship contract from its Business Brief and Operating Model, with an explicit Project Control override. Supported relationships include purchase/order, service request, quote/estimate, booking, inquiry, partnership/engagement, application, reservation, and custom project.

Customer-facing action language, detail prompts, confirmation copy, and record semantics derive from this contract. For compatibility, engagement records continue to persist in the existing project-scoped order store, but non-purchase records are explicitly marked `recordType: engagement` with `relationshipType` metadata. A future storage migration can separate these records without losing provenance.

Post-submit confirmation is a distinct persisted session state keyed by Project ID + Deployment ID. A successful customer submission never automatically returns to a blank form. Sea Trial confirmation routes back to Shipwright; active customer confirmation remains visible until the customer deliberately begins another engagement.


## Fleet-level commissioning authorization (v3.8.32)
A Join Fleet action originates at the Engine fleet layer, where no Project Control context is necessarily open. Fleet commissioning therefore uses engine-session authorization scoped explicitly to the target Project ID, followed by deployment identity validation for the selected outpost. Project-local deployment mutations still require the stricter active Project Control context. This preserves project isolation without making Engine-level commissioning depend on UI navigation state.

## Fleet rail alignment law (v3.8.32)
The Engine project rail is horizontally scrollable and touch-first. Cards share a stable internal vertical rhythm so identity, deployment state, governance, KPIs, launch status, and actions remain visually aligned even when project names and launch messages vary in length. Horizontal swipe remains the primary iPad browsing behavior; arrow controls are an explicit secondary navigation aid.


## Operating Model Law — v3.9.0
A project must not be forced into purchase/order language or workflow. The Customer Relationship contract supplies project-scoped terminology and a reusable suggested workflow. Explicit project workflow overrides take precedence and never mutate another vessel. Customer submissions begin in the first resolved workflow stage.


## Command Watch routing law — v3.9.1
Operational notifications are actionable command surfaces, not decorative cards. First Mate Watch actions must route through one centralized controller, report busy/success/failure state, preserve project-scoped authorization, and visibly identify the destination command surface. Dynamic Watch cards use delegated routing so re-rendering cannot detach or stale their button behavior. Critical command controls must never fail silently.

### Command Surface Reliability Law — v3.9.2
Mission-critical command surfaces must not depend on completion of optional data migrations or secondary initialization. Waters Ahead, structural checks, audit/log access, and Sea Trials use an early-bound delegated command bus. Rendering a command without an actionable route is a platform defect.


### Engine Project Command Reliability Law — v3.9.3

Engine Project Command is a mission-critical surface. Fleet filters, search, horizontal rail navigation, project opening, launch/join-fleet, publish controls, Fleet Health project links, and Add Project must be routed by an early-bound delegated command bus. Dynamic rendering may replace cards, but must never replace the command route. Optional migrations or feature initializers may fail without disabling these controls. Decorative layers must never intercept pointer/touch input.

### Direct-Touch Fleet Rail & Registry Durability Law — v3.9.4

The Engine fleet rail is a native horizontal-scroll surface. Finger/trackpad scrolling is the primary navigation mechanism; auxiliary arrow controls are not part of the product contract. Project visibility is governed by the persisted fleet registry plus explicit search/status filters. Commissioning must not report success or clear its draft until the new immutable Project ID is verified by reading the persisted registry back from IndexedDB. A local verified registry backup may be used only when the primary registry cannot be read; it must never silently merge or resurrect projects into a healthy registry. Named commissioning drafts that are not yet registered must remain visible as Shipyard Drafts so unfinished project creation cannot disappear from the operator’s view.


### No-New-Damage Registry Gate — v3.9.5

Fleet persistence must not be globally disabled by pre-existing test or migration findings. Before any project-registry write, Dark Sky compares critical integrity findings in the last persisted registry with the candidate registry. A write is rejected when it introduces a new critical finding or when the prior registry cannot be verified. Existing findings remain visible and actionable but do not prevent safe commissioning or repair work. Commissioning is not complete until the new immutable Project ID is confirmed by reading the persisted registry back.


### Durable Project Registry Law — v3.9.6

The fleet registry is now a first-class persistent resource, not a convenience setting. The IndexedDB `projects` object store is canonical; `settings.companies` remains an atomic compatibility mirror during transition. Fleet writes must update both inside the same transaction and verify both by immutable Project ID before success is reported.

Commissioning obeys a strict durability sequence: **seal identity → commit registry → canonical read-back → resolve project in memory → render Engine card → clear commissioning draft**. Any failure before durable verification preserves the draft and restores pre-commission in-memory state. A rendering failure after verified persistence must never delete or recreate the project; the UI must report that persistence succeeded and recovery is a presentation concern.

This law prevents a visually successful commissioning flow from producing a missing vessel and preserves the doctrine: **names can change; identity cannot; successful commands must be proven by durable evidence.**


### Canonical Commissioning Reconciliation Law — v3.9.9

The canonical IndexedDB `projects` store is the sole authority for whether a commissioned vessel belongs to the fleet. Recovery journals and commissioning drafts preserve interrupted work, but they may never compete with a Project ID that is already present in the canonical registry.

Before Project Command counts or renders the fleet, Dark Sky reconciles commissioning artifacts against a fresh canonical registry read. If the immutable Project ID is present, canonical state wins: the project is loaded, matching recovery artifacts are cleared, and exactly one normal project card is rendered. If the Project ID is absent, one idempotent recovery transaction may write the preserved candidate against the freshly read registry and must verify that exact Project ID by reading the canonical store back before recovery is considered complete.

A matching Shipyard Draft is suppressed while a commissioning journal owns recovery for the same vessel. Historical journal stages are diagnostic history only and must never be presented as current registry truth. Manual recovery, boot recovery, and Project Command recovery use the same reconciliation controller.

This law strengthens the doctrine: **one immutable identity, one canonical fleet record, one visible project card.**


## Fleet Registry v4 (3.10.1)

The canonical `projects` IndexedDB store remains the fleet authority, but normal registry writes are non-destructive: a previously registered immutable Project ID cannot be omitted by an unrelated save. Startup reconciliation compares the canonical store, compatibility mirror, and verified local backup by immutable Project ID before rendering Project Command. The current fleet baseline is a final rescue source only when every persisted source has lost a known vessel. Duplicate Project IDs are rejected before commit. Registry schema version 4 is committed with the project collection and Ship Integrity verifies the in-memory registry, canonical store, mirror, project count, and schema marker. Publication/private/test state never determines project existence.


## Registry Rivets (3.10.2)

This is intentionally not a registry schema change. The v5 canonical registry and `grizzle-bear` → `grizzly-bear` alias remain unchanged. Project Command overrides the Grizzly Bear first KPI label to `ORDERS` because the displayed statistic is the project order count. Ship Integrity verifies that presentation contract. User-selected branding is not rewritten by this patch.

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

Dark Sky now explicitly distinguishes reusable fleet primitives from Engine-specific systems. The Engine remains the first operating ship; Captain's Quarters is the future shipyard/governance surface. Future ships may reuse identity, authorization, isolation, lifecycle, audit, telemetry, recovery, deployment-boundary, and integration-contract patterns without inheriting Engine-specific order flows or Project Control UI. See `FLEET_FOUNDATIONS.md`.


## v3.8.14 — Presentation capability boundary
Project shells may declare a `previewGeometry` capability. This keeps the common order/identity/isolation platform shared while allowing product-specific visualization behavior. Current geometries are `flat-surface` for wood signs, `cylindrical-wrap` for mugs, and `card-overlay` for flowers. Product geometry is presentation capability data, not project identity.


## Visual Presentation Capability Contract — v3.8.14
Projects no longer depend on a single hard-coded preview geometry. Each project owns a `visualPresentation` contract with an immutable versioned shape: profile, input capabilities, placement capabilities, transforms, preview modes, approval stages, outputs, renderer, and optional custom capability IDs. Presets accelerate commissioning but do not constrain later configuration. `AVAILABLE` capabilities have working behavior in the current Engine; `FOUNDATION` capabilities declare supported requirements for future renderers and future ships.

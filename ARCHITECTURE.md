# Dark Sky Architecture — v4.4.3

## Fleet identity law
The immutable Project ID is authoritative. `grizzle-bear` is a legacy alias only; the canonical Grizzly vessel ID is `grizzly-bear`. Identity migration rewrites project-scoped references without relying on the display name.

## V4 fleet authority
1. Canonical IndexedDB `projects` store records vessels.
2. V4 admission ledger proves which canonical IDs are active fleet citizens.
3. Fleet manifest is a projection of canonical rows intersected with valid admissions.
4. Project envelope ledger seals namespace, default-deny permissions, and project isolation.
5. Commissioning journal preserves an interrupted candidate until canonical read-back and presentation verification succeed.

## Experience Test Deck
Preview, Sea Trial, and Live use the same customer renderer. Preview is no-write. Sea Trial uses real infrastructure but marks test records and binds them to Project ID + Deployment ID. Live is production.
## Experience identity boundary
Project Command and the Experience Test Deck share one canonical project-reference resolver. A card may present a legacy or canonical reference, but the Test Deck must resolve the vessel by immutable Project ID across the active fleet and durable registry sources before it opens. Display names are never identity authority. If a durable canonical row is found while the in-memory fleet is stale, that exact row is rehydrated into memory before Preview, Sea Trial, or Live mode begins.



## V4.4.5 Project Mutation Boundary
A project-scoped operational change (deployment/outpost, offer, Sea Trial evidence) MUST persist by immutable Project ID into that project’s canonical row. It MUST NOT clear or replace the fleet registry. The compatibility `companies` mirror is secondary and may be refreshed after canonical read-back; failure of that mirror cannot invalidate an already verified project-row commit. Project Command restores/seals admitted fleet memory before every render so a project-local storage fault cannot reduce fleet visibility.


## V4.4.7 Primary Storage Readiness Law
No project-level mutation may assume an IndexedDB connection already exists. The storage gate must ensure a live primary DB before opening a transaction, may reopen/retry once on connection interruption, and must preserve the immutable project-local write boundary.


## V4.4.7 Forward-Only IndexedDB Law
Primary browser storage schema versions only move forward. A build must never request a lower schema than a previously shipped build. If Safari already holds a newer schema, Dark Sky reopens that schema without downgrade and validates the required object stores before project-scoped writes continue.


## v4.5 Trust Doctrine

1. Canonical project data survives missing governance metadata. Quarantine operational access, not business data.
2. Project-owned mutations update one immutable Project ID. Full registry writes are reserved for commissioning, explicit migration/recovery, retirement, and fleet governance.
3. Fleet filters and status derive from current launch state rather than legacy labels.
4. Published/Private is observable state; publishing is an explicit launch workflow.
5. Legacy Fleet Marks defaults are migration seeds only. New projects are first-class citizens without hard-coded baseline membership.
6. Storage Schema, Project Envelope, and Platform Contract are distinct version concepts.

## Captain's Quarters / Shipyard Boundary (4.5.5)
Captain's Quarters is the Captain-level command and incubation layer. It may host pre-commissioning vessel concepts in the Shipyard while continuing to oversee the active fleet.

Black Flag Engine remains the operating/governance layer for commissioned project vessels. Knowledge learned in the Engine—patterns, primitives, infrastructure, security approaches, analytics, and integrations—may be reused by a Captain-side concept only after evaluating whether it fits that concept's own mission, users, workflow, data model, permissions, and product requirements. Reuse is deliberate; inheritance is never automatic.

ScheduleJoe is currently a Shipyard concept vessel and is not enrolled in the Engine project registry.

## ScheduleJoe Hull Design Law (4.5.6)
ScheduleJoe does not begin as a calendar. Its first architecture phase must establish five core decisions before prototype behavior is treated as approved product law:
1. Build Model — identify the durable real-world object being scheduled.
2. States — define meaningful build states and evidence of transition.
3. Movement Rules — define dependencies, readiness, exceptions, recommendations, overrides, and where automation is prohibited or requires approval.
4. Permanent Record — preserve baseline, revisions, actuals, delay causes, inspections, and Captain decisions without rewriting history.
5. Roles / Permissions — define real authority to view, recommend, change, approve, and override before implementing user roles.

The dirt-to-keys construction sequence is field evidence used to challenge the model; it is not automatically a universal template. Prototype notes may be retained without gaining architectural authority. First Mate review exists to challenge assumptions, surface risk, and distinguish builder reality from software convenience.
## ScheduleJoe — Keel Architecture (4.5.7)

ScheduleJoe remains pre-commissioning work in Captain's Quarters. Its current organizational keel is Company → Region → Division → Community → Build/Lot → optional Unit. The visible Build Code uses `RRR-DDD-CC-LLLL[-U]`, but the code is never the database identity; every Build has a separate immutable internal ID.

Three concerns are deliberately independent:
1. **Organization** — where a Build sits in the business hierarchy.
2. **Authority** — what a user may see or change. Region is read-only for now; Division and assigned Project Manager hold primary operational authority; cross-scope access requires explicit approval.
3. **Template lineage** — Division and Community can create/localize schedules without overwriting parent templates. Every effective template preserves source, inherited version, explicit overrides, and the version used by a Build.

Engine lessons may inform these systems, but no Engine primitive is inherited automatically.


## Fleet Commissioning (4.6)
Dark Sky now treats commissioning as a distinct fleet-governance layer. It does not replace project-specific testing or business rules.

Lifecycle intent: Concept → Build → Test → Ready → Live → Maintenance.

The common fleet gate checks seven categories: explicit project identity, admitted/sealed isolation boundary, current customer-experience approval, current Sea Trial submission evidence, V4 durability/recovery posture, a live deployment, and a final Captain commissioning order.

Ike's Wood Signs is the first reference vessel. Lessons proven there may be promoted into the fleet standard, but no Ike-specific business workflow becomes a fleet requirement merely because Ike proves it.

Captain commissioning metadata is stored separately from the canonical project registry. Revoking a commissioning order never changes Project ID, project data, or project governance status.

## 4.9.0 Responsive Customer Contract
Dark Sky customer projects are required to support phone, tablet, and desktop use. BOR North Richmond is the first project certified against the full contract. The contract provides safe-area handling, touch-first controls, no accidental horizontal overflow, readable phone typography, mobile camera/photo support, and customer-flow navigation that does not depend on hover. Existing projects are not automatically restyled by BOR; they must be upgraded and regression-tested individually before certification.


## 4.9.1 Customer Trust + Deployment Boundary
BOR remains a project package, not a platform skin. Its restoration workflow, visual identity, phone number, and customer copy stay local to `bor-north-richmond`. Shared mobile fixes are limited to generic gesture/viewport behavior. Test-mode contact actions are inert; live deployment state controls whether real-world contact links are exposed. This keeps future standalone-domain deployment possible without coupling a customer site to Black Flag navigation.


## 4.9.4 Capability Authority + Manager Projection
Dark Sky owns a master capability library. Capability existence does not grant project use. Each project stores an explicit project-scoped enabled capability set, and only Black Flag Project Control may activate or deactivate that set. Business descriptions/types provide recommendations, not automatic authority.

The Project Manager Workspace is a projection of the enabled set. It groups capabilities around operational work rather than exposing platform architecture directly. Multiple capabilities may feed one manager area; enabling a capability does not require creating a new navigation item. Project managers may operate approved capabilities but cannot broaden project authority.

AVAILABLE means the current build has working behavior. FOUNDATION means the capability is recognized and may be enabled for project planning/visibility, but the runtime must not imply production-ready behavior that does not yet exist.

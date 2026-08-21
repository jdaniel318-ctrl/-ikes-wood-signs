# 5.2.0 Engine Command & Header Contract

## Engine command hierarchy
Black Flag presents three operational questions in order: what needs attention, what vessels are being operated, and what should happen next. **Commission New Project** is a first-class Engine command and routes to the same isolated commissioning workspace as the Project Command entry point.

## Commissioning vocabulary
The fleet-level lifecycle is **Create → Prepare → Sea Trial → Fleet Ready → Live**. The detailed reversible work inside Prepare is **Configure → Preview → Approve**. Configuration changes may stale downstream evidence, but never change the immutable Project ID.

## Project header chassis
Project Control Center headers share safe geometry and protected control zones. The visual skin is resolved only from that project's business profile and project-owned assets. Cross-project asset fallback is forbidden. Header artwork is a non-interactive presentation layer and cannot reposition or obscure Black Flag navigation controls.

## Authority spine
Project Admin **4353**, Black Flag Engine **5615**, Captain's Quarters **19613**. 5.2.0 does not alter authentication semantics.

# 5.1.0 Business Intake & Fleet Learning Contract

- Business intake evidence is project-scoped from the moment it becomes a commissioned project.
- Analysis produces recommendations, never authority: the Captain/Engine may accept, modify or ignore them.
- No imported customer records, files, graphics, contacts or project settings may be copied into another vessel. Reusable fleet learning is limited to abstract capability/pattern recommendations.
- Uploaded site files are parsed locally in the browser. Website URL fetch is best-effort and must fail safely when cross-origin policy blocks access.
- Visual directions use a shared structural header contract but remain project-specific skins; graphics and assets are project-owned.
- The authority spine is untouched: Project Admin 4353, Black Flag 5615, Captain’s Quarters 19613.

# 5.1.0 Authority Spine Note

The stable authentication hierarchy is Project Admin (`4353`) → Black Flag Engine (`5615`) → Captain's Quarters (`19613`). These are separate authority domains. Captain Test Access may grant a session-only Engine bypass when deliberately enabled, but it does not alter any PIN. The 5.0 isolation boundary remains independent from authentication and must not be weakened when credentials are repaired.

# Dark Sky Architecture — 5.0 Fleet Boundary Contract

## Non-negotiable fleet isolation law
A Project ID defines a sealed operating namespace. Project display name, customer shell, admin theme, test state, or Captain route may never substitute for Project ID authority. No project transition may leave another project's customer, PIN, admin, order, ledger, owner, or project-control surface active.

## Layer contract
1. **Project Experience** — exactly one active Project ID; only that project's customer shell may be visible.
2. **Project Admin / Manager Workspace** — requires the same active Project ID that launched the gate. PIN authentication cannot change project context.
3. **Black Flag Engine** — has no active customer/admin Project ID. Project Control may select an `engineActiveProjectId`, which is an Engine target, not a project session.
4. **Captain authority** — may inspect fleet-wide state but does not become project identity and cannot override project isolation.
5. **Return navigation** — a project-to-Engine transition may preserve one immutable return Project ID only for cancel/back behavior; it must clear the active project before Engine UI is rendered.

## 5.0 boundary spine
`clearProjectPresentation()` hides all customer and protected project surfaces. `clearActiveProjectContext()` removes the active project identity. `prepareEngineBoundary()` applies both before Engine rendering. `activateProjectContext(project)` is the canonical project-session entry point. Protected surfaces call `assertProjectBoundary()` before render or mutation.

## Workflow isolation
Project Manager status controls use `projectWorkflowFor(project)`. Global/Ike order statuses are not permitted to define another project's operational workflow. Async project operations capture the Project ID before storage reads and re-check the same boundary before committing.

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

## Dark Sky 5.0.3 — Stable Authority Spine

The platform must be adaptable without allowing feature work to rewrite authority boundaries.

| Layer | Normal credential | Scope |
| --- | --- | --- |
| Project Admin | 4353 fleet default/recovery | One immutable project namespace only |
| Black Flag / Engine Room | 5615 | Fleet command and project control |
| Captain's Quarters | 19613 | Platform/captain authority |
| Captain Test Access | Session-only bypass after Engine + Captain verification | Engine entry convenience only; does not redefine credentials or project scope |

Rules:
1. Project lifecycle state (`development`, `test`, `live`) is not authentication state.
2. Captain Test Access is the only established Engine PIN bypass and exists only for the current browser session.
3. Test Access does not bypass Project Admin and does not change Project ID.
4. Stored project settings cannot redefine Black Flag or Captain credentials.
5. Engine selection state (`engineActiveProjectId`) is not a project customer/admin session (`activeProjectId`).
6. Crossing a layer boundary clears incompatible UI/state before the destination layer renders.
7. No generic route may infer Ike's or any other project when an immutable Project ID is absent.

## 5.1.0 Engine Commissioning Contract
Project lifecycle governance belongs to the Black Flag Engine Room. The canonical commissioning path is Configure → Preview → Approve → Sea Trial → Ready → Live. Operators may return to configuration or rerun preview/testing without rebuilding project identity. Preview, approval, and Sea Trial evidence are bound to the current customer-facing configuration signature, so later customer-facing changes invalidate downstream evidence by becoming stale rather than by deleting project data. Project Manager and customer layers do not own or expose this lifecycle machinery. Every transition remains project-scoped and default-deny across project boundaries.

# 8.5.3 Readiness Truth Contract

- **Engine operates. Captain commands. Admiral governs.**
- Professional operational views must be complete without cinematic presentation.
- Cinematic/Ceremonial views are optional second views and cannot hide or replace required controls.
- Captain command follows **Watch → Decide → Act → Record**.
- Fleet Doctrine and Golden UI Voyages are governed machine-readable release artifacts.
- Fleet Learning follows one promotion path: Observation → Lesson → Capability Candidate → Foundry → Sea Trial → Proven Capability → Fleet Standard / Shared Service / New Vessel.

---

# Fleet Operating Contracts
> Consolidated in Dark Sky 8.2.8 to keep the deployment lean while retaining the full historical contracts as an AI-readable regression reference.

---

## Source: `ARCHITECTURE.md`

# Dark Sky 6.0.6 — Clear Decks Architecture Note

Captain navigation is explicitly hierarchical: **Engine Room → Captain’s Quarters → Captain subview**. Only the main Captain room may exit to Black Flag. Captain subviews must return to Captain’s Quarters first. This prevents overlapping navigation authorities and keeps Captain-only state from leaking into Engine transitions.

# Dark Sky 6.0.3 — Drydock Reconciliation

Canonical repository/root reconciliation release. Captain’s Quarters now uses one canonical production environment asset (`assets/captains_quarters_canonical.png`) across all runtime and fallback paths. The deployable `assets/` directory contains media only; application/runtime files remain at repository root. Client Preview isolation, Black Flag, project routing, authority contracts, and cloud-readiness contracts are preserved.

## 6.0.3 Helm — Sunset environment restoration

Captain's Quarters keeps the 5.8.1 responsive Helm architecture, but restores the clean sunset harbor command room as the production environment layer. Real controls remain HTML/CSS/JS; the environment is visual only. Black Flag, projects, Client Preview and authority boundaries remain unchanged.

## 6.0.3 Helm — Captain environment/UI separation

Captain’s Quarters now follows a strict environment/UI split: cinematic art is non-interactive background; all controls, data, navigation, and accessibility are real DOM elements. Captain-only responsive layout targets a single landscape viewport and preserves modal overlays above the room.

## 5.7.9 Quarterdeck — Captain-only refinement

Captain’s Quarters keeps the cinematic Chartroom art as a skin while live fleet facts, routing, and controls remain separate DOM/controller layers. Decorative concept metrics are masked by real Captain intelligence. No project or Engine state is stored in the artwork.

## 5.7.8 Breakwater stabilization

The 5.7.8 line intentionally retains the proven 5.7.3 Black Flag Engine gate DOM/authentication structure. Cleanup around this boundary is presentation- and bookkeeping-only unless a regression test explicitly proves a structural change safe.

# Dark Sky 5.7.0 — Cloud Readiness / Portability Spine

Dark Sky treats infrastructure as replaceable and the platform spine as durable. Devices are clients, Git/source history is the code-recovery authority, and future live project/customer data must move to managed cloud data/file services with independent backup and restore. Domain, registrar, DNS, static host, API host, database, object storage, and MSP are infrastructure choices rather than project identity. See `CLOUD_READINESS.md` and `DEPLOYMENT_MANIFEST.json`.

The authority spine remains Project Admin 4353, Black Flag 5615, Captain's Quarters 19613, with unique Client Preview PINs. Project ID isolation and test-contact safety remain invariant across any migration.

# 5.4.0 Contractor Experience Contract

Shared structure may learn from a business category, but visual evidence is project-scoped. Public website assets may seed a project-specific experience when tied to that project's source URL. Another project may reuse contractor interaction patterns, never the source business's logo, imagery, customers, records, or settings.

# 5.3.2 Business Intake Compiler Contract

- Accepted business-intake evidence now compiles into a runnable, project-scoped customer configuration instead of remaining advisory only.
- Plumbing intake creates a confidence-first landing page, plumbing-specific service categories, required email/contact capture, and a universal service-request workflow.
- Existing commissioned plumbing projects with intake evidence are upgraded deterministically at read time, so Preview is available without recreating the vessel.
- Project IDs, assets, orders, admin state, and runtime context remain isolated; the compiler never borrows another project's state.
- Authority spine unchanged: Project Admin 4353, Black Flag 5615, Captain's Quarters 19613.

# 5.3.0 Guided Intake Contract

Commissioning is evidence-assisted, not template-copying. A new project may be taught from (1) its public website, (2) uploaded project-owned website files, or (3) a manual Business Brief. Public URL retrieval may use a public-site text reader only when direct browser access is blocked. Uploaded files do not use that fallback. All derived business profile data, opportunities, brand guidance, and visual directions remain attached to the commissioning draft and eventual immutable Project ID.

Business category inference may improve recommendations, but it never imports another vessel's branding, settings, customers, records, assets, or lifecycle evidence. The commissioning UI may suggest; the Captain/project configuration remains editable.

Authority spine remains: Project Admin 4353; Black Flag Engine 5615; Captain's Quarters 19613.

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

## Fleet Customer Entry Contract (5.6.0)
Every customer-facing vessel enters through its own landing experience at scroll origin. Fresh project entry, Private Preview, Test Experience, and explicit Home navigation must reset document and customer-shell scroll state. Scroll state is never shared across Project IDs. Business-category learning may improve layout and journey recommendations across the fleet, but customer data, assets, brand state, workflow state, and presentation state remain project-scoped.

Customer experience reuse follows the rule: **shared principles, unique vessel**. Confidence-first landing, one dominant customer action, business-appropriate categories, guided intake, required transactional email by default, and mobile-first navigation are reusable contracts. Brand assets, imagery, copy, offers, and project data are never inherited from another project.


## Client Preview Boundary (5.6.0)

Client Preview is a fourth customer-facing lifecycle surface alongside Internal Preview, Sea Trial, and Live. It is presentation-only and is designed for sharing with a prospective or current business owner before publication. The preview transport is project-scoped and revision-scoped, protected by a unique preview PIN, and always executes under non-live contact safety. It must never expose Dark Sky/Black Flag/Captain authority surfaces.

## 5.7.3 Engine entry stabilization
- Black Flag 5615 is treated as a pre-storage entry invariant.
- The Engine transition is atomic: all project/customer/admin surfaces are hidden before the PIN cover is removed, preventing legacy Ike/project flashes.
- A secondary initialization or migration failure no longer revokes an already-authenticated Engine session or reopens the PIN gate.
- Engine render warnings remain visible/recoverable without silently locking the Captain back out.

## Client Preview isolation bulkhead (5.7.8)
A sealed Client Preview is a standalone runtime, not a temporary project route through the fleet application. The URL fragment is detected before first paint. The normal app, default Ike shell, Engine, Project Admin, Captain surfaces, and Test Deck remain visually sealed while the preview PIN gate is constructed. The preview route executes before project storage or fleet migrations, and only the project snapshot carried by the invite may be activated. This prevents cross-project first-frame leakage and makes Client Preview independent of the browser's last active vessel.

## 6.2.0 authority hierarchy trial

The tested authority hierarchy is Admiral → Captain → Black Flag / fleet operations → project-scoped administration. Admiral is singular by default and governs Dark Sky, Black Flag, and fleet standards. Captain remains singular strategic/mission command. Delegation occurs only by explicit owner discretion.

The Admiral's Deck is currently a provisional testing surface reached upward from Captain's Quarters through Admiral's Gate. It uses a distinct Admiral credential contract even while temporarily accepting the same `19613` value as Captain's Quarters. The deck returns to Captain's Quarters, preserving the hierarchy.


## 6.3.0 — Ascension / command threshold contract
- Authority hierarchy remains Admiral > Captain > Black Flag operations > project-scoped authority.
- Captain's Helm is the proving ground for Fleet Readiness, Visual Forge, Workshop, Blueprint and controlled ascent to Admiral's Gate.
- Captain and Admiral command entrances may use theatrical transitions, but repeat entries are shortened and reduced-motion preferences remain authoritative.
- Admiral's Deck offers Ceremonial and Professional presentation modes over the same governance/authority state.
- Visual capability proven at Captain or Admiral level may later be promoted explicitly into reusable fleet capability; no automatic cross-project promotion is allowed.

---

## Source: `BREAKWATER_OWNER_HANDOFF_CONTRACT.md`

# Dark Sky 8.0.1 — Breakwater Owner Handoff Contract

## Mission
Owner / Partner authority must open as a first-class project-scoped surface. It must never wait behind the full Engine/fleet boot sequence and must never fall through to Black Flag authority.

## Contract
1. An explicit owner route paints a protected Owner shell immediately from the immutable Project ID.
2. Fleet/database/storage hydration happens behind that shell.
3. The generic protected-route watchdog cannot falsely recover a legitimate owner route while fleet storage is loading.
4. After canonical project hydration, Owner Login or Owner Control Center replaces the shell in place.
5. Owner refresh restores the owner authority route.
6. Owner failure remains Owner-safe and offers Retry Owner Portal or Return to Engine Access; it never exposes another project.
7. Engine, Preview, Customer, and Owner sessions remain separate namespaces.

This contract applies fleet-wide to every project that enables Owner / Partner access.

---

## Source: `BULKHEAD_SESSION_CONTRACT.md`

# Bulkhead Session Contract — 7.9.3

1. Owner/Partner authentication is project-scoped and never requires or inherits Black Flag Engine credentials.
2. Owner login -> Owner Control Center must render immediately without browser refresh.
3. Refresh on #owner-portal restores the authenticated owner portal when the owner session is valid.
4. Refresh on #owner-login restores that project owner login, never Engine Access.
5. Owner logout returns to the same project's owner login.
6. Captain/Engine session state is independent and cannot substitute for owner authority.
7. Fleet Dock and Advanced Project Command derive vessel identity from the same canonical registry.
8. Forced duplicate identities are reconciled at registry source, not hidden in UI.

---

## Source: `CLEAN_WAKE_FIRST_PAINT_CONTRACT.md`

# Harbor Pilot First-Paint Contract — 7.9.6

1. No project-specific branding may paint before the active route, authority, and project identity are resolved.
2. Every refresh begins behind a neutral Dark Sky first-paint bulkhead.
3. Engine, Owner/Partner, and Client Preview routes release the bulkhead only after the correct first surface is ready.
4. Project templates may remain bundled in the document, but are visually inert during preflight.
5. A stale/default vessel is never an acceptable loading placeholder.
6. Browser refresh is permitted as recovery, but must never cause cross-project visual bleed.

---

## Source: `HARBOR_LIGHT_BOOT_CONTRACT.md`

# Dark Sky 7.9.6 — Harbor Pilot Boot Contract

Harbor Pilot closes the startup hole found during Clean Wake testing.

## Fleet boot rules

1. No project-specific surface may paint before route and authority are known.
2. The default root route may paint the Black Flag Engine access gate immediately because it is a neutral platform boundary, not a project surface.
3. Owner and Client Preview routes remain project-scoped and never fall through to a different project's customer shell.
4. Route resolution is bounded. A neutral `Securing Route` state may not persist indefinitely.
5. If Owner/Preview routing cannot resolve within the deadline, Dark Sky shows an explicit neutral route-recovery surface. It does not reveal another project and does not silently cross into Engine authority.
6. Refresh is not part of normal navigation. In-app routes remain the primary contract.

This contract is fleet-wide and applies to all future projects.

---

## Source: `HARBOR_PILOT_BOOT_CONTRACT.md`

# Dark Sky 7.9.6 — Harbor Pilot Boot Contract

1. Route authority is decided before project-specific paint.
2. The root/Engine route paints the neutral Black Flag Engine Access gate synchronously on DOM ready.
3. Engine first paint may not wait on IndexedDB, migrations, telemetry, service workers, fleet reads, or project restoration.
4. Owner and Client Preview routes remain project-scoped and may never fall through to another project.
5. Protected route resolution is bounded. Failure produces an explicit neutral recovery surface; it never loops indefinitely.
6. Returning to Engine clears stale Owner/Preview route markers before the next refresh.
7. No project identity may flash during startup, refresh, authentication transitions, or route restoration.

---

## Source: `IRONCLAD_AUTHORITY_HANDOFF_CONTRACT.md`

# Breakwater Authority Handoff Contract — Dark Sky 8.0.1

## Mission
Customer, Owner / Partner, and Captain are separate authority routes over one canonical fleet registry.

## Owner / Partner handoff
- Fleet Dock Owner / Partner actions arm the immutable Project ID and navigate directly to an explicit `surface=owner` route.
- The Black Flag Engine gate must never paint, claim, or authenticate an explicit owner route.
- Active owners enter only their project-scoped Control Center; unauthenticated owners see only that project's owner login.
- Owner refresh restores the owner route. Owner sign-out returns to the owner login, never Engine Access.
- `owner.html` remains a durable outside-owner entrance, but Captain-to-owner navigation does not depend on an intermediate redirect.

## Captain boundary
- Normal `index.html` without an explicit protected surface is Engine authority.
- Engine PIN is Captain/Engine-only and is never a project-owner credential.

## Fleet truth
- Fleet Dock, metrics, readiness, Project Tools, callsigns, and owner state consume the same canonical registry established by Keelson.

## Interaction proof
- Consequential actions leave a durable visible state.
- Transient confirmations remain visible long enough to read on iPad/iPhone.

---

## Source: `KEELSON_CANONICAL_FLEET_CONTRACT.md`

# Keelson Canonical Fleet Contract — Dark Sky 7.9.8

## Purpose
Every Engine fleet surface derives from one reconciled canonical project registry. Fleet Dock is the primary navigator; Advanced Project Command is a secondary drill-down tool.

## Invariants
1. One immutable Project ID represents one vessel.
2. Duplicate business identities are reconciled at the canonical registry source before any fleet surface paints.
3. Fleet Dock, fleet counts, readiness proof, owner state, and Advanced Project Command consume the same canonical roster.
4. Display order never defines vessel identity. Fleet cards show a stable callsign derived from project identity.
5. If duplicate business identities survive canonical reconciliation, Fleet Dock reports an identity hold rather than silently pretending the roster is healthy.
6. Project data is migrated to the surviving canonical Project ID before a duplicate row is removed; project isolation remains sealed.
7. Fleet Dock is the normal operational navigator. Advanced Project Command remains available, collapsed by default, for deeper administration.

## Release intent
7.9.8 is a structural fleet pass: one roster, one set of counts, one navigation spine.

---

## Source: `MOBILE_CONTRACT.md`

# Dark Sky Responsive Customer Contract — 4.9.1

All current and future customer-facing vessels must remain viable on iPhone, iPad/tablet, and desktop.

## Required behavior
- iPhone portrait is a first-class commissioning target.
- Vertical document scrolling must remain available even inside horizontally swipeable components.
- Keyboard focus must not trap or permanently compress the page viewport.
- Controls must be touch-sized and not depend on hover.
- Fixed/sticky actions must respect device safe areas and must not obscure core content.
- Test/Private Preview cannot initiate real-world contact actions.
- Platform/test navigation is subordinate to project branding; launched standalone projects may hide it entirely.
- Customer temporary state must reset reliably between sessions/requests.

## Certification status
- Signal Restoration: active restoration/mobile reference implementation (legacy internal Project ID retained only for continuity).
- Existing fleet: preserved; certify individually rather than applying global project restyles.

---

## Source: `OWNER_BRIDGE_CONTRACT.md`

# Owner Bridge Contract — 8.0.1

Owner / Partner authority is a standalone project-scoped surface.

- Fleet Dock routes Owner / Partner actions directly to `owner.html?project=<immutable-id>`.
- `owner.html` opens the canonical Dark Sky IndexedDB directly and does not boot the Black Flag Engine application.
- Owner session state uses the project-scoped owner session namespace and survives refresh within the same tab.
- Owner login and Control Center never require or grant Black Flag Engine credentials.
- Owner data reads and writes are filtered to the requested immutable Project ID.
- If owner storage cannot open, the owner surface fails safe in-place; it does not paint another project or authority.
- Returning to Black Flag is an explicit testing/Captain action only when the route originated from Engine.

---

## Source: `SESSION_BOUNDARY_760.md`

# Dark Sky 7.6.0 — True Bearing — Session Boundary Contract

Deployment state and customer-session state are separate facts.

## Entry contracts
- Published project + **OPEN PROJECT** => `LIVE CUSTOMER` / deployed session.
- **Test Experience / Sea Trial** => simulated test session; external contact remains blocked.
- **Client Preview / Private Preview** => simulated preview session; external contact remains blocked.
- Project Control Center => `ADMIN CONTROL`; it never masquerades as a customer session.

A live project may be tested safely without changing its deployment state. A stale test context may never leak into the published Open Project route.

## UI clarity
Project Control surfaces separate Deployment, Readiness, Approval, and Current Session instead of overloading one status word.

## Proving Ground
The Session Boundary Voyage is HOLD-worthy. It verifies the live route establishes a deployed session explicitly while test/preview contexts stay non-live.

---

## Source: `SESSION_BOUNDARY_761.md`

# Dark Sky 7.8.0 — Sounding Glass — Session Clarity Contract

True Bearing separated deployment state from customer-session state. Sounding Glass makes every customer-facing confirmation say exactly which non-live boundary is active.

## Required labels

- Published `OPEN PROJECT` establishes `LIVE CUSTOMER`.
- Test Experience establishes `TEST EXPERIENCE`.
- Private Preview establishes `PRIVATE PREVIEW` and creates no live order record.
- Client Preview remains independently isolated by its invite/pre-paint contract.

## Confirmation rule

A non-live submission must never fall back to a generic `TEST MODE` label when the exact session is known.

- Private Preview: `PRIVATE PREVIEW — ... No live order record was created ...`
- Test Experience: `TEST EXPERIENCE — ... test data ...`

A `PREVIEW-NO-RECORD` receipt must explicitly say that no live order record was created.

## Proving requirement

Session Boundary Voyage is CLEAR only when route state and session-specific confirmation-label contracts both verify against the current build.

---

## Source: `THREE_WATCH_ARCHITECTURE.md`

# Dark Sky 7.8.9 — Three Watch Architecture

Dark Sky may commission three distinct surfaces for a project when the business needs independent owner operation.

1. **Customer Experience** — business-branded, simple, and free of platform/admin chrome for ordinary public sessions.
2. **Owner / Partner Business Portal** — project-scoped self-service for approved business operations such as pricing, orders, branding, notifications, reporting, devices, staff, and owner-selectable features already approved by Black Flag. It does not grant Engine or Captain authority.
3. **Black Flag / Captain** — fleet governance, security, project isolation, capability approval, commissioning, release readiness, and cross-fleet oversight.

Navigation is explicit. Public customers do not need a platform return control. Captain/operator entries retain a protected in-app return route so Safari Back or Refresh is not part of the operating contract. Returning owners use a durable project-scoped owner entrance such as `owner.html?project=ikes-wood-signs`.

The pattern is reusable across future projects only when the mission needs it; project-specific pricing, branding, inventory, and workflows remain isolated to the vessel that owns them.

---

## Source: `TRUE_BEARING_FLEET_CONTRACT.md`

# True Bearing Fleet Contract — 7.9.1

## Primary navigation
Fleet Dock is the normal fleet navigator. The Captain chooses a vessel first, then the authority route. Advanced Project Command remains available for deeper administration but is not the navigation backbone.

## Three authority routes
1. Customer Experience — business-facing customer journey only.
2. Owner / Partner — project-scoped self-service for the independent business owner.
3. Captain — Black Flag commissioning, governance, security, isolation, and fleet-level control.

Test / Preview is a safe operating mode, not a fourth authority.

## Canonical identity
Immutable Project IDs remain the security and data boundary. Human-facing business identity may be deliberately corrected without changing that Project ID. A strict duplicate-business reconciler may fold duplicate vessel rows only when business identity agrees and available contact evidence does not conflict. Project-scoped references are migrated before the duplicate row is removed.

## Owner path
If owner access is not configured, Fleet Dock routes the Captain to project-scoped owner setup. If owner access is configured, Fleet Dock routes to the owner entrance. Active owners operate their vessel within approved capabilities without Black Flag credentials.

## Scale
Fleet Dock must remain searchable, filterable, status-aware, and priority-sorted as the fleet grows. Hard-coded vessel-specific shortcuts may exist only as optional conveniences, never as the architecture.

---

## Source: `TRUE_HELM_ROUTE_CONTRACT.md`

# Breakwater Route Contract — 8.0.1

1. The normal `index.html` route is Engine authority unless an explicit protected surface is requested.
2. Owner/Partner entry uses `owner.html?project=<id>` and resolves to `index.html?surface=owner&project=<id>&view=<login|portal>`.
3. Legacy owner hashes are honored only when armed by a same-session owner navigation; stale hashes never override Engine intent.
4. Client Preview remains an explicit protected invite route.
5. Neutral first paint remains mandatory; project branding cannot paint before authority is resolved.
6. Protected routes fail to explicit recovery; Engine routes fail directly to Engine Access.
7. Owner session and Engine session remain separate namespaces.

---

## Source: `VISUAL_HELM_CONTRACT.md`

# Visual Helm Contract — Dark Sky 8.0.7

1. The customer may rotate the captured plank photo in 90° increments before accepting it.
2. The accepted photo itself is authoritative: its top edge is the sign top.
3. Orientation is derived from the accepted/rotated plank geometry; the normal Ike design flow must not require a separate TOP selector.
4. Portrait/vertical planks receive orientation-aware text layout without asking the customer to understand layout mechanics.
5. Printed/stamped marks on the back of the plank are non-authoritative for top, species, length, and lettering-zone decisions.
6. Lettering styles should represent real Ike production aesthetics rather than generic font samples.
7. Forward camera actions live on the right when space allows; cancel/back actions live on the left.
8. Secondary verification photos may be used transiently for analysis but must not be copied wholesale into persisted order records. Derived evidence and audit metadata must remain.

---

## Source: `WATERTIGHT_AUTHORITY_CONTRACT.md`

# Watertight Authority Contract — 7.9.2

## Owner / Partner bulkhead
- Owner / Partner is project-scoped authority.
- Entering an owner portal must never request or accept the Black Flag Engine PIN as the normal owner credential.
- Fleet Dock owner entry routes directly to the project owner login/control center.
- Durable owner bookmarks use `index.html#owner-login=<Project ID>`.
- Black Flag/Captain authentication remains a separate authority boundary.

## Canonical vessel identity
- Fleet Dock must render one canonical vessel per real business identity.
- The known Legacy Plumbing duplicate is folded even if stale contact mirrors differ.
- Project-scoped evidence and references migrate to the survivor before the duplicate row is removed.
- Conflicting contact values are retained as reconciliation evidence for review.

## Promotion hold
Do not promote this build to Known Good until Owner Entrance reaches the owner login without Engine authentication and the Fleet Dock shows only one Legacy Plumbing vessel.

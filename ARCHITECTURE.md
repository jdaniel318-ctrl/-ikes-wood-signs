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

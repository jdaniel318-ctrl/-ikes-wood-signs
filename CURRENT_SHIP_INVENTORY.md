# Dark Sky Current Ship Inventory

**Baseline preserved:** v3.7.4  
**Working release:** v3.8.2 Immutable Project Identity

## Already aboard
- Captain's Quarters privileged layer
- Black Flag Engine fleet view
- Project Control Center
- Three proof projects
- Project-specific owner invitation/claim framework
- Project-scoped admin PIN model
- Project-scoped orders, customers, ledgers, activity, and drafts
- Project deployments / kiosk concepts
- Project workflow, publishing, product and configuration controls
- Live Engine performance graphs
- Platform audit, telemetry, recovery snapshot and integrity functions
- Legacy Ike migration bridge constrained to Ike
- Dedicated Engine workspace navigation compatible with iPad Safari

## Needs repair / consolidation
- Project identity was historically derived from display-name slugs in Add Project.
- Display-name collision was incorrectly treated as a hard creation failure.
- Commissioning and Add Project are overlapping project-creation paths and should converge over time.
- Template concepts exist but capabilities are not yet a formal reusable layer.
- Deployment concepts exist but are not yet a single first-class deployment model.
- Project Control contains many controls but its Overview is not yet the desired business cockpit.
- Changelog/version labels contain historical inconsistencies from rapid repair releases.

## Not yet fully built
- Canonical capability registry
- Template versioning / safe project migration
- Unified onboarding journey
- First-class deployment health/analytics
- Full lightweight CRM view
- Project-level integration framework
- Captain's Foundry lifecycle
- Formal production release channels / rollback policies

## v3.7.5 first repair
- Project IDs are now generated independently from display names.
- Display names are labels; repeated names no longer block project creation.
- A canonical registry view is exposed by the structural core.
- Duplicate display names are integrity warnings rather than critical identity collisions.
- New Add Project and Commissioning records receive registry/lifecycle metadata and immutable unique IDs.


## v3.7.6 Stage 2 refit
- Project Commissioning is now the single supported project-creation path.
- Commissioning drafts recover and persist their current step.
- Owner handoff readiness validates owner identity before commissioning.
- Invitations bind to project ID, namespace, and intended owner email.
- Local owner passwords are no longer retained as plaintext.
- Cross-device production identity remains intentionally deferred to a server-side identity service.


## v3.7.7 hull-integrity pass
- Project Control writes require exact Engine project context.
- Engine fleet writes are project-authorized before mutation.
- Owner Portal mutations require project-bound active owner sessions and module capabilities.
- Deployment records carry sealed project/namespace authorization claims.
- Deployment transition rules and retirement semantics are explicit.
- Critical collection integrity failures block persistence.

### Still intentionally deferred
- Server-side authentication/authorization and tenant enforcement.
- Remote owner invitation delivery/recovery.
- Production payment/accounting integrations.
- v3.8 business-cockpit information architecture.


## v3.8.0 command-and-visibility pass
- Project Control Overview now reads project-scoped orders, customers, deployments, ledger entries, and activity into one business cockpit.
- Project navigation is grouped by operator intent instead of a flat tab list.
- Project Analytics now shows only verified order/customer/ledger data and explicitly refuses to fabricate visitor/conversion telemetry.
- Existing Project Control modules remain available one command away; no existing workflow or authorization path was removed.
- This release does not yet implement the v3.9 capability/template abstraction.


## v3.8.2 identity refit

- Project IDs are immutable across renames.
- Existing IDs are preserved; new IDs are opaque and name-independent.
- Project Control can rename the business without creating a new project.
- Owner branding uses the same rename path.
- Identity history records prior names.
- Technical namespace follows Project ID, not display name.

## v3.8.10 Overview coherence
- Project Control bottom duplicate command menu removed.
- Compact Quick Actions present for six common operations.
- Activity overview filters routine project-open noise.


## v3.8.11 Sea Trials & Fleet Foundations
- Engine Configuration has a non-destructive Sea Trials station.
- Existing audit trail is now surfaced as the Ship's Log from Sea Trials.
- Structural Status reports Project Envelopes against active schema 6.
- Fleet foundation doctrine is documented, but no Admiral layer or new ship runtime has been created yet.
- The Engine remains browser-local and production server security is still explicitly pending.

# v3.8.11 — Sea Trials Audit

## Purpose
Sea Trials are a non-destructive readiness check for the current browser-local Dark Sky / Black Flag Engine. They test the ship as a system rather than validating isolated controls.

## Runtime checks
The Engine Configuration station now checks:
- structural integrity and critical DOM controls;
- immutable Project ID behavior through an in-memory rename;
- wrong-project authorization and scope probes that must fail closed;
- stored order ownership against the project registry;
- deployment boundary sealing;
- deployment lifecycle transition rules;
- mission-critical navigation mounts, including Black Flag escape routes;
- local persistence round-trip capability;
- availability of the Ship's Log / audit trail;
- the production-security boundary.

A failed structural/security check marks the trial NOT READY. The lack of server-backed production identity is shown as a caution rather than hidden or misrepresented.

## Important limit
Passing Sea Trials does not certify this GitHub Pages/browser-local prototype for unrelated production tenants. Production use still requires server-side identity, authorization, sessions, secret storage, tenant-enforced data access, revocation, and durable server audit storage.

## Regression doctrine
Future releases should preserve these voyages:
1. Captain: Captain's Quarters → Engine → Project Control → Engine.
2. Commissioning: new project → configuration → owner handoff → private test.
3. Owner: invitation → claim → project-scoped operation.
4. Customer: deployment → order → correct Project Control/customer history.
5. Order: new → active work → completion → ledger/history.
6. Rename: display name changes everywhere while Project ID remains immutable.
7. Isolation: Project A cannot read/write Project B through stale or manipulated context.
8. Recovery: reload/update/restore does not silently orphan a project.

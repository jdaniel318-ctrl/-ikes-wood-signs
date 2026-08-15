# Deployment Creation Reliability Audit

Release: v3.8.18

## Defect observed
On iPad, the native browser `prompt()` accepted an outpost name but the Deployment Shipwright did not visibly add the outpost. The old async handler had no user-visible persistence failure path.

## Repair
- Removed native prompt-driven outpost creation.
- Added an in-app project-scoped creation panel.
- Validates the deployment boundary before mutation.
- Persists through the canonical `saveCompanies()` path.
- Verifies the deployment exists in the active project after persistence.
- Rolls back the in-memory mutation if the write cannot be confirmed.
- Surfaces a readable error instead of failing silently.

## Invariants
- Project ID remains immutable.
- New deployment is sealed to the active project's ID and namespace.
- Cross-project access remains deny-by-default.
- No deployment is retained after a failed write.

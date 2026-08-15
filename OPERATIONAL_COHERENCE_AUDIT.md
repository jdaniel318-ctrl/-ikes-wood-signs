# v3.8.7 Operational Coherence Audit

## Mission
Bring the existing Dark Sky ship into one operating language before 3.9 Operating Models.

## Completed
- Added a compact Engine Fleet Health view for project count, open workload, active deployments, pending owner invitations, and project-level warnings.
- Expanded rule-based Project Control attention checks for unconfigured workflow, unpublished offers, live/test projects without deployments, live projects without an active deployment, and payments enabled without a provider.
- Standardized major Project Control modules with a consistent command-deck introduction: purpose first, controls second.
- Preserved immutable Project ID identity, project isolation, deployment boundaries, mission-critical Black Flag navigation, and the iPad command navigation refit.
- Kept analytics honest: no visitor/conversion claims without telemetry.

## Deliberately not claimed
- Server-backed multi-tenant authorization is not installed.
- Real deployment heartbeat/traffic telemetry is not installed.
- Payment providers are configuration scaffolding only.
- Fleet Health is rule-based operational visibility, not predictive AI.

## Acceptance checks
- Every Project Control route remains reachable.
- Fleet Health opens the correct project control center.
- Renames continue to propagate while Project IDs remain stable.
- Existing project-scoped data remains isolated.
- No release adds cross-project aggregation to owner/customer surfaces.

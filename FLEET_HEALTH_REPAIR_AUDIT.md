# v3.8.8 Fleet Health Repair Audit

## Defect
v3.8.7 shipped the Fleet Health renderer and styles but omitted the live `engineFleetHealth` mount from the Engine document. The result was a visible empty command bay instead of the intended fleet summary.

## Repair
- Added the Fleet Health mount to the Engine directly after Structural Status and before Waters Ahead.
- Added a static checking state so the panel can never appear as an unexplained empty shell while live data is loading.
- Made Fleet Health tolerant of a single project snapshot failure; one damaged project now becomes an attention flag instead of blanking the entire fleet summary.
- Added a visible interrupted-state fallback if the fleet-wide render itself fails.
- Kept all existing project, identity, authorization, navigation, and deployment behavior unchanged.

## Engine hierarchy
Telemetry -> Structural Status -> Fleet Health -> Waters Ahead -> Project Command.

## Acceptance checks
- `engineFleetHealth` exists exactly once in `index.html`.
- Fleet Health renderer targets that mount.
- Fleet Health remains visible during load and render failure.
- Existing Project Control and Black Flag navigation hooks remain unchanged.

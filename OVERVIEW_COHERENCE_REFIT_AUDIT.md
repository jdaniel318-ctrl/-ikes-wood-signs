# v3.8.9 — Overview Coherence Refit Audit

## Purpose
Tighten the Project Control overview after the command-navigation refit so the overview no longer contains a second, duplicate navigation system.

## Changes
- Removed the large duplicate Command Menu from the bottom of Project Control Overview.
- Added a compact Quick Actions strip limited to six high-value destinations: Orders, Customers, Deployments, Edit Business, Owner Access, and Payments.
- Compressed Recent Changes and Operating Identity panels.
- Recent Changes now filters routine `Project opened` events and surfaces the latest five meaningful project changes.
- Operating Identity now shows the essential identity/state fields only; full editing remains one command away.
- Preserved the dark command-deck visual language and iPad touch targets.

## Boundaries Preserved
- Immutable Project ID behavior unchanged.
- Project isolation and mutation authorization unchanged.
- Mission-critical Black Flag navigation unchanged.
- Primary and secondary command navigation routes unchanged.
- Fleet Health and Waters Ahead behavior unchanged.

## Acceptance Checks
- Overview contains no rendered `pc-command-menu` navigation slab.
- Six Quick Action destinations map to existing Project Control routes.
- Routine `Project opened` events are filtered from overview activity.
- JavaScript syntax passes.
- No duplicate DOM IDs introduced.
- Local asset references remain valid.
- Cache/version references are aligned to 3.8.9.

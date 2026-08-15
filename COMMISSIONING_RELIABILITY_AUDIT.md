# Commissioning Reliability Audit — v3.8.15

## Mission
Restore trustworthy ship commissioning on iPad and remove ambiguous visual state.

## Repairs
- Commissioning actions are rebound from `openProjectCommissioning()` and after every render.
- A single `handleCommissionAction()` owns Continue, Back, Save Draft, and Reset Draft.
- Validation now identifies/focuses the blocking field and displays an assertive visible error.
- Command exceptions are caught, surfaced, and audited rather than failing silently.
- The commissioning workspace uses an opaque Dark Sky background; Engine telemetry no longer shows through.
- Reset Draft is visually separated from normal voyage actions.

## Acceptance checks
1. Open Add Project.
2. Enter a valid business name and optional valid owner email.
3. Continue must advance from Identity to Model.
4. Invalid email must not advance and must visibly identify Owner Email.
5. Save Draft must update draft status.
6. Back must return to a reached step.
7. Reset Draft must require confirmation and return to Step 1.
8. No Engine controls or telemetry should be visible through the commissioning workspace.

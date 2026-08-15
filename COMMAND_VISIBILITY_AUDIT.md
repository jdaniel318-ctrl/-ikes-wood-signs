# Command & Visibility Audit

**Release:** v3.8.0 — Command & Visibility

## Objective
Make Project Control explain one business before requiring the operator to hunt through settings.

## Verified inputs used by Overview
- Approved project-scoped orders from the existing order stores.
- Project-scoped customer directory.
- Project-owned deployment manifests.
- Project ledger entries.
- Project activity log.
- Project governance, lifecycle, publishing, and owner-access state.

## Attention rules currently implemented
- New approved order waiting at least 48 hours.
- Deployment currently in Sea Trial.
- Deployed outpost with incomplete Dark Sky readiness.
- Paused deployment.
- Enabled owner access that has not been claimed.
- Project with no products/services configured.

These are rule-based operating prompts, not AI predictions.

## Analytics currently implemented
- Orders and recorded order revenue for the most recent 30 days.
- Comparison with the preceding 30-day window.
- Six calendar months of order count and recorded order value.
- Current order-status mix.
- Known customers and repeat customers.
- Average recorded order value for the recent 30-day period.

## Deliberately not claimed
The following are displayed as not instrumented until real deployment telemetry exists:
- Visitors.
- Conversion rate.
- Time on page.
- Campaign attribution.

## Regression boundary
No Project Control write authorization was weakened for this release. Existing v3.7.7 Engine/project mutation checks, owner checks, deployment-boundary checks, lifecycle rules, and fail-closed integrity behavior remain in place.

## Next heading
The next architectural release is v3.9 Operating Models: reusable capabilities first, templates second.

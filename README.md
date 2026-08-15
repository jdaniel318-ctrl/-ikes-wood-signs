# Dark Sky / Black Flag Engine

**Current release:** v3.8.6 — Secondary Command Bay Refit

This release turns Project Control from a settings-heavy workspace into a business command cockpit. The opening screen now explains what is happening in one project, what needs attention, what changed, and where the operator should go next.

## What changed
- Reorganized Project Control navigation into Command, Operate, Insight, Experience, Access, and System groups.
- Rebuilt Overview around project-scoped operating signals instead of configuration cards.
- Added 30-day revenue and order indicators with prior-30-day comparison.
- Added open workload, customer depth, deployment state, and completed-ledger indicators.
- Added rule-based Needs Attention signals without inventing data.
- Added latest-order pulse, recent project activity, project operating identity, and direct command shortcuts.
- Added a dedicated Analytics view using verified order, customer, ledger, and deployment data.
- Added six-month order-volume history, workflow/status mix, repeat-customer signal, and average recorded order value.
- Explicitly labels visitor, conversion, time-on-page, and campaign attribution as not instrumented rather than fabricating telemetry.
- Preserves all existing deep Project Control modules and Hull Integrity authorization boundaries.
- Cache/version references advanced to v3.8.6 for iPad/Safari deployment.

## Operating principle
Project Control should answer three questions before the operator clicks deeper:
1. What is happening?
2. What needs attention?
3. Where do I go next?

## Important boundary
Dark Sky remains a browser-local prototype. v3.8.3 adds immutable project identity and safe display-name changes but does not change the browser-local production-security boundary: public multi-tenant use still requires server-side identity, authorization, sessions, rate limits, secret storage, and server-enforced tenant isolation.

## Deployment
Upload the contents of this folder together, preserving `assets/`. GitHub Pages may need one refresh while the v3.8.6 service worker replaces the previous cache.

## Next heading
**v3.9 — Operating Models.** Extract reusable capabilities from the current vessels, then rebuild templates as tested combinations of those capabilities instead of one-off business code.


## v3.8.3 identity doctrine

- Every project is anchored to an immutable Dark Sky Project ID.
- Existing project IDs are preserved during migration to protect historical data and references.
- Newly commissioned projects receive opaque IDs that are not derived from business names.
- Business/display names can be changed without changing Project ID, namespace, orders, customers, deployments, assets, or history.
- Name changes are audited and previous names are retained in project identity history.
- The short Project Code remains a human-facing reference, not the tenant security boundary.

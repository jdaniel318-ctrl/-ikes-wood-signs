# Dark Sky 8.8.15.5 — Admiral Lens

Admiral Lens is a Fleet Spine command-surface hardening release. The server-side release preview already proved correct in Fleet Core; this pass makes that truth impossible to miss on the future Admiral’s iPad. Governance remains preview-before-issue, exact-vessel, reasoned and auditable.

## What changes
- **Command-grade readability** — larger type, stronger selected states, larger controls, wider spacing and a clearer Control Plane hierarchy.
- **Durable preview proof** — PREVIEW COURSE renders a persistent, server-returned BEFORE → AFTER course card and scrolls it into view.
- **Issue remains locked** — ISSUE RELEASE COURSE cannot unlock until the current visible preview is fresh. Editing ring, rollout state, release identity or Admiral intent invalidates the fingerprint and locks issue again.
- **Durable errors and confirmations** — preview/issue status remains visible instead of disappearing as a transient toast.
- **Human Activity Spine** — ordinary Admiral view shows event title, time, authority and a plain-language summary. Correlation IDs and bounded JSON stay behind Technical Details.
- **No data-model churn** — the Fleet Spine database contracts from 8.8.15.3 remain intact; this release changes presentation and command proof, not Fleet Core schema.

## Fleet doctrine
**Owner operates the vessel business. Engine operates the platform. Captain commands fleet operations. Admiral governs the fleet.**

The Control Plane coordinates identity, authority, releases, deployments, capabilities and health. Private vessel business data remains vessel-scoped. A vessel-specific fix does not graduate to Fleet Core until the underlying lesson can be named generically and certified.

## Required proving voyage
Authenticate Admiral → open Fleet Spine → select one vessel → enter proposed course + intent → PREVIEW COURSE → visibly inspect PREVIEW READY before/after proof → change one field and verify the preview becomes stale and ISSUE relocks. Only after that proof should a real issue command be considered.

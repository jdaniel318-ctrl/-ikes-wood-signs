# Dark Sky 7.6.0 — True Bearing — Session Boundary Contract

Deployment state and customer-session state are separate facts.

## Entry contracts
- Published project + **OPEN PROJECT** => `LIVE CUSTOMER` / deployed session.
- **Test Experience / Sea Trial** => simulated test session; external contact remains blocked.
- **Client Preview / Private Preview** => simulated preview session; external contact remains blocked.
- Project Control Center => `ADMIN CONTROL`; it never masquerades as a customer session.

A live project may be tested safely without changing its deployment state. A stale test context may never leak into the published Open Project route.

## UI clarity
Project Control surfaces separate Deployment, Readiness, Approval, and Current Session instead of overloading one status word.

## Proving Ground
The Session Boundary Voyage is HOLD-worthy. It verifies the live route establishes a deployed session explicitly while test/preview contexts stay non-live.

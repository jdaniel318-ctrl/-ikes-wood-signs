# Dark Sky — Stage 2 Isolation Audit

**Release reviewed:** v3.7.6 — Commissioning & Invitation Refit

## Scope reviewed
This Stage 2 pass follows the project-registry foundation and focuses on the boundary from Engine commissioning to owner handoff.

## Confirmed protections
- New projects receive immutable project IDs and canonical namespaces independent of display name.
- Commissioning begins private and unpublished.
- Owner invitations are bound to project ID, namespace, and intended owner email.
- Invitation tokens are stored only as hashes and expire automatically.
- Owner passwords are stored locally as salted one-way hashes in the prototype; legacy plaintext test credentials migrate only after a successful login.
- Recovery snapshots omit owner secret material and invitation token hashes.
- Owner capabilities remain project-scoped and do not grant Engine or Captain authority.
- Orders without explicit project identity are blocked from customer capture and ledger posting.
- Customer directories and ledgers are partitioned by project ID.
- Project drafts use project-scoped keys.
- Project graphic assets and metadata are partitioned by project ID.
- Changing the email identity of an active owner now revokes the existing local owner credential before the new identity can be invited.

## Stage 2 guardrails added
- Commissioning steps cannot be skipped forward before prior steps have been reached.
- Final commissioning performs a complete identity/owner-handoff validation instead of trusting navigation state.
- Owner invitation generation is blocked when Owner Portal access is disabled.
- Owner claims are rejected when Owner Portal is disabled, when project/namespace binding does not match, or when the intended email has changed.
- Review now shows a commissioning readiness panel and makes clear that deployments are separate from project creation.

## Known prototype boundary
The current project-owner identity system is browser-local. It demonstrates project-scoped invitation, credential, and session behavior, but it is not a production multi-device identity service. Before public multi-tenant deployment, owner authentication, invitation issuance, credential reset, session revocation, rate limiting, and secret storage must move server-side.

## Next isolation work
1. Audit all Engine settings for accidental global-vs-project ownership.
2. Audit deployment manifests and customer-session entry points for explicit project/deployment claims.
3. Add authorization checks around every Project Control mutation, not only visibility/navigation checks.
4. Add structured audit events for owner capability changes, project lifecycle changes, and deployment state transitions.
5. Define server-side tenant enforcement requirements before any production identity/payment integration.

## Release posture
This document records the Stage 2 boundary as of v3.7.6. The follow-on v3.7.7 hull pass is documented separately in `HULL_INTEGRITY_AUDIT.md`.

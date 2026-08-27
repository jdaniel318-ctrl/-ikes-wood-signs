
## 8.2.3 Gridwright
- Known stale-worker handoffs self-recover only after the incoming runtime snapshot and release identity fully verify.
- Automatic cleanup is constrained to Dark Sky service-worker registrations and application caches; project/customer/order/owner/configuration data is never touched.
- WATCH is now explicitly non-blocking when protected release contracts are clear.
- Deterministic WATCH work is owned by the shipyard; the Admiral is escalated only for judgment, ambiguity, irreversible action, or deliberate Known Good promotion.
- Proving Ground reports all voyages assessed, separates CLEAR/WATCH/HOLD, and keeps WATCH evidence visible after promotion.
# Fleet Proving Ground — 6.9.1

## Purpose
Make fleet hardening rigorous underneath and simple at the helm. The Captain should see fleet status, the highest-priority issue, the next best move, and the Last Known Good release before engineering evidence.

## Required voyages
1. Authority Voyage — Black Flag, Project Admin, Captain authority contracts.
2. Isolation Voyage — canonical Project IDs and project-scoped operational records.
3. Client Preview Voyage — unique invite credential and pre-paint isolation.
4. Staging Safety Voyage — external-contact containment outside Live.
5. Release Integrity Voyage — runtime/manifest/release identity and canonical runtime tree.
6. Command Navigation Voyage — Captain main-room and subview return boundaries.

## Severity
- HOLD: critical contract failure; release is not promotable.
- WATCH: operational evidence needs Captain attention.
- CLEAR: required evidence is currently satisfied.

## Promotion
Development → Candidate → Proving Ground → Cleared → Known Good.
Marking a candidate Known Good records local promotion evidence only. It does not publish or deploy a project.

## Design rule
Status → Problem → Next Move. Engineering evidence is available, never forced into the Captain's primary view.

## 7.2.1 approved artifact integrity
- **Approved Artifact Voyage** verifies that the customer-approved visual is locked before contact/review and stored as the production artifact rather than silently re-rendered later.
- Editing the design invalidates the lock and requires fresh customer approval.

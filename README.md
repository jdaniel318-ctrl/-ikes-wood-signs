# Workshop Engine v2.9.66 — Powder Keg Governance Console

## Captain business relationship authority
The Powder Keg now distinguishes a business relationship decision from data destruction.

Captain may:
- Approve / Restore
- Suspend
- End Relationship / Refuse Service

Suspend or End Relationship:
- requires a Captain reason;
- requires explicit confirmation;
- removes public operation;
- returns active/Sea Trial deployments to harbor;
- preserves project, orders, ledger, customers, marketing and audit records.

Permanent Project Purge remains a completely separate destructive authority and is still review-only.

## Powder Keg organization
Powder Keg is now divided into:
1. Platform Authority
2. Recovery Authority
3. Destructive Authority

Only Business Relationship Authority is operational in this release.
Recovery/destructive actions remain review-only until tested recovery paths exist.

## Business Relationship Console
- Scales to all projects/businesses in the Captain snapshot.
- Shows business, project state, owner state, publication, deployment count and platform relationship status.
- Shows counts for Approved / Suspended / Ended relationships.
- Captain decision history is stored per project and displayed during review.
- Legacy `refused` status is migrated to `relationship_ended` for clearer semantics.

## Owner Access repair
During this build, a structural issue from v2.9.65 was found: parts of the Owner Access UI referenced governance helper functions that had not been persisted into app.js. v2.9.66 restores the missing project-governance foundation and Owner Access renderer before extending Powder Keg.

## Safety
- Business relationship authority never writes another project's ledger or marketing.
- No project/customer record is deleted by Suspend or End Relationship.
- Permanent purge remains disconnected.
- Project isolation remains unchanged.

## Assets
No assets added, removed, renamed or replaced.

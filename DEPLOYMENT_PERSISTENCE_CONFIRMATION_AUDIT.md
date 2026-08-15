# Deployment Persistence Confirmation Audit — v3.8.20

## Defect observed
Creating an outpost reached the guarded save path but returned `deployment_write_not_confirmed`.

## Root cause addressed
The post-save confirmation trusted a live Project Control object reference. A Project Control rerender can make that reference non-authoritative even when the canonical fleet registry is the source that should be checked.

## Repair
1. Resolve the canonical project from the fleet registry at commit time.
2. Attach the new deployment to that canonical project's deployment collection.
3. Verify in-memory attachment before saving.
4. Persist the fleet.
5. Read the `companies` registry back from IndexedDB and verify the deployment by immutable project ID + deployment ID.
6. Revalidate the persisted deployment boundary before reporting success.
7. Roll back the live canonical record if any stage fails.

This turns deployment creation confirmation into a real persistence check rather than a stale-reference check.

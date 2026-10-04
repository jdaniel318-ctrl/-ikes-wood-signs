## 8.8.20.14 — HashLock
- Fixed finalization order so DEPLOYMENT_MANIFEST runtime hashes are generated from the exact bytes shipped.
- Added fleet regression gates for final-byte integrity and fail-closed mismatch handling.
- Preserved TruthBridge exact-voyage Fleet Core recovery and project-data safety.

# 8.8.20.14 — HashLock

- Fixes VoyageKeeper authoritative read-back: explicit Admiral restore now always hydrates the Fleet Core payload after exact-voyage identity verification.
- A newer browser timestamp can no longer suppress server restoration; it is retained only as conflict evidence.
- Exact draft-key mismatch fails closed instead of merging different voyages.
- Inspect Recovery no longer claims Fleet Core preservation before an authoritative read-back.
- SERVER VERIFIED now requires the actual server payload to be installed in the commissioning workspace.
- Read-back failure remains locked and does not overwrite browser recovery evidence.
- Adds fleet regression gates for truth labeling, exact-voyage reconciliation, and fail-closed recovery.

# 8.8.20.14 — VoyageKeeper

- Preserves focused same-tab voyage authorization from PassageLine.
- After refresh, Engine PIN remains required.
- After successful Engine authentication, Black Flag queries Fleet Core for the authenticated officer's active commissioning voyage.
- If found, the exact server voyage, safe stage, Project ID context and draft are restored automatically.
- Recovery is visibly identified inside commissioning; no duplicate voyage is created.
- If no server voyage exists, normal Engine Room behavior is unchanged.
- SERVER SAFE still requires server save plus same-voyage readback.


## 8.8.20.14 VoyageKeeper
- Recovery pointer survives Engine lock without claiming server truth.
- Engine re-entry restores an unfinished voyage into a Secure Voyage checkpoint instead of a blank commissioning form.
- Admiral recovery re-reads Fleet Core before any server-safe claim and never overwrites an authoritative voyage from a hint-only draft.
- Step 2 cannot advance without a Forge Plan.
- Commissioning stage transitions checkpoint the latest stage and mark server state syncing until read-back completes.
- Recovery and authorization use command-surface styling; red is reserved for actual failure.

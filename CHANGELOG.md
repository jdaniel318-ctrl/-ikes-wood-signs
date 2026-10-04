# 8.8.20.20 — AnchorWatch

- Fixes the proven Stage 4 indefinite `SERVER SYNCING` defect.
- Forward commissioning transitions now queue the Fleet Core voyage checkpoint.
- Background checkpoint completion repaints the UI with confirmed `SERVER SAFE` or explicit sync failure.
- Preserves HoldFast recovery reconciliation and KeelLock final-byte integrity discipline.

# 8.8.20.20 — HoldFast

- Restores Forge Plan from Fleet Core `forge_truth` when an older voyage draft lacks embedded Forge state.
- Rehydrates Offer dependencies from that recovered plan.
- Fail-safe recovery now returns to Stage 2 instead of presenting a broken Stage 3 when no Forge Plan exists.
- Corrects the visible release label to HoldFast.
- Preserves KeelLock's freeze-bytes-before-hash release-integrity discipline.

# 8.8.20.20 — KeelLock

- Anchors release work to live Fleet Core truth before build changes.
- Adds Authority Hull contract and release-blocking scope checks.
- Preserves DeadReckoning/VoyageKeeper recovery as inherited known-good behavior.
- Adds three idempotent foreign-key supporting indexes as an explicit migration.
- Makes no destructive cleanup, RLS widening, or browser-only authority change.

# 8.8.20.20 — KeelLock

- Bind the recovery checkpoint `VERIFY ADMIRAL & RESUME` control to the same scoped Admiral authorization path used by server-save authorization.
- Preserve fail-closed recovery: normal Continue stays disabled until Admiral verification and Fleet Core exact-voyage read-back succeed.
- Add this field failure to release evidence: a rendered recovery button must execute the authority handoff; rendering alone is not a pass.
- Preserve ClearBearing recovery detection, project isolation, durable voyage pointers, and server-truth boundaries.

# 8.8.20.20 — KeelLock

- Refit commissioning recovery as an inline command surface; no browser alert for Recovery Details.
- Hold forward commissioning navigation until Admiral/Fleet Core recovery verification completes.
- Clarify recovery truth: browser checkpoint, server recheck, server verified, and optional command receipt are distinct states.
- Preserve HashLock atomic loader and final-byte integrity discipline.

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


## 8.8.20.20 KeelLock — release integrity repair
BlackWake field proof isolated a packaging-order defect: final runtime bytes and DEPLOYMENT_MANIFEST runtime hashes diverged. KeelLock regenerates integrity hashes from the final immutable bytes and validates the package before ZIP handoff. Runtime integrity remains fail-closed; no checksum bypass was added. Field deployment proof remains required.

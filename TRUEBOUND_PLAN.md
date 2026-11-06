# Truebound 8.8.20.91 implementation plan

Goal: repair only missing project boundary records after an explicit Engine review and confirmation.
Architecture: a focused browser module owns strict reads, an ephemeral one-use plan, missing-only writes and readback. Existing inspection stays read-only. The app supplies Engine/navigation guards and renders a fresh integrity result.
Tech stack: existing buildless JavaScript, native IndexedDB and LocalStorage; no new runtime dependencies.
Spec: this document records the targeted repair approved in the conversation. The device diagnostic identified HouseHull and VoyageKeeper Recovery Test, with registry/session passing and local/database envelopes missing. It does not prove the historical cause.

## Global constraints
- No boot repair, admission creation, commissioning, registry normalization or identity reassignment.
- Preserve all existing envelope entries; present-but-invalid entries block repair.
- Require matching valid admission evidence in both durable ledgers, membership in both fleet manifests, unique canonical/session identities, no retirement tombstone and no admission-review flag.
- Corrupt or unreadable sources block. Prepare is read-only. Confirmation revalidates all planned inputs.
- Apply is one-use and session/navigation scoped. Database transaction commits before local writes; interruption leaves a truthful partial result, never deletes committed copies. A fresh review can finish a missing side.
- Metadata-only receipt commits with database additions. Both actual stores must read back before reporting repaired; a fresh whole-fleet integrity inspection has a separate outcome.
- No orders, customer records, authority, quarantine or archives are rewritten. No private record contents in repair diagnostics.
- Package software against exact sealed .90; manual deployment; native Safari acceptance remains pending.

## Review focus
1. A transaction abort after request success must not cause a LocalStorage write.
2. Present null/malformed entries and inherited/prototype keys must not be mistaken for missing entries.
3. Concurrent authority, registry, envelope or navigation changes must stop the next phase without overwriting unrelated records.
4. A tab interruption after database commit must be recoverable by a fresh missing-only review; no false all-clear.
5. The delegated UI must consume the exact reviewed plan, reject repeat clicks, clear on lock and separate repaired boundaries from other integrity failures.

## Tasks
- [x] 1. Add failing behavioral tests with transactional storage fault harness; implement `BlackFlagBoundaryRepair.create(options).review(ids)` and `.apply(plan)` in `fleet_boundary_repair.js`. Run targeted tests through corruption, quota, abort, cancellation, stale plan, retry and readback failures.
- [x] 2. Add failing real-handler UI tests, then integrate review/apply/status under Structural Certification, with existing navigation guard and fresh read-only inspection. Register exact module bytes in loader/manifest. Run targeted and complete offline suites.
- [x] 3. Exercise native IndexedDB and actual handlers in a controlled managed browser fixture. Obtain one independent code review and fix significant findings with regression tests. Update identity, guide and evidence.
- Packaging status is determined by the generated PackageProof.json: the packager reruns all 37 suites, reconstructs the patch, reads back all ZIPs and compares original files after rollback before issuing deliverables. No deployment is part of this task.

## Execution ledger
- Baseline: extracted sealed .90 FullBackup with SHA-256 8a90c3ef58185295e9e023e7586c0c70c907a8550d82f59cd4b622aac93d6d13 into isolated Truebound directory. No git repository; archive/checksum history is the release record.
- Pre-flight interfaces: core review/apply returns labels, IDs, add-targets and verification status; app owns navigation guards and whole-fleet inspection. Raw evidence remains in closure only.
- Design choice: database-first additive repair instead of cross-store rollback. LocalStorage and IndexedDB have no shared atomic transaction; retaining verified additions makes an interrupted repair resumable without deleting other work. A partial result is never a pass.

- Focused tests: implementation absent failed before core work; UI handlers absent failed before integration. Core 22 and UI 8 now pass.
- Independent review found two Important issues: JSON cloning could lose existing undefined fields, and strict-true projection could hide a truthy admission-review flag. Four added regression groups failed before fixes and passed afterward. Strict JSON-safe source validation now precedes any copy; review flags retain original presence/value and any present non-false flag blocks.
- Native Chromium fixture: 5/5 cases passed using native IndexedDB, current repair module, production inspection/renderers/handlers. Confirmed UI repair, independent saved readback, reload persistence, lock clearing, phone/tablet layout. Synthetic data only; Safari acceptance remains pending.
- Browser fixture is reproducible with BUILD_TRUEBOUND_BROWSER_QA.py. Native no-op at module load; explicit UI drives all repair calls.
- Final offline run before sealing: 37/37 suites passed, including 22 focused core cases and 8 actual-handler UI cases. Native fixture generator reproduced the exercised handler/fixture bytes.

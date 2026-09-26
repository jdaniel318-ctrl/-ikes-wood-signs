# HarborMaster 8.8.17.17 — acceptance boundaries

## Native iPad / Fleet Core field checks (pending)

- [ ] Engine identifies 8.8.17.17 / HarborMaster after a completed deployment; no checksum bypass.
- [ ] WatchKeeper start/resume/lock/end session behavior remains intact.
- [ ] Admiral Delegate lane clearly states exact-vessel Captain scope and confirms the installed HarborMaster server contract without changing a vessel.
- [ ] Admiral appointment preview changes nothing and issue creates only a pending appointment with no membership/ownership/live grant.
- [ ] Candidate signs in with a separate account, sees only their matching appointment, and acceptance creates an active exact-vessel `operator` membership.
- [ ] Candidate cannot access another vessel, owner-only settings, Fleet-wide Captain controls, or Admiral controls.
- [ ] Vessel Captain station can read the intended server-backed order queue, change one order status with readback, and publish one Watch update.
- [ ] Admiral sees the new Captain-operated state and Watch update without acquiring silent write control.
- [ ] Revoking the appointment removes HarborMaster-created operator access and preserves ownership/history. A preexisting membership is not silently removed.
- [ ] Departure preview blocks when operating authority or the working-ship proof reference is missing; DEPART HARBOR requires preview, active Admiral authority and exact target, and changes only Fleet lifecycle to `active`.
- [ ] Customer publication remains unchanged by the departure command.
- [ ] Working-ship handoff remains NOT VERIFIED until the complete customer/operator round trip, separate-device persistence, denial tests and isolated restore are completed.

## Server migration status

The website ZIP does not execute SQL. The HarborMaster additive Captain appointment/operating/departure functions were applied to the connected Black Flag Fleet Core during this build, with zero Captain appointment rows immediately afterward and no vessel lifecycle departure issued. Native authenticated appointment/acceptance/revocation and departure tests are still pending. `SUPABASE_LEDGER_INTEGRITY_88171.sql` remains a warned historical reference and must not be run as-is.

---

## Prior WatchKeeper acceptance record — retained

# WatchKeeper 8.8.17.16 — acceptance boundaries

## Native iPad field checks (pending)

- [ ] Engine identifies 8.8.17.16 / WatchKeeper after a completed deployment; no checksum bypass.
- [ ] New document requires passage PIN followed by the dedicated account sign-in.
- [ ] Recent same-document return says Resume Admiral session, account recheck pending, and does not promise another password.
- [ ] Re-entering with the PIN rechecks account authority; successful reuse leaves a readable receipt.
- [ ] Lock conceals the workspace and retains only eligible reuse. End immediately prevents reuse and gives truthful server sign-out feedback.
- [ ] Short switch to ChatGPT and back fits within the remaining window without needless account entry.
- [ ] At 15 minutes idle / 60 minutes maximum, the workspace is concealed and fresh sign-in is required. Background traffic does not keep it alive.
- [ ] Both forms, session controls, keyboard targets and return controls fit and scroll on the actual iPad.
- [ ] Findings/exports preserve the selected run and former warning identities. A fifth backend-session-enforcement warning is honest, not suppressed.
- [ ] Existing ledger remains $2.00, two payments, five history records; no test transaction is added by authentication.

## Isolated regression obligations

Full source module closure, valid/invalid/revoked/changed account, cancelled/late/duplicate logins, offline/timeouts, both storage-failure channels, refresh coalescing, nonrenewing clocks, backwards clock change, owner transport parity, fresh-document isolation, responsive layouts, atomic loader, source-model semantics, historical identity preservation and exact final ZIP verification.

## Not claimed by this release

Server-enforced timeout/absolute session policy; immediate token revocation; native Safari behavior before field acceptance; cloud ledger backup/restore; production Captain handoff; automatic Admiral promotion. Existing dangerous historical SQL remains a warned reference, not a migration instruction. No feature/data removal is authorized by a passing readiness model.

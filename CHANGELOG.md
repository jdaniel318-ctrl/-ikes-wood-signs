# Dark Sky 8.6.46 — Fleet Ownership Charter

- Separates vessel entry path, ownership, operating authority, and commissioning authority fleet-wide.
- Supports controlled self-join, Captain commission, Admiral commission, Admiral-owned vessels, Fleet operation, and later ownership transfer.
- Ownership transfer is invite/accept/audit based and preserves immutable vessel identity/history.
- Adds Fleet Ownership Charter Voyage while Production Identity remains WATCH until live authenticated negative tests clear.
- Supabase staging schema now includes ownership model, operating model, self-join requests, and ownership transfer ledger.
- 8.6.42 remains the protected Known Good recovery anchor during this staging push.

# 8.6.46 — Fleet Ownership Charter

- Repairs stale `app.js` / inline runtime build markers that were still declaring 8.6.42.
- Makes page, runtime, deployment manifest, inventory, release seal, web manifest, service worker, identity adapter, and current-build proof models agree on `8.6.46` / `fleet-ownership-charter-8646-6a42d8`.
- Leaves Black Flag Fleet Core Supabase staging schema and adapter behavior unchanged.
- Keeps 8.6.42 as Last Known Good until promotion.

## 8.6.44 — Live Identity Staging

Black Flag Fleet Core staging is now connected through a Supabase publishable browser key. The backend has canonical vessel, membership, global authority, and durable audit tables with default-deny RLS. Outside-owner production remains blocked until authenticated cross-vessel denial, revocation, expiry, and rollback tests pass. 8.6.42 remains the protected Known Good recovery anchor during this staging push.

# 8.6.42 — Atomic Seal

- Bootstrap-only repair; Generation Settlement logic is unchanged.
- Aligns index document, deployment manifest, web app manifest, service worker, runtime build marker, and release seal to `8.6.42` / `atomic-seal-8642-3d7a91`.
- Adds a release-blocking package rule: no prior authoritative release seal may survive handoff.
- Keeps 8.6.38 as Known Good recovery anchor until this candidate earns promotion.

# 8.6.41 — Generation Settlement

- Keeps 8.6.40 Registry Commit and Identity Keel architecture intact.
- Separates operator Fleet Dock filters/search from canonical six-vessel proof truth.
- Requires a healthy bounded Dock surface plus six protected canonical Dock input IDs before attaching Dock proof to the committed memory generation.
- Requires a usable six-vessel Fleet Intelligence surface for that same generation.
- Refuses partial Dock/Intelligence observations; intermediate state remains diagnostic history only.
- Finalizer commits once only after Memory → Dock → Intelligence agree on one complete generation.

# 8.6.40 — Registry Commit

- Repairs current proof settlement after 8.6.39 Identity Keel by bringing Fleet Doctrine Registry, Golden UI voyage governance, and Engine → Captain → Admiral command model onto the current release identity.
- Adds bounded normal-Engine proof settlement so Dock and Fleet Intelligence attach to the same committed memory generation before readiness consumes current proof; Proving Ground remains read-only.
- Adds Admiral Course Authority: the Admiral may deliberately change Fleet course, version and promote successor doctrine, preserve superseded doctrine as append-only history, and roll back without rewriting prior vessel/release truth.
- Golden voyages are no longer hard-coded to exactly six forever; six or more active release blockers may exist, and future Admiral-promoted course changes may evolve the voyage set without silently weakening current blockers.
- Production Identity remains a deliberate WATCH until a real backend proves server membership, exact-vessel RLS, revocation, expiry, negative cross-vessel tests, and rollback.
- 8.6.38 remains the protected Known Good anchor during this candidate push.

# Dark Sky 8.6.40 — Registry Commit

- Added Supabase-ready production identity adapter; browser accepts only publishable/legacy anon keys and explicitly rejects elevated secret/service-role credentials.
- Added server membership and exact-vessel RLS contracts without claiming a live backend.
- Added Production Identity Voyage; backend/revocation remain truthful WATCH items until live Supabase tests clear.
- Added Admiral, Captain, and Engine Admin commissioning authority with durable provenance; Project Owner cannot create fleet authority.
- New vessels may start Fleet Unassigned and the commissioner never becomes owner automatically.
- Preserved 8.6.38 as Known Good rollback anchor and kept the private owner path as test/recovery-only during migration.

# Dark Sky 8.6.38 — Detail Relay

- Restores the Fleet Maintenance **View Storage Details** parent action with a direct, iPad-safe binding.
- Paints an immediate CHECKING state and a durable COMPLETE/WATCH readback on the parent storage sounding panel.
- Preserves 8.6.37 Owner Authority, project scoping, session expiry, logout/recovery, and all 8.6.36 Witness Truth protections unchanged.
- Browser-managed/unattributed storage remains read-only evidence and is never classified as Dark Sky-owned cleanup.

# 8.6.38 — Owner Authority
- Branched from certified 8.6.36 Witness Truth.
- Added exact-vessel owner scope, namespace scope, expiring project_owner sessions, login/logout witness evidence, and deterministic logout.
- Separated Ike private owner-test credential from Project Admin 4353; old local joe/4353 test credential migrates to joe/8642.
- Added Owner Authority Voyage to Proving Ground.
- Production Owner Identity remains an explicit operational ATTENTION until server-backed identity exists; no static-site security claim is made.

# 8.6.36 — Seal Truth
## 8.6.36 — Witness Truth
- Preserves 8.6.35 Storage Truth and 6/6 Fleet Registry proof.
- Authenticated Engine relay now proves post-login settlement even when optional Diagnostic Hold is not enabled.
- localStorage quota exhaustion degrades only the legacy channel when window memory + sessionStorage are healthy.
- Legacy lifecycle hooks are non-authoritative when the modern ignition/memory/bootstrap chain is verified.
- Command Navigation Voyage no longer inherits unrelated capability-staging WATCH state.
- Experimental Ike length calibration remains WATCH by design.

- Repairs the atomic release identity contract that blocked 8.6.34 before Engine paint.
- RELEASE_INVENTORY.json now agrees with the page, deployment manifest, release seal, web manifest, and service worker on build 8.6.36 / seal witness-truth-8636-9d6f42.
- Preserves the 8.6.34 Stage Two Storage Truth diagnostics unchanged.
- No project, order, customer, graphics, admissions, quarantine, or recovery data is altered.

# Dark Sky 8.6.34 — Storage Truth

Stage Two storage hardening from the Relay Readback baseline. Fleet Maintenance **View Storage Details** now performs a real read-only ownership scan instead of appearing inert. Storage & Telemetry exposes the largest IndexedDB order records by size so the 30-row order footprint can be diagnosed without deleting anything. **Inspect Storage** is renamed **Rescan Storage** where it reruns measurement, while the protected Storage & Recovery action is renamed **Open Storage Breakdown**.

**Check the Hull** now leaves a durable timestamped integrity result. **Export Captain's Backup** now prepares the full backup asynchronously and then presents a durable **Download Captain's Backup** link, preserving a fresh iPad/Safari user gesture instead of silently attempting a download after awaited storage reads. Fast Fleet Maintenance storage values are explicitly labeled as point-in-time Safari estimates, while deep telemetry is labeled as the latest estimate to prevent the two readings from being mistaken for one immutable measurement. Safe cleanup remains cache-only and protected project/order/customer/graphic/evidence records remain outside cleanup authority.

# Dark Sky 8.6.32 — Relay Readback

Diagnostic Hold now uses a same-tab `window.name` relay and must immediately read back the exact hold marker before reporting COMPLETE. This removes the unreliable cookie verification path while preserving the explicit post-auth handoff and manual Continue Now release.
- Adds a dedicated pre-auth Diagnostic Hold relay that is independent of the normal Engine authentication session.
- Stores enabled/pending hold intent in a same-origin session-scoped cookie with a sessionStorage mirror; no localStorage dependency is introduced.
- Adds an explicit `app.js` authentication-complete signal immediately after the Engine gate closes and again after Engine home render.
- Post-login evidence requires both a pending relay token and a verified cleared Engine auth gate.
- **Continue Now** clears the pending relay; toggling Diagnostic Hold off clears both enabled and pending relay state.
- Keeps the complete 73-file atomic runtime and all proven 8.6.28/8.6.30 maintenance rails.
- No cleanup, deletion, migration, fleet mutation, or Phase 2 authority added.

## 8.6.29 — Hold Relay

- Replaces the pre-auth visibility-triggered Diagnostic Hold with an authenticated post-login latch.
- Arms the hold while the Engine login gate is visible and verifies that authentication has cleared before rendering evidence.
- Diagnostic Hold remains on screen indefinitely until **Continue Now** is pressed; no automatic timeout is permitted while armed.
- Uses a stable session key with compatibility migration from the 8.6.28 key.
- Preserves all proven 8.6.28 Fleet Maintenance command rails and bounded storage checks.
- No cleanup, deletion, migration, fleet mutation, or Phase 2 authority added.

## 8.6.28 — Maintenance Rails

- Fixes Fleet Maintenance Engineering Evidence routing by targeting and opening `#provingEngineeringEvidence` directly.
- Recovery Snapshot now succeeds only when a new visible recovery confirmation is produced.
- Fleet Watch now succeeds only when its live summary is rendered and visible.
- Diagnostic Hold verifies the session key and runtime flag together.
- Telemetry, Proving Ground, automatic sounding, and Storage Details retain bounded terminal-state contracts.
- No cleanup, deletion, migration, or Phase 2 authority added.

## 8.6.27 — Command Watchdog
- Independent UI watchdog owns automatic storage terminal state.
- Automatic storage health must resolve to COMPLETE or WATCH within 2.5 seconds.
- Maintenance commands now verify their visible destination and leave durable COMPLETE/WATCH status.
- Storage Details has a 7-second bounded terminal state.
- Diagnostic Hold remains session-only.
- No cleanup, deletion, compaction, or migration authority added.

## 8.6.26 — Bounded Sounding
- Replaced the hanging automatic deep storage scan with a fast read-only `navigator.storage.estimate()` health signal bounded to 2.5 seconds.
- Automatic sounding now reports either COMPLETE or WATCH; `Checking storage health…` cannot persist indefinitely.
- Deep ownership enumeration only runs after `VIEW STORAGE DETAILS` and is bounded to 9 seconds with a safe WATCH fallback.
- Fleet Maintenance remains usable even if Safari does not answer a storage probe.
- No cleanup, deletion, migration, compaction, fleet mutation, or vessel behavior changes are authorized.
- Generation Relay, protected muster, proof signing, recovery, and project isolation remain frozen from the 8.6.23 Known Good anchor.

# 8.6.24 — Fleet Steward

- Added one professional Fleet Maintenance station with direct routes to Engine Telemetry, Proving Ground, Engineering Evidence, Recovery Snapshot, Fleet Watch, and Storage Inventory.
- Added a session-only Diagnostic Hold toggle; recovery/post-login evidence pauses are off by default and can be deliberately armed for capture.
- Added read-only Storage Steward inventory classifying authoritative IndexedDB, recovery/legacy LocalStorage, temporary caches, and browser-managed/unattributed usage.
- Fleet Steward does not delete, migrate, compact, or rewrite storage. 8.6.23 remains the protected Known Good anchor until this candidate is proven.

# Dark Sky 8.6.23 — Generation Relay

- Stabilizes Memory Muster generation across identical six-vessel refreshes.
- Adds serialized CORE proof relay for genuine generation advances.
- Keeps finalizer strict: Core = Memory = Dock = Intelligence.
- Demotes full localStorage and obsolete app lifecycle hooks from false release HOLDs when authoritative paths are healthy.
- Preserves Storage-Safe Proof Bus, Legacy rescue, Memory Muster, Dock, Intelligence, staging, and project data boundaries.

# Dark Sky 8.6.22 — Storage Safe Harbor

- Removed localStorage from live proof writes after real iPad evidence proved Safari QuotaExceededError.
- Moved Proving Ground current evidence to window/session authority with IndexedDB durability.
- Moved Fleet Learning / Staging Ledger live state to window/session authority with IndexedDB durability and refresh hydration.
- Moved Known Good and Fleet Commissioning mirrors onto session + IndexedDB-safe paths.
- Safe recovery evidence now prefers sessionStorage so quota pressure cannot erase the diagnostic handoff.
- localStorage remains read-only legacy fallback / best-effort compatibility only for these fleet-command channels.

## 8.6.22 — Storage Safe Harbor

- Replaced localStorage as the authority for live proof, Memory Muster, bootstrap, signer, barrier, and evidence-reconciliation state.
- Window memory is authoritative; sessionStorage is the current-session mirror.
- Completed proof/memory milestones are best-effort mirrored to IndexedDB settings.
- localStorage writes are compatibility-only and may fail with QuotaExceededError without changing live readiness.
- Retires only obsolete live proof/diagnostic localStorage mirrors; project/business data is untouched.
- Fleet manifest/admission mirrors now prefer sessionStorage while durable settings remain authoritative.

## 8.6.22 — Storage Safe Harbor

- Added three-channel witness truth: window memory, sessionStorage, and localStorage.
- Window memory is authoritative for the live page; storage channels corroborate and expose exact exceptions instead of failing silently.
- Added a temporary 3.2-second automatic-recovery evidence hold and 5-second post-login evidence hold, both with Continue Now.
- Engineering Evidence now reports each witness channel independently and reads in-memory truth first.
- No fleet behavior, Legacy recovery, Memory Muster, bootstrap/finalizer, or staging behavior changed.

## 8.6.22 — Storage Safe Harbor

- Added durable runtime-entry witness in the first-light/atomic loader.
- Added verified-loader Engine visibility observer.
- Added loader-level ignition dispatch using the existing idempotent bootstrap runner.
- Added Engineering Evidence cards for loader, Engine visibility, and ignition settlement.
- No changes to Legacy recovery, Memory Muster, admissions, staging, or proof finalizer behavior.

## 8.6.22 — Storage Safe Harbor
- Add independent durable ignition witness breadcrumbs at lifecycle hook and ignition function boundaries.
- Trace Memory Muster request/return and proof bootstrap call/return without changing fleet behavior.
- Surface witness events in Engineering Evidence.

## 8.6.22 — Storage Safe Harbor
- Wire proof bootstrap into platform init after Engine configuration.
- Add Engine-entry and shortcut fallback ignition through one shared promise.
- Preserve read-only Proving Ground and all six-vessel recovery behavior.
- Retain Proof Signer Trace to verify bootstrap calls become non-zero.

# 8.6.22 — Storage Safe Harbor

- Atomic six-vessel in-memory commit; partial candidates never replace a verified runtime roster.
- Fleet Dock, Fleet Intelligence, Fleet Health, Command Deck, and Proving Ground share one memory roster generation.
- Proving Ground is read-only and cannot repair admissions or rebuild the fleet while inspecting it.
- Failed candidate rebuilds retain the last verified six-company runtime state.

# 8.6.22 — Storage Safe Harbor

- Added explicit BOOTING → RECONCILING → ROSTER READY → DOCK PAINTED → INTELLIGENCE PAINTED → PROOF COMMITTED lifecycle.
- Proving Ground now waits for the proof barrier and reads one canonical current six-vessel proof.
- Intermediate 5-row / 0-admission observations remain diagnostics/history and cannot create a current HOLD.
- Fleet Dock and Fleet Intelligence successful paints commit the same current proof used by readiness.
- Six-vessel rescue and Legacy immutable identity logic remain unchanged.

# 8.6.22 — Storage Safe Harbor

- Proving Ground now consumes the same current successful Fleet Dock trace that renders **SIX ABOARD**.
- Successful six-card Fleet Dock renders write a canonical current proof record for this build.
- Fleet Intelligence writes current first-paint proof when a six-vessel usable view renders.
- Earlier failed trace/READING FLEET attempts remain historical evidence but no longer override newer success.
- Fixed the Muster Trace readiness helper so it no longer collapses to `trace unavailable` from an out-of-scope safe wrapper.
- Canonical-six recovery logic is frozen; staging remains a non-blocking WATCH until deliberately exercised.

## 8.6.22 — Storage Safe Harbor

- Moves roster diagnostics inside the async resolver itself.
- Bounds every named resolver stage and records PASS / FAIL / TIMEOUT with protected vessel IDs.
- Adds an outer Engine command convergence guard so Fleet Dock cannot remain on READING FLEET indefinitely.
- Keeps Dock Source Trace and protected-six guards aboard.
- Preserves 8.5.7 as Last Known Good until this candidate earns promotion.

## 8.6.8 — Dock Source Trace

- Adds a professional, read-only Fleet Registry Trace to Engine diagnostics and Fleet Dock.
- Captures IndexedDB projects, settings mirror, admissions, manifest, in-memory companies, Dock input, visible rows, and rendered cards.
- Highlights Legacy Plumbing immutable ID `bf-p-f92f87e8ec44` at every stage.
- The Fleet Dock renderer fails closed if the final input or rendered cards lose any protected vessel.
- Adds a Proving Ground Fleet Dock last-mile source-trace gate.

## 8.6.8 — Dock Source Trace

- Adds a six-stage live roster trace from protected seed through rendered Fleet Dock.
- Fleet Dock fails closed at the first stage that loses a protected vessel.
- Exposes the exact Project IDs present/missing at every stage.
- Adds a Proving Ground Dock Source Trace six-stage proof gate.

# 8.6.8 — Dock Source Trace

- Restores Legacy Plumbing to the protected six-vessel canonical fleet without overwriting existing project data.
- Repairs the actual fleet-admission ledger so a restored canonical row also regains active fleet citizenship.
- Pins the six immutable Known Good vessel IDs from 8.5.7 as the protected roster contract.
- Adds a release-blocking `Canonical six fleet citizenship` gate: all six rows and all six admissions must agree.
- Preserves 8.6.1 bounded Fleet Intelligence first paint and Registry Ledger live-state gates.
- Keeps 8.5.7 as Last Known Good until 8.6.8 earns promotion.

## 8.6.8 — Dock Source Trace
- Restores and guards the canonical six-vessel roster, including Legacy Plumbing by immutable Project ID.
- Preserves bounded Fleet Intelligence first paint from 8.6.1.
- Adds durable per-vessel staging ledger with read-back verification and visible staged state.
- Adds live-state Proving Ground gates for roster, intelligence paint, and staging round-trip.

# 8.6.8 — Dock Source Trace

- Added bounded Fleet Intelligence first paint: within 650 ms the deck falls back to the already-loaded canonical/local roster instead of remaining on READING FLEET.
- Added LOCAL FLEET • VERIFYING state while live cross-vessel signal reconciliation continues in the background.
- Health Matrix, Capability Map, and Admiral Strategy remain usable from the local roster-backed snapshot during reconciliation.
- Added a Proving Ground contract for Fleet Intelligence bounded first paint and folded it into Command Navigation Voyage.
- Preserved 8.5.7 Known Good as the protected recovery anchor; 8.6.8 remains a candidate until it earns promotion.
- Preserved normalized fleet signals, capability adoption mapping, Admiral Strategy, project isolation, explicit adoption, Voyage Truth, GlyphForge, and telemetry contracts.


## 8.6.8 — Dock Source Trace
Protected six-vessel muster seed restores exact Known Good identities and admissions before fleet surfaces paint. Runtime registry drift cannot redefine fleet membership.

## 8.6.22 — Storage Safe Harbor
- Removed circular bootstrap-owned Dock/Intelligence rendering.
- Bootstrap now commits core proof only; normal surface renders attach generation-bound proof.
- Added one idempotent finalizer that commits current proof when core + Dock + Intelligence agree.
- Proving Ground remains read-only.

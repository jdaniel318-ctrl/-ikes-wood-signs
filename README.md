# Dark Sky 8.6.45 — Runtime Seal

Runtime-only bootstrap repair over Inventory Seal. The application runtime marker now agrees atomically with the page, deployment manifest, release inventory, release seal, web manifest, service worker, and current-build proof models. The Supabase staging adapter and server-side Identity Keel foundation are unchanged. 8.6.42 remains the protected Known Good recovery anchor until this candidate earns promotion.

# Dark Sky 8.6.41 — Generation Settlement

This candidate repairs the current Fleet proof chain introduced around the Identity Keel push and establishes explicit Admiral Course Authority. The current heading is strong, but Fleet doctrine is not frozen forever: the Admiral may deliberately promote a new course when conditions require it, with versioned history and rollback.

**Recovery anchor remains 8.6.38 until this candidate earns Known Good.**

# Dark Sky 8.6.41 — Generation Settlement

Hard production-identity foundation branched from certified 8.6.38. This release does **not** claim that production authentication is live yet; it installs the contracts, adapter, commissioning provenance, rollback bridge, and Proving Ground evidence required before outside-owner rollout.

## 8.6.42 Atomic Seal

- Supabase-ready production identity adapter with a strict browser boundary: publishable/legacy anon key only; `sb_secret_` and service-role credentials are forbidden in browser configuration.
- Identity and authority are separated: Supabase may prove the human, while Dark Sky retains canonical vessel membership, role, capability, and commissioning authority.
- Adds a server membership + Row Level Security contract: user → active membership → exact immutable Project ID → role/capability. Browser state alone is never authority.
- Adds **Production Identity Voyage** to Proving Ground. It intentionally remains WATCH until a real Supabase project proves cross-vessel denial, session expiry, server-side membership revocation, and rollback.
- Establishes Captain / Admiral / Engine Admin vessel commissioning authority. Project owners cannot self-escalate into fleet creation, and the commissioner does not automatically become the owner.
- New vessels record commissioning provenance and can begin **Fleet Unassigned** until an owner is deliberately attached. Commissioning never publishes a customer experience by itself.
- Preserves the private owner bridge as test/recovery-only. 8.6.38 remains the protected Known Good anchor throughout migration — no man left behind.
- Keeps Owner Authority, Witness Truth, Detail Relay, protected six-vessel registry, and all existing project data unchanged.

# Dark Sky 8.6.38 — Detail Relay

Narrow repair over 8.6.37 Owner Authority. Restores the durable parent Storage Details relay without changing Owner Authority or protected fleet data.

# Dark Sky 8.6.38 — Owner Authority

## 8.6.38 Owner authority hardening

- Branches from certified 8.6.36 Witness Truth.
- Gives owner sessions an explicit `project_owner` authority, exact canonical Project ID/namespace scope, eight-hour expiry, and deterministic logout witness.
- Separates the private Ike owner-test credential (`joe / 8642`) from Project Admin 4353, Engine 5615, Captain 19613, and Client Preview credentials; an existing local `joe / 4353` test credential is migrated on boot.
- Adds an Owner Authority Proving Ground voyage for scope, session lifecycle, and credential separation.
- Keeps production truth honest: static GitHub Pages does **not** become server-backed identity. Outside-owner production rollout remains blocked until a real authentication/authorization/session backend exists.
- Preserves the 8.6.36 Known Good anchor until this candidate earns promotion on-device.

## 8.6.36 Witness hardening

- Post-login evidence is considered settled when the authenticated Engine relay is observed, even when Diagnostic Hold is not intentionally enabled. The optional hold remains available as a visible manual diagnostic.
- Safari localStorage quota exhaustion is now reported as a degraded legacy channel, not a Fleet readiness failure, whenever window memory + sessionStorage proof are healthy.
- Retired legacy lifecycle hooks no longer create an ambiguous WATCH when the modern loader, memory-muster, bootstrap, and proof-signer witnesses are all verified.
- Capability staging evidence is no longer folded into Command Navigation Voyage; staging remains independently visible in Engineering Evidence.
- Experimental Ike length calibration remains a truthful non-blocking WATCH. Orientation, species, approved-artifact, and production-geometry protections are unchanged.
Stage Two storage hardening from the Relay Readback baseline. Fleet Maintenance **View Storage Details** now performs a real read-only ownership scan instead of appearing inert. Storage & Telemetry exposes the largest IndexedDB order records by size so the 30-row order footprint can be diagnosed without deleting anything. **Inspect Storage** is renamed **Rescan Storage** where it reruns measurement, while the protected Storage & Recovery action is renamed **Open Storage Breakdown**.

**Check the Hull** now leaves a durable timestamped integrity result. **Export Captain's Backup** now prepares the full backup asynchronously and then presents a durable **Download Captain's Backup** link, preserving a fresh iPad/Safari user gesture instead of silently attempting a download after awaited storage reads. Fast Fleet Maintenance storage values are explicitly labeled as point-in-time Safari estimates, while deep telemetry is labeled as the latest estimate to prevent the two readings from being mistaken for one immutable measurement. Safe cleanup remains cache-only and protected project/order/customer/graphic/evidence records remain outside cleanup authority.

# Dark Sky 8.6.32 — Relay Readback

Phase 1 relay-verification correction. Diagnostic Hold now writes its temporary intent to a same-tab `window.name` relay and immediately reads that exact marker back before the UI can report COMPLETE. The relay is independent of Engine authentication state and localStorage. After a successful Engine unlock, `app.js` sends an explicit authentication-complete signal; only then may the post-login evidence screen render. It remains visible until **Continue Now**, which clears the pending relay. Toggle-off clears both enabled and pending relay state.

The full 73-file atomic runtime is retained. No cleanup, deletion, migration, fleet mutation, or Phase 2 authority is added.

# Dark Sky 8.6.29 — Hold Relay

**Phase 1 final handoff correction.** Diagnostic Hold now arms before authentication, waits for the Engine login gate to clear, then presents a persistent post-login evidence screen that can only be released with **Continue Now**. The hold no longer auto-dismisses and cannot be consumed by pre-auth Engine visibility. All other Phase 1 Maintenance Rails behavior remains frozen. No cleanup, deletion, migration, or Phase 2 authority is added.

# Dark Sky 8.6.28 — Maintenance Rails

**Phase 1 certification candidate.** Fleet Maintenance commands now use destination-specific verification: Engineering Evidence must open its evidence details, Recovery Snapshot must create a visible recovery confirmation, Fleet Watch must render its live summary, and Diagnostic Hold must verify session state. Automatic storage sounding and Storage Details remain bounded and read-only. No cleanup, migration, or Phase 2 authority is added.

Phase 1 hardening release. Fleet Maintenance now owns an independent UI watchdog: automatic storage sounding must resolve to COMPLETE or WATCH without waiting on Safari storage promises, maintenance commands must reach a visible destination or report a durable WATCH, and the station remains read-only with no cleanup or migration authority.

# Dark Sky 8.6.26 — Bounded Sounding

Phase 1 hardening correction to Fleet Steward. The automatic maintenance signal is now a fast, bounded read-only health check with a 2.5-second ceiling; it never launches the deep storage enumerator automatically. Detailed ownership inspection remains explicit and is itself bounded to 9 seconds with a safe WATCH fallback. No cleanup, deletion, migration, or vessel behavior changes are authorized. 8.6.23 remains the protected Known Good anchor until this candidate is proven.

# Dark Sky 8.6.24 — Fleet Steward

Phase 1 fleet stewardship release built from the protected 8.6.23 Generation Relay anchor. Adds one visible Fleet Maintenance station, session-only Diagnostic Hold control, and a read-only Storage Steward inventory. No storage cleanup or vessel behavior changes are authorized in this release.

# Dark Sky 8.6.23 — Generation Relay

Prevents proof-generation drift: identical canonical-six refreshes retain their Memory Muster generation, and every genuine generation advance serially relays CORE bootstrap proof to the new generation before finalization. LocalStorage quota failure and legacy app-level lifecycle hooks remain non-authoritative diagnostics.

# Dark Sky 8.6.22 — Storage Safe Harbor

Live readiness and proof coordination no longer depend on localStorage. Window memory + sessionStorage own current-session truth; completed proof is mirrored to IndexedDB settings; localStorage is best-effort only. The 8.6.20 evidence hold proved Safari was throwing QuotaExceededError, so 8.6.22 removes that failure mode without changing canonical-six, Legacy, Memory Muster, or staging behavior.

# Dark Sky 8.6.22 — Storage Safe Harbor

Diagnostic-only hardening pass. Window memory is the authoritative current-session witness; sessionStorage and localStorage are independently probed with explicit read/write error reporting. Automatic recovery receives a brief evidence hold, and the settled Engine receives a five-second post-login evidence hold with Continue Now. Fleet, Legacy, bootstrap, Memory Muster, and staging behavior are otherwise frozen.

# Dark Sky 8.6.22 — Storage Safe Harbor

Verified-loader diagnostic and ignition bridge. The atomic loader records unavoidable runtime milestones and dispatches the existing bootstrap runner only after the Engine panel is actually visible.

# Dark Sky 8.6.22 — Storage Safe Harbor

Read-only durable lifecycle witness separating Engine startup hook execution from Proof Signer module-state observation.

# Dark Sky 8.6.22 — Storage Safe Harbor

Storage Safe Harbor wires the already-built proof bootstrap runner into normal platform initialization and Engine entry. The 8.6.16 Proof Signer Trace established that bootstrap calls were zero; this release fixes only that missing ignition wire and retains the signer diagnostics.

# Dark Sky 8.6.22 — Storage Safe Harbor

Atomic roster rule: reconcile → validate protected six → commit memory → render → prove. Proving Ground is inspection-only.

# Dark Sky 8.6.22 — Storage Safe Harbor

Current readiness truth is committed only after initialize → reconcile → render → prove. The canonical six-vessel rescue remains frozen; this release changes assurance timing and proof consumption only.

# Dark Sky 8.6.22 — Storage Safe Harbor

Current successful live evidence is now the canonical current truth for Proving Ground. The six-vessel rescue logic is preserved unchanged.

# Dark Sky 8.6.22 — Storage Safe Harbor

Storage Safe Harbor moves the roster life raft inside the asynchronous resolver. Every handoff is bounded and named; Fleet Dock must resolve or show the exact blocking stage.

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

# Dark Sky 8.6.8 — Dock Source Trace

Protected Known Good immutable vessel IDs are canonical survivors during duplicate reconciliation. Legacy Plumbing keeps `bf-p-f92f87e8ec44`; stale duplicates contribute data but cannot replace that identity.

# Dark Sky 8.6.8 — Dock Source Trace

**Mission:** no vessel left behind. Restore the protected six-vessel Known Good roster at both the canonical registry and fleet-citizenship layers, then prove every downstream fleet surface sees the same six immutable Project IDs.

Protected six: Becca's Bloom Shop, Legacy Plumbing, Signal Restoration, Grizzly Bear, Ike's Wood Signs, and Mugs After Dark. Existing vessel rows always win; the release may restore only a missing Known Good row/admission and must never overwrite project business data.

## 8.6.8 Dock Source Trace

Built from the safer 8.6.1 Intelligence Dock behavior while preserving 8.5.7 as protected Known Good. Canonical roster, bounded intelligence first paint, and durable staging are live-state contracts.

# Dark Sky 8.6.8 — Dock Source Trace

Protected baseline: 8.5.7 Voyage Truth. Dock Source Trace hardens the 8.6.0 Fleet Intelligence deck with a bounded first-paint contract. If live cross-vessel intelligence does not resolve within 650 ms, the deck paints an immediately usable roster-backed local picture and shows `LOCAL FLEET • VERIFYING` while reconciliation continues in the background.

The release preserves normalized fleet signals, Fleet Health Matrix, Capability Adoption Map, Admiral Strategy, strict project isolation, explicit capability adoption, professional-first command, Voyage Truth, GlyphForge, and telemetry/storage contracts.


## 8.6.8 — Dock Source Trace
Protected six-vessel muster seed restores exact Known Good identities and admissions before fleet surfaces paint. Runtime registry drift cannot redefine fleet membership.

### 8.6.22 Storage Safe Harbor
Core proof is created during Engine initialization; Fleet Dock and Fleet Intelligence naturally append their proof for the same memory generation. One idempotent finalizer signs the current proof.

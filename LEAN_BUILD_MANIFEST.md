# Dark Sky 8.6.41 — Generation Settlement Atomic Package Manifest

- Full package: **75 files including `CHECKSUMS.sha256`**.
- Protected on-device Known Good anchor: **8.6.38** until Registry Commit earns promotion.
- Production identity backend: **NOT CLAIMED LIVE** in this package.
- Supabase browser boundary: publishable/legacy anon only; secret/service-role keys forbidden.
- Vessel commissioning authority: Admiral / Captain / Engine Admin. Commissioner does not automatically become owner.
- Private owner bridge remains aboard as test/recovery-only until production sign-in, RLS isolation, revocation, rollback, and multi-device behavior are proven.

# Dark Sky 8.6.38 — Owner Authority Atomic Package Manifest

This is intentionally a full atomic package, not a lean patch. Diagnostic Hold uses a dedicated session-scoped same-origin relay plus an explicit authentication-complete hook so login/session reinitialization cannot erase the pending evidence hold. Do not trim deployment identity, runtime scripts, service worker, manifests, proof contracts, or release models from the upload set.

- Full package: 73 files including `CHECKSUMS.sha256`
- Release inventory payload: 72 files
- Protected Known Good anchor remains 8.6.23
- No Phase 2 storage mutation authority

# 8.6.29 Hold Relay — Lean Build Manifest

Phase 1 final handoff correction. Diagnostic Hold is now authenticated-gate-bound and persists until manual Continue Now release. Maintenance commands retain destination-specific verification. Protected six-vessel muster and 8.6.23 Known Good recovery anchor remain unchanged.

GENERATION_RELAY_MODEL.json — required generation-alignment contract for 8.6.23.
# Dark Sky 8.6.23 — Generation Relay
STORAGE_SAFE_PROOF_BUS_MODEL.json — required live-proof storage authority contract for 8.6.22.
RUNTIME_ENTRY_TRACE_MODEL.json — required verified-loader/runtime-entry diagnostic contract for 8.6.22.
IGNITION_WITNESS_MODEL.json — retained prior diagnostic contract.
BOOTSTRAP_IGNITION_MODEL.json — required runtime contract for 8.6.22.
# Dark Sky 8.6.22 — Storage Safe Harbor

- Payload files: 64
- One canonical proof generation
- Bootstrap: core-only
- Dock/Intelligence: natural surface proof
- Finalizer: idempotent and generation-bound
- Proving Ground: read-only

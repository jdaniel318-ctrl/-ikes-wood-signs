## 8.6.61 — Recovery Callback Bulkhead
- Recognizes Supabase recovery evidence in both URL query and hash forms before Engine first paint.
- Exchanges `token_hash` recovery callbacks for an authenticated session before authority verification.
- Quarantines PKCE-code, expired, and malformed recovery callbacks in a safe recovery hold instead of Engine Access.
- Adds the permanent `supabase_recovery_precedes_engine` and `recovery_callback_shape_coverage` regression gates.

## 8.6.60 — Recovery Identity Landing
- Resolves valid Supabase callback identity before Engine routing, even when the `type=recovery` marker is absent.
- Verifies active, non-revoked Admiral authority through RLS-scoped `fleet_global_authorities`.
- Adds RECOVER PASSWORD to the Admiral Fleet Service Entitlements station.
- Dark Sky recovery requests use an explicit root `?surface=admiral-recovery` callback.
- Unknown or non-Admiral callback identities enter a safe hold; Engine is never assumed.
- Password and access tokens remain outside Fleet/browser persistence.

## 8.6.59 — Admiral Recovery Landing
- Detects Supabase recovery hash before Engine routing and prevents Engine first paint during recovery.
- Adds dedicated Set New Admiral Password / Confirm Password landing.
- Password update goes directly to Supabase Auth; no Fleet table or browser storage contains the password.
- Scrubs recovery hash and best-effort revokes the recovery session after password change.
- Preserves 8.6.58 Admiral first-paint recovery and 8.6.55 Fleet Service Entitlement governance.

## 8.6.58 — Admiral First-Paint Recovery
- Restores Professional / Govern / top-of-deck as the deterministic Admiral first paint.
- Separates background readiness posture from manual Current Findings.
- Background proof timeout remains VERIFYING / pending rather than minting first-paint HOLDs.
- Manual Run Fleet Readiness remains the only path that renders the full findings wall.
- Preserves 8.6.57 proof-chain settlement, 8.6.55 command rail, and Fleet Services entitlement controls.

## 8.6.57 — Proof Chain Settlement
- Reuses the existing bootstrap, generation relay and finalizer lifecycle in one bounded settlement attempt before Admiral readiness.
- Preserves a single critical root at Proof Signer finalizer/read-back when proof cannot commit.
- Dependent roster/Dock/Intelligence/source-trace checks become blocked-upstream WATCH, never manufactured CLEAR.
- No evidence is invented; Dock and Intelligence still must be produced by their real render paths.

## 8.6.56 — Doctrine Authority Repair
- VIEW DOCTRINE opens a real current-course detail panel.
- Fleet Doctrine Registry is current to 8.6.56 with append-only prior-course history.
- Readiness storage classification separates measured Dark Sky bytes from browser-managed origin estimates.
- Upper-command readiness evidence reports the actual current build instead of stale 8.6.1 labels.

# 8.6.55 — Admiral Command Rail

- Widens and restructures Govern / Standardize / Delegate / Promote for iPad readability.
- Adds dedicated Admiral identity authentication and server-authoritative service entitlement actions.
- Adds Make Standard and Grant Paid Upgrade controls backed by `admiral_set_service_entitlement`.
- Reserves future Basic/Mid/Super package composition without exposing package pricing or activation yet.
- Leaves owner auth, RLS, ownership, and Fleet Services owner request behavior unchanged.

## 8.6.55 — Admiral Command Rail

Paid/Standard entitlement-state precedence, owner-facing Fleet Services language, and the first server-governed Admiral service-command seam.

# Dark Sky 8.6.55 — Fleet Services Framework

- Adds server-backed Fleet capability, vessel entitlement, and owner service-request framework.
- Admiral governs Standard vs Paid classification; owners cannot self-grant paid services.
- Adds Fleet Services to the Owner Bridge with prototype capability groundwork.
- Carries compact vessel identity through Owner Bridge working screens.
- Keeps Supabase owner auth, exact-vessel RLS, ownership, Captain and Admiral boundaries intact.

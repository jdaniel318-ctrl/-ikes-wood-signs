## 8.7.1 — Clear Helm
- Shows the server-authoritative current state before the Admiral makes a change.
- Presents a numbered Vessel → Feature → Setting workflow with a clearly marked current choice.
- Replaces internal project and capability identifiers with plain-language confirmation.
- Collapses credential controls after Admiral verification and clears the password field.
- Keeps every feature independently Off, Free or Paid for every vessel.
- Makes clear that Paid selects commercial terms but does not itself start billing.

## 8.7.0 — Feature Freedom
- Makes every Fleet capability an individually governed feature for every vessel.
- Replaces Standard with the plain commercial state Free and preserves all existing entitlements.
- Adds Admiral controls for Off, Free and Paid without hard-coding Ike or any other vessel.
- Keeps access state, commercial state and Sea Trial/Live environment separate.
- Records each Admiral feature-state change in the existing authority audit.
- Preserves backward compatibility with the 8.6.64 Standard command during deployment.
- Preserves the 8.6.64 top-anchored iPad Admiral scroll rail.

## 8.6.64 — Admiral Scroll Rail
- Replaces centered Professional Mode overlay scrolling with a top-anchored scroll origin.
- Enables explicit iPad vertical pan and momentum scrolling on the Admiral overlay.
- Keeps expanded Standardize and Fleet Service Entitlements content reachable in both directions.
- Adds the permanent `admiral_professional_top_reachable_after_entitlement_auth` regression gate.

## 8.6.63 — Recovery Sovereign Route
- Classifies the recovery-request URL as protected recovery at first light.
- Does not load or execute the full Engine/customer runtime on recovery routes.
- Keeps all non-recovery body surfaces sealed until recovery completes or safely fails.
- Eliminates the recovery, pre-login, Ike, and Engine multi-surface flash chain.

## 8.6.62 — Recovery Route Lock
- Prevents the late Black Flag portal binder from replacing Admiral Recovery with Engine Access.
- Makes `requireEngineEntry` fail closed during recovery request and callback routes.
- Keeps the recovery shield authoritative through the complete startup lifecycle.

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

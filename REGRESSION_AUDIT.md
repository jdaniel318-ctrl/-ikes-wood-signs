# 5.0.4 Authentication Regression Addendum

- Black Flag normal PIN: `5615`.
- Project Admin default/recovery PIN: `4353`.
- Captain's Quarters PIN: `19613`.
- Captain Test Access is session-only and is not a credential rewrite.
- Engine verifier accepts the historical default and an explicitly configured Engine PIN only.
- Project and Captain credentials are not consulted by Engine verification.
- One-time 5.0.4 repair clears only stale Engine lockout state created during the cleanup PIN regression.

# Dark Sky 5.0.3 — Authentication + Isolation Regression Check

## Required authority behavior

- Project Admin accepts 4353 across the fleet.
- Black Flag / Engine Room accepts 5615 in normal mode.
- Black Flag rejects 4353 in normal mode.
- Captain's Quarters remains 19613.
- Captain Test Access can only be enabled by providing valid Engine (5615) and Captain (19613) credentials.
- Once Test Access is active, Engine gates may bypass PIN entry for that browser session only.
- Project Admin continues to require its own project credential even while Test Access is active.

## Isolation behavior

- SIG → Project Admin → Black Flag must clear SIG protected/customer surfaces before Engine rendering.
- Selecting Ike, Mugs, Becca's, Grizzly, or SIG from Black Flag must establish only that immutable Project ID.
- No route may infer Ike as a default project.
- Orders/status writes require matching Project ID.
- Engine selection state and project customer/admin session state remain separate.

## Static checks for this package

- JavaScript syntax validated with Node.
- Duplicate HTML ids checked.
- Runtime asset references checked.
- ZIP integrity checked.

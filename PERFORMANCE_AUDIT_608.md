# Dark Sky 6.0.8 — Captain Desk Responsiveness & Station Audit

Focused transition-speed cleanup on the stabilized 6.0.4 spine.

## Concrete barnacles removed

- Captain entrance controls previously remained gated for 4.3 seconds even though the main entrance animation completed substantially earlier. First entry now releases at 2.5 seconds.
- The cinematic Captain entrance now runs once per browser session; later Engine → Captain round-trips become interactive immediately.
- The service worker previously attempted to pre-cache a non-existent `captains_quarters_canonical.png` path.
- Engine appearance benchmark images (~3.6 MB combined) are no longer eagerly pre-cached on every release install; they remain available on demand.
- The actual Captain production environment is now the Captain image included in the pre-cache list.

## Contracts intentionally untouched

- Black Flag Engine PIN/authentication: 5615.
- Project Admin fleet default/recovery: 4353.
- Captain's Quarters PIN: 19613.
- Client Preview unique PIN-per-invite.
- Project isolation, test contact blocking, and Captain subview routing.

## Station-state behavior

- READY stations route to verified runtime targets.
- FUTURE stations remain visible and return an intentional Captain notice instead of failing silently.
- Any READY station whose runtime target is missing is downgraded to UNAVAILABLE when the desk is built.
- The selected cinematic Captain environment and existing transition timing are unchanged.

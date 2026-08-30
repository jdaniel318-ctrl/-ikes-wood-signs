# Dark Sky 8.6.33 — Stage Two Bridge

- Fix Diagnostic Hold false WATCH on iPad by verifying the sessionStorage value directly after every toggle write.
- Keep `window.name` as an independent relay rather than making it the sole success condition.
- Require requested state, read-back state, live toggle state, and in-memory session state to agree before COMPLETE.
- Preserve manual post-login evidence release and toggle-off pending-state cleanup.
- Enter Stage 2+ as a guarded bridge; no automatic cleanup or project-data mutation is introduced.

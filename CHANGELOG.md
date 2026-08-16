# Dark Sky 4.3.5 — Exact Bearing

- Moved exact-order targeting into the Project Orders renderer.
- Added transient selected-order state carried from Captain Command Find into the Engine.
- Approved target orders are now rendered with a direct focus marker and scrolled into view.
- Historical/legacy target orders now render as a read-only detail above the current project roll.
- Added explicit `data-id` hooks to Project Orders cards for deterministic targeting.
- Preserved current order counts and active roll semantics; historical records are never promoted.
- Preserved V4 commissioning, isolation, quarantine, Storage Steward, and Captain/Engine authorization boundaries.

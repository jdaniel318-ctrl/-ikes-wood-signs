# Dark Sky 7.8.2 — Harbor Exit Immediate Acknowledgement

## Mission
Guarantee that Compact Diagnostics visibly reacts to the first iPad tap even when Safari storage enumeration is slow or stalled.

## Interaction contract
- `COMPACT DIAGNOSTICS` opens a modal immediately before any asynchronous storage sounding begins.
- The first modal state explicitly confirms that the tap worked and that diagnostics are read-only.
- Results replace the loading state in the same modal when Safari returns evidence.
- A diagnostic failure is displayed in the same modal instead of failing silently.
- `CLOSE` is always available.
- Re-entrant/double activation is blocked while the diagnostic action is opening.

## Safety contract
- Diagnostics remain read-only.
- Safe Cleanup remains a separate action and stays constrained to positively identified stale Dark Sky application caches.
- Projects, orders, customers, settings, graphics, admissions, quarantine evidence, active V4 data, and recovery anchors remain protected.

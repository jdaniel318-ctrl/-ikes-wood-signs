# Dark Sky 7.7.0 — Deep Sounding

## Mission
Make Engine storage and telemetry visible, tappable, explainable, and safe to maintain.

## Entry points
- Engine `ENGINE TELEMETRY →` opens Storage & Telemetry and automatically performs a non-destructive sounding.
- The Command Deck `ENGINE STORAGE` KPI is a real button-like control and opens the same surface.
- Configure Engine retains the protected Storage & Recovery controls as a secondary path.

## Sounding buckets
The surface separates Safari origin usage from data Dark Sky can enumerate:
- Cache Storage
- IndexedDB primary records
- LocalStorage metadata
- Browser-managed / unattributed origin storage
- stale application cache eligible for safe cleanup

## Safety contract
Safe Cleanup may remove only stale Dark Sky / Black Flag application caches discovered by the latest sounding. It does not delete projects, orders, approved artifacts, customer records, project graphics, settings, recovery anchors, admissions, or quarantine evidence.

## Proving
Storage Steward Voyage verifies that the inspection surface is reachable and the cleanup contract remains constrained to stale application caches.

# Dark Sky 7.8.0 — Sounding Glass

## Mission
Explain browser storage before cleaning anything. Diagnostics must be visible, read-only, and honest about browser API limits.

## Diagnostic coverage
Sounding Glass attempts to enumerate:
- Cache Storage and current/stale Dark Sky caches
- Dark Sky IndexedDB stores plus the browser's IndexedDB database catalog when Safari exposes it
- LocalStorage and SessionStorage
- Service-worker registrations
- Origin Private File System (OPFS) files when supported
- `navigator.storage.estimate()` usage/quota and per-class `usageDetails` when exposed

## Ownership boundary
Browser-managed / unattributed bytes are never treated as disposable project data and are never offered for cleanup merely because they are unexplained. Cleanup remains constrained to stale Dark Sky / Black Flag application caches that can be positively identified and excludes the active release cache.

## Captain experience
`COMPACT DIAGNOSTICS` must visibly render a diagnostic panel and scroll it into view on iPad. No invisible diagnostic action is considered complete.

# Upload This One Build — Dark Sky 8.1.5 Admiral Autopilot — iPad Safe

Release seal: `admiral-autopilot-815-root-keel-b58e31`

This upload package is intentionally **99 files** so GitHub's iPad/web uploader accepts it in one pass.

Six unchanged historical storage-telemetry notes are intentionally omitted from this upload because they already exist in the repository from 8.1.2 and their bytes/checksums are unchanged:

- `STORAGE_TELEMETRY_770.md`
- `STORAGE_TELEMETRY_780.md`
- `STORAGE_TELEMETRY_781.md`
- `STORAGE_TELEMETRY_782.md`
- `STORAGE_TELEMETRY_783.md`
- `STORAGE_TELEMETRY_784.md`

No runtime, release-identity, Fleet Learning Registry, calibration, doctrine, route, or visual file is omitted.

Upload all 99 files in this folder to the repository root. After GitHub Pages deploys, refresh once. If the previous worker is still active, use **CLEAN RELEASE RETRY**.

Admiral Autopilot then auto-runs release doctrine, known-calibration replay, and Fleet Learning Registry preflight. Recommendations may be staged/adopted per vessel, but no business-specific behavior crosses projects automatically. Final **MARK CANDIDATE KNOWN GOOD** remains manual.

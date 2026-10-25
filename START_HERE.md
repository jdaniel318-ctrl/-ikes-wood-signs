# Black Flag Fleetguard — Safe Foundation Add-on

This is a **read-only add-on** to Black Flag 8.8.20.64, NOT a new commissioned release, and NOT a production authentication change. It does not update the Engine version number or alter any existing file. The original application and customer data remain untouched.

## Upload the add-on
Extract `BlackFlag-Fleetguard-Audit-Addon.zip` and upload the **five new files** directly to your existing GitHub repository root. Do not delete or replace anything. Open `https://jdaniel318-ctrl.github.io/-ikes-wood-signs/fleetguard.html` once deployed. It audits manually supplied vessel evidence JSON **locally in the browser**; nothing is sent to the server. The default template deliberately reports all gates NOT VERIFIED.

## Checks
- `node VERIFY_FLEETGUARD.cjs` — 20 fail-closed scenarios, including cross-vessel cases.
- `node VERIFY_RELEASE_DIRECTORY.cjs PATH_TO_FULL_RELEASE` — report missing files, manifest hash mismatches, and unsafe paths. It exits nonzero if any are present.
- `fleetguard.html` — view gates, download audit JSON.

## Critical governance boundaries
- Server-authoritative owner role acceptance and revocation require real server-side implementation and independent negative tests. This add-on cannot grant a Captain access.
- The `project_owner` role is expected in the current owner permission model; do not treat a global Captain role as a substitute.
- Backup and restore need real, separately verified receipts. Storage availability or a local JSON download alone is insufficient.
- The client report is a diagnostic, **not proof of server identity or data isolation**. No live customers or other vessels should be granted access on the strength of this report.
- A published status flag is different from a deployed and commissioned vessel.

## Incomplete source constraint
The available local build materials include the 8.8.20.64 update (47 files), but not its exact 435-file full backup. A reconstruction from older local files is missing seven historical Fleetcare QA/reference files. A replacement 'full backup' would be misrepresented; therefore none is claimed or provided. Obtain the original `.64` full backup or a verified repository snapshot to produce an exact future backup.

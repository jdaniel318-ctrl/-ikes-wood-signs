# Dark Sky 5.0.4 — Black Flag Structure Restore

- Restores the proven Black Flag Engine authentication contract from the pre-5.0 cleanup: `5615` is always a valid Engine PIN.
- Restores compatibility with an explicitly configured Engine PIN without allowing Project Admin (`4353`) or Captain (`19613`) credentials to authenticate Black Flag.
- Captain Test Access remains the only session-only Engine bypass and does not rewrite any credential.
- Adds a one-time Engine lockout repair because repeated tests against the incorrect 5.0.1–5.0.3 credential changes could leave the correct `5615` PIN locally locked out. Future brute-force lockouts continue normally.
- Keeps the 5.0 project-isolation and fleet-boundary work intact; this release changes the Engine authentication spine only.

# Dark Sky 5.0.3 — Authority Spine Correction

- Restored Black Flag / Engine Room normal PIN to **5615**.
- Kept Project Admin fleet default/recovery PIN at **4353**.
- Kept Captain's Quarters PIN at **19613**.
- Preserved the established Captain Test Access behavior: when deliberately enabled for the browser session, Engine PIN entry is bypassed; the Engine PIN itself is not changed.
- Engine authentication now ignores stale/historical `enginePin` storage so a project PIN or prior regression build cannot redefine Black Flag.
- All Engine gates continue to route through the same `BlackFlagAuth.verify` controller when Test Access is not active.
- Bumped executable and service-worker cache references to **5.0.3**.

# Dark Sky 5.0.2 — Engine Authentication Repair

- Restored the fleet-standard 4353 PIN as the guaranteed Black Flag Engine default/recovery credential.
- Preserved any deliberately configured Engine PIN as an additional accepted credential; it can no longer make 4353 fail.
- Kept Project Admin on the same 4353 fleet default/recovery contract.
- Captain's Quarters remains a separate privileged platform layer with its own credential.
- Bumped all executable/cache references to 5.0.2 so Safari/GitHub Pages cannot remain pinned to the broken 5.0.1 Engine PIN constant.

# Dark Sky 5.0.1 — Isolation Hardening

Second-pass audit of the 5.0 fleet boundary release.

- Removed the last unsafe Engine-entry cancel fallback that could expose Ike's customer shell without an explicit Project ID.
- Project Admin UI no longer changes to a Captain/Test Access message; project-admin authentication stays visibly independent.
- Reference-vessel rendering no longer substitutes the first fleet project if Ike's reference vessel is unavailable.
- Bumped runtime and service-worker cache references to 5.0.1.

# Dark Sky 5.0.0 — Fleet Boundary Spine

- Reworked cross-layer navigation so Project Experience, Project Admin, Engine, Engine Project Control, and Captain layers cannot remain visually active at the same time.
- Fixed the failure that allowed a Signal Restoration Project Admin gate to remain on screen while returning toward the Engine.
- Fixed Engine entry cleanup so the universal/Signal customer shell is hidden just like Ike, Mugs, and Flowers.
- Engine entry now clears active project identity before Engine rendering. The only project identity preserved during a cancelled Engine entry is an immutable return Project ID.
- Cancelling Engine entry re-enters that exact project through the canonical `enterProject()` route rather than rebuilding a partial shell.
- Retired the unsafe legacy generic Company/Admin shortcut that could click Ike's admin button without an explicit Project ID.
- Project Admin PIN gates now carry the Project ID that launched them and fail closed if the active project changes before unlock.
- Added boundary guards to protected Admin, Orders, Ledger, status-update, and async admin-render paths.
- Converted Project Manager status controls and filters to the project's own workflow contract instead of global/Ike defaults.
- Added runtime isolation snapshot/verification diagnostics for Sea Trial and regression work.
- Removed unused legacy BOR logo artwork while retaining the historical internal Signal Project ID for continuity.
- Bumped all runtime/cache references to 5.0.0.

# Dark Sky 4.9.7 — Fleet Project Admin Authentication Spine

- Fixed the actual failure mode behind the Project Admin PIN screen: the gear/settings route was bound early, but the **UNLOCK ADMIN** handler was still bound late inside the full application event setup. If initialization stalled before that point, the gate appeared correctly while the button was effectively dead.
- Added an early, storage-independent Project Admin authentication spine bound before IndexedDB and migrations.
- `4353` is a hard fleet invariant and always unlocks Project Admin for every current/future project, independent of stale project settings, project-specific PINs, Test Experience, Private Preview, live deployment, or Captain/Test Access state.
- Deliberate project-specific PINs remain additional valid credentials; they can never replace or disable `4353`.
- Project Admin no longer bypasses its PIN merely because Captain Test Access is active. Captain/Test Access and Project Admin authentication are now explicitly separate authority layers.
- All Project Admin launch controls converge on the same route: Ike's admin control, Mugs, Becca's, Signal Restoration, universal/future project shells, Test Experience, preview, and live project shells.
- Enter-key submission and button submission now use the same verifier and same lockout state.
- A valid PIN is no longer reported as incorrect if a downstream workspace-render/storage error occurs after authentication.

# Dark Sky 4.9.7 — Project Access Contract + Show the Flag

- Makes `4353` the fleet-standard Project Admin PIN for every project unless that project has been deliberately given an override through protected project settings.
- Adds explicit override metadata so stale project-local PIN rows cannot silently defeat the fleet default.
- Performs a one-time fleet repair for existing projects and clears stale per-project lockout state when restoring the default.
- Improves Project Admin gate contrast and readability across project themes.
- Restores the approved Black Flag platform icon as the fixed bottom-right return control on customer, PIN gate, Project Manager, Orders, and Ledger project surfaces.
- Replaces the embedded return-control image with the canonical bundled Black Flag asset and bumps service-worker cache identity.

# Dark Sky 4.9.4 — Capability Authority + Project Manager Workspace

- Added a master project capability catalog with AVAILABLE vs FOUNDATION status.
- Added business-profile recommendations so each project starts with capabilities relevant to its business description.
- Added Project Control Center → Operate → Capabilities as the sole activation/deactivation authority.
- Added a Project Manager Workspace that reorganizes enabled capabilities into Jobs, Schedule, Customers, Field Documentation, Estimates, Team, Reports, Customer Experience, and System.
- Project managers can see/use enabled capabilities but cannot activate or deactivate them.
- Signal Restoration now defaults to restoration-focused capabilities: intake/status, customers/property, field documentation, crew/scheduling, insurance, estimates/authorizations, notes, and reporting.
- Signal Restoration visual-placement catalog is retained but moved behind an Advanced Visual Capability Library with No Visual Placement as the appropriate default.
- Preserved project isolation and test/private-preview contact safety boundaries.

# Dark Sky 4.9.3 — SIG Admin + Project Control Center Standard

## Signal Restoration repair
- Restores the Signal Restoration project-admin test baseline to the fleet-standard PIN `4353` once for this testing build, preventing stale project-local preview storage from blocking access.
- Keeps the repair project-scoped; other vessels' admin credentials are untouched.
- Adds a bundled fallback for the approved `signal_restoration_logo.png` on the project-admin gate when no project-local uploaded logo override exists.

## Project Control Center
- Adds an Overview-first Project Control Center to the protected project-admin experience.
- Adds project health, open workload, customer, recent-activity, isolation and system/build signals.
- Adds Signal Restoration-specific restoration operations, contact and Test/Private Preview safety status without leaking those business rules into other projects.
- Adapts quick stats to each project's workflow instead of assuming Ike-style production statuses.
- Preserves project-local orders, customers, settings, credentials and Test/Private Preview call restrictions.

# Dark Sky 4.9.2 — Signal Restoration Brand + Market Foundation

## Restoration project
- Rebrands the restoration vessel from the temporary Best Option/BOR concept to the original **Signal Restoration** brand.
- Uses the approved Signal Restoration logo asset.
- Project contact profile: `jdaniel318@gmail.com`, `804-317-3230`, `19600 Genito Rd`.
- Removes North Richmond / North Chesterfield positioning. Initial active market is Greater Richmond.
- Adds a project-local multi-market model so future Signal Restoration markets can have their own service area, phone, email, base address and deployment without creating cross-project data coupling.
- Keeps the legacy immutable project key internally for migration continuity; no BOR/Best Option identity is customer-facing.
- Request references now use the `SIG` prefix.

## Mobile + safety protections carried forward from 4.9.1
- Test/Private Preview call actions remain non-live and cannot place a real phone call.
- Live deployments use the new Signal Restoration number only.
- iPhone Engine keyboard scrolling and project-rail vertical gesture fixes are preserved.
- Dark Sky test navigation remains de-emphasized on mobile and can be removed entirely for standalone live deployments.

## Isolation
- Existing vessel definitions and Captain’s Quarters assets are not rebranded or modified by Signal Restoration.
- Signal Restoration brand/market migration updates only its canonical project row.

# Dark Sky 8.8.17.19 — HelmDeck

A focused Captain Station client repair based on Quarterdeck. Test-site candidate; not a new commissioning, role grant, public launch, or completed working-ship handoff.

## What changed

The accepted Vessel Captain Station now has one compact header with its actual vessel name, current build, staging/lifecycle, operating posture, Refresh Station and Sign Out. Exact scope and the operator/vessel_captain distinction remain under Access & scope. Orders and Report to Admiral Watch sit side by side in wide landscape viewports. The empty-state station fits the tested 1366×892 and 1024×636 content viewports with 18px form inputs. Long queues, expanded scope, larger text and keyboard-height/narrow views use normal document scrolling; no viewport lock, zoom disablement or scaled buttons.

A successful acceptance response now leaves the old Pending/Accept interface immediately and opens an explicit station-loading view. Station reads have a 12-second deadline per phase; unconfirmed reads offer Recheck Station, which reads the existing appointment and does not repeat acceptance. Late station-read results are ignored after the read is retired or the Captain signs out. Mismatched vessel IDs cannot paint the station.

Orders still change **status only** through the existing exact-vessel RPC. Watch publication still uses the existing report RPC. These fixture tests do not verify the live database's permission enforcement. Owner pages, Admiral entrance/session transport and the delegation controller are retained apart from release labels.

## Protected boundaries

All 85 existing application paths remain. No live Supabase query, migration, appointment, revocation, departure, order update or Watch publication was performed for this build. No fixture account or private ledger export is shipped. Both SQL files are retained unchanged and **must not be executed as part of this layout update**. No website-data cleanup is required.

The five prior warning conditions remain unverified by this release. The native customer/operator journey, cross-vessel denial, live revocation, server timeout and isolated restore remain separate acceptance work. Do not press Accept again for an already accepted appointment.

## Upload

Extract `DarkSky881719-HelmDeck.zip`. Upload the **85 files inside** the matching folder to the existing site root. Let Pages finish. Confirm **8.8.17.19 · HELMDECK** before testing. The separate Captain route remains `owner.html?surface=vessel-captain&project=<project_id>`.

## Verification boundary

The owner scripts and shared transport are executed in isolated Chromium with original source markup/styles, fixture route location, in-memory session storage and simulated fetch responses. A normal full-site local navigation was attempted but returned ERR_BLOCKED_BY_ADMINISTRATOR; that restriction was not disabled or bypassed. Native Safari, physical keyboard behavior and full-site startup are not certified by these tests.

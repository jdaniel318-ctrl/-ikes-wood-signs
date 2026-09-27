# Dark Sky 8.8.17.20 — TrueBearing

**Status: client test candidate. Fleet Command operating-server activation remains pending.**

This release repairs vessel identity, assigned-account navigation, and the distinction between a Vessel Captain and Fleet Command. It is not a production launch or permission grant.

## What works in this client

- Named sign-in destinations for the six existing muster vessels; each name is labelled as release-directory identity until verified by the authenticated response. Unknown destinations are not given invented names.
- Visible signed-in email, exact vessel and acting role, verified against the account service before appointment/station reads.
- **My Assigned Vessels** is a normal entry route: `owner.html?surface=vessel-captain`. It uses the existing account-scoped appointment reader and does not silently select the first vessel.
- A valid login with no appointment opens an explicit named denial screen, not another unexplained password form. It provides My Assigned Vessels and a separate Fleet Command entrance.
- Captain sign-out conceals data immediately and requests session-local server sign-out. It does not clear an Owner or Admiral session key. Candidate-only guarded requests retire late sign-in, refresh and read results.
- Report text has a visible 160-character counter and multiline entry. Saved records are not rewritten. The prior short BBS-00 value alone did not prove an application truncation bug; this build tests the complete 43-character BBS-001 string.
- Duplicate publish/status requests are contained while pending, and uncertain mutation outcomes use read-only recovery rather than automatic resubmission.
- Admiral observation buttons say **View as Admiral**. My Fleet's header is nonsticky, so it cannot cover cards on scroll.

## Hard boundary: Fleet Command operations are not installed

The earlier attempted live authorization migrations were blocked by the tool's safety checks. This release does not retry those writes, does not route around the restriction, and does not supply instructions to run them elsewhere. No new server functions or live roles were installed by this build.

The exact-vessel Admiral overview therefore displays **SERVER ACTIVATION PENDING** with operating controls disabled. It is not a functional Fleet Captain operating station. Existing Admiral read-only observation and appointed-Vessel-Captain operations remain separate and available through their existing checks.

The two existing SQL files are byte-identical to HelmDeck. **Do not execute them for this release.** Static GitHub upload performs no database migration.

Readiness contains an additional explicit Fleet Captain operating-service watch item. A comparable run may show 82 checks and 6 watch items (not a live result observed by this build). No existing warning or working-ship handoff requirement is marked complete.

## Preserved

85 original application paths; original artwork; six muster identities; standalone owner path; ledger transaction/correction modules; existing appointment and revocation contracts; both Admiral security gates and bounded workspace policy. No existing records, accepted appointment, ownership, membership, or lifecycle were intentionally changed or deleted by this build.

## Deployment / first check

1. Extract `DarkSky881720-TrueBearing.zip`.
2. Upload the 85 files inside its matching folder to the existing GitHub test-site root.
3. Confirm **8.8.17.20 · TRUEBEARING**, then open the existing Grizzly Bear Captain link and check that the destination is named **before** typing a password. Keep existing website data.

All new browser-test network results are isolated fixtures, not live Fleet Core evidence. See the separate TrueBearing verification report for checks and remaining limitations.

---

## Retained HelmDeck release record

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

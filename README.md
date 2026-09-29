# Dark Sky 8.8.18.1 — DraftWatch

Client tab/closure diagnostic and resilience candidate based on AdmiralKeel. The reported iPad return from Files & signing is a real field failure; its exact cause was **not** reproduced in ordinary isolated Chromium. This release must not be represented as a proved cure for the device failure.

## Narrow changes

Tab rendering now completes before the visible tab is changed, and a failed render restores the previous tab without clearing the draft. A visible navigation status names the section. A bounded display check catches a hidden or missing panel. A native dialog closure or context mismatch now leaves a specific message on Command rather than a silent return. No automatic re-opening or session extension is added.

Repeated session-ended/unavailable events no longer erase the status code needed to clear an old session warning after successful reauthentication. Earlier saved device drafts are not deleted.

## Preserved boundaries

No changes to CG-1 contract clauses, draft schema, percentage calculations, existing service selections, the IndexedDB database name, Owner/Captain permissions, server authority checks, 15-minute idle/60-minute maximum windows, or the existing blocked signing/fee/commissioning actions. No live service call, signing request, fee activation, permission change or website-data purge was made. Do not run the bundled SQL. The accepted Admiral office remains separate from session authentication; this client release creates no server rank.

## Field checkpoint

Keep the existing Revision 2 private export unchanged. Install this single complete release, confirm 8.8.18.1 DRAFTWATCH, then use normal Admiral entry. Open Contracts & Services and choose the existing vessel. Files & signing should remain in the contract workspace; report its screen or the new specific closure/error message. No real signing, uploads, charges or commissioning are part of this check. Native Safari acceptance remains pending.

---

## Prior release record (retained)

# Dark Sky 8.8.18.0 — AdmiralKeel

## Current release: commissioned Admiral office hardening

AdmiralKeel marks the Fleet role transition requested by the Captain: **the Admiral office is now accepted as a durable Fleet role rather than a temporary promotion milestone.** This is a product/governance role state, not a bypass of authentication. Each secure Admiral workspace still requires the passage PIN and server-verified active Admiral identity. Session timeout, logout, page reload, readiness WATCH items, and unfinished tests lock work; they do not demote the Admiral. Only an explicit server-side authority revocation can remove the active role.

Captain and Admiral remain separate offices held by the same person. Admiral observation remains read-only by default. Modifying commands remain exact-vessel, deliberate, authenticated, reasoned, and audited. Existing Vessel Captain appointments, owner authority, Becca's browser-local CG-1 agreement draft, Fleet Core membership, and all unresolved readiness warnings are preserved. Fleet Captain operating-server activation, executed-contract verification, commercial fee activation, server-wide session expiry, revocation proof, and complete working-ship handoff remain unfinished.

This hardening also improves input ergonomics discovered during field testing: single-line pasted text trims only accidental leading/trailing whitespace while preserving internal spaces; contract illustration fields select their default zero on focus so the first typed amount replaces it, while the negotiated percentage remains blank unless deliberately set.

**Admiral rank and secure session are now explicitly different states throughout the Engine, Admiral gate, Command Deck, and Contracts & Services session messaging.**

---

# Dark Sky 8.8.17.23 — CharterPort

## Current release: Contracts & Services entry hardening

This uniquely numbered client repair follows the actual CharterBridge package. It supersedes the two different .22 repair names for the next field check; it is not a new contract, permission grant, or fleet launch.

The field screenshot confirms that CharterBridge did not visibly open after a tap. The ordinary isolated Chromium fixture does open CharterBridge, so the exact iPad failure cause is not established. A controlled button-node redraw demonstrates a separate weakness: the old element-specific handler is lost. CharterPort uses narrowly scoped delegated entry handling that survives this redraw and native modal presentation rather than relying on a numeric z-index race.

Before requesting the contract directory, the entry verifies that the native modal is open and its Back to Command control is in front for hit-testing. An unconfirmed display unwinds to a usable Command Deck with a persistent CONTRACTS-DISPLAY-UNCONFIRMED message. It does not repeatedly open itself, repeat a command, or bypass authentication. Existing 15-minute idle / 60-minute maximum workspace rules remain.

All CG-1 wording, fee calculations, draft storage keys, business logic, existing appointments and server authority contracts are retained. This update neither signs an agreement nor enables fees, commercial commissioning, departure, or Fleet Captain server operation. No live service calls, database changes or website-data deletion are part of this repair. Do not run the bundled SQL. Keep private contracts off the public GitHub repository.

**Field acceptance pending:** confirm 8.8.17.23 · CHARTERPORT, authenticate Admiral normally, tap Contracts & Services once, and inspect the empty workspace. Native iPad Safari and real server interactions have not been tested by the fixture suites.

---

## Retained predecessor documentation

# Dark Sky 8.8.17.22 — CharterBridge

Focused client repair from CharterGuard. Contracts & Services now paints above the Admiral deck and below its security gate. Silent entry refusal/setup errors become visible notices; the deck is restored after setup failure. Trusted contract editing counts toward the existing 15-minute idle policy; the 60-minute maximum stays fixed. Current readiness receipts identify CharterBridge.

The CG-1 contract text, signature/fee/commissioning holds, seven warning conditions, private draft storage keys, appointment and ledger logic remain. No SQL or site-data cleanup is needed. Upload only the 85 files in the matching folder. No legal document, private contract or test kit belongs in the public website.

# Dark Sky 8.8.17.21 — CharterGuard

Private commissioning-agreement preparation. Admiral-only client workspace: named legal parties and Captain acknowledgment, selected duties, per-vessel sales basis/percentage, counsel review log, private draft export/import, browser-local append-only draft saves with readback, printable legal-review copy, and externally executed PDF fingerprints.

**Not a signing service, legal certification, billing activation or server authorization update.** Document fingerprints do not prove signature validity, signer authority, content equivalence or cloud custody. Actual business entities, jurisdiction, insurance and risk allocation require review. Selected service duties are proposed terms, not access grants.

No production fee is calculated from live records or collected. The fee calculator is a labeled manual scenario. No production contract, user, appointment, owner, report or ledger record is created. No live SQL is needed or included. Existing SQL references are not to be executed.

**Commercial commission and departure are held in this client** pending an executed-agreement verification service. This does not retrofit a server gate: old clients/direct server commands still require a separately authorized server implementation and test. Existing test vessels/accepted appointments remain. Internal Admiral programs remain distinct.

New route: Engine → Build & Govern → normal Admiral authentication → CONTRACTS & SERVICES. Select an existing ship or prepare a planned vessel key; this does not reserve it. Save device draft is private browser storage, not a cloud backup. Export JSON/HTML into private Files; never upload private agreements to the public GitHub site.

Before signing externally, complete all terms and have appropriate counsel finalize the document. The generated contract is conspicuously marked DRAFT FOR LEGAL REVIEW — NOT FOR SIGNATURE. Retain final signed copies and signing evidence outside this test browser. Future server verification must precede commercial activation.

Existing identity/appointment, owner, ledger, project and Admiral session boundaries remain. No purge or automatic legal/rate defaults.

---

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

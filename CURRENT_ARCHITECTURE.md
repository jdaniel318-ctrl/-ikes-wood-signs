<!-- BLACKFLAG_CURRENT_RELEASE_START -->
# Current architecture — Fleetbound 8.8.20.73

Source of release identity: RELEASE_CONFIG.json. Installed page/manifest/seal/worker identity is generated together. APP_COMPONENT_REVISION is 8.8.20.71; owner helper revision is 8.8.20.68. Unchanged component bodies remain byte-identical across release-only changes.

The Engine still verifies every required body, current governance models, app component contract and worker identity before executing the same script sequence. App and Captain bind audit/display freshness to the verified installed release. This context never grants permissions. The owner page keeps explicit helper compatibility checks.

No specialist module is deferred or removed. This software patch changes no schema, session key, appointment, authorization endpoint, sign-design geometry or ledger behavior. The separate, completed administrative commissioning transaction is documented in WONDERWAKE_COMMISSION_RECEIPT.json. Fleet Core and Admiral Programs remain distinct. Program rendering now retains server program records across local filters and branding refresh; no authentication behavior changed.

## Release commands
Prepare known identity fields: `python3 -B PREPARE_RELEASE.py .` (resets test status to untested; never deploys).
Seal reviewed bytes only: `python3 -B PREPARE_RELEASE.py . --seal-only`.
Verify: `node VERIFY_RELEASE_ALL.cjs . ../release-check-evidence`.
Package: `python3 -B BUILD_RELEASE.py . --baseline <exact prior full-source ZIP> --out <new external directory>`.

Previous release guides/scripts are retained historical material; do not run their release-pinned sealers on this release.
Native Safari/hosted integration is separate from offline checks. Source backup is not business-data restore.
<!-- BLACKFLAG_CURRENT_RELEASE_END -->

## Retained historical notes

# Fairlead 8.8.20.68 — Current release
Current upload: `DarkSky882068-Fairlead-Upload.zip` (also delivered as byte-identical `Fairlead68.zip`).
Matching complete source: `DarkSky882068-Fairlead-FullBackup.zip`.
Baseline: Cleardeck 8.8.20.67, 630 files. No deletions, database operations or permission changes.
Read `FAIRLEAD_GUIDE.md`, `CURRENT_BASELINE.json` and `FAIRLEAD_EVIDENCE.json`.
Check: `node VERIFY_FAIRLEAD_ALL.cjs . ../fairlead-check-evidence`.
Package: `python3 -B BUILD_RELEASE.py . --baseline /path/to/DarkSky882067-Cleardeck-FullBackup.zip --out ../new-fairlead-output`.

## Current change boundary
The verified static loader, same-origin route shield, Admiral/owner/Captain session separation, exact-vessel authorization, local drafts, existing remote operations, specialist tools and all 630 baseline files remain.
Only index.html has runtime behavior additions: a bounded in-memory timing collector, guarded observation calls, and a disclosure within the existing Engineering Systems performance section.
The collector cannot grant authority, clear storage, change a record, weaken a hash check or send telemetry.
Root runtime versions still update as required by the existing cross-file identity contract; that contract is not removed in this release.
`BUILD_RELEASE.py` runs outside the browser and produces validated artifacts without deploying them. It never auto-seals unknown modified content.
Full startup remains dependent on the same file groups; measurements precede optimization.

## Authoritative records
Nothing moves between browser and server stores in this build. Source ZIPs are not business-data backups. Existing partial encrypted recovery remains separate from full server restoration.
See the prior architecture record below for retained historical context, not current upload instructions.

## Historical architecture — do not use older upload instructions
# Cleardeck 8.8.20.67 — Current release

Current upload: `DarkSky882067-Cleardeck-Upload.zip`.
Matching full-source archive: `DarkSky882067-Cleardeck-FullBackup.zip`.
Supported baseline: the supplied Ironhaven 8.8.20.66 source (619 files).

Read `UPLOAD_THIS_ONE_BUILD.md`, `CLEARDECK_GUIDE.md`, `CURRENT_BASELINE.json`, and `CLEARDECK_EVIDENCE.json` first.
Run `node VERIFY_CLEARDECK_ALL.cjs . ../cleardeck-check-evidence` on the complete release.
This is an incremental cleanup, not a new platform or database migration.

## Architecture retained

The static verified loader, separate owner/Captain/Admiral authority contexts, exact-vessel checks, local draft stores, server operations, private-preview containment and specialist tools are retained.
This release changes account labels/error presentation, password-manager HTML metadata, current release references and repeatable verification/measurement tooling only.
No SQL, data migration, font removal, new server service, authority grant or production restore is included.

## Historical reference — NOT current upload instructions

The earlier architecture narrative below is preserved for traceability. Use the current entrypoint above for this release.

# Fleetclarity 8.8.20.64

**Upload: DarkSky882064-Fleetclarity-Upload47.zip** — **47 changed/new files** over **Fleetcare 8.8.20.63**.
Matching complete software backup: **DarkSky882064-Fleetclarity-FullBackup.zip**.

Extract the ZIP and open its one filename-matching folder. Upload every file
inside over the exact delivered Fleetcare .63 release. Replace matching names
and retain every other file. No SQL, deletion, data reset or browser-data clearing.
Reload and check Engine/Bootstrap build **8.8.20.64**, seal **fleetclarity-882064**.

Saved publication is labeled PUBLISHED without implying availability or completed
commissioning. Owner setup keeps disabled, unclaimed, invited and locally active
states distinct. Overview and Captain show individual local commissioning gates;
missing evidence remains unverified. Review opens the existing Commissioning Dock.
Existing Customers, customer-opening routes and sign workflow stay familiar.

Read **FLEETCLARITY_GUIDE.md** and **FLEETCLARITY_EVIDENCE.json** for exact verification
scope and three device checks. Software ZIPs do not export private browser jobs;
retain your editable job/request downloads. Native iPad, live inbox delivery and
physical CNC acceptance remain user checks. Preview and Sea Trial remain guarded.

---

## Historical instructions below — retained verbatim

# Fleetcare 8.8.20.63

**Upload: DarkSky882063-Fleetcare-Upload49.zip** — **49 changed/new files** over **Boardcraft 8.8.20.62**.
Matching complete software backup: **DarkSky882063-Fleetcare-FullBackup.zip**.

Extract the ZIP and open its one filename-matching folder. Upload every file
inside over the exact delivered Boardcraft .62 release. Replace matching names
and retain every other file. No SQL, deletion, data reset or browser-data clearing.
Reload and check Engine/Bootstrap build **8.8.20.63**, seal **fleetcare-882063**.

Customers opens the selected vessel's retained history and totals. Fleet status
separates identity, local setup, experience, deployment records and available
recovery tools. Local approval is not server authority; tools are not a verified
backup or restore. Attention includes a ready vessel awaiting a Captain order.
Fleet Compass returns preserve a current search/filter and useful position.
Readiness shares static reads within one run and reads fresh on the next run.

Read **FLEETCARE_GUIDE.md** and **FLEETCARE_EVIDENCE.json** for exact verification
scope and three device checks. Software ZIPs do not export private browser jobs;
retain your editable job/request downloads. Native iPad, live inbox delivery and
physical CNC acceptance remain user checks. Preview and Sea Trial remain guarded.

---

## Historical instructions below — retained verbatim

# Quartermaster 8.8.20.53 — a clearer operator workspace

Upload: **DarkSky882053-Quartermaster-Upload45.zip** — **45 changed/new files** over complete **Quartermaster 8.8.20.52**. Follow START_HERE_QUARTERMASTER_53.md and retain all other repository files.

This release gives the business-support workspace a stronger visual identity: compact navy toolbar, clear navigation and actions, a HouseHull architectural illustration, true workspace counts, direct access to Recent documents, and a smaller example section. Each business retains its own identity and saved work.

The existing guarded handlers, catalogs, quote/invoice numbers, amounts, customer PDF rendering and .52 separate-tab/download behavior are preserved. No data migration, browser-data clearing, backend action or live publication is required.

12 focused workspace checks, 11 document workflow cases and 13 PDF handoff cases passed with independent review approval. All three actual-index startup/integrity checks passed. Native .53 iPad Safari appearance remains the next device observation.

## Preserved release history — earlier instructions below are historical

# Quartermaster 8.8.20.52 — PDFs keep your workspace open

Upload: **DarkSky882052-Quartermaster-Upload44.zip** — **44 changed/new files** over complete **Quartermaster 8.8.20.51**. Follow START_HERE_QUARTERMASTER_52.md and retain all other repository files.

After Prepare PDF, choose **Open PDF in new tab** or **Download PDF**. Both PDF actions keep the original workspace tab in place. A browser that previews a requested download is directed to a separate tab. The original saved-document snapshot, filename, PDF layout and calculations are retained.

Existing parts, quotes, invoices, unique numbers, storage and Admiral session rules remain intact. There is no data migration, browser-data clearing, SQL update or live service action. JSON backup download behavior is preserved.

13 focused PDF handoff cases and 11 existing workflow scenarios passed, with independent review approval. All three actual-index startup/integrity cases passed. Native iPad Safari behavior of the new controls is not claimed as verified by the offline checks.

## Preserved release history — earlier instructions below are historical

# Quartermaster 8.8.20.51 — a clearer Admiral workspace

Upload: **DarkSky882051-Quartermaster-Upload45.zip** — **45 changed/new files** over complete **Quartermaster 8.8.20.50**. Follow START_HERE_QUARTERMASTER_51.md and retain all other repository files.

This update refines the Admiral entry and the business-support workspace. It corrects inherited command styles that made every button look alike, adds a clear selected-tab marker, gives primary actions a teal emphasis, simplifies the gate instructions and makes better use of the available screen height. Session and storage details remain available without dominating the work area.

Existing catalogs, quotes, invoices, numbers, PDFs and authority behavior are preserved. Device records remain in their original store; no reset or migration is required. Keep downloading private backup files through Business & backup.

35 presentation checks, 8 disclosure/current-identity checks and 11 existing workflow scenarios passed. Independent review approved the bounded presentation changes. The actual sealed index passed all 3 startup/integrity cases. Exact scope and limits are in QUARTERMASTER_POLISH_VALIDATION.md.

## Preserved release history — earlier instructions below are historical

# Quartermaster 8.8.20.50 — Admiral business support

Upload package: **DarkSky882050-Quartermaster-Upload54.zip** — **54 changed/new files** over complete **Harborhold 8.8.20.49**. Upload the inner files to the existing repository root, replace matching names and retain the rest. Follow START_HERE_QUARTERMASTER.md.

The Engine Room now opens a verified Admiral workspace for each business's parts and services, quotes, invoices and customer PDFs. HouseHull is operated by the person measuring and estimating. The approved document layout includes item/part references, quantities, units and prices, with a stable document number at the upper right. Finalized quotes can create separately numbered linked invoices. Business costs remain internal; existing customer journeys keep their branding and behavior.

Records are saved on this device under the verified account and selected business. The local document series is not a central production registry. Download private backups regularly; the supported compact backup size is 25 MiB. No supplier order, message, payment, ledger posting or permission change happens automatically.

The original independent reviewer accepted the scoped corrections to all five findings. Three actual-index checks passed: coherent release starts; altered runtime bytes and an altered checksum declaration both hold before execution. Full measured scope and limitations are in QUARTERMASTER_VALIDATION.md. Native iPad/Safari use of this new workflow remains a device check.

## Preserved release history — earlier instructions below are historical

# Harborhold 8.8.20.49 TEST — device save repair

Upload package: **DarkSky882049-Harborhold-Upload45-TEST.zip** — **45 changed/new files** over complete Homeward 8.8.20.48. Retain all other files.

The game uses its own durable IndexedDB save with the existing verified account/backend/environment/site scope. Legacy localStorage game saves remain intact; a validated matching copy can be migrated. Keep your downloaded JSON. No SQL, business-data clearing, live permission change or remote deployment is part of this update.

Current selected offline evidence passed; native iPad Safari acceptance is pending. See START_HERE_HARBORHOLD.md and HARBORHOLD_TEST_REPORT.md.

## Preserved history — unchanged previous document

# Homeward 8.8.20.48 TEST — recover the voyage after a timeout

Use **DarkSky882048-Homeward-Upload46-TEST.zip** over the exact **Breakwater 8.8.20.47** site. Follow START_HERE_HOMEWARD.md. Retain all other files; no SQL, browser-data clearing or live publication is part of this update.

Validated game progress now has a device recovery copy scoped to the same verified account, identity backend, configured environment and engine base path. Re-entering after an Admiral timeout or page reload recovers the mission at its safe dock. The JSON format and SAVE GAME FILE backup remain available. Private browsing, cleared website data or unavailable storage can prevent local recovery; the game must show that condition explicitly.

Current scoped checks and limitations are recorded in HOMEWARD_TEST_RESULTS.json and HOMEWARD_TEST_REPORT.md. Existing art, core mission/save rules, business logic, 15-minute idle and 60-minute maximum Admiral session limits remain intact. Native iPad acceptance and live authority certification are separate.

## Preserved previous release record

# Breakwater 8.8.20.47 TEST — current release

Current upload: **DarkSky882047-Breakwater-Upload49-TEST.zip** — **49 changed/new files** over exact Saltglass 8.8.20.46. Every previous filename is retained. Follow START_HERE_BREAKWATER.md.

This bounded follow-up adds harbor roof/gable artwork, a validated save-file preview and title-screen mission status. A pure voyage-summary helper presents existing state; mission rules, save format and movement remain unchanged.

Selected final .47 checks passed: summary 7/7, title 3/3, host preview/import/layout 8/8, roofs 8/8, three rendered views and two actual compiled-player cases, with independent source review. Historical failure and evidence limits are recorded separately; final package/extracted startup and native .47 acceptance are not claimed here. Exact current scope and evidence are in BREAKWATER_TEST_REPORT.md and BREAKWATER_TEST_RESULTS.json. Archive reconstruction and extracted boot are recorded separately after sealing. Native iPad Safari appearance and sustained performance remain a device check. Keep the downloaded voyage; no replay is required.

The user reports that Saltglass .46 runs smoothly on iPad Safari; supplied screenshots show the imported voyage at 6/6, crew home and channel reopened. This is user-reported .46 acceptance, not a native .47 result or an FPS measurement.

## Preserved Saltglass and earlier record — historical

# Saltglass 8.8.20.46 TEST — current release

Current update: **DarkSky882046-Saltglass-Upload49-TEST.zip** (49 changed/new files) over exact Dreadwater 8.8.20.45. Every previous filename is retained. Follow START_HERE_SALTGLASS.md.

This pass refines crew faces, hands and clothing; worn harbor ground and coastal edges; and lighting readability. It keeps the existing renderer, embedded artwork, mission, movement/camera, save format and fleet permissions. The user reported smooth .45 play and a received JSON download. Current .46 native iPad appearance and sustained performance remain a device check.

Current measured results are in SALTGLASS_TEST_REPORT.md and SALTGLASS_TEST_RESULTS.json. Keep the downloaded voyage; no replay is required. No database action or remote publication is performed by this ZIP.

---

## Earlier release records

The retained sections below document earlier builds. Use the Saltglass 8.8.20.46 instructions above for this update.

# Dreadwater 8.8.20.45 TEST — current release

Current update: **DarkSky882045-Dreadwater-Upload61-TEST.zip** (61 changed/new files) over exact Lanternwake 8.8.20.44, with all previous filenames retained. Follow START_HERE_DREADWATER.md.

This build introduces pinned Three.js WebGL2 rendering, eight licensed material images, skinned adult crew, detailed harbor and boat geometry, dusk water/lighting, and camera/crew clearance. The complete opaque player is SHA-256 verified and capped at 8 MiB; artwork is embedded and uses no remote runtime service. The original WebGL1 fallback and all prior game/learning content remain available. Mission/save core and fleet authority rules are preserved.

Current measured results belong in DREADWATER_TEST_REPORT.md and DREADWATER_TEST_RESULTS.json. Native iPad/Safari appearance and sustained performance need the Captain's field check. Keep the known downloaded voyage; no replay is required. No database action, live permission change or publication is performed by this ZIP.

---

# Lanternwake 8.8.20.44 TEST

The atomic loader, identity worker, opaque lazy game, .43 mission/input/save behavior and checked gameplay activity relay remain. The visual pass is confined to stormwake_gl.js and stormwake_world.js; game and host sources otherwise change only release labels and the compiled-player digest. Admiral authority, the 15-minute idle / 60-minute maximum and deliberate memory/JSON-file save boundaries remain. The self-contained WebGL 1 renderer gains presentation work without adding external runtime dependencies or image bytes from the reference clip.

All 39 retained reference models, historical named evidence, SQL and existing filenames are preserved. General documents retain their complete previous bodies below this header. The user has shown .43 rescue completion on iPad; the saved completed game is the .44 art-inspection starting point. Current instructions: START_HERE_LANTERNWAKE.md. Current evidence: LANTERNWAKE_TEST_REPORT.md. Final-source and compiled-player integration checks passed. Native .44 acceptance remains pending.

## Preserved Helmsman and earlier release record — historical, not current instructions

# Helmsman 8.8.20.43 TEST

The existing atomic loader, identity worker, lazy opaque game and deliberate memory/JSON-file saving remain. Scoped game changes fix blocked boat-pose commitment and replace arithmetic repair with fitting salvaged gear/rope/timber and a visible winch raising the bridge. The checked gameplay-activity relay preserves exact frame/channel/account and server-authority boundaries, 15-minute idle and 60-minute maximum. Other business modules change release labels only; all 39 retained references, SQL and named .42 evidence remain exact. Existing completed progress should be preserved, with manual game-file saving before refresh. Current evidence: HELMSMAN_TEST_REPORT.md. STORMWAKE_VISUAL_AND_MISSION_PLAN.md describes the future cinematic art milestone; native iPad .43 acceptance remains pending.

## Preserved Blacktide and earlier release record — historical, not current instructions

# Blacktide 8.8.20.42 TEST

The existing atomic loader, identity worker and lazy opaque game boundary remain in place. Business modules differ only in release labels. The game remains self-contained WebGL 1 with unchanged core/save schema. Material-aware batches and procedural surfaces improve the harbor; the maintained-engine migration is pending. Background holds preserve open dialogs, resize clears input without pausing, and file-state indicators distinguish current memory from prepared/loaded files. Current instructions: START_HERE_BLACKTIDE.md. Current evidence: BLACKTIDE_TEST_REPORT.md.

## Preserved earlier release documentation — historical, not current instructions

# Stormwake 8.8.20.41 TEST

Current instructions: START_HERE_STORMWAKE.md. One original 3D FUN rescue, separate Admiral access, explicit compatible game saves. Business workflows unchanged. No production, multiplayer, cloud-save or native-frame-rate certification.

## Earlier release record — historical, not current upload instructions

# Fairwind 8.8.20.40 TEST

Current instructions: START_HERE_FAIRWIND.md. FUN is a separate Admiral program, not Fleet Core. Game invitations/community remain closed. No production certification, SQL, cleanup or changed authority.

## Earlier release record — historical, not tonight’s instructions

# Woodwright architecture — 8.8.20.39

See START_HERE_WOODWRIGHT.md and WOODWRIGHT_REPAIR_NOTES.md. This is a TEST update over Wayfinder .38, not a production or native Safari certificate. No database, membership, commissioning or price changes.

## Preserved previous release documentation

# Wayfinder 8.8.20.38 TEST — Fleet Compass

Current installation instructions: **START_HERE_WAYFINDER.md**. Install only over complete Strongbox 8.8.20.37. No SQL, record cleanup, permission change or commissioning.

Search now validates the full protected source before comparing the exact selected-card set. Fleet Compass reuses project logos and the existing preview, owner, control and customer routes. Storage failures are observed separately; quota recovery is not claimed.

See WAYFINDER_REVIEW.md and WAYFINDER_TEST_RESULTS.json for scope and fresh verification limits.

---
## Preserved earlier release documentation (historical, not installation instructions)

# Strongbox 8.8.20.37 TEST — current architecture

This release changes only the archival section of `headway_contracts.js` and the backup panel in `owner.html`, plus release identifiers, instructions, and verification artifacts. `BlackFlagHeadway` remains the interface name for compatibility; new-job schemas and their strict canonicalization are unchanged.

`backup(projectId, rows)` validates supported archival types and exact-vessel rows, then emits v1 for ordinary JSON data or a typed v2 envelope for values JSON cannot preserve. v2 uses typed tuples for every value, not a magic property in arbitrary customer objects. Its exception path manifest is checked along with the payload hash. `readBackupRows` validates and decodes supported versions in memory; `rehearse` copies decoded rows into a new Map, re-encodes and compares values, and returns media/count/exception diagnostics. None of these methods accesses a database or network.

The UI retains its existing exact-owner gate before and after asynchronous reads. It downloads only after an internal rehearsal, and it clears stale diagnostic results on another attempt. Both buttons are disabled while work is unresolved. It renders diagnostic order IDs and field paths using textContent, not HTML. Files larger than the existing 100 MB check limit are explicitly held. It never imports into original IndexedDB.

Other runtime files differ only in version/seal/label strings. Helper cache queries are updated to the Strongbox identity. Authorization, new-order validations, camera/rendering logic, membership, business namespaces, and original artwork remain unchanged. The old Headway build brief remains a labeled planning document for the preserved HouseHull roadmap, not a new estimator launch.

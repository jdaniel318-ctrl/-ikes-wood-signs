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

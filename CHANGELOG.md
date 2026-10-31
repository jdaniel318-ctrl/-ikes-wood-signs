<!-- BLACKFLAG_CURRENT_RELEASE_START -->
# Black Flag Fleetbound 8.8.20.73

Wonderwake is commissioned as an active Admiral Program with accepted family-preview release Skybloom 0.10.0. A separate connected administrator transaction and independent server readback are recorded in WONDERWAKE_COMMISSION_RECEIPT.json. This software patch publishes the visible launch and dated receipt; it does not execute SQL or grant browser authority.

Read FLEETBOUND_GUIDE.md and UPLOAD_THIS_ONE_BUILD.md. Authentication, PINs, session rules and the six Core business definitions are unchanged. Admiral Program rendering now survives filtering and branding refresh. Six Wonderwake lesson candidates remain unadopted pending mission-specific review.

Engine publication and native Safari verification of this Engine patch are pending. The accepted Wonderwake game is unchanged. Full-source backups and UI rollback contain application code only.
<!-- BLACKFLAG_CURRENT_RELEASE_END -->

## Retained historical notes

# Fairlead 8.8.20.68 — Current release
Current upload: `DarkSky882068-Fairlead-Upload.zip` (also delivered as byte-identical `Fairlead68.zip`).
Matching complete source: `DarkSky882068-Fairlead-FullBackup.zip`.
Baseline: Cleardeck 8.8.20.67, 630 files. No deletions, database operations or permission changes.
Read `FAIRLEAD_GUIDE.md`, `CURRENT_BASELINE.json` and `FAIRLEAD_EVIDENCE.json`.
Check: `node VERIFY_FAIRLEAD_ALL.cjs . ../fairlead-check-evidence`.
Package: `python3 -B BUILD_RELEASE.py . --baseline /path/to/DarkSky882067-Cleardeck-FullBackup.zip --out ../new-fairlead-output`.

## Earlier releases — historical evidence only

# Cleardeck 8.8.20.67 — Current release

Current upload: `DarkSky882067-Cleardeck-Upload.zip`.
Matching full-source archive: `DarkSky882067-Cleardeck-FullBackup.zip`.
Supported baseline: the supplied Ironhaven 8.8.20.66 source (619 files).

Read `UPLOAD_THIS_ONE_BUILD.md`, `CLEARDECK_GUIDE.md`, `CURRENT_BASELINE.json`, and `CLEARDECK_EVIDENCE.json` first.
Run `node VERIFY_CLEARDECK_ALL.cjs . ../cleardeck-check-evidence` on the complete release.
This is an incremental cleanup, not a new platform or database migration.

## Historical release history below

Prior commands and results describe those historical versions, not the current candidate.

## Ironhaven 8.8.20.66 — Captain security and encrypted recovery rehearsal
- Native account-security form for an authenticated Captain even with zero current appointments; Supabase Auth controls password change and reauthentication.
- Active exact-vessel Captains can export AES-256-GCM encrypted orders/latest-Watch snapshots and verify files locally without restoring any data.
- Scope and integrity fail closed. No server migration, permission changes or customer record edits. Full cloud backup and server restore remain explicitly unverified.

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

- Introduces a bounded visual pass for warm lantern/cool blue harbor lighting, adult character proportions and clearer surface materials.
- Preserves exact .43 mission, input, save and authority behavior outside release labels and the compiled-player digest, including the Admiral 15-minute idle / 60-minute maximum.
- Keeps the user's completed .43 rescue as the starting point for inspecting .44 art; no replay is required.
- Retains all 39 historical reference models, named evidence, SQL and previous filenames; current general documents prepend this record to their unchanged historical bodies.
- Records observed final-source, compiled-player and visual checks; native iPad .44 acceptance remains pending.

## Preserved Helmsman and earlier release record — historical, not current instructions

# Helmsman 8.8.20.43 TEST

- Fixed the boat collision trap by keeping rejected turns from committing a blocked bow pose, retaining reverse escape.
- Replaced arithmetic bridge repair with mission-linked fitting of gear, rope and timber and a physical winch that raises the bridge.
- Counted validated active play toward the existing Admiral idle window while keeping the 15-minute idle / 60-minute maximum and security boundaries.
- Preserved saved/completed .42 progress, manual game-file saving, unrelated business behavior, all 39 retained references and historical evidence.
- Kept native iPad .43 acceptance pending and the cinematic art milestone as future work.

## Preserved Blacktide and earlier release record — historical, not current instructions

# Blacktide 8.8.20.42 TEST

- Added procedural harbor materials, atmospheric lighting, water detail and more shaped pirate/harbor geometry in the existing playable renderer.
- Added named salvage and six-stage mission progress, keeping the complete Broken Passage and original game.
- Preserved dialogs during background holds; resizing no longer forces a pause; corrected premature all-materials pickup text.
- Added explicit unsaved/prepared/loaded game-file status without claiming automatic persistence.
- Repaired four current-model declarations and the shared-client build default; strengthened package, real-loader and actual-index regressions.
- Kept all baseline files and historical references. Engine migration, native device performance and remaining live readiness gates are pending.

## Preserved earlier change log

# Fairwind 8.8.20.40 TEST

FUN first solo adventure and guided Chart Room; Admiral-gated sandbox, memory-only game state with small deliberate JSON export/import. First-photo suggestion handoff and matching full-frame camera presentation repaired. Other business data, authority and manufacturing holds retained.

# 8.8.20.39 — Woodwright TEST

Photo-relative fit with explicit visual-area confirmation; rendered alpha containment; one raster from live preview to review; fleet search and backup behavior retained. Production glyph certification remains open.

# 8.8.20.38 — Wayfinder TEST

- Repair both source/filtered-view and post-render card checks, including empty results.
- Snapshot queries and prevent obsolete asynchronous paint from replacing a newer view.
- Add Fleet Compass with existing logos, separate destination buttons, clear search and honest local/setup status.
- Make quota observations operation-specific and non-persistent; no silent cleanup or retry.
- Preserve Strongbox backups, Headway jobs/layout, owner boundaries and HouseHull plan.

# Strongbox 8.8.20.37 TEST

Backup-only reversible legacy values; transparent field-path report; exact-business in-memory comparison; historical business data and new-input validation unchanged. See TEST_BUILD_REPORT.md.

---

# Headway 8.8.20.36 — TEST

- Scoped, compact shared viewport adapter; deliberate navigation preserves return-to-list state and avoids input/resize resets.
- Ike header and test banner are in flow; photo/plank tasks keep their heading, full image and next action visible in tested tablet layouts.
- Explicit sample nominal size and separate wood decision in Private Preview; repeated-photo size promotion no longer grants acceptance.
- New frozen draft/approval/source/preview contract with original lineage and actual acceptance time; isolated once-only write/read-back tests. Real owner service/live submission remains held.
- Exact-owner full order export and isolated restore comparison, no database import.
- Retains Keelmark businesses, artwork, geometry and terminal commissioning contracts. No production launch, data migration or paid resources.

---
# Keelmark 8.8.20.35 — release changes

- Recheck the actual .34 full archive and supported update baselines.
- Preserve HouseHull as approved new-ship name; keep Iron Square unapproved and historical documents intact.
- Add explicit measurement/identity/durability gates and a public-safe build brief.
- Add offline strict package verification and adversarial regression tests.
- Keep existing runtime behavior unchanged except release identity and static planning link. No DB write, deployment or role change.

## Previous release history (unchanged)

# 8.8.20.34 — Chartwright TEST

- Revalidate SureFoot with unequal server/browser namespaces and all inherited tests.
- Keep runtime behavior unchanged except unique release markers and static Engine brief link.
- Correct current acceptance instructions still headed SteadyHand. Preserve historical originals below clearly marked sections.
- Add phased Iron Square plan: siding first including accessories, nails, openings and trim; roofing/foundations later; no automatic commission.
- Add archive/runtime preservation and specification-fixture verification. Combined update supports .32 and .33.
- No database writes, paid resources or permission changes; no new-ship implementation claim.

---
## 8.8.20.33 — SureFoot TEST
- Reproduced Workhorse’s owner-login bounce when server and browser namespaces differ for the same verified Project ID.
- Bound server and unchanged browser namespaces to an exact, current verified owner identity in memory; preserved expiry checks.
- Tightened user/vessel/role/active/revoked membership read validation; no server migration or permission changes.
- Added 21 actual-source owner-navigation regressions; retained Workhorse layouts and all original records/history/assets.
- No automatic retry or record rewriting. Native acceptance pending.

# 8.8.20.32 — Workhorse TEST

- Shared owner Today desk with real scoped status counts, focused work queue and persistent business navigation.
- Actionable searchable, filtered, paginated orders; exact saved order details without adding write authority.
- Missing values, conflicting approvals and local record source explicit; no fabricated paid status or production proof.
- Unit-labeled species rates, arithmetic-only length guide, correct unsaved state, once-only/frozen-in-flight existing save handler and unconfirmed-save hold.
- Compact A/B evidence overview and case-preserving wording check; every original advanced foundry control retained; evidence coverage no longer described as cutting-path proof.
- All baseline assets, SQL, geometry and auth boundaries preserved. No live write or deployment. 60 Node checks and 46 isolated Chromium scenarios passed; native Safari and hosted startup still require field acceptance.

## Previous release history — preserved

# 8.8.20.31 — SteadyHand TEST

- Shared, field-aware visible paste/validation cleanup; 139 ordinary and 44 explicitly protected input instances inventoried.
- Reproduced and repaired padded-report false failure; exact summary/count/identity and independent report-ID/content verification retained and strengthened.
- Explicit read-only recovery; no command replay; double-tap and late-sign-out regressions.
- Distinct vessel lifecycle/report freshness/ownership/operating model and two separate timestamps in Admiral details; mobile wrapping repaired.
- UI/adapter build labels aligned; historical contracts, images, SQL and all baseline filenames retained.
- 36 Node checks and 25 isolated browser scenarios passed; native/hosted acceptance remains pending. No live database writes.

## Prior release history (unchanged below)

# 8.8.20.30 — Ironbound TEST
- Added explicit saved-brief no-photo correction on Step 7, exact server read-back and hold after a lost acknowledgement.
- Preserved original draft/plan evidence and every retired operation; no automatic preparation or commissioning.
- Included the already-installed no-photo and test-activation server guards in cumulative support source.
- Reran 16 client checks and six isolated browser scenarios; additional no-photo/activation rollback tests passed.
- Real VoyageKeeper commissioning and Captain handoff remain pending native acceptance.

# Ironbound 8.8.20.29 — TEST BUILD

Commissioning now uses Fleet Core preview → server-owned preparation → one atomic commit → independent canonical read. The old operation was reconciled, not retried. Closed intended project keys are retired. Browser stores remain optional caches. No owner/Captain authority, entitlements or publication were granted. Working-ship and native field acceptance remain pending. See TEST_BUILD_REPORT.md.

## Earlier history

# Dark Sky 8.8.20.28 — Crosscheck

- Makes every recovered voyage that lacks current exact-voyage Fleet Core verification expose **VERIFY ADMIRAL & RESUME**, including the field-proven Sync Needed state where the older pending flag is absent.
- Routes that recovery authorization through the existing Admiral gate and authoritative voyage hydration path; it does not fall through to a new server save merely because the older pending flag is false.
- Keeps the recovery hold fail-closed on missing or mismatched Fleet Core evidence and preserves the local draft.
- Clarifies the recovery banner: Admiral verification re-reads the exact voyage and does not publish it.
- Preserves IronLatch disclosure behavior, commissioning stages, owner/Captain boundaries, and existing server authority contracts.

# Dark Sky 8.8.20.23 — IronLatch

Client test candidate for the recovery-details button failure in Dead Man's Chest.

- Recovery controls use replacement-style handlers; reopening or rebinding does not stack click actions. Render owns initial binding.
- View Recovery Details opens one inline panel; Close returns focus. Disclosure state and visible button text stay synchronized. No draft write or commissioning action is triggered by inspection.
- Banner, details and footer share one recovery-status derivation. A cached recovery flag or command receipt cannot manufacture current verification. Matching in-memory Fleet Core read-back and the existing sync/pending states are required for the verified display.
- Async sync-state changes repaint only recovery/status UI, retaining unfinished field input. Open details remain open during same-draft refresh.
- All 94 original deployment files are retained. No new deployment files, project removals, SQL execution, live permissions changes or publication occurred in the build process.

Upload the extracted folder's CONTENTS to the existing deployment root, including the small JSON/hash files. Do not upload the enclosing folder as a new nested website. Keep existing project/browser data.

Native iPad acceptance is still required: same VoyageKeeper draft, same Step 5; one tap opens details; Close and reopen work; all three recovery labels agree. Do not reset the draft or advance commissioning during this check.

## Inherited release notes
The older notes below are preserved history, not proof that those live workflows were rerun for IronLatch.

# 8.8.20.22 — Dead Man's Chest

- Fixes the proven forward-stage checkpoint defect at its source: Continue now actually queues the new-stage Fleet Core save.
- Requires exact voyage + intended-stage read-back before `SERVER SAFE`.
- Bounds save and read-back operations to 8 seconds each; failures terminate as `SYNC FAILED` instead of hanging.
- Repaints automatically when checkpointing reaches a terminal state.
- Preserves the verified recovery/authority behavior from TrueColors.

# 8.8.20.22 — TrueColors

- Unifies recovery banner, footer, and navigation under one Fleet Core server-safe truth.
- Removes the contradictory `RECOVERY VERIFIED` / `SERVER NOT VERIFIED` state.
- A recovered voyage cannot dismiss its recovery hold or advance while authority is ambiguous.
- Server recovery now carries explicit verification timestamp and server revision evidence.
- Preserves AnchorWatch checkpointing, HoldFast dependency recovery, and KeelLock final-byte integrity.

# 8.8.20.22 — AnchorWatch

- Fixes the proven Stage 4 indefinite `SERVER SYNCING` defect.
- Forward commissioning transitions now queue the Fleet Core voyage checkpoint.
- Background checkpoint completion repaints the UI with confirmed `SERVER SAFE` or explicit sync failure.
- Preserves HoldFast recovery reconciliation and KeelLock final-byte integrity discipline.

# 8.8.20.22 — HoldFast

- Restores Forge Plan from Fleet Core `forge_truth` when an older voyage draft lacks embedded Forge state.
- Rehydrates Offer dependencies from that recovered plan.
- Fail-safe recovery now returns to Stage 2 instead of presenting a broken Stage 3 when no Forge Plan exists.
- Corrects the visible release label to HoldFast.
- Preserves KeelLock's freeze-bytes-before-hash release-integrity discipline.

# 8.8.20.22 — KeelLock

- Anchors release work to live Fleet Core truth before build changes.
- Adds Authority Hull contract and release-blocking scope checks.
- Preserves DeadReckoning/VoyageKeeper recovery as inherited known-good behavior.
- Adds three idempotent foreign-key supporting indexes as an explicit migration.
- Makes no destructive cleanup, RLS widening, or browser-only authority change.

# 8.8.20.22 — KeelLock

- Bind the recovery checkpoint `VERIFY ADMIRAL & RESUME` control to the same scoped Admiral authorization path used by server-save authorization.
- Preserve fail-closed recovery: normal Continue stays disabled until Admiral verification and Fleet Core exact-voyage read-back succeed.
- Add this field failure to release evidence: a rendered recovery button must execute the authority handoff; rendering alone is not a pass.
- Preserve ClearBearing recovery detection, project isolation, durable voyage pointers, and server-truth boundaries.

# 8.8.20.22 — KeelLock

- Refit commissioning recovery as an inline command surface; no browser alert for Recovery Details.
- Hold forward commissioning navigation until Admiral/Fleet Core recovery verification completes.
- Clarify recovery truth: browser checkpoint, server recheck, server verified, and optional command receipt are distinct states.
- Preserve HashLock atomic loader and final-byte integrity discipline.

## 8.8.20.14 — HashLock
- Fixed finalization order so DEPLOYMENT_MANIFEST runtime hashes are generated from the exact bytes shipped.
- Added fleet regression gates for final-byte integrity and fail-closed mismatch handling.
- Preserved TruthBridge exact-voyage Fleet Core recovery and project-data safety.

# 8.8.20.14 — HashLock

- Fixes VoyageKeeper authoritative read-back: explicit Admiral restore now always hydrates the Fleet Core payload after exact-voyage identity verification.
- A newer browser timestamp can no longer suppress server restoration; it is retained only as conflict evidence.
- Exact draft-key mismatch fails closed instead of merging different voyages.
- Inspect Recovery no longer claims Fleet Core preservation before an authoritative read-back.
- SERVER VERIFIED now requires the actual server payload to be installed in the commissioning workspace.
- Read-back failure remains locked and does not overwrite browser recovery evidence.
- Adds fleet regression gates for truth labeling, exact-voyage reconciliation, and fail-closed recovery.

# 8.8.20.14 — VoyageKeeper

- Preserves focused same-tab voyage authorization from PassageLine.
- After refresh, Engine PIN remains required.
- After successful Engine authentication, Black Flag queries Fleet Core for the authenticated officer's active commissioning voyage.
- If found, the exact server voyage, safe stage, Project ID context and draft are restored automatically.
- Recovery is visibly identified inside commissioning; no duplicate voyage is created.
- If no server voyage exists, normal Engine Room behavior is unchanged.
- SERVER SAFE still requires server save plus same-voyage readback.


## 8.8.20.14 VoyageKeeper
- Recovery pointer survives Engine lock without claiming server truth.
- Engine re-entry restores an unfinished voyage into a Secure Voyage checkpoint instead of a blank commissioning form.
- Admiral recovery re-reads Fleet Core before any server-safe claim and never overwrites an authoritative voyage from a hint-only draft.
- Step 2 cannot advance without a Forge Plan.
- Commissioning stage transitions checkpoint the latest stage and mark server state syncing until read-back completes.
- Recovery and authorization use command-surface styling; red is reserved for actual failure.


## 8.8.20.22 KeelLock — release integrity repair
BlackWake field proof isolated a packaging-order defect: final runtime bytes and DEPLOYMENT_MANIFEST runtime hashes diverged. KeelLock regenerates integrity hashes from the final immutable bytes and validates the package before ZIP handoff. Runtime integrity remains fail-closed; no checksum bypass was added. Field deployment proof remains required.

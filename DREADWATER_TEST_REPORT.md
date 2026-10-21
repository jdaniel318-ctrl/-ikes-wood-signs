# Dreadwater 8.8.20.45 TEST — rendering foundation and playable graphics

**DarkSky882045-Dreadwater-Upload61-TEST.zip — 61 changed/new files.** Apply over the complete Lanternwake 8.8.20.44 release; preserve all 241 baseline filenames. Complete snapshot: 266 files. 

**Final source and compiled-player checks passed.** Final matching offline source, compiled-player20/20, host12/12 and staged visual8/8 checks only; strict archive reconstruction and extracted browser BOOT are independently recorded after sealing.

## What changed

Stormwake now includes a pinned Three.js 0.180.0 WebGL2 renderer inside its verified opaque game document, with the original StormGL/WebGL1 path retained. The graphics include original 19-bone skinned pirate characters, walking/interaction/helm poses, a shaped launch and dock, weathered material images, readable dusk lighting, softened near-lantern falloff, animated water and sky, and blended rock texture projection. Camera handling covers roof overhangs and building corners; nearby crew retain personal space without changing interaction reach.

The four CC0 Poly Haven material families contain eight original JPEG maps. Embedded JSON is **4,063,325 bytes**, below its **4,194,304-byte** cap; original compressed JPEG payload totals **3,044,280 bytes** after base64 decoding. The locally bundled Three vendor is **701,368 bytes** under MIT. Provenance and exact hashes are in STORMWAKE_ART_LICENSES.md and STORMWAKE_VENDOR.json. No runtime CDN or remote artwork request is required.

## Final measured package

| Item | Final result |
| --- | --- |
| Compiled player bytes / maximum | 4,982,493 / 8,388,608 |
| Compiled player SHA-256 | e83de03dbad1baa19e3ca1115475721b12e96ea06073ebf9ecda3b6697c1ff9e |
| Upload ZIP bytes / SHA-256 | Recorded in external qa/DREADWATER_FINAL_PACKAGE_PROOF.json after sealing |
| Upload files / complete snapshot | 61 / 266 — current matching-source snapshot |
| Exact baseline plus patch equals full | Independently checked after sealing; external package proof |
| Fresh extracted browser BOOT | Separate root verification after packaging/extraction |

## Verification and final correction

Final post-fix evidence passes the actual compiled-player suite **20/20**, host suite **12/12**, asset suite **8/8**, and all eight staged canvas views, with matching source/player hashes. Earlier iteration evidence remains separate.

A final lighthouse screenshot exposed decorative shoulder rocks above the reunited crew's feet. The world author corrected only shoulders overlapping authoritative walking surfaces into low shoals, suppressed their trees, and preserved deterministic random draws. Actual rendered-triangle samples in the new CPU regression measure rock tops below the **1.6** foot plane: approximately **0.7030** under Bootstrap and **0.7383** under the chartmaker. Crew locations, surfaces, mission state and saves remain unchanged. Final post-fix visual recapture passed all eight views at qa/visual-release/results.json; root inspected the lighthouse view and confirmed both reunited crew are fully visible. Final CPU report refresh remains PASS; current source hashes and crew rock-height regression recorded in qa/final-checks.json.

| Final check | Required evidence / result |
| --- | --- |
| Actual compiled player | 20/20 PASS; qa/player-release/results.json; final digest must match build report and host |
| Actual host access/import/isolation | 12/12 PASS; qa/host-release/results.json |
| Asset validation | 8/8 PASS |
| Core / bridge / boat / comfort | 32 / 14 / 4 / 8 PASS; qa/final-checks.json must carry refreshed matching source hashes; expected 32 / 14 / 4 / 8 |
| Portable renderer and skinned cast/world | PASS: current renderer and cast/world CPU checks; includes visible-crew rock-height regression |
| Actual canvas studies | 8/8 final post-fix views; all eight maps ready, zero GL/page/console errors and zero attempted requests; qa/visual-release/results.json |
| Final release / current models | 15 / 10 checks are rerun on fresh extracted bytes after sealing and recorded in the external package proof |
| Strict archive reconstruction and fresh extraction | Required post-seal gate; results recorded in qa/DREADWATER_FINAL_PACKAGE_PROOF.json |

The camera studies are staged views using the actual renderer and world. They include the preserved five comparison cameras, the production-derived resting-pier camera, and opposite walking poses; they are separate from the actual compiled-player/gameplay suite. Software-WebGL timings are diagnostics and do not establish iPad frame rate.

## What stays preserved

The core mission, save schema fun-stormwake-v2, 8 KiB save limit, deliberate game-file workflow, original First Light adventure, game CSS and original GL source remain byte-exact to the baseline. Unrelated business runtime changes are release labels only. Four current governance models identify .45; 39 retained reference models and prior release evidence remain exact. Existing verified Admiral entry, opaque frame, digest-before-execution, account-scoped memory, import confirmation and 15-minute idle / 60-minute maximum boundaries remain in force. No fleet permissions, accounts, database records, SQL, community invitations or cloud saves are introduced.

## Native check

Keep the downloaded voyage you already loaded. Use SAVE GAME FILE before refresh if you make further progress; no replay is required. Upload all 61 files in the matching folder, confirm DREADWATER TEST · 8.8.20.45, and load the saved voyage. Inspect the pier, water, boat, crew and workshop camera; try Balanced first and Low if movement feels heavy. Do not run SQL or clear browser data.

**Native iPad/Safari graphics and sustained performance remain PENDING.** Live fleet certification, manufacturing fit/CNC acceptance, quota recovery and production activation are NOT CLAIMED. No new device FPS or 15/60-minute native observation is asserted.

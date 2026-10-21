# Helmsman 8.8.20.43 TEST — observed verification

## Shipped changes

The launch collision repair accepts a boat turn only when its complete candidate pose is clear. The required arithmetic bridge screen is replaced by fitting the recovered gear, lashing timber with rope and holding a physical winch to raise the bridge and reopen the rescue channel. Release stops the winch; the ratchet holds work in the current page. The repair camera keeps the machinery and bridge visible beside the panel in both tested orientations.

Trusted gameplay input now counts toward the Admiral idle timer. Existing 15-minute idle and 60-minute maximum limits, account/frame/channel/visibility checks and server verification remain. Saving still verifies authority. Existing saved and completed .42 progress is preserved.

## Observed results

| Check | Result |
| --- | --- |
| Core mission/save rules | 32/32 passed |
| Boat contact/reverse regression | 4/4 passed |
| Physical repair and world geometry | 14/14 passed |
| Actual host/transport trusted activity | 11/11 passed, offline synthetic server responses |
| Full compiled player and rescue | 15/15 passed before camera-only adjustment |
| Final camera framing | 1/1 passed at 1280×820 and 768×1024; actual WebGL images inspected |
| Final compiled boat touch | 3/3 passed with real CDP touches |
| Final compiled host/save/isolation | 12/12 passed |
| Independent exact .42 save round trips | 7/7 passed, including completed rescue and legacy lessons |
| Package-verifier unit cases | 31/31 passed |
| Independent production review | No remaining Critical or Important findings |

The 15-case player run used SHA-256 `5fbcf3f8f88b363e148ab595763d08166acb2c0f5e9711f7cb211156af1a60fc`. Reversing only the final responsive camera clause reproduces those exact bytes. Input, winch, mission, saving and activity logic are unchanged. Final player: **160,324 bytes**, SHA-256 `4b83692572d37646c7be778fa813ff4f12ad6e6d1479fa83526f0f91958f5382`. Its camera, touch and host checks passed. HELMSMAN_TEST_RESULTS.json retains both scopes rather than relabeling earlier results.

The preserved historical .42 world verifier passes 6/7; one obsolete assertion expects the removed eleven-unit counterweight geometry. The new 14-case physical bridge/world verifier covers its replacement.

## Upload and fleet boundaries

**DarkSky882043-Helmsman-Upload49-TEST.zip — 49 changed/new files**, over the exact 221-file Blacktide .42 baseline, content digest `453be03c7007efec61db20b49401bb427f967f1f1fd27c7630d6e9ec577bd368`. No deletions or database action. Strict baseline-plus-update/full reconstruction, exact fresh extraction, release/model contracts and actual extracted index startup are checked after this report is sealed; results are recorded in external HELMSMAN_FINAL_PACKAGE_PROOF.json. Checksums establish byte agreement, not authenticity.

Behavior changes are scoped to the game and checked activity relay. Other business modules change release labels only. All 39 retained references, SQL and named .42 evidence remain exact. Current model declarations retain .43 identity.

## Remaining acceptance

Native iPad/Safari .43 acceptance remains **PENDING USER RETEST**. Save before refresh and preserve completed rescue progress. Partial winch work stays in the open page; completed repair saves through the unchanged v2 representation. Full reloads still require a deliberate game file. The normal out-of-focus pause is separate from sign-in.

Cinematic characters, materials, lighting and future mission rewards in STORMWAKE_VISUAL_AND_MISSION_PLAN.md remain future work. This TEST upload makes no native performance, cloud durability, live permission, quota recovery, production handoff or movie-quality graphics claim.

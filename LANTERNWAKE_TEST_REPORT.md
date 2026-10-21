# Lanternwake 8.8.20.44 TEST — observed offline verification

## What changed

The actual playable harbor now has warm lantern light against a cooler blue sky and sea, more adult character proportions, smaller facial features, shaped hands, layered clothing and distinct surface materials. Round model lighting is smoother. Island substrates stop below the paving/grass caps to remove coincident-surface striping; visible walking height stays 1.6. Clothing-panel normals face outward consistently. The reference clip supplied visual direction; its image bytes are not included.

The mission core, game input, save schema, host activity relay and Admiral 15-minute idle / 60-minute maximum retain exact Helmsman .43 behavior after reversing release labels and the compiled-player digest. The user's completed .43 rescue remains the starting point; no replay is required.

## Observed checks on final source and compiled bytes

| Check | Result |
| --- | --- |
| Core | 32/32 passed |
| Renderer | 7/7 passed |
| Render budget | 6/6 passed |
| Bridge | 14/14 passed |
| Boat | 4/4 passed |
| Smooth normals | 2/2 passed |
| Player | 15/15 passed |
| Host | 12/12 passed |
| Actual rendered art cameras | 5/5 captured without WebGL or page errors; landscape, portrait and low-quality views inspected |
| Ground separation and animation contracts | Three ground probes, finite geometry, public handles and 48 motion comparisons passed |

The player suite includes the full Broken Passage: walking, collecting repairs, operating the winch, sailing, rescuing the chartmaker and returning home. The host suite checks deliberate game-file export/import and the existing isolation rules. Final compiled player: **172,000 bytes**, SHA-256 `7bb9f57c5a0746c5519d5b0d894c03da7066f17e47c2e77f9021b533f5508ad1`. Exact observations and source hashes are in LANTERNWAKE_TEST_RESULTS.json.

The introduction uses 107 visible meshes and 86,236 triangles, within the existing 115 / 90,000 introduction budget. The repaired and completed scenes use 113 / 88,368 and 112 / 88,360 respectively. Active wake rings add geometry and can exceed that introduction budget. These counts do not certify device frame rate.

The retained historical world test has 6 passes and 1 obsolete balance-weight assertion that also fails in the exact .43 baseline after its physical-winch redesign. That test remains unchanged and is not represented as a passing suite. Current bridge tests pass. Independent source review found no Critical/Important issue; its minor clothing-normal finding was corrected before these final checks.

## Exact upload and final archive checks

**DarkSky882044-Lanternwake-Upload44-TEST.zip — 44 changed/new files**, applied over the exact 233-file Helmsman 8.8.20.43 baseline. Baseline canonical `release-content-sha256-v1` digest: `8d9edff6bc943dc36215edda00be7f0a9e349f3178d6b8f39becc6c896ab4b69`.

The final sealer stages metadata and verifies runtime/model/player hashes. Packaging then independently checks the actual base ZIP plus bounded upload against the full release, extracts a fresh copy, reruns current identity/model/bridge/boat/render checks and opens that extracted index through the offline browser. Those post-seal results are recorded separately as LANTERNWAKE_FINAL_PACKAGE_PROOF.json to avoid a self-referential archive hash. All prior filenames, 39 retained reference models, SQL and named historical evidence stay intact. General documents keep their full previous bodies after the current header.

## Remaining acceptance

Native iPad/Safari .44 appearance and sustained performance remain **PENDING USER INSPECTION**. The rendered previews are actual geometry in a staged art camera; the compiled-player suite separately exercises gameplay. This remains a stylized browser game, with further character and environment art work possible.

Follow START_HERE_LANTERNWAKE.md: SAVE GAME FILE before refresh, confirm its download, upload the update, then load the saved completed game and inspect the art. No mission replay is required. Progress remains in memory until deliberately saved to a downloaded file; there is no autosave or cloud save. No live fleet certification, database work or deployment is performed by this package.

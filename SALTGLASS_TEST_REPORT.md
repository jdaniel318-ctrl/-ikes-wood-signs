# Saltglass 8.8.20.46 TEST — measured offline results

**Final source and compiled-player checks passed.** Final matching offline source, 20 compiled-player cases validated across combined runs, host DOM/crypto/import 12/12 (child animation frames held), seven CPU suites and staged visual 8/8 checks, with root visual review. Strict archive reconstruction and extracted browser BOOT are recorded separately after sealing; native .46 acceptance remains pending. Combined evidence: 20 cases validated across the preserved interrupted original cohort (9 unchanged passing cases), 10 isolated passing retries on the reviewed capture-only revision, and 1 passing resize retry on the final native-event-wait revision. Every selected earlier case and its helper dependencies are AST-identical to the final case; the final revision adds only a bounded wait for the actual native resize event before the unchanged assertion. Every originally failed, not-completed or changed case passed a fresh retry, and both earlier resize failures are preserved. This is not a single clean 20-case execution of the final harness. Actual compiled opaque iframe/WebGL, synthetic parent/clock; same-task canvas PNGs plus real DOM bounds, not full-page UI screenshots. No native Safari/device performance claim.

## Upload and saved progress

Use **DarkSky882046-Saltglass-Upload49-TEST.zip** — **49 changed/new files** over the exact 266-file Dreadwater 8.8.20.45 baseline. The complete snapshot has 276 files. Follow START_HERE_SALTGLASS.md; retain the downloaded game JSON. The mission/save schema and movement/camera code are preserved. No replay is required.

The user reported that .45 movement and camera felt smooth on iPad Safari and confirmed a JSON download; their screenshot shows rescue complete. That is a user observation, not measured FPS or .46 acceptance. Their newest completed JSON was not supplied. The current host check uses a **synthetic completed-voyage fixture**, confirms restoration, and verifies exact exported JSON equality.

## Current checks

| Evidence | Result and scope |
|---|---|
| Actual compiled player | 20 cases validated across runs: 9 unchanged passing cases retained from the interrupted cohort, 10 isolated passes on the reviewed capture revision, and 1 isolated resize pass on the final revision; each reused case and its helper dependencies are unchanged |
| Host adapter | 12/12; deterministic DOM, native WebCrypto, synthetic account/fetch fixtures, postMessage, explicit imports and completed-voyage roundtrip; child animation frames held before child code, with real top-level host animation |
| Core / bridge / boat / comfort | 32 / 14 / 4 / 8 passing CPU cases |
| Embedded assets | 8/8; unchanged pinned input assets |
| Renderer and cast/world CPU | PASS; current source hashes and reunited-crew rock-height regression |
| Fixed camera captures | 8/8; all maps ready, no GL/page/console errors or attempted network requests |
| Visual review | Root approval bound to the final capture digest and source hashes; measured comparison budgets recorded in SALTGLASS_TEST_RESULTS.json |

The host suite fetches and validates the exact compiled HTML bytes. Its early child animation hold keeps the host DOM/crypto/import checks deterministic; rendering and gameplay are verified separately by the compiled-player and visual suites.

The original player cohort was interrupted after 9 terminal passes, 3 terminal failures and 8 cases without a terminal result. Its raw log, source snapshot, failures and interruption metadata are preserved. Whole-module AST comparison between the original and capture revisions permits only the three capture functions, one new capture helper, the module docstring and the bridge capture label to differ. A separate exact comparison between the capture and final revisions permits only bounded polling for the native resize event before its unchanged assertion. The diagnostic observed a trusted resize event after the original fixed wait; no simulation step or synthetic resize was introduced by the new wait. All original assertions remain intact, and every reused case and its helper dependencies are identical. Both earlier resize failures remain preserved. The current result combines passing evidence with explicit per-revision provenance. It does not claim a single clean 20-case execution of the amended harness. Fresh PNGs contain the actual WebGL canvas; DOM controls and viewport bounds are checked separately.


## What changed

The crew have shaped facial features, tailored clothing, hands and footwear on the existing animation rig. Both story islands have broad worn routes, muted turf, shingle transitions and steep irregular coast faces. Dusk lighting, contact shading and the existing lighthouse beam have been refined. No new external assets, renderer dependency or material-image family was introduced. SALTGLASS_ART_NOTES.md records the art scope.

## Final rendered workload

These are actual submitted renderer statistics for fixed offline views, including the modern cast and shadow behavior. They are workload comparisons, not native-device FPS measurements.

| Fixed view | Submitted triangles | Draw calls |
|---|---:|---:|
| 01-harbor-introduction | 439,676 | 82 |
| 02-lighthouse-crew-home | 457,020 | 117 |
| 03-cast-face-proportions | 439,436 | 79 |
| 04-repaired-bridge-pose | 465,104 | 153 |
| 05-harbor-portrait-low | 225,270 | 42 |
| 06-production-resting-pier | 465,260 | 129 |
| 07-cast-walk-pose-a | 439,436 | 79 |
| 08-cast-walk-pose-b | 439,436 | 79 |

Compiled player: **5,004,919 / 8,388,608 bytes**. SHA-256: `2e5a605a00d3490c2be9266f163f9f7d149aa3cf8585bfcb7fb8b0e5e368124d`. All compiler input, host, CPU and visual source hashes match this build.

## Acceptance boundaries

Native .46 iPad Safari appearance and sustained performance remain pending. The exact .45 document bodies, prior release gate and historical manifest upgrade blocks remain intact. No live account, database, server authority, service-worker, hosted deployment or production acceptance is certified here.

The bounded ZIP, exact baseline-plus-update reconstruction, extracted CPU checks and extracted BOOT are checked **after sealing**. Their proof stays outside this release in qa/SALTGLASS_FINAL_PACKAGE_PROOF.json and the external delivery verification file; this report does not claim those later outcomes in advance.

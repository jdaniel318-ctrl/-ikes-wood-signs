# Breakwater 8.8.20.47 TEST — bounded verification

Selected final .47 checks passed: summary 7/7, title 3/3, host preview/import/layout 8/8, roofs 8/8, three rendered views and two actual compiled-player cases, with independent source review. Historical failure and evidence limits are recorded separately; final package/extracted startup and native .47 acceptance are not claimed here.

Use **DarkSky882047-Breakwater-Upload49-TEST.zip** — **49 changed/new files** over exact 276-file Saltglass .46. The complete snapshot has 286 files.

## Current selected checks

| Check | Scope |
|---|---|
| voyage-summary | PASS — 7/7 CPU cases for validated mission/checkpoint summaries, legacy compatibility and immutability; tested core/helper hashes match final sources. |
| title-mission-status | PASS — 3/3 CPU cases for the actual title builder, real core state and contained title panel; tested game/core hashes match final sources. |
| retained-core-regressions | PASS — Eight selected CPU test files passed, including summary/title, existing core/bridge/boat and original FUN gates. This is the file count reported by Node, not a summed inner-case count. |
| scoped-preseal | PASS — 10 source/compiled preservation checks passed; three pending final-evidence/instruction/ledger checks were intentionally skipped and remain separate post-finalization gates. |
| actual-host-save-preview | PASS — 8/8 actual host DOM, WebCrypto, preview/cancel/confirm, completed/legacy roundtrip, short/portrait layout and boundary cases; synthetic account/fetch with child animation held. Final player/host inputs match. |
| roof-geometry | PASS — 8/8 CPU roof geometry/preservation checks. Four replacements total 4,692 triangles versus 6,944 removed, with existing camera bounds, RNG, draw buckets and unrelated scene geometry preserved. |
| selected-rendered-views | PASS — 3/3 final fixed-camera WebGL views: roof overview, normal harbor and portrait Low. All eight maps loaded without reported GL/page/console errors or attempted network; comparison and root visual review recorded. |
| renderer-cpu-prior-observation | PASS — Earlier renderer CPU assertion run was observed PASS. Supporting record is a prior-run attestation with transcript excerpts; no original full raw output or contemporaneous complete input manifest was retained. It is not a new run or GPU claim. |
| player-boot | PASS — actual WebGL harbor, articulated character and visible controls; actual compiled opaque iframe, synthetic parent/clock and software WebGL. |
| player-save | PASS — known pier-save fixture restores mission and preferences exactly; actual production camera canvas; actual compiled opaque iframe, synthetic parent/clock and software WebGL. |
| independent-source-review | PASS — Independent read-only source/spec/release-contract review: PASS, no critical or important issues. The reviewer did not execute tests or claim final package/device acceptance. |

## Visual review

- Root inspected all three actual PNGs. Overview shows visible plaster gables and timber braces beneath deep eaves, separate staggered shingle courses. Normal and portrait Low views retain crew, street, windows and lantern readability. Artwork remains stylized; character meshes and island footprints are unchanged.
- Compared submitted triangles decrease from 465,364 to 460,860 in the roof overview, 439,676 to 435,172 in the normal harbor view, and 225,270 to 223,018 in portrait Low. Draw calls remain 141, 82 and 42 respectively; these are workload counts, not FPS measurements.

## Compiled bytes and preservation

The compiled player is 5,008,354 / 8,388,608 bytes. SHA-256: `5d3d30ac9cecf1300de21368e238976b1408541576bfd5b64a34316f36dcd101`. Current evidence is bound to all compiler inputs and the host files.

All previous filenames survive. Historical reports/verifiers, the earlier release gate and retained model declarations remain preserved; the seven current document headers retain their exact previous bodies. Existing core function bodies, save schema, mission rules and movement/camera behavior are preserved while the pure voyage-summary presentation helper is added.

## Scope limits

The user reports that Saltglass .46 runs smoothly on iPad Safari; supplied screenshots show the imported voyage at 6/6, crew home and channel reopened. This is user-reported .46 acceptance, not a native .47 result or an FPS measurement.

These are the selected checks actually recorded for .47. Historical Saltglass suite totals are not fresh .47 execution. Archive reconstruction and extracted startup are checked after sealing and recorded in external delivery proof. No hosted, live account/database, service-worker or native iPad performance certification is claimed. The actual user save was not supplied; save checks use validated fixtures.

- The artwork remains stylized. This release corrects four house roofs/gables and voyage-status presentation; it does not replace the character meshes or island footprints or deliver the larger realism/asset workflow.
- Native .47 iPad Safari appearance and sustained performance remain pending. The user-reported smooth .46 experience and imported 6/6, crew-home/channel-reopened screenshots are prior-build observations, not measured FPS or .47 proof.
- Only two selected actual compiled-player cases were rerun for .47: harbor startup and known pier-save restoration. No complete mission replay or fresh all-historical-tests pass is claimed.
- The unchanged historical VERIFY_STORMWAKE_WORLD.cjs suite reported 6/7 on .47. Its balance-body exposure assertion (weights/targetWeight/chainWeight) also failed when that one case was selected on exact .46. The baseline reproduction was 0/1 selected, not a fresh seven-case baseline suite. Historical failure remains recorded; no verifier or game code was changed to turn it into a pass.
- The renderer CPU pass and historical world failure/reproduction are documented in a prior-run attestation transcribed from observed tool output. Full original raw logs and a contemporaneous all-input manifest were not retained; later hashes are labeled as later measurements.
- The boot case initially received a false QA binding result because its wrapper expected a list while the retained verifier emits an object. The browser case passed. The original false binding is retained, and the corrected receipt checks the existing result plus unchanged before/after inputs; the test and production code were unchanged and no GPU rerun was used.
- The actual completed user JSON was not supplied. Import/restore/export checks use validated synthetic fixtures. Host checks use synthetic authorization/fetch and held child animation; they do not certify live accounts, server authority, service workers or hosted deployment.
- Archive reconstruction, final sealed release checks and fresh extracted startup follow this source evidence and remain separate root gates.

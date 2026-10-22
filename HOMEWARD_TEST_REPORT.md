# Homeward 8.8.20.48 TEST — scoped verification

Upload package: **DarkSky882048-Homeward-Upload46-TEST.zip** over exact Breakwater 8.8.20.47. Retain all other files.

## Current scope

The change adds game-only local voyage recovery after an Admiral timeout and full page reload. The same verified account, identity backend, configured environment and engine base path are required before a saved voyage is exposed. Existing mission/save rules, gameplay geometry and graphics assets remain exact. The JSON backup remains portable and uses the existing format.

HOMEWARD_TEST_RESULTS.json is the current source-bound evidence record. Each selected check names its exact scope and evidence digest. Release sealing validates that current source bytes agree with that record; package reconstruction, actual extracted index boot and native-device acceptance are separately reported after sealing.

## Current verification record

The five selected unit/source suites passed **62 checks, zero failures, zero skips**: FUN core 12/12; Stormwake core 32/32; voyage summary 7/7; FUN gate 7/7; Stormwake gate 4/4. Their retained logs are named in the current evidence record when finalized.

The first 12-case recovery candidate completed 11 passes and one startup timeout in the case named “forged invalid and expired-session progress cannot modify device storage.” The timeout occurred while waiting for the game iframe during setup. A fresh-browser recheck of that same case passed. That candidate and recheck used an earlier host/test snapshot and are retained as development evidence, not substituted for final-byte verification.

Final recovery coverage: **14 distinct scenarios passed across two runs on identical production bytes.** The full run passed 13 cases and failed one case-sensitive explanation assertion in “receipt is withdrawn when another tab clears device storage with a null-key event.” Its badge, conflict state and retained voyage checks had passed; the explanation already correctly mentioned another tab. Only that test assertion changed to compare case-insensitively. A fresh-browser targeted recheck then passed 1/1. The original failing report and original harness are retained. This is not a single all-passing 14/14 run. Per-scenario provenance and product-hash agreement are recorded in qa/recovery-aggregate.json and the current evidence record.

Responsive UI layout: **1/1 selected case passed at 1024×480 and 768×1024**. Save/load/return, recovered Resume/settings, import confirmation and timeout explanation controls were measured as reachable. Root visually reviewed all six synthetic screenshots. This is UI layout evidence with held child rendering, not a game-graphics or native Safari performance test.

Recovery checks use the real host adapter, actual compiled opaque game frame, real browser localStorage and real document reload/closed-tab operations. Authentication and session expiry are synthetic. Child animation frames are held before startup. The principal completed-voyage case taps the actual Resume control and checks the 6/6 gameplay HUD and safe-dock state. This establishes the checked UI/state path; it does not claim rendered-frame performance, native Safari behavior or an additional GPU-render run.

Portable JSON saves retain the existing **fun-stormwake-v2** schema and validation. The new **stormwake-device-v1** device record wraps that validated game state with its account/backend/environment/site scope and save metadata. It contains no account credentials or business records and does not grant authority. The device copy and portable JSON remain separate: loading or exporting a JSON file does not rewrite the original downloaded file.

## Limits and preserved history

Offline browser checks use routed local files and synthetic accounts/session state. They do not log into a real account, call the live backend, certify live RLS, measure native iPad performance or prove Safari's storage retention policy. Native acceptance is PENDING. Browser storage can be cleared or unavailable; the interface must report failure rather than claim a save.

Prior Breakwater .47 evidence remains in its original files and is historical. The earlier obsolete world test assertion for weights/targetWeight/chainWeight failed in .46 and .47; no full historical-suite pass is claimed here. Current gameplay/core/world preservation is checked directly against the exact .47 baseline.

Keep the downloaded voyage. This release has no database migration, no browser-data clearing, no file deletions, no remote deployment and no new Admiral authority claim.

# Harborhold 8.8.20.49 TEST — scoped verification

Upload package: **DarkSky882049-Harborhold-Upload45-TEST.zip** over exact Homeward 8.8.20.48. Retain all other files.

## Current scope

This release repairs game persistence when the legacy localStorage quota is full. The durable game record remains isolated by verified account, configured backend/environment and engine base path. The portable fun-stormwake-v2 JSON schema is unchanged. Mission logic, movement, art and rendering are preserved; the game title has only the release banner change.

Only validated game fields enter the dedicated browser database. Existing localStorage game records are read for verified migration and left intact. No business database, account permission or server data is changed.

## Current evidence

Current selected offline evidence passed; native iPad Safari acceptance is pending.

- final-storage-suite: 18 distinct cases; Harborhold native-storage recovery through the real host and compiled player.

All HTTPS responses are fulfilled from the supplied release; external network is
aborted. Account verification and timeouts are synthetic. localStorage quota, IndexedDB and document reload are native browser operations.
Authentication/session expiry are synthetic. Race fixtures hold authority resolution or native IDB open-event delivery. No real accounts or business data are used. Child animation is held before
startup to keep this a host/state check, not a GPU or native Safari performance
claim. Each selected case launches fresh Chromium and has its own temporary
browser context and no real credentials. Browsers are closed between cases to
avoid accumulating software-renderer resources across many compiled scenes.

- quota-reload-resume: Included in the storage-suite count: native localStorage exhaustion with unrelated bytes retained, confirmed completed-voyage import into native IndexedDB, full document reload, exact recovered state, and actual Resume/HUD checkpoint assertions with animation held. This is Chromium host/state evidence, not native Safari or FPS evidence.

- source-and-core: 62 assertions across the five named current core/source verifiers; retained logs have zero failures, cancellations, skips or todos. Source gates alone do not certify storage behavior.

- exact-homeward-preservation: All 293 baseline filenames retained; 12 runtime files change only release labels, four current models and the builder only the build version. Game/art/render/legacy bytes remain exact except one visible game banner; original document history, previous gates and 39 reference models are retained. Authority predicates, activity relay and 15/60-minute limits remain exact.

- host-correction-source-review: Read-only review of the three requested corrections against the retained pre-review host, with their surrounding save, authority, queue, frame, and event handling code. Three findings resolved in source; no remaining concrete blockers. This review did not run behavioral tests or review CSS.


The complete current source bindings and exact retained evidence digests are in HARBORHOLD_TEST_RESULTS.json. The package reconstruction and extracted-index browser boot are recorded after sealing.

## Native observation and limits

The Captain’s Homeward .48 screenshot showed DEVICE SAVE UNAVAILABLE at stage 1/6. His October 20 .41 readiness report had already recorded localStorage QuotaExceededError. The .48 catch discarded the live exception, so the screenshot alone does not prove its exact native exception. Current scoped tests must demonstrate quota-pressure recovery; native iPad acceptance of .49 remains pending.

Offline browser checks use isolated synthetic identities and routed local bytes. They do not log into a real account, certify live RLS or measure native Safari performance. Keep the downloaded JSON backup.

## Preserved history

Homeward and all earlier evidence remain in their original files. Their results apply to the historical bytes, not the current release. No full historical-suite pass is claimed.

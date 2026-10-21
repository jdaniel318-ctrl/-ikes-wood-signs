# Blacktide 8.8.20.42 TEST — upload this build

This is the next playable Stormwake upgrade over the complete **8.8.20.41 Stormwake TEST** site. It is an incremental upload, not a standalone replacement site. The exact supported baseline is recorded in PATCH_CONTRACT.json.

## First three steps

1. Download and extract **DarkSky882042-Blacktide-Upload53-TEST.zip**. The ZIP and its single internal folder have the same name. The folder contains **53 files**.
2. Open the existing `jdaniel318-ctrl/-ikes-wood-signs` repository's root upload screen. Upload **all 53 files inside the extracted folder**, replacing matching names, and commit the upload together. Do not upload the containing folder or ZIP as the website. Keep the repository's other files.
3. Wait for that commit's Pages deployment to finish, reopen the usual site and confirm **BLACKTIDE TEST · 8.8.20.42**. If it shows a mixed-build hold, confirm that the whole batch finished before trying the normal reload again.

Use the existing authorized Admiral access to open FUN / Stormwake. A test result in this package does not commission a real vessel or grant a role.

## What will look and feel different

The harbor has weathered wood and stone, stronger warm/cool light, water highlights and foam, fuller roof and palm detail, and more shaped pirate clothing and hats. The mission card shows six stages and names the timber, rope and gear. The existing Broken Passage mission remains the playable objective: meet Bootstrap, repair the passage, sail out, rescue the stranded passenger and return.

Resizing clears held movement and continues play. Leaving the game pauses active movement with a reason; an unfinished dialogue or lesson stays open. A gear pickup no longer claims all three materials before you have collected them.

The outer game controls show **UNSAVED PROGRESS**, **FILE PREPARED**, or **FILE LOADED**. FILE PREPARED means a download was requested; confirm the file reached Files/downloads. Further progress returns to UNSAVED PROGRESS. Save a fresh game file before refresh or leaving if you want to keep the new progress. Existing compatible First Light and Stormwake game files remain readable.

## Fleet repair in this upload

The four current fleet-model declarations now agree with the actual current model bodies and production loader. The shared client and saved-session build label also agree with .42. Original model guards remain strict. All 39 historical reference models are retained exactly.

## Scope

This is the first playable art pass using the current self-contained renderer. A maintained-engine migration, imported rigged character art and the larger cinematic treatment remain later work. Isolated browser testing passed the full rescue, touch controls at five sizes, access/save scenarios and current boot checks. Native iPad/Safari performance and live fleet readiness still need field acceptance.

Do not run SQL. This upload requires no database action, deletions, browser-data clearing, credential change or commissioning replay. Keep private game saves and business backups off the public repository.

Technical evidence: BLACKTIDE_TEST_REPORT.md and BLACKTIDE_TEST_RESULTS.json. Earlier START_HERE files and prior test results remain historical; this file is the current instruction.

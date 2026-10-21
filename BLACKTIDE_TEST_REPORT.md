# Blacktide 8.8.20.42 TEST — observed verification

## Delivered scope

BT-1 combines an initial playable harbor art pass, more legible mission progress, less intrusive pause behavior, honest game-file state, and current fleet release-identity repairs. Source is based on all 208 exact inventoried Stormwake .41 files. Original baseline manifest/ledger hashes passed before changes.

The current game uses the existing Stormwake GL 1 / WebGL 1 renderer. The engine migration is pending. No external runtime asset, CDN, texture download, network permission or package-limit increase was added. The compiled player is **151,259 bytes**, SHA-256 `ebc0c2bc43d55a4cfbf6e38cff5696fd0d2a064db54cdb8fbe9bdd9f14a842a2`. This identical player digest was used for the gameplay, responsive, host and comfort evidence below.

## Current observed checks

| Check | Result | Scope |
| --- | --- | --- |
| Core/world/render/game-boundary/shared-client Node contracts | 8/8 test files passed | Local shipped source; includes new render and identity regressions |
| Production model loader | 10/10 cases passed | Exact production guard; rejects stale declarations, stale bodies, changed hashes, omissions, policy/seal errors and semantic authority tampering |
| Package/sealing regression suite | 31/31 cases passed | Supported baseline, strict target identity, reconstruction and tamper rejection |
| Actual index startup | 4/4 cases passed | 30 runtime files verified; all 15 scripts executed; no-service-worker branch; altered bytes and declarations held |
| Game host/access/save scenarios | 12/12 cases passed | Opaque frame, exact digest, denied/stale authority, account races, import/export, save indicator and return visibility |
| Current player behavior | 10/10 applicable scenarios passed | Eight unchanged scenarios plus two revised contract scenarios rerun separately |
| New comfort regressions | 4/4 cases passed | Resize, preserved dialogue, safe background pause and accurate pickup message |
| Touch/responsive/recovery | 8/8 cases passed | Five viewport sizes, simultaneous touch/jump/cancel, context-loss fallback and horizon rendering |

The full Broken Passage was completed through actual keyboard movement, jump, balance mechanism, boarding, sailing, passenger rescue, return sailing and finish. Player automation uses a synthetic clock and accelerates render sampling; this is behavior evidence, not a frame-rate benchmark. Pointer/touch entry additionally uses real input events and a real clock.

Responsive sizes were 1024×560, 1024×640, 1366×900, 390×700 and 430×800. Tested controls fit the viewport at a minimum 44-pixel height. Desktop arrival, desktop/mobile title, narrow gameplay and journal screenshots were visually inspected. On a narrow screen the objective panel occupies more of the distant harbor; functional controls do not overlap or clip.

## Reproductions and corrected assertions

The first current run of the unchanged player suite recorded **8 passed / 2 failed**. Both failed assertions demanded the previous behavior: a parent pause must replace the title with a Resume panel, and resizing must force a pause. Blacktide deliberately preserves the title and allows uninterrupted resizing. The two assertions were updated to verify those requirements, usable movement, input clearing, active-play blur pause and no catch-up. Both reran successfully against the same player digest. The original raw results are preserved in BLACKTIDE_TEST_RESULTS.json, not counted as a clean unchanged ten-case run.

Four new comfort cases failed on the old behavior before the repair and passed afterward. New host cases for stale file status and duplicate visible-return pause also reproduced before repair and passed in the current full host suite. The shared-client real-module test first reproduced three stale .41 identities, then passed all four cases after the one-line default update.

An initial touch screenshot timed out while several software-GPU processes competed. The unchanged touch suite then passed 8/8 sequentially. The first startup attempt correctly held an inventory that had not yet been restamped; the full sealing step corrected that metadata and the actual-index rerun passed 4/4.

## Code review and preservation

A separate whole-change review checked the actual diff, isolation and file access, pause behavior, material batching, shader compatibility, disposal, strict model policies and reference preservation. It found one important missed current identity: the shared Supabase client default remained .41 for callers that omit a build. That default is now .42, with a regression against the full module and in-memory synthetic storage. No other important regression was identified in that review.

Every original baseline filename remains. The 39 retained reference model bodies and declarations are byte-for-byte unchanged. Original artwork, all five SQL files, First Light sources/compiled game, Stormwake mission/save core, and Woodwright geometry remain exact. The business application, owner routes, shared auth module, backup helper and associated runtime modules differ only in release labels. BLACKTIDE_PRESERVATION.json records these claims with filenames and hashes.

## Graphics cost and limits

The measured scene profile increased from 96 to 106 main draws, 84 to 92 shadow draws, and 66,082 to 81,202 main triangles. Material detail adds shader work. Low quality omits extra water glints and retains the existing resolution/shadow reductions. These counts do not establish native frame times, battery use, heat or memory stability. The browser was Chrome for Testing 145.0.7632.6 with ANGLE SwiftShader software WebGL and Python Playwright 1.58.0.

All browser content was synthetic and local. Requests were blocked, except actual-index requests mapped to local release bytes. No user's account, browser storage, live database, production service, GitHub deployment or native device was accessed. The boot gate exercises the actual no-service-worker branch; real worker update behavior remains a field check.

## Remaining fleet gates

The saved .41 readiness evidence included other failures: known-calibration-replay, project-admin, fleet-truth-signal, generation-relay, proof-signer-finalizer, ike-style-b-truth and ike-face-grid-fit. This update does not claim those passed. Quota recovery, real server revocation/inactivity proof, Captain commissioning, contract activation, owner stock service and production handoff remain separate acceptance work. Historical evidence is retained without relabeling its old test counts.

## Final archive procedure

After this report is written, run SEAL_BLACKTIDE.py to regenerate exact runtime/model/lazy hashes, inventory and all three ledgers. Run VERIFY_BLACKTIDE_RELEASE.cjs and strict VERIFY_PACKAGE.py against the actual final base/update/full ZIPs. Extract the update over the supported baseline, compare all resulting bytes with the full release and rerun current model and boot checks there. The final archive result and upload count are reported with the delivered ZIP. Checksums demonstrate content agreement, not cryptographic authorship or business authority.

# Stormwake 8.8.20.41 TEST — first 3D playable verification

## Delivered scope
Black Flag: Stormwake is the FUN Admiral Program, outside Fleet Core. One authored third-person harbor and the complete Broken Passage rescue are playable: meet Bootstrap, collect three repair pieces, jump the pier, raise the counterweighted bridge, board and steer the launch, rescue the chartmaker and return to the lighthouse. The optional chart discovery is separate. No real business becomes a game.

The scene uses original low-poly geometry, articulated adventurers, idle/run/jump/landing/interaction/helm poses, a following/orbit/recenter camera, water and wake, pennants, birds, lamps, shadows, an animated bridge and a sweeping translucent beacon. The matching weights and fixed chain occupy one side of the balance; the eleven-unit load is opposite. Nearby safe-dock recovery preserves collected pieces. This is an initial stylized 3D adventure, not a claim of AAA production scale, free swimming, combat, a large open world or perfected native touch feel.

## Renderer decision and provenance
The approved design proposed Babylon.js. The available container could not retrieve its package (npm/direct download DNS failures). The implementation instead contains an original self-contained WebGL 1 renderer and packaged shaders, with no remote runtime dependency, paid asset, installed font binary or widened sandbox. This departure was disclosed during implementation. No Babylon library is bundled or claimed. The renderer and scene load only when this game opens; the business boot loads a small save-state adapter, not the 3D player.

## Access and progress boundaries
Existing Admiral account verification is retained. A fixed same-site player is fetched only after verification and must match a sealed SHA-256 digest. A stale or changed identity, corrupt mixed-release player, denied service or expired session cannot open/retain the authorized player. The frame remains sandbox="allow-scripts", with an opaque origin and no same-origin/forms/popups/download capabilities. Its CSP blocks networking. The game receives bounded fictional state, not account tokens, customer photos, ledgers or business database handles. Public static source is not DRM; future community authorization is not implemented.

The original First Light source, compiled player, six Chart Room lessons and validator remain byte-identical to Fairwind. Journal opens them in a second scripts-only frame. A new functions demonstration links a time slider, moving miniature launch and graph before practice. Lessons pause the action and do not award new rescue completion.

Legacy fun-solo-v1 saves migrate to a whitelisted fun-stormwake-v2 envelope. First Light completion, pennant and recorded lessons survive; the new rescue starts independently. Saves contain enumerated safe checkpoints, not arbitrary positions, URLs or commands. Imports require explicit confirmation and a final account recheck; invalid/unknown/oversized or business-shaped files leave the current run untouched. Exports remain deliberate small JSON files (8 KiB maximum). The original user file was privately validated and round-tripped; it is NOT included in this update or public fixtures.

Progress is in the open page's memory until explicitly exported. There is no localStorage/IndexedDB/cloud save fallback. Existing Admiral session limits are unchanged; game activity does not silently extend real authority. In-game checkpoints do not survive a refresh without a saved file. Invitations, community qualification, multiplayer and chat remain unactivated.

## Verification before packaging
| Suite group | Passed |
|---|---:|
| Current Node contracts/regressions | 290 |
| Isolated Chromium scenarios | 212 |
| Offline package-verifier unit tests | 13 |

Node breakdown: Fairwind 8; original FUN 12; original gateway 5; current release/preservation 31; Woodwright 16; Wayfinder 23; Strongbox 36; Headway 49; Workhorse 24; SteadyHand 20; Ironbound 16; Stormwake core 32; rendering math/geometry 7; scene/animation 7; gateway contracts 4.

Browser breakdown: inherited Fairwind/Ike camera 12; Woodwright 23; Wayfinder 21; Strongbox 11; original FUN 16; Headway application 16, view 13, owner 2, brief 3; SureFoot 21; Workhorse 21; SteadyHand 19; Ironbound 6. New Stormwake actual-player scenarios 10; real-clock pointer/layout/graphics scenarios 8; actual host scenarios 10. Total 184 inherited + 28 new = 212.

The complete rescue scenario uses real movement/key/interact controls through pickups, the jump, an incorrect then correct balance, boarding, steering, slow docking, rescue and final return. It does not set a completion flag or teleport the player. It uses a controlled animation clock, synthetic parent and DOM-dispatched keys/clicks, throttling draws during long simulation. Separate real-clock Chromium tests use native pointer/CDP multi-touch, including movement and jumping simultaneously, cancellation, actual graphics-context loss and the original-game recovery route. Five viewport layouts include 1024×560, 1024×640, 1366×900, 390×700 and 430×800. Resize and lost focus clear held movement and pause without catch-up. Kinematic tests verify ledge grace, jump buffering, collisions, braking, docking and recovery.

Host tests execute the shipped adapter and player with synthetic Admiral service/fetch/account boundaries, including an actual byte digest, corrupt-asset rejection, late account changes, cancelled entry, import confirmation, old/new export equivalence, denied and expired access, malformed imports and forged messages. The insecure about:blank harness supplies real SHA-256 via Python hashlib; that fixture is not a live server authorization audit. No user camera or live Supabase operation is invoked.

## Failures found and corrected / scope of tests
Feature tests first failed before the new core/renderer/gateway existed. Additional failures exposed inverted round-mesh normals, sky streaks at the horizon, a missing HUD after resuming a title-screen pause, an opaque beacon cone and physically misleading symmetric placement of the equal counterweights. These were corrected with regression checks; the final balance is two equal weights plus the chain against eleven.

Some early browser checks failed because string-based Playwright waits invoked eval under the intentional CSP, a test selected a nonexistent button ID, or software-GPU queues exceeded fixed short timeouts. The harness now uses CSP-safe function waits, actual IDs, GPU completion before captures and condition-based jump/resize observations. A combined software-GPU run was too slow; scenarios were rerun serially in fresh processes. These failed attempts remain in the working evidence and are not counted as passes. No sandbox permission or behavioral assertion was removed to accommodate them.

The base-suite result aggregator initially expected every suite to write the same JSON filename/shape. It was corrected to read their actual list/envelope results, including SteadyHand's browser-results.json and Ironbound's browser-ui-results.json. Both had already exited zero with 19 and 6 passing cases; no product change was needed. Current source-integrity checks correctly failed during release stamping and were resolved with complete resealing, not disabled assertions.

A full local HTTP startup was attempted against the actual current index.html with external service requests blocked. Navigation returned net::ERR_BLOCKED_BY_ADMINISTRATOR before application startup. That boundary was not bypassed and is NOT included in the pass counts. Isolated tests run actual shipped code and real software-rendered WebGL with explicitly synthetic service/clock boundaries. Screenshots show the actual program, not an AI concept render. GPU/software timing is not native iPad performance. No 30/60 FPS claim is made; Low/Balanced/High and reduced-motion options are available. Native iPad/iPhone Safari, actual hosting upgrade and real-device feel remain field checks.

Review is inline source/diff review plus executable checks. No independent reviewer agent was available and none is claimed.

## Preservation and package gate
All 190 Fairwind filenames are retained. Original First Light assets, business logos/images, SQL, A/B style profiles, HouseHull plan, order-backup and business logic are preserved; the entire business app.js differs only in explicit release labels. Functional integration is confined to the existing FUN parent adapter, its scoped style, the existing Admiral program card and the atomic-loader inclusion of the small save core. No new business registry entry, service entitlement, real rank, record deletion or storage cleanup is added.

The small update must reconstruct the complete release byte-for-byte over the exact Fairwind TEST .40 archive, remain at or below 85 files and have one matching outer folder with aligned timestamps. Runtime/model hashes, inventory and all three checksum ledgers must agree. The external Stormwake-882041-Package-Proof.json records final archive hashes, actual counts and the fresh extracted-archive test results; earlier version reports are preserved historical evidence, not current certification.

## Separate open business work
Site-storage quota recovery, owner-session/scroll polish, Mission Control status reconciliation, real owner-stock authorization, durable business database restoration and manufacturing glyph geometry remain separate open work. This update changes no live deployment, SQL, membership, password, entitlement, invitation or subscription. No repeat business-backup drill is requested.

## First field use
Upload the small delta over complete Fairwind .40, keep other repository files, wait for Pages deployment, and confirm STORMWAKE TEST / 8.8.20.41. BUILD & GOVERN → existing Admiral verification → OPEN STORMWAKE. Load the existing FUN game file and explicitly confirm replacement before beginning the new mission to keep the gold pennant. Enter the harbor, move with the left stick, drag the world to look, jump and interact. At the loading berth, sail straight out before turning. Save a game file before taking a break. Keep the private order backup and game saves out of GitHub; do not run SQL, reset accounts, clear Safari data or commission a game vessel.

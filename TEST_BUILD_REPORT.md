# FirstLight 8.8.20.40 TEST — verification report

## Delivered scope
FirstLight is a business-only update over complete Woodwright 8.8.20.39. The FUN game has not been implemented, launched, commissioned or connected to this package. Its first-mission content and implementation plan are separate review documents. No working-looking FUN menu item is installed.

## Repairs
First-photo analysis now owns a fresh, photo-bound result. Early UI refreshes cannot overwrite the completed species suggestion with an earlier blank snapshot. A monotonic in-memory analysis epoch prevents older callbacks, including callbacks for the same photograph after reset, from overriding current results. Optional secondary-image callbacks are bound to the original project/photo/epoch and refresh their own suggestions. Image decode, zero-sized image and detector failures end in an explicit unresolved state rather than an indefinite analyzing state or stale suggestion.

Orientation, a visual wood suggestion, a provisional size-category candidate when one exists, and a proposed lettering area are shown from the first analysis. Species rules remain the existing color/texture heuristics, not a newly trained/calibrated model. A size category remains an unverified shape-based candidate, not a physical measurement. No result automatically grants accepted species, a stock size or a price. Explicit two-foot/Cedar preview samples still produce the unchanged $18 sample price; the real owner-stock service and production/Sea Trial submission holds remain in force.

The shared photo-step live video and captured-photo review now use the same frame-height policy, centering and full-frame contain fit. Neutral margins are intentional. The camera request and capture function remain byte-identical after release-label normalization: no zoom constraint, cropped save, changed photo encoding or new hardware request was introduced. This is a display repair, not new camera measurement capability.

## Verification
Current Node suites: 233 passes total (FirstLight 20, current release 29, Woodwright fit 16, Wayfinder 23, Strongbox 36, Headway 49, Workhorse 24, SteadyHand 20, Ironbound 16). Package-verifier unit tests: 13 passed.

Isolated Chromium: 165 passed (all 156 inherited supported scenarios plus 9 new camera framing cases). New camera tests use canvas-generated video/photo frames at 16:9, 4:3 and portrait ratios across tablet, narrow tablet and phone viewports. Computed live/review contain fit, panel width/height, centering and no horizontal overflow are checked. These are not hardware-camera tests.

The unchanged Woodwright source failed 14 of the final 20 suggestion/handoff cases and all 9 camera-framing cases. The baseline still passed all 212 of its prior Node checks. The new timing tests substitute image/detector outcomes and exercise the actual extracted handoff functions; they do not prove that the detector correctly identifies the user's actual species. Existing browser suites exercise retained actual UI/fit/auth/backup handlers with synthetic boundary data.

One full local-HTTP startup attempt failed before the application loaded with net::ERR_BLOCKED_BY_ADMINISTRATOR. It was not bypassed or counted as a pass. Native Safari, actual hosted startup/upgrade and hardware camera behavior remain field checks.

## Preservation
All 174 Woodwright filenames remain. Preservation checks cover 966 untouched named app functions and release-label-only changes in the other executable files. Only five existing app functions and shared camera presentation behavior change. Images, SQL files, A/B reference geometry/profiles and HouseHull plan are byte-identical. The fit algorithm, owner/backup transport and fleet-search behavior are unchanged; their current module build labels advance where present. No real user records, memberships, prices, permissions, invitations, Supabase data or hosted deployment were changed.

## Limits and review notes
The storage-quota warning, real stock authorization, manufacturing glyph certification, actual database restore/cloud backup and cross-app session/scroll issues remain separate unresolved work. Existing local storage helpers may still have their previously documented behavior; this release does not certify the whole boot as write-free or claim quota recovery.

The first timing-test fixture mistakenly read recognition fields at the state root. That fixture mistake was corrected before the meaningful baseline-red run. Four secondary-callback cases were added during source review and exercised against both unchanged baseline and candidate. One grouped browser run exceeded the container time window after Workhorse completed; the incomplete SteadyHand run was not counted and the suite was rerun alone in full. An attempt to use a streaming execution session was unsupported; ordinary bounded runs were used instead. Review is inline source review plus automated tests; there was no independent reviewer agent.

## Final package acceptance
The external Package Proof records archive fingerprints, safe unique ZIP entries, exact delta reconstruction and the fresh tests rerun from the extracted final package. The downloaded code ZIP is not a backup of the orders on the user's iPad. Keep the existing checked private 26-record JSON and do not upload it to GitHub.

# Keelmark 8.8.20.35 — final TEST recheck

Checked: **2026-10-18T16:02:33.605721+00:00**. This is a frontend TEST package, not production launch approval.

## What changed and what stayed
The approved ship name is **HouseHull**. Iron Square remains an unapproved alternative; no existing vessel, record or namespace is renamed. The updated HouseHull plan, machine-readable plan and static Engine-linked Admiral build brief preserve the prior design direction: quote request and four-side photos, salesperson-verified measurements, openings and trim, complete siding/accessory/fastener/miscellaneous takeoff, roofing and brick/block roadmap, isolated roles, immutable quote revisions and restore proof. Existing HouseHull prototype/sea-trial runtime is preserved, not claimed as a newly completed estimator.

The **SureFoot owner-navigation repair is included**. Server vessel identity and browser storage location remain distinct and must belong to the same verified business/owner. Keelmark does not change that repair's executable logic or claim that the hosted iPad defect is already field-proven fixed. Workhorse's owner home, exact order details, search and filter return, pricing and lettering presentation are retained. All Chartwright baseline filenames, original imagery, A/B geometry and SQL history are preserved.

New shared release safeguards are an explicit readiness matrix, a baseline-specific patch contract, and a **read-only offline package verifier**. The verifier rejects missing or altered update files, mixed runtime hashes, unknown baselines, duplicate ZIP members, traversal paths, symlinks, incorrect folder naming and oversized batches. Matching hashes detect inconsistency; they are not a digital signature, authority or proof of live server security.

Current release identities and instructions consistently say **KEELMARK TEST / 8.8.20.35 / keelmark-882035**. Earlier specifically named plans and test files remain historical evidence, not current installation instructions. No old project, image, geometry or saved record is renamed by updating the release label.

## Tests executed
- **80 Node checks passed**: Workhorse 24, SteadyHand 20, Ironbound 16 and Keelmark 20. These were rerun before packaging and are run again on the actual extracted final ZIP.
- **72 isolated Chromium scenarios passed**: Workhorse 21, SureFoot 21, SteadyHand 19, Ironbound 6 and the new static brief/Engine link 5. Tests include matching and different server/local namespaces; wrong/missing/revoked membership; expiry and changed accounts; home → Orders → exact record → Back; guarded writes; report matching and no-republish recovery; commissioning no-retry; and responsive public-safe brief layout.
- **13 package-verifier unit tests passed**, including adversarial missing/mutated/unsafe archive cases, alongside the valid reconstruction control. These operate on temporary synthetic archives only.
- The new release/plan contract was first run against unchanged Chartwright and failed as expected for missing Keelmark files/identity. This is test-first evidence, not evidence of 20 live product defects.
- All changed/current JavaScript and inline-script syntax, release/runtime/model hashes, file inventory and three checksum ledgers are checked. Runtime normalized comparison requires unchanged prior behavior apart from release labels and the static planning link.

## Package contract and installation
Use **DarkSky882035-Keelmark-Upload52-TEST.zip**, one matching folder with **52 files**, over **Workhorse 8.8.20.32, SureFoot 8.8.20.33 OR Chartwright 8.8.20.34**. No intermediate upload is required. Upload every file inside the folder to the existing repository root, keep the other repository files, and commit once the upload completes. The full **133-file** ZIP is a recovery snapshot, not one browser-upload batch.

The final external **Keelmark-882035-Package-Proof.json** records SHA-256 identities and byte-exact reconstruction of the full target from each of the three known baseline archives plus the same 52-file update. No baseline file is deleted. ZIP CRC, safe members, single matching folder, aligned timestamps and upload size limits are validated. All 16 original image files and five SQL files remain byte-identical.

## First iPad acceptance — three steps
1. Upload all 52 update files to the existing site root. Keep every other file; wait for Pages deployment. **Do not run SQL or clear Safari website data.**
2. Reload the existing Ike's owner tab; confirm **KEELMARK TEST · 8.8.20.35**. Use the existing owner account only if asked. No password reset or Local Recovery.
3. Tap **Open active orders once** and send the screen. Expected: the order list for the same business, not a false sign-in bounce. A hold means stop and report the exact message; do not repeatedly sign in. No order, price, style, appointment or report edit is needed.

## Limits and server boundary
The requested live Fleet Core read was blocked by the tool safety layer; it was not bypassed or retried. **No new live database audit is claimed. No live writes, migrations, deployments, role changes, invitations, password operations, paid-resource activation or commissioning occurred.** The existing two protected commissioning operations must never be replayed.

HTTP startup was attempted and blocked with `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Browser suites therefore use actual markup/scripts/assets in isolated Chromium DOM contexts, with synthetic authentication and storage/network boundaries. They do not certify native iPad Safari, a full hosted boot or service-worker upgrade, every backend read/write path or continuous revocation. This is source self-review and automated testing, not an independent security audit. Owner Orders/Pricing remain browser-local; server sign-in does not make those records cloud-backed.

One internal results-summary helper initially assumed every suite returned a JSON object; two suites return arrays. The helper failed before summarizing results, was corrected, and all test results were then inspected and rerun. No product test failure was discarded.

## Tools and next gates
No new paid tool is necessary for this upload. The next testing improvements are an explicitly approved GitHub regression workflow and real-device Safari runs with synthetic accounts. GitHub is reported installed by plugin discovery, but repository actions were not exposed in this session; no direct push is claimed. BrowserStack remains a provider to evaluate, not an activated or purchased connection. Broader Supabase permission approval is not required to use this package.

Ike's native navigation proof comes first. HouseHull canonical identity reconciliation, direct backend isolation, deliberately approved revocation/restoration, exact-vessel exports, backup/restore and a complete measured siding job remain open gates. No "TEST" label or screenshot substitutes for them.

## Reproduce locally
From the full extracted folder, run `node VERIFY_KEELMARK.cjs .`, `node VERIFY_WORKHORSE.cjs .`, `node VERIFY_STEADYHAND.cjs .`, `node VERIFY_IRONBOUND.cjs .` and `python VERIFY_PACKAGE_TESTS.py`. The Python browser suites are `VERIFY_SUREFOOT_UI.py`, `VERIFY_WORKHORSE_UI.py`, `VERIFY_STEADYHAND_UI.py`, `VERIFY_IRONBOUND_UI.py`, and `VERIFY_KEELMARK_UI.py`; each accepts the release folder and a separate output folder. The older `VERIFY_CHARTWRIGHT*` files target the preserved .34 historical baseline, not .35 release identity.

Archive validation: `python VERIFY_PACKAGE.py --base PRIOR_FULL.zip --update DarkSky882035-Keelmark-Upload52-TEST.zip --full DarkSky882035-Keelmark-TEST.zip`. The command is read-only and never contacts a service or extracts arbitrary files.

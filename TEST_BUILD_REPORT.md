# Headway 8.8.20.36 — TEST verification and release boundaries

## Delivery
This is a behavioral update on complete Keelmark 8.8.20.35, not another renamed copy or a new fleet. It implements the approved HD-1 interfaces and shared layout changes within the explicitly allowed real-service hold. The original 133 filenames are retained. The small Upload ZIP is for repository-root upload over .35; the full snapshot is separate recovery material. Exact counts and hashes are verified in the final external Package Proof.

## Built in this release
**HW-VIEW:** shared scoped CSS and one explicit-navigation epoch adapter. New task entrances begin at the top, while intentional Back can restore list position. Input changes, resize, foreground rechecks and repaint do not repeatedly reset scrolling. Ike’s customer header and private-preview banner now occupy document flow, not the title’s space. Duplicate decorative task footer is removed from presentation; original imagery stays in the archive. Source-photo containment is tested, including the short 1024 × 640 viewport. Compact owner presentation keeps business tools and records accessible; longer histories still scroll. No “one screen” claim overrides readability or required content.

**IKE-SIZE:** photo-based shape guesses can no longer be promoted into a verified standard size merely by repeated matching photographs. Exact-plank lineage and decisions are separate from visual suggestions. Private Preview provides a sample **2 ft standard size** decision and a separate **Cedar** decision, both conspicuously labeled simulation. The current photo is bound to those inputs. Replacing the source clears them; supported display rotation preserves original lineage without silently changing the pricing category. A project change clears transient photo lineage and Headway decisions.

**REAL SERVICE HOLD:** the archive does not establish a reviewed, server-authorized owner stock/species service. Therefore actual owner acceptance and the new complete-job live/Sea Trial submission path remain disabled. Do not represent the preview fixture as the Admiral’s or Ike’s authenticated approval. An attempted real activation reports its dependency instead of accepting a local owner flag. Size decisions apply only to Ike’s. HouseHull’s strict source/scale requirements remain separate and its plan is preserved unchanged.

**IKE-JOB:** strengthens the existing artifact chain rather than adding a competing order database. The Headway draft includes the displayed app-resolution source photo, original photo lineage, rotation, exact case/spacing, style/render revision, real usable-region data, pricing basis, and separate nominal-size and species decisions. Artifact generation time and actual acceptance time are distinct. Changes to bound data invalidate approval. A complete test packet retains both source and approved composite; unknown or quota results do not invoke the historical photo-dropping fallback or create repeated put attempts.

Private Preview assembles that packet in memory and sends no order/customer message. The once-only persistence adapter is exercised in an isolated synthetic store and independently read back through the actual shared owner reader. It is **not** a new activated production endpoint. Real order persistence, private storage, migration and restore remain separately gated.

**Owner backup:** the existing exact-owner Orders view now offers a deliberate full-order JSON download and a file check that reconstructs a temporary Map in memory. Both media and metadata are included when present; missing legacy data remains missing. Wrong-vessel, duplicate, mutated and prototype-polluting input is rejected. Rehearsal never writes to the original IndexedDB. The download is sensitive customer data; keep it private and confirm it actually reached Files/Downloads. This is not a cloud backup, actual IndexedDB restore, or disaster-recovery certification.

## Verification
The current release suites are rerun before packaging; the actual extracted archive is checked again after packaging. Consolidated browser evidence and source fingerprints are in HEADWAY_TEST_RESULTS.json.

| Suite | Passing checks |
|---|---:|
| Headway pure contracts | 49 |
| Headway release/preservation contracts | 17 |
| Inherited Workhorse Node checks | 24 |
| Inherited SteadyHand Node checks | 20 |
| Inherited Ironbound Node checks | 16 |
| **Node total** | **126** |
| Actual Headway app-function / DOM integration | 16 |
| Shared viewport and task HTML/CSS | 13 |
| Actual owner backup download/rehearsal | 2 |
| Static build brief, three viewport widths | 3 |
| Inherited SureFoot owner-boundary scenarios | 21 |
| Inherited Workhorse business UI scenarios | 21 |
| Inherited SteadyHand report/input/Admiral scenarios | 19 |
| Inherited Ironbound commissioning scenarios | 6 |
| **Isolated Chromium total** | **101** |
| Offline package-verifier unit tests | 13 |

SHA-256 native and fallback results agree with Node for empty input, `abc`, longer input and Unicode. Scope/media/approval tests use synthetic records, not the user’s saved orders. The original 16 image assets, five SQL files, A/B registry/foundry and protected commissioning history remain byte-identical; runtime functions responsible for lettering geometry are not replaced by the new decision contract. Namespaces, memberships and terminal operations are not rewritten.

## Failures found and corrected, not discarded
The initial contract test ran before the helper existed. Additional tests then exposed missing approval bindings for original photo/rotation/region data and inconsistent lineage; those now pass. Actual populated short-tablet layouts initially placed the confirmation control too low. Moving distinct sample decisions below the photo corrected that without hiding them. A further image-box assertion exposed an intrinsic CSS-grid minimum that cropped the image inside its smaller card; explicit zero-minimum grid tracks fixed it. A cross-business transition test exposed retained transient original-photo lineage; the reset now clears it and Headway decisions for every project switch.

An intermediate release run correctly failed on unsealed hashes. After identity stamping, an inherited version assertion still expected .35; its target is explicitly .36 now, with every behavioral assertion retained. The entire .35-only Keelmark and .34-only Chartwright verifiers remain unchanged historical tools for those archives. They are not claimed as current-version suites. No functional failing result was silently removed.

## Limits and live state
A fresh attempt to navigate a local HTTP-served owner page returned `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Tests therefore use actual shipped source/markup/CSS in isolated Chromium documents with synthetic network, authentication and storage boundaries. The customer packet integration exercises the actual staging/acceptance functions with a synthetic renderer artifact; it does not certify actual cutting geometry or every full hosted customer transition. WebKit and native Apple Safari were not exercised.

No fresh live Supabase read was requested or claimed during this execution; earlier blocked requests were not bypassed. No live writes, migrations, role changes, invitations, password resets, deployment, automatic email, paid service or commissioning operation occurred. The original client/source artifact snapshots were inspected and used as baseline; no user's Safari database was accessed by the assistant.

This release still has pending native iPad/iPhone acceptance, a real authorized stock/species service, complete live backend isolation/revocation, actual database backup/restore and production durability. Existing Engine review metadata and historical generic write paths are preserved; “no preview order record” is not a claim that all platform diagnostic/setup metadata is write-free. HouseHull is planned, not newly commissioned.

## First field handoff
Follow START_HERE_HEADWAY.md in three focused steps. Do not run SQL, clear website data or recommission a vessel. Check owner navigation and Private Preview first; do not create a real or Sea Trial order. Preserve the full .35 recovery archive. This code ZIP does not back up the business orders stored in Safari.

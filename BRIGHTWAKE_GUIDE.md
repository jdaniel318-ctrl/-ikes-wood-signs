# Brightwake — The Lantern Isles
## Family pilot 1.0 / Black Flag 8.8.20.72

**A playable beginning, not a completed K–12 curriculum or a school-grade assessment.**
A new independent learning candidate. No existing vessel is replaced or automatically commissioned.

## Open and play
Upload the complete patch over Harbor 8.8.20.71, retaining all other files. Open Black Flag, confirm 8.8.20.72, and choose **OPEN BRIGHTWAKE**. The direct page is `brightwake.html` in the same repository root. Keep the existing website data intact.

Create a nickname (not a real name, birthday or email), choose a companion and appearance, and select separate suggested starting levels for mathematics and spelling. Choose the learner at each visit. The learning paths do not constrain appearance or the other subject.

- **Bridge Builder / Number Cove:** five-question missions, diagrams, worked feedback, help and skips. 39 generated skill sets cover selected K–12 topics from counting to algebra, geometry, trigonometry, logarithms and expected value.
- **Word Weaver / Word Garden:** 104 authored words across 13 suggested levels. Build words from tiles or type them. Optional device-local speech; no microphone or recording. If no local English voice is available, use Look & Remember or a grown-up reader. Revealing a word makes that attempt supported practice, not independent recall.
- **Letter Trails:** all 26 uppercase and 26 lowercase guides, finger/Pencil drawing and a rough path-coverage indicator. Letter practice can be recorded. This is not handwriting recognition, penmanship grading or a motor-skill assessment.
- **Make & Create:** pumpkins, holiday trees and skyships, movable shapes, colors, rotation, resizing, undo, saved editable creations, and PNG export. Creative play is always available, not purchased with correct answers.
- **Sky Sail:** touch steering, keyboard arrows or large direction buttons. Collect eight lights; clouds give gentle bumps. No lost lives, countdown, required lesson payment or academic credit.

## Multiple learners
Up to **12 local learners** on one device. Each has a distinct ID, nickname, companion, math path, spelling path, practice history, drawing-practice counts and gallery. Each gallery supports 24 creations with 60 editable pieces per creation. Changing learners clears the current activity and opens only that learner's view. Imports create a **new copy**, never overwrite an existing learner.

Grown-ups can choose starting levels, start a six-question provisional placement, view progress, export a learner, import a copy, or deliberately remove one learner after confirmation. This is a shared-family interface, not authenticated adult control or a secure school roster. Everyone with access to the device can use its learner switcher. Nicknames and the appearance chooser do not establish a person's identity or age.

## Adaptive progress: what it does and does not prove
Math and spelling progress independently. Four varied independent correct responses in the recent practice window suggest moving to the next sample skill. Repeating the same question, using a hint, retrying after an error, or revealing a spelling does not earn independent mastery credit. A later varied response after at least 24 hours can mark retained practice. Placement changes the suggested next activity; it does not award untested skills.

These are transparent **pilot heuristics**, not psychometrically validated placement, dyslexia diagnosis, grade certification or proof of long-term mastery. Four examples cannot establish complete subject mastery. Parents can change the next practice skill without changing the appearance or penalizing a learner. The prerequisite links are a sample-trail order; a full subject skill graph is not yet authored.

## Records and recovery
Brightwake uses only the IndexedDB database `blackflag.brightwake.learners.v1`, store `learners`. It does not read or modify the other Black Flag local databases, localStorage, sessions, server accounts, customer records or appointments. Save success requires transaction completion and readback. An unavailable or refused save is visible; progress remains in memory where possible so it can be exported. Do not clear website data to resolve it.

**Local saves are not cloud backup.** They do not automatically follow a child to another device. Keep periodic private learner exports. A failed save or unexpected state is a reason to stop important work and export, not keep trusting a reassuring badge. Native Safari persistence is an acceptance test still to perform.

Learner JSON files are **unencrypted** and contain progress, nicknames and creations. Keep them in private Files storage, not in GitHub, a public drive, or a screenshot. Import accepts this exact schema and curriculum version and creates an unverified copy. It cannot grant fleet authority. Export/import is portable continuity, not a production-grade independent disaster-recovery system.

## Privacy and launch boundary
No ads, purchases, learner cloud accounts, chat, public leaderboards, microphones, cameras, analytics SDK, third-party runtime download or automated learner upload is included. Optional word speech uses only a voice the browser reports as local. Static hosting may still maintain its own access logs. `noindex` is not access control; a hosted URL is not a private room.

A database namespace prevents accidental app mixing; it is not an origin-level security boundary. Other trusted JavaScript on the same website origin remains in the same browser security context. The pilot is not certified for public child registration or school use. Before public launch, complete privacy/consent and retention review, child-account policy, adult access controls, backend isolation and verified cloud/media recovery. No claim of COPPA compliance is made.

## Graphics and device support
The Lantern Isles are original procedural geometry and interface art. The existing, unchanged Three.js bundle renders WebGL where available. A software Canvas 3D renderer projects the same geometry on devices without usable WebGL, with a simple illustrated fallback if necessary. Starlit and Sunlit presentation are independent of learning level. Motion can be reduced; activity stops or pauses when the page is hidden.

Tests in this environment used the software 3D renderer in Chromium and synthetic storage. Hardware WebGL, actual Apple Pencil behavior, native Safari storage and available local voices remain device acceptance checks. Full keyboard parity and formal accessibility audit are still outstanding; do not represent this as an accessibility-certified product.

## Expand without rewriting the fleet
Keep learning content in `brightwake_curriculum.js`, generators/adaptive rules in `brightwake_core.js`, storage in `brightwake_store.js`, world rendering in `brightwake_scene.js`, flight mechanics in `brightwake_play.js`, and interaction in `brightwake_app.js`. Add reviewed skill sets and word bands with stable IDs, examples, explanations, an independent answer oracle and content-review status. Do not silently reinterpret older skill IDs or learner records.

A future curriculum revision needs explicit migration/export compatibility tests. New subjects need separate progress paths. A future parent/account/cloud system requires a deliberately approved server schema and exact-family/learner authorization; this client pilot does not create it. Preserve the six Fleet Core businesses, Stormwake and existing vessel appointments.

## Reference framework, not an endorsement or complete alignment
- Virginia Department of Education mathematics framework, 2023 standards: https://www.doe.virginia.gov/teaching-learning-assessment/k-12-standards-instruction/mathematics
- High-school geometry reference: https://www.thecorestandards.org/Math/Content/HSG/
- IES practice guide, Organizing Instruction and Study to Improve Student Learning: https://ies.ed.gov/ncee/wwc/PracticeGuide/1
- Device-local speech semantics: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService
- Public-child-product privacy review reference: https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions

The questions, hints, activities and artwork are original to this pilot. Lexia, Imagine Math and ABCya were inspiration discussed by the family; no affiliation, copied courseware or branded characters are included.

# Wonderwake — First Light 0.1.0

An original Black Flag learning-ship preview: an animated illustrated island, short mathematics and spelling expeditions, letter drawing, creative construction and a gentle movement game. The art is original animated Canvas illustration with depth and day/night lighting, not a photorealistic 3D engine. This is runnable software, not a concept slideshow.

## Install as a new ship

Read **START_HERE.txt**. Use a **new `wonderwake` repository**, not the existing Harbor / `-ikes-wood-signs` repository. Its `index.html` is Wonderwake's entrypoint, not a replacement for Black Flag's Engine.

Upload the files inside the ZIP's single folder to the new repository root. Enable GitHub Pages using **main / (root)**. There is no build step and no external library, texture or font to install. A regular static HTTPS server also works. For desktop development, use `python -m http.server` in this folder; do not rely on mobile Files previews to execute a website.

The code does not register a service worker, access the fleet database, commission a vessel, alter memberships, invoke fleet APIs or read fleet storage. Existing fleet files and source archives are untouched. Separate project paths on one GitHub hostname are not separate browser security origins; for production child accounts use a deliberately designed origin, authorization and privacy model. The separate repository prevents replacing Harbor’s sealed source files and gives this draft an independent entrypoint. Harbor .71’s root worker is identity-only (no fetch handler); an older assets/sw.js has a navigation handler and is not the active root worker. Separate hosting here is an intentional deployment boundary, not a claim of production tenant isolation.

## Playable now

- **Skybridge:** 30 math seed skills, from counting to algebra, geometry, elementary trigonometric ratios, probability and sequences. Generated choices and accepting equivalent numeric fractions.
- **Wordforge:** 120 original practice words in 12 banks; word clues, browser speech, movable letter selection, keyboard entry and explicit guided practice.
- **Letter Trails:** 26 uppercase stroke trails and 26 lowercase visual guides. Finger/Pencil/mouse drawing with image export; no automated handwriting grading. Traces are temporary until exported.
- **Maker Grove:** pumpkin, celebration tree and robot; place, drag, resize, rotate, recolor, mirror, remove shapes and export a picture. Always available without paying with correct answers.
- **Star Glider:** pointer/keyboard movement and target-number collection. No timer, lives, penalties or mastery credit. Pause and reduced-motion controls.
- **Learning map and grown-up corner:** separate starting challenges, transparent practice indicators, day/starlight styles and trailblazer/star-princess/robot characters. Presentation does not depend on academic level.

## Progress rules

Default starting points are early skills. Three **different, unaided** correct items at the current skill raise that subject's provisional challenge level by one; not a certified grade. Repeated or hinted answers cannot do so. Wrong answers get help, and a subsequent correction is guided practice. Math and spelling never advance one another.

A 'steady' practice indicator needs at least five distinct independent successes across at least two UTC calendar dates and an overall correct rate of at least 80%. This is a simple transparent heuristic, not a validated psychometric mastery model. Earlier attempted skills become eligible for a later review. Choosing a later starting point does not credit the skipped skills. See CURRICULUM_AND_SAFETY.md for coverage and expansion limits.

## Local storage and continuity

Up to 24 separate local learners, including three anonymous starter slots: Starling, Comet and Aurora. Add learners from the learner picker, choose a short nickname and avatar, and rename them in Grown-ups. Nicknames never serve as database keys. Each learner owns separate math/spelling readiness, practice evidence, art and settings. The picker opens on each page load. No real name, birthdate, email, password or child voice recording is required. Storage uses only `blackflag_wonderwake_local_v1`, with separate records per slot. A save is successful only after the transaction completes and independent readback matches. Read failures do not overwrite existing records with an empty profile. Failed writes remain explicit and the current in-memory work can be exported.

Exports use SHA-256 over canonical JSON to detect accidental damage. The checksum is not a digital signature or encryption. Imports are bounded, schema-checked, reject another vessel, and require the matching explorer plus confirmation before replacement. Other explorers are not replaced. Verified files for new UUID learners can be imported as separate learners; existing IDs require matching the current learner before replacement. Unsaved in-page changes are retained when switching learners and remain explicitly marked unsaved. Use one active game tab per device; simultaneous editing of one learner across tabs is not supported. Local profiles and grown-up controls are NOT access-control boundaries on a shared device.

No application analytics, ads, open chat, purchases, third-party scripts or cloud progress uploads are included. The static host may keep ordinary access logs. Spoken text uses the device/browser speech service, preferring local English voices; voice availability and offline behavior are not guaranteed. No microphone or camera permission is requested. Only original canvas art and system typography are used.

## Verification

The matching source/evidence ZIP contains reproducible Node tests, browser fixture tests, screenshots, a development plan and the verification report. Node tests use real WebCrypto for progress checksums. Browser checks load the actual shipped DOM, scripts and delegated event handlers with explicit synthetic IndexedDB responses and a SHA-256 bridge, because navigation to localhost/file/fixture hosts is blocked in the build environment. They are NOT a hosted deployment or native Safari test.

Native Safari, Apple Pencil behavior, actual quota conditions, offline audio and real IndexedDB across device restarts remain acceptance checks. There is no promise of full offline installation, cloud backup, grade completion, formal educational accreditation or measured learning gains.

## Independent vessel contract

The included vessel JSON is a design/installation descriptor only. It grants no permissions, registers no production vessel and changes no Fleet Core membership. Harbor 8.8.20.71 remains the existing application baseline.

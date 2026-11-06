# Longwatch implementation plan

Goal: give the Captain five additional minutes of inactivity during the authenticated Engine private preview, so screenshot-led testing can continue.

Scope and decision: preview warning moves from 120000 to 420000 ms, and reset from 150000 to 450000 ms. The 30000 ms Continue warning remains. Live and Sea Trial retain the idle-v1 timings because their server sessions expire after three minutes. Engine and owner authentication are unchanged. Per-vessel administration remains a separate pending feature.

Architecture: retain the existing customer controller and one-use Engine launch. Use mode-specific warning and expiry constants consistently for scheduling, Continue, and late activity. Listen in the capture phase so editor input events that stop bubbling still count as activity. Keep expiry and fresh-customer cleanup intact.

Tech stack: existing static JavaScript; Node VM with a deterministic clock and real customer flow/core modules for offline regression checks.

- [x] Reproduce the 150-second reset, verify the new expectation fails on .92.
- [x] Apply the timing policy and editor activity listener change in countercraft_customer.js.
- [x] Test exact warning/reset boundaries, Continue, activity, stopped editor input, background return, early finish, clean reset, and unchanged live/trial expiry. Update the existing browser timeout scenario to the new expectation.
- [x] Prepare .93 Longwatch against the exact .92 source archive; run the release suite and independent review; package upload, full source backup and rollback.

Review focus: invalid preview launches cannot extend customer sessions; background clock jumps still expire; Continue at the deadline cannot resurrect data; activity inside the editor is observed; each new preview starts with a clean customer flow.

User authorization: November 6 request to fix the timeout now, plus earlier request to add five minutes. No deployment requested. Existing ZIP workflow uses an isolated extracted source tree rather than Git.


Verification: 18 deterministic timeout checks pass. 38 listed offline suites pass after the reviewed fixes. Baseline reproduction failed eight intended preview/activity expectations. Review reproduced expired target input repopulating fresh state; three added tests failed, then passed with session-epoch guards. Fixture modules now execute in the same VM realm; startup must render without an error and bind input handlers.

Review rulings: the legacy browser fixture launch version was stale, so it now reads CountercraftConfig.build. Its timeout expectation was updated, but no native browser result is claimed. The exact iPad test remains pending. Auth launch validation, live backend enforcement, receipt/review flows and physical machining are not certified by the new offline fixture. Existing scope/auth suites remain part of the full release checks.

Release method: retain the established ZIP workflow and isolated source directory; no Git branch, merge, deployment or database mutation. BUILD_RELEASE.py independently verifies the sealed final tree, patch reconstruction and rollback before issuing archives.

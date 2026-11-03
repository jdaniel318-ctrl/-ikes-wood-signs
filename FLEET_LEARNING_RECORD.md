# Fleet Learning Record

This record turns the Captain's field observations into release checks. A check is marked verified only when its evidence exists. Browser simulation is not a physical iPad or live-service certificate.

| Field observation | Lesson | Repeatable check | Status |
|---|---|---|---|
| Clearway Next/Back scrolled the same long form | Navigation must change the task, not merely the scroll position | Only the current step is visible; Back retains answers; missing board blocks Next | Verified in synthetic Harborlight browser checks |
| A kiosk can serve customers at several locations | Device and location are owner-controlled, and each customer needs a clean session | Exact scope, customer A/B, idle, refresh, old tab, late response | Verified in synthetic Harborlight browser checks |
| Test routes and Test Access appear separately | Testing belongs in the Engine; test convenience is not authorization | One Test Center; public test URLs and stale bypass state denied | Verified in synthetic Harborlight browser checks |
| Mail needed manual recipient entry; ZIP reached Spam | A shared kiosk must hand off to the private owner inbox; Mail is a personal-device fallback | No kiosk Mail/download controls; receipt only after complete stored request | Verified through real UI, service and isolated PostgreSQL; live activation pending |
| Paste still causes trouble on the iPad | Desktop checks cannot certify native input behavior | Native Safari paste/caret check | Pending physical iPad |
| VCarve unavailable | Artwork export is not machining proof | Open exact approved SVG/DXF in VCarve and verify dimensions | Deferred by Captain |

New practice for this build: review the customer/owner/Engine boundaries before implementation, then test the failure reported in the field before fixing it. The accompanying interactive explanation uses the newly adopted visualization skill.

A delayed-response test exposed old retry controls after timeout. Harborlight now fences both successful and rejected async results by customer session; the test failed before the fix and passes after it.

Final review lesson: privacy must follow the server-confirmed session kind, not a URL label. Upgrades must also retire sessions created under the old policy. Both cases now have failing-before/passing-after regression checks in VERIFY_HARBORLIGHT_REVIEW.cjs.

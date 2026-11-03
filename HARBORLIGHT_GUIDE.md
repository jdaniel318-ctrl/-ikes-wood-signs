# Harborlight 8.8.20.87

This build separates customer work, Ike’s workspace and Engine testing. It reuses Countercraft; it does not add a second backend or a paid delivery service.

## What changed

- Personal-device sign requests show one task at a time: board, design, details, review, Mail. Back keeps the entered work. Required content is checked before moving forward.
- Shared shop stations use Countercraft’s guided intake and protected owner inbox. They do not use customer email, downloads or private-device recovery controls. Only a complete stored request produces a shop receipt.
- A station warns after two minutes of inactivity and clears customer-readable work after another 30 seconds. Customers can also choose Finish session. Late replies cannot restore a departed customer’s screen. The service enforces a three-minute renewable idle limit and four-hour maximum session.
- Ike selects an exact location in the shop workspace. Locations have separate devices, publications and requests. Customer links cannot choose an arbitrary backend. Location selection itself never grants owner authority.
- Fleet Test Center combines private preview, controlled trials, structural checks and field learning records. The old Test Access PIN bypass is retired. Old customer preview links direct testers to the Engine. Tests are opened from the authenticated Engine, with a one-use local navigation ticket; protected data still requires server authorization.
- Field records keep build, vessel, location, result and next action. Use synthetic observations without customer names. Records stay on that browser until exported.

## First test after uploading

1. Confirm **8.8.20.87 · HARBORLIGHT** in the Engine.
2. Open Ike’s **Test Center** from the Engine. Choose **Open Private Preview**.
3. Add a synthetic plank photo, type sample wording, go Back, then forward. Check that there is one task per screen and the wording remains.
4. Choose **Finish session**. Start again and confirm the photo, wording and contact fields are empty. Also leave a preview idle through the warning and verify the reset.
5. Return to the Engine and record Passed, Failed or Blocked with a short observation. Native iPad paste remains a separate required field test.

Preview is memory-only and does not submit a job. No email or VCarve is needed for this test. Opening another test requires the Engine again.

## Shared shop activation is a separate step

The existing Countercraft backend was found active at the read-only audit. There was no Ike publication configured. This release contains a required privacy upgrade **as source only**; uploading the website does not apply it.

During a quiet maintenance window, a backend administrator must apply `HARBORLIGHT_SESSION_HARDENING.sql` to the existing install and deploy the updated `countercraft_service.mjs` through the existing Countercraft function entry. The migration ends active customer sessions and legacy review sessions, retains saved jobs, enrolled devices, owner roles and recovery keys, and replaces the gateway with idle expiry support. It is tested against the Clearway schema. The updated kiosk refuses an older service that does not report `idle-v1`. New installations use the complete `COUNTERCRAFT_INTAKE.sql` instead.

Then, from Engine, use a saved outpost and the existing preview/approval gate to start a controlled trial. Sign in as Ike’s authorized owner. That session opens the shop inbox in the exact trial location; there is no customer-facing test switch. Configure real shop information explicitly, enroll the browser and choose End owner session & open customer mode. Sign-out must be verified before handoff. Live publication also requires existing vessel activation; this build does not change it.

For multiple locations, sign in to the ordinary shop inbox and enter a stable location code such as `shop-main` or `market-van`. Ordinary owner entry uses live scope; Engine trials use a separate trial scope. Each location needs its own publication and enrollment. Pending recovery copies stay scoped to their originating device/location. Do not clear Safari data to update the app.

A web app cannot lock iPad system controls, other apps or the OS photo library. Before unattended kiosk use, configure the device’s kiosk restrictions, use a dedicated device account, remove unrelated personal files, and finish native camera, paste, keyboard, idle/background and old-tab checks with Ike. These physical checks are pending.

## Software rollback

The supplied rollback restores Clearway website files only. It does not undo the database migration or restore business data. If the privacy migration has already been applied, keep customer stations closed after a frontend rollback: Clearway does not renew the new short idle sessions. Reopen stations only with a compatible, verified frontend. Saved requests and owner access remain subject to the existing backend controls.

## Delivery, cost and limits

Personal-device Mail remains free and available. The OS share sheet may leave To and Subject blank. The confirmed address is **ikeswoodsigns.orders@yahoo.com**. Handing a ZIP to Mail does not prove sending, delivery or Inbox placement. The spam and attachment-download problem remains a known delivery limitation. It is not part of shared kiosk intake.

No new paid provider was added or purchased. Existing backend quotas and availability still apply; this is not a promise of unlimited free hosting. A GitHub Pages-only page cannot privately synchronize multi-site customer submissions without some receiving system. We reuse the fleet’s existing service for that role. Browser-only Preview and the personal-device Mail fallback remain available.

## Evidence and remaining checks

Current evidence is summarized in `HARBORLIGHT_EVIDENCE.json` and `FLEET_LEARNING_RECORD.md`. Synthetic tests cover the real renderer, service, PostgreSQL gateway, encrypted drafts, session expiry, complete receipts, exact proof retention, location isolation, old tabs and delayed replies. They do not certify the deployed service or a physical iPad.

Still pending: backend upgrade and owner configuration; native Safari paste/camera/keyboard and dedicated-device privacy; live network/site acceptance; VCarve import and machining checks. No production, outgoing email or machine action was performed.

Resources applied: GOV.UK question pages (one task per page), OWASP Session Management (server expiry plus client warning), W3C Web Share (OS-selected targets), Supabase Auth sessions and function authentication. Links are in `HARBORLIGHT_PLAN.md`.

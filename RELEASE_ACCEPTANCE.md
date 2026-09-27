# 8.8.17.19 HelmDeck — acceptance

This is a client test release, not a completed working-ship handoff.

## Native iPad acceptance still required

1. Confirm Engine reports 8.8.17.19 · HELMDECK after the complete upload finishes.
2. Reopen the existing accepted Captain Station route and sign in with the appointed test account if asked. Do not repeat acceptance for an accepted appointment.
3. Verify the empty Orders state, Watch fields and Publish button fit together in landscape, while Access & scope expands and collapses normally.
4. Verify readable input targeting with the keyboard open, rotation, and longer content. Normal scrolling is expected at reduced height and with many records.
5. Before any order change or publication, confirm the exact project and staging state. The layout test itself requires no business mutation.
6. Continue the previously planned live Watch, order, cross-vessel-denial, revocation and isolated-restore tests separately.

## Failure handling

Do not clear website data. Do not repeatedly press Accept or Publish after an unconfirmed result. Recheck Station reads the saved appointment only. Report a recovery screen without issuing new authority or departing a vessel.

## Retained prior acceptance reference

# 8.8.17.18 Quarterdeck acceptance

## Automated evidence

Isolated Chromium tests execute the full shipped Captain and shared Supabase-transport modules with original HTML/styles. Server/account/storage replies are fixtures. They reproduce the prior delayed-initialization defect, exercise the candidate's PIN/account path and exact-vessel preview/results, and verify layouts without touching live data. Package/body integrity tests are separate from operating proof. The external Quarterdeck verification report records the final extracted-ZIP results.

## Native iPad acceptance (not yet completed)

1. Confirm 8.8.17.18 · QUARTERDECK after a successful test deployment.
2. Open Build & Govern after the page has been idle longer than one second. Authenticate normally.
3. Select Delegate. Confirm the initial form appears, task tabs work and the Preview Appointment control fits the normal landscape screen.
4. Verify navigation back to Govern, session-details expansion, and reports/recovery tools. Do not delete storage or issue lifecycle commands during this display check.
5. Later, use a separate account controlled by the Captain for a read-only appointment preview before any actual appointment is authorized.

## Still separate

Browser workspace timing is not a server-wide token-expiry guarantee. A model PASS is not an operating acceptance. Actual cross-vessel denial, revocation, independent-device record durability, restore, a complete customer/operator workflow, accepted Captain appointment and Admiral observation must be demonstrated before the working-ship milestone is certified. Five existing warning conditions remain unresolved by this repair.

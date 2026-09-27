# Dark Sky 8.8.17.18 — Quarterdeck

Test-site repair candidate based on HarborMaster. **Not a promotion, working-ship certification, live publication, or new server migration.**

## What changed

- The delegation station mounts when the real Admiral deck is created, including a deck opened long after startup. Installation is idempotent and does not depend on a 300 ms timer.
- The initial appointment form uses the available width. A compact header retains readiness, account receipt, session details, Lock, End Session and Return. Expanded readiness stays in Govern; reports, recovery and presentation tools remain available in a clearly labelled expandable section.
- **Appoint Captain**, **Appointments & History**, and **Departure Review** are distinct task views with keyboard-operable tabs. Narrow screens and open keyboards keep normal scrolling; no CSS scaling or pinch-zoom disablement is used.
- Explicit loading, unavailable and retry states replace the obsolete Delegation Future placeholder. Missing data is not represented as an empty successful history.
- Changing a vessel, candidate, intent or proof reference invalidates the corresponding preview. Duplicate write taps are contained. Pending responses are discarded when the workspace is locked or its session ends.
- Issue/revoke/departure results remain visible while independent list readback runs. An unconfirmed result is not announced as verified or automatically replayed.
- Departure is separate from appointment and requires a preview, explicit evidence-review acknowledgment and a confirmation. A typed reference alone is not proof of a working ship, and a lifecycle change does not publish its customer site.

## Protected scope

All 85 existing deployed paths are retained. The owner/Vessel Captain station, core code, ledger transaction/correction logic, artwork, session-transport enforcement and both SQL reference files are unchanged except current release labels where applicable. Both Admiral gates and the bounded recent-account reuse policy remain.

**No live database, membership, appointment, order, ledger, entitlement or lifecycle command was executed for this build. No SQL is required for upload. Do not clear website data.** Existing server migrations are historical prerequisites, not newly verified operating proof. The warned historical ledger SQL must not be executed as a shortcut.

## Deployment — first three steps

1. Extract `DarkSky881718-Quarterdeck.zip`.
2. Open its single matching `DarkSky881718-Quarterdeck` folder.
3. Upload the **85 files inside** to the existing test repository root. Do not upload the enclosing folder or the ZIP.

Wait for the Pages deployment to succeed, open its deployment link, and verify **8.8.17.18 · QUARTERDECK**. Do not disable checksum checks to work around a mixed upload.

## First acceptance check

Open Build & Govern, authenticate normally, then select Delegate. The initial **Appoint Captain** form should be visible without the old Future placeholder. On a landscape iPad, check that the vessel picker, email, intent and Preview Appointment action fit in the initial view. **Stop before issuing or departing.**

Live account/server testing, actual iPad Safari keyboard geometry, independent-device persistence, isolated restore, live revocation denial and the completed working-ship handoff remain separate acceptance work. The five existing readiness warning conditions are not cleared by this UI repair.

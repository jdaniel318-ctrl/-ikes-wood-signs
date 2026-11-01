# Countercraft · 8.8.20.77

Ike’s customer-to-owner Sea Trial candidate. The shop iPad guides a customer from their plank photograph to exact lettering, contact details, approval and a verified request receipt. Ike’s signed-in Shop inbox retains the complete proof and revision history through review, changes, production and pickup.

## What is included

- Four-step customer flow with in-page camera, retake/reference photos, board rotation, existing Carvewright layout/artwork tools, exact wording and a final full-request review.
- Published species rates and individual rack codes; unknown prices remain unconfirmed. Selecting a plank is not a reservation; the owner sees conflicts with another open request.
- Private, complete intake: a request is received only after every media file is verified and the database commits one job. An uncertain response uses Check result and the same operation identifier.
- Owner search/status queue, frozen revision proofs, contact corrections, proposed amendments, in-person customer approval, production checks, pickup, decline and cancellation reasons.
- Nonexportable device enrollment key; encrypted originating-iPad checkpoints; explicit owner recovery/resume; no automatic resubmission. Confirmed jobs work across signed-in owner devices.
- A single-use phone receipt link, generated locally as a QR code. It is read-only and expires; the customer does not need a phone to finish.
- Bounded shop backup parts including media and history, checksum verification and isolated restore rehearsal. A rehearsal never overwrites the live shop. Source ZIPs are not business-data backups.

## Current release boundary

This is **Sea Trial, synthetic requests only**. The new intake has not been approved for real customers or machining. Ike’s Preview and Sea Trial welcome now has one primary Design my sign entry; existing personal-device package tools sit under Other sign tools. Existing deployed routes retain their gates. The new journey reuses the unchanged Ike photo-evidence kernels and the governed A/B production references; requested A/B matching requires a new customer-approved proof. Countercraft does not silently replace governed A/B lettering with a reference font. Its geometry and export files remain design references until Ike completes the physical production review.

`countercraft_config.js` pins the site, backend, staging environment, deployment `countercraft-pilot-1` and Sea Trial mode. A client edit cannot grant project ownership. Owner actions require a current server session and exact unrevoked `project_owner` membership for Ike. Admiral/Captain authority is not accepted as an alias.

The customer UI cannot reveal owner account controls. Every shop start and in-person review handoff waits for updated peer tabs to acknowledge server sign-out and blanks private surfaces. Browser lifetime locks remove crashed peer records while suspended or failed peers still block entry. Delayed sign-in/refresh responses are revoked before handoff is acknowledged; new owner tabs are covered while the customer session is active. **It is not a browser-profile boundary.** Old unpatched tabs, browser history/downloads, native Safari restoration and other same-origin application stores still require the dedicated shop-device field check. Use synthetic data and keep the iPad with Ike until that check passes. Do not treat a green automated test as privacy acceptance.

## Installation and backend

**Backend setup is pending.** The Supabase migration confirmation expired twice; a final read-only check found no Countercraft tables or gateway. The Edge Function has not been deployed. The preview is available, but the Shop inbox and enrolled-iPad submission trial require this setup first. No existing business records or memberships were changed.

Upload archives have one top-level folder. Copy that folder’s contents into the existing site root using the established full-upload procedure. Keep the full source backup and exact .76 rollback ZIP. Do not delete existing business data or clear Safari storage as an upgrade step.

The static ZIP does **not** apply SQL or deploy an Edge Function. `RELEASE_CONFIG.json.backend_prerequisite` records the actual prerequisite status for this artifact. If not applied, deploy the additive `COUNTERCRAFT_INTAKE.sql` once, then deploy `countercraft_edge.ts` as function `countercraft`, `verify_jwt=false`, including the local imports listed in `COUNTERCRAFT_EDGE_FILES.json`. The function performs owner JWT/session verification and scoped customer-capability verification itself; the service key stays in Supabase environment variables. Never put a service key in a browser file.

The private storage bucket is `countercraft-private`; no anonymous list/read/write policy is introduced. Recovery private keys remain only in private server tables. Rotation retains older key versions. Do not delete old keys while any retained encrypted draft could need them.

Rollback restores .76 static files and leaves the additive private Countercraft records available for a later repair/export. Do not drop new tables, old key versions or bucket objects as a frontend rollback.

## Three field checks

1. **Make a synthetic request on the iPad.** Sign in through Ike’s owner entrance → Shop inbox → Shop iPad & prices. Publish a trial rate/plank, enroll the browser, close other fleet tabs, then use “End owner session & open customer mode.” Photograph a test plank, type distinctive wording, position it, review, and send. Check the verified receipt, scan the optional phone QR, then Next customer. Back/history/reload and another open tab must not reveal the preceding customer or privileged workspace.
2. **Complete Ike’s handoff.** Sign in again → Shop inbox. Confirm the photograph, exact wording, price and proof. Propose one price/design change, review it with the synthetic customer on the iPad, then sign in and complete material/price/geometry checks. Move through production, ready for pickup and collected. Confirm the old proof and approval remain in history.
3. **Interrupt and recover.** With a second synthetic request, interrupt the network while submitting. Use Check result first; confirm at most one job. Reopen owner access → protected drafts on this iPad; reconcile or explicitly resume with the customer. Download the backup index and every numbered part; select the complete set in Rehearse a backup. Verify it on the second owner device. Confirmed jobs travel; unfinished draft recovery remains on the originating iPad.

For an unconfirmed owner update, Check update result first. “Close unconfirmed attempt” installs a server tombstone so a late write cannot apply. For expired incomplete uploads, the explicit cleanup action removes only media unreferenced by saved revisions after 24 hours; committed job assets remain.

## Verification and limits

`node VERIFY_COUNTERCRAFT_ALL.cjs <external-evidence-directory>` runs production core, real PGlite/PostgreSQL gateway, service, WebCrypto, flow, privacy and owner operation tests. Install `@electric-sql/pglite@0.5.14` outside this release and set `COUNTERCRAFT_PGLITE` to its module path. The synthetic image fixture uses Python with Pillow and PyMuPDF; `CODEX_PRIMARY_RUNTIME_PYTHON` selects that interpreter. No test uses real customer data.

`node VERIFY_RELEASE_ALL.cjs . <external-evidence-directory>` runs the existing fleet regression groups. Tests do not prove real Safari camera behavior, iOS keyboard layout, native IndexedDB key persistence, QR scanning, authenticated live Auth/Storage integration or physical machining.

Managed browser QA was blocked by its HTTP-only preview URL: the existing design engine requires secure-context WebCrypto. No browser security setting or identifier generation was weakened to work around it. The secure-link failure state is explicit instead of an empty screen.

Limits: 3 normalized JPEG photos at 1 MiB each; proof PNG 2 MiB; complete submission 8 MiB; 32 encrypted recovery rows / 64 MiB per exact scope; 100 confirmed jobs and 200 customer sessions per publication per day. No recovery row is silently evicted. Phone transfer is one use within 15 minutes; the receipt session lasts at most one hour. Device enrollment revocation blocks further submissions.

## Fleet lessons carried forward

Carvewright supplies the vector design, artwork, proof and portable design package. Wonderwake informs the blank beginning, clear next step and calm completion. HouseHull/TradeWinds inform honest saved-state messages, exact revisions, receipt reconciliation and explicit device/cloud boundaries. Each business retains its own authority and data.

Review fixes: publication changes close the stale submission before fresh approval; confirmed receipts release their device recovery rows; repeated Next customer taps are serialized; exports require current recorded customer consent and include the canonical job identity, revision and price. Bounded backup rehearsal covers 102 MiB of media and more than 16 MiB of job history. History and media are saved in separate numbered files. Native shared-device acceptance remains pending.

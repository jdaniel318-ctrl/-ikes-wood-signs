# Dark Sky 8.8.20.30 — Ironbound TEST BUILD

**Use this ZIP instead of the earlier 8.8.20.29 Ironbound ZIP. Upload the extracted folder's contents, not its enclosing folder, to the existing site root.**

Server support is already installed on Fleet Core. Do not execute the bundled historical SQL or retry an old operation.

## Three field steps
1. Upload this complete release and confirm **8.8.20.30**.
2. Restore **VoyageKeeper Recovery Test** through Admiral authorization. At Step 7, tap **APPLY SAVED BRIEF: NO PHOTO** and wait for **SERVER PREVIEW READY**. This fixes the persisted contradiction without changing the voyage or replaying its retired operation.
3. Tap **PREPARE NEW OPERATION**, review the fresh operation and Project ID, then tap **COMMISSION ONCE**. Send the resulting proof screen. An uncertain result requires **RECONCILE EXISTING OPERATION**, never a repeated command.

Operation `2d7fc23f-180d-4d61-ae22-f241d096cde5` and key `bf-p-42be92cbac12` remain closed/retired. A new operation is deliberately prepared from the same persisted voyage. Nothing automatically commissions, retries, appoints a Captain, grants membership or publishes a business.

After verified commissioning: Admiral → Delegate → select the exact new Project ID → preview the chosen Captain's appointment. Candidate acceptance and own-vessel/other-vessel denial testing remain separate gates. The user remains Captain until the agreed working-ship commissioning and Captain-handoff proof is demonstrated.

See **TEST_BUILD_REPORT.md** and **IRONBOUND_TEST_EVIDENCE.json** for current measurements, server timestamps, retained warnings and pending native acceptance.

## Maintainer checks
`node --test VERIFY_IRONBOUND.cjs` runs 16 offline checks.
`python VERIFY_IRONBOUND_UI.py .` runs six isolated Chromium DOM scenarios with mocked RPC responses. It requires Playwright, BeautifulSoup and Chromium; it makes no live Fleet Core request.
`VERIFY_IRONBOUND.sql` is an optional synthetic rollback-only server test. It never targets a real commissioning operation. The cumulative server support source remains in `SUPABASE_IRONBOUND_882029.sql` because its protocol and installed migration lineage began in that release; it is not an instruction to rerun it.

## Preserved release history — not current acceptance

# Dark Sky 8.8.20.29 — Ironbound TEST BUILD

**Upload the extracted folder's contents to the existing deployment root. Preserve existing browser/project data. This is not a production-ready or completed Captain-handoff release.**

The live server support has already been installed on Black Flag Fleet Core. Do not execute inherited SQL scripts or rerun old commissioning commands as part of the upload.

## First field check — three steps
1. Upload this release's complete contents, including the manifest, seal, inventory and checksum files. Confirm the site identifies **8.8.20.29 Ironbound TEST**.
2. Use the existing Admiral authorization and restore **VoyageKeeper Recovery Test**. Keep the saved draft. The old operation should read **VERIFIED NOT CREATED**, not Submitted. Do not reset or replay it.
3. At Step 7, tap **PREPARE NEW OPERATION** once. Check the vessel name and newly assigned Project ID/operation, then tap **COMMISSION ONCE** once. Stop on **VERIFIED CREATED / VESSEL + BLUEPRINT**, or on a reconciliation hold. Preserve the screenshot or use **EXPORT VERIFIED RECEIPT**.

An unconfirmed response is not failure proof. Use **RECONCILE EXISTING OPERATION**; never repeat the command. Closing, restoring, refreshing, signing in or reconnecting does not auto-retry commissioning.

## What changed
Crosscheck recorded receipts but never called a server vessel-creating operation. It used browser IndexedDB as commissioning authority and could stop at a quota error. Ironbound makes Fleet Core the writer: an explicit preparation freezes the saved draft; a separate single-send command atomically creates the canonical vessel, durable blueprint and bound receipt. A separate read must verify them before success is shown. The browser registry is only a best-effort display cache after verification.

## Next gate after verified commissioning
Admiral → Delegate → select the exact new Project ID. Choose the Captain before previewing an appointment. Appointment acceptance must be followed by an own-vessel access test and rejection of another vessel's URL/project key under that Captain account. This build does not invent a Captain, grant global Captain authority, send an invitation, activate a vessel or publish a customer site.

The new vessel's lifecycle starts at **commissioning**. Saved requested features are retained in its blueprint; entitlement, ownership, agreement and live-publication decisions remain separate. A commissioned identity is not yet a proven working-ship handoff.

See **TEST_BUILD_REPORT.md** and **IRONBOUND_TEST_EVIDENCE.json** for measured scope and remaining field acceptance.

## Reproducible maintainer checks
`node VERIFY_IRONBOUND.cjs .` runs offline coordinator and actual-handler contract regressions.
`VERIFY_IRONBOUND.sql` runs a synthetic rollback-only server smoke suite after the migration; it never targets real operation IDs.
`python VERIFY_IRONBOUND_UI.py .` runs isolated Chromium DOM integration using Playwright and BeautifulSoup, with mocked RPC responses. It is not a substitute for native Safari or the hosted loader. Set `CHROMIUM_PATH` when Chromium is not on PATH. Test outputs go to a temporary directory unless a second output-directory argument is supplied.

## Preserved release history — not current acceptance evidence
All original Crosscheck filenames and existing vessel assets are retained. Earlier statements below describe earlier releases only; they do not override this build's pending field acceptance.

# Dark Sky 8.8.20.28 — Crosscheck

Client test candidate for the recovery-details button failure in Dead Man's Chest.

- Recovery controls use replacement-style handlers; reopening or rebinding does not stack click actions. Render owns initial binding.
- View Recovery Details opens one inline panel; Close returns focus. Disclosure state and visible button text stay synchronized. No draft write or commissioning action is triggered by inspection.
- Banner, details and footer share one recovery-status derivation. A cached recovery flag or command receipt cannot manufacture current verification. Matching in-memory Fleet Core read-back and the existing sync/pending states are required for the verified display.
- Async sync-state changes repaint only recovery/status UI, retaining unfinished field input. Open details remain open during same-draft refresh.
- All 94 original deployment files are retained. No new deployment files, project removals, SQL execution, live permissions changes or publication occurred in the build process.

Upload the extracted folder's CONTENTS to the existing deployment root, including the small JSON/hash files. Do not upload the enclosing folder as a new nested website. Keep existing project/browser data.

Native iPad acceptance is still required: same VoyageKeeper draft, same Step 5; one tap opens details; Close and reopen work; all three recovery labels agree. Do not reset the draft or advance commissioning during this check.

## Inherited release notes
The older notes below are preserved history, not proof that those live workflows were rerun for IronLatch.

# Dark Sky 8.8.20.22 — Dead Man's Chest

KeelLock converts live Fleet Core inspection into enforceable authority-hull doctrine. It preserves DeadReckoning recovery behavior, adds explicit RPC/scope regression gates, and ships a non-destructive supporting-index migration. No RLS widening or authority shortcut is introduced.

# Dark Sky 8.8.20.22 — KeelLock

KeelLock hardens VoyageKeeper recovery into a native Black Flag command surface. Recovered voyages now show one explicit next action, block forward navigation until Fleet Core is re-read, and expose recovery evidence inline instead of through browser alerts.

Browser/session storage remains a cache. Fleet Core remains the durable commissioning authority.

## 8.8.20.22 KeelLock
- Replaces the commissioning Recovery Inspector browser alert with an inline Black Flag evidence panel.
- Makes the pending recovery state explicit: one security step remains, then the voyage resumes.
- Disables ordinary Continue while a recovered voyage still requires Admiral/Fleet Core re-verification.
- Treats a missing prior command receipt as informational when authoritative Fleet Core read-back is already verified.
- Preserves HashLock final-byte runtime verification, strict project isolation, and fail-closed release behavior.
- No vessel data, authority assignments, production status, or project boundaries are manufactured by this release.

# Dark Sky 8.8.20.14 — HashLock

VoyageKeeper preserves PassageLine's focused Admiral authorization and adds server-authoritative commissioning recovery after the required Engine PIN. If Fleet Core holds an unfinished voyage, successful Engine re-entry resumes that exact voyage and displays its recovery banner instead of silently landing at generic Engine home.

Browser/session storage remains a cache. Fleet Core remains the durable commissioning authority.


## 8.8.20.14 VoyageKeeper
- Recovery pointer survives Engine lock without claiming server truth.
- Engine re-entry restores an unfinished voyage into a Secure Voyage checkpoint instead of a blank commissioning form.
- Admiral recovery re-reads Fleet Core before any server-safe claim and never overwrites an authoritative voyage from a hint-only draft.
- Step 2 cannot advance without a Forge Plan.
- Commissioning stage transitions checkpoint the latest stage and mark server state syncing until read-back completes.
- Recovery and authorization use command-surface styling; red is reserved for actual failure.


## 8.8.20.22 KeelLock — release integrity repair
BlackWake field proof isolated a packaging-order defect: final runtime bytes and DEPLOYMENT_MANIFEST runtime hashes diverged. KeelLock regenerates integrity hashes from the final immutable bytes and validates the package before ZIP handoff. Runtime integrity remains fail-closed; no checksum bypass was added. Field deployment proof remains required.

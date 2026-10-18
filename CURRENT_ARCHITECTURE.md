# Current patch: 8.8.20.33 SureFoot TEST
Owner navigation uses a document-bound proof of the authenticated exact-project owner. The local storage namespace and server vessel namespace are independently retained; string equality between the two is not an authorization requirement. Current account, exact project/vessel/user, owner role, active/non-revoked membership at verification, and session expiry remain required. No RLS or database write in this release.

---
## Prior architecture notes (retained)
# Workhorse 8.8.20.32 — current owner-workspace layer

`business_deck.js` and `business_deck.css` provide presentation for the authenticated exact-project owner portal. `owner.html` retains its existing authentication, storage and explicit save handlers. New order details are read-only; the existing local order store is not converted to cloud storage. Helper access does not grant server permissions. Pricing saves delegate only after an explicit click; they do not modify saved order prices. Advanced lettering controls and all production geometry remain original.

The Engine verifies the new runtime assets through its existing runtime-integrity manifest. Standalone owner startup checks the matching helper/input version and stylesheet load error before displaying the new workspace. No new runtime package dependency or live endpoint is introduced.

## Preserved prior architecture

# Current delta: SteadyHand 8.8.20.31 TEST

The inherited Ironbound server-first commissioning protocol and actual database authority contracts are unchanged. A new input_hygiene.js module is hash-verified and executed before Engine form code; owner.html loads that same versioned helper before its Captain handlers. Standalone Captain startup fails closed if the helper's release does not match.

Field cleanup is opt-in for reviewed ordinary controls; passwords, PINs, production wording, raw/readonly content and unknown fields are preserved. Report confirmation uses exact canonical payload agreement plus a separate read of the same report. Admiral lifecycle, report age, ownership and operating model are separate presentation facts. No stored record, membership or server function is migrated by this release.

# Current test architecture — 8.8.20.30
Fleet Core is commissioning authority. Server-first protocol v1, introduced in 8.8.20.29, persists a saved voyage, freezes a distinct prepared operation, atomically writes vessel/blueprint/audit/receipt and requires independent canonical read-back. The browser is only a best-effort presentation cache. Automatic retry remains forbidden.

Step 7 now handles the actual preserved no-photo contradiction by an explicit, evidence-preserving correction followed by an exact server read. No correction runs on load; missing acknowledgement holds preparation. A database trigger blocks activation of test-commissioned vessels until a separately reviewed production path exists.

Captain appointment/acceptance/isolation and signed commissioning agreement remain separate. Existing Admiral/owner/Captain auth paths, branding, data and reports are retained. SQL filenames preserve their original lineage; do not execute retained historical SQL on deployment.

## Prior architecture notes
# Ironbound 8.8.20.29 — TEST BUILD

Commissioning now uses Fleet Core preview → server-owned preparation → one atomic commit → independent canonical read. The old operation was reconciled, not retried. Closed intended project keys are retired. Browser stores remain optional caches. No owner/Captain authority, entitlements or publication were granted. Working-ship and native field acceptance remain pending. See TEST_BUILD_REPORT.md.

## Earlier history

# Current release — Crosscheck 8.8.20.28

The recovery repair is a presentation/binding change inside the existing commissioning workspace. `commissionRecoveryTruth` supplies the banner, inspector and footer. Its same-voyage check is display evidence, not an authorization grant. Existing Admiral gate, hydration/save/receipt RPCs, pending-recovery continuation hold, project commissioning, data stores, ledger and project boundaries are unchanged.

Recovery status changes update only the dedicated recovery slot and footer status; they never capture editable fields. The existing authoritative hydration function still governs replacing a draft following successful read-back. This patch does not create a new backend, publish a vessel, appoint a Captain, or claim a production handoff.

## Preserved prior architecture notes

# Current Architecture — VoyageKeeper 8.8.20.14

Commissioning durability uses the live VoyageGuard Fleet Core tables/RPCs. Browser/session state is a cache and recovery aid, not server truth. VoyageKeeper adds a same-tab bridge to the existing Admiral PIN + authenticated account workspace so the commissioning document can obtain its own valid authenticated session before calling VoyageGuard RPCs.

A successful Admiral gate does not itself commission a vessel. Server-safe status still requires save + readback of the same voyage. Commissioning remains separately gated by Review/Prove and the canonical commissioning RPC.


## 8.8.20.22 KeelLock — release integrity repair
BlackWake field proof isolated a packaging-order defect: final runtime bytes and DEPLOYMENT_MANIFEST runtime hashes diverged. KeelLock regenerates integrity hashes from the final immutable bytes and validates the package before ZIP handoff. Runtime integrity remains fail-closed; no checksum bypass was added. Field deployment proof remains required.

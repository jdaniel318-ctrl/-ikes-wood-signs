# Ironbound 8.8.20.30 — TEST BUILD verification

## Current deliverable
This release replaces the earlier 8.8.20.29 test ZIP. It is derived from the uploaded Crosscheck 8.8.20.28 through Ironbound 8.8.20.29. All 94 Crosscheck filenames and every visual asset are retained. The complete package has 100 files; no project, ledger history, logo or feature was removed to reduce the file count.

## Old operation: reconciled, not replayed
Fleet Core read-back at **2026-10-05 01:29:51 UTC** confirmed operation `2d7fc23f-180d-4d61-ae22-f241d096cde5`, intended Project ID `bf-p-42be92cbac12`, as **verified_not_created**, with `operation_closed=true` and `retry_forbidden=true`. The intended key has zero canonical vessels. The fleet still has six vessels. No real VoyageKeeper commissioning command was issued during this verification.

## Additional blocker removed
The real persisted VoyageKeeper brief says “No photo required,” while its saved `photoRequired` and Forge Plan flag both remained true. The server correctly holds that contradiction. Step 7 now exposes **APPLY SAVED BRIEF: NO PHOTO** rather than leaving the user to discover the mismatch in another stage. Only an explicit tap applies the correction. It preserves the voyage and retired operation identifiers, retains the original plan as evidence, saves the corrected draft, and checks the two corrected flags in the exact server read-back. It neither prepares nor commits a vessel.

A lost correction read-back leaves preparation disabled and requests an authenticated restoration. No success is inferred from a cache or unconfirmed write. Test-commissioned vessels are also prevented from becoming active by the installed server guard. This does not grant any membership, entitlement, contract approval or publication.

## Fresh tests
The current Node suite passed **16/16** tests. The four new regressions were observed failing on 8.8.20.29 before this patch. The 12 inherited server-first coordinator regressions were rerun and passed.

The actual Step-7 functions, handlers, markup and CSS passed **six isolated Chromium scenarios** using simulated RPC responses: successful commissioning despite cache quota failure, lost commit response, lost canonical read-back, lost preparation response, explicit no-photo correction through successful commissioning, and lost correction read-back. The last scenario sends no preparation or commit. The other mutation-loss scenarios use explicit reconciliation, never replay. No uncaught page errors were observed. Success proof panels were checked at 1024 × 768 and 390 × 844 without horizontal overflow.

A fresh server rollback test passed at **2026-10-05 01:32:43 UTC**: a no-photo brief with conflicting true flags is rejected even when the client's conflicts array is empty; rejection creates no receipt; explicit correction reads back; new preparation creates no vessel; one synthetic commission produces independently verified vessel/blueprint proof with the corrected photo flag; production activation is blocked; membership and entitlement counts remain zero. All synthetic fixture rows were rolled back. The earlier operation-bound, duplicate-delivery, cross-actor and immutable-receipt SQL tests remain documented below as prior evidence, not newly invented runs.

## Acceptance still pending
Real VoyageKeeper commissioning in native iPad Safari, full hosted boot/authentication, Captain appointment and acceptance, exact-vessel isolation under the chosen Captain account, operational workflows, signed agreement and live publication remain unverified. This ZIP is a **TEST BUILD**, not a completed working-ship handoff. No Captain was appointed and no email or invitation was sent.

The complete hosted loader was not executed. Its runtime hashes, model hashes, JavaScript syntax, retained assets, archive contents, checksums and CRC are validated at packaging. The isolated browser harness is not a native Safari or full-site test.

## Next three field steps
1. Upload the contents of **DarkSky882030-Ironbound-TEST** to the existing deployment root and confirm **8.8.20.30**. Preserve existing browser data. Server support is already installed; do not run the historical SQL files.
2. Use the existing Admiral security path to restore the same VoyageKeeper draft, open Step 7 and tap **APPLY SAVED BRIEF: NO PHOTO**. Wait for **SERVER PREVIEW READY**. The old operation remains closed.
3. Tap **PREPARE NEW OPERATION**, review the new operation and Project ID, then tap **COMMISSION ONCE**. Stop at the resulting proof or reconciliation hold; do not submit again after an uncertain response.

## Security review scope
The last advisor scan retained 11 informational RLS-without-policy findings, 61 authenticated SECURITY DEFINER review warnings, and disabled leaked-password protection. These were not hidden by widening policies. The new endpoints enforce current Admiral authority plus exact actor/voyage/operation scope and deny anonymous execution. These findings do not constitute a full security certification.

## Prior 8.8.20.29 report — historical evidence

# Ironbound 8.8.20.29 — test-build verification

## Delivered scope
Full Crosscheck-derived static-site test ZIP, with all 94 baseline filenames retained. Server-side support was installed and checked separately. Nothing automatically commissions or retries on load.

## Live truth
Operation `2d7fc23f-180d-4d61-ae22-f241d096cde5` / Project ID `bf-p-42be92cbac12` was reconciled on Fleet Core at **2026-10-05 00:51:25 UTC** as **verified_not_created**, with `operation_closed=true` and `retry_forbidden=true`. No commissioning command was issued for that operation. A postflight read at **01:16:40 UTC** still found zero vessels for that key and six total vessels. Fleet-vessel, global-authority and membership row fingerprints match their predeployment values. All 20 public tables still have RLS enabled; no fixture accounts remain.

## Defect repaired
The Crosscheck commission handler wrote the local browser registry and reported receipt states; it did not invoke a server vessel-creating handler. A browser quota failure could therefore leave a Submitted receipt without a canonical vessel. The repaired handler never treats a browser registry read as server commissioning proof.

Preparation creates a new server-owned operation and immutable project key from the persisted voyage. The following deliberate command creates the canonical vessel, durable blueprint and bound receipt in one transaction. A separate read verifies the exact voyage, operation, project, namespace, audit binding and blueprint before displaying success. Quota errors in the optional display cache cannot change that server proof.

## Tests run
The offline Node suite passed **12/12** tests. It includes the actual app handler's server-first routing, independent read-back, duplicate taps, lost responses, tuple mismatches, missing blueprint, recovered prepared commands and the no-retry rule.

The deployed SQL functions passed synthetic rollback tests covering preparation, separate new identities, atomic commit, independent proof, duplicate-delivery safety, immutable and closed operations, retired keys, frozen drafts, late saves, unauthorized actors and no implicit authority/feature grants. The fixture records were rolled back. This is **not** a claim that the real VoyageKeeper vessel has commissioned.

Four isolated Chromium DOM scenarios passed using actual Step-7 functions, handlers, markup and CSS with simulated RPC responses: success under cache quota failure, lost commit response, lost read-back, and lost preparation response. Each prepared once; the first three committed once and the fourth did not commit. Recovery used explicit reconciliation, not replay. Proof-panel checks found no horizontal overflow at **1024 × 768** and **390 × 844**. No uncaught page errors were observed in these scenarios. This does not validate the complete hosted app, authentication flow or Safari.

## Remaining acceptance — do not promote yet
Native iPad/Safari commissioning of the real saved VoyageKeeper draft remains the next field check. The full hosted loader/service-worker flow was not executed here: local HTTP navigation was blocked by the execution environment. Final runtime hashes, JavaScript syntax, JSON inventory and ZIP CRCs are checked independently during packaging.

A verified private commission is only the next foundation. Captain appointment, candidate acceptance, exact-vessel isolation, operational work, signed agreement and production publication remain separate gates. No Captain or owner was appointed, no invitation was sent, and no vessel was activated or published during this build.

## Security advisor findings retained for review
The scan reported 11 informational RLS-without-policy findings, 61 authenticated SECURITY DEFINER warnings across the existing RPC architecture, and disabled leaked-password protection. No broad policies or roles were granted to suppress those notices. The new definer endpoints require active, unrevoked Admiral authority and exact actor/voyage/operation ownership; their anonymous execution privilege is revoked. Synthetic cross-actor and revoked-authority checks passed. Existing RPCs are not represented as newly audited.

[Supabase: RLS-enabled tables without policies](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) · [Supabase: authenticated SECURITY DEFINER review](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) · [Supabase: leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

## Upload and recovery
Upload the complete extracted folder **contents** to the existing site root. Preserve project data. The new server migration is already installed; do not run the retained historical SQL files. A timeout, cancellation, refresh or lost response calls for read/reconciliation of the preserved operation, never automatic reissue. Original source history is retained in the baseline ZIP and release history. Do not roll back the server operation guards to resume Crosscheck's client receipt writes.

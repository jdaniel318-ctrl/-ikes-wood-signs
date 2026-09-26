# Dark Sky 8.8.17.17 — HarborMaster

HarborMaster is the next test-site command candidate built from WatchKeeper. It adds a real exact-vessel Captain appointment contract, a candidate acceptance route, a narrow vessel-Captain operating station, truthful Fleet lifecycle mapping, and deliberate Admiral activation of a vessel. It does **not** automatically promote the Captain to Admiral, publish a customer website, transfer ownership, or prove a working-ship handoff by static packaging alone.

## What HarborMaster adds

- Admiral Delegate lane can preview and issue one Captain appointment to one vessel. The candidate must accept with their own Supabase account before authority exists.
- Accepted appointments use the existing exact-vessel `operator` membership; they do not create a global `captain` role and do not create or transfer `project_owner`.
- `owner.html?surface=vessel-captain&project=<project_id>` becomes a dedicated vessel-Captain handoff/station route. It can accept/decline an appointment, read server-backed orders, change order status, and publish a narrow Fleet Watch report for that vessel only.
- Admiral may preview and deliberately **Depart Harbor** to set Fleet lifecycle to `active` only when the selected operating-authority contract is satisfied and a working-ship proof reference is supplied. That lifecycle change does not publish the customer site or replace inspection of the underlying field evidence.
- Fleet Watch maps server `active`, `suspended`, and `retired` lifecycle states truthfully and renders authenticated server Admiral programs when present; Bootstrap Build remains the fallback separate program until a durable server program exists.
- Appointment issue, acceptance, revocation, order-status changes, and activation are designed to write the Fleet authority audit.

## Server migration boundary

The static ZIP **packages** the HarborMaster Fleet Core additions in `SUPABASE_ADMIRAL_COMMISSIONING_886.sql`; uploading the website does **not** apply SQL by itself. During this build, the additive HarborMaster appointment/acceptance, exact-vessel Captain operating RPCs, activation preview, and `admiral_depart_vessel` command were applied to the connected Black Flag Fleet Core through reviewed migrations. No Captain appointment or vessel departure was issued. The website still fails closed if those server contracts are absent on another deployment.

The migration adds a dedicated appointment table/functions and does not delete existing vessels, memberships, owners, ledger records, entitlements, or customer records. The separate historical ledger SQL warning remains unchanged.

## Admiral milestone remains earned

HarborMaster creates the missing operating contract, but the Admiral milestone still requires field proof: commission a working ship, appoint and accept its Captain on a separate account, verify exact-vessel operation and denial outside scope, verify revocation, and retain Admiral observation/export/advisory visibility. `workingShipHandoffVerified` remains false until that voyage is actually completed.

## Deployment

Upload the 85 files inside `DarkSky881717-HarborMaster` to the existing test-site root. Keep website data untouched. Wait for GitHub Pages deployment to finish. Confirm **8.8.17.17 · HARBORMASTER** before any field test.

---

## Prior release record — retained

# Dark Sky 8.8.17.16 — WatchKeeper

Test-site security/session-clarity candidate based on ClearPassage. This is not a production launch, Admiral appointment, working-ship commissioning, or Captain handoff.

## Start versus resume

A new document or expired workspace requires the passage PIN and a full Admiral account sign-in. A recent account sign-in in the same document is labeled **Resume Admiral session**. The passage PIN is still required and the authenticated account and its exact active, non-revoked Admiral role are checked again with the server. Reuse leaves a visible receipt explaining why no additional password was requested. Until the check completes, the display says verification is pending.

The browser workspace closes after **15 minutes without activity in a visible Admiral workspace**, or **60 minutes from the full password sign-in**, whichever comes first. Token refresh, background requests, and switching back to the page do not reset those clocks. Brief trips to ChatGPT are allowed within the remaining window; time away counts as inactivity. Reloading or leaving this document ends the local reuse window.

**These are browser-workspace controls, not a server-enforced session-lifetime policy.** The existing backend still verifies permissions on its endpoints, but this build does not deploy backend timeout enforcement or prove immediate token revocation. That remaining requirement appears as a separate readiness WATCH. A clock shown here is not a guarantee that an already-issued token is invalid everywhere.

## Lock, end, and failure states

- **LOCK ADMIRAL** hides the workspace and requires the passage PIN plus a fresh server recheck to resume. It does not extend the maximum session age.
- **END SESSION** immediately removes this page's Admiral session, invalidates pending responses, and requests scoped sign-out from the server. The result distinguishes acknowledgment from an unconfirmed server sign-out. It does not sign out unrelated owner sessions or claim already-issued token invalidation.
- Denied/revoked/changed identities and expired windows cannot reopen the workspace. Network errors leave access locked; no cached success substitutes for a failed recheck.
- Cancelled or superseded sign-in responses cannot reinstate an old session. Password requests are not automatically retried. A timed-out command may already have reached the server; inspect its result before issuing it again.
- Account passwords are cleared from fields on cancel/success and never written as a draft, report, or stored session value. Existing bearer tokens remain in the separate sessionStorage channel; this is not an HttpOnly-cookie design.

## Protected scope

All 85 original application paths remain. Ledger business logic, vessel identities, owner entrance, test/live isolation, artwork, and optional ceremonial views remain. Both passage and account checks remain. No live permissions, roles, vessel states, ledger entries, or customer records were changed by this build. No storage deletion or migration was added.

The four earlier warning causes are not erased: experimental Ike length calibration, live membership-revocation proof, legacy localStorage quota, and unattributed browser storage. The additional Admiral lifetime-enforcement warning may make the count five. A new warning is not a lost feature; it identifies unverified server enforcement.

**Do not run `SUPABASE_LEDGER_INTEGRITY_88171.sql` as-is.** It is retained historical reference with a known schema mismatch. No SQL is required for this upload.

## Deployment

Upload the 85 files inside `DarkSky881716-WatchKeeper` to the existing test-site root, not the ZIP or enclosing folder. Keep the same site/browser. Do not clear website data. Wait for the GitHub Pages deployment to finish before opening its deployed link. A checksum hold during a partial/mixed upload must not be bypassed.

Confirm **8.8.17.16 · WATCHKEEPER**. Native iPad Safari and live account acceptance are the next checks; isolated tests do not establish these outcomes.

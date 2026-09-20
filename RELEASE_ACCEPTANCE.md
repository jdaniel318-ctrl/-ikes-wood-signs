# 8.8.17 Release Acceptance

Admiral Commission is releasable only when every blocking check passes. It must prove the same person can navigate Captain and Admiral records while the active office and authority source remain explicit.

## Admiral Commission gates

- Authority Ledger opens from Captain Record and defaults to Captain browser evidence.
- Authority Ledger opens from Admiral Govern and requires active server Admiral authority before server rows are read.
- Captain and Admiral evidence are labeled separately and can be filtered without silent merging.
- Ledger search covers target, action, project, intent, and retained detail.
- The packaged Admiral ledger RPC checks authenticated active, non-revoked global authority and exposes no owner/customer payload.
- Commissioning Orders expose ownership and operating models.
- Bootstrap Build defaults to `admiral_program`, `admiral_owned`, and `fleet_operated`.
- Commissioning remains preview-first, audited, not live, and creates no individual owner membership or entitlements.
- The six protected Fleet Core vessel IDs and their project isolation remain unchanged.

## Release identity

- [ ] `index.html`, `app.js`, `captain.js`, `owner.html`, `DEPLOYMENT_MANIFEST.json`, `RELEASE_SEAL.json`, `RELEASE_INVENTORY.json`, `manifest.webmanifest`, and `sw.js` agree on build and seal.
- [ ] Every file in `RELEASE_INVENTORY.json` exists and every deployed file is inventoried.
- [ ] `CHECKSUMS.sha256` verifies without error.
- [ ] ZIP filename and single top-level folder share the same unique release name.
- [ ] File timestamps are normalized to the release build time.

## Startup and recovery

- [ ] Cold load resolves without an Ike's or other cross-project flash.
- [ ] Reload does not inherit Admiral identity.
- [ ] Stale worker/cache recovery reaches the current release or an explicit hold screen.
- [ ] No runtime mismatch bypass exists.

## Owner proof

- [ ] Legacy owner signs in with the exact commissioned Supabase account.
- [ ] Another authenticated account is denied Legacy membership.
- [ ] Owner can publish a nonblank current-work report.
- [ ] Saved report is read back and shown as verified.
- [ ] Reload preserves only the intended secure session and project scope.
- [ ] Sign out closes the Owner Control Center.

## Admiral proof

- [ ] Passage PIN alone cannot open fleet data.
- [ ] Owner credentials cannot authenticate as Admiral.
- [ ] Active Admiral credentials open My Fleet.
- [ ] My Fleet shows six Fleet Core vessels, two Owner Ready, and four Owner Unassigned until real owners are commissioned.
- [ ] Action Queue includes all never-reported or stale vessels.
- [ ] Search and filters scroll away in normal flow and never cover vessel cards.
- [ ] The Fleet header remains the only sticky My Fleet surface.
- [ ] Refresh Watch shows Legacy's latest verified report.
- [ ] Open Vessel remains read-only and exact-project scoped.
- [ ] Sign out immediately locks the fleet workspace.

## iPad and preview safety

- [ ] Portrait and landscape layouts remain scrollable.
- [ ] On-screen keyboard does not hide the active action.
- [ ] Buttons show pressed, selected, busy, success, and failure states.
- [ ] Important confirmations remain readable and leave a durable state.
- [ ] Test/private-preview phone, email, and messaging actions remain blocked.

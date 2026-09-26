# 8.8.17.15 — ClearPassage

- Fit the Admiral Command Deck PIN/account entrance to tablet and small-screen viewports.
- Replace nested/repeated authentication copy with a two-step progress display.
- Keep credential targets stationary; remove deferred input focus, preserve zoom and normal scrolling.
- Preserve both authentication handlers and server-authority checks; clear credentials on cancel/hidden exit.
- Retain WatchBeacon findings/error/return fixes and all 85 deployment files.
- No record deletion, storage purge, SQL, live role changes, handoff or promotion.

---
## Retained prior release log

# Dark Sky 8.8.17.14 — WatchBeacon

Test-site repair candidate based on 8.8.17.13 KeelGuard. No rank, Known Good, production publication, ownership, membership, or server permission is granted by this ZIP.

## Repaired

- The Admiral findings renderer uses the existing module-scoped `captainSafe` encoder. It no longer references `htmlSafe`, which was private to the cinematic renderer.
- Rendered current card IDs/counts and report identities are checked before a successful display is recorded. Mismatched counts, duplicate/unknown checks, mismatched run history and mismatched details show an explicit error rather than a misleading empty panel.
- A rendering error retains the report, displays an accessible error panel, and offers Retry Display (no readiness rerun) and Download Last Report. Those actions do not clear findings or delete records.
- Closed Admiral deck and gate surfaces remain display:none despite Professional/Cinematic display rules; a closed panel cannot intercept Captain taps.
- A background summary cannot overwrite the deliberately selected report while its cards/export still refer to another run.
- Readiness exports add a separate `findingsDisplay` observation: display result, source run/time, displayed IDs and matching-run flag. This is diagnostic evidence, not a security signature or storage verification.
- All 85 original file paths remain. Both Admiral gates, ledger business logic, canonical vessels, source contracts and historical files remain. No SQL or business-data migration is needed.

## First three deployment actions

1. Download `DarkSky881714-WatchBeacon.zip`.
2. Extract and open its single matching folder `DarkSky881714-WatchBeacon`.
3. Upload all 85 files inside it to the existing test repository root. Do not nest the enclosing folder, upload the ZIP as a site, or clear website data.

Confirm `8.8.17.14 · WATCHBEACON` on the Engine. The next guided test is Captain readiness followed by the separate Admiral PIN/account gates and visible current findings. Warnings should remain visible until their underlying requirements are resolved.

## Verification boundaries

Browser regression uses the entire actual captain.js module in isolated Chromium pages, real DOM/click handlers, and the actual app verifier block. Storage, readiness results and server-account responses are fixtures. Normal full-site local navigation returned ERR_BLOCKED_BY_ADMINISTRATOR; that restriction was not bypassed. Native iPad Safari acceptance and real server-authorization tests remain pending.

The four warning observations in the supplied 8.8.17.13 report were replayed unchanged: Ike length calibration, server-revocation proof, legacy localStorage quota, and Safari storage attribution. This release does not resolve those warning causes, test a business-ledger restore, enable cloud backup, commission working ships or appoint Captains.

**Do not run `SUPABASE_LEDGER_INTEGRITY_88171.sql` as-is.** It is an unchanged historical reference with a known server-schema mismatch. No SQL is required for this upload.

---
## Retained prior-release documentation (historical, not a new test claim)

# 8.8.17.13 — KeelGuard

Fix: four packaged governance model versions were stale relative to the runtime. Preserve their content and all exact safety checks; align only the reviewed current release metadata. Add body integrity verification, manifest model inventory, precise failure evidence, holds-first brief and findings, explicit storage degradation, and coherent readiness exports. Preserve Ledger TouchSafe and all 85 source files. No live server/database changes, no data cleanup, no production promotion. Fresh test evidence is separated from retained historical claims in RELEASE_GATE.json.

---
# 8.8.17.12 — Ledger TouchSafe

- Remove simultaneous smooth scroll and input autofocus when opening corrections.
- Move editing into a single-column document-flow workspace; restore the original ledger on exit.
- Use visible native review choices and explicit field-label associations.
- Show the native active-field label without redirecting input.
- Disable amount/customer/purpose editing until a deliberate unlock.
- Reject malformed amount strings, including the reported `1.00 e`, before preview.
- Preserve queue-origin deliberate amount changes when editing their preview.
- Count unverified legacy approval as review attention.
- No automatic data correction, SQL change, or live service action.

Baseline: 8.8.17.11 Ledger Closeout. Native iPad Safari verification remains pending.

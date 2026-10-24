# Independent Quartermaster scoped re-review

Reviewed 2026-10-24.

## Release verdict

**APPROVED for the agreed device-local Quartermaster release. All five original findings are ADDRESSED. No new release-blocking or actionable regression was found in the correction diff.** The earlier runtime request-changes verdict is superseded by this approval. Final seal, manifest, ZIP reconstruction and current-label/name checks remain the root's packaging gate; this report does not certify an archive that was not part of the reviewed inputs.

## Exact review scope

Read `qa/review-fixes-report.md` and `qa/review-fixes.diff`, then inspected the actual affected UI, core and PDF code, including prospective-finalization construction/comparison, the transactional capacity check, compact export/import, durable document reopening, retirement decisions, keyboard handling and long-terms flow. Read the targeted test implementation and `qa/review/results.json`, plus the existing final UI `qa/browser/run-summary.txt`. The reported core/PDF results were considered with that source review. Did not repeat broad review, rerun optional suites, modify runtime code, access live services or inspect real account data.

The actual runtime SHA-256 values independently read during this re-review match the correction report:

| Module | SHA-256 |
|---|---|
| `quartermaster.js` | `a4c426422da8371765fe6d8c957485334a60e902d85d834995fb63d603399148` |
| `quartermaster_core.js` | `5de2d40cb05eeeafb03855e5a374b7fc451982969d187d71632dd908e1051eed` |
| `quartermaster_pdf.js` | `7e1c51fa7d7a4ae4fcd55a2330b15ff87c6b4ec0c9db548ff2b6a72658a453a1` |

## Original findings disposition

| # | Original finding | Disposition | Re-review rationale |
|---|---|---|---|
| 1 | Finalization could lock a document that cannot produce its customer PDF | **ADDRESSED** | Extended terms now flow across pages while short terms retain their original placement. The UI renders a prospective finalized snapshot before committing. Core preparation uses the actual current business and final status/revision/totals; commit reconstructs and compares that candidate under the expected durable workspace revision. It cannot silently substitute a changed business/draft after the PDF check. Errors leave the draft editable. Targeted evidence covers the original long-terms case, unsupported customer/current-business text, and a competing save during preparation. |
| 2 | Export could produce a backup the restore UI refuses | **ADDRESSED** | A shared 25 MiB compact-JSON capacity is enforced before durable writes, export and restore. The UI exports compact JSON and uses the same limit. The revision-digit reserve prevents restoration's revision increment from invalidating an otherwise boundary-sized supported backup. The capacity is disclosed before further growth. Evidence includes a genuine supported backup above the old 5 MiB cutoff, successful recovery/export, and atomic rejection of oversized writes and recovery. |
| 3 | Conflict reopening cloned stale in-memory state | **ADDRESSED** | Open now enters the verified task flow, awaits `store.load()`, revalidates context, then replaces state/document from the durable result. The original unsaved-work decision remains. The targeted scenario verifies rejection of the stale save, preservation on cancel, loading the competing durable update after acceptance, and a successful subsequent save. |
| 4 | Retiring B erased unsaved catalog edits to A | **ADDRESSED** | Retirement invokes the normal explicit unsaved-change decision first. Cancellation preserves the DOM form and saved active item. Dirty/edit state is cleared and rerendered only after accepted decisions and a successful guarded retirement. The strengthened regression checks that the first prompt is specifically about unsaved work. |
| 5 | Primary tabs were not keyboard-operable | **ADDRESSED** | The primary tablist implements left/right wrapping and Home/End, filters hidden/disabled tabs, observes busy/session checks, and focuses the target only when the unsaved-work guard permits activation. Targeted evidence verifies selected state, focus and hidden-editor skipping. |

The accompanying editor-scroll reset is a bounded usability correction. It resets the content viewport after new/example/reopened/converted document rendering and does not alter stored data or authority.

## Verification assessment

The supplied final evidence is consistent with the reviewed implementation: targeted regressions **10/10**, native core **44 assertions with 57 strict transactions**, PDF **37 checks**, and unchanged UI workflow suite **11/11**. The UI summary explicitly covers authority rejection, account-change cancellation, persistence, backup recovery, storage failure, download removal on revocation, delayed actions, phone/iPad layout and repeated/concurrent numbering. The reviewer independently confirmed matching runtime hashes and inspected the relevant source/test paths; the passing suites were not rerun during this scoped re-review.

No new breakage introduced by the fix diff was identified. The finalization change retains atomic revision checks and operation history; it does not perform remote issuance. The capacity change rejects unsupported growth before commit rather than deleting history or fabricating save success. Reopening, retirement and keyboard fixes continue to use the existing context and unsaved-work protections.

## Compliance, quality and remaining limits

**Spec-compliance verdict: pass for this agreed local-release milestone. Quality verdict: acceptable to release.** The original blocking PDF workflow gap and the four identified quality defects have been corrected with directly relevant regression evidence.

The supported workspace capacity is now explicitly 25 MiB of compact backup JSON. Larger histories require future supported storage/recovery work. Unsupported PDF characters or exceptionally large first-page identity/contact blocks can still be rejected, but the UI now checks exportability before immutably finalizing. The core's optional prepared argument preserves its existing API path; the supported UI is the enforcement point for PDF preflight.

Evidence remains limited to offline synthetic Chromium/native IndexedDB execution and the supplied visual evidence. Native Safari/iPad behavior, live production authentication, shared cloud numbering, multi-device synchronization and full supplier/conversion modeling are outside this scoped approval. No claim is made for those future capabilities. Final packaging verification and release-wording checks remain separate and necessary.

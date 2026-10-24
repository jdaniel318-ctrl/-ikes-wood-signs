# Independent review — Quartermaster 8.8.20.52 PDF handoff

## Assessment

**APPROVED for final sealing and packaging. No blocking findings.**

The bounded change meets `spec/DESIGN.md` and `spec/PLAN.md`: a deliberate native action opens the prepared PDF separately, and the download action keeps the existing filename while supplying a separate-tab preview fallback. Both actions retain the existing access check. The inspected `.52` runtime and fresh evidence support workspace continuity without changing authentication policy or saved-record behavior.

This approval covers source, handoff behavior, the focused browser evidence, and the retained workflow regression evidence. Final release sealing, archive reconstruction and delivery verification remain the release coordinator's gates.

## Reviewed baseline and source

- Baseline: the immutable `quartermaster-polish/release` `.51` tree identified by the coordinator as complete digest `aca675348d52f1dbfd5e6eb24158d2de48730bc321b6fd3cf444c11024551f67`.
- Inspected the actual `.52` diff in `quartermaster.js` and `quartermaster.css`, plus `QUARTERMASTER_PDF_HANDOFF_CHANGES.json`.
- Independently reversed the declared replacements and checked the appended CSS byte count/hash. Across all **45** baseline JS/CSS/HTML files, the result matched `.51` exactly after release identity normalization and the compiled-player digest-reference normalization. No undeclared runtime difference remained.
- `quartermaster_core.js`, `quartermaster_pdf.js`, `quartermaster_fonts.js`, the previous `VERIFY_QUARTERMASTER_UI.cjs`, and `QUARTERMASTER_PRESENTATION_CHANGES.json` remain byte-exact to `.51`.
- Captain and shared session-transport behavior remain exact after `.52` identity normalization. See `qa/session-navigation.md` for the read-only explanation of the reported Back/sign-in behavior.

## Strengths

1. **Native, deliberate handoff.** `release/quartermaster.js:40–52` creates one prepared Blob URL. The open action uses `_blank`, `noopener noreferrer`, and no download attribute; the download action retains its filename and also uses `_blank` as a preview fallback. No window is launched from an asynchronous completion callback.
2. **Existing guards and cleanup retained.** The two PDF links share the original `allowed()` check at click time. Failed access prevents the default action and closes/cleans the workspace. `clearDownload()` still revokes URLs and removes controls when a document becomes dirty, navigation changes documents/business, or the workspace closes.
3. **Saved document semantics preserved.** PDF rendering still consumes a clone of the saved document and revalidates the task before exposing the Blob. Numbering, amounts, storage, finalization, and PDF generation are untouched.
4. **Backup compatibility retained.** The non-PDF branch retains one download link without a new tab target or rel attributes. Its bytes and native download behavior are covered by the focused report and the full retained workflow.
5. **Responsive controls fit the existing workspace.** Scoped CSS adds only the new open link styling. The existing wrapping action row supports phone/tablet layouts; inspected phone and tablet landscape screenshots show distinct, readable, reachable actions with no horizontal clipping.

## Evidence reviewed

### Focused browser handoff

`qa/browser-after/results.json`: **13 passed, 0 failed**, build `8.8.20.52`, Chromium `151.0.7922.34`.

Reviewed the harness assertions as well as report output. Recorded source hashes match the final inspected runtime, and no blocked network request remained. The harness permits only the exact built-in Chromium PDF-viewer extension and Chrome resource host, in addition to the isolated fixture origin; this allows native viewer resources without opening external network access.

Coverage includes actual native PDF-tab creation with no opener access; unchanged original URL, live document/dialog objects, DOM, scroll, local records, session counters and write count; native download filename and byte equality; PDF text containing the saved sample customer and `$6,271.00`; simulated download-ignored fallback; stale-session denial for each link; URL revocation on dirty input, document change, business change and close; unchanged JSON backup; pointer/keyboard reachability and 44-pixel action targets at tablet landscape, tablet portrait and phone viewports using the complete production host styles.

The initial `.51` evidence in `qa/browser-before/results.json` fails specifically because a separate open action is absent, establishing the intended prior behavior gap.

### Existing document workflow

`qa/workflow/results.json`: **11 passed, 0 failed**. Source hashes match the inspected `.52` runtime. This includes catalog/quote/invoice/PDF/backup/save/reload, backup scope isolation, denied/closed authority, account-change cancellation, quota handling, revocation, repeated/concurrent actions, and phone/tablet layout checks.

The original `.51` verifier is retained unchanged. The new `release/VERIFY_QUARTERMASTER_WORKFLOW_52.cjs` differs from it only in the two selectors inside `prepare()`: `#qmDownloadReady a` becomes `#qmDownloadReady a[download]`. This is the necessary selector disambiguation for two deliberate PDF links. All assertions are unchanged. The initial 9/11 report remains in `qa/workflow-initial/results.json`; its ambiguous selector prevented the PDF/backup chain and consequently left the dependent restore fixture unavailable.

## Issues

### Critical

None found.

### Important

None found within the reviewed scope.

### Minor

None requiring a release change.

## Declined to judge / coverage limits

- **Native iPad Safari behavior:** not observed for this build. Chromium viewport emulation and the simulated ignored-download attribute cannot certify Safari's native viewer or save UI. The Captain's device check remains appropriate.
- **Live authentication or backend authority:** deliberately excluded; all tested authority is synthetic and external requests are blocked. Source review shows the policy is unchanged, but this is not a live account certification.
- **The exact cause of the reported device sign-in prompt:** not reproduced on that device. Existing startup/pagehide/persisted-pageshow cleanup makes same-tab navigation a plausible explanation; it does not prove the actual event sequence or data loss.
- **Indefinite session survival while reading a PDF:** not a requirement. Existing idle/max-age limits continue; mere visibility change does not itself end the session in the reviewed source.
- **Final ZIP sealing, complete `.51` digest revalidation and extracted-payload reconstruction:** owned by the release coordinator after this review. This report does not substitute for those final gates.
- **Unrelated games, other vessels and business feature redesign:** outside the requested handoff; preservation was checked through the runtime inverse comparison rather than by rerunning unrelated feature suites.

## Recommendation

Proceed through the final package gates. Keep the handoff wording precise: `.52` provides an explicit separate-tab PDF action and a separate download choice; native Safari acceptance and normal authentication timeouts remain distinct from the verified Chromium continuity result.

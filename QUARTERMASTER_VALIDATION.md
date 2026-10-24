# Quartermaster 8.8.20.50 — verification

Status: **OFFLINE_RELEASE_CHECKS_PASSED**. Recorded 2026-10-23 21:22 EDT.

## Current evidence

| Area | Result | What it establishes |
|---|---|---|
| Native IndexedDB core | 44 checks; 57 strict transactions | Scoped durable records, atomic numbering, revisions, immutable snapshots, exact arithmetic and backup capacity |
| Customer PDFs | 37 checks | Normal quote and invoice each fit one page; long rows and terms paginate; totals and identifiers survive export; costs stay private |
| Browser workflow | 11 scenarios | Catalog to saved quote to linked invoice and real PDF download, reload, backup/restore, quota errors, cancellation, concurrency and narrow layouts |
| Review corrections | 10 scenarios | Exact PDF preflight, editable failure, conflict reload, unsaved edits, keyboard navigation and recoverable capacity |
| HouseHull field draft | 3 checks | A failed storage write or mismatched readback never claims success |
| Preserved Fun, Stormwake and Headway suites | 12 + 32 + 49 checks | Existing verified mission, save and job-contract rules continue to pass |
| Actual index loader | 3 scenarios passed | Verified module loading and fail-closed checksum handling |

The original independent reviewer accepted the scoped corrections to all five findings. The corrections are long-terms pagination and PDF preparation before freeze; a shared backup limit enforced before writes; durable conflict reload; an unsaved-edit decision before retirement; and keyboard-operable tabs. See QUARTERMASTER_REVIEW.md.

Three actual-index checks passed: coherent release starts; altered runtime bytes and an altered checksum declaration both hold before execution.

The ordinary approved HouseHull example totals **$6,271.00**. A separate browser scenario preserved part `00042-HH`, manufacturer reference `000012-A`, supplier SKU `00000097/S`, and 1.125 cartons at $189.00. At the explicitly reviewed 7.125% rate it produced $212.63 subtotal, $15.15 tax and $227.78 total. That is a calculation fixture, not tax advice or a supplier quotation.

## Release integrity

VERIFY_QUARTERMASTER_RELEASE.py checks final manifest/runtime hashes, exact preservation of 39 retained model files, protected host integration, game identity-only changes and the 85-file upload limit. VERIFY_PACKAGE.py checks that the upload over complete Harborhold 8.8.20.49 reconstructs the full release byte for byte. Those final archive checks and a fresh extracted-index boot are required after sealing; they are recorded with the package instead of embedding a circular archive hash in itself.

## Practical limits

These are offline Chromium checks with isolated synthetic authority, native IndexedDB and blocked external requests. They do not certify native iPad/Safari, a live server role, service-worker deployment or a real customer transaction. Phone/iPad viewport checks are layout evidence only.

Catalogs, quotes and invoices are device-local and scoped to the verified account and selected business. Back up the private JSON regularly. Restoring requires a matching scope and an empty workspace; operating cloned copies independently is outside the local numbering guarantee. Compact backups are limited to 25 MiB, with capacity checked before every commit. Internal costs remain private data in that backup and are excluded from customer PDFs.

The new support workflow does not send messages, order materials, take payments, post a ledger, change permissions or deploy SQL. HouseHull remains operator-led. Production shared numbering, staff collaboration, automated measurement and product conversion remain future work.

## Reproduction

Run the bundled `VERIFY_QUARTERMASTER_CORE.cjs`, `VERIFY_QUARTERMASTER_PDF.cjs`, `VERIFY_QUARTERMASTER_UI.cjs`, `VERIFY_QUARTERMASTER_REVIEW.cjs`, `VERIFY_QUARTERMASTER_FIELD.cjs` and `VERIFY_QUARTERMASTER_BOOT.cjs` with the documented Node/Playwright/Chromium dependencies, followed by `VERIFY_QUARTERMASTER_RELEASE.py` against the preserved .49 baseline. The verification scripts are development utilities and are never loaded by the customer application.

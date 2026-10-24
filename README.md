# HouseHull quote and invoice review samples

Prepared October 23, 2026 (America/New_York).

## What is included

- A normal, itemized sample invoice and a matching sample quote.
- Part/service references, descriptions/specifications, quantity, ordering or billing unit, unit price, and line amount.
- A distinct quote or invoice number at the top right; invoice reference to the exact quote revision.
- Editable sample data and an offline PDF renderer.
- `blackflag_document_rules.json`: the reusable document requirements captured from the Captain's direction.

Everything is SAMPLE data. The document numbers have not been reserved in a production numbering registry. DEMO part numbers, customer details, quantities, pack sizes, prices, zero tax and payment/validity terms are illustrative. They are not actual manufacturer part numbers, an order, a receivable, a payment request or a validated takeoff.

## Adjust the example

1. Edit `sample_documents.json`. Keep `status` as `sample` while reviewing. Physical material quantities refer to the purchasing unit shown; service quantities refer to the stated billing unit.
2. Install Python and ReportLab if required: `python -m pip install reportlab`.
3. Run `python generate_documents.py --output output`.

The script computes line amounts and totals with decimal arithmetic and renders two PDFs. It uses DejaVu Sans when available, with standard PDF fonts as an ASCII fallback. It does not need a network connection, contact customers, issue live documents, or change Black Flag.

## What Black Flag can reuse

Share document layout, required-field validation, exact decimal calculations, document-type handling and revision/reference rules. Each business retains its own identity, branding, scope-specific item fields, part catalog, supplier mappings, prices, tax configuration, customers and terms. HouseHull contributes the estimating-to-document pattern; another business need not adopt exterior-construction fields.

For production, the source of truth must allocate readable numbers atomically within the business and document type, alongside a globally unique internal document ID. A repeated operation must return the same document number; canceled or void numbers are not reassigned. Re-export keeps the same issued number and revision. Revisions and quote-to-invoice conversion must preserve the approved source snapshot and exact links, with explicit operator actions.

The renderer currently requires a supplied number and explicitly marked sample documents. A shared production numbering service, authenticated business storage, supplier ordering, automatic invoice creation, accounting integration and a deployed Black Flag document engine are not implemented by this packet.

## HouseHull product direction retained

HouseHull is operated by the person measuring and estimating. That operator records the job and proposed work, reviews the estimate and generates the customer document. The customer receives the quote PDF; customer self-service is not the estimating workflow. Existing condition and proposed installation remain separate. Actual measurement evidence, product-specific takeoff rules, costs, selling prices and approvals belong in the business record, with only selected customer-facing fields in the PDF.

ScheduleJoe remains a separate development track. These documents do not change the scheduling prototype or its calendar-anchor behavior.

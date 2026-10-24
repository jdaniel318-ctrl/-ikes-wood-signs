# Quartermaster · 8.8.20.50

## Install — three steps

1. Extract the Quartermaster upload ZIP. Open its single matching folder.
2. Upload every file inside that folder to the root of the existing GitHub repository over complete Harborhold 8.8.20.49. Replace matching filenames and retain the other files. This update is not a standalone website.
3. After GitHub Pages finishes updating, reopen Black Flag and confirm **8.8.20.50 · QUARTERMASTER** in the Engine Room.

## First look — three steps

1. Select **QUOTES & INVOICES** in the Engine Room's **Admiral Business Support** section. Complete the existing Admiral sign-in.
2. Choose **HouseHull** and select **Create example quote**. This deliberately loads the clearly marked example catalog and the approved $6,271.00 sample.
3. Select **Prepare PDF**, then **Download PDF**. The sample is already saved; no screenshot confirmation of the approved document layout is required.

## Use your own business data

Open **Business & backup**, enter the company name, part/document prefix and contact details, and save. In **Parts & services**, add actual material or service items. Keep the business part number distinct from the manufacturer part and supplier SKU. Leave the business part field blank to allocate one automatically. State the purchasing or billing unit and the actual package/stock description. Costs remain internal; prices appear on documents.

Create a quote or invoice, enter the customer/job and document date, then add catalog items and quantities. Review tax explicitly, including a zero rate when appropriate. Save the draft. **Finalize quote/invoice** freezes the local copy; catalog edits do not change it afterward. A finalized quote can create a separately numbered invoice linked to its exact source revision. Nothing is sent, ordered, charged or posted to a ledger automatically.

Use **Business & backup → Prepare backup file** regularly. Download the private JSON file. Restoration accepts a matching account/backend/environment/site/business and an empty workspace; it holds conflicting existing records instead of overwriting them. The backup includes internal costs and customer data and should be kept private. The local workspace supports a compact backup up to 25 MiB; a save that would exceed recoverable capacity is rejected without changing earlier saved work.

## Scope of this release

Catalogs and documents are saved on this device for the verified account and selected business. They do not sync between devices, and clearing website data can remove the local copy. The readable document number includes a local installation series so independently created copies do not masquerade as a centrally reserved number. A future shared server registry and business staff permissions remain separate work.

The local HouseHull planning entry is not a newly commissioned ship. Its measurement, scale and product conversion rules still require verified development. Existing customer experiences, game progress, project data and security settings are preserved. No SQL, browser-data clearing or live permission change is required for this upload.

Current verification details are in QUARTERMASTER_VALIDATION.md. Native iPad/Safari operation of this new workflow still needs the Captain's use on the device.

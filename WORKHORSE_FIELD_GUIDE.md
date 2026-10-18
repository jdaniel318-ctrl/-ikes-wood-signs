# Workhorse 8.8.20.32 — owner-workspace TEST

## Install
Use the small Upload ZIP on top of the existing SteadyHand 8.8.20.31 site. Upload its folder contents at the existing repository root; preserve every other existing file. Do not upload the full recovery snapshot as one GitHub browser batch. No SQL, account creation, invitations, re-commissioning, permission change or browser-data cleanup.

## First three field checks
1. Open the existing Ike’s owner entrance with the already-assigned Ike’s owner account. Confirm WORKHORSE TEST · 8.8.20.32 and the new task-focused home. Counts describe this browser’s saved records, not a cloud inventory.
2. Open Orders. Search for an existing order number or wording, switch a status filter, then View order. Confirm the exact wording/case, customer, recorded price and available saved photos. Do not change order status or publish another report.
3. Use Back to orders; the search/filter should remain. Send the owner home and one order/detail screen. No need to re-run commissioning or the Captain appointment.

## What this release deliberately does not do
No new-order creation or status-write workflow was added to the owner portal. It exposes the full relevant saved-order information for review; existing management features elsewhere remain. No pricing policy, production geometry, evidence approvals, owner transfer, paid service, Captain authority or live customer publication is changed by installation. Price arithmetic is not a quote. The wording checker is evidence-only, never machine certification.

## Preserve data
Never clear Safari website data. Existing owner orders/settings are still local browser records in this path. Login proving server identity does not turn those local records into a cloud backup. Existing report RPCs, Captain/Admiral reporting, commissioning safeguards and separate project boundaries remain. Old fonts, photos, styles, SQL and documentation are retained.

## Rollback
Restore the entire matching SteadyHand 8.8.20.31 runtime/package rather than mixing versions. The original full archive remains the rollback source. A frontend rollback needs no database rollback because this release applies no database migration. The two new presentation assets can remain unused; no deletion is required.

## Offline verification
node VERIFY_WORKHORSE.cjs .
node VERIFY_STEADYHAND.cjs .
node VERIFY_IRONBOUND.cjs .
python VERIFY_WORKHORSE_UI.py . /tmp/workhorse-ui
python VERIFY_STEADYHAND_UI.py . /tmp/steadyhand-ui
python VERIFY_IRONBOUND_UI.py . /tmp/ironbound-ui

UI fixtures use synthetic identities and data and block real network access. They do not constitute a live server-permissions test or native Safari acceptance.

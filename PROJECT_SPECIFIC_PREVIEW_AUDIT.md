# v3.8.12 — Project-Specific Preview & Customer Review Audit

## Purpose
Dark Sky must preserve shared platform behavior while allowing each operating model to present the customer's product in a way that fits the actual business.

## Changes
- Repaired the Engine Add Project tile so both Add Project entry points open the canonical commissioning workflow.
- Removed the decorative repeating-line fallback from all real uploaded wood photos once a photo is present.
- Refit Ike's Review screen into a clearer customer-facing order summary with prominent wording/price, grouped sign details, and grouped contact information.
- Added explicit preview geometry metadata to project shell templates.
- Custom Mug now declares `cylindrical-wrap` preview geometry.
- Wood Sign declares `flat-surface` preview geometry.
- Flower Shop declares `card-overlay` preview geometry.
- Mugs After Dark now renders a curved/cylindrical lettering simulation in both live preview and the saved approved preview instead of a single flat text overlay.

## Boundary
The mug wrap is a visual placement simulation. Automatic mug-surface detection and production-grade print warping require a future geometry/placement capability and are not claimed in this release.

## Checks
- Core JavaScript syntax.
- No obsolete `openAddProject` route remains.
- Both Engine Add Project controls route to commissioning.
- Uploaded-photo fallback line treatment is hidden when a real photo exists.
- Project shell preview geometry metadata exists.
- Mug live and saved-preview paths use the cylindrical wrap helpers.
- Release/cache versions align at v3.8.12.

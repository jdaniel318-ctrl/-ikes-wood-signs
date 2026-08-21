# Client Preview Audit — Dark Sky 5.6.0

## Contract

Client Preview is a customer-facing, unpublished demonstration surface. It is intentionally separate from Internal Preview, Sea Trial, Project Admin, Black Flag Engine, and Captain's Quarters.

## Security / Authority

- Preview PIN is unique to the generated preview and is never accepted by Project Admin, Black Flag Engine, or Captain's Quarters.
- Project Admin remains 4353.
- Black Flag remains 5615.
- Captain's Quarters remains 19613.
- Client Preview runs with deployment state `preview`, so the fleet external-contact guard blocks phone, SMS, email, payments, notifications, and external submissions.
- The preview payload contains a customer-facing project snapshot only; it does not include Engine/Captain credentials or project-admin credentials.

## Isolation

- One preview payload contains one immutable Project ID and one revision fingerprint.
- No other project records are loaded from the recipient browser.
- Client Preview does not expose Engine fleet navigation or Control Center tools.
- Project-owned graphics may be embedded only when small enough; otherwise the preview uses public/source project evidence or platform fallbacks for that project.

## Portability

The current static GitHub Pages architecture has no server-side preview store. To make a preview link work on another device, the share link carries a sealed customer-facing project snapshot in its URL fragment. A future production preview service can replace this transport without changing the Client Preview authority contract.

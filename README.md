# Workshop Engine v2.9.71 — Owner Portal Login & Live Tools

## Test login
For Ike's Wood Signs in this test build:
- Login: `joe`
- Password: `4353`

This intentionally relaxes production credential rules for testing only.
Production owner accounts will require a valid email address and stronger password policy.

## Owner lifecycle
- Owner accepts invitation.
- Test credential is created.
- Owner enters the Business Portal.
- Signing out returns to the **Business Portal login**, never the Engine PIN.
- Owner can sign back in with the owner credential.
- Owner Settings includes Change Password.

## Functional owner buttons
The portal cards are now buttons and open working project-scoped modules:
- Orders — view orders and update status.
- Customers — view customer history.
- Products — add/edit/publish products.
- Pricing — update price choices.
- Branding — update customer-facing business name/subtitle.
- Kiosks — add/pause/resume kiosk records.
- Locations & Devices — add/pause/resume deployment records.
- Staff — add/remove staff list entries.
- Reporting — current order/sales/customer/device summary.
- Notifications — enable/disable customer confirmation setting.
- Settings — change owner password.

All actions are scoped to the current owner project.

## Important production boundary
This remains a local/static test implementation. The test password is stored locally and is not appropriate for production.
Before remote owner deployment, credentials must move to a server-side authentication service with secure password hashing, recovery, session expiration, and cross-device identity.

## Assets
No assets added, removed, renamed or replaced.

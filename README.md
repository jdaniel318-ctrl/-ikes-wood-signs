# Ike's Wood Signs — Version 1.2

Version 1.2 keeps the Version 1 local-first ordering system and adds two major changes:

1. **In-app camera workflow.** The wood-photo step now uses `navigator.mediaDevices.getUserMedia()` to show a live rear-camera view inside the ordering screen. The customer taps START CAMERA, TAKE PICTURE, then USE THIS PHOTO or RETAKE without leaving the 10-step flow. Captured photos are resized to a maximum 1600-pixel side and compressed before local storage.
2. **Stronger Ike's branding.** The welcome screen now uses the yellow/blue/red/green identity more heavily, includes the illustrated Ike character with a plank, and carries a smaller branded strip through the ordering experience.

## Important camera note
Direct camera access depends on the browser/container hosting the web app. Version 1.2 requests the rear camera directly and catches permission/support errors. For production, the app should run in Safari/PWA over a secure context or in a native wrapper that explicitly supports WebRTC camera access. HTML Serve can still be used to test whether its embedded browser grants this permission.

The saved-photo picker remains only as a testing fallback when the host blocks direct camera access; the intended customer workflow is the in-app camera.

## Local storage
Orders continue to be stored in IndexedDB on the device. Admin export/restore and order status tools remain unchanged.


## Version 1.3
- Automatic Web3Forms order submission (requires pasting the form Access Key into `WEB3FORMS_ACCESS_KEY` in `app.js`).
- Unique customer order number is generated before submission and included in the email subject/body and confirmation screen.
- Customer-facing mail-app step removed.
- More illustrated Ike branding, softer organic shapes, fewer box-style panels.
- Live HTTPS camera workflow retained from Version 1.2.
- Orders remain stored locally in IndexedDB as a backup if automatic email fails.

### Required before publishing
Open `app.js` and replace:
`PASTE_WEB3FORMS_ACCESS_KEY_HERE`
with the Access Key for the verified Web3Forms form whose recipient is `ikeswoodsigns.orders@yahoo.com`.


## Version 1.4
- Compact header to keep branding present without dominating the customer experience.
- Reliability pass: every order is mirrored to `localStorage` as well as IndexedDB.
- Admin Orders merges both storage locations so locally saved orders remain visible even if one storage mechanism fails.
- Web3Forms failures are saved onto the order record for troubleshooting; customer sees a clear failure state instead of a false success.
- Existing unique `IKE-...` order number remains on the customer confirmation and automatic order email.
- Price selection now explains that price is based on the length group posted in the trailer. Exact length brackets are intentionally not invented yet; the existing $45 / $55 / $65 / $90 / $135 posted price tiers remain in use until Ike's exact length ranges are confirmed.


## Version 1.5 — final build for the evening
Customer trust, production-reference reliability, and admin security are the priorities.

- Admin gear is protected by default PIN `4353`.
- Admin PIN can be changed inside Admin Settings (4–8 digits).
- Every approved order stores a flattened production-reference image combining the customer's exact photographed wood blank with the approved wording/style/fill.
- Admin Orders displays that approved customer preview prominently.
- Customer approval language explicitly requires review of spelling, capitalization, punctuation, layout, orientation, style and fill, and states that Ike's Wood Signs may refuse or cancel any order at its discretion.
- Thank-you screen emphasizes appreciation for choosing Ike's Wood Signs and supporting a small local business.
- Old customer-facing/manual "Prepare Admin Email" workflow remains removed; automatic Web3Forms submission is the intended flow.
- Service worker is now network-first, forces updates, and deletes prior Ike's cache versions to reduce stale-version problems.
- Compact header from Version 1.4 is retained.
- Subtle live-edge wood shapes are added to the UI without replacing the established yellow/blue/red/green branding.
- Local order redundancy from Version 1.4 is retained.

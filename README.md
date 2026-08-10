# Ike's Wood Signs — Version 1.2

Version 1.2 keeps the Version 1 local-first ordering system and adds two major changes:

1. **In-app camera workflow.** The wood-photo step now uses `navigator.mediaDevices.getUserMedia()` to show a live rear-camera view inside the ordering screen. The customer taps START CAMERA, TAKE PICTURE, then USE THIS PHOTO or RETAKE without leaving the 10-step flow. Captured photos are resized to a maximum 1600-pixel side and compressed before local storage.
2. **Stronger Ike's branding.** The welcome screen now uses the yellow/blue/red/green identity more heavily, includes the illustrated Ike character with a plank, and carries a smaller branded strip through the ordering experience.

## Important camera note
Direct camera access depends on the browser/container hosting the web app. Version 1.2 requests the rear camera directly and catches permission/support errors. For production, the app should run in Safari/PWA over a secure context or in a native wrapper that explicitly supports WebRTC camera access. HTML Serve can still be used to test whether its embedded browser grants this permission.

The saved-photo picker remains only as a testing fallback when the host blocks direct camera access; the intended customer workflow is the in-app camera.

## Local storage
Orders continue to be stored in IndexedDB on the device. Admin export/restore and order status tools remain unchanged.

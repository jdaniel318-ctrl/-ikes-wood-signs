# Keyline 8.8.20.81

## Faster saved-account sign-in across the fleet

Keyline gives the existing password sign-in fields consistent account and password hints for Apple Passwords and other password managers. It builds on the Face ID-assisted sign-in the user confirmed for Ike on Holdfast.

The shared owner page serves all six Fleet Core businesses. The appointed Captain login already had the correct field hints. This update completes the metadata on the owner page, the retained embedded owner login and five Admiral account entrances (Fleet Watch, airlock, course orders, commissioning and branding).

Apple controls the Face ID, Touch ID or device-code prompt when filling a saved account. The site still authenticates the password and checks the account's existing authority. No passkey enrollment, biometric protocol, automatic account selection, new membership or PIN replacement is included.

## Install

1. Extract `Keyline-Upload.zip` in Files.
2. Open its `Keyline` folder and upload its contents to the existing repository root. Replace matching files and keep the other files.
3. Open the Engine and confirm **8.8.20.81 · KEYLINE**.

The matching full-source archive contains application code, not the browser's orders or customer data. Keep the current and older-record backups already saved.

## First three device checks

1. Open Ike's **Owner Sign-In** and choose the saved owner account from Passwords.
2. Complete the device's verification prompt and sign in. Confirm the destination is Ike's Wood Signs.
3. Sign out and confirm the owner workspace closes. Continue testing other commissioned owners and assigned Captains with their own accounts.

Only actual device testing can confirm Safari's saved-account suggestion and Face ID behavior. Missing credentials or device settings may require ordinary password entry. No credentials are copied into the update.

## Scope and verification

The product changes are limited to input metadata in `owner.html`, `app.js` and `captain.js`. Existing authentication, role checks, vessel scope, expiry, revocation, recovery, PINs and saved business records remain unchanged. No server requests or account changes were made during this build.

An offline comparison verifies that only `name`, `autocomplete`, `autocapitalize` and `spellcheck` attributes changed in the runtime sources before release metadata was updated. Existing release and authority regression checks are used; native Face ID across the fleet remains a device acceptance check.

The current 21-suite offline release runner passed. The old Chartwright verifier is pinned to release .34 and is not applicable to this release; its failed attempt is recorded in `KEYLINE_EVIDENCE.json`. The optional Python browser harness could not start because Playwright is not installed in that Python environment. Native Safari acceptance remains pending.

Apple guidance: https://developer.apple.com/documentation/security/enabling-password-autofill-on-an-html-input-element

## Next: Ike's shop workflow

Continue with boards in Ike's shop: photograph and identify the board, confirm species and real dimensions, then preserve the customer's approved design through owner review and the CNC handoff. Customer-supplied boards remain a future option.

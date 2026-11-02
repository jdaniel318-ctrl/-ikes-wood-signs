# Clearway 8.8.20.86

The main Design My Sign button now opens Ike's current request editor directly. This fixes the mismatch between the main button and Other sign tools seen in the Fairwater field test.

Customer changes
- Fixed Back/Next controls guide board, design, contact details, review and Mail without replacing the customer's inputs.
- Preparing a package brings its Mail action into view above the footer, including small phone screens.
- Remember progress on my private device is optional and off by default. It keeps the current photos, design and answers locally. Resume is explicit; personal details are not shown before that choice. Approval must be checked again.
- Pauses in unfinished email, phone, finish and quantity fields are valid draft states. Submission still requires valid details.
- New request clears this scope's recovery slot as well as visible photos/contact/design. Concurrent tabs cannot revive a discarded draft. If storage fails, the app offers an explicit on-screen-only reset and warns that previously saved progress may remain.
- Preview, Sea Trial and deployment-linked/shared sessions do not offer personal recovery. Existing records and other vessels' data are untouched.
- Mail copy explains that To and Subject may be blank. Correct recipient: ikeswoodsigns.orders@yahoo.com. No automatic resend, paid service or new backend.

Testing and review
The release evidence records offline suites, actual index/PIN/main-button journey, customer/editor and delivery cases, and focused recovery tests. All contact/photos used by automated tests are synthetic. Provider HTTP and native share were simulated at their external boundaries. A fresh read-only reviewer found recovery edge cases; failing regressions were added and the fixes retested. Native Safari Mail, camera, keyboard/paste, hosted service-worker upgrade and VCarve/machining remain field acceptance.

Three field checks after installing
1. Confirm Engine 8.8.20.86 CLEARWAY, then open Ike and tap the main Design My Sign. It should open Your custom sign directly.
2. In an unbound personal live web session, opt into Remember progress, enter test details, wait for Saved, reload and Resume. Then New request should clear that work. Recovery is intentionally unavailable in shared/deployment sessions.
3. Prepare a TEST-only design and check that Share with Mail is visible. Confirm the recipient and attachment in Mail. An email send is optional; if tested, verify receipt and access to the ZIP in Ike's mailbox, including Spam.

Known field findings retained
The previous free Mail test reached Yahoo Spam and Yahoo initially blocked attachment download. This build does not claim to fix Yahoo filtering. Native paste remains a field check. VCarve validation is postponed until the user has access. The received Andie package was independently checked previously; this release includes no customer photos or personal test records.

Resources used
- GOV.UK question pages: https://design-system.service.gov.uk/patterns/question-pages/ — clear progression and carrying previously entered answers.
- W3C Web Share: https://www.w3.org/TR/web-share/ — browser-controlled share targets, files/title/text/url, no recipient field and no delivery receipt guarantee.
- IndexedDB specification: https://w3c.github.io/IndexedDB/ — transaction completion and structured local storage.
- Playwright browser documentation: https://playwright.dev/docs/browsers — repeatable browser checks; emulation is not physical Safari acceptance.

Decisions and limits
- Isolated archive copy and immutable Fairwater ZIP replace git worktree history for this ZIP project; exact patch reconstruction and rollback proofs are provided. There is no git commit history for this build.
- Treat every deployment-linked session as shared for privacy. Some personal visitors may need an unbound live web session to use recovery.
- Keep explicit native Mail handoff, including manual address/subject if needed. Spam and inbox delivery remain outside this frontend's control.
- Machine acceptance, native device behavior and hosted upgrade remain unverified here. No deferred code-review fixes remain.

Artifacts
Upload patch: replace its inner files at the repository root over complete Fairwater 8.8.20.85, keeping all other files. No Safari data clearing, record reset or permission changes.
Full backup: application source only, not customer/database/media/device-draft backup.
Rollback: software files only; does not restore or remove business records or personal drafts.
This build has not been deployed and no live email or backend change was performed.

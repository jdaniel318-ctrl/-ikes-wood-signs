# Dark Sky 5.5.1 — Test Contact Safety Audit

## Fleet contract
A project in Private Preview, Test Experience, Sea Trial, draft, setup, or any other non-live customer state must not initiate real-world contact.

Blocked until the active customer context is LIVE / deployed:
- phone (`tel:`)
- text (`sms:`)
- email (`mailto:`)
- Web3Forms / automatic order delivery
- prepared-email actions
- customer request delivery to an outside business
- external notifications

Allowed in test:
- navigation through the complete customer journey
- simulated Private Preview submission with no persisted customer/order record
- Sea Trial project-scoped test records
- local photos and form data used only for the test workflow

## Fail-closed layers
1. Customer UI labels clearly say TEST MODE / TEST REQUEST.
2. Capture-phase link guard blocks `tel:`, `sms:`, and `mailto:` before browser navigation.
3. Web3Forms delivery refuses test/non-live orders.
4. Legacy order email delivery refuses test/non-live orders.
5. Prepared mail actions refuse test/non-live orders.
6. Signal Restoration phone controls remain buttons, not telephone links, until LIVE.

## Live boundary
External contact is allowed only when the active project has a matching deployed customer context.

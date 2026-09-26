# 8.8.17.12 — Ledger TouchSafe

- Remove simultaneous smooth scroll and input autofocus when opening corrections.
- Move editing into a single-column document-flow workspace; restore the original ledger on exit.
- Use visible native review choices and explicit field-label associations.
- Show the native active-field label without redirecting input.
- Disable amount/customer/purpose editing until a deliberate unlock.
- Reject malformed amount strings, including the reported `1.00 e`, before preview.
- Preserve queue-origin deliberate amount changes when editing their preview.
- Count unverified legacy approval as review attention.
- No automatic data correction, SQL change, or live service action.

Baseline: 8.8.17.11 Ledger Closeout. Native iPad Safari verification remains pending.

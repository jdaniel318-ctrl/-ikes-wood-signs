# v3.8.3 Identity Sync & Order Command Refit Audit

## Identity synchronization
- Business rename continues to mutate display fields only.
- Immutable Project ID and technical namespace remain unchanged.
- Closing Project Control now triggers an Engine Project Command re-render so fleet cards consume the current project display name immediately.

## Project Control Orders
- Removed the raw wide table presentation.
- Added responsive operational cards with order ID/date, status, value, customer/contact, request details, and offer/source.
- Summary totals remain visible above the order list.

## Regression boundaries
- No project identity migration behavior changed.
- No authorization or project-scope functions changed.
- Mission-critical Black Flag navigation remains in place.

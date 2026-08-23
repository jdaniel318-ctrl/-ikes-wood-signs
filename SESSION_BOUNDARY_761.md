# Dark Sky 7.7.0 — Deep Sounding — Session Clarity Contract

True Bearing separated deployment state from customer-session state. Deep Sounding makes every customer-facing confirmation say exactly which non-live boundary is active.

## Required labels

- Published `OPEN PROJECT` establishes `LIVE CUSTOMER`.
- Test Experience establishes `TEST EXPERIENCE`.
- Private Preview establishes `PRIVATE PREVIEW` and creates no live order record.
- Client Preview remains independently isolated by its invite/pre-paint contract.

## Confirmation rule

A non-live submission must never fall back to a generic `TEST MODE` label when the exact session is known.

- Private Preview: `PRIVATE PREVIEW — ... No live order record was created ...`
- Test Experience: `TEST EXPERIENCE — ... test data ...`

A `PREVIEW-NO-RECORD` receipt must explicitly say that no live order record was created.

## Proving requirement

Session Boundary Voyage is CLEAR only when route state and session-specific confirmation-label contracts both verify against the current build.

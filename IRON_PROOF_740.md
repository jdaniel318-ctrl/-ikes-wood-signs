# Iron Proof 7.4.0

## Problem proved in live testing
7.3.0 could show a two-line live approval design but later review/confirmation could lose or reconstruct lettering. Metadata and a nominal artifact record were insufficient.

## Contract
`Design workspace -> build immutable PNG candidate -> show candidate on approval screen -> Captain/customer approval -> adopt exact bytes -> fingerprint -> reuse exact bytes everywhere.`

No later surface is permitted to reconstruct an approved visual from wording/style/layout metadata. Metadata is traceability only.

## Automated proof
The Proving Ground creates a synthetic plank + two-line design, renders the approved PNG through the production renderer, fingerprints it, and verifies stage-reuse contracts for approval, review, confirmation, admin and archive. Any render failure or contract gap is HOLD.

## Next maturity step
A future browser-driving voyage can validate actual DOM navigation on a managed test runner. Iron Proof establishes the deterministic artifact engine and in-app automated proof hook first.

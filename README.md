# Dark Sky 8.0.3 — Sightline

**Candidate release:** 8.0.3 Sightline  
**Known Good anchor:** 7.8.4 Harbor Exit

Sightline extends Grain Guard so Ike’s customer flow treats **length with the same confidence discipline as wood species**. The customer should not choose a length when Dark Sky can establish it safely from the plank photo.

## What changed

- Full-plank geometry is evaluated against Ike’s known stock lengths rather than converting arbitrary pixels directly into feet.
- A high-confidence one-photo match resolves length automatically. No tape measure and no customer length picker are shown.
- Medium/low confidence asks for one additional **full-plank, straight-on photo**.
- If two photos still cannot resolve length safely, the customer may confirm the rack length; a tape measure is only a fallback.
- Species and length are independent confidence gates. Price is unlocked only when both are resolved and an active owner rate exists.
- New primary photos clear stale secondary species/length evidence so an old photo cannot silently influence a new plank.
- Owner Bridge, canonical six-vessel fleet identity, clean Engine boot, and project isolation remain preserved.

## Price contract

`confirmed species rate × confirmed length = customer final price`

No low-confidence species or length estimate may become a customer price.

## Sea trial

Use the same Ike test plank. A normal full-plank photo should resolve length automatically when confidence is high. If it does not, follow the positive extra-photo prompt and verify that manual length choices appear only after two inconclusive full-plank photos.

See `SIGHTLINE_LENGTH_CONTRACT.md` and `GRAIN_GUARD_CONTRACT.md`.

# Ike Production Contract — 7.3.0 Plank Bond

Canonical source: the front and back of Ike’s current paper order form supplied during live testing.

## Preserved business rules
- 2 ft standard: no more than 14 letters/spaces.
- 4 ft: no more than 24 letters/spaces.
- 6 ft: no more than 36 letters/spaces.
- Spaces count; numbers/punctuation remain exact customer input.
- Lettering styles: A, B, C.
- Letter fill: Black, White, None/carved, or Other.
- Other color may require customer-supplied spray paint; paint is returned at pickup.
- Exact sign side/top orientation is production-critical.
- Pickup notification preference: Text or Call.
- Typical pickup window: 7–10 days after acceptance.
- Customer approval/sign-off is required.
- Ike retains the right to refuse/cancel an order.

## Digital equivalent of the rubber band
The paper form stayed physically attached to the chosen blank. The digital equivalent is one project-scoped plank/order record plus one immutable approved visual artifact. Once approved, later surfaces must reuse that artifact rather than re-running the layout engine.

## Artifact integrity
Approve My Design now flattens the exact live preview, fingerprints it, assigns an artifact ID, and verifies the same artifact before order creation. If the fingerprint no longer matches, order creation is blocked and the customer must return to Design Review.

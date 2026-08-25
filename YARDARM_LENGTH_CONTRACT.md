# Yardarm Length Contract — Dark Sky 8.0.8

## Mission
Give Ike's customers a one-photo path whenever the plank's visual geometry clearly identifies one of Ike's known rack lengths, without pretending that pixels are an absolute ruler.

## Rules
1. Length classification is constrained to Ike's configured rack lengths (currently 2 ft, 4 ft, 6 ft) unless the customer explicitly confirms another length.
2. The primary signal is whole-plank long-axis / short-axis pixel ratio. Rotation does not change that ratio.
3. Auto-resolution requires: a complete framed plank, stable long-axis geometry, a ratio inside a calibrated core band, and adequate separation from adjacent stock-length bands.
4. Ambiguous overlap or poor framing never silently resolves. Request one more full-plank view, then fall back to a positive rack-length confirmation.
5. Pixel-derived length is stored with its evidence (ratio, band, score, pixel dimensions, resolution method) and is flagged for Ike visual review before production.
6. Species, orientation, length, and active owner pricing are independent gates. Customer price appears only after all required gates clear.
7. Ike retains the right to reject an order when the stored photo and visual evidence do not support the submitted plank.

## Current calibration
The bands are classifier bands based on real live-edge stock proportions, not inch measurements:
- 2 ft: aspect ratio 1.45–3.20; high-confidence core 1.65–2.95
- 4 ft: aspect ratio 3.05–5.45; high-confidence core 3.45–5.05
- 6 ft: aspect ratio 5.20–9.50; high-confidence core 5.85–8.70

Overlap zones are intentionally conservative.

## Acceptance test
With the known 2 ft cedar test plank, a normal full-plank photo should resolve Horizontal + Cedar + 2 ft + the owner-configured Cedar price when the board is fully framed. If visual geometry lands near a band boundary, the system must ask rather than guess.

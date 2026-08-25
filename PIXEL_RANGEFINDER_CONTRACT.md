# Dark Sky 8.0.6 — Pixel Rangefinder Contract

## Mission
Use whole-plank pixel geometry to classify Ike's known rack length when evidence is strong enough, without pretending pixels are an absolute ruler.

## Rules
- Length classification is constrained to Ike's configured stock lengths (currently 2, 4, and 6 ft).
- One well-framed photo may resolve length when the nearest stock is close and clearly separated from the runner-up.
- A visual length resolution stores its pixel evidence, confidence score, estimated feet, candidate stock length, and requires Ike visual review before production.
- The customer may continue and receive a price when species, orientation, active rate, and visual length all clear their gates.
- Ike retains the right to reject an order when the order photo does not match the visual length result.
- If evidence is not strong enough, the system asks for one additional full-plank photo; after two inconclusive views it asks for rack-length confirmation instead of repeated photos.
- Manual/rack confirmation clears the owner-review flag for length.

## Safety principle
This is inventory-constrained visual classification, not survey-grade physical measurement. Uncertainty must be explicit internally even when the customer experience stays simple.

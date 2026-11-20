# Rally Kit

These modules can be imported into a vessel independently. Run `node --test fleet.test.mjs` in this directory. The examples contain synthetic data.

## Use in a vessel

- Travel and ScheduleJoe can call `dayToOpen` with the destination or job-site time zone. `reflow` returns proposed changes to flexible appointments and preserves fixed or completed stops. An unplaceable stop returns a null time. Ask the operator to resolve it before committing.
- Legacy Plumbing can pass the confirmed service address to `routeLinks`. The chosen map application supplies the starting point.
- A lodging or activities partner can call `previewOffer` using its own capacity and price floor. Only a reviewed offer and its public terms belong in a customer-facing calendar.
- `makeRoom`, `apply`, and `project` in room-model.mjs implement two independent confirmations for a Weegee challenge. Another vessel can reuse the pattern with new, vessel-scoped participants.

## Authority and rollback

Resolve the actor from the receiving application's authenticated server session and verified assignments. Call trialChange on the server. A First Mate can prepare a proposal for an assigned vessel. A Captain can activate a dated trial or disable it for that vessel. An authorized Admiral can release the template for consideration elsewhere. Each receiving vessel accepts its own trial. Promotion returns only a tool name and availability. It conveys no traveler, customer, journal, photo or account access.

The host application must store trial revisions atomically and audit actor, vessel, operation, time and previous revision. Check trialEnabled at the protected operation using a trusted current date. The example keeps state in memory and makes no changes to Black Flag. Run `node preview-registry.mjs /path/to/FLEET_LEARNING_REGISTRY.json` for a read-only preview against the real registry. The registry additions are candidates to merge individually after review.

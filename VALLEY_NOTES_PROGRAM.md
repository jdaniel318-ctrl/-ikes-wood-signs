# Valley Notes — Admiral program brief

## Mission and current scope

Help a traveling party enjoy its time together with fewer decisions and a relaxed, weather-aware plan. The product is designed for trips anywhere in the United States: city breaks, beaches, parks, road trips, family visits, events and group-created ideas. The existing private Shenandoah Site is the first working pilot, not the geographic boundary. This release adds its entry and retained requirements to Admiral My Fleet / Programs & tools and Build & Govern. It does not commission a server vessel, turn on billing, grant access to the private Site, migrate private trip data, or claim conversational assistance is implemented.

## Expand across US trip ideas and destinations

Separate the reusable trip engine, optional destination research, and private trip data. Accept arbitrary US destinations and user-created stops; do not require an existing destination pack or a fixed trip-category list. Support a single base or multiple destinations, overnight stays, travel legs and dates. Groups can mix trip ideas and change them without recreating the trip. Retain provenance and confirmation status for custom ideas; never present a user-entered place as externally verified.

Each location has coordinates/place identity and a timezone; each leg has departure/arrival instants and local display times. Weather is queried for the stop and relevant date/time, including elevation differences where reliable. Long-range dates outside forecast coverage show a planning limitation; seasonal context is labeled separately. US regions with limited coverage, provider errors or missing data remain usable through manually entered stops, notes and source links. Do not manufacture opening hours, distances, accessibility or forecast certainty to fill gaps.

The national system must be tested across urban and rural trips, multiple US timezones, daylight-saving transitions, multi-stop road trips, Alaska/Hawaii and places outside a provider's coverage. This is an expansion requirement; nationwide verified coverage has not been delivered by this pilot.

## Preserve the useful guide

- Daily weather, high/low temperatures, wind, valley/ridge differences, a source link and an honest update time. Distinguish a retained forecast from observed weather; weather changes suggest alternatives rather than silently canceling plans.
- Today's day opens automatically in the trip's timezone. Previous days, completed stops, edits and rejected suggestions remain available.
- One primary outing, a small number of weather alternatives, flexible meals and free time.
- Compare walking, driving, cost, atmosphere/privacy and weather suitability. Drive estimates identify their origin and are not presented as live traffic.
- Food choices for every participating traveler, call and navigation links, opening hours, booking status and clearly marked uncertainty.
- Retain the existing PDF fallback. Downloadable in-app offline plans and background synchronization are future work, not established capabilities.

## One account can represent several people

An account is the billing/access container. A traveler is a person with a stable identifier and individual preferences. A trip selects its participants from those travelers, optionally as a reusable group. Participation can differ by trip or outing; only participating travelers influence that shared activity. An authenticated membership grants permissions; being named in a trip does not grant a login or access to another trip. Invited collaborators from other accounts receive explicit trip-scoped access, not access to the account's other people or history.

The account owner may manage companion profiles without requiring each companion to register. Each fact retains its subject traveler ID, reporter, source, scope (lasting or this trip), confidence/confirmation, and update time. Companion-reported facts can later be reviewed and corrected by that companion. Linking a traveler to a login requires a verified invitation/acceptance; matching a name or email alone is insufficient. Personal preferences and trip history stay inside their authorized account and trips.

Store dietary restrictions separately from likes. A stated beef avoidance does not imply an allergy, vegetarianism or a seafood preference. Hiking interest does not prove walking ability. Ask focused questions when an unknown would change the next decision. Support editing, forgetting and undo; a temporary mood must not silently become a lasting preference.

For a shared meal, require a suitable choice for each participating traveler; one person's beef preference must not erase another's avoidance or exclude a mixed-menu restaurant that suits both. Apply each person's hard constraints before ranking interests. Explain which choices suit whom. Keep shared constraints such as available time, weather, driving budget and reservations at trip level. Split activities only when the travelers choose that option.

## Learn from field feedback

Keep separate records for proposed, accepted, completed, skipped and unavailable stops. Record who reported a change and when. A closed-at-arrival report belongs to that visit and triggers verification; it does not establish permanent closure. User reports can improve regional place facts after review; personal profiles, lodging addresses and private conversations are not exported as fleet learning.

Reusable fleet candidates: account/person separation; attributed preferences; group constraint checks; weather freshness and alternatives; append-only day history with undo; and source-backed uncertainty. Adapt these to each vessel before adoption. For example, learning profiles and purchaser/recipient relationships share the person/account distinction, but not travel-specific preferences.

## Next implementation sequence

1. Scoped account, traveler, group, trip, destination/leg and membership storage; authorization and cross-account isolation tests; import current browser drafts without overwriting them. Keep destination-specific content outside the engine.
2. Traveler profile editing and party-aware suggestions; quick updates for finished, closed, skip, hungry and less walking; shared-device synchronization, conflict handling and undo.
3. Weather refresh with clear location and freshness, retained offline plan and honest unavailable/stale states.
4. Optional on-demand conversational assistance, bounded usage costs and fresh-source lookup. No passive microphone monitoring.
5. Pilot with additional parties and hosts before selecting a commercial model. Prior price examples are experiments; no pricing, payment or subscription is activated.

## Approach and boundaries

Selected implementation for this release: retain the private Site and add an Admiral program entry, preservation contract and fleet-learning candidates. Copying the personal itinerary into the public fleet repository would expose personal data and make two diverging guides. Full server commissioning and shared profiles belong to the next implementation; claiming them from a local shortcut would be inaccurate. The existing fleet, authentication, owner surfaces and server registry remain unchanged.

Acceptance: both Admiral entries show the pilot status, working guide link and understandable profile/weather requirements; no traveler data is bundled; no new authority or registered-vessel count is inferred; existing tests pass; upload and rollback reconstruct their exact source baselines. Hosted Admiral sign-in and physical iPad acceptance are separate from local verification.

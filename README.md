# Dark Sky 8.8.20.7 — HarborPass

HarborPass is a focused commissioning-authority bridge built from the verified ForgeSeal baseline. It keeps commissioning drafts session-safe, and when Fleet Core reports that server persistence requires authorization it offers **AUTHORIZE THIS VOYAGE** in the same browser tab. The existing Admiral PIN + account gate is reused; no new credential path, owner grant, Captain grant, or server authority is invented.

After the same-tab Admiral workspace becomes verified, HarborPass returns to the preserved commissioning voyage and retries the explicit draft save. `SERVER SAFE` is shown only after the existing VoyageGuard server save and readback confirm the same voyage ID.

The previously proposed new scoped-authorization database migration was **not applied** and is not required by this release. HarborPass uses the already-live authenticated Fleet Core authority boundary.

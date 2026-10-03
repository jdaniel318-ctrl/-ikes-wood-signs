# 8.8.20.7 — HarborPass

- Added same-tab **AUTHORIZE THIS VOYAGE** recovery when server draft save reports authorization/sign-in required.
- Preserves the current commissioning draft and stage before opening the existing Admiral security gate.
- On verified Admiral workspace return, reopens the commissioning voyage and retries Save Draft once.
- Keeps `SESSION SAFE`, `SERVER SIGN-IN REQUIRED`, `SERVER SYNCING`, `SERVER SAFE`, and `SYNC NEEDED` semantically distinct.
- No owner/Captain assignment, vessel commissioning, billing, publication, or new database migration is performed by the release.

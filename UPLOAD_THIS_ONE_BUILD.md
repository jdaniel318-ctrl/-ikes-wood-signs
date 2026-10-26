# Ironhaven 8.8.20.66 — Upload this ZIP only

Upload `DarkSky882066-Ironhaven-Upload44.zip` (the single internal folder's contents) **over the existing Keelwatch 8.8.20.65 repository**. Replace matching files and keep all others. The full backup is a separate archival ZIP. Do not clear Safari storage or run SQL.

**What changed:** the appointed Captain account can set/change its own Supabase password even if appointment was revoked; appointed Captains can download and verify an AES-256-GCM encrypted **partial** recovery snapshot for their own vessel. NO restoration to Supabase, no automatic cloud backup, no authority grant.

**Verification:** run `node VERIFY_IRONHAVEN_CORE.cjs` and `node VERIFY_IRONHAVEN_RELEASE.cjs` in a full release directory. iPad password-provider confirmation and native encrypted download remain to be tested. See IRONHAVEN_GUIDE.md.

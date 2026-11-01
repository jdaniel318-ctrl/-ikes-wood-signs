# Upload TradeWinds 8.8.20.76

Use `DarkSky882076-TradeWinds-Upload.zip`, not the full backup or rollback.
1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.
2. After deployment open the Engine and confirm `8.8.20.76 · TRADEWINDS`. Do not clear Safari data, reset records or change permissions.
3. Follow the three iPad/iPhone checks in TRADEWINDS_GUIDE.md. Start with the iPad that holds your saved HouseHull records.

Trade Winds adds explicit per-business cloud workspaces, receipt-based interrupted-save recovery and separate unsaved draft recovery. Original device records stay intact. HouseHull remains planned; existing Admiral/PIN/session rules and Captain access are unchanged. Read TRADEWINDS_GUIDE.md for the three-device-check pilot, recovery and rollback limits. The additive backend prerequisite is already applied; do not run its SQL again.
The upload itself executes no database commands. Read the current guide before enabling new features. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.

Full backup: application source ONLY; not Supabase, customer media or device drafts.
Rollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.
No passkeys/Face ID or performance gain is claimed.

# Install Pilothouse 8.8.20.155

1. In the Black Flag Fleet Core Supabase SQL Editor, run the entire `PILOTHOUSE_SHIP_TOOLS.sql` script once after Soundings. The companion file `Pilothouse-Setup.txt` contains identical SQL. Wait for the SQL Editor to report success.
2. Extract `Pilothouse.zip` (the upload archive). Upload every file inside its single folder to the existing site root over 8.8.20.154. Replace matching files and keep all other files.
3. After deployment, the Engine label reads `8.8.20.155 · PILOTHOUSE`. Open Standardize → Course Orders to manage the selected ship's tools.

Admirals assign Quotes & invoices by ship. Captains enter their branded station, start quotes and invoices directly, save and review flat jobs in one step, and prepare the finalized PDF.

`Pilothouse-Source.zip` is a full application source backup. To restore the previous software, upload the contents of `Pilothouse-Rollback.zip` to the same root. Keep the Admiral-only database setup in place. Never restore old permissions or business data. Business records and customer media are stored separately.

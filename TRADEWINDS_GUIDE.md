# Black Flag 8.8.20.76 · Trade Winds

Trade Winds brings the same saved business quote to your iPad and iPhone, with explicit cloud connection and recovery when a save is interrupted.

## Install

Use **DarkSky882076-TradeWinds-Upload.zip** over the complete **8.8.20.75 Highwater** repository. Extract it, open its single folder, and upload every file inside to the existing repository root. Replace matching files and keep everything else. After GitHub Pages finishes, reopen the site and confirm **8.8.20.76 · TRADEWINDS**.

The additive Supabase setup has already been applied and verified separately. Do not run the included SQL again. Uploading this software does not migrate your business records. Each business connects only when you choose **Use across devices**.

Keep your existing Quartermaster JSON backup. Do not clear Safari website data or reset your business workspace during this pilot.

## Three checks on your devices

1. **Connect from the iPad.** Sign in to Admiral, open Quotes & invoices → HouseHull, and select **Preview across devices**. Check that the saved catalog and document counts match your existing workspace (your last screenshots showed 12 items and 2 drafts). Choose **Use across devices**. Confirm **Saved across devices**. Your original device records remain here.
2. **Open on the iPhone.** Use the same site, backend/environment and Admiral account. Choose HouseHull → **Preview across devices** → **Open cloud workspace**. Open the Highwater review quote. Its number, saved revision, eight siding cartons and **$6,271.00** should match the iPad. Prepare its PDF and compare the revision and total.
3. **Prove a round trip.** On the iPad change siding from 8 to 9 cartons and choose **Save draft**. Wait for **Saved across devices** and **$6,460.00**. On the iPhone select **Refresh saved records**, reopen the quote and verify the new revision and total. Then restore 8 cartons on the iPhone, save, and refresh/reopen on the iPad to confirm **$6,271.00**. Keep this sample as a draft.

If any check differs, keep both copies and send the visible status plus the document number, revision and total. Avoid recreating the example or replacing records to force a match.

## Interrupted saves and editing

- **Check save result** reads the server receipt. It does not resend the change. A confirmed receipt opens the saved copy; a separate unsaved draft in another tab stays intact.
- If the server has no receipt and the base revision is unchanged, **Retry retained save** explicitly sends the same operation ID and exact payload. There is no automatic write retry.
- If another device saved first, keep the recovery file and review the newer saved copy. The app does not silently combine competing edits.
- Document edits are kept separately as recoverable drafts on the editing device. After signing back in, **Resume draft** is available when the saved revision still matches. Resuming creates a separate editor copy; the original recovery stays available for explicit discard. A recovery file is private and is not a normal business backup.
- A cloud outage leaves cloud mode unavailable until verified again. **Open device records** explicitly opens the original local archive; it does not copy later cloud work back.
- Prepare PDF uses a saved snapshot. Save and reopen the quote to compare current revisions across devices.

## Scope and limits

Each business is isolated by account, backend, environment, site and business ID. HouseHull remains a planning workspace. Existing PIN/account verification, session limits and Captain access are unchanged. No quote is sent, ordered or paid automatically.

This pilot uses a 5 MiB cloud snapshot limit. Local backup/restore retains its 25 MiB limit. Larger workspaces remain on device; there is no truncation. Cloud collaboration between different accounts, background synchronization and automatic conflict merging are not included.

Automated checks cover real PostgreSQL functions, native browser storage, independent device contexts, same-browser tabs, interrupted saves, revocation, conflicts and matching PDFs. The live backend save/receipt/permission smoke test passed with all synthetic records rolled back. Physical iPhone/iPad Safari acceptance and the hosted end-to-end Auth flow still require the three checks above. Browser storage eviction or termination before an edit reaches durable storage cannot be guaranteed recoverable.

A known minor wording limitation remains: a server-reported conflict may first appear as an unconfirmed save. **Check save result** identifies the conflict safely without resending it.

## Files and rollback

- **Upload.zip:** changed/new application files for the existing .75 repository.
- **FullBackup.zip:** complete .76 application source. It is not a backup of cloud records, device drafts, customer media or Supabase.
- **DarkSky882075-RollbackFrom882076.zip:** restore these prior software files to return to Highwater .75. New unused files may remain. The additive cloud tables and cloud records remain intact. Highwater opens the original device records and cannot display later cloud-only changes; export a current cloud business backup before a planned rollback.
- **TRADEWINDS_EVIDENCE.json:** checks, backend verification and remaining acceptance limits.

## Review decisions

Historical validation now checks prior saved definitions with a grouped comparison; the original repeated line scan was replaced because valid workspaces could become too slow. The timing evidence is from PGlite, not a production speed claim. Existing Admiral activity tracking already covers this workspace, so its timeout rules needed no change. Frontend publication remains your existing ZIP upload workflow.

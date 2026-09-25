# 8.8.17.10 Ledger Recovery Keel — Release Acceptance

This release is acceptable only when ledger recovery is evidence-preserving and fully verified.

## Recovery gates

- [ ] Engine front page visibly reports `8.8.17.10 • LEDGER RECOVERY`.
- [ ] Fleet Ledger opens with a visible Ledger Recovery status row.
- [ ] Recovery inspects the current durable book plus legacy same-origin web-storage keys and cataloged ledger-like IndexedDB databases.
- [ ] Only ledger-shaped records are accepted; no transaction is fabricated from an expected total.
- [ ] A ledger-shaped record is rejected unless its entity resolves to a current canonical Fleet/office/program boundary.
- [ ] Distinct legacy `entry_id` values remain distinct transactions.
- [ ] Durable IndexedDB is written and the complete ledger proof matches on read-back.
- [ ] The migration receipt is written only after durable verification succeeds.
- [ ] Legacy source storage is not deleted during recovery.
- [ ] A recovery mirror is written and read back when localStorage has capacity; mirror failure does not erase a verified durable ledger.
- [ ] If the two prior $1 test records remain in browser storage, Simple Books shows $2.00 Money In after recovery.
- [ ] If they no longer exist in same-origin storage, the UI reports that no earlier records were found and creates no replacement entries.

## Existing Clear Orders gates

- [ ] To Check presents one unresolved record and three required resolution steps at a time.
- [ ] A verified append-only correction advances to the next record automatically.
- [ ] Payment methods include Check, ACH, cards, digital wallet, bank transfer, cash, and another trackable method.
- [ ] New transactions are written once and read back before success is shown.
- [ ] Captain's Quarters keeps Watch, Decide, Act, and Record distinct.

## Authority and isolation gates

- [ ] Captain browser evidence and Admiral server-attested evidence remain visibly separate.
- [ ] Admiral reads still require an active authenticated Fleet Core Admiral grant.
- [ ] Passage PINs do not grant server authority.
- [ ] Six Fleet Core project identities remain unchanged and exact-project isolation is preserved.
- [ ] Bootstrap Build remains a separate Admiral program until explicitly commissioned.
- [ ] Test/private-preview real-world phone, email, and messaging actions remain blocked.

## Release identity

- [ ] `index.html`, `app.js`, `platform_identity.js`, `fleet_supabase.js`, `DEPLOYMENT_MANIFEST.json`, `RELEASE_SEAL.json`, `RELEASE_INVENTORY.json`, `manifest.webmanifest`, and `sw.js` agree on build and seal.
- [ ] Every inventoried file exists and every deployed file is inventoried.
- [ ] `CHECKSUMS.sha256` verifies without error.
- [ ] ZIP filename and its single top-level folder share the exact unique release name.
- [ ] File timestamps are normalized tightly to the build time.

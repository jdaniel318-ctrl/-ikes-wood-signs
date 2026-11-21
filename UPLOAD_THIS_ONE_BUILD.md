# Tally 8.8.20.152

1. Extract Tally.zip. Upload the contents of its one folder to the existing Black Flag repository root over Clipper 8.8.20.151. Keep the other files. The Engine shows 8.8.20.152 · TALLY after deployment.
2. The fleet database administrator enables numbering once with TALLY_INVOICE_NUMBERS.sql on the existing Black Flag Fleet Core project. The script checks the installed Trade Winds validator before installing the registry. The website upload alone cannot activate it.
3. In Quotes & invoices, select the test ship and tap New invoice. On first use enter its assigned three-character code. A code such as 007 produces 007-00001 on the first reservation. VKT produces VKT-00001. Enter one code for the ship and use the same series across devices.

Numbers are reserved when an invoice draft is created. A discarded draft or a closed tab can leave a gap. Issued numbers stay assigned. An interrupted creation can be retried in the same tab. The serial grows to six digits after 99999. Existing documents keep their saved references.

Tally-Source.zip is a full software backup. Browser records and customer data require their own backups. Tally-Rollback.zip restores the previous frontend. Never restore old permissions or business data. Before testing a rollback, export any workspace containing short numbers and retain the numbering registry. Clipper cannot validate a backup or cloud workspace containing the new format. Reinstall Tally to work with those records.

# Black Flag 8.8.20.37 — Strongbox TEST

A bounded backup compatibility repair over complete Headway .36. Follow **START_HERE_STRONGBOX.md**, not an older START_HERE file. The small update includes only changed/new files, while the full recovery snapshot preserves every Headway filename.

The shared owner backup now preserves NaN, positive/negative infinity, negative zero, explicit undefined values, sparse arrays and null-prototype plain objects in a reversible, typed v2 archive when ordinary JSON cannot represent them faithfully. Every affected location is recorded in the checksummed manifest and displayed safely as text. Ordinary JSON-compatible records retain the v1 format. Existing v1 files remain readable.

No original record is corrected, omitted, repriced, or rewritten. New-job numeric validation is unchanged and still rejects invalid values. Unsupported archival types fail explicitly with a field path, instead of being silently converted. No supported-type claim is made for arbitrary IndexedDB values such as Date, Blob, typed arrays, cyclic graphs, or Maps.

The owner gate, namespace binding, customer forms, production geometry, nominal-size preview, no-retry policies and HouseHull plan are unchanged apart from release identities. The real owner-stock service and new complete-job production/Sea Trial path remain held.

Full verification details and limits: **TEST_BUILD_REPORT.md**. Checksums detect inconsistent content, not malicious authorship. This is TEST only, not production launch, a server security audit, actual database restore, or cloud durability certification.

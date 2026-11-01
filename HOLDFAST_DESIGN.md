# Holdfast — older Ike storage repair

Approved scope: the Captain requested the three-part repair proposed in this conversation: preserve old records, compare before cleanup, and correct/polish recovery UI, then return to ship work.

Keep existing fleet structure, authority and ship records. Add an Engine-only recovery panel for exactly three legacy keys: ikesWoodSignsOrdersBackupV15, ikesOrderDraftV2, ikesOrderDraftV2:ikes-wood-signs. Save exact raw strings, including malformed JSON, with SHA-256 checksums in a separate recovery JSON. Parse the generated file and verify exact round-trip coverage before offering it. Verification of a saved file requires selecting it from Files; no claim that clicking download proves saving.

Compare old orders against canonical IndexedDB orders only. Every field and media value in an old row must remain in the corresponding current row; only additional current fields are allowed. Require matching Ike scope, unique current ID, and absence from quarantine. Missing/changed/ambiguous/malformed records stay. Compare each old draft against the full current Ike draft. Equal displayed sizes never prove duplication.

An old key is eligible only if its entire payload is redundant. Removal is explicit, Engine-authenticated, follows saved-file verification, re-reads canonical orders and local values, and requires unchanged raw source values. Only allowlisted redundant keys can be removed. No startup cleanup, migrations, guessed restores or permission changes. Capture and comparison never write application storage. Failures/timeouts/sign-out produce no new successful artifact or cleanup. A partial removal error reports exactly what was removed and keeps the verified archive link.

Current Captain backup remains the compatible version-3 orders/settings export. The separate older-records file complements it, without being described as a complete fleet backup. Hull counts must distinguish current mirrors and older sources and must not report Clear when old drafts exist. Closed nested accordions show closed indicators. iPad/iPhone controls wrap without clipping.

Approaches: automatic migration/deletion was rejected because unique content is unknown; export-only leaves no supported path to reclaim proven redundant data; chosen implementation is export, saved-file verification, current comparison, explicit narrow removal. Existing JS/CSS and browser APIs; no new dependency or backend. Native Safari acceptance remains a device check.

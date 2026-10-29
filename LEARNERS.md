# Multiple learners — Wonderwake First Light

The learner picker opens when the page starts. Select a starter profile (Starling, Comet or Aurora), or use **Add learner**. Up to **24 local profiles total** are supported for this family preview, including the three starters. Use nicknames, not real names or dates of birth.

Each learner has a stable ID separate from their nickname. Mathematics, spelling, practice evidence, discovery sparks, studio creations, character, sound, motion and lighting settings belong to that learner. A teenager can start with high-school sample challenges while another learner practices counting. Choosing an advanced starting challenge does not mark earlier topics mastered.

## Switch and manage

Use the learner button in the header. The game names the active learner inside activities. A new learner starts empty; no sibling’s results or creations are copied. In **Grown-ups**, rename the active learner or change math and spelling starting points separately. No grade or identity details are required.

Names are labels, not login credentials. Every person with access to this browser can switch learners. No authenticated parent gate, classroom authorization, remote teacher account, cross-device sync or server tenancy has been implemented.

## Saving

This preview uses its own IndexedDB database. A save waits for transaction completion and compares a separate readback. This is not a guarantee against later browser eviction or device loss. When saving fails, the message says so; unsaved work is kept in page memory when switching learners. It is lost if the page closes without a successful save or export. Use one active game tab per device. Concurrent editing of the same learner across tabs is unsupported.

## Progress files

Export each learner separately from Grown-ups or the footer. A file includes that learner’s nickname, learning history, settings and creations. It is not encrypted. Keep it in private Files storage, never in a public repository.

**Check / import** validates the file structure and SHA-256 checksum. Cancel the replacement prompt to verify without writing. An existing ID must match the active learner before replacement. A new UUID learner can be added as a separate profile with confirmation, without replacing existing learners. Imported data is not academically certified: checksums detect accidental alteration, not the identity or honesty of its creator.

## Acceptance on your iPad

Create two nickname-only learners. Complete one small math or spelling mission and a studio creation for the first. Switch to the second; the first learner’s work must not appear as the second learner’s progress. Switch back and verify the first learner’s work returns. Export that learner and verify the saved file without importing it. Native Safari, real device persistence and browser speech remain acceptance tests, not results claimed by the packaged fixture tests.

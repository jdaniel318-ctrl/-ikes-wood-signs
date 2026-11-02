# Clearway 8.8.20.86 — implementation plan and spec

Approved goal: a clear Ike customer journey, recoverable work on personal devices, clean shared-device starts, and checks from the real customer entry point. Free Mail remains primary. No deployment, email sending, backend changes or VCarve certification.

1. Write failing actual-index main CTA test and customer tests for guided next controls, visible Mail actions, opted-in recovery, default clean start, explicit discard and scope isolation.
2. Route only Ike welcome CTA to the guarded request host. Keep other vessels navigation unchanged.
3. Add section navigation and persistent next action; preserve fields and artwork when moving sections. Move Mail actions into view after prepare; state recipient/subject may need entry in Mail.
4. Add opt-in private-device recovery in separate scoped IndexedDB store. Never list personal data before Resume. Preview/kiosk have no persistence. New request/discard clears only this scope's recovery slot. Concurrent updates fail closed. Storage failures remain visible; no saved claim until commit. Restore requires review, never sends anything.
5. Run focused browser and full release suites; fresh independent final review; seal/package diff against exact Fairwater source, reconstruct patch and rollback, save upload/full backup/proof.

Review focus: draft-write races (close/reset, prepare/edit), cross-tab CAS, context revocation, quota failures, kiosk boundary, main entry preview guards, retained data vs new customer, short mobile viewport and status/footer visibility. No browser simulation claims native iPad Mail or paste compatibility.

Sources: GOV.UK question-pages (carry answers, clear steps), W3C Web Share (share target controlled by browser; no recipient API), IndexedDB for structured local drafts. Existing fleet authority remains unchanged.

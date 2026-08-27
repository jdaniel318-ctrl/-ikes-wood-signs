# Dark Sky 8.2.7 — Keelbook Release Discipline

## Mission
Make prior fleet learning executable as release discipline. The 8.2.7 pass does not multiply customer features; it strengthens how future passes are judged.

## Required preflight sequence
1. Verify incoming build/seal agreement before application paint.
2. Run static release checks: JavaScript syntax, JSON validity, duplicate IDs, local-reference existence, required runtime presence and checksum generation.
3. Replay authority/isolation gates.
4. Replay deterministic navigation and mobile gates.
5. Replay customer/owner separation gates.
6. Replay vessel-specific production-truth gates when that vessel is touched.
7. Replay Foundry/service-contract/ledger boundaries when shared capabilities are touched.
8. Record intentional deltas and confirm everything else is inherited behavior.
9. Keep **The situation** excluded from fleet evidence unless explicitly authorized by the Captain.
10. Captain remains final manual Known Good promotion authority.

## Failure semantics
- BLOCK: security, authority, project isolation, mixed-build, startup hang, wrong-vessel first paint, data bleed, customer real-world contact in test, or production-truth violation.
- HOLD: incomplete evidence, missing optional route asset, ambiguous service-contract permission, unverified mobile path, or noncritical visual/UX uncertainty.
- PASS: inherited contract verified or intentionally replaced by a documented, approved successor contract.

## Regression evidence rule
Older project/chat/build evidence is not copied wholesale into runtime. It is distilled into contracts, tests and release gates. This preserves learning without coupling the live fleet to old implementations.

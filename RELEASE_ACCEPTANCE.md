# 8.8.20.18 KeelLock acceptance focus

Native iPad acceptance requires the recovered-voyage button to visibly enter Admiral verification, return to the same commissioning voyage, re-read Fleet Core, and only then enable server-safe continuation. A visible button with no transition is a release failure.

# 8.8.20.18 KeelLock — Release Acceptance

Package-level acceptance: PASS. Native iPad field acceptance: PENDING. This release changes recovery presentation/navigation only and preserves server authority boundaries. Final-byte hashes are regenerated after all edits.

# VoyageKeeper 8.8.20.14 — Release Acceptance

1. Confirm 8.8.20.14 · VOYAGEKEEPER boots without Release Recovery.
2. Open Test Exterior Services and save the small persistence-test brief.
3. If authorization is required, choose AUTHORIZE THIS VOYAGE.
4. Confirm the focused Admiral gate stays on the commissioning course and does not open the Admiral Command Deck.
5. After verification, confirm automatic return to the same voyage and SERVER SYNCING → SERVER SAFE.
6. Independently verify the matching Fleet Core voyage row before continuing.
7. Confirm no owner/Captain/publication/production authority changed.


## 8.8.20.14 VoyageKeeper
- Recovery pointer survives Engine lock without claiming server truth.
- Engine re-entry restores an unfinished voyage into a Secure Voyage checkpoint instead of a blank commissioning form.
- Admiral recovery re-reads Fleet Core before any server-safe claim and never overwrites an authoritative voyage from a hint-only draft.
- Step 2 cannot advance without a Forge Plan.
- Commissioning stage transitions checkpoint the latest stage and mark server state syncing until read-back completes.
- Recovery and authorization use command-surface styling; red is reserved for actual failure.


## 8.8.20.18 KeelLock — release integrity repair
BlackWake field proof isolated a packaging-order defect: final runtime bytes and DEPLOYMENT_MANIFEST runtime hashes diverged. KeelLock regenerates integrity hashes from the final immutable bytes and validates the package before ZIP handoff. Runtime integrity remains fail-closed; no checksum bypass was added. Field deployment proof remains required.

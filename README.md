# Dark Sky 8.8.20.24 — KeelProof

Client test candidate for the recovery-details button failure in Dead Man's Chest.

- Recovery controls use replacement-style handlers; reopening or rebinding does not stack click actions. Render owns initial binding.
- View Recovery Details opens one inline panel; Close returns focus. Disclosure state and visible button text stay synchronized. No draft write or commissioning action is triggered by inspection.
- Banner, details and footer share one recovery-status derivation. A cached recovery flag or command receipt cannot manufacture current verification. Matching in-memory Fleet Core read-back and the existing sync/pending states are required for the verified display.
- Async sync-state changes repaint only recovery/status UI, retaining unfinished field input. Open details remain open during same-draft refresh.
- All 94 original deployment files are retained. No new deployment files, project removals, SQL execution, live permissions changes or publication occurred in the build process.

Upload the extracted folder's CONTENTS to the existing deployment root, including the small JSON/hash files. Do not upload the enclosing folder as a new nested website. Keep existing project/browser data.

Native iPad acceptance is still required: same VoyageKeeper draft, same Step 5; one tap opens details; Close and reopen work; all three recovery labels agree. Do not reset the draft or advance commissioning during this check.

## Inherited release notes
The older notes below are preserved history, not proof that those live workflows were rerun for IronLatch.

# Dark Sky 8.8.20.22 — Dead Man's Chest

KeelLock converts live Fleet Core inspection into enforceable authority-hull doctrine. It preserves DeadReckoning recovery behavior, adds explicit RPC/scope regression gates, and ships a non-destructive supporting-index migration. No RLS widening or authority shortcut is introduced.

# Dark Sky 8.8.20.22 — KeelLock

KeelLock hardens VoyageKeeper recovery into a native Black Flag command surface. Recovered voyages now show one explicit next action, block forward navigation until Fleet Core is re-read, and expose recovery evidence inline instead of through browser alerts.

Browser/session storage remains a cache. Fleet Core remains the durable commissioning authority.

## 8.8.20.22 KeelLock
- Replaces the commissioning Recovery Inspector browser alert with an inline Black Flag evidence panel.
- Makes the pending recovery state explicit: one security step remains, then the voyage resumes.
- Disables ordinary Continue while a recovered voyage still requires Admiral/Fleet Core re-verification.
- Treats a missing prior command receipt as informational when authoritative Fleet Core read-back is already verified.
- Preserves HashLock final-byte runtime verification, strict project isolation, and fail-closed release behavior.
- No vessel data, authority assignments, production status, or project boundaries are manufactured by this release.

# Dark Sky 8.8.20.14 — HashLock

VoyageKeeper preserves PassageLine's focused Admiral authorization and adds server-authoritative commissioning recovery after the required Engine PIN. If Fleet Core holds an unfinished voyage, successful Engine re-entry resumes that exact voyage and displays its recovery banner instead of silently landing at generic Engine home.

Browser/session storage remains a cache. Fleet Core remains the durable commissioning authority.


## 8.8.20.14 VoyageKeeper
- Recovery pointer survives Engine lock without claiming server truth.
- Engine re-entry restores an unfinished voyage into a Secure Voyage checkpoint instead of a blank commissioning form.
- Admiral recovery re-reads Fleet Core before any server-safe claim and never overwrites an authoritative voyage from a hint-only draft.
- Step 2 cannot advance without a Forge Plan.
- Commissioning stage transitions checkpoint the latest stage and mark server state syncing until read-back completes.
- Recovery and authorization use command-surface styling; red is reserved for actual failure.


## 8.8.20.22 KeelLock — release integrity repair
BlackWake field proof isolated a packaging-order defect: final runtime bytes and DEPLOYMENT_MANIFEST runtime hashes diverged. KeelLock regenerates integrity hashes from the final immutable bytes and validates the package before ZIP handoff. Runtime integrity remains fail-closed; no checksum bypass was added. Field deployment proof remains required.

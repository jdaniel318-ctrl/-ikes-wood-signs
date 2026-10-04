# Dark Sky 8.8.20.13 — TruthBridge

VoyageKeeper preserves PassageLine's focused Admiral authorization and adds server-authoritative commissioning recovery after the required Engine PIN. If Fleet Core holds an unfinished voyage, successful Engine re-entry resumes that exact voyage and displays its recovery banner instead of silently landing at generic Engine home.

Browser/session storage remains a cache. Fleet Core remains the durable commissioning authority.


## 8.8.20.13 VoyageKeeper
- Recovery pointer survives Engine lock without claiming server truth.
- Engine re-entry restores an unfinished voyage into a Secure Voyage checkpoint instead of a blank commissioning form.
- Admiral recovery re-reads Fleet Core before any server-safe claim and never overwrites an authoritative voyage from a hint-only draft.
- Step 2 cannot advance without a Forge Plan.
- Commissioning stage transitions checkpoint the latest stage and mark server state syncing until read-back completes.
- Recovery and authorization use command-surface styling; red is reserved for actual failure.

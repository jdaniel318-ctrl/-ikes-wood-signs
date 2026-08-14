# Workshop Engine v2.9.75 — Preview Owner Portal Functional Fix

## Actual root cause
v2.9.74 had two click paths for Preview Owner Portal.

A document-level capture handler ran first, called `stopPropagation()`, and tried to infer the project from `activeProjectId`. In the Engine Control Center that value can be null or refer to customer-project runtime state. When it could not resolve the project, it returned — but because propagation was already stopped, the correctly scoped Owner Access handler never received the tap.

The preview return route also called a non-existent `openProjectControl()` function.

## Structural fix
- Removed the competing document-level preview interceptor.
- Preview now has exactly one handler, bound when Owner Access renders and closed over the correct project.
- Preview opens with `openOwnerPortal(p.id,{preview:true})`.
- Errors are surfaced instead of silently failing.
- EXIT PREVIEW uses `engineActiveProjectId` and the real `openProjectEngineControl()`.
- EXIT PREVIEW returns directly to the same project's Owner Access tab.
- Added touch-safe behavior for iPad/iPhone.

## Assets
No assets added, removed, renamed, or replaced.

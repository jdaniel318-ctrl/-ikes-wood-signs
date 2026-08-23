# Dark Sky 7.8.1 — Harbor Exit

## Mission
Make storage diagnostics visibly and reliably actionable on iPad without widening cleanup authority.

## Interaction contract
- `COMPACT DIAGNOSTICS` is a dedicated control; it is never a relabeled cleanup button.
- A tap must open a modal diagnostic surface above all Engine UI.
- The modal must provide an obvious `CLOSE` control and may also close from its backdrop.
- If no current sounding exists, diagnostics may run a read-only sounding first.
- A successful diagnostics action must create a visible state change. Silent completion is failure.

## Safety contract
- Diagnostics are read-only.
- Safe Cleanup remains separate and disabled when no proven stale application cache exists.
- Projects, orders, approved artifacts, customer records, project graphics, settings, admissions, quarantine evidence, active V4 data, and recovery anchors remain protected.
- Browser-managed/unattributed storage is never deleted or reclassified without positive ownership evidence.

# Waypoint 8.8.20.78

One fleet, clear places to work. The existing four offices remain: Operate Vessels, Captain Watch, Admiral My Fleet (read only), and Build & Govern.

## What changed
- Removed the duplicated office map. The four large actions now carry the hierarchy and route directly through their existing gates.
- Quotes & invoices, Carvewright and Wonderwake are grouped under Workspaces & programs with their purpose and scope visible. These cards do not register vessels or grant authority.
- Engineering Systems opens a six-station directory. Destinations receive keyboard focus and an adjacent Back to Engine control.
- Operate Vessels has a Back to Engine control; returning and reopening retain the current vessel search/filter. Existing Project Control return behavior is preserved.
- Fleet structure and the HouseHull measuring roadmap remain under Fleet structure & planning. Readiness is separate from the Engine access label.
- Phone header is compact; iPad retains the familiar four-office layout.
- Repeated workspace entrances now use the same command route. Returning from an access screen and opening another workspace keeps the screen tappable; a late Engine refresh cannot overwrite the newer route. Sign-in requirements remain unchanged.

## Lessons applied
Ike: lead with the next task. HouseHull: group related work and make return paths explicit. Wonderwake: keep controls near the work and show a clear next step. These are presentation and navigation changes, not automatic adoption of business rules or transfer of data.

## Upload and field check
1. Upload everything inside Waypoint/Upload to the existing -ikes-wood-signs repository root, preserving paths and replacing matching files. Keep everything else. Commit and wait for GitHub Pages.
2. Open the Engine and confirm 8.8.20.78 · WAYPOINT. Open Operate Vessels, find Ike, enter Project Control and return. Your search should remain.
3. Open Engineering Systems, choose Release evidence, then Back to Engine. Pause and capture a screenshot of the Engine for the iPad check.

No database changes, new sign-in method or permission reset is needed. TrueFit remains included. This is a source update, not a backup of business records. Native Safari remains a field check; offline automated checks do not certify production operation.

## Source recovery
Rollback contains prior versions of changed existing files. Restore them over the same repository paths if needed; do not clear business records or alter permissions. Support includes the complete new source archive, the prior baseline identity, verification reports and exact patch reconstruction proof. The baseline was reconstructed from commit 99ca9cc and verified against the deployed runtime manifest before building; it is application source only. New documentation and verification files may remain unused after rollback.

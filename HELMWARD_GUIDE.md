# Helmward 8.8.20.88

The fleet now has a compact vessel chooser and one focused workstation at a time. Every vessel uses the same Test Center entrance. The three main actions are Test Center, Owner Sign-In and Project Control. Back to vessel, All vessels and Back to Engine keep the route clear.

Test Center places Preview, Sea Trial and Live first. Readiness and approval evidence stays available in a disclosure. Existing approval, publication, owner and project-isolation checks still control those actions.

An expired, consumed or missing Engine preview now says “Preview ended” and offers Return to Engine. Start a fresh preview from Test Center. A copied/reopened link never restores preview access or earlier customer details. The ordinary unconfigured customer station remains blocked. Active previews also have Return to Engine.

## Upload

Use **DarkSky882088-Helmward-Upload.zip** over the complete **8.8.20.87 Harborlight** installation.

1. Extract the upload ZIP and open its single folder. Upload every file inside to the existing repository root, replacing matching files and keeping all other files. Commit the upload. Do not upload the enclosing folder or the full backup as the patch.
2. Wait for the existing deployment to finish, reopen Engine and confirm **8.8.20.88 · HELMWARD**. Keep Safari data and existing records.
3. Run the three field checks below. If the release label is still Harborlight, stop testing and confirm the complete upload/deployment before changing settings.

## Captain’s three field checks

1. Engine → Operate vessels → Ike’s Wood Signs. Test Center, Owner Sign-In and Project Control should be together near the top. Repeat with another vessel and confirm its name.
2. Open Test Center → Back to vessel → All vessels → Back to Engine. Each step should show its own screen, with a usable return control.
3. Open Ike’s Preview, then refresh that preview. Expect **Preview ended → Return to Engine**. Re-enter Test Center and start a fresh preview. No real customer information is needed.

## Evidence and limits

The integrated runner contains 32 offline suites. Three new Helmward suites cover selection/return behavior, recovery without service calls, and cancellation of delayed opens/actions. Tests cover Back to Engine during a pending open, obsolete approval responses, missing vessel identity, logout and delayed preview launch.

Controlled browser checks used actual renderer/navigation functions and CSS with synthetic vessel data at 1024×768 and 390×844. Main workstation actions and Preview were within the initial viewport, with no horizontal overflow. The started-preview header was checked separately with all controls visible. These checks do not certify native Safari input behavior or the complete hosted boot: the local HTTP preview correctly remained blocked by the HTTPS integrity requirement.

No live repository, frontend deployment, backend update, publication, account or customer-data change was performed. The existing Countercraft idle-v1 backend hardening and owner/location configuration remain separate prerequisites for real customer use. Helmward does not remove those restrictions.

FullBackup is application source only, not a backup of customer records, Supabase, media or device drafts. The rollback restores Harborlight’s original source bytes; new documentation/test files can remain unused. Keep the upload, full backup and rollback together. PackageProof.json records exact reconstruction, archive hashes and rollback verification. HELMWARD_EVIDENCE.json records the test scope.

# Longwatch 8.8.20.93

A focused timeout repair over the installed Plankfit 8.8.20.92.

## What changes

Engine private previews now show **Continue my sign after seven minutes of inactivity** and clear after **7 minutes 30 seconds** if unanswered. This adds the requested five minutes. Normal taps, typing and editor inputs restart that inactivity window before the warning opens. Continue my sign starts another full window. Finishing a session still clears it immediately.

The preview remains memory-only and sends nothing. An already expired preview cannot be recovered by installing this patch. Live/Sea Trial expiry and Engine/owner sign-in lifetimes are unchanged. The per-ship timeout control is still pending; extending a real kiosk also requires matching server policy.

## Install

1. Extract DarkSky882093-Longwatch-Upload.zip and open its single folder.
2. Upload all inner files to the existing GitHub repository root, replacing matching files and keeping everything else. Commit the upload.
3. After GitHub Pages finishes, confirm **8.8.20.93 · LONGWATCH** in the Engine.

The FullBackup ZIP is source code only, not customer records. The rollback restores .92 software only. No deployment or database operation was performed by this build.

## Test on the iPad

1. Open Ike’s Test Center private preview, add your plank photo and enter Andie Rose.
2. Leave Safari for three minutes, then return. The photo and words should still be present without a warning.
3. Continue the design. After seven minutes without input, Continue my sign should keep it; unanswered, the station resets 30 seconds later.

## Field notes retained for a later focused update

- Placement confirmation must require an explicit customer check; Use this design should not check it automatically.
- Replace Add my details with Add contact info and short supporting text explaining Ike’s review/contact purpose.
- Every request is subject to Ike’s review and acceptance; Ike may decline a request.
- Investigate the unexpected Safari Save Password prompt; cause not yet established.
- Improve the initial layout fit to the photographed board; manual reduction to 80% was needed in this test.
- Investigate perceived camera zoom while keeping the new capture screen.
- Reuse user-granted camera permission; browser permission remains controlled by the device user.
- Add authenticated per-vessel customer-session timeout settings to Black Flag with corresponding server enforcement.

## Verification scope

Deterministic offline tests exercise the full customer controller with real flow/core modules and a simulated clock. Native iPad Safari acceptance of this version remains pending. Prior .92 empty and photo-added plank screenshots fit the landscape iPad; those screenshots do not certify this timeout patch.

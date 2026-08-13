# Workshop Engine v2.9.67 — Owner Access Test Flight

## What works now
Inside Project Control Center → Owner Access:
- Save owner name and email.
- Choose project-scoped owner capabilities.
- Generate a one-time 7-day Owner Invitation.
- Copy the claim link manually.
- Revoke an unclaimed invitation.
- Preview the isolated Owner Portal.
- Open the test claim link and claim Owner Access.
- Claiming changes Owner status to Active and creates a project-scoped owner session.

## Invitation security
- Invitation tokens are generated with Web Crypto.
- Only a SHA-256 hash is stored with the project.
- The raw claim link is displayed when generated but is not stored in project data.
- Claimed, expired, or revoked invitations cannot be used again.
- Suspended/ended business relationships cannot claim or use Owner Access.

## Owner Portal boundary
The Owner Portal exposes only the selected project's granted modules and summary data.
It does not expose Black Flag, Engine Room, Captain authority, other projects, or cross-project business data.

## Ike test case
For an in-person test:
1. Engine Room → Ike's Wood Signs → Control Center → Owner Access.
2. Enter Ike's name/email and save.
3. Generate Test Invitation.
4. Open Test Claim.
5. Claim access.
6. Review Ike's isolated Business Portal together.

## Important limitation
This is a real local invitation/claim flow, not yet remote production authentication.
Because the current app stores project state locally, a link opened on another device does not share the invitation hash/state. Secure remote owner access requires the next infrastructure step: a server-side identity and device-authorization service.

The UI says this explicitly so the local test cannot be mistaken for production security.

## Assets
No assets added, removed, renamed, or replaced.

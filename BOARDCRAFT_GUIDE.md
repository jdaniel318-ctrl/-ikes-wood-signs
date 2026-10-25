# Boardcraft 8.8.20.62 — Ike's own-board sign experience

This is an application release over Lettercraft 8.8.20.61. It includes the shared
editor, customer request flow, email repair and complete-file Mail handoff. It is
not the separate Andie/Reid job-review bundle.

## Install the application update

Use the ZIP named **DarkSky882062-Boardcraft-Upload…zip**. Extract its one matching
folder and upload every file inside over the installed .61 application. Replace
matching filenames and retain the other application files. The release checks
that this update reconstructs the complete .62 application from the exact
delivered .61 baseline. No SQL, database reset, browser-data clearing or deletion
is required.

**DarkSky882062-Boardcraft-FullBackup.zip** contains the complete software release
for a full restore. A software backup does not export private jobs saved only in
your browser; retain your editable job downloads as well.

Reload the app and check that the Engine/Bootstrap build identifies **8.8.20.62**.
The customer-facing sign screens use Ike's branding and do not show internal
release labels.

## Make one sign on your own board

Open Ike's customer experience and choose **Design a sign for Ike**.

1. Choose **Take a photo of my board**, or **Choose my own photo**. Photograph the
   entire board straight on. The first picture becomes the board used in your
   preview. Two additional reference pictures are optional. **Use as my board**
   selects a different attached picture if needed.
2. Choose **Create sign design**. In the **Board** tab, turn the photo upright
   and move/resize the blue layout area onto usable wood. Use the area, then open
   **Edit** to enter your words and choose lettering. Existing graphics, layers,
   color, positioning, rotation and undo/redo remain available. Choose **Use this
   design** to return to your request with that placement.
3. Enter your contact information and any finish or other instructions. Review
   the wording and photo composite, check the approval box, and prepare the
   complete package. Send it to Ike or use a Mail option below.

One sign is the normal flow. Quantity means additional copies of that design.
**New request** starts a fresh sign with blank contact details and no photographs.
The earlier two-board development exercise is not a recurring requirement.

## What your board picture means

The photograph retains its proportions. The layout is placed on it with one
uniform scale, so lettering is not stretched to fit the picture. The editor,
request preview and frozen PNG use the same photograph, orientation and vector
placement. Changing the photo, placement, orientation, wording or other request
content requires a new customer review.

The blue area uses the design's reference dimensions. **The photograph does not
measure the board.** Ike confirms the actual wood, width, height, thickness,
usable area and machine setup. The image can show knots and natural edges for
visual review; the software does not certify that those areas are safe to cut.
Detailed photographs may produce a lower-resolution frozen PNG to fit the
package budget; the original normalized reference copy remains in the ZIP.

## Ike's existing email is retained

The new request sender uses the same existing Web3Forms key and intended shop
address: **ikeswoodsigns.orders@yahoo.com**. No replacement account or new key was
introduced.

The disabled-send problem in .61 was a different rule in the new host: it required
a separate kiosk/device deployment ID. The established published web shop can
have a legitimate live customer session without that record. Boardcraft uses the
same live-session contact authority as the existing email path while keeping its
HTTPS, exact-session, visible-shop and project checks. Private Preview and Sea
Trial remain download-only and do not launch email or file-sharing actions.

### Direct email with the complete attachment

**Send request to Ike** submits one complete ZIP through the existing provider.
It does not silently retry without the pictures and design files. An accepted
provider response is shown as acceptance by the email service, not proof that
the message reached Ike's inbox. An interrupted/uncertain attempt stays locked
against automatic duplicate sends; check with Ike before resubmitting it.

Web3Forms documents file attachments as a feature requiring an active **PRO**
subscription. Its default uploader supports files up to **5 MB**. Earlier Ike
email code could retry as text after its optional picture failed, so seeing an
earlier email alone does not establish that ZIP attachments are enabled. The
actual provider account plan and inbox receipt were not inspected or changed in
this release.

If direct submission is rejected, the app retains the full package and explains
the attachment requirement. To improve automatic delivery, check that the
**existing Ike form/access key** is associated with an active PRO account and
that its recipient and website restrictions match the existing shop. Retest the
complete ZIP once after that is confirmed. A generic rejection may have another
cause; the app does not assert that every rejection proves the account is free.

Official provider guidance:
https://docs.web3forms.com/getting-started/pro-features/file-attachments

### Complete-file alternatives already in the app

- **Share ZIP with Mail…** passes the verified ZIP as a file to the device share
  sheet. Choose Mail, enter/check Ike's address and send there. Device sharing
  cannot force the Mail application or preselect its recipient. A completed share
  handoff is not a delivery receipt.
- **Download complete ZIP**, then **Open email to Ike…**, opens an addressed
  draft naming the package. Attach the downloaded ZIP yourself. Opening a mail
  draft does not attach a file. This option also works when file sharing is not
  supported by the browser.

Both options use the complete package. They stay unavailable in Preview/Sea
Trial, after an accepted or uncertain automatic send, or when the prepared
request has changed. No real email was sent during release verification.

The standard Mail URI supports addressing and text, rather than a standard file
attachment parameter: https://www.rfc-editor.org/rfc/rfc6068.html

## What Ike receives

The ZIP includes the exact frozen photo proof, all normalized reference photos,
readable HTML/text request briefs, outlined millimeter SVG, millimeter DXF,
editable Carvewright JSON, request/placement metadata and a SHA-256 manifest.
The board photograph is presentation/reference data, not CNC cutting geometry.

Ike can extract the ZIP, read **request-brief.html**, and open
**editable-design.json** through Carvewright's existing **Bring a design → Choose
job file** route. That creates a new unreviewed editable copy. The shared Studio
also supports photo-backed callers, while the existing private maker job store
continues to save vector designs. A full owner request inbox and automatic
customer-ZIP import are not added by this release; retain the extracted proof,
photos and request.json beside the editable design for review.

SVG/DXF carry outlined artwork for CAM import, not a universal executable CNC
program. Select millimeters, confirm actual size and material, choose tooling
and operations, and use the postprocessor for Ike's machine. Customer layout
approval is separate from Ike's production approval.

## Verification and next native check

The evidence file records the exact candidate runtime hashes, local browser
tests, integrity/ZIP checks and compatibility with the two real .61 job packages
and original Carvewright r4 fixture. The application update is verified as an
exact overlay of the delivered .61 full release, with no deleted files.

The focused native check is **one sign**: use the iPad camera, place your new
words on that board, then confirm that Ike receives the complete ZIP through
the selected email method. Native camera behavior, the provider account's actual
attachment entitlement, inbox receipt and a physical CNC cut remain checks on
the user's real device/service/machine.

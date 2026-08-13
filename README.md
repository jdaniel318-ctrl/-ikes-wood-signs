# Ike's Wood Signs — Version 1.2

Version 1.2 keeps the Version 1 local-first ordering system and adds two major changes:

1. **In-app camera workflow.** The wood-photo step now uses `navigator.mediaDevices.getUserMedia()` to show a live rear-camera view inside the ordering screen. The customer taps START CAMERA, TAKE PICTURE, then USE THIS PHOTO or RETAKE without leaving the 10-step flow. Captured photos are resized to a maximum 1600-pixel side and compressed before local storage.
2. **Stronger Ike's branding.** The welcome screen now uses the yellow/blue/red/green identity more heavily, includes the illustrated Ike character with a plank, and carries a smaller branded strip through the ordering experience.

## Important camera note
Direct camera access depends on the browser/container hosting the web app. Version 1.2 requests the rear camera directly and catches permission/support errors. For production, the app should run in Safari/PWA over a secure context or in a native wrapper that explicitly supports WebRTC camera access. HTML Serve can still be used to test whether its embedded browser grants this permission.

The saved-photo picker remains only as a testing fallback when the host blocks direct camera access; the intended customer workflow is the in-app camera.

## Local storage
Orders continue to be stored in IndexedDB on the device. Admin export/restore and order status tools remain unchanged.


## Version 1.3
- Automatic Web3Forms order submission (requires pasting the form Access Key into `WEB3FORMS_ACCESS_KEY` in `app.js`).
- Unique customer order number is generated before submission and included in the email subject/body and confirmation screen.
- Customer-facing mail-app step removed.
- More illustrated Ike branding, softer organic shapes, fewer box-style panels.
- Live HTTPS camera workflow retained from Version 1.2.
- Orders remain stored locally in IndexedDB as a backup if automatic email fails.

### Required before publishing
Open `app.js` and replace:
`PASTE_WEB3FORMS_ACCESS_KEY_HERE`
with the Access Key for the verified Web3Forms form whose recipient is `ikeswoodsigns.orders@yahoo.com`.


## Version 1.4
- Compact header to keep branding present without dominating the customer experience.
- Reliability pass: every order is mirrored to `localStorage` as well as IndexedDB.
- Admin Orders merges both storage locations so locally saved orders remain visible even if one storage mechanism fails.
- Web3Forms failures are saved onto the order record for troubleshooting; customer sees a clear failure state instead of a false success.
- Existing unique `IKE-...` order number remains on the customer confirmation and automatic order email.
- Price selection now explains that price is based on the length group posted in the trailer. Exact length brackets are intentionally not invented yet; the existing $45 / $55 / $65 / $90 / $135 posted price tiers remain in use until Ike's exact length ranges are confirmed.


## Version 1.5 — final build for the evening
Customer trust, production-reference reliability, and admin security are the priorities.

- Admin gear is protected by default PIN `4353`.
- Admin PIN can be changed inside Admin Settings (4–8 digits).
- Every approved order stores a flattened production-reference image combining the customer's exact photographed wood blank with the approved wording/style/fill.
- Admin Orders displays that approved customer preview prominently.
- Customer approval language explicitly requires review of spelling, capitalization, punctuation, layout, orientation, style and fill, and states that Ike's Wood Signs may refuse or cancel any order at its discretion.
- Thank-you screen emphasizes appreciation for choosing Ike's Wood Signs and supporting a small local business.
- Old customer-facing/manual "Prepare Admin Email" workflow remains removed; automatic Web3Forms submission is the intended flow.
- Service worker is now network-first, forces updates, and deletes prior Ike's cache versions to reduce stale-version problems.
- Compact header from Version 1.4 is retained.
- Subtle live-edge wood shapes are added to the UI without replacing the established yellow/blue/red/green branding.
- Local order redundancy from Version 1.4 is retained.


## Version 1.6 — LIVE EDGE
- Landscape-first iPad/kiosk layout at widths 900px+ while preserving portrait/mobile fallback.
- Wider 1180px app shell with side-by-side design/preview layouts to reduce vertical scrolling.
- Natural / No Fill now uses a CNC-style recessed-carving simulation in both the live preview and the saved approved preview image.
- Custom Color now opens the native iPad/browser color picker and stores the exact hex color with the order.
- Approved preview is attempted as a Web3Forms email attachment using multipart/form-data. If the current Web3Forms plan does not allow attachments, the app automatically falls back to the proven text-only email so order delivery is not broken.
- Work-order email language no longer includes development/testing wording.
- Existing Version 1.5 security, local redundancy, PIN workflow, approved-preview storage, unique order number, and warm thank-you experience remain intact.

### Attachment note
Web3Forms currently documents file attachments as a paid/Pro feature. LIVE EDGE is coded so an eligible plan will include the approved preview automatically, while a non-eligible plan still sends the order details successfully.


## Version 1.7 — TRAILER BLAZE
- Confirmation is now a hard screen transition: all non-current customer screens are force-hidden, and every step jumps to the top of the page.
- Admin Settings now includes `Allow Custom Colors` ON/OFF. When disabled, Custom Color and the color picker disappear from the customer experience.
- Admin Settings now includes `Customer Confirmation Email` ON/OFF.
- Customer confirmation email uses Web3Forms' official Autoresponder convention by adding an `email` field only when the admin toggle is ON.
- Important: Web3Forms documents Autoresponder as a Pro feature and it must also be enabled in the Web3Forms dashboard. The app toggle cannot activate a Web3Forms subscription feature by itself.
- Existing admin email, approved preview, local order redundancy, PIN security, Live Edge landscape layout, CNC carving preview, custom-color picker, and unique order numbers remain.


## Version 2.0 — WORKSHOP
- Central business configuration for business name, order prefix, thank-you copy, prices and statuses.
- Admin can change core business settings without editing code.
- Schema v2 orders include a business snapshot for reuse in future projects.
- Work queue statuses: New, In Production, Ready for Pickup, Completed.
- Interrupted-order draft recovery after refresh/reload.
- Existing camera, preview, approval, email, redundant storage, PIN security, custom colors and hard-step navigation remain.


## Version 2.1 — BLACK FLAG
Adds a second, more sensitive administration layer beneath the normal Ike Admin.

### Administration layers
- Customer: no admin access.
- Ike Admin: PIN 4353 (or its locally changed value) for orders, normal settings and day-to-day operation.
- Black Flag Engine Room: PIN 5615 for platform-level configuration and diagnostics. It is reachable only from inside Ike Admin.

### Engine Room
- Pirate-themed secondary PIN gate with randomized wrong-code jokes.
- Engine identity and schema version controls.
- Reusable production workflow editor.
- Storage/order/draft/email diagnostics.
- Interrupted-draft clearing and full backup export.
- Guarded Engine Settings reset that preserves saved orders.
- Engine PIN is stored separately from the normal admin PIN and defaults to 5615.

### Smoothness
- Prevents rapid duplicate next-step taps.
- Light screen transition polish.
- Modal scroll locking for both admin PIN gates.
- Keeps camera and pricing logic unchanged for later focused work.


## Version 2.2 — BLACK FLAG FLEET
- Removes Ike's branding from inside the Black Flag Engine Room; the engine now has its own pirate/Black Flag identity.
- Adds a company registry ("The Fleet"). Published companies may be customer-facing; engine-only companies are hidden from customers.
- Adds future test company: Mugshot After Dark — "Classy mugs. Questionable messages." It is engine-only, not customer-accessible.
- Mug test profile uses a 32-character hard limit with a soft warning at 26 characters; pricing remains intentionally TBD.
- Adds per-company AI Product Recognition policy: Off / Assist / Automatic, minimum confidence, and scale-reference requirement.
- AI settings remain Engine-admin controlled for now, but are stored per company so they can later be exposed safely to company admins.
- Adds local usage statistics by company: order count, completed orders, recorded order value, and AI mode.
- AI architecture intentionally separates recognition from pricing: recognition proposes structured product attributes; company pricing rules determine price.


## Version 2.3 — BLACK FLAG COVE
- Removes visual harshness from the Engine Room with a warmer parchment/teal palette, lighter card shadows, improved spacing, and softer form controls.
- Pirate/Black Flag theme increased approximately 30% without turning serious engine controls into a novelty UI.
- Adds Black Flag Cove welcome guidance, stronger nautical labels, anchor/flag details, Captain's Log/Fleet Manifest naming, Cargo Hold diagnostics, Crew Workflow, Ship's Registry, and Powder Keg Locker.
- Engine remains visually separate from all company branding.


## Version 2.4 — BLACK FLAG COMMAND
- Reframes the Engine as a professional multi-company platform dashboard.
- Removes Ike's customer branding while inside Engine mode.
- Company Command is now the primary Engine function.
- Adds visible company cards for Ike's Wood Signs (Live) and Mugshot After Dark (Development / engine-only).
- Each company now opens a dedicated Company Control Center for customer experience, custom colors, AI recognition, character limits and publishing status.
- Ike's character limit is intentionally left unset until the real business rule is confirmed.
- Mugshot After Dark retains a 32-character test limit.
- Keeps Black Flag personality restrained to the engine while making the dashboard cleaner and more world-class.


## Version 2.4.1 — BLACK FLAG LOCK
- Engine authorization is now a separate, session-only security state.
- Leaving/logging out of Black Flag immediately destroys Engine authorization.
- Returning to Engine requires the Engine PIN again (default 5615).
- Ike Admin remains independently accessible with the Admin PIN (default 4353).
- Admin authorization never grants Engine authorization.


## Version 2.5 — BLACK FLAG PORTAL
- Black Flag is now the first screen after a fresh page load.
- Engine PIN is required before the Engine opens.
- The landing portal also provides explicit Company App and Company Admin paths.
- Company Admin remains protected by its independent Admin PIN.
- Lock Engine immediately destroys Engine authorization and returns to the Black Flag PIN portal.
- Returning to Black Flag always requires the Engine PIN again.
- Engine mode hides all Ike/company branding and uses a dedicated Black Flag header.
- Customer/company branding remains confined to the company-facing application.


## Version 2.6 — BLACK FLAG HARBOR
Architecture lock-in release.

### Security / navigation
- Fresh launch starts at Black Flag Engine PIN.
- After Engine PIN, the user sees Project Command.
- Entering any project immediately destroys Engine authorization.
- Returning from a project to Black Flag always requires Engine PIN again.
- Pirate/Black Flag branding exists only in Engine/PIN surfaces; project apps keep their own themes.

### Project model
- Black Flag is project-first.
- Built-in projects: Ike's Wood Signs and Mugshot After Dark.
- Add Project creates a private/unpublished project shell.
- Project Control Center tabs: Overview, Products, Customer Experience, AI Recognition, Workflow, Publishing, Orders, Ledger.
- AI and workflow are project-specific, not global.
- Project and product publish controls are independent and confirmed before exposing a private item.
- Ike's character limit remains intentionally unset.

### Ledger / tracking
- Each project has its own engine-owned completed-order ledger.
- Marking an order Completed posts it once to that project's ledger.
- Ledger foundation tracks revenue, direct costs, tax, payment status and inventory impact fields.
- Project ledger is Engine-core; future project-side access can be read-only.
- Project dashboard shows orders, monthly recorded value and ledger counts.
- Engine activity log captures high-value project changes.

### Customer completion
- Start Another Order is green.
- Complete is black.
- Both reset the same project workflow so the next submitted order receives a new unique order number.


## Version 2.7 — BLACK FLAG ANCHOR
- Fresh HTML boots locked: only the Engine PIN portal can display before authentication.
- Fixed the routing bug where portal code referenced non-existent `engineScreen`; the real Engine container is `enginePanel`.
- No Company App/Admin bypass on the boot portal.
- Correct Engine PIN opens Project Command.
- Entering any project destroys Engine authorization.
- Returning from a project hides the project and requires Engine PIN again.
- Black Flag/pirate UI is hidden in project mode.
- Ike header no longer contains Black Flag/Workshop language.
- Per-project AI/workflow remain inside Project Control Center; legacy global cards are hidden.
- Added Engine-only per-project Pay by App structure, OFF by default. No customer payment UI is exposed.
- Payment structure anticipates hosted links, future integrated checkout, provider configuration and ledger payment tracking.
- Service-worker navigation is network-first to reduce stale GitHub Pages startup screens.


## Version 2.7.1 — BLACK FLAG ENTRY RESCUE
Focused repair build for Engine entry.

- Fixes the startup exception caused by an event listener targeting the removed `closeEngineBtn`.
- Removes the blocking “app could not start” alert; secondary initialization failure can no longer prevent Black Flag entry.
- Creates a shared authentication bridge between the core app and the Black Flag portal.
- Engine PIN **5615 is guaranteed to unlock Black Flag in this test/recovery build**.
- A separately configured Engine PIN is accepted as well.
- Successful PIN entry updates the real Engine session state, not a disconnected variable in the portal script.
- Portal binding now works whether app.js runs before or after DOMContentLoaded.
- Black Flag home rendering is isolated so a statistics/diagnostics error cannot reject a valid PIN.


## Version 2.8 — BLACK FLAG WATCH
- Engine PIN is no longer displayed inside Black Flag.
- Engine and Project Admin PIN dialogs autofocus the PIN field and always provide a clear Close/Return path.
- 10 wrong PIN attempts inside 3 minutes triggers a 5-minute countdown lockout for Engine and Project Admin; Close remains available.
- Unpublished projects can be opened privately from Black Flag for testing.
- Project Control Center adds Permissions and Customers.
- Black Flag controls whether each project's Admin can access Orders, update statuses, access Ledger, enter costs, and view profit.
- Orders and Ledger open separately from Project Admin.
- Ready for Pickup shows a prominent yellow check; Completed shows a prominent green check.
- Completed orders older than 10 days move to the project's Completed archive view.
- Ledger supports project-admin cost entry when Black Flag permits it.
- Optional per-project customer history foundation supports repeat-customer grouping.


## Version 2.8.2 — FULL ADMIN ISOLATION
- Project Settings/Admin is a standalone protected full-screen page.
- Orders is a separate protected full-screen page.
- Ledger is a separate protected full-screen page.
- No customer header, progress bar, order screen, customer content, or Engine-return control is visible while any protected page is open.
- Closing Settings, Orders, or Ledger clears the protected state and returns directly to the unprotected customer ordering screen.
- Orders and Ledger shortcuts only appear when Black Flag grants those permissions.


## Version 2.8.3 — PROJECT ADMIN PRIVACY
- Project Settings now opens directly as a standalone full-screen protected settings page.
- Removed the backup/restore, Project Settings, Orders, Ledger, and Engine Room action strip from the Project Settings page.
- The green Return to Ordering control is intentionally large and visually dominant.
- Project Settings automatically locks and returns to ordering after 15 minutes of inactivity.
- Activity such as tapping, typing, changing a setting, scrolling, or touching the screen resets the 15-minute timer.
- No customer-ordering or Black Flag Engine UI is allowed to render while Project Settings is open.


## v2.8.4 — CONTROLLED UPDATE
Built directly from verified v2.8.3.

- Preserves the v2.8.3 Black Flag PIN input/authentication behavior unchanged.
- Project Admin has a compact project-branded header and prominent Back to Ordering.
- Current project orders are visible in Project Admin; customer ordering CTA/progress remains excluded.
- Existing 15-minute Project Admin inactivity return remains in place.
- Customer confirmation email control is removed from Project Admin.
- Black Flag controls customer confirmation email separately for each project under Notifications.
- No Captain's Log, Protected Controls restructuring, accounting, customer-database, or payment changes are included in this version.


## v2.8.4.1 — HTML REPAIR
- Fixes one malformed closing `div` introduced in v2.8.4's Project Admin header edit.
- The extra closing tag could prematurely close the application container, leaving Black Flag blank after successful PIN entry.
- No PIN/authentication behavior changed from the working v2.8.3 baseline.
- No additional features were added.


## v2.8.5 — CAPTAIN'S LOG
Built directly from verified v2.8.4.1.

- No changes to Engine PIN, Project Admin PIN, routing, or authentication.
- Removes the Black Flag welcome/tutorial panel.
- Removes explanatory tutorial copy from Platform Control and Fleet Overview headings.
- Expands Captain's Log with project-level KPIs, Orders by Project chart, Recorded Revenue chart, and a compact project comparison table.
- Existing Project Command, Project Control Center, Admin, and Engine controls remain structurally unchanged.


## v2.8.6 — PROTECTED CONTROLS
Built directly from verified v2.8.5 branch.

- Consolidates Platform Identity, Storage & Recovery, backup, stranded-draft recovery, and Engine Reset into Protected Controls.
- Engine Reset requires a fresh Engine PIN followed by a second final confirmation.
- Saved orders remain preserved by the settings reset.
- Restores approved customer preview images to Project Admin / Orders cards; falls back to the customer photo only when no approved preview exists.
- Tightens Black Flag project permissions so order-status access depends on Orders access, and cost/profit access depends on Ledger access.
- Does not alter Black Flag login routing or the working PIN field behavior.


## v2.8.7 — CUSTOMER HISTORY
Built directly from v2.8.6.

- Keeps the existing project header unchanged.
- Expands Black Flag's optional per-project Customer History into a retained customer directory.
- Tracks customer name, phone, email, order date, brief purchase description, purchase count, and amount.
- Identifies repeat customers across multiple projects when the same email/phone/name key is recognized.
- Customer History remains OFF unless Black Flag enables it for that project.
- Enabling the feature can rebuild the directory from orders currently stored on the device.
- Disabling it removes that project's retained customer directory.
- No changes to Black Flag login/PIN routing.


## v2.8.8 — ADMIN / CUSTOMER REPAIR
- Black Flag now retains customer history automatically for every project.
- Black Flag controls only whether that project's Admin can see Customer History.
- Project Admin restores the compact project-branded header, prominent Back to Ordering, current orders, and optional customer list.
- Project Admin still auto-locks and returns to ordering after 15 minutes of inactivity.
- Engine PIN fields are cleared on open, failed attempt, successful entry, close, and Engine lock.
- PIN field autocomplete behavior remains based on the verified working v2.8.x branch; no strong-password markup was introduced.


## v2.8.8.1 — STRUCTURE REPAIR
- Repairs malformed Project Admin HTML introduced in v2.8.8.
- Removes a duplicated timeout sentence and extra closing `div`.
- Restores `enginePanel`, Project Orders, Ledger, and protected screens inside the main application container.
- No PIN/authentication logic or feature behavior was changed.


## v2.8.9 — PROJECT ADMIN MENU
Built directly from the verified v2.8.8.1 structure-repair branch.

- Project Admin now opens to a clean module menu instead of exposing Project Options at the top.
- Project Options is one menu item.
- Orders is one menu item.
- Customers appears only when Black Flag grants customer-history visibility to that project's Admin.
- Ledger appears only when Black Flag grants Ledger access.
- Payments appears only when Black Flag enables payment capability for that project.
- The menu is designed for additional Black Flag-granted modules later.
- The project/customer header is unchanged.
- Black Flag login/PIN routing is unchanged.


## v2.8.9.1 — ADMIN COMMAND DECK
- Restyles Project Admin to feel closer to the Black Flag command-dashboard experience while preserving each project's own branding.
- Adds compact project-admin operational stats for Current, Ready, and Completed orders.
- Admin module cards now use clearer command-style visual hierarchy and status chips.
- No changes to project/customer header.
- No changes to Black Flag or Admin authentication/routing.


## v2.8.9.2 — ADMIN ORDER FILTERS
- Project Admin opens directly to Orders.
- Only approved customer orders appear in Project Admin and Project Orders.
- Top status blocks are clickable filters: All Orders, New Orders, In Production, Ready, Completed.
- Status colors: New red, In Production orange, Ready yellow, Completed green.
- The second navy bar keeps Admin Menu + Orders visible; Customers, Ledger, Payments, and Project Options remain visible but gray/disabled until Black Flag grants access.
- Black Flag Permissions now includes Project Options access.
- Approved preview thumbnails enlarge in a modal when clicked; the X returns to the normal view.
- No status-key legend is added.
- Project/customer header and authentication remain unchanged.


## v2.8.9.3 — PROJECT ISOLATION / PHOTO GATE
- The second dark-blue Project Admin row is the Admin Navigation Bar.
- Improves colored status-block text contrast without changing button backgrounds.
- Admin Menu opens project-admin settings for contact information and Project Admin PIN changes.
- Photo-required projects cannot create an order number or submit an order until a confirmed product photo exists.
- Projects that do not require photos are not subject to the photo gate.
- Project Admin/Orders only show approved orders; photo-required projects also require a saved/approved image.
- Mugshot After Dark gets its own project branding/config shell instead of inheriting Ike's.
- Reusable engine logic may be shared, but project branding/data/order context remains isolated.


## v2.8.9.4 — CUT THE TOWLINE
- Opening a project now loads a complete customer-experience profile, not just a project label.
- Ike's and Mugs After Dark now have separate customer-facing branding, copy, order prefixes, runtime state, drafts, and business configuration.
- Entering a project resets customer runtime state before applying that project's configuration.
- Interrupted drafts are stored per project.
- Business configuration is stored per project.
- Mugs After Dark no longer shows Ike's character or Ike/wood-sign language in its primary customer flow.
- Mugs remains in test-pricing mode until pricing is deliberately configured in Black Flag.
- Non-Ike project emails are not sent through Ike's email configuration.
- Shared Engine logic remains reusable, while customer identity and state are isolated by project.


## v2.8.9.5 — SEAL THE HATCHES
Towline repair voyage.

- Returning from any project now destroys Engine authorization and always routes through the Black Flag PIN gate.
- Black Flag's own theme is restored before Engine entry; Ike and Mugs theme classes, project CSS variables, and active-project state are removed.
- Successful Engine authentication also defensively reapplies the Black Flag theme.
- For photo-required projects, normal Admin/Orders only accept orders with an approved generated preview image.
- Raw photo data alone is no longer sufficient to make a photo-required order valid in Admin.
- Required-photo orders do not receive an order/confirmation number until the approved preview image has been successfully generated.
- Legacy/test orders without proof of the required approved image remain stored but stay out of normal Project Admin order views.
- Projects without a photo requirement are unaffected by the photo gate.


## v2.9.0 — TWO SHIPS, ONE SEA
- Ike's remains the mature Ike-owned customer shell.
- Mugs After Dark is rebuilt as a separate customer shell with its own DOM, branding, photo input, wording, preview, contact, review, and confirmation flow.
- Mugs does not render or reuse the Ike customer page.
- Shared Black Flag services remain common underneath: routing, order storage, customer history, admin permissions, ledgers, workflow status, and Engine security.
- Mugs orders use `projectId: mugshot-after-dark`, MUG confirmation numbers, Mugs-specific business metadata, and a required approved photo preview.
- The Mugs customer shell contains no Ike character asset, Ike branding, wood/plank/sign copy, or Ike footer.
- A shell-template registry is introduced as groundwork for the future `+ Project → Create From Shell` builder.
- Future projects cannot silently borrow Ike's or Mugs' customer shell.


## v2.9.1 — SAFE HARBOR
- Restores the shared bottom-right ENGINE button to Mugs After Dark, matching Ike's access pattern and appearance.
- ENGINE from either customer shell opens the protected Black Flag login.
- Closing the Engine login gate returns to the exact project and customer shell that launched it.
- The temporary project return target is cleared after successful Black Flag authentication.
- No changes to the independent Ike/Mugs customer-shell architecture.


## Flower isolation test build
Adds a third private/test project, **Becca's Bloom Shop**, on the Safe Harbor baseline. It has a dedicated project ID (`beccas-bloom-shop`), order prefix (`BBS`), customer runtime state, photo state, order records, project admin filtering, branding, and customer shell. The Add Project dialog now includes a Flower Shop type; flower projects are assigned to the flower shell rather than Ike's or Mugs. No Face ID/passkey work is included.


## Flower monogram bug fix
- Removes the inherited `M` monogram from the flower customer shell.
- Becca's Bloom Shop now displays `B` in both flower-shell monogram positions.
- The flower monogram is derived from the project/business name at runtime, so a later rename can update the initial without reusing the Mugs identity.
- No changes to Ike's, Mugs After Dark, project data, order logic, or Engine security.


## v2.9.7 — PROJECT ASSETS
Introduces project-scoped Branding & Graphics slots.

- Adds per-project graphic slots for project logo/mark, hero graphic, footer graphic, and background/texture.
- Images are stored under the project's own namespace and are never inherited by newly created projects.
- Black Flag project controls can upload, preview, save, and clear graphics without editing HTML/CSS/JS.
- Mugs After Dark and Becca's Bloom Shop can immediately display custom logo and hero graphics from their own slots.
- Ike's built-in graphics remain the default; project assets can override selected slots later without removing the current working design.
- New projects begin with empty graphic slots rather than borrowing another project's branding.


## v2.9.8 — TRUE COURSE
Project launch routing correction.

- `OPEN PRIVATE TEST` now resolves the customer destination from the project's own shell metadata (`shellType`, `projectTheme`, or project type) instead of depending only on a small hard-coded project-id map.
- Flower projects created through `+ Add Project` resolve to the flower customer shell automatically.
- Unknown project types are blocked from silently falling back to Ike's customer experience.
- Entering any project first hides all other customer shells and clears project-specific body classes before displaying the selected shell.
- Existing Ike's and Mugs routing remains unchanged.
- This change specifically fixes Becca's Bloom Shop opening Ike's customer page.


## v2.9.9 — MIDNIGHT BLOOM
Flower-order submission routing fix.

- Fixes `PLACE TEST ORDER` doing nothing for flower projects created through `+ Add Project`.
- Removes the hard-coded `beccas-bloom-shop` submission check.
- Flower orders now use the currently active flower project's real project ID, business name, and order prefix.
- A project named with punctuation (for example `Becca’s Bloom Shop`) no longer fails because its generated slug differs from the original seeded test ID.
- If saving to IndexedDB fails, the customer now sees an error instead of silently moving forward.
- The order confirmation remains tied to the active flower project.
- No changes to Ike's or Mugs order submission logic.


## v2.9.10 — TEMPLATE WATCH
Black Flag template event architecture repair.

- Fixes the `START YOUR FLOWER ORDER` regression by restoring the customer-flow event binder that was accidentally removed in v2.9.9.
- The repair is made at the Black Flag template layer, not as a Becca's Bloom Shop-only workaround.
- Adds `Flower Shop` as a first-class `PROJECT_SHELL_TEMPLATES` entry with the shared `flowers` customer shell.
- New Flower Shop projects created through `+ Add Project` inherit the flower template's navigation, photo, personalization, approval, and submission behavior automatically.
- Introduces `bindProjectTemplateShells()` so reusable project-template behaviors are initialized centrally.
- Keeps v2.9.9's active-project submission logic: orders use the active project's ID, name, and prefix instead of a BBS-specific ID.
- Existing Ike's and Mugs event behavior is preserved.


## v2.9.11 — FLEET COLORS
Black Flag project-template/admin separation upgrade.

- Adds first-class three-letter project codes: `IKE`, `MUG`, and `BBS`.
- Existing saved projects are normalized safely on load; permanent project IDs remain the actual data/security boundary.
- New projects receive their own three-letter code from the project prefix/name.
- Black Flag project cards display the project code instead of only the first letter.
- Project Admin chrome is now themed from the active project at the Black Flag template layer:
  - IKE keeps Ike-specific yellow/blue/green identity.
  - MUG gets its own dark/night identity.
  - BBS gets its own green/pink/cream identity.
- Project branding colors do not spill into other projects.
- Workflow notification colors remain universal Black Flag semantics:
  - New = red
  - In Production = orange
  - Ready = yellow/gold
  - Completed = green
- Status/filter text contrast is strengthened without changing the notification background colors.
- Each order keeps the original selectable status dropdown. The word `Status` changes color to match the selected workflow state.
- Fixes project-card grammar from `1 orders` to `1 order`.


## v2.9.12 — FLEET LIVERY
Black Flag Admin Theme Engine correction.

- Fixes the remaining Ike-yellow inheritance in BBS Admin by styling the **actual shared admin brand bar** (`.project-admin-brandbar`) instead of an obsolete selector.
- Introduces Black Flag-owned admin livery presets keyed by project code (`IKE`, `MUG`, `BBS`).
- All projects continue using one shared Black Flag Admin layout; only project livery variables change.
- BBS now receives green/pink/cream admin livery closer to the approved rendering.
- IKE keeps its own Ike livery and MUG keeps its own night/mug livery.
- New/future projects fall back to their own branding rather than Ike defaults.
- Universal status semantics remain Black Flag-wide: New red, In Production orange, Ready gold, Completed green.
- The bottom status control remains the original native selectable dropdown.
- The word `Status` is assigned its workflow color directly from the current status, preventing project branding CSS from overriding it.


## v2.9.13 — HIDDEN TREASURE
Final Dark Flag appearance update.

- Adds an Engine-owned `Pirate Mode` setting.
- Pirate Mode is available both on the Dark Flag Engine PIN screen and in `Engine Settings → Appearance`; both switches control the same persistent setting.
- Standard professional mode remains the default.
- Pirate Mode changes only Dark Flag Engine entrance presentation/copy.
- Project customer screens, project admin screens, IKE/MUG/BBS branding, project data, routing, permissions and security are untouched.
- Engine PIN behavior is unchanged.
- Adds rare, harmless Dark Flag-only treasure messages when Pirate Mode is enabled.
- Retains the v2.9.12 Fleet Livery Black Flag admin-theme separation architecture.


## v2.9.14 — SEALED BULKHEADS
Project-isolation repair plus Pirate Mode refinement.

### Shared Project Admin Gate
- Removes hard-coded Ike artwork and Ike wording from the shared Admin PIN modal.
- The Admin PIN gate now resolves from the active project's permanent project identity.
- IKE uses IKE identity; MUG uses MUG identity; BBS uses BBS identity.
- Uploaded project logos are used automatically when available.
- If no logo exists, the project's three-letter code is used as the neutral project mark.
- The gate's title, prompt, accent, button and presentation are all derived from the active project.
- This is one reusable Black Flag/Engine template, not three project-specific modals.
- PIN/security behavior is unchanged.

### Pirate Mode
- Strengthens Pirate Mode toward the approved cinematic Black Flag direction while keeping it confined to the Dark Flag Engine entrance.
- Adds darker timber-like surfaces, brass/gold accents, Cove Engine identity, subtle skull/anchor atmosphere and fleet/separation language.
- Pirate Mode remains presentation-only and cannot style project customer/admin screens.
- Treasure easter eggs remain harmless and Engine-only.

Core rule: different brands, different data, same Engine.


## v2.9.15 — COVE COMMAND
Pirate Mode becomes a full Dark Flag appearance layer.

- Uses the previously approved pirate dashboard concept art as direct visual inspiration for the working UI.
- Pirate Mode now transforms both the Dark Flag PIN entrance and the Dark Flag Engine command surfaces.
- Adds a Black Flag / Cove Engine masthead, dark timber command-deck surfaces, brass/gold edging, restrained skull/anchor/compass atmosphere, and stronger Dark Flag language.
- Engine cards, navigation, controls and project-command framing receive the Pirate Mode treatment without changing their behavior.
- The Engine Appearance Pirate Mode control now uses the same smooth switch design as the PIN-screen toggle.
- Pirate Mode remains one persistent Engine-owned setting.
- Project customer shells, Project Admin pages, Project Admin PIN gates, project branding, project data and security remain outside the Pirate Mode styling boundary.
- Keeps v2.9.14 Sealed Bulkheads project-aware Admin PIN gate intact.
- Core rule remains: different brands, different data, same Engine.


## v2.9.17 — BIGGER CARGO HOLD
Foundation for Dark Flag Graphics Studio.

- Upgrades Branding & Graphics into a project-aware Graphics Manager.
- Adds explicit reusable template graphic slots: Project Logo/Mark, Welcome Hero, Footer Graphic, Background/Texture.
- Every asset and its metadata remain namespaced by the permanent project ID.
- Adds a project-specific Graphics Library showing which template slots are assigned or open.
- Records filename, MIME type, size, update time, slot and permanent project ID for uploaded graphics.
- Clearing a graphic also clears its project-owned metadata.
- Template definitions now advertise their graphic slots, preparing future templates and + Add Project to expose graphics without code edits.
- Existing Upload / Replace / Clear behavior remains intact.
- Pirate Mode receives matching Graphics Manager presentation without changing project assets.
- This release intentionally does NOT add AI generation yet. It builds the isolated asset/slot foundation that Graphics AI will use next.


### v2.9.17 storage correction
- Project graphics are stored as binary image blobs in IndexedDB instead of base64 strings in localStorage.
- Graphics remain namespaced by permanent project ID plus slot, preserving project isolation.
- Existing v2.9.16 localStorage graphics are migrated into the graphics database when possible and the legacy payload is then removed.
- Shared three-letter project badges were tightened so IKE, BBS, MUG, and future three-letter codes remain contained.


## v2.9.18 — SEALED GALLERY
Marketing/branding architecture and graphics-isolation correction.

- Moves Branding & Graphics out of shared Protected Engine Controls.
- Adds a first-class `Marketing & Brand` tab inside each project's own Engine Control Center.
- All Graphics Manager reads/writes now resolve from `engineActiveProjectId`, the project actually opened in the Engine, rather than the customer-shell active project.
- Switching projects clears file-picker values, unsaved selections, previews, save messages and expanded-image state before the next project loads.
- IndexedDB graphic reads now verify the permanent project ID, slot and composite storage key; a mismatch is rejected.
- `SEALED` now reflects a namespace verification check rather than being a purely decorative badge.
- Adds a strong `PROJECT GRAPHICS SAVED` confirmation naming the project receiving the assets.
- Enlarges saved previews and adds `+` expand controls.
- Adds an expanded image viewer with an `X` close control and the owning project namespace displayed.
- Keeps project graphic slots and the dedicated IndexedDB cargo hold introduced in v2.9.17.
- Graphics AI remains intentionally deferred until this isolation layer passes testing.


## v2.9.19 — Focused Quarters
Marketing & Brand UX refit: compact project graphics library cards now open one focused asset editor at a time. The sealed permanent project namespace architecture is preserved. Pirate Mode styling is preserved and extended to the focused editor.


## v2.9.20 — CLEAR DECK
Focused Quarters visibility correction.

- Fixes the v2.9.19 UX miss where all four upload editors remained visible at once.
- Keeps the compact Project Graphics Library as the default Marketing & Brand view.
- Selecting a library card now reveals exactly one focused editor for that asset.
- Back to Library hides the focused editor again.
- Save/Clear continue to operate on the selected asset while project isolation remains unchanged.
- No changes were made to the tested IndexedDB project namespace architecture.
- Pirate Mode remains fully preserved and uses the same focused-editor component with Dark Flag styling.


## v2.9.21 — FLYING COLORS
Dark Flag UX and project-identity refinement.

- Fixes the Marketing & Brand editor state directly in JavaScript instead of relying only on CSS visibility.
- Marketing & Brand now opens with the compact four-card Graphics Library only.
- Selecting a card explicitly shows one editor and explicitly hides all other asset editors.
- Back to Library directly closes the editor and hides every upload panel.
- Preserves the tested project graphics namespace/IndexedDB isolation architecture.
- Promotes each project's saved Project Logo throughout the Engine:
  - Project Command cards
  - Project Control Center header
  - Marketing & Brand project seal
- Three-letter project codes remain as a clean fallback only when a project has no saved logo.
- Future projects automatically receive the same logo-first behavior without project-specific code.
- Saving a new project logo refreshes Engine project branding immediately.
- Pirate Mode remains fully preserved; project logos stay recognizable inside the Dark Flag presentation.

## v2.9.22 — Raise the Colors
- Saved project logos now flow into the customer-facing project shell from that project's sealed graphics namespace.
- MUG/BBS customer headers suppress letter fallbacks whenever a saved logo is available.
- Dark Flag project cards and Project Control Center use larger, logo-first identity treatment.
- Project-code initials remain fallbacks when no saved logo exists.
- Pirate Mode behavior and the v2.9.21 Graphics Library interaction are preserved.


## v2.9.23 — TRUE COLORS
Customer-facing project branding inheritance.

- Removes the oversized first-letter hero treatment from the shared MUG/BBS customer shell.
- Empty Hero Graphic slots now use a brand-neutral decorative fallback driven by the shell's project colors rather than a project initial.
- A saved Welcome Hero Graphic automatically replaces that fallback for its project only.
- Project Logo / Mark has increased presence in customer headers and fully replaces the letter fallback when assigned.
- Footer Graphic is now a functional customer-facing slot for MUG and BBS templates.
- Background / Texture is now applied as a softened project-owned customer-shell background so order content remains readable.
- All customer asset reads remain tied to the permanent project namespace and include the existing late-render project guard.
- Empty slots remain clean; projects do not inherit another project's artwork.
- Dark Flag Graphics Library, project isolation, Admin separation and Pirate Mode are preserved.
- No change is made to the customer-facing Engine access control in this release; that remains a separate security/UX task.


## v2.9.24 — PROJECT SHOWCASE
Customer hero branding priority.

- Implements the permanent showcase hierarchy:
  1. Saved Welcome Hero Graphic
  2. Exact saved Project Logo / Mark
  3. Tasteful generic fallback
- When BBS, MUG, or a future shared-shell project has no Hero Graphic but does have a logo, the exact stored logo is displayed prominently in the large hero area.
- The original logo file is never redrawn, recolored, cropped, filtered, or creatively altered. Dark Flag only scales and positions it.
- If a Hero Graphic is later assigned, it automatically takes priority over the logo in the hero area.
- The smaller header logo remains in place as the navigation/brand identity.
- Empty projects still receive the clean generic fallback from v2.9.23.
- Project namespace isolation and late-render guards remain unchanged.
- Graphics Library behavior and expanded previews remain unchanged.
- Pirate Mode remains onboard and untouched by this focused customer-branding release.


## v2.9.25 — GRAPHICS DECK
Universal Graphics Manager UX upgrade.

- One consistent workflow for Project Logo / Mark, Welcome Hero Graphic, Footer Graphic, Background / Texture, and future shared graphic slots.
- Selected images immediately appear in a large in-app preview before saving.
- Unsaved selections show `NEW IMAGE • NOT SAVED`.
- Save is enabled only after a new image is selected and uses a slot-specific label.
- Expanded preview works for saved artwork and newly selected unsaved artwork.
- Successful Save automatically closes the editor and returns to the Project Graphics Library.
- The library immediately shows the saved graphic with a clear project-specific confirmation banner.
- Remove also returns to the Graphics Library with confirmation.
- Each slot explains where the graphic is used.
- Original image aspect ratio is preserved; no creative alteration is performed.
- Project isolation, Project Showcase, Dark Flag Engine behavior, and Pirate Mode remain intact.


## v2.9.40 — BARNACLE SWEEP
Small regression-safe cleanup after the extensibility pass.

- Engine Identity now has clear Saved and Editing states.
- Saved state displays the Engine Name as read-only text with an Edit button.
- Save Engine Name now visibly confirms success and automatically returns to the saved/read-only state.
- Cancel exits editing without changing the saved Engine Name.
- Removes the obsolete editable-schema reference from the Engine Name save handler.
- Project Admin Gate primary-button depth/shadow now derives from the active project's theme rather than the legacy Ike-blue shared button shadow.
- Project Admin Gate PIN focus rings now derive from the active project's accent theme.
- The fix is shared/template-level so BBS, MUG, IKE, and future projects inherit it automatically.
- No project data, workflow, Graphics Library, Showcase, namespace, admin permissions, or customer-shell behavior is changed.
- Pirate Mode remains preserved and Engine-only.


## v2.9.40 — CLEAR ESCAPE HATCH
- Adds clear spacing between Unlock Admin and the customer return action.
- Renames the safe exit to “← RETURN TO MY ORDER”.
- Gives the return action a bold project-themed outline.
- Shared across current and future project Admin Gates.
- No workflow, data, namespace, Showcase, graphics, permissions, or security changes.
- Pirate Mode remains preserved and Engine-only.


## v2.9.40 — CAPTAIN'S QUARTERS FRAMEWORK
A deliberately small, isolated framework for Captain-only creativity.

- Adds a separate Captain's Quarters entry inside Dark Sky/Engine territory.
- Initial Captain PIN: 19613.
- Captain authorization is held only in memory and is cleared on exit/page lifecycle.
- Captain authentication is separate from Pirate Mode and does not reuse the Engine/Pirate credential.
- Adds an intentionally atmospheric but function-light Captain's Quarters chamber.
- The chamber contains placeholders for future creative experiments and Captain-only tools.
- No project/customer workflow, project namespace, graphics, orders, payments, Showcase, or project admin behavior is changed.
- Pirate Mode remains preserved.
- Captain's Mode is privilege separation; Pirate Mode remains presentation/personality.


## v2.9.40 — CAPTAIN'S QUARTERS ACCESS FIX
- Fixes the v2.9.40 placement bug that left the Captain's Quarters button outside the visible Dark Sky Engine layout.
- Docks Captain's Quarters directly below Engine Controls and above Project Analytics.
- Keeps Captain authentication separate from Pirate Mode and project-admin authentication.
- No project/customer workflow, branding, namespace, or data behavior changed.


## v2.9.40 — CAPTAIN'S DOOR LIVE
Access reliability patch for Captain's Quarters.

- Replaces the fragile direct button listener with delegated event handling.
- Captain's Quarters remains reachable even if the Engine control area rerenders or moves.
- The entire Captain access card is a reliable touch target on iPad.
- Adds explicit modal-open state and Escape/Return handling.
- Captain PIN remains 19613 and is never persisted.
- Captain authorization remains memory-only and clears on exit/page lifecycle.
- Pirate Mode, project shells, namespaces, workflows, graphics, orders, payments and security boundaries are unchanged.


## v2.9.40 — Captain's Chamber Entrance
Captain's Quarters now includes its first cinematic identity pass.

- Keeps the v2.9.40 reliable Captain access fix.
- After successful Captain authentication, a dramatic wooden/brass bulkhead entrance opens into the chamber.
- Adds a moonlit stern-gallery scene with ocean, distant ship, storm/lightning, charts, compass and lantern atmosphere.
- The entrance sequence is intentionally brief; the chamber becomes a functional workspace immediately afterward.
- Includes reduced-motion support.
- All effects are presentation-only. No project workflow, namespace, project branding, order, graphics, payment, Pirate Mode or security plumbing is changed.
- Captain PIN remains memory-only and is never persisted.


## v2.9.40 — INDEPENDENT CAPTAIN ACCESS
This release deliberately separates Captain's Quarters access from the main application runtime.

- `captain.js` is loaded independently at the end of the page and has no dependency on app.js, project rendering, Pirate Mode, Engine state helpers, or project namespaces.
- The visible Captain's Quarters ENTER control is now a real link to `#captainQuartersGate`.
- CSS `:target` provides a native fallback: even if the main application JavaScript throws a runtime error, tapping ENTER still opens the Captain PIN gate.
- The standalone controller then owns PIN authentication, cinematic entry, close/exit behavior, and memory-only Captain authorization.
- Captain PIN remains 19613.
- Captain authorization is never stored in localStorage/sessionStorage/cookies.
- Existing project, graphics, order, payment, namespace and Pirate Mode code is unchanged.
- The v2.9.40 cinematic chamber entrance is retained.


## v2.9.40 — Flagship Arrival
The working v2.9.40 independent Captain access is retained. After successful PIN authentication, the Captain now receives a full theatrical arrival: storm sea, moon, flagship silhouette, timber-and-brass doors, rotating lock wheel, sequential lantern ignition, CAPTAIN ON DECK announcement, and a richer revealed chamber. No project namespace, order, payment, Pirate Mode, or customer-shell plumbing was changed.


## v2.9.40 — Captain's Quarters: Black Flag World Pass
This build takes the v2.9.40 working Captain authentication/entrance and raises the Captain's Quarters toward the original Black Flag concept-art bar.

### Visual additions
- Full timber-and-brass Captain cabin environment
- Storm-lit ocean windows and distant fleet silhouettes
- Hanging animated lanterns
- BLACK FLAG Captain banner
- Dark Sky chart/map wall
- Crossed weapon décor
- Foreground Captain's desk
- Existing functional controls are presented as a command table inside the room
- Ambient lighting and restrained environmental motion
- Responsive and reduced-motion treatment

### Architecture
This is intentionally a presentation-layer pass. Project namespaces, project branding, orders, payments, ledgers, Pirate Mode separation, Captain authentication, and customer shells are not intentionally modified.


## v2.9.40 — OPERATION: LIGHT THE DARK SKY
Captain's Quarters interaction and usability pass.

- Removes the immersive cabin world from the Captain PIN gate. The PIN card is now deliberately clear and readable before entry.
- Explicitly blurs the Captain PIN field after authentication so no blinking cursor follows into the chamber.
- Preserves the independent Captain access architecture and PIN 19613.
- Moves the full cabin environment into the authenticated Captain's Quarters only.
- Adds living cabin atmosphere: storm windows, moon, ships, ocean movement, timber beams, lanterns, map frame and command desk.
- Converts THE DARK SKY wall chart into the first genuine interactive room object.
- Tapping the Dark Sky chart opens a Captain-only fleet chart for the current three known projects in this build.
- The fleet chart is read-only in this release and changes no project configuration.
- Existing Captain controls are framed as the command desk rather than a conventional floating dashboard.
- Project/customer namespaces, orders, payments, project branding, Graphics Library, Pirate Mode and normal Engine behavior are not modified by this pass.


## v2.9.43 — Sail to the Stars / Captain's Quarters 2.0
Weathered desk-as-interface, First Mate's Table, fixed Dark Sky layering, Reset Engine moved into Powder Keg with existing Engine PIN/final-confirmation safeguards, and richer moving water. PIN gate and Captain-on-Deck entrance retained.


## v2.9.43 — CHART THE SHIP
Adds a permanent Captain-level Ship's Blueprint / System Architecture Map.

### Purpose
The Blueprint is the Captain's living map of the complete Dark Sky system. It deliberately uses both pirate terminology and normal technical terminology so the structure remains understandable while preserving the Captain's Quarters identity.

### Current mapped architecture
- Captain's Quarters — Command & R&D Layer
  - First Mate's Table
  - Cargo Hold / AI Workshop foundation
  - Powder Keg Locker
  - Captain's Log
  - Ship's Blueprint
- Dark Sky Engine — Core Platform / Crew Operations
  - Project Registry
  - Project Showcase
  - Graphics Library
  - Engine Controls
  - payment plumbing framework
  - Captain fee ledger concept
  - separate waived-fee ledger concept
  - future accounting/export layer
- Project Isolation Bulkheads
- Fleet / independent project vessels
  - Ike's Wood Signs
  - Mugs After Dark
  - Becca's Blossom Shop
  - future custom projects not constrained to IKE's workflow

### Release discipline
Beginning with this build, material architecture changes should include a corresponding update to the Ship's Blueprint and its revision label.

This release adds the map/documentation surface and does not intentionally collapse project namespaces or grant new destructive authority.

# Black Flag fleet register

**Chartroom · 8.8.20.126**  
Captain’s guide to the fleet, the operator handoff and the first limited trial.

## Who can do what

| Office | Where to go | What the office does |
| --- | --- | --- |
| Fleet owner acting as Admiral | Engine Room → Build & Govern | Choose the vessel, appoint or revoke its Captain, and approve feature terms. The fleet owner retains ownership through an appointment. |
| Admiral observing the fleet | Admiral My Fleet → Attention or Vessels | Read reports and see which vessels need follow-up. A report gives the reader no operating authority. |
| Appointed vessel Captain | Vessel Captain sign-in link in Delegate → Appointments & History | Sign in and accept an appointment to operate the named vessel. The link identifies the ship. The account and accepted appointment establish access. |
| Business owner or partner | The vessel’s own owner portal → Fleet Services | See services offered to that business and request an eligible paid upgrade. Fleet approval, activation and billing are separate steps. |
| Customer | The vessel’s own storefront or kiosk | Use the customer experience. Operator, owner and Admiral accounts have separate entrances. |

## What belongs where

| Fleet area | Members and entry |
| --- | --- |
| Six protected vessel identities | Ike’s Wood Signs, Legacy Plumbing, Signal Restoration, Mugs After Dark, Becca’s Bloom Shop and Grizzly Bear. Start at **Choose a vessel** for work or **My Fleet → Vessels** for a report. |
| Recovery exercise | VoyageKeeper Recovery Test appeared separately in the Captain’s fleet view. A recovery vessel serves a different purpose from a protected business identity. Current assignments come from the authenticated registry. |
| Business programs and tools | ScheduleJoe handles construction scheduling for Bootstrap Build. Carvewright handles sign design and machining files. Both appear under **My Fleet → Programs & tools → Business tools**. Engine Room also offers Quotes & invoices and Streetwise. HouseHull’s measurement roadmap is under Fleet structure & planning. |
| Learning and games | Wonderwake is a registered learning program. Fleet Arcade includes eight game entries, including Lantern Run with its own maze progression. Both appear under **Learning & games** when eligible. Black Flag Regatta has its own Engine Room entry. Stormwake has a separate Admiral entry. Brightwake is a local family pilot. |
| Travel | Valley Notes is a local travel pilot under **Programs & tools → Travel**. |
| Engineering and recovery | Engine Room → Engineering Systems holds diagnostics, lessons and recovery tools. The registration and launch status of a program remains independent of its menu group. |

## Hand off a ship for a limited trial

1. In **Build & Govern → Delegate**, select the intended vessel. Choose **Review this ship’s features**. The review opens on that ship with **One feature** selected and no feature chosen. Choose the feature and its terms. **Preview Order** shows the impact. **Issue Admiral Order** is the separate write action. Review any features already enabled on the ship, since entering this screen does not reset them.
2. Return to **Delegate → Appoint Captain**. Select the same vessel, enter the operator’s account, preview, and issue when ready. The operator signs in with their own account and accepts. To end the handoff, revoke the appointment in its history. Review separately any access the account already held.
3. To expand a trial, preview the individual service on the same ship and issue the agreed terms. To end a manually managed trial, review its features and turn off the ones introduced for the test. Appointment and feature history are separate. Neither step charges a customer.

| Feature state | Meaning |
| --- | --- |
| Off | The vessel’s service is unavailable. A revoked entitlement stays unavailable even when an older upgrade request exists. |
| Free | The Admiral includes the selected service at zero charge. A trial uses the existing grants for that vessel and needs an explicit end decision. |
| Paid | The Admiral records paid terms for the feature. A business owner may request an upgrade when the server offers it. A request or commercial order does not collect payment. |

The six controls in Course Orders cover customer payments, artwork and inlay production, customer and order insight, the enhanced business ledger, AI recommendations, and vendor and capacity routing. Ordinary vessel operations, admission to the fleet, and access to a standalone program follow their own rules.

## First customer candidate

For **Ike’s**, treat artwork and inlay production as the first candidate for a limited offer. Use a synthetic sign and a dedicated test vessel. Verify these three outcomes before offering it to an outside customer.

1. The operator accepts the named ship and can perform its basic work. A different test ship’s records stay private.
2. With artwork and inlays Off, the actual production service refuses a paid-feature action. After approval, only the intended vessel can perform it.
3. Turning the feature Off again prevents new production actions. Previously saved work stays with the intended ship.

Chartroom’s offline checks exercise the client handoff, feature preview and receipt, owner catalog, and session cleanup. Verification of the hosted production action with two independent accounts is still open. Current scope includes manual trial closure. Prices, automatic expiry and billing integration are separate product decisions.

## Source and baseline

The public baseline was Firstlight Bay 8.8.20.125 at Git commit `a92fbfd6ba08832da7a43455abb752fb82bebb07`. The muster model identifies the six protected vessels. The entitlement model defines Off, Free and Paid. Current ownership of the fleet is supplied by the Captain. Individual operators and private business records are intentionally outside this register.

[Public baseline source](https://github.com/jdaniel318-ctrl/-ikes-wood-signs/tree/a92fbfd6ba08832da7a43455abb752fb82bebb07) · [Vessel muster](https://github.com/jdaniel318-ctrl/-ikes-wood-signs/blob/a92fbfd6ba08832da7a43455abb752fb82bebb07/FLEET_MUSTER_SEED.json) · [Feature entitlement model](https://github.com/jdaniel318-ctrl/-ikes-wood-signs/blob/a92fbfd6ba08832da7a43455abb752fb82bebb07/FEATURE_ENTITLEMENT_MODEL_870.json)

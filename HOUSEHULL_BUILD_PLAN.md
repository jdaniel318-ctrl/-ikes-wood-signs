# HouseHull — exterior estimating ship plan
**Keelmark 8.8.20.35 · HH-DESIGN-2 · Planning only, not an implemented estimator**

## 1. Keep the approved ship identity
**HouseHull is the previously approved name**, accepted in the October 2 project discussion. **Iron Square is an unapproved alternative suggested later**, not permission to rename, replace, or duplicate that ship. Keelmark names this software update, not a business. The earlier Iron Square design documents remain as historical references; this plan takes precedence for the new ship's identity.

The latest attempt to read Fleet Core was blocked. An existing HouseHull canonical identity or draft is therefore **unverified, not absent**. Before any commissioning, inspect the exact existing draft/operation, reconcile it, and continue that identity where appropriate. Neither a suggested brand name nor a local draft is proof of a canonical ship. The baseline already contains HouseHull prototype/sea-trial code; it remains unchanged and is not newly certified by this planning update. This ZIP creates no vessel, sends no invitation, changes no role and executes no commissioning command.

Recommended administrative classification: an Admiral-owned **Fleet Core business vessel**. Ownership, Admiral oversight and exact-vessel Captain operation remain separate. Bootstrap Build remains an Admiral Program outside Fleet Core. Confirm the existing identity/classification before changing anything.

## 2. First useful product: salesperson siding takeoff
The salesperson starts **after a quote request**. Customer quote requests carry front, back, left and right photos when supplied, plus miscellaneous/detail images and a description of the work. Customers are not asked to perform technical dimension entry. The salesperson verifies the building faces, openings and selected products, adds any miscellaneous materials, then reviews the takeoff.

One focused step at a time: **Job → Four sides → Measurements → Openings & trim → Materials → Review**. Back retains the draft; leaving or reconnecting never submits it. A missing side is marked Not supplied, not interpreted as zero wall area. Saved, queued and unsaved states are visually different. No automatic camera copy to the device's Photos library is required; private upload state must remain explicit.

The first complete output includes siding, starter, inside/outside corners, selected window/door trim, finish pieces, flashing where applicable, product-specific nails/fasteners and a miscellaneous line. Quantities are separated from costs, labor, selling price and any agreed Admiral service fee. No fee is activated by being in the fleet.

## 3. Measurements have evidence, not invented precision
Record a stable elevation/section ID, shape, dimensions, units, source and observation time. Preserve **AI ESTIMATE → FIELD MEASURED → VERIFIED** as distinct evidence states. A photo alone is not a calibrated scale. Field measurements or a verified reference for the measured plane are required; unknown scale, perspective and occlusion cannot silently become precise dimensions. The scale method remains a design decision to validate with measured examples.

Record door/window count, width, height, exact elevation/section and a trim treatment per opening. Area deductions and linear trim quantities are separate. An installer/product deduction policy must be explicit: do not assume that every opening can be deducted or that every offcut is reusable. Do not deduce a window count from area alone.

Rectangle area = width × height. Triangular gable area = base × rise ÷ 2. A square = 100 square feet in the chosen takeoff convention. Store the underlying area and units; squares are a presentation/conversion layer. Product coverage/exposure, stock length and packaging are separate rule snapshots. Waste is material-specific and applied once. Round purchasing packages up after calculation, not at every intermediate step.

Unknown product coverage, stock lengths, fastening rules or substrate conditions produce **Needs product rules**. Missing nails information must never produce a zero-nails line or a Complete takeoff badge. These statements are requirements for the future product, not installation advice or manufacturer rules.

## 4. Worked acceptance examples — assumptions, not catalog recommendations
| Synthetic case | Gross | Opening deduction | Net | With chosen 10% waste | Synthetic 200 sq ft packs |
|---|---:|---:|---:|---:|---:|
| 40 × 10 ft rectangle; two 3 × 5 windows and one 3 × 7 door | 400 sq ft | 51 sq ft | 349 sq ft / 3.49 squares | 383.9 sq ft | 2 |
| 30 × 10 ft rectangle plus 30 × 6 ft triangular gable; two 3 × 5 windows | 390 sq ft | 30 sq ft | 360 sq ft / 3.60 squares | 396 sq ft | 2 |

The fixture uses full opening deduction, 10% waste and 200 square feet per package solely for arithmetic consistency. None is an approved catalog rule. Area alone does not resolve trim, corners, flashing or nails. The package contains a machine-readable copy of these examples and an offline specification check; **it does not contain an operational estimating engine**.

Required negative tests for the implementation: missing side; zero/negative dimension; units omitted; duplicate section ID; opening assigned to wrong wall; openings exceeding wall area; unsupported scale; missing product revision; invalid coverage; missing fastener rate; double waste; altered approved quote; wrong-vessel photo; stale price rule. Each must be rejected or held with its exact reason, not treated as zero or silently corrected.

## 5. Real business review and revisions
Review shows measured installed area, waste-adjusted purchasing quantity, packages/pieces, linear accessories, fasteners, labor method and unresolved assumptions. Support per square, square foot, linear foot, opening, item, crew day and manual labor lines, with explicit configured rates rather than claimed universal crew prices. Tax and fee handling remains a separate approved business configuration.

Approval freezes the revision's dimensions, product rules, quantities, prices and assumptions. New prices or edits create a new revision; historical approved quotes remain unchanged. A quote is not a sale, payment or tax ledger entry. External proposals must not contain internal diagnostic notes or another ship's customer details.

## 6. Security, persistence and fleet independence
Each record/photo is scoped by immutable vessel, estimate and revision IDs. Salespeople see only the exact vessel and assigned estimates allowed by server rules. An address/URL never grants access. The Admiral has authenticated read-only observation and exact-vessel exports; operating changes are separately authenticated and audited. Recommendations need evidence, delivery and acknowledgment history.

Production data requires private server storage with a tested **backup and restore** path. The present Ike's owner order/settings screens still read **browser-local** records; secure sign-in does not make those records a cloud backup. Preserve browser data until a separately approved durable migration has independent read-back and restore proof. No such migration is added here.

Every write uses an explicit user action and an operation/revision identifier. Unknown outcomes mean read and reconcile. Reconnect, refresh, sign-in, page navigation and the static build brief never auto-retry a commission, save, appointment or report. Existing VoyageKeeper operations are not used as new-ship probes.

## 7. Expansion without losing the siding commitment
**Brick/block foundations:** keep this requested expansion in the roadmap, with face/run lengths, wall height, openings, nominal selected-unit coverage, corners, waste and finishes. Door/window count and dimensions and configurable trim remain required. A quantity takeoff is not structural or code approval.

**Roofing:** a separately accepted module after siding. Distinguish projected area from already-measured sloped area; never apply pitch twice. Roof planes, eaves, rakes, ridges, hips and valleys require explicit measurements and product rules. No workflow requires unsafe access.

**Vision/aerial assistance:** evaluate only after accuracy against field measurements, licensing, coverage, privacy and cost review. Manual verified dimensions remain usable without any paid integration. No imagery provider or purchase is selected by this plan.

## 8. Fleet order of work and stop conditions
1. Prove Ike's existing owner can open active Orders and return without the false sign-in bounce. No duplicate order, password reset or namespace migration.
2. Reconcile HouseHull's existing identity/draft before any commissioning preview. A blocked read stops identity creation, not ordinary offline design.
3. Build one siding example from quote request to internal takeoff using synthetic records, with all required material rules explicit. Review that implementation plan before building its endpoints.
4. Prove direct server own/foreign read and write boundaries, private photo access, controlled revocation/restoration and durable recovery before live business data or outside-Captain handoff.
5. Extend the common deck, error states and useful business controls without merging branding, customer lists, prices, finances or ship identities. Preserve Ike's normal logo, A/B geometry, sign wording/case and all historical records.

**This release is TEST ONLY.** It preserves the SureFoot repair and adds planning/release verification. It neither certifies all server permissions nor activates a customer business. Current offline results, historical field evidence and outstanding native tests are kept separate in FLEET_READINESS_MATRIX.json.

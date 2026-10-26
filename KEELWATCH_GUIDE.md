# Keelwatch 8.8.20.65 — Fleetguard evidence inside Admiral Delegate

## Upload

Extract `DarkSky882065-Keelwatch-Upload42.zip`, open the single identically named folder, upload **all files inside** to the existing GitHub repository root, and replace matching files. Preserve other files. The separate full backup is not an upload package. Do not clear Safari data, edit database roles, or run SQL.

## What is new

In **Admiral Command Deck → Delegate**, the original Captain appointment tabs remain. A new **Fleetguard Evidence** tab shows a read-only **one-vessel** summary based on the two existing server-authorized Admiral list APIs. Choose one vessel and use **REFRESH & DOWNLOAD EXACT-VESSEL EVIDENCE** to recheck identity and export a scoped JSON report.

- A directory row is labeled *record present*, not commissioned.
- An accepted Captain appointment is labeled *record observed*, not proof of real operator access or successful handoff.
- Revocation history does not count as a cross-vessel access-denial test.
- Isolation, backup, restore, customer approval, Sea Trial and deployment remain **NOT VERIFIED** unless an independent authoritative proof exists. This readback does not inspect them.
- No record, appointment, permission, service entitlement, customer photo, production order or lifecycle state is changed by Fleetguard.
- The view clears its protected memory on Admiral session loss. No downloaded report contains candidate emails, customer records or tokens.

The pre-existing Fleetguard standalone tester remains available. Its offline Captain appointment role predicate now correctly requires exact-vessel `operator` and still requires vessel-scoped authenticated proof.

## Limits

No new database migration has been executed. This is not an automatic server-side restore test, not a signed agreement, not a hardware test, and not a completed working-vessel handoff. Production record protection and live privacy boundaries still require separately documented tests. The Live Site acceptance must be performed on iPad after upload.

## iPad check — three steps

1. Confirm **8.8.20.65** in Engine Room, enter the strictly authenticated Admiral Deck, and open **Delegate**.
2. Select **Ike's Wood Signs**, open **Fleetguard Evidence** and confirm a scoped **commissioning not verified** report with no invented green gates.
3. Tap **Refresh & Download Exact-Vessel Evidence**. Confirm the downloaded JSON identifies only Ike's project and contains no customer data. Do not issue an appointment or change permissions.

# 8.8.20.8 — PassageLine

- Corrects the HarborPass authorization round trip: commissioning now opens a focused same-tab Admiral gate and returns directly to the preserved voyage after verified authority.
- The Admiral Command Deck is no longer the destination for voyage authorization.
- After verification, the pending server save runs automatically; SERVER SAFE still requires Fleet Core save plus same-voyage readback.
- Unrelated Admiral session changes cannot silently authorize a commissioning voyage.
- Critical commissioning state stays in the guided voyage path; footer status remains secondary navigation context.
- Existing fleet authority, vessel isolation, logos, ledger, and production gates are unchanged.

# Harborlight 8.8.20.87 — approved kiosk and testing build

Goal: give Ike a real guided customer journey, protect customers on shared devices, and bring fleet testing into one Engine entry.

Architecture: reuse Countercraft's guided customer app, encrypted recovery, exact-scope gateway and owner inbox. Keep the personal-device Mail request path separate. Extend the existing Engine experience deck into the Fleet Test Center. Do not add a second intake backend.

Tech: buildless browser JavaScript, existing Supabase gateway, Node tests and Playwright. Source baseline is the delivered Clearway archive, copied into this isolated Harborlight directory. This project is not a Git checkout; release reconstruction and rollback verification provide change isolation.

Approved specification: the Captain's Nov 2 field findings and Nov 3 instruction to build. No repeated design approval is needed. No paid service, automatic email, production activation or machine action is authorized by this build.

## Global constraints
- Public customer pages cannot start preview/trial modes or reach owner/Engine controls.
- Owner authentication and exact vessel/backend/environment/site/deployment/mode scope remain authoritative. A client-side PIN is not cloud authorization.
- A kiosk receipt requires durable complete server storage. A lost response is unconfirmed, never automatically retried.
- Shared device completion, cancellation, inactivity and restored pages remove customer-readable state. Owner recovery remains encrypted and separately authorized.
- Existing Mail fallback remains personal-device only. Native iPad, physical privacy and VCarve checks remain pending unless observed.
- Do not publish or mutate the connected backend while preparing the build. No Ike publication was configured at the last read-only audit; report setup requirements honestly.

## Tasks
1. Reproduce actual navigation failure; make the personal request path show one step at a time, preserve values and validate each forward transition. Route deployed shared devices into Countercraft. Add field learning checks.
2. Harden Countercraft entry, session end/idle and async teardown; use owner-selected exact location scopes. Keep owner setup and encrypted recovery together. Verify saved receipts, isolation, reload and old tabs with controlled backend fixtures and existing service tests.
3. Consolidate testing in the authenticated Engine Test Center. Retire Test Access PIN bypass. Make direct public test routes fail closed. Add learning record and evidence controls with build/vessel/site/result, without customer data.
4. Run release suite and focused browser checks; one fresh final review; fix confirmed important defects, seal patch/full backup/rollback and verify reconstruction. Deliver links plus a short next test.

## Review focus
1. Next/Back changes the visible step, retains values, and cannot bypass required inputs.
2. Customer B, reload or an old tab cannot expose customer A; late async results cannot repaint a departed session.
3. Query strings, old Test Access storage and public links do not grant testing or owner authority.
4. Kiosk requests/receipts/recovery remain exact-scope and durable; unknown submission outcomes cannot duplicate jobs.
5. Build identity, artifact inventory, native test limitations and rollback are truthful.

Resources: GOV.UK question pages (one thing per page and retained answers); OWASP Session Management (server expiry and client warning); W3C Web Share (OS-selected targets, no recipient field). Consulted 2026-11-03.

Primary references consulted:
- https://design-system.service.gov.uk/patterns/question-pages/
- https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- https://www.w3.org/TR/web-share/
- https://supabase.com/docs/guides/auth/sessions
- https://supabase.com/docs/guides/functions/auth

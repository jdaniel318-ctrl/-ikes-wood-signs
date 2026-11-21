# Install Clipper 8.8.20.151

1. Start with the complete Prism 8.8.20.150 release. Its full-source ZIP contains 1,074 files and has SHA-256 `149c119203d934c04ff1ba1c52a01bb57c377705a98479203570efe85d264df5`. Confirm your installed version in the Engine. For a different base, use your matching release sequence or review the complete Clipper source backup before choosing an installation path.
2. Extract `Clipper.zip` (the Pages upload). Open the single `DarkSky8820151-Clipper-Upload` folder and place every file inside it in the existing repository root. Replace matching files in one commit and keep every other project file, including README.md.
3. Open the deployed Engine. Confirm `8.8.20.151 • CLIPPER`. Open Lantern Harbor, return to My Fleet, and reopen the lesson. In the Engine business tools, Owner portal or a finalized Quartermaster invoice, open Fleet payments.

## Activate payments separately

Follow the setup guide in `Clipper-Payments.zip` to configure the private Node 24 service, HTTPS origin, server-only credentials, authenticated operators, connected ship accounts and signed Stripe webhooks. Test the full payment and reconciliation flow in Stripe test mode before enabling live transactions. The gateway shows the split example while service configuration is unavailable.

After the service is ready, create `fleet-payments-service.json` next to `fleet-payments.html` with the public HTTPS origin of your payment service. The example uses a reserved domain.

```json
{"serviceOrigin":"https://payments.example.org"}
```

Keep Stripe, database and account credentials on the private server. The public file contains only the HTTPS origin. The Pages archive performs no database actions.

## Verification and rollback

From the complete source folder, run `node VERIFY_RELEASE_ALL.cjs . ../clipper-checks`. Run `python3 -B CHECK_ENTRY_BUDGET.py . --previous /path/to/Prism --json` to compare the raw and gzip-9 entry sizes by program. To exercise the integrated launcher in a local Chromium browser, install Playwright and Chromium and run `python3 -B VERIFY_ENTRY_BROWSER.py .`. Native iPad Safari testing and live payment settlement are separate acceptance steps.

To restore Prism, extract `Clipper-Rollback.zip` and place its inner files over the same repository root. Retire the newly added `fleet-payments.html` page and remove the public service-origin file separately if you configured it. The old Engine no longer uses the Clipper launcher or links. Existing customer payment links, reconciliation jobs and ledgers use the separate payment service; preserve that service and its records. Never restore old permissions or business data.

The full-source backup contains application source. Back up customer records, hosted media, payment-service state and device drafts through their own systems.

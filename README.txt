IKE'S START BUTTON FUNCTIONAL REPAIR

Replace these three files in the existing Ike's site root:
- index.html
- app.js
- sw.js

Do NOT delete or replace the existing styles.css, manifest.webmanifest, assets folder, or order data.

Repairs:
1. UI event binding now happens before IndexedDB opens, so a storage startup error cannot leave START YOUR SIGN dead.
2. IndexedDB errors are isolated from customer navigation.
3. Order save now reports a visible failure instead of silently dying.
4. Service worker cache upgraded and old caches are removed.
5. HTML/JS/CSS use network-first caching to prevent stale app.js from surviving a deployment.
6. app.js URL is versioned to force the repaired script after refresh.

After deployment, reload the page once. If the old service worker controlled the first load, reload one additional time.
First test: START YOUR SIGN must move from Step 1 to the price screen.

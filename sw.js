const CACHE='ikes-wood-signs-v1-3';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./assets/ike_logo.jpg','./assets/ike_character.jpg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

const RELEASE_BUILD='8.2.4';
const RELEASE_SEAL='ikefit-824-font-lock-cx-trim-4d81be';

self.addEventListener('install', event => {
  // Admiral Seal: service worker is an identity/control-plane sentinel only.
  // Executable runtime files are never precached here; boot verifies and executes one in-memory snapshot.
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>/^(ikes-wood-signs-|workshop-engine-|black-flag-|dark-sky-)/.test(k)).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if(event.data?.type==='GET_RELEASE_IDENTITY'){
    const payload={type:'DARK_SKY_RELEASE_IDENTITY',build:RELEASE_BUILD,seal:RELEASE_SEAL,cachePolicy:'identity-only-no-executable-cache'};
    if(event.ports&&event.ports[0]) event.ports[0].postMessage(payload);
    else event.source?.postMessage(payload);
  }
});
// Intentionally no fetch handler. The browser/network must serve current release bytes;
// Dark Sky's atomic loader verifies them with cache:no-store before any Engine runtime executes.

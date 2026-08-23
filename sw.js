const CACHE='dark-sky-v6-9-0-proven-keel';
const ASSETS=[
  './',
  './index.html',
  './styles.css?v=6.9.0',
  './platform_core.js?v=6.9.0',
  './platform_v4.js?v=6.9.0',
  './platform_identity.js?v=6.9.0',
  './app.js?v=6.9.0',
  './captain.js?v=6.9.0',
  './manifest.webmanifest',
  './assets/black_flag_primary_lockup.png',
  './assets/black_flag_platform_icon.png',
  './assets/ike_character.jpg',
  './assets/captains_quarters_command_center_v578.png',
  './assets/admirals_deck_ceremonial_v640.png',
  './assets/signal_restoration_logo.png'
];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache=>
      Promise.allSettled(ASSETS.map(asset=>cache.add(asset)))
    )
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys.filter(k=>(
          k.startsWith('ikes-wood-signs-') ||
          k.startsWith('workshop-engine-') ||
          k.startsWith('black-flag-') ||
          k.startsWith('dark-sky-')
        ) && k!==CACHE).map(k=>caches.delete(k))
      ))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const req=event.request;

  // Navigation and executable assets are network-first so a repaired hull
  // cannot remain pinned to an older cached build.
  const url=new URL(req.url);
  const freshFirst=
    req.mode==='navigate' ||
    /\.(?:html|js|css)$/.test(url.pathname) ||
    url.searchParams.has('v');

  if(freshFirst){
    event.respondWith(
      fetch(req)
        .then(response=>{
          if(response && response.ok){
            const copy=response.clone();
            caches.open(CACHE).then(cache=>cache.put(req.mode==='navigate'?'./index.html':req,copy)).catch(()=>{});
          }
          return response;
        })
        .catch(()=>caches.match(req).then(r=>r||caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached=>cached||fetch(req).then(response=>{
      if(response && response.ok){
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{});
      }
      return response;
    }))
  );
});

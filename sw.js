const CACHE='dark-sky-v4-8-3-bor-commissioning';
const ASSETS=[
  './',
  './index.html',
  './styles.css?v=4.8.3',
  './platform_core.js?v=4.8.3',
  './platform_v4.js?v=4.8.3',
  './platform_identity.js?v=4.8.3',
  './app.js?v=4.8.3',
  './captain.js?v=4.8.3',
  './manifest.webmanifest',
  './assets/black_flag_primary_lockup.png',
  './assets/black_flag_platform_icon.png',
  './assets/ike_character.jpg',
  './assets/captains_quarters_cinematic_v2953.jpg',
  './assets/engine_room_modern_benchmark_v2976.png',
  './assets/engine_room_pirate_benchmark_v2978.png',
  './assets/best_option_restoration_logo.jpg'
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

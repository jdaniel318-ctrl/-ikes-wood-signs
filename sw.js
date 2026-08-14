const CACHE='black-flag-engine-v3-0-2';
const ASSETS=[
  './',
  './index.html',
  './styles.css?v=3.0.2',
  './platform_core.js?v=3.0.0',
  './platform_identity.js?v=3.0.0',
  './app.js?v=3.0.0',
  './captain.js?v=3.0.2',
  './manifest.webmanifest',
  './assets/ike_character.jpg',
  './assets/captains_quarters_cinematic_v2953.jpg',
  './assets/engine_room_benchmark_v2955.jpg',
  './assets/engine_room_modern_benchmark_v2976.png',
  './assets/engine_room_pirate_benchmark_v2978.png'
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
        keys.filter(k=>(k.startsWith('ikes-wood-signs-')||k.startsWith('workshop-engine-')) && k!==CACHE)
            .map(k=>caches.delete(k))
      ))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  if(event.request.mode==='navigate'){
    event.respondWith(
      fetch(event.request)
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put('./index.html',copy)).catch(()=>{});
          return response;
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(response=>{
        if(response && response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});
        }
        return response;
      })
      .catch(()=>caches.match(event.request))
  );
});

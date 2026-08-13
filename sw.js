const CACHE='workshop-engine-v2-9-62-captain-workspace-layer-fix';
const ASSETS=[
  './',
  './index.html',
  './styles.css?v=2.9.62',
  './app.js?v=2.9.62',
  './captain.js?v=2.9.62',
  './manifest.webmanifest',
  './assets/ike_character.jpg',
  './assets/captains_quarters_cinematic_v2953.jpg',
  './assets/engine_room_benchmark_v2955.jpg'
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

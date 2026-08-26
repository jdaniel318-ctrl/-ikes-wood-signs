const RELEASE_BUILD='8.0.8';
const RELEASE_SEAL='yardarm-808-onebuild-93e4b7';
const CACHE=`dark-sky-${RELEASE_BUILD}-${RELEASE_SEAL}`;
const CORE=[
  './',
  './index.html',
  './owner.html',
  `./styles.css?seal=${RELEASE_SEAL}`,
  `./platform_core.js?seal=${RELEASE_SEAL}`,
  `./platform_v4.js?seal=${RELEASE_SEAL}`,
  `./platform_identity.js?seal=${RELEASE_SEAL}`,
  `./app.js?seal=${RELEASE_SEAL}`,
  `./captain.js?seal=${RELEASE_SEAL}`,
  './manifest.webmanifest',
  './DEPLOYMENT_MANIFEST.json',
  './RELEASE_SEAL.json',
  './assets/black_flag_primary_lockup.png',
  './assets/black_flag_platform_icon.png',
  './assets/ike_character.jpg',
  './assets/captains_quarters_command_center_v578.png',
  './assets/admirals_deck_ceremonial_v640.png',
  './assets/signal_restoration_logo.png'
];
self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>Promise.all(CORE.map(asset=>cache.add(asset)))));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(/^(ikes-wood-signs-|workshop-engine-|black-flag-|dark-sky-)/.test(k)&&k!==CACHE)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('message',event=>{
  if(event.data?.type==='GET_RELEASE_IDENTITY'){
    const payload={type:'DARK_SKY_RELEASE_IDENTITY',build:RELEASE_BUILD,seal:RELEASE_SEAL,cache:CACHE};
    if(event.ports&&event.ports[0]) event.ports[0].postMessage(payload);
    else event.source?.postMessage(payload);
  }
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const req=event.request,url=new URL(req.url);
  const executable=req.mode==='navigate'||/\.(?:html|js|css|json|webmanifest)$/.test(url.pathname)||url.searchParams.has('seal');
  if(executable){
    event.respondWith(fetch(new Request(req,{cache:'no-store'})).then(response=>{
      if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{});}
      return response;
    }).catch(()=>caches.match(req).then(r=>r||(url.pathname.endsWith('/owner.html')?caches.match('./owner.html'):caches.match('./index.html')))));
    return;
  }
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{});}return response;})));
});

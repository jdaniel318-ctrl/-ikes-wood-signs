const CACHE='dark-sky-v4-3-9-experience-test-deck';
const ASSETS=[
  './',
  './index.html',
  './styles.css?v=4.3.8',
  './platform_core.js?v=4.3.8',
  './platform_v4.js?v=4.3.8',
  './platform_identity.js?v=4.3.8',
  './app.js?v=4.3.8',
  './captain.js?v=4.3.8',
  './experience_test_deck.js?v=4.3.9',
  './manifest.webmanifest',
  './assets/black_flag_primary_lockup.png',
  './assets/black_flag_platform_icon.png',
  './assets/ike_character.jpg',
  './assets/captains_quarters_cinematic_v2953.jpg',
  './assets/engine_room_modern_benchmark_v2976.png',
  './assets/engine_room_pirate_benchmark_v2978.png'
];

function injectDeckScript(html){
  if(html.includes('experience_test_deck.js')) return html;
  const tag='<script src="./experience_test_deck.js?v=4.3.9" defer></script>';
  return html.includes('</body>') ? html.replace('</body>',`${tag}</body>`) : `${html}\n${tag}`;
}

function patchAppSource(source){
  let out=source;
  out=out.replace("const BUILD_VERSION = '4.3.8';","const BUILD_VERSION = '4.3.9';");
  const bridge=`\n  // 4.3.9 Experience Test Deck bridge — deliberately narrow.\n  // Exposes only project/test operations needed by the additive Test Deck layer.\n  window.DarkSkyExperienceBridge={\n    projectById,projects,migrateLegacyDeployment,projectCustomerOperatingModelReady,projectShellFor,universalOffersFor,\n    enterProject,openProjectEngineControl,renderProjectTab,renderProjectCommand,saveCompanies,logActivity,hideAllCustomerShells,\n    projectFleetLaunchState,openDeploymentTestDock,readProjectAssets,projectBrandVisual\n  };\n`;
  const marker='})();';
  const i=out.lastIndexOf(marker);
  if(i>=0 && !out.includes('window.DarkSkyExperienceBridge=')) out=out.slice(0,i)+bridge+out.slice(i);

  const oldFleetReady="if(tested.length||active.length)return {key:'fleet_ready',label:'FLEET READY',step:4,detail:'Sea Trial proof is recorded. Captain approval can join this vessel to the live fleet.',action:'join',actionLabel:'JOIN FLEET',deployments,active,tested,trials,offers,brief};";
  const newFleetReady="const experienceGate=window.DarkSkyExperienceTestDeck?.fleetReadinessFor?.(p);if((tested.length||active.length)&&experienceGate?.ready)return {key:'fleet_ready',label:'FLEET READY',step:4,detail:'Experience approved and current Sea Trial proof recorded. Captain approval can join this vessel to the live fleet.',action:'join',actionLabel:'JOIN FLEET',deployments,active,tested,trials,offers,brief};if(tested.length||active.length)return {key:'sea_trial',label:'TEST DECK',step:3,detail:experienceGate?.detail||'Approve the customer experience and pass a current Sea Trial before joining the fleet.',action:'test_experience',actionLabel:'TEST EXPERIENCE',deployments,active,tested,trials,offers,brief};";
  if(out.includes(oldFleetReady)) out=out.replace(oldFleetReady,newFleetReady);

  const continueNeedle="const launch=projectFleetLaunchState(p);\n    if(launch.key==='live')";
  const continueReplacement="const launch=projectFleetLaunchState(p);\n    if(launch.action==='test_experience'){window.DarkSkyExperienceTestDeck?.open?.(p.id);return;}\n    if(launch.key==='live')";
  if(out.includes(continueNeedle)) out=out.replace(continueNeedle,continueReplacement);
  return out;
}

async function networkAndCache(request,cacheKey=request){
  const response=await fetch(request);
  if(response && response.ok){
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(cacheKey,copy)).catch(()=>{});
  }
  return response;
}

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>Promise.allSettled(ASSETS.map(asset=>cache.add(asset)))));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>(
      k.startsWith('ikes-wood-signs-') || k.startsWith('workshop-engine-') ||
      k.startsWith('black-flag-v3-7-4') || k.startsWith('dark-sky-')
    ) && k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);

  if(event.request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const response=await fetch(event.request);
        const html=await response.text();
        const patched=injectDeckScript(html);
        const headers=new Headers(response.headers);headers.set('content-type','text/html; charset=utf-8');
        const result=new Response(patched,{status:response.status,statusText:response.statusText,headers});
        caches.open(CACHE).then(cache=>cache.put('./index.html',result.clone())).catch(()=>{});
        return result;
      }catch(_){
        const cached=await caches.match('./index.html');
        if(!cached) throw _;
        const html=await cached.text();
        return new Response(injectDeckScript(html),{headers:{'content-type':'text/html; charset=utf-8'}});
      }
    })());
    return;
  }

  if(url.pathname.endsWith('/app.js')){
    event.respondWith((async()=>{
      try{
        const response=await fetch(event.request);
        const source=await response.text();
        const patched=patchAppSource(source);
        const headers=new Headers(response.headers);headers.set('content-type','application/javascript; charset=utf-8');
        const result=new Response(patched,{status:response.status,statusText:response.statusText,headers});
        caches.open(CACHE).then(cache=>cache.put(event.request,result.clone())).catch(()=>{});
        return result;
      }catch(err){
        const cached=await caches.match(event.request);
        if(!cached) throw err;
        const source=await cached.text();
        return new Response(patchAppSource(source),{headers:{'content-type':'application/javascript; charset=utf-8'}});
      }
    })());
    return;
  }

  event.respondWith(networkAndCache(event.request).catch(()=>caches.match(event.request)));
});

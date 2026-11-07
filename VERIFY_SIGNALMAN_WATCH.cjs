/* Offline integration check for the installed Watchtower and Captain Watch entry.
   Run with Playwright and Chromium; set CHROMIUM_PATH if using a system browser. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),playwright=require('playwright');
const read=file=>fs.readFileSync(path.join(__dirname,file),'utf8');
const source=read('captain.js'),watch=source.slice(source.indexOf('/* Dark Sky 8.8.17 Admiral Commission'),source.indexOf("\n(() => {\n  'use strict';"));
const captain=source.slice(source.indexOf('  function ensureCaptainCommandMode()'),source.indexOf('  function prepareCinematicCabin()'));
(async()=>{
 const engine=process.env.TEST_BROWSER || 'chromium';
 const b=await playwright[engine].launch({executablePath:(engine==='webkit'?process.env.WEBKIT_PATH:process.env.CHROMIUM_PATH)||undefined,args:engine==='chromium'?['--no-sandbox']:[]});
 try{
  const p=await b.newPage();p.setDefaultTimeout(2500);
  const errors=[],requests=[];let holdReply,arrived,revoked=false,handedOff=false,helpReply={records:[{issue_id:'example',status:'resolved'}]};
  const report={project_id:'alpha',project_name:'Alpha',request_id:'alpha-request',screen:'Owner Bridge',description:'Private fixture detail',status:'open',version:1};
  p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/*',async route=>{
    const u=new URL(route.request().url()),k=u.pathname;
    if(u.origin!=='https://watch.invalid')throw Error('Unexpected request outside fixture');
    if(k==='/')return route.fulfill({contentType:'text/html',body:'<style>.hidden{display:none}</style><div id="captainQuarters"></div>'});
    const reply=body=>route.fulfill({contentType:'application/json',body:JSON.stringify(body)});
    if(k.startsWith('/auth/v1/token'))return reply({user:{id:'admiral-1'},access_token:'fixture-admiral',refresh_token:'fixture-refresh',expires_in:3600});
    if(k==='/auth/v1/user')return reply({id:'admiral-1'});
    if(k==='/rest/v1/fleet_global_authorities')return reply(revoked?[]:[{user_id:'admiral-1',authority_role:'admiral',active:true,revoked_at:null}]);
    if(k.startsWith('/rest/v1/rpc/')){
      requests.push({path:k,body:route.request().postDataJSON(),auth:route.request().headers().authorization});
      if(holdReply){arrived();await holdReply;}
      if(k.includes('/acting_captain_')){
        if(handedOff)return route.fulfill({status:403,contentType:'application/json',body:JSON.stringify({code:'42501',message:'fleet_help_acting_unavailable'})});
        assert.equal(route.request().postDataJSON().p_project_id,'alpha');
        if(k.endsWith('/acting_captain_update_fleet_help')){
          const args=route.request().postDataJSON();
          assert.equal(args.p_version,report.version);report.status=args.p_status;report.version++;
          return reply(report);
        }
        return reply({records:[report]});
      }
      return reply(helpReply);
    }
    return route.fulfill({status:404,body:''});
  });
  await p.goto('https://watch.invalid/');
  await p.addScriptTag({content:read('fleet_supabase.js')});
  await p.evaluate(()=>{
    window.__darkSkyVerifiedRelease={build:'test'};
    const conf={url:location.origin,publishableKey:'fixture-publishable'};
    window.BlackFlagV3Identity={productionAuth:{readClientConfig:()=>conf}};
    window.fixtureClient=DarkSkySupabase.create({...conf,sessionKey:'darkSkySupabaseAdmiralSessionV1'});
    window.DarkSkyAdmiralIdentityStatus=fixtureClient.verifyAdmiralAuthority;
    window.DarkSkyReadAdmiralWatch=async()=>({records:[]});
    window.DarkSkyReadFleetSpine=async()=>({counts:{},vessels:[]});
    window.routeGeneration=1;window.DarkSkyFleetNavigator={state:()=>({generation:routeGeneration})};
    window.contexts=[];window.DarkSkyFleetHelp={mount:(host,ctx)=>{
      contexts.push(ctx);host.textContent='Fixture outcomes';return ()=>{host.textContent='';};
    }};
  });
  await p.addScriptTag({content:watch});
  await p.evaluate(()=>DarkSkyOpenFleetWatchtower());
  await p.waitForFunction(()=>watchGateStatus.textContent.includes('Second security'));
  assert.equal(await p.evaluate(()=>contexts.length),0,'passage alone must not mount outcomes');
  await p.evaluate(async()=>{await fixtureClient.signInWithPassword('person@example.invalid','example');DarkSkyOpenFleetWatchtower();});
  await p.getByText('Fixture outcomes',{exact:true}).waitFor().catch(()=>assert.fail('verified Watchtower did not mount Fleet help'));
  assert.deepEqual(await p.evaluate(()=>{const c=contexts.at(-1);return [c.role,c.projectId,c.isCurrent()];}),['admiral','',true]);
  assert.deepEqual(await p.evaluate(()=>contexts.at(-1).rpc('admiral_list_fleet_help',{})),{records:[{issue_id:'example',status:'resolved'}]});
  assert.deepEqual(requests,[{path:'/rest/v1/rpc/admiral_list_fleet_help',body:{},auth:'Bearer fixture-admiral'}]);
  assert.equal(await p.evaluate(()=>contexts.at(-1).rpc('fleet_help_transition',{}).then(()=>false,()=>true)),true,'Admiral has no write adapter');
  let release;holdReply=new Promise(r=>release=r);const pending=new Promise(r=>arrived=r);
  await p.evaluate(()=>{window.late=contexts.at(-1).rpc('admiral_list_fleet_help',{}).then(()=>false,()=>true);});
  await pending;await p.locator('#watchClose').click();release();holdReply=null;
  assert.equal(await p.evaluate(()=>late),true,'late response after close must not enter the UI');
  assert.equal(await p.getByText('Fixture outcomes',{exact:true}).count(),0,'close must erase rendered outcomes');
  await p.evaluate(()=>DarkSkyOpenFleetWatchtower());await p.getByText('Fixture outcomes',{exact:true}).waitFor();
  await p.locator('#watchRefresh').click();await p.waitForFunction(()=>contexts.length>=3);
  assert.equal(await p.evaluate(()=>contexts.at(-2).isCurrent()),false,'refresh must invalidate old context');
  await p.evaluate(()=>{++routeGeneration;dispatchEvent(new CustomEvent('darksky:command-route',{detail:{target:'engine',generation:routeGeneration}}));});
  assert.equal(await p.evaluate(()=>contexts.at(-1).isCurrent()),false,'Engine navigation must invalidate the read even without a Watchtower close click');
  assert.equal(await p.getByText('Fixture outcomes',{exact:true}).count(),0,'Engine navigation must remove outcomes');
  await p.evaluate(()=>DarkSkyOpenFleetWatchtower());await p.getByText('Fixture outcomes',{exact:true}).waitFor();
  revoked=true;
  assert.equal(await p.evaluate(()=>contexts.at(-1).rpc('admiral_list_fleet_help',{}).then(()=>false,()=>true)),true,'revoked authority cannot read');
  assert.equal(await p.getByText('Fixture outcomes',{exact:true}).count(),0,'revocation must erase prior outcomes');
  assert.equal(requests.length,2,'no additional RPC should escape the read mount');
  // Exercise the actual help UI: moving to a vessel overview must remove notes
  // from the cross-fleet list, and a fresh visit must read the current list.
  revoked=false;
  await p.addScriptTag({content:read('fleet_help.js')});
  await p.evaluate(async()=>{
    window.DarkSkyReadAdmiralWatch=async()=>({records:[{project_id:'alpha',display_name:'Alpha',mission_class:'independent_business'},{project_id:'beta',display_name:'Beta',mission_class:'independent_business'}]});
    await fixtureClient.signInWithPassword('person@example.invalid','example');DarkSkyOpenFleetWatchtower();
  });
  const row=(project,note)=>({project_id:project,project_name:project,request_id:project+'-request',screen:'fixture screen',version:3,status:'verified',outcome:note});
  helpReply={records:[row('alpha','Checked alpha receipt')]};
  await p.locator('#watchFleetHelp summary').click();
  await p.getByText('Verification note · Checked alpha receipt',{exact:true}).waitFor();
  await p.locator('[data-watch-vessel="beta"]').click();
  assert.equal(await p.getByText('Verification note · Checked alpha receipt',{exact:true}).count(),0,'opening a different vessel must erase the previous Fleet outcome');
  assert.equal(await p.locator('#watchOverview h2').textContent(),'Beta');
  helpReply={records:[row('beta','Checked beta receipt')]};
  await p.locator('#watchOverviewClose').click();await p.locator('#watchFleetHelp summary').click();
  await p.getByText('Verification note · Checked beta receipt',{exact:true}).waitFor();
  assert.equal(await p.getByText('Verification note · Checked alpha receipt',{exact:true}).count(),0,'a fresh list must not retain old notes');
  assert.equal(await p.locator('#watchFleetHelp textarea,#watchFleetHelp input').count(),0,'the Admiral never receives editing controls');
  helpReply={records:[{...row('alpha',''),can_act_as_captain:true},{...row('beta',''),can_act_as_captain:false}]};
  await p.getByRole('button',{name:'Refresh reports'}).click();
  const enter=p.getByRole('button',{name:'Open as acting Captain'});
  await enter.waitFor();assert.equal(await enter.count(),1);
  assert.equal(await p.getByRole('button',{name:'Start work'}).count(),0);
  await enter.click();await p.getByText('Private fixture detail',{exact:true}).waitFor();
  assert.equal(await p.locator('#watchOverview h2').textContent(),'alpha');
  await p.getByRole('button',{name:'Start work'}).click();
  await p.getByRole('button',{name:'Confirm start'}).click();
  await p.getByText('Work started.',{exact:true}).waitFor();
  await p.getByLabel('How was the fix checked?').fill('Checked the fixture on tablet.');
  await p.getByRole('button',{name:'Verify outcome'}).click();
  handedOff=true;
  await p.getByRole('button',{name:'Confirm verification'}).click();
  await p.getByText(/Acting Captain access has ended/).waitFor();
  assert.equal(await p.getByText('Private fixture detail',{exact:true}).count(),0);
  assert.equal(await p.locator('#watchActingHelp textarea,#watchActingHelp button').count(),0);
  await p.locator('#watchOverviewClose').click();
  await p.locator('#watchFleetHelp summary').waitFor();
  assert.equal(await p.locator('#watchActingHelp').count(),0);
  await p.addScriptTag({content:"const byId=id=>document.getElementById(id),UPPER_COMMAND_BUILD='test';"+captain+'\nensureCaptainCommandMode();'});
  const link=p.locator('#captainQuarters').getByRole('link',{name:/my assigned vessels/i});
  const url=new URL(await link.getAttribute('href'),'https://watch.invalid/');
  assert.equal(url.origin+url.pathname,'https://watch.invalid/owner.html');assert.deepEqual([...url.searchParams],[['surface','vessel-captain']]);
  assert.deepEqual(errors,[]);console.log('PASS: verified Watchtower read, write denial, close, refresh, revocation, Captain roster entrance, scoped acting workspace and acceptance during review.');
 } finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

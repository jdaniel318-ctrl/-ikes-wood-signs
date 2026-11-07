/* Run with Node 20+ and @electric-sql/pglite@0.3.14 on NODE_PATH, or set PGLITE_MODULE to its JS entry.
   Disposable in-memory PostgreSQL; no connection to any live system. */
'use strict';
const assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const uuid=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
(async()=>{
 const {PGlite}=await import(process.env.PGLITE_MODULE||require.resolve('@electric-sql/pglite')); const db=new PGlite();
 const exec=s=>db.exec(s), q=async(s,a=[])=>Object.values((await db.query(s,a)).rows[0])[0];
 const call=(fn,...args)=>q(`select public.${fn}(${args.map((_,i)=>'$'+(i+1)).join(',')})`,args);
 const actor=async(n,role='authenticated')=>{await exec(`reset role;set role ${role}`);await q("select set_config('signalman.test_uid',$1,false)",[n?uuid(n):'']);};
 const denied=async(f,code='42501')=>assert.rejects(f,e=>e.code===code,`expected SQLSTATE ${code}`);
 try{
 await exec(`create role anon;create role authenticated;create role service_role;create schema fleet_private;grant usage on schema fleet_private to authenticated;create schema auth;
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('signalman.test_uid',true),'')::uuid$$;
 create table public.fleet_vessels(id uuid primary key,project_id text not null unique,display_name text not null);
 create table public.fleet_memberships(id uuid primary key,user_id uuid not null,vessel_id uuid not null,role text not null,active boolean not null,revoked_at timestamptz);
 create table public.fleet_captain_appointments(id uuid primary key,vessel_id uuid not null,candidate_user_id uuid,status text,revoked_at timestamptz,membership_id uuid);
 create table public.fleet_global_authorities(user_id uuid,authority_role text,active boolean,revoked_at timestamptz);
 create table public.fleet_authority_audit(actor_user_id uuid,vessel_id uuid,action text,authority_used text,detail jsonb);
 create function fleet_private.is_fleet_global_authority(roles text[]) returns boolean language sql stable security definer set search_path='' as $$select exists(select from public.fleet_global_authorities where user_id=auth.uid() and active and revoked_at is null and authority_role=any(roles))$$;
 insert into public.fleet_vessels values('${uuid(101)}','alpha','Alpha'),('${uuid(102)}','bravo','Bravo');
 insert into public.fleet_memberships values('${uuid(201)}','${uuid(1)}','${uuid(101)}','project_owner',true,null),('${uuid(202)}','${uuid(2)}','${uuid(101)}','operator',true,null),('${uuid(203)}','${uuid(3)}','${uuid(102)}','project_owner',true,null),('${uuid(204)}','${uuid(4)}','${uuid(102)}','operator',true,null),('${uuid(205)}','${uuid(5)}','${uuid(101)}','operator',true,null);
 insert into public.fleet_captain_appointments values('${uuid(302)}','${uuid(101)}','${uuid(2)}','accepted',null,'${uuid(202)}'),('${uuid(304)}','${uuid(102)}','${uuid(4)}','accepted',null,'${uuid(204)}');
 insert into public.fleet_global_authorities values('${uuid(6)}','admiral',true,null),('${uuid(7)}','captain',true,null);`);
 // Exercise the actual release's appointment/membership check, not a role-shaped test double.
 const prior=read('SUPABASE_ADMIRAL_COMMISSIONING_886.sql');await exec(prior.match(/create or replace function fleet_private\.has_active_vessel_captain\([\s\S]*?\$function\$;/i)[0]);
 const migration=path.join(__dirname,'SIGNALMAN_FLEET_HELP.sql');assert.ok(fs.existsSync(migration),'Fleet-help migration is not implemented');
 const sql=fs.readFileSync(migration,'utf8');await exec(sql);await exec(sql);
 const make='owner_create_fleet_help', owner='owner_list_fleet_help', capt='vessel_captain_list_fleet_help', update='vessel_captain_update_fleet_help', adm='admiral_list_fleet_help',photo='fleet_help_read_attachment';
 const id=uuid(400), jpg='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAACAAIDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAAAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AAA//2Q==';const args=['alpha',id,'Design Studio','8.8.20.99','The preview stays blank when I open it.',jpg];
 await actor(0,'anon');await denied(()=>call(make,...args));await actor(0);await denied(()=>call(owner,'alpha'));
 await actor(1);assert.deepEqual((await call(owner,'alpha')).records,[]);await denied(()=>call(owner,'bravo'));await denied(()=>call(capt,'alpha'));
 for(const [i,val] of [[1,null],[2,''],[2,'Studio\nprivate'],[2,'Studio?token=abc'],[3,'8.9\n'],[4,'    '],[4,'x'.repeat(1201)],[5,'data:image/svg+xml;base64,AAAA'],[5,'data:image/jpeg;base64,QUJDRA=='],[5,'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2Q=='],[5,'data:image/jpeg;base64,'+'A'.repeat(220001)]]) {const invalid=[...args];invalid[i]=val;await denied(()=>call(make,...invalid),'22023');}
 let row=await call(make,...args);assert.equal(row.status,'open');assert.equal(row.project_name,'Alpha');assert.equal(row.version,1);assert.ok(row.created_at&&row.updated_at);assert.equal((await call(make,...args)).request_id,id);
 await denied(()=>call(make,...args.slice(0,4),'Different content',jpg),'P0001');assert.equal((await call(owner,'alpha')).records.length,1);
 const detail=(await call(owner,'alpha')).records[0];assert.equal(detail.description,args[4]);assert.equal(detail.has_attachment,true);assert.ok(!('attachment' in detail));assert.equal((await call(photo,'alpha',id)).attachment,jpg);await denied(()=>call(update,'alpha',id,1,'verified','Tested on phone.'));
 await actor(3);await denied(()=>call(photo,'alpha',id));await denied(()=>call(make,...args));assert.deepEqual((await call(owner,'bravo')).records,[]);
 await actor(4);await denied(()=>call(update,'alpha',id,1,'verified','Tested on phone.'));await denied(()=>call(photo,'bravo',id),'P0002');
 for(const n of [5,7]) {await actor(n);await denied(()=>call(capt,'alpha'));await denied(()=>call(photo,'alpha',id));await denied(()=>call(adm));}
 await actor(2);assert.equal((await call(capt,'alpha')).records[0].request_id,id);assert.equal((await call(photo,'alpha',id)).attachment,jpg);
 await denied(()=>call(update,'alpha',id,1,'verified','Reloaded Studio on phone; preview now opens.'),'P0001');
 await denied(()=>call(update,'alpha',id,1,'verified','  done '),'22023');await denied(()=>call(update,'alpha',id,1,'nonsense',''),'22023');
 row=await call(update,'alpha',id,1,'in_progress','');assert.equal(row.version,2);assert.equal(row.status,'in_progress');await denied(()=>call(update,'alpha',id,1,'verified','Tested on phone.'),'40001');
 row=await call(update,'alpha',id,2,'verified','Reloaded Studio on phone; preview now opens.');assert.equal(row.status,'verified');assert.equal(row.version,3);await denied(()=>call(update,'alpha',id,3,'in_progress',''),'P0001');
 await actor(6);const summary=(await call(adm)).records[0];assert.equal(summary.outcome,row.outcome);assert.equal(summary.project_id,'alpha');assert.equal(summary.version,3);for(const k of ['description','attachment','has_attachment','actor_user_id','owner_user_id'])assert.ok(!(k in summary));await denied(()=>call(photo,'alpha',id));await denied(()=>call(update,'alpha',id,3,'verified','New result here.'));await denied(()=>call(make,...args));
 await exec('reset role');assert.equal(await q('select count(*)::int from public.fleet_authority_audit'),3);assert.ok(!JSON.stringify((await db.query('select detail from public.fleet_authority_audit')).rows).includes(args[4]));
 await exec(`update public.fleet_captain_appointments set status='revoked',revoked_at=now() where candidate_user_id='${uuid(2)}';update public.fleet_memberships set active=false where user_id='${uuid(1)}'`);
 await actor(1);await denied(()=>call(owner,'alpha'));await actor(2);await denied(()=>call(capt,'alpha'));await denied(()=>call(photo,'alpha',id));
 await exec(`reset role;insert into public.fleet_captain_appointments values('${uuid(305)}','${uuid(101)}','${uuid(5)}','accepted',null,'${uuid(205)}')`);await actor(5);assert.equal((await call(capt,'alpha')).records[0].status,'verified');
 await exec(`reset role;update public.fleet_captain_appointments set status='revoked',revoked_at=now() where candidate_user_id='${uuid(4)}'`);
 await actor(3);const second=await call(make,'bravo',id,'Owner Desk','8.8.20.99','No captain is currently appointed.',null);assert.equal(second.project_name,'Bravo');assert.equal(second.has_attachment,false);
 await actor(4);await denied(()=>call(capt,'bravo'));await actor(6);assert.deepEqual((await call(adm)).records.map(x=>x.project_id).sort(),['alpha','bravo']);
 await exec(`reset role;update public.fleet_memberships set revoked_at=now() where user_id='${uuid(5)}';update public.fleet_global_authorities set active=false where user_id='${uuid(6)}'`);await actor(5);await denied(()=>call(capt,'alpha'));await actor(6);await denied(()=>call(adm));
 await exec(`reset role;alter table public.fleet_authority_audit add constraint simulate_unavailable_audit check(false) not valid`);await actor(3);await denied(()=>call(make,'bravo',uuid(410),'Owner Desk','8.8.20.99','Audit rollback test',null),'23514');assert.deepEqual((await call(owner,'bravo')).records.map(x=>x.request_id),[id]);
 await denied(()=>q('select count(*) from fleet_private.fleet_help_requests'));await denied(()=>q('select fleet_private.fh_list(null,true)'));console.log('PASS Signalman: PostgreSQL '+(await q('show server_version'))+'; migration replay, role isolation, single-photo reads, idempotency, versioning, verification, reassignment, revocation, audit and atomic rollback');
 }finally{await db.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});

-- Countercraft 8.8.20.77. Additive staging service; no publication or role grant to people.
-- Service-only gateway. Customer/owner callers must pass through the validating Edge service.
begin;
create schema if not exists fleet_private;
create table fleet_private.cc_publications(id uuid primary key default gen_random_uuid(),scope jsonb unique not null,revision integer not null default 1,settings jsonb not null,enabled boolean not null default false,updated_at timestamptz not null default now());
create table fleet_private.cc_recovery_keys(id uuid primary key default gen_random_uuid(),publication_id uuid not null references fleet_private.cc_publications(id),public_jwk jsonb not null,private_jwk jsonb not null,created_at timestamptz not null default now(),active boolean not null default true);
create table fleet_private.cc_devices(id uuid primary key default gen_random_uuid(),publication_id uuid not null references fleet_private.cc_publications(id),public_jwk jsonb not null,label text not null,created_at timestamptz not null default now(),revoked_at timestamptz);
create table fleet_private.cc_challenges(id uuid primary key default gen_random_uuid(),device_id uuid not null references fleet_private.cc_devices(id),nonce text not null,expires_at timestamptz not null default now()+interval '2 minutes',used_at timestamptz);
create table fleet_private.cc_sessions(id uuid primary key default gen_random_uuid(),publication_id uuid not null references fleet_private.cc_publications(id),device_id uuid not null references fleet_private.cc_devices(id),token_hash text unique not null check(length(token_hash)=64),created_at timestamptz not null default now(),expires_at timestamptz not null default now()+interval '3 minutes',ended_at timestamptz,job_id uuid);
create table fleet_private.cc_operations(publication_id uuid not null references fleet_private.cc_publications(id),operation_id uuid not null,session_id uuid not null references fleet_private.cc_sessions(id),digest text not null check(length(digest)=64),snapshot jsonb not null,manifest jsonb not null,receipt jsonb,created_at timestamptz not null default now(),expires_at timestamptz not null default now()+interval '24 hours',primary key(publication_id,operation_id));
create table fleet_private.cc_jobs(id uuid primary key default gen_random_uuid(),publication_id uuid not null references fleet_private.cc_publications(id),request_number bigint generated always as identity,version integer not null default 1,revision integer not null default 1,approved_revision integer not null default 1,status text not null default 'received',checks jsonb,production jsonb,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(publication_id,request_number));
create table fleet_private.cc_revisions(job_id uuid not null references fleet_private.cc_jobs(id),revision integer not null,snapshot jsonb not null,assets jsonb not null,created_at timestamptz not null default now(),primary key(job_id,revision));
create table fleet_private.cc_events(id bigint generated always as identity primary key,job_id uuid not null references fleet_private.cc_jobs(id),actor text not null,action text not null,details jsonb not null default '{}',created_at timestamptz not null default now());
create table fleet_private.cc_owner_operations(publication_id uuid not null references fleet_private.cc_publications(id),operation_id uuid not null,digest text not null,result jsonb not null,primary key(publication_id,operation_id));
create table fleet_private.cc_tokens(token_hash text primary key,publication_id uuid not null references fleet_private.cc_publications(id),job_id uuid not null references fleet_private.cc_jobs(id),revision integer not null,kind text not null check(kind in ('receipt-transfer','receipt-session','review-transfer','review-session')),expires_at timestamptz not null,used_at timestamptz,parent_hash text,created_at timestamptz not null default now());
create table fleet_private.cc_closed_operations(publication_id uuid not null references fleet_private.cc_publications(id),operation_id uuid not null,primary key(publication_id,operation_id));
create table fleet_private.cc_resumes(token_hash text primary key,publication_id uuid not null references fleet_private.cc_publications(id),device_id uuid not null references fleet_private.cc_devices(id),snapshot jsonb not null,expires_at timestamptz not null default now()+interval '15 minutes',used_at timestamptz);
create table fleet_private.cc_upload_batches(publication_id uuid not null references fleet_private.cc_publications(id),operation_id uuid not null,paths jsonb not null,created_at timestamptz not null default now(),primary key(publication_id,operation_id));
create index cc_jobs_queue on fleet_private.cc_jobs(publication_id,updated_at desc);
create index cc_sessions_device on fleet_private.cc_sessions(device_id);
create index cc_operations_session on fleet_private.cc_operations(session_id);
create index cc_events_job on fleet_private.cc_events(job_id,id);
create index cc_challenges_device on fleet_private.cc_challenges(device_id,expires_at);
create index cc_tokens_expiry on fleet_private.cc_tokens(expires_at);
create index cc_recovery_publication on fleet_private.cc_recovery_keys(publication_id,created_at desc);
create index cc_devices_publication on fleet_private.cc_devices(publication_id);

do $$declare t text;begin foreach t in array array['cc_publications','cc_recovery_keys','cc_devices','cc_challenges','cc_sessions','cc_operations','cc_jobs','cc_revisions','cc_events','cc_owner_operations','cc_tokens','cc_closed_operations','cc_resumes','cc_upload_batches'] loop execute format('alter table fleet_private.%I enable row level security',t);execute format('revoke all on fleet_private.%I from public,anon,authenticated,service_role',t);end loop;end$$;

create function fleet_private.cc_owner(p_input jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare u uuid:=(p_input->>'userId')::uuid;s uuid:=(p_input->>'sessionId')::uuid;v uuid;
begin
 if u is null or s is null or coalesce((p_input->>'expiresAt')::timestamptz,'epoch')<=now() or not exists(select 1 from auth.sessions a where a.id=s and a.user_id=u and (a.not_after is null or a.not_after>now())) then raise exception 'Current owner session required';end if;
 select m.vessel_id into v from public.fleet_memberships m join public.fleet_vessels v on v.id=m.vessel_id where m.user_id=u and v.project_id='ikes-wood-signs' and m.role='project_owner' and m.active is true and m.revoked_at is null limit 1;
 if v is null then raise exception 'Exact unrevoked project owner required';end if;return u;
end$$;
revoke all on function fleet_private.cc_owner(jsonb) from public,anon,authenticated,service_role;

create function fleet_private.cc_job(p_id uuid) returns jsonb language sql stable security definer set search_path='' as $$
select jsonb_build_object('id',j.id,'number','IKE-'||lpad(j.request_number::text,6,'0'),'version',j.version,'revision',j.revision,'customerApprovedRevision',j.approved_revision,'status',j.status,'checks',j.checks,'production',j.production,'stockConflict',exists(select 1 from fleet_private.cc_jobs x join fleet_private.cc_revisions xr on xr.job_id=x.id and xr.revision=x.revision join fleet_private.cc_revisions jr on jr.job_id=j.id and jr.revision=j.revision where x.publication_id=j.publication_id and x.id<>j.id and x.status not in ('collected','declined','cancelled') and coalesce(jr.snapshot->>'stockId','')<>'' and xr.snapshot->>'stockId'=jr.snapshot->>'stockId'),'createdAt',j.created_at,'updatedAt',j.updated_at,'revisions',(select coalesce(jsonb_agg(jsonb_build_object('revision',r.revision,'snapshot',r.snapshot,'assets',r.assets,'createdAt',r.created_at) order by r.revision),'[]') from fleet_private.cc_revisions r where r.job_id=j.id),'events',(select coalesce(jsonb_agg(jsonb_build_object('id',e.id,'actor',e.actor,'action',e.action,'details',e.details,'at',e.created_at) order by e.id),'[]') from fleet_private.cc_events e where e.job_id=j.id)) from fleet_private.cc_jobs j where j.id=p_id
$$;
revoke all on function fleet_private.cc_job(uuid) from public,anon,authenticated,service_role;

create function public.countercraft_gateway(p_action text,p_scope jsonb,p_input jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare
 p fleet_private.cc_publications%rowtype;d fleet_private.cc_devices%rowtype;c fleet_private.cc_challenges%rowtype;s fleet_private.cc_sessions%rowtype;o fleet_private.cc_operations%rowtype;j fleet_private.cc_jobs%rowtype;t fleet_private.cc_tokens%rowtype;
 u uuid;result jsonb;previous jsonb;keyrow fleet_private.cc_recovery_keys%rowtype;aid uuid;target text;a jsonb;count_assets integer;expected integer;actor text;
begin
 if p_scope->>'projectId'<>'ikes-wood-signs' or p_scope->>'backend'<>'https://sjgqqtnuttnkwsoebbqf.supabase.co' or p_scope->>'environment'<>'staging' or p_scope->>'site'<>'https://jdaniel318-ctrl.github.io/-ikes-wood-signs/' or coalesce(p_scope->>'mode','') not in ('sea_trial','live') or coalesce(p_scope->>'deploymentId','')!~'^[a-zA-Z0-9_-]{1,80}$' or (select count(*) from jsonb_object_keys(p_scope))<>6 then raise exception 'Invalid exact scope';end if;
 if p_action in ('publish','owner-list','owner-job','owner-command','amend','enroll','revoke-device','recovery-key','rotate-key','recover-key','review-token','owner-backup','owner-backup-asset','owner-result','owner-reconcile','devices','owner-dismiss','contact-correct','owner-resume','asset-stage-owner','owner-cleanup','cleanup-done') then u:=fleet_private.cc_owner(p_input);end if;
 select * into p from fleet_private.cc_publications where scope=p_scope for update;
 if p_action='publish' then
  if p_scope->>'mode'='live' and not exists(select 1 from public.fleet_vessels where project_id='ikes-wood-signs' and lifecycle_state='active') then raise exception 'Live publication held until vessel activation';end if;
  if p.id is null then
   if (p_input->>'expectedVersion')::int is distinct from 0 then raise exception 'Publication version conflict';end if;
   insert into fleet_private.cc_publications(scope,settings,enabled) values(p_scope,p_input->'settings',coalesce((p_input->>'enabled')::boolean,false)) returning * into p;
  else
   if (p_input->>'expectedVersion')::int is distinct from p.revision then raise exception 'Publication version conflict';end if;
   update fleet_private.cc_publications set revision=revision+1,settings=p_input->'settings',enabled=coalesce((p_input->>'enabled')::boolean,false),updated_at=now() where id=p.id returning * into p;
  end if;
  return jsonb_build_object('id',p.id,'scope',p.scope,'revision',p.revision,'enabled',p.enabled,'stocks',p.settings->'stocks','rates',p.settings->'rates');
 end if;
 if p.id is null then
  if p_action='owner-list' then return jsonb_build_object('publication',null,'jobs','[]'::jsonb);end if;
  raise exception 'Shop publication is unavailable';
 end if;
 if p_action='owner-list' then return jsonb_build_object('publication',jsonb_build_object('id',p.id,'scope',p.scope,'revision',p.revision,'enabled',p.enabled,'stocks',p.settings->'stocks','rates',p.settings->'rates'),'jobs',(select coalesce(jsonb_agg(jsonb_build_object('id',x.id,'number','IKE-'||lpad(x.request_number::text,6,'0'),'status',x.status,'version',x.version,'revision',x.revision,'updatedAt',x.updated_at,'summary',r.snapshot->'request'->'customer','title',r.snapshot->'request'->'design'->>'title') order by x.updated_at desc),'[]') from fleet_private.cc_jobs x join fleet_private.cc_revisions r on r.job_id=x.id and r.revision=x.revision where x.publication_id=p.id));end if;
 if p_action='owner-backup' then return jsonb_build_object('schema','countercraft-backup-v1','scope',p.scope,'jobs',(select coalesce(jsonb_agg(fleet_private.cc_job(x.id) order by x.id),'[]') from fleet_private.cc_jobs x where x.publication_id=p.id));end if;
 if p_action='owner-backup-asset' then return (select assetrow.value from fleet_private.cc_jobs bj join fleet_private.cc_revisions br on br.job_id=bj.id cross join lateral jsonb_array_elements(br.assets) assetrow where bj.publication_id=p.id and assetrow.value->>'path'=p_input->>'path' limit 1);end if;
 if p_action='owner-cleanup' then
  for a in select jsonb_build_object('operationId',b.operation_id,'paths',b.paths) from fleet_private.cc_upload_batches b where b.publication_id=p.id and b.created_at<now()-interval '24 hours' and not exists(select 1 from fleet_private.cc_revisions r cross join lateral jsonb_array_elements(r.assets) ra where b.paths ? (ra->>'path')) loop
   insert into fleet_private.cc_closed_operations values(p.id,(a->>'operationId')::uuid) on conflict do nothing;
   insert into fleet_private.cc_owner_operations values(p.id,(a->>'operationId')::uuid,'closed','{"cancelled":true}'::jsonb) on conflict do nothing;
   result:=coalesce(result,'[]'::jsonb)||jsonb_build_array(a);
  end loop;
  delete from fleet_private.cc_resumes where publication_id=p.id and expires_at<now();
  return coalesce(result,'[]'::jsonb);
 end if;
 if p_action='cleanup-done' then delete from fleet_private.cc_upload_batches where publication_id=p.id and operation_id=(p_input->>'operationId')::uuid and exists(select 1 from fleet_private.cc_closed_operations closedrow where closedrow.publication_id=p.id and closedrow.operation_id=(p_input->>'operationId')::uuid);return jsonb_build_object('cleaned',true);end if;
 if p_action in ('asset-stage-owner','asset-stage-customer') then
  if p_action='asset-stage-customer' and not exists(select 1 from fleet_private.cc_sessions cs join fleet_private.cc_operations co on co.session_id=cs.id where cs.publication_id=p.id and cs.token_hash=p_input->>'tokenHash' and co.operation_id=(p_input->>'operationId')::uuid and cs.ended_at is null and cs.expires_at>now() and cs.created_at+interval '4 hours'>now()) then raise exception 'Customer upload unavailable';end if;
  if exists(select 1 from fleet_private.cc_closed_operations where publication_id=p.id and operation_id=(p_input->>'operationId')::uuid) then raise exception 'Upload operation closed';end if;
  insert into fleet_private.cc_upload_batches values(p.id,(p_input->>'operationId')::uuid,p_input->'paths',now()) on conflict do nothing;return jsonb_build_object('staged',true);
 end if;
 if p_action='owner-resume' then
  select * into s from fleet_private.cc_sessions where id=(p_input->>'draftSessionId')::uuid and publication_id=p.id for update;
  if s.id is null or s.job_id is not null or not exists(select 1 from fleet_private.cc_devices where id=s.device_id and revoked_at is null) then raise exception 'Draft cannot resume: check saved job or device';end if;
  if p_input->>'operationId' is not null then insert into fleet_private.cc_closed_operations values(p.id,(p_input->>'operationId')::uuid) on conflict do nothing;end if;
  update fleet_private.cc_sessions set ended_at=now() where id=s.id;
  insert into fleet_private.cc_resumes(token_hash,publication_id,device_id,snapshot) values(p_input->>'newTokenHash',p.id,s.device_id,p_input->'snapshot');return jsonb_build_object('expiresIn',900);
 end if;
 if p_action in ('rotate-key','recovery-key','recover-key') then
  if p_action='rotate-key' then update fleet_private.cc_recovery_keys set active=false where publication_id=p.id;insert into fleet_private.cc_recovery_keys(publication_id,public_jwk,private_jwk) values(p.id,p_input->'publicJwk',p_input->'privateJwk') returning * into keyrow;
  elsif p_action='recover-key' then select * into keyrow from fleet_private.cc_recovery_keys where publication_id=p.id and id=(p_input->>'keyId')::uuid;
  else select * into keyrow from fleet_private.cc_recovery_keys where publication_id=p.id and active order by created_at desc limit 1;end if;
  if keyrow.id is null then return null;end if;
  return jsonb_build_object('id',keyrow.id,'publicJwk',keyrow.public_jwk,'privateJwk',case when p_action='recover-key' then keyrow.private_jwk else null end);
 end if;
 if p_action='enroll' then insert into fleet_private.cc_devices(publication_id,public_jwk,label) values(p.id,p_input->'key',left(p_input->>'label',120)) returning * into d;return jsonb_build_object('id',d.id,'label',d.label);end if;
 if p_action='devices' then return (select coalesce(jsonb_agg(jsonb_build_object('id',id,'label',label,'revokedAt',revoked_at,'createdAt',created_at)),'[]') from fleet_private.cc_devices where publication_id=p.id);end if;
 if p_action='revoke-device' then update fleet_private.cc_devices set revoked_at=now() where publication_id=p.id and id=(p_input->>'deviceId')::uuid;return jsonb_build_object('revoked',true);end if;
 if p_action in ('challenge','challenge-read','start') then
  select * into d from fleet_private.cc_devices where id=(p_input->>'deviceId')::uuid and publication_id=p.id and revoked_at is null;
  if d.id is null or not p.enabled then raise exception 'Device or publication unavailable';end if;
  if p_action='challenge' then
   if (select count(*) from fleet_private.cc_challenges where device_id=d.id and expires_at>now()-interval '1 minute')>30 then raise exception 'Device challenge rate limit';end if;
   insert into fleet_private.cc_challenges(device_id,nonce) values(d.id,p_input->>'nonce') returning * into c;
  else select * into c from fleet_private.cc_challenges where id=(p_input->>'challengeId')::uuid and device_id=d.id for update;
   if c.id is null or c.used_at is not null or c.expires_at<=now() then raise exception 'Challenge expired or already used';end if;
  end if;
  if p_action<>'start' then return jsonb_build_object('id',c.id,'nonce',c.nonce,'key',d.public_jwk,'expiresAt',c.expires_at);end if;
  if (select count(*) from fleet_private.cc_sessions where publication_id=p.id and created_at>now()-interval '24 hours')>=200 then raise exception 'Shop daily session limit';end if;
  update fleet_private.cc_challenges set used_at=now() where id=c.id;
  insert into fleet_private.cc_sessions(publication_id,device_id,token_hash) values(p.id,d.id,p_input->>'tokenHash') returning * into s;
  select * into keyrow from fleet_private.cc_recovery_keys where publication_id=p.id and active order by created_at desc limit 1;
  return jsonb_build_object('id',s.id,'expiresAt',s.expires_at,'sessionPolicy','idle-v1','publication',jsonb_build_object('scope',p.scope,'revision',p.revision,'enabled',p.enabled,'stocks',p.settings->'stocks','rates',p.settings->'rates','recoveryKey',case when keyrow.id is null then null else jsonb_build_object('id',keyrow.id,'publicJwk',keyrow.public_jwk) end));
 end if;
 if p_action in ('context','begin','commit','result','end','receipt-token','resume','refresh-request','touch') then
  select * into s from fleet_private.cc_sessions where publication_id=p.id and token_hash=p_input->>'tokenHash' for update;
  if s.id is null or s.ended_at is not null or s.expires_at<=now() or s.created_at+interval '4 hours'<=now() or not exists(select 1 from fleet_private.cc_devices where id=s.device_id and revoked_at is null) then raise exception 'Customer session or device unavailable';end if;
  if p_action='touch' then update fleet_private.cc_sessions set expires_at=least(created_at+interval '4 hours',now()+interval '3 minutes') where id=s.id returning * into s;return jsonb_build_object('expiresAt',s.expires_at,'sessionPolicy','idle-v1');end if;
  if p_action='resume' then
   select snapshot into result from fleet_private.cc_resumes where token_hash=p_input->>'resumeTokenHash' and publication_id=p.id and device_id=s.device_id and used_at is null and expires_at>now() for update;
   if result is null then raise exception 'Resume link used or unavailable on this device';end if;
   update fleet_private.cc_resumes set used_at=now(),snapshot='{}'::jsonb where token_hash=p_input->>'resumeTokenHash';return jsonb_build_object('snapshot',result);
  end if;
  if p_action='context' then return jsonb_build_object('scope',p.scope,'revision',p.revision,'enabled',p.enabled,'stocks',p.settings->'stocks','rates',p.settings->'rates');end if;
  if p_action='end' then update fleet_private.cc_sessions set ended_at=now() where id=s.id;return jsonb_build_object('ended',true);end if;
  if p_action='receipt-token' then
   if s.job_id is null then raise exception 'A complete receipt is required';end if;
   select * into j from fleet_private.cc_jobs where id=s.job_id;
   insert into fleet_private.cc_tokens values(p_input->>'newTokenHash',p.id,j.id,1,'receipt-transfer',now()+interval '15 minutes',null,null,now());return jsonb_build_object('expiresIn',900);
  end if;
  select * into o from fleet_private.cc_operations where publication_id=p.id and operation_id=(p_input->>'operationId')::uuid for update;
  if o.operation_id is not null and o.session_id<>s.id then raise exception 'Operation scope mismatch';end if;
  if p_action='result' then return jsonb_build_object('receipt',o.receipt,'pending',o.operation_id is not null and o.receipt is null,'closed',exists(select 1 from fleet_private.cc_closed_operations where publication_id=p.id and operation_id=(p_input->>'operationId')::uuid),'publication',jsonb_build_object('scope',p.scope,'revision',p.revision,'enabled',p.enabled,'stocks',p.settings->'stocks','rates',p.settings->'rates'));end if;
  if p_action='refresh-request' then
   if o.operation_id is not null and o.digest is distinct from p_input->>'digest' then raise exception 'Operation digest conflict';end if;
   if o.receipt is not null then return jsonb_build_object('receipt',o.receipt);end if;
   if s.job_id is not null then raise exception 'This session already submitted its job';end if;
   if (p_input->>'publicationRevision')::int is not distinct from p.revision then raise exception 'Publication has not changed';end if;
   insert into fleet_private.cc_closed_operations values(p.id,(p_input->>'operationId')::uuid) on conflict do nothing;
   return jsonb_build_object('closed',true,'publication',jsonb_build_object('scope',p.scope,'revision',p.revision,'enabled',p.enabled,'stocks',p.settings->'stocks','rates',p.settings->'rates'));
  end if;
  if exists(select 1 from fleet_private.cc_closed_operations where publication_id=p.id and operation_id=(p_input->>'operationId')::uuid) then raise exception 'Interrupted operation was closed by owner';end if;
  if o.operation_id is not null and o.digest<>p_input->>'digest' then raise exception 'Operation digest conflict';end if;
  if o.receipt is not null then return jsonb_build_object('receipt',o.receipt);end if;
  if s.job_id is not null then raise exception 'This session already submitted its job';end if;
  if not p.enabled or (p_input->>'publicationRevision')::int<>p.revision then raise exception 'Publication version changed';end if;
  if p_action='begin' then
   if o.operation_id is null then
    if exists(select 1 from fleet_private.cc_operations pending where session_id=s.id and receipt is null and not exists(select 1 from fleet_private.cc_closed_operations closed where closed.publication_id=pending.publication_id and closed.operation_id=pending.operation_id)) then raise exception 'Reconcile the existing operation';end if;
    if octet_length((p_input->'snapshot')::text)>8388608 or jsonb_array_length(p_input->'manifest') not between 2 and 8 then raise exception 'Invalid request limits';end if;
    insert into fleet_private.cc_operations(publication_id,operation_id,session_id,digest,snapshot,manifest) values(p.id,(p_input->>'operationId')::uuid,s.id,p_input->>'digest',p_input->'snapshot',p_input->'manifest') returning * into o;
   end if;return jsonb_build_object('pending',true,'operationId',o.operation_id);
  end if;
  if o.operation_id is null or o.expires_at<=now() then raise exception 'Operation is missing or expired';end if;
  if jsonb_typeof(p_input->'assets')<>'array' or jsonb_array_length(p_input->'assets')<>jsonb_array_length(o.manifest) then raise exception 'Complete verified assets required';end if;
  for a in select value from jsonb_array_elements(o.manifest) loop
   select count(*) into count_assets from jsonb_array_elements(p_input->'assets') x where x->>'name'=a->>'name' and x->>'sha256'=a->>'sha256' and x->>'bytes'=a->>'bytes' and x->>'mime'=a->>'mime' and length(x->>'path')>0;
   if count_assets<>1 then raise exception 'Verified asset mismatch';end if;
  end loop;
  if (select count(*) from fleet_private.cc_jobs where publication_id=p.id and created_at>now()-interval '24 hours')>=100 then raise exception 'Shop daily job limit';end if;
  insert into fleet_private.cc_jobs(publication_id) values(p.id) returning * into j;
  insert into fleet_private.cc_revisions(job_id,revision,snapshot,assets) values(j.id,1,o.snapshot,p_input->'assets');
  insert into fleet_private.cc_events(job_id,actor,action,details) values(j.id,'customer','received',jsonb_build_object('operationId',o.operation_id,'digest',o.digest));
  result:=jsonb_build_object('jobId',j.id,'number','IKE-'||lpad(j.request_number::text,6,'0'),'revision',1,'operationId',o.operation_id,'digest',o.digest,'receivedAt',j.created_at,'scope',p.scope);
  update fleet_private.cc_operations set receipt=result where publication_id=p.id and operation_id=o.operation_id;update fleet_private.cc_sessions set job_id=j.id where id=s.id;return jsonb_build_object('receipt',result);
 end if;
 if p_action='owner-dismiss' then select x.result into result from fleet_private.cc_owner_operations x where x.publication_id=p.id and x.operation_id=(p_input->>'operationId')::uuid;if result is not null then return result;end if;result:=jsonb_build_object('cancelled',true);insert into fleet_private.cc_owner_operations values(p.id,(p_input->>'operationId')::uuid,'closed',result);return result;end if;
 if p_action='owner-result' then return (select x.result from fleet_private.cc_owner_operations x where x.publication_id=p.id and x.operation_id=(p_input->>'operationId')::uuid);end if;
 if p_action='owner-reconcile' then return (select jsonb_build_object('receipt',receipt,'pending',receipt is null) from fleet_private.cc_operations where publication_id=p.id and operation_id=(p_input->>'operationId')::uuid);end if;
 if p_action in ('owner-job','owner-command','amend','contact-correct','review-token') then
  select * into j from fleet_private.cc_jobs where id=(p_input->>'jobId')::uuid and publication_id=p.id for update;if j.id is null then raise exception 'Job not found in this shop';end if;
  if p_action='owner-job' then insert into fleet_private.cc_events(job_id,actor,action) values(j.id,u::text,'opened');return fleet_private.cc_job(j.id);end if;
  if p_action='review-token' then
   if j.status<>'awaiting-customer-approval' then raise exception 'No amendment awaiting approval';end if;
   insert into fleet_private.cc_tokens values(p_input->>'newTokenHash',p.id,j.id,j.revision,'review-transfer',now()+interval '15 minutes',null,null,now());return jsonb_build_object('expiresIn',900,'revision',j.revision);
  end if;
  select jsonb_build_object('digest',x.digest,'result',x.result) into previous from fleet_private.cc_owner_operations x where x.publication_id=p.id and x.operation_id=(p_input->>'operationId')::uuid;
  if previous is not null then if previous->>'digest'<>p_input->>'digest' then raise exception 'Owner operation digest conflict';end if;return previous->'result';end if;
  if (p_input->>'expectedVersion')::int is distinct from j.version then raise exception 'Job version conflict. Refresh saved record';end if;
  if p_action in ('amend','contact-correct') then
   if j.status in ('collected','declined','cancelled') then raise exception 'Closed job cannot be amended';end if;
   insert into fleet_private.cc_revisions(job_id,revision,snapshot,assets) values(j.id,j.revision+1,p_input->'snapshot',p_input->'assets');
   if p_action='contact-correct' then update fleet_private.cc_jobs set revision=revision+1,approved_revision=case when approved_revision=revision then revision+1 else approved_revision end,version=version+1,updated_at=now() where id=j.id returning * into j;actor:='contact-corrected';else update fleet_private.cc_jobs set revision=revision+1,version=version+1,status='awaiting-customer-approval',checks=null,updated_at=now() where id=j.id returning * into j;actor:='amendment-proposed';end if;
  else
   target:=p_input->>'status';
   if target='ready-for-production' and (j.approved_revision<>j.revision or not coalesce((p_input->'checks'->>'material')::boolean,false) or not coalesce((p_input->'checks'->>'price')::boolean,false) or not coalesce((p_input->'checks'->>'geometry')::boolean,false)) then raise exception 'Current customer approval and owner review required';end if;
   if not ((j.status='received' and target in ('needs-details','ready-for-production','declined','cancelled')) or (j.status='needs-details' and target in ('needs-details','ready-for-production','declined','cancelled')) or (j.status='awaiting-customer-approval' and target in ('needs-details','cancelled','declined')) or (j.status='ready-for-production' and target in ('needs-details','in-production','cancelled')) or (j.status='in-production' and target in ('needs-details','ready-for-pickup','cancelled')) or (j.status='ready-for-pickup' and target in ('in-production','collected','cancelled'))) then raise exception 'Invalid job transition';end if;
   if target in ('needs-details','cancelled','declined') and length(trim(coalesce(p_input->>'reason','')))=0 then raise exception 'Specific reason required';end if;
   update fleet_private.cc_jobs set status=target,version=version+1,updated_at=now(),checks=case when target='ready-for-production' then p_input->'checks' else checks end,production=case when target='in-production' then jsonb_build_object('revision',revision,'startedAt',now()) else production end where id=j.id returning * into j;actor:=target;
  end if;
  insert into fleet_private.cc_events(job_id,actor,action,details) values(j.id,u::text,actor,jsonb_build_object('version',j.version,'revision',j.revision,'reason',left(p_input->>'reason',2000),'confirmedPickup',left(p_input->>'confirmedPickup',120)));
  result:=jsonb_build_object('job',fleet_private.cc_job(j.id));insert into fleet_private.cc_owner_operations values(p.id,(p_input->>'operationId')::uuid,p_input->>'digest',result);return result;
 end if;
 if p_action in ('exchange','token-read','review-respond','token-touch','token-end') then
  select * into t from fleet_private.cc_tokens where token_hash=p_input->>'tokenHash' and publication_id=p.id for update;
  if t.token_hash is null or t.expires_at<=now() then raise exception 'Receipt or review session expired';end if;
  if p_action='exchange' then
   if t.kind not in ('receipt-transfer','review-transfer') or t.used_at is not null then raise exception 'Link already used';end if;
   update fleet_private.cc_tokens set used_at=now() where token_hash=t.token_hash;
   insert into fleet_private.cc_tokens values(p_input->>'newTokenHash',p.id,t.job_id,t.revision,replace(t.kind,'transfer','session'),now()+case when t.kind='review-transfer' then interval '3 minutes' else interval '1 hour' end,null,t.token_hash,now());
   return jsonb_build_object('kind',replace(t.kind,'transfer','session'),'expiresIn',3600);
  end if;
  if t.kind not in ('receipt-session','review-session') then raise exception 'Exchange this link first';end if;
  if p_action='token-end' then update fleet_private.cc_tokens set expires_at=now() where token_hash=t.token_hash;return jsonb_build_object('ended',true);end if;
  if p_action='token-touch' then
   if t.kind<>'review-session' or t.created_at+interval '1 hour'<=now() then raise exception 'Review session expired';end if;
   update fleet_private.cc_tokens set expires_at=least(created_at+interval '1 hour',now()+interval '3 minutes') where token_hash=t.token_hash;return jsonb_build_object('sessionPolicy','idle-v1');
  end if;
  select * into j from fleet_private.cc_jobs where id=t.job_id and publication_id=p.id for update;
  if p_action='review-respond' then
   if t.kind<>'review-session' or t.used_at is not null or j.revision<>t.revision or j.status<>'awaiting-customer-approval' then raise exception 'Review is no longer current';end if;
   if p_input->>'answer' not in ('accept','decline') then raise exception 'Invalid customer answer';end if;
   select snapshot into result from fleet_private.cc_revisions where job_id=j.id and revision=t.revision;
   if result->'approval'->>'digest' is distinct from p_input->>'digest' then raise exception 'Review digest mismatch';end if;
   update fleet_private.cc_jobs set approved_revision=case when p_input->>'answer'='accept' then revision else approved_revision end,status='needs-details',version=version+1,updated_at=now() where id=j.id;
   update fleet_private.cc_tokens set used_at=now() where token_hash=t.token_hash;
   insert into fleet_private.cc_events(job_id,actor,action,details) values(j.id,'customer','amendment-'||(p_input->>'answer'),jsonb_build_object('revision',t.revision,'digest',p_input->>'digest'));
   return jsonb_build_object('recorded',true,'answer',p_input->>'answer','revision',t.revision);
  end if;
  select jsonb_build_object('revision',r.revision,'snapshot',r.snapshot,'assets',r.assets) into result from fleet_private.cc_revisions r where r.job_id=j.id and r.revision=t.revision;
  -- Minimal customer projection: no contacts or owner activity history. The amendment reason is customer-facing.
  result:=jsonb_set(result,'{snapshot,request,customer}','{"name":"","email":"","phone":""}'::jsonb);
  return jsonb_build_object('id',j.id,'number','IKE-'||lpad(j.request_number::text,6,'0'),'revision',t.revision,'kind',t.kind,'sessionPolicy','idle-v1','record',result,'responded',t.used_at is not null,'correctionSummary',(select e.details->>'reason' from fleet_private.cc_events e where e.job_id=j.id and e.action='amendment-proposed' and (e.details->>'revision')::int=t.revision order by e.id desc limit 1));
 end if;
 raise exception 'Unsupported Countercraft action';
end$$;
revoke all on function public.countercraft_gateway(text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.countercraft_gateway(text,jsonb,jsonb) to service_role;
-- Private Storage bucket. No anon/authenticated policies and no signed upload URLs.
do $$begin if to_regclass('storage.buckets') is not null then
 execute $q$insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('countercraft-private','countercraft-private',false,2097152,array['image/jpeg','image/png','image/svg+xml']) on conflict(id) do nothing$q$;
end if;end$$;
commit;

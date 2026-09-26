-- Dark Sky 8.8.6 through 8.8.17 — Admiral Commissioning Orders, Vessel Logo Helm, Authority Ledger, and Supabase Keel
-- Prepared for Black Flag Fleet Core. Apply as migration: admiral_vessel_commissioning_886

alter table public.fleet_vessels
  add column if not exists mission_class text not null default 'independent_business',
  add column if not exists display_name_status text not null default 'approved',
  add column if not exists mission_summary text not null default '',
  add column if not exists logo_storage_path text,
  add column if not exists logo_updated_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'fleet_vessels_mission_class_check') then
    alter table public.fleet_vessels add constraint fleet_vessels_mission_class_check
      check (mission_class in ('independent_business','fleet_service','admiral_program'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'fleet_vessels_display_name_status_check') then
    alter table public.fleet_vessels add constraint fleet_vessels_display_name_status_check
      check (display_name_status in ('working','approved'));
  end if;
end $$;

create or replace function public.admiral_preview_vessel_commission(
  p_project_id text,
  p_namespace text,
  p_display_name text,
  p_mission_class text default 'admiral_program',
  p_ownership_model text default 'fleet_unassigned',
  p_operating_model text default 'fleet_operated',
  p_mission_summary text default ''
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_project_id text := lower(trim(coalesce(p_project_id,'')));
  v_namespace text := lower(trim(coalesce(p_namespace,'')));
  v_display_name text := trim(coalesce(p_display_name,''));
  v_fingerprint text;
begin
  if v_actor is null or not exists (
    select 1 from public.fleet_global_authorities
    where user_id = v_actor and authority_role = 'admiral' and active = true and revoked_at is null
  ) then raise exception 'active_admiral_authority_required'; end if;
  if v_project_id !~ '^[a-z0-9][a-z0-9-]{2,62}$' then raise exception 'project_key_invalid'; end if;
  if v_namespace !~ '^[a-z0-9][a-z0-9-]{2,62}$' then raise exception 'namespace_invalid'; end if;
  if char_length(v_display_name) < 2 or char_length(v_display_name) > 80 then raise exception 'working_name_invalid'; end if;
  if p_mission_class not in ('independent_business','fleet_service','admiral_program') then raise exception 'mission_class_invalid'; end if;
  if p_ownership_model not in ('fleet_unassigned','admiral_owned','outside_owner_pending','outside_owner_assigned','fleet_owned') then raise exception 'ownership_model_invalid'; end if;
  if p_operating_model not in ('owner_operated','captain_operated','fleet_operated','delegated_operator') then raise exception 'operating_model_invalid'; end if;
  if char_length(coalesce(p_mission_summary,'')) > 500 then raise exception 'mission_summary_too_long'; end if;
  if exists (select 1 from public.fleet_vessels where project_id = v_project_id) then raise exception 'project_key_already_exists'; end if;
  if exists (select 1 from public.fleet_vessels where namespace = v_namespace) then raise exception 'namespace_already_exists'; end if;

  v_fingerprint := md5(concat_ws('|',v_project_id,v_namespace,v_display_name,p_mission_class,p_ownership_model,p_operating_model,trim(coalesce(p_mission_summary,'')),'commissioning','fleet_unassigned','working'));
  return jsonb_build_object(
    'fingerprint',v_fingerprint,'project_id',v_project_id,'namespace',v_namespace,
    'display_name',v_display_name,'display_name_status','working','mission_class',p_mission_class,
    'ownership_model',p_ownership_model,'owner_state','fleet_unassigned','operating_model',p_operating_model,
    'lifecycle_state','commissioning','mission_summary',trim(coalesce(p_mission_summary,'')),
    'owner_membership_created',false,'entitlements_created',false,'live',false
  );
end $$;

create or replace function public.admiral_issue_vessel_commission(
  p_project_id text,
  p_namespace text,
  p_display_name text,
  p_mission_class text default 'admiral_program',
  p_ownership_model text default 'fleet_unassigned',
  p_operating_model text default 'fleet_operated',
  p_mission_summary text default '',
  p_expected_fingerprint text default '',
  p_intent text default ''
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_preview jsonb;
  v_vessel public.fleet_vessels%rowtype;
begin
  if v_actor is null or not exists (
    select 1 from public.fleet_global_authorities a
    where a.user_id=v_actor and a.authority_role='admiral' and a.active=true and a.revoked_at is null
  ) then raise exception 'admiral_authority_required'; end if;
  if char_length(coalesce(p_intent,'')) > 500 then raise exception 'intent_too_long'; end if;
  lock table public.fleet_vessels in share row exclusive mode;
  v_preview := public.admiral_preview_vessel_commission(p_project_id,p_namespace,p_display_name,p_mission_class,p_ownership_model,p_operating_model,p_mission_summary);
  if coalesce(p_expected_fingerprint,'') <> v_preview->>'fingerprint' then raise exception 'preview_stale_preview_again'; end if;

  insert into public.fleet_vessels (
    project_id,namespace,display_name,lifecycle_state,owner_state,commissioned_by,
    commissioning_authority,entry_path,ownership_model,operating_model,primary_owner_user_id,
    mission_class,display_name_status,mission_summary
  ) values (
    v_preview->>'project_id',v_preview->>'namespace',v_preview->>'display_name','commissioning','fleet_unassigned',v_actor,
    'admiral','admiral_commissioned',p_ownership_model,p_operating_model,null,
    p_mission_class,'working',trim(coalesce(p_mission_summary,''))
  ) returning * into v_vessel;

  insert into public.fleet_authority_audit(actor_user_id,vessel_id,action,authority_used,detail)
  values (v_actor,v_vessel.id,'vessel_commissioning_order_issued','admiral',jsonb_build_object(
    'project_id',v_vessel.project_id,'namespace',v_vessel.namespace,'display_name',v_vessel.display_name,
    'display_name_status','working','mission_class',v_vessel.mission_class,'lifecycle_state','commissioning',
    'owner_state','fleet_unassigned','ownership_model',v_vessel.ownership_model,'operating_model',v_vessel.operating_model,
    'owner_membership_created',false,'entitlements_created',false,'intent',trim(coalesce(p_intent,''))
  ));

  return jsonb_build_object('vessel_id',v_vessel.id,'project_id',v_vessel.project_id,'namespace',v_vessel.namespace,
    'display_name',v_vessel.display_name,'display_name_status',v_vessel.display_name_status,
    'lifecycle_state',v_vessel.lifecycle_state,'owner_state',v_vessel.owner_state,
    'ownership_model',v_vessel.ownership_model,'operating_model',v_vessel.operating_model,
    'owner_membership_created',false,'entitlements_created',false,'verified',true);
end $$;

create or replace function public.admiral_rename_vessel(
  p_project_id text,
  p_display_name text,
  p_intent text default ''
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_name text := trim(coalesce(p_display_name,''));
  v_vessel public.fleet_vessels%rowtype;
  v_old_name text;
begin
  if v_actor is null or not exists (select 1 from public.fleet_global_authorities where user_id=v_actor and authority_role='admiral' and active=true and revoked_at is null) then raise exception 'active_admiral_authority_required'; end if;
  if char_length(v_name) < 2 or char_length(v_name) > 80 then raise exception 'working_name_invalid'; end if;
  if char_length(coalesce(p_intent,'')) > 500 then raise exception 'intent_too_long'; end if;
  select * into v_vessel from public.fleet_vessels where project_id=lower(trim(coalesce(p_project_id,''))) for update;
  if not found then raise exception 'vessel_not_found'; end if;
  v_old_name := v_vessel.display_name;
  update public.fleet_vessels set display_name=v_name,display_name_status='working',updated_at=now()
    where id=v_vessel.id returning * into v_vessel;
  insert into public.fleet_authority_audit(actor_user_id,vessel_id,action,authority_used,detail)
  values(v_actor,v_vessel.id,'vessel_working_name_changed','admiral',jsonb_build_object(
    'project_id',v_vessel.project_id,'namespace',v_vessel.namespace,'old_display_name',v_old_name,
    'new_display_name',v_vessel.display_name,'stable_vessel_id',v_vessel.id,'intent',trim(coalesce(p_intent,''))
  ));
  return jsonb_build_object('vessel_id',v_vessel.id,'project_id',v_vessel.project_id,'namespace',v_vessel.namespace,
    'old_display_name',v_old_name,'display_name',v_vessel.display_name,'display_name_status','working','verified',true);
end $$;

create or replace function public.admiral_list_vessel_commission_log(p_limit integer default 10)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_actor uuid := auth.uid(); v_records jsonb;
begin
  if v_actor is null or not exists (select 1 from public.fleet_global_authorities where user_id=v_actor and authority_role='admiral' and active=true and revoked_at is null) then raise exception 'active_admiral_authority_required'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',a.id,'created_at',a.created_at,'action',a.action,'actor',coalesce(u.email,'Admiral'),
    'vessel_id',a.vessel_id,'detail',a.detail
  ) order by a.id desc),'[]'::jsonb) into v_records
  from (select * from public.fleet_authority_audit where action in ('vessel_commissioning_order_issued','vessel_working_name_changed','vessel_logo_changed') order by id desc limit greatest(1,least(coalesce(p_limit,10),100))) a
  left join auth.users u on u.id=a.actor_user_id;
  return jsonb_build_object('records',v_records);
end $$;

-- 8.8.17 Dual-Office Authority Ledger. This reader never turns Captain evidence
-- into Admiral authority: it exposes only server-retained audit rows after the
-- authenticated identity's active global Admiral grant is verified.
create or replace function public.admiral_read_authority_ledger(
  p_limit integer default 100,
  p_authority text default null,
  p_project_id text default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_limit integer := greatest(1,least(coalesce(p_limit,100),200));
  v_authority text := nullif(lower(trim(coalesce(p_authority,''))), '');
  v_project text := nullif(lower(trim(coalesce(p_project_id,''))), '');
  v_records jsonb;
begin
  if v_actor is null or not exists (
    select 1 from public.fleet_global_authorities
    where user_id=v_actor and authority_role='admiral' and active=true and revoked_at is null
  ) then raise exception 'active_admiral_authority_required'; end if;
  if v_authority is not null and v_authority not in ('admiral','captain','engine','system') then
    raise exception 'authority_filter_invalid';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',a.id,
    'created_at',a.created_at,
    'actor_user_id',a.actor_user_id,
    'acting_office',lower(coalesce(a.authority_used,'system')),
    'authority_used',a.authority_used,
    'action',a.action,
    'vessel_id',a.vessel_id,
    'project_id',v.project_id,
    'display_name',v.display_name,
    'target_type',coalesce(v.mission_class,'fleet_governance'),
    'target_id',coalesce(v.project_id,a.detail->>'project_id','fleet'),
    'mission_class',v.mission_class,
    'detail',a.detail,
    'correlation_id','authority-audit-' || a.id::text,
    'rollback_reference',a.detail->>'rollback_of',
    'source','fleet_authority_audit',
    'result','verified'
  ) order by a.id desc),'[]'::jsonb) into v_records
  from (
    select audit.* from public.fleet_authority_audit audit
    left join public.fleet_vessels vessel on vessel.id=audit.vessel_id
    where (v_authority is null or lower(coalesce(audit.authority_used,''))=v_authority)
      and (v_project is null or vessel.project_id=v_project or audit.detail->>'project_id'=v_project)
    order by audit.id desc
    limit v_limit
  ) a
  left join public.fleet_vessels v on v.id=a.vessel_id;
  return jsonb_build_object(
    'schema','dark-sky-dual-office-authority-ledger-v1',
    'read_at',now(),
    'active_office','admiral',
    'authority_source','fleet_global_authorities',
    'records',v_records
  );
end $$;

revoke all on function public.admiral_preview_vessel_commission(text,text,text,text,text,text,text) from public, anon;
revoke all on function public.admiral_issue_vessel_commission(text,text,text,text,text,text,text,text,text) from public, anon;
revoke all on function public.admiral_rename_vessel(text,text,text) from public, anon;
revoke all on function public.admiral_list_vessel_commission_log(integer) from public, anon;
revoke all on function public.admiral_read_authority_ledger(integer,text,text) from public, anon;
grant execute on function public.admiral_preview_vessel_commission(text,text,text,text,text,text,text) to authenticated;
grant execute on function public.admiral_issue_vessel_commission(text,text,text,text,text,text,text,text,text) to authenticated;
grant execute on function public.admiral_rename_vessel(text,text,text) to authenticated;
grant execute on function public.admiral_list_vessel_commission_log(integer) to authenticated;
grant execute on function public.admiral_read_authority_ledger(integer,text,text) to authenticated;

-- 8.8.7 Bootstrap Build Helm. Logos are public-facing brand assets; mutation stays Admiral-only.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('fleet-branding','fleet-branding',true,2097152,array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set
  public=excluded.public,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "active admirals insert fleet branding" on storage.objects;
drop policy if exists "active admirals select fleet branding" on storage.objects;
drop policy if exists "active admirals update fleet branding" on storage.objects;
drop policy if exists "active admirals delete fleet branding" on storage.objects;

create policy "active admirals insert fleet branding" on storage.objects for insert to authenticated
with check (bucket_id='fleet-branding' and exists (
  select 1 from public.fleet_global_authorities
  where user_id=(select auth.uid()) and authority_role='admiral' and active=true and revoked_at is null
));
create policy "active admirals select fleet branding" on storage.objects for select to authenticated
using (bucket_id='fleet-branding' and exists (
  select 1 from public.fleet_global_authorities
  where user_id=(select auth.uid()) and authority_role='admiral' and active=true and revoked_at is null
));
create policy "active admirals update fleet branding" on storage.objects for update to authenticated
using (bucket_id='fleet-branding' and exists (
  select 1 from public.fleet_global_authorities
  where user_id=(select auth.uid()) and authority_role='admiral' and active=true and revoked_at is null
)) with check (bucket_id='fleet-branding' and exists (
  select 1 from public.fleet_global_authorities
  where user_id=(select auth.uid()) and authority_role='admiral' and active=true and revoked_at is null
));
create policy "active admirals delete fleet branding" on storage.objects for delete to authenticated
using (bucket_id='fleet-branding' and exists (
  select 1 from public.fleet_global_authorities
  where user_id=(select auth.uid()) and authority_role='admiral' and active=true and revoked_at is null
));

create or replace function public.admiral_list_vessels_for_branding()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_actor uuid := auth.uid(); v_records jsonb;
begin
  if v_actor is null or not exists (
    select 1 from public.fleet_global_authorities
    where user_id=v_actor and authority_role='admiral' and active=true and revoked_at is null
  ) then raise exception 'active_admiral_authority_required'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',v.id,'project_id',v.project_id,'display_name',v.display_name,
    'mission_class',v.mission_class,'ownership_model',v.ownership_model,
    'operating_model',v.operating_model,
    'lifecycle_state',v.lifecycle_state,'logo_storage_path',v.logo_storage_path,
    'logo_updated_at',v.logo_updated_at
  ) order by v.display_name,v.project_id),'[]'::jsonb) into v_records
  from public.fleet_vessels v;
  return jsonb_build_object('records',v_records);
end $$;

create or replace function public.admiral_set_vessel_logo(
  p_project_id text,
  p_storage_path text default '',
  p_intent text default ''
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_project_id text := lower(trim(coalesce(p_project_id,'')));
  v_path text := nullif(trim(coalesce(p_storage_path,'')),'');
  v_old_path text;
  v_vessel public.fleet_vessels%rowtype;
begin
  if v_actor is null or not exists (
    select 1 from public.fleet_global_authorities
    where user_id=v_actor and authority_role='admiral' and active=true and revoked_at is null
  ) then raise exception 'active_admiral_authority_required'; end if;
  if char_length(coalesce(p_intent,'')) > 500 then raise exception 'intent_too_long'; end if;
  if v_path is not null and (
    split_part(v_path,'/',1) <> v_project_id
    or v_path !~ '^[a-z0-9][a-z0-9-]{2,62}/canonical\.(png|jpg|jpeg|webp)$'
    or position('..' in v_path) > 0
  ) then
    raise exception 'logo_storage_path_invalid';
  end if;
  select * into v_vessel from public.fleet_vessels where project_id=v_project_id for update;
  if not found then raise exception 'vessel_not_found'; end if;
  v_old_path := v_vessel.logo_storage_path;
  update public.fleet_vessels
    set logo_storage_path=v_path,logo_updated_at=now(),updated_at=now()
    where id=v_vessel.id returning * into v_vessel;
  insert into public.fleet_authority_audit(actor_user_id,vessel_id,action,authority_used,detail)
  values(v_actor,v_vessel.id,'vessel_logo_changed','admiral',jsonb_build_object(
    'project_id',v_vessel.project_id,'display_name',v_vessel.display_name,
    'old_storage_path',v_old_path,'new_storage_path',v_path,
    'restored_approved_default',v_path is null,'intent',trim(coalesce(p_intent,''))
  ));
  return jsonb_build_object(
    'vessel_id',v_vessel.id,'project_id',v_vessel.project_id,'display_name',v_vessel.display_name,
    'logo_storage_path',v_vessel.logo_storage_path,'logo_updated_at',v_vessel.logo_updated_at,'verified',true
  );
end $$;

revoke all on function public.admiral_list_vessels_for_branding() from public, anon;
revoke all on function public.admiral_set_vessel_logo(text,text,text) from public, anon;
grant execute on function public.admiral_list_vessels_for_branding() to authenticated;
grant execute on function public.admiral_set_vessel_logo(text,text,text) to authenticated;

-- 8.8.17 Supabase Keel neutral settings seed. This is intentionally not an
-- owner assignment: it creates no Auth user, membership, invitation, business
-- claim, publication, or authority. The live migration also extends the
-- existing authenticated admiral_read_fleet_spine RPC with commissioning
-- posture, using fleet_business_orders and fleet_observability_reports as the
-- canonical data tables, and repeats the active-Admiral check inside release assignment.
insert into public.fleet_business_settings(vessel_id,settings,updated_at,updated_by)
select v.id,
  jsonb_build_object(
    'schema','dark-sky-owner-business-settings-v1',
    'projectId',v.project_id,
    'businessConfig','{}'::jsonb,
    'customization','{}'::jsonb,
    'notifications','{}'::jsonb,
    'syncedFrom','supabase-keel-seed',
    'syncedAt',now(),
    'migrationState','awaiting-identity-or-data-sync'
  ),
  now(),
  null
from public.fleet_vessels v
where not exists (
  select 1 from public.fleet_business_settings bs where bs.vessel_id=v.id
);

-- 8.8.17.17 HarborMaster — exact-vessel Captain appointment, operating access,
-- and deliberate Fleet lifecycle activation. This block is additive. It does
-- not create a global Captain, transfer ownership, publish a customer site, or
-- delete an existing membership. Apply only as a reviewed Fleet Core migration.

create table if not exists public.fleet_captain_appointments (
  id uuid primary key default gen_random_uuid(),
  vessel_id uuid not null references public.fleet_vessels(id) on delete cascade,
  candidate_email text not null,
  candidate_user_id uuid null references auth.users(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending','accepted','suspended','revoked','declined','expired')),
  appointment_role text not null default 'vessel_captain'
    check (appointment_role = 'vessel_captain'),
  appointed_by uuid not null references auth.users(id) on delete restrict,
  appointed_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz null,
  suspended_at timestamptz null,
  revoked_at timestamptz null,
  updated_at timestamptz not null default now(),
  intent text not null default '',
  decision_note text not null default '',
  previous_operating_model text not null,
  membership_id uuid null references public.fleet_memberships(id) on delete set null,
  membership_preexisting boolean not null default false,
  constraint fleet_captain_appointments_email_shape check (position('@' in candidate_email) > 1)
);

create unique index if not exists fleet_captain_one_open_per_vessel
  on public.fleet_captain_appointments(vessel_id)
  where status in ('pending','accepted','suspended');
create index if not exists fleet_captain_candidate_email_idx
  on public.fleet_captain_appointments(lower(candidate_email), status);
create index if not exists fleet_captain_candidate_user_idx
  on public.fleet_captain_appointments(candidate_user_id, status);

alter table public.fleet_captain_appointments enable row level security;
revoke all on public.fleet_captain_appointments from anon, authenticated;

create or replace function fleet_private.has_active_vessel_captain(
  p_vessel_id uuid,
  p_user_id uuid default auth.uid()
) returns boolean
language sql
stable
security definer
set search_path to 'public','fleet_private'
as $function$
  select exists (
    select 1
    from public.fleet_captain_appointments a
    join public.fleet_memberships m on m.id=a.membership_id
    where a.vessel_id=p_vessel_id
      and a.candidate_user_id=p_user_id
      and a.status='accepted'
      and a.revoked_at is null
      and m.user_id=p_user_id
      and m.vessel_id=p_vessel_id
      and m.role='operator'
      and m.active=true
      and m.revoked_at is null
  );
$function$;
revoke all on function fleet_private.has_active_vessel_captain(uuid,uuid) from public,anon,authenticated;

create or replace function public.admiral_preview_captain_appointment(
  p_project_id text,
  p_captain_email text
) returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_actor uuid := auth.uid();
  v_vessel public.fleet_vessels%rowtype;
  v_email text := lower(trim(coalesce(p_captain_email,'')));
  v_user uuid;
  v_existing public.fleet_captain_appointments%rowtype;
  v_fingerprint text;
begin
  if v_actor is null or not fleet_private.is_fleet_global_authority(array['admiral']) then
    raise exception 'admiral_authority_required' using errcode='42501';
  end if;
  if v_email = '' or position('@' in v_email) <= 1 then raise exception 'captain_email_required'; end if;
  select * into v_vessel from public.fleet_vessels where project_id=lower(trim(p_project_id));
  if not found then raise exception 'vessel_not_found'; end if;
  update public.fleet_captain_appointments
     set status='expired',updated_at=now()
   where vessel_id=v_vessel.id and status='pending' and expires_at<=now();
  select id into v_user from auth.users where lower(email)=v_email limit 1;
  select * into v_existing from public.fleet_captain_appointments
   where vessel_id=v_vessel.id and status in ('pending','accepted','suspended')
   order by appointed_at desc limit 1;
  v_fingerprint := md5(concat_ws('|',v_vessel.id::text,v_vessel.updated_at::text,v_vessel.operating_model,
    coalesce(v_existing.id::text,''),coalesce(v_existing.status,''),coalesce(v_existing.updated_at::text,''),v_email));
  return jsonb_build_object(
    'schema','dark-sky-captain-appointment-preview-v1',
    'project_id',v_vessel.project_id,'vessel_id',v_vessel.id,'vessel_name',v_vessel.display_name,
    'lifecycle_state',v_vessel.lifecycle_state,'operating_model',v_vessel.operating_model,
    'candidate_email',v_email,'candidate_account_exists',v_user is not null,
    'open_appointment',case when v_existing.id is null then null else jsonb_build_object(
      'id',v_existing.id,'status',v_existing.status,'candidate_email',v_existing.candidate_email,'appointed_at',v_existing.appointed_at
    ) end,
    'fingerprint',v_fingerprint,
    'authority_granted',false,
    'note','Preview only. No vessel authority, membership, ownership, or live state changes.'
  );
end
$function$;

create or replace function public.admiral_issue_captain_appointment(
  p_project_id text,
  p_captain_email text,
  p_expected_fingerprint text,
  p_intent text default ''
) returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_actor uuid := auth.uid();
  v_vessel public.fleet_vessels%rowtype;
  v_email text := lower(trim(coalesce(p_captain_email,'')));
  v_user uuid;
  v_existing public.fleet_captain_appointments%rowtype;
  v_fingerprint text;
  v_row public.fleet_captain_appointments%rowtype;
begin
  if v_actor is null or not fleet_private.is_fleet_global_authority(array['admiral']) then
    raise exception 'admiral_authority_required' using errcode='42501';
  end if;
  if length(coalesce(p_intent,'')) > 500 then raise exception 'appointment_intent_too_long'; end if;
  if v_email = '' or position('@' in v_email) <= 1 then raise exception 'captain_email_required'; end if;
  select * into v_vessel from public.fleet_vessels where project_id=lower(trim(p_project_id)) for update;
  if not found then raise exception 'vessel_not_found'; end if;
  update public.fleet_captain_appointments
     set status='expired',updated_at=now()
   where vessel_id=v_vessel.id and status='pending' and expires_at<=now();
  select id into v_user from auth.users where lower(email)=v_email limit 1;
  select * into v_existing from public.fleet_captain_appointments
   where vessel_id=v_vessel.id and status in ('pending','accepted','suspended')
   order by appointed_at desc limit 1;
  v_fingerprint := md5(concat_ws('|',v_vessel.id::text,v_vessel.updated_at::text,v_vessel.operating_model,
    coalesce(v_existing.id::text,''),coalesce(v_existing.status,''),coalesce(v_existing.updated_at::text,''),v_email));
  if p_expected_fingerprint is null or p_expected_fingerprint <> v_fingerprint then raise exception 'captain_appointment_preview_stale'; end if;
  if v_existing.id is not null then raise exception 'captain_appointment_already_open'; end if;
  insert into public.fleet_captain_appointments(
    vessel_id,candidate_email,candidate_user_id,appointed_by,intent,previous_operating_model
  ) values (
    v_vessel.id,v_email,v_user,v_actor,coalesce(p_intent,''),v_vessel.operating_model
  ) returning * into v_row;
  insert into public.fleet_authority_audit(actor_user_id,vessel_id,action,authority_used,detail)
  values(v_actor,v_vessel.id,'vessel_captain_appointment_issued','admiral',jsonb_build_object(
    'schema','dark-sky-vessel-captain-appointment-v1','appointment_id',v_row.id,'project_id',v_vessel.project_id,
    'candidate_email',v_email,'candidate_account_exists',v_user is not null,'intent',coalesce(p_intent,''),
    'authority_granted',false,'status','pending'
  ));
  return jsonb_build_object(
    'schema','dark-sky-captain-appointment-result-v1','appointment_id',v_row.id,'project_id',v_vessel.project_id,
    'vessel_name',v_vessel.display_name,'candidate_email',v_email,'candidate_account_exists',v_user is not null,
    'status',v_row.status,'expires_at',v_row.expires_at,'authority_granted',false,
    'readback_verified',true
  );
end
$function$;

create or replace function public.captain_read_my_appointments()
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_actor uuid := auth.uid();
  v_email text;
  v_records jsonb;
begin
  if v_actor is null then raise exception 'authenticated_account_required' using errcode='42501'; end if;
  select lower(email) into v_email from auth.users where id=v_actor;
  update public.fleet_captain_appointments
     set status='expired',updated_at=now()
   where status='pending' and expires_at<=now();
  select coalesce(jsonb_agg(jsonb_build_object(
    'appointment_id',a.id,'project_id',v.project_id,'vessel_name',v.display_name,'namespace',v.namespace,
    'status',a.status,'candidate_email',a.candidate_email,'appointed_at',a.appointed_at,'expires_at',a.expires_at,
    'accepted_at',a.accepted_at,'intent',a.intent,'operating_model',v.operating_model,'lifecycle_state',v.lifecycle_state
  ) order by a.appointed_at desc),'[]'::jsonb) into v_records
  from public.fleet_captain_appointments a join public.fleet_vessels v on v.id=a.vessel_id
  where (a.candidate_user_id=v_actor or lower(a.candidate_email)=v_email)
    and a.status in ('pending','accepted','suspended');
  return jsonb_build_object('schema','dark-sky-my-captain-appointments-v1','records',v_records,'read_at',now());
end
$function$;

create or replace function public.captain_accept_appointment(p_appointment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_actor uuid := auth.uid();
  v_email text;
  v_row public.fleet_captain_appointments%rowtype;
  v_vessel public.fleet_vessels%rowtype;
  v_membership public.fleet_memberships%rowtype;
  v_preexisting boolean := false;
begin
  if v_actor is null then raise exception 'authenticated_account_required' using errcode='42501'; end if;
  select lower(email) into v_email from auth.users where id=v_actor;
  select * into v_row from public.fleet_captain_appointments where id=p_appointment_id for update;
  if not found then raise exception 'captain_appointment_not_found'; end if;
  if v_row.status <> 'pending' then raise exception 'captain_appointment_not_pending'; end if;
  if v_row.expires_at <= now() then
    update public.fleet_captain_appointments set status='expired',updated_at=now() where id=v_row.id;
    raise exception 'captain_appointment_expired';
  end if;
  if v_row.candidate_user_id is not null and v_row.candidate_user_id<>v_actor then raise exception 'captain_appointment_account_mismatch' using errcode='42501'; end if;
  if lower(v_row.candidate_email)<>v_email then raise exception 'captain_appointment_email_mismatch' using errcode='42501'; end if;
  select * into v_vessel from public.fleet_vessels where id=v_row.vessel_id for update;
  select * into v_membership from public.fleet_memberships where user_id=v_actor and vessel_id=v_row.vessel_id and role='operator' limit 1;
  if found then
    v_preexisting := v_membership.active and v_membership.revoked_at is null;
    if not v_preexisting then
      update public.fleet_memberships set active=true,revoked_at=null,granted_at=now() where id=v_membership.id returning * into v_membership;
    end if;
  else
    insert into public.fleet_memberships(user_id,vessel_id,role,active,granted_at,revoked_at)
    values(v_actor,v_row.vessel_id,'operator',true,now(),null) returning * into v_membership;
  end if;
  update public.fleet_captain_appointments set
    candidate_user_id=v_actor,status='accepted',accepted_at=now(),updated_at=now(),membership_id=v_membership.id,
    membership_preexisting=v_preexisting
  where id=v_row.id returning * into v_row;
  update public.fleet_vessels set operating_model='captain_operated',updated_at=now() where id=v_row.vessel_id;
  insert into public.fleet_authority_audit(actor_user_id,vessel_id,action,authority_used,detail)
  values(v_actor,v_row.vessel_id,'vessel_captain_appointment_accepted','vessel_captain',jsonb_build_object(
    'schema','dark-sky-vessel-captain-appointment-v1','appointment_id',v_row.id,'project_id',v_vessel.project_id,
    'membership_id',v_membership.id,'membership_preexisting',v_preexisting,'status','accepted'
  ));
  return jsonb_build_object('schema','dark-sky-captain-acceptance-result-v1','appointment_id',v_row.id,
    'project_id',v_vessel.project_id,'vessel_name',v_vessel.display_name,'status','accepted','membership_role','operator',
    'operating_model','captain_operated','readback_verified',true);
end
$function$;

create or replace function public.captain_decline_appointment(p_appointment_id uuid,p_reason text default '')
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_actor uuid:=auth.uid(); v_email text; v_row public.fleet_captain_appointments%rowtype; v_vessel public.fleet_vessels%rowtype;
begin
  if v_actor is null then raise exception 'authenticated_account_required' using errcode='42501'; end if;
  select lower(email) into v_email from auth.users where id=v_actor;
  select * into v_row from public.fleet_captain_appointments where id=p_appointment_id for update;
  if not found or v_row.status<>'pending' then raise exception 'captain_appointment_not_pending'; end if;
  if (v_row.candidate_user_id is not null and v_row.candidate_user_id<>v_actor) or lower(v_row.candidate_email)<>v_email then raise exception 'captain_appointment_account_mismatch' using errcode='42501'; end if;
  update public.fleet_captain_appointments set status='declined',decision_note=left(coalesce(p_reason,''),500),updated_at=now() where id=v_row.id returning * into v_row;
  select * into v_vessel from public.fleet_vessels where id=v_row.vessel_id;
  insert into public.fleet_authority_audit(actor_user_id,vessel_id,action,authority_used,detail)
  values(v_actor,v_row.vessel_id,'vessel_captain_appointment_declined','candidate',jsonb_build_object('appointment_id',v_row.id,'project_id',v_vessel.project_id,'reason',v_row.decision_note));
  return jsonb_build_object('appointment_id',v_row.id,'status','declined','readback_verified',true);
end
$function$;

create or replace function public.admiral_list_captain_appointments(p_project_id text default null)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare v_actor uuid:=auth.uid(); v_records jsonb;
begin
  if v_actor is null or not fleet_private.is_fleet_global_authority(array['admiral']) then raise exception 'admiral_authority_required' using errcode='42501'; end if;
  update public.fleet_captain_appointments set status='expired',updated_at=now() where status='pending' and expires_at<=now();
  select coalesce(jsonb_agg(jsonb_build_object(
    'appointment_id',a.id,'project_id',v.project_id,'vessel_name',v.display_name,'candidate_email',a.candidate_email,
    'candidate_user_id',a.candidate_user_id,'status',a.status,'appointed_at',a.appointed_at,'expires_at',a.expires_at,
    'accepted_at',a.accepted_at,'suspended_at',a.suspended_at,'revoked_at',a.revoked_at,'updated_at',a.updated_at,
    'intent',a.intent,'decision_note',a.decision_note,'operating_model',v.operating_model,'lifecycle_state',v.lifecycle_state
  ) order by a.appointed_at desc),'[]'::jsonb) into v_records
  from public.fleet_captain_appointments a join public.fleet_vessels v on v.id=a.vessel_id
  where p_project_id is null or v.project_id=lower(trim(p_project_id));
  return jsonb_build_object('schema','dark-sky-admiral-captain-appointments-v1','records',v_records,'read_at',now());
end
$function$;

create or replace function public.admiral_revoke_captain_appointment(p_appointment_id uuid,p_reason text default '')
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_actor uuid:=auth.uid(); v_row public.fleet_captain_appointments%rowtype; v_vessel public.fleet_vessels%rowtype;
  v_membership_revoked boolean:=false; v_rows integer:=0;
begin
  if v_actor is null or not fleet_private.is_fleet_global_authority(array['admiral']) then raise exception 'admiral_authority_required' using errcode='42501'; end if;
  select * into v_row from public.fleet_captain_appointments where id=p_appointment_id for update;
  if not found then raise exception 'captain_appointment_not_found'; end if;
  if v_row.status not in ('pending','accepted','suspended') then raise exception 'captain_appointment_not_open'; end if;
  select * into v_vessel from public.fleet_vessels where id=v_row.vessel_id for update;
  if v_row.membership_id is not null and not v_row.membership_preexisting then
    update public.fleet_memberships set active=false,revoked_at=now() where id=v_row.membership_id and active=true;
    get diagnostics v_rows = row_count; v_membership_revoked := v_rows > 0;
  end if;
  update public.fleet_captain_appointments set status='revoked',revoked_at=now(),updated_at=now(),decision_note=left(coalesce(p_reason,''),500) where id=v_row.id returning * into v_row;
  if v_vessel.operating_model='captain_operated' then
    update public.fleet_vessels set operating_model=v_row.previous_operating_model,updated_at=now() where id=v_row.vessel_id;
  end if;
  insert into public.fleet_authority_audit(actor_user_id,vessel_id,action,authority_used,detail)
  values(v_actor,v_row.vessel_id,'vessel_captain_appointment_revoked','admiral',jsonb_build_object(
    'appointment_id',v_row.id,'project_id',v_vessel.project_id,'reason',v_row.decision_note,
    'membership_revoked',v_membership_revoked,'membership_preexisting',v_row.membership_preexisting,
    'restored_operating_model',v_row.previous_operating_model
  ));
  return jsonb_build_object('appointment_id',v_row.id,'project_id',v_vessel.project_id,'status','revoked',
    'membership_revoked',v_membership_revoked,'membership_preexisting',v_row.membership_preexisting,
    'operating_model',v_row.previous_operating_model,'readback_verified',true);
end
$function$;

create or replace function public.vessel_captain_verify_access(p_project_id text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare v_actor uuid:=auth.uid(); v_vessel public.fleet_vessels%rowtype; v_appt public.fleet_captain_appointments%rowtype;
begin
  if v_actor is null then return jsonb_build_object('ok',false,'reason','no_session'); end if;
  select * into v_vessel from public.fleet_vessels where project_id=lower(trim(coalesce(p_project_id,'')));
  if not found then return jsonb_build_object('ok',false,'reason','vessel_not_found'); end if;
  select * into v_appt from public.fleet_captain_appointments a
   where a.vessel_id=v_vessel.id and a.candidate_user_id=v_actor and a.status='accepted' and a.revoked_at is null
   order by a.accepted_at desc limit 1;
  if not found or not fleet_private.has_active_vessel_captain(v_vessel.id,v_actor) then
    return jsonb_build_object('ok',false,'reason','vessel_captain_membership_denied','project_id',v_vessel.project_id,'vessel_id',v_vessel.id);
  end if;
  return jsonb_build_object('ok',true,'project_id',v_vessel.project_id,'vessel_id',v_vessel.id,'namespace',v_vessel.namespace,
    'display_name',v_vessel.display_name,'lifecycle_state',v_vessel.lifecycle_state,'operating_model',v_vessel.operating_model,
    'appointment_id',v_appt.id,'appointment_role','vessel_captain','membership_role','operator');
end
$function$;

create or replace function public.vessel_captain_list_business_orders(p_project_id text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare v_actor uuid:=auth.uid(); v_vessel public.fleet_vessels%rowtype; v_rows jsonb;
begin
  if v_actor is null then raise exception 'authenticated_account_required'; end if;
  select * into v_vessel from public.fleet_vessels where project_id=lower(trim(coalesce(p_project_id,'')));
  if not found then raise exception 'vessel_not_found'; end if;
  if not fleet_private.has_active_vessel_captain(v_vessel.id,v_actor) then raise exception 'exact_vessel_captain_membership_required' using errcode='42501'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',o.external_order_id,'status',o.status,'payload',o.payload,'created_at',o.created_at,'updated_at',o.updated_at) order by o.updated_at desc),'[]'::jsonb)
  into v_rows from public.fleet_business_orders o where o.vessel_id=v_vessel.id;
  return jsonb_build_object('project_id',v_vessel.project_id,'records',v_rows,'read_at',now());
end
$function$;

create or replace function public.vessel_captain_update_order_status(
  p_project_id text,
  p_external_order_id text,
  p_status text
) returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare v_actor uuid:=auth.uid(); v_vessel public.fleet_vessels%rowtype; v_row public.fleet_business_orders%rowtype; v_status text:=trim(coalesce(p_status,''));
begin
  if v_actor is null then raise exception 'authenticated_account_required'; end if;
  if trim(coalesce(p_external_order_id,''))='' then raise exception 'order_id_required'; end if;
  if char_length(v_status)<2 or char_length(v_status)>80 then raise exception 'order_status_invalid'; end if;
  select * into v_vessel from public.fleet_vessels where project_id=lower(trim(coalesce(p_project_id,'')));
  if not found then raise exception 'vessel_not_found'; end if;
  if not fleet_private.has_active_vessel_captain(v_vessel.id,v_actor) then raise exception 'exact_vessel_captain_membership_required' using errcode='42501'; end if;
  update public.fleet_business_orders set status=v_status,updated_at=now()
   where vessel_id=v_vessel.id and external_order_id=trim(p_external_order_id)
   returning * into v_row;
  if not found then raise exception 'business_order_not_found'; end if;
  insert into public.fleet_authority_audit(actor_user_id,vessel_id,action,authority_used,detail)
  values(v_actor,v_vessel.id,'vessel_captain_order_status_changed','vessel_captain',jsonb_build_object(
    'project_id',v_vessel.project_id,'external_order_id',v_row.external_order_id,'status',v_row.status
  ));
  return jsonb_build_object('project_id',v_vessel.project_id,'id',v_row.external_order_id,'status',v_row.status,'updated_at',v_row.updated_at,'readback_verified',true);
end
$function$;

create or replace function public.vessel_captain_read_watch_report(p_project_id text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare v_actor uuid:=auth.uid(); v_vessel public.fleet_vessels%rowtype; v_report public.fleet_observability_reports%rowtype;
begin
  if v_actor is null then raise exception 'authenticated_account_required'; end if;
  select * into v_vessel from public.fleet_vessels where project_id=lower(trim(coalesce(p_project_id,'')));
  if not found then raise exception 'vessel_not_found'; end if;
  if not fleet_private.has_active_vessel_captain(v_vessel.id,v_actor) then raise exception 'exact_vessel_captain_membership_required' using errcode='42501'; end if;
  select * into v_report from public.fleet_observability_reports o where o.vessel_id=v_vessel.id order by o.reported_at desc limit 1;
  if not found then return jsonb_build_object('project_id',v_vessel.project_id,'display_name',v_vessel.display_name,'has_report',false,'reported_at',null); end if;
  return jsonb_build_object('project_id',v_vessel.project_id,'display_name',v_vessel.display_name,'has_report',true,
    'current_work',v_report.current_work,'unresolved_issues',v_report.unresolved_issues,'issue_summary',v_report.issue_summary,
    'source_label',v_report.source_label,'reported_at',v_report.reported_at,'report_id',v_report.id);
end
$function$;

create or replace function public.vessel_captain_publish_watch_report(
  p_project_id text,
  p_current_work text,
  p_unresolved_issues integer default null,
  p_issue_summary text default null,
  p_detail jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare v_actor uuid:=auth.uid(); v_vessel public.fleet_vessels%rowtype; v_report public.fleet_observability_reports%rowtype; v_work text:=trim(coalesce(p_current_work,''));
begin
  if v_actor is null then raise exception 'authenticated_account_required'; end if;
  select * into v_vessel from public.fleet_vessels where project_id=lower(trim(coalesce(p_project_id,'')));
  if not found then raise exception 'vessel_not_found'; end if;
  if not fleet_private.has_active_vessel_captain(v_vessel.id,v_actor) then raise exception 'exact_vessel_captain_membership_required' using errcode='42501'; end if;
  if char_length(v_work)<3 or char_length(v_work)>160 then raise exception 'current_work_invalid'; end if;
  if p_unresolved_issues is not null and (p_unresolved_issues<0 or p_unresolved_issues>100000) then raise exception 'unresolved_issues_out_of_range'; end if;
  if char_length(trim(coalesce(p_issue_summary,'')))>500 then raise exception 'issue_summary_too_long'; end if;
  if octet_length(coalesce(p_detail,'{}'::jsonb)::text)>16384 then raise exception 'report_detail_too_large'; end if;
  insert into public.fleet_observability_reports(vessel_id,current_work,unresolved_issues,issue_summary,source_label,detail,reporter_user_id)
  values(v_vessel.id,v_work,p_unresolved_issues,nullif(trim(coalesce(p_issue_summary,'')),''),'VESSEL CAPTAIN',coalesce(p_detail,'{}'::jsonb),v_actor)
  returning * into v_report;
  return jsonb_build_object('project_id',v_vessel.project_id,'reported_at',v_report.reported_at,'report_id',v_report.id,
    'current_work',v_report.current_work,'unresolved_issues',v_report.unresolved_issues,'issue_summary',v_report.issue_summary,'source_label',v_report.source_label);
end
$function$;

create or replace function public.admiral_preview_vessel_activation(p_project_id text, p_evidence_reference text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare v_actor uuid:=auth.uid(); v_vessel public.fleet_vessels%rowtype; v_scope_ok boolean:=false; v_scope_detail text; v_fingerprint text; v_evidence text:=trim(coalesce(p_evidence_reference,''));
begin
  if v_actor is null or not fleet_private.is_fleet_global_authority(array['admiral']) then raise exception 'admiral_authority_required' using errcode='42501'; end if;
  if char_length(v_evidence)<8 or char_length(v_evidence)>160 then raise exception 'working_ship_evidence_reference_required'; end if;
  select * into v_vessel from public.fleet_vessels where project_id=lower(trim(coalesce(p_project_id,'')));
  if not found then raise exception 'vessel_not_found'; end if;
  if v_vessel.lifecycle_state in ('suspended','retired') then raise exception 'vessel_lifecycle_not_activatable'; end if;
  if v_vessel.display_name_status<>'approved' then raise exception 'vessel_working_name_not_approved'; end if;
  if v_vessel.operating_model='captain_operated' then
    v_scope_ok := exists(select 1 from public.fleet_captain_appointments a where a.vessel_id=v_vessel.id and a.status='accepted' and a.revoked_at is null and fleet_private.has_active_vessel_captain(v_vessel.id,a.candidate_user_id));
    v_scope_detail := case when v_scope_ok then 'accepted exact-vessel Captain appointment' else 'accepted exact-vessel Captain appointment required' end;
  elsif v_vessel.operating_model='owner_operated' then
    v_scope_ok := exists(select 1 from public.fleet_memberships m where m.vessel_id=v_vessel.id and m.role='project_owner' and m.active=true and m.revoked_at is null);
    v_scope_detail := case when v_scope_ok then 'active exact-vessel owner membership' else 'active exact-vessel owner membership required' end;
  elsif v_vessel.operating_model='delegated_operator' then
    v_scope_ok := exists(select 1 from public.fleet_memberships m where m.vessel_id=v_vessel.id and m.role='operator' and m.active=true and m.revoked_at is null);
    v_scope_detail := case when v_scope_ok then 'active delegated operator membership' else 'active delegated operator membership required' end;
  else
    v_scope_ok := true; v_scope_detail := 'Fleet-operated vessel';
  end if;
  v_fingerprint := md5(concat_ws('|',v_vessel.id::text,v_vessel.updated_at::text,v_vessel.lifecycle_state,v_vessel.operating_model,v_scope_ok::text,v_scope_detail,v_evidence));
  return jsonb_build_object('schema','dark-sky-vessel-activation-preview-v1','project_id',v_vessel.project_id,'vessel_id',v_vessel.id,
    'vessel_name',v_vessel.display_name,'lifecycle_state',v_vessel.lifecycle_state,'operating_model',v_vessel.operating_model,
    'operating_authority_ready',v_scope_ok,'operating_authority_detail',v_scope_detail,'fingerprint',v_fingerprint,
    'working_ship_evidence_reference',v_evidence,'activation_would_set','active','customer_publication_changed',false,'authority_granted',false);
end
$function$;

create or replace function public.admiral_depart_vessel(
  p_project_id text,
  p_evidence_reference text,
  p_expected_fingerprint text,
  p_intent text default ''
) returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare v_actor uuid:=auth.uid(); v_preview jsonb; v_vessel public.fleet_vessels%rowtype;
begin
  if v_actor is null or not fleet_private.is_fleet_global_authority(array['admiral']) then raise exception 'admiral_authority_required' using errcode='42501'; end if;
  if length(coalesce(p_intent,''))>500 then raise exception 'activation_intent_too_long'; end if;
  v_preview := public.admiral_preview_vessel_activation(p_project_id,p_evidence_reference);
  if coalesce((v_preview->>'operating_authority_ready')::boolean,false)<>true then raise exception 'operating_authority_not_ready'; end if;
  if p_expected_fingerprint is null or p_expected_fingerprint<>v_preview->>'fingerprint' then raise exception 'vessel_departure_preview_stale'; end if;
  select * into v_vessel from public.fleet_vessels where project_id=lower(trim(coalesce(p_project_id,''))) for update;
  update public.fleet_vessels set lifecycle_state='active',updated_at=now() where id=v_vessel.id returning * into v_vessel;
  insert into public.fleet_authority_audit(actor_user_id,vessel_id,action,authority_used,detail)
  values(v_actor,v_vessel.id,'vessel_departed_harbor','admiral',jsonb_build_object(
    'schema','dark-sky-vessel-departure-v1','project_id',v_vessel.project_id,'operating_model',v_vessel.operating_model,
    'intent',coalesce(p_intent,''),'working_ship_evidence_reference',trim(coalesce(p_evidence_reference,'')),'customer_publication_changed',false,'lifecycle_state','active'
  ));
  return jsonb_build_object('schema','dark-sky-vessel-departure-result-v1','project_id',v_vessel.project_id,'vessel_name',v_vessel.display_name,
    'lifecycle_state',v_vessel.lifecycle_state,'operating_model',v_vessel.operating_model,'working_ship_evidence_reference',trim(coalesce(p_evidence_reference,'')),'customer_publication_changed',false,'readback_verified',true);
end
$function$;

revoke all on function public.admiral_preview_captain_appointment(text,text) from public,anon;
revoke all on function public.admiral_issue_captain_appointment(text,text,text,text) from public,anon;
revoke all on function public.admiral_list_captain_appointments(text) from public,anon;
revoke all on function public.admiral_revoke_captain_appointment(uuid,text) from public,anon;
revoke all on function public.captain_read_my_appointments() from public,anon;
revoke all on function public.captain_accept_appointment(uuid) from public,anon;
revoke all on function public.captain_decline_appointment(uuid,text) from public,anon;
revoke all on function public.vessel_captain_verify_access(text) from public,anon;
revoke all on function public.vessel_captain_list_business_orders(text) from public,anon;
revoke all on function public.vessel_captain_update_order_status(text,text,text) from public,anon;
revoke all on function public.vessel_captain_read_watch_report(text) from public,anon;
revoke all on function public.vessel_captain_publish_watch_report(text,text,integer,text,jsonb) from public,anon;
revoke all on function public.admiral_preview_vessel_activation(text,text) from public,anon;
revoke all on function public.admiral_depart_vessel(text,text,text,text) from public,anon;

grant execute on function public.admiral_preview_captain_appointment(text,text) to authenticated;
grant execute on function public.admiral_issue_captain_appointment(text,text,text,text) to authenticated;
grant execute on function public.admiral_list_captain_appointments(text) to authenticated;
grant execute on function public.admiral_revoke_captain_appointment(uuid,text) to authenticated;
grant execute on function public.captain_read_my_appointments() to authenticated;
grant execute on function public.captain_accept_appointment(uuid) to authenticated;
grant execute on function public.captain_decline_appointment(uuid,text) to authenticated;
grant execute on function public.vessel_captain_verify_access(text) to authenticated;
grant execute on function public.vessel_captain_list_business_orders(text) to authenticated;
grant execute on function public.vessel_captain_update_order_status(text,text,text) to authenticated;
grant execute on function public.vessel_captain_read_watch_report(text) to authenticated;
grant execute on function public.vessel_captain_publish_watch_report(text,text,integer,text,jsonb) to authenticated;
grant execute on function public.admiral_preview_vessel_activation(text,text) to authenticated;
grant execute on function public.admiral_depart_vessel(text,text,text,text) to authenticated;

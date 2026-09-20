-- Dark Sky 8.8.6 through 8.8.15.8 — Admiral Commissioning Orders, Vessel Logo Helm, and Supabase Keel
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
    where user_id = v_actor and authority_role = 'admiral' and active = true
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
  if v_actor is null or not exists (select 1 from public.fleet_global_authorities where user_id=v_actor and authority_role='admiral' and active=true) then raise exception 'active_admiral_authority_required'; end if;
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
  if v_actor is null or not exists (select 1 from public.fleet_global_authorities where user_id=v_actor and authority_role='admiral' and active=true) then raise exception 'active_admiral_authority_required'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',a.id,'created_at',a.created_at,'action',a.action,'actor',coalesce(u.email,'Admiral'),
    'vessel_id',a.vessel_id,'detail',a.detail
  ) order by a.id desc),'[]'::jsonb) into v_records
  from (select * from public.fleet_authority_audit where action in ('vessel_commissioning_order_issued','vessel_working_name_changed','vessel_logo_changed') order by id desc limit greatest(1,least(coalesce(p_limit,10),100))) a
  left join auth.users u on u.id=a.actor_user_id;
  return jsonb_build_object('records',v_records);
end $$;

revoke all on function public.admiral_preview_vessel_commission(text,text,text,text,text,text,text) from public, anon;
revoke all on function public.admiral_issue_vessel_commission(text,text,text,text,text,text,text,text,text) from public, anon;
revoke all on function public.admiral_rename_vessel(text,text,text) from public, anon;
revoke all on function public.admiral_list_vessel_commission_log(integer) from public, anon;
grant execute on function public.admiral_preview_vessel_commission(text,text,text,text,text,text,text) to authenticated;
grant execute on function public.admiral_issue_vessel_commission(text,text,text,text,text,text,text,text,text) to authenticated;
grant execute on function public.admiral_rename_vessel(text,text,text) to authenticated;
grant execute on function public.admiral_list_vessel_commission_log(integer) to authenticated;

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
  where user_id=(select auth.uid()) and authority_role='admiral' and active=true
));
create policy "active admirals select fleet branding" on storage.objects for select to authenticated
using (bucket_id='fleet-branding' and exists (
  select 1 from public.fleet_global_authorities
  where user_id=(select auth.uid()) and authority_role='admiral' and active=true
));
create policy "active admirals update fleet branding" on storage.objects for update to authenticated
using (bucket_id='fleet-branding' and exists (
  select 1 from public.fleet_global_authorities
  where user_id=(select auth.uid()) and authority_role='admiral' and active=true
)) with check (bucket_id='fleet-branding' and exists (
  select 1 from public.fleet_global_authorities
  where user_id=(select auth.uid()) and authority_role='admiral' and active=true
));
create policy "active admirals delete fleet branding" on storage.objects for delete to authenticated
using (bucket_id='fleet-branding' and exists (
  select 1 from public.fleet_global_authorities
  where user_id=(select auth.uid()) and authority_role='admiral' and active=true
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
    where user_id=v_actor and authority_role='admiral' and active=true
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
    where user_id=v_actor and authority_role='admiral' and active=true
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

-- 8.8.15.8 Supabase Keel neutral settings seed. This is intentionally not an
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

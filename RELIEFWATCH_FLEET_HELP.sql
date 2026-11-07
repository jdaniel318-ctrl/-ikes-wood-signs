-- Apply after SIGNALMAN_FLEET_HELP.sql. Existing reports and appointments require no backfill.
begin;

create or replace function fleet_private.fh_admiral_actor() returns uuid
language plpgsql volatile set search_path='' as $$
declare actor uuid := auth.uid();
begin
  perform 1 from public.fleet_global_authorities g
    where g.user_id=actor and g.authority_role='admiral' and g.active and g.revoked_at is null
    for share;
  if not found then raise exception 'fleet_help_admiral_required' using errcode='42501'; end if;
  return actor;
end $$;

create or replace function fleet_private.fh_can_act(v public.fleet_vessels) returns boolean
language sql stable set search_path='' as $$
  select v.mission_class='independent_business'
    and v.lifecycle_state in ('commissioning','staging','active','live')
    and not exists (
      select 1 from public.fleet_captain_appointments a
      where a.vessel_id=v.id and a.status='accepted' and a.revoked_at is null
        and fleet_private.has_active_vessel_captain(v.id,a.candidate_user_id)
    )
$$;

create or replace function fleet_private.fh_acting_vessel(p_project_id text) returns uuid
language plpgsql volatile set search_path='' as $$
declare v public.fleet_vessels%rowtype;
begin
  perform fleet_private.fh_admiral_actor();
  -- Acceptance takes FOR UPDATE on this vessel before activating its appointment.
  select * into v from public.fleet_vessels where project_id=lower(btrim(p_project_id)) for share;
  if not found then raise exception 'fleet_help_vessel_access_required' using errcode='42501'; end if;
  -- Check in a fresh statement after obtaining the lock, including after waiting for acceptance.
  if fleet_private.fh_can_act(v) is not true then
    raise exception 'fleet_help_acting_unavailable' using errcode='42501';
  end if;
  return v.id;
end $$;

create or replace function public.admiral_list_fleet_help() returns jsonb
language plpgsql security definer set search_path='' as $$
begin
  if not exists(select 1 from public.fleet_global_authorities g where g.user_id=auth.uid()
      and g.authority_role='admiral' and g.active and g.revoked_at is null) then
    raise exception 'fleet_help_admiral_required' using errcode='42501';
  end if;
  return (select jsonb_build_object('records',coalesce(jsonb_agg(
    fleet_private.fh_record(r,v,false) || jsonb_build_object('can_act_as_captain',fleet_private.fh_can_act(v))
    order by r.updated_at desc,r.vessel_id,r.request_id),'[]'::jsonb))
    from fleet_private.fleet_help_requests r join public.fleet_vessels v on v.id=r.vessel_id);
end $$;

create or replace function public.acting_captain_list_fleet_help(p_project_id text) returns jsonb
language sql security definer set search_path='' as $$
  select fleet_private.fh_list(fleet_private.fh_acting_vessel(p_project_id),true)
$$;

create or replace function public.acting_captain_read_fleet_help_attachment(p_project_id text,p_request_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare vessel uuid:=fleet_private.fh_acting_vessel(p_project_id); result jsonb;
begin
 select jsonb_build_object('request_id',r.request_id,'attachment',r.attachment) into result from fleet_private.fleet_help_requests r where r.vessel_id=vessel and r.request_id=p_request_id;
 if not found then raise exception 'fleet_help_not_found' using errcode='P0002';end if;
 return result;
end $$;

create or replace function fleet_private.fh_transition(vessel uuid,p_request_id uuid,p_version integer,p_status text,p_outcome text,p_authority text)
returns jsonb language plpgsql set search_path='' as $$
declare r fleet_private.fleet_help_requests%rowtype;
 note text:=btrim(coalesce(p_outcome,''),E' \t\n\r');
begin
 if p_request_id is null or coalesce(p_version,0)<1 or p_status is null or p_status not in ('in_progress','verified') or length(note)>600 or translate(note,E'\n\r\t','')~'[[:cntrl:]]'
    or (p_status='verified' and length(note)<8) then raise exception 'fleet_help_invalid_update_or_verification' using errcode='22023';end if;
 select * into r from fleet_private.fleet_help_requests where vessel_id=vessel and request_id=p_request_id for update;
 if not found then raise exception 'fleet_help_not_found' using errcode='P0002';end if;
 if r.version<>p_version then raise exception 'fleet_help_version_conflict' using errcode='40001';end if;
 if not ((r.status='open' and p_status='in_progress') or (r.status='in_progress' and p_status='verified')) then raise exception 'fleet_help_transition_unavailable';end if;
 update fleet_private.fleet_help_requests set status=p_status,outcome=note,version=version+1,updated_at=clock_timestamp() where vessel_id=vessel and request_id=p_request_id returning * into r;
 insert into public.fleet_authority_audit(actor_user_id,vessel_id,action,authority_used,detail)
 values(auth.uid(),vessel,'fleet_help_'||p_status,p_authority,jsonb_build_object('request_id',p_request_id,'version',r.version,'status',p_status));
 return (select fleet_private.fh_record(r,v,true) from public.fleet_vessels v where v.id=vessel);
end $$;

create or replace function public.vessel_captain_update_fleet_help(p_project_id text,p_request_id uuid,p_version integer,p_status text,p_outcome text)
returns jsonb language sql security definer set search_path='' as $$
  select fleet_private.fh_transition(fleet_private.fh_vessel(p_project_id,'captain',true),p_request_id,p_version,p_status,p_outcome,'vessel_captain')
$$;

create or replace function public.acting_captain_update_fleet_help(p_project_id text,p_request_id uuid,p_version integer,p_status text,p_outcome text)
returns jsonb language sql security definer set search_path='' as $$
  select fleet_private.fh_transition(fleet_private.fh_acting_vessel(p_project_id),p_request_id,p_version,p_status,p_outcome,'admiral_acting_captain')
$$;

revoke all on function fleet_private.fh_admiral_actor(), fleet_private.fh_can_act(public.fleet_vessels), fleet_private.fh_acting_vessel(text), fleet_private.fh_transition(uuid,uuid,integer,text,text,text) from public, anon, authenticated, service_role;

revoke all on function public.admiral_list_fleet_help(), public.vessel_captain_update_fleet_help(text,uuid,integer,text,text), public.acting_captain_list_fleet_help(text), public.acting_captain_read_fleet_help_attachment(text,uuid), public.acting_captain_update_fleet_help(text,uuid,integer,text,text) from public, anon, authenticated, service_role;
grant execute on function public.admiral_list_fleet_help(), public.vessel_captain_update_fleet_help(text,uuid,integer,text,text), public.acting_captain_list_fleet_help(text), public.acting_captain_read_fleet_help_attachment(text,uuid), public.acting_captain_update_fleet_help(text,uuid,integer,text,text) to authenticated;
commit;

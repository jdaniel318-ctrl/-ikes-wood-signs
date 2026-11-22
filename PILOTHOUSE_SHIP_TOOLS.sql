-- Black Flag Pilothouse. Install after Soundings in the Black Flag Fleet Core SQL Editor.
-- Every existing assignment, document number, business record and audit entry is retained.
begin;

do $prerequisites$
begin
  if to_regprocedure('fleet_private.require_commissioning_admiral()') is null
     or to_regprocedure('fleet_private.qm_captain_vessel(text)') is null
     or to_regprocedure('fleet_private.qm_ship_documents_offered(uuid)') is null
     or to_regclass('fleet_private.qm_ship_tool_history') is null then
    raise exception 'Install the fleet commissioning and Soundings prerequisites first.';
  end if;
end
$prerequisites$;

create or replace function fleet_private.qm_ship_document_receipt(ship uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'projectId', v.project_id, 'vesselId', v.id, 'displayName', v.display_name,
    'eligible', fleet_private.qm_ship_documents_offered(v.id),
    'enabled', coalesce(t.enabled, false), 'version', coalesce(t.version, 0),
    'logoPath', v.logo_storage_path, 'logoUpdatedAt', v.logo_updated_at,
    'assignmentAuthority', 'admiral')
  from public.fleet_vessels v
  left join fleet_private.qm_ship_tools t on t.vessel_id = v.id
  where v.id = ship;
$$;

-- Retain the Soundings read signature for previously opened stations.
create or replace function public.vessel_captain_document_tool(
  p_project_id text, p_enabled boolean default null, p_expected_version bigint default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if p_enabled is not null or p_expected_version is not null then
    raise exception 'An Admiral assigns ship tools.' using errcode = '42501';
  end if;
  return fleet_private.qm_ship_document_receipt(fleet_private.qm_captain_vessel(p_project_id));
end;
$$;

create or replace function public.admiral_ship_document_tool(
  p_project_id text, p_enabled boolean default null, p_expected_version bigint default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  ship uuid;
  receipt jsonb;
  saved_version bigint;
begin
  perform fleet_private.require_commissioning_admiral();
  if not exists (
    select 1 from auth.sessions s
    where s.id = nullif(auth.jwt()->>'session_id','')::uuid and s.user_id = auth.uid()
      and (s.not_after is null or s.not_after > now())
  ) then
    raise exception 'An active Admiral session is required.' using errcode = '42501';
  end if;

  select v.id into strict ship from public.fleet_vessels v
  where v.project_id = p_project_id and v.mission_class <> 'admiral_program'
    and v.lifecycle_state in ('commissioning', 'staging', 'active', 'live')
  for share;

  if p_enabled is null then
    if p_expected_version is not null then
      raise exception 'An assignment decision is required for a versioned change.' using errcode = '22023';
    end if;
    return fleet_private.qm_ship_document_receipt(ship);
  end if;

  -- Serialize per vessel, including its first assignment when no preference row exists.
  perform pg_advisory_xact_lock(hashtextextended(ship::text,154));
  receipt := fleet_private.qm_ship_document_receipt(ship);
  saved_version := (receipt->>'version')::bigint;
  if p_expected_version is distinct from saved_version then
    raise exception 'This assignment changed. Read its saved state before choosing again.' using errcode = '40001';
  end if;
  if p_enabled and not (receipt->>'eligible')::boolean then
    raise exception 'Fleet Services has not made this tool available for this ship.' using errcode = '42501';
  end if;
  if p_enabled = (receipt->>'enabled')::boolean then
    return receipt;
  end if;

  insert into fleet_private.qm_ship_tools(vessel_id, enabled, version)
    values (ship, p_enabled, saved_version + 1)
    on conflict(vessel_id) do update set enabled = excluded.enabled, version = excluded.version;
  insert into fleet_private.qm_ship_tool_history(vessel_id, version, enabled, actor)
    values (ship, saved_version + 1, p_enabled, auth.uid());
  insert into public.fleet_authority_audit(actor_user_id, vessel_id, action, authority_used, detail)
    values (auth.uid(), ship, 'vessel_document_tool_assignment_changed', 'admiral',
      jsonb_build_object('project_id', p_project_id, 'tool', 'business.quotes-invoices',
        'enabled', p_enabled, 'version', saved_version + 1));
  return fleet_private.qm_ship_document_receipt(ship);
end;
$$;

revoke all on function fleet_private.qm_ship_document_receipt(uuid),
  public.vessel_captain_document_tool(text,boolean,bigint),
  public.admiral_ship_document_tool(text,boolean,bigint) from public,anon,authenticated,service_role;
grant execute on function public.vessel_captain_document_tool(text,boolean,bigint),
  public.admiral_ship_document_tool(text,boolean,bigint) to authenticated;

notify pgrst, 'reload schema';
commit;

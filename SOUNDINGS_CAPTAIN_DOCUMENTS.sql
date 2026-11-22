-- Manual fleet database setup, after Trade Winds, Tally, commissioning and Signalman.
begin;
do $prerequisites$
begin
 if to_regprocedure('fleet_private.fh_vessel(text,text,boolean)') is null or
    to_regprocedure('fleet_private.qm_allocate_invoice(jsonb,uuid,text)') is null or
    to_regprocedure('fleet_private.qm_require_scope(jsonb)') is null then
   raise exception 'Install commissioning, Signalman, Trade Winds and Tally first.';
 end if;
end $prerequisites$;
create table if not exists fleet_private.qm_ship_tools (
 vessel_id uuid primary key references public.fleet_vessels(id),
 enabled boolean not null,
 version bigint not null check(version>0)
);
create table if not exists fleet_private.qm_ship_tool_history (
 vessel_id uuid not null references public.fleet_vessels(id),
 version bigint not null,
 enabled boolean not null,
 actor uuid not null,
 changed_at timestamptz not null default clock_timestamp(),
 primary key(vessel_id,version)
);
alter table fleet_private.qm_ship_tools enable row level security;
alter table fleet_private.qm_ship_tool_history enable row level security;
revoke all on fleet_private.qm_ship_tools,fleet_private.qm_ship_tool_history from public,anon,authenticated,service_role;

create or replace function fleet_private.qm_captain_vessel(project text)
returns uuid language plpgsql security definer set search_path='' as $$
declare vessel uuid;
begin
 if not exists(select 1 from auth.sessions s where s.id=nullif(auth.jwt()->>'session_id','')::uuid
   and s.user_id=auth.uid() and (s.not_after is null or s.not_after>now())) then
   raise exception 'Captain sign-in required' using errcode='42501';
 end if;
 vessel:=fleet_private.fh_vessel(project,'captain',true);
 if not exists(select 1 from public.fleet_vessels v where v.id=vessel and v.project_id=project and v.mission_class<>'admiral_program') then
   raise exception 'Captain station unavailable for this vessel' using errcode='42501';
 end if;
 return vessel;
end $$;

-- The included optional tool obeys an existing Fleet Services registration when one exists.
-- No commercial grant or paid activation is created by switching this preference.
create or replace function fleet_private.qm_ship_documents_offered(vessel uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select not exists(select 1 from public.fleet_capabilities c where c.capability_key='business.quotes-invoices')
 or exists(select 1 from public.fleet_capabilities c join public.fleet_service_entitlements e on e.capability_id=c.id
   where c.capability_key='business.quotes-invoices' and e.vessel_id=vessel
   and ((e.commercial_mode in ('standard','free') and e.status in ('available','entitled','enabled'))
       or (e.commercial_mode='paid' and e.status in ('entitled','enabled'))));
$$;

create or replace function public.vessel_captain_document_tool(p_project_id text,p_enabled boolean default null,p_expected_version bigint default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare vessel uuid:=fleet_private.qm_captain_vessel(p_project_id);
 current_version bigint:=0; selected boolean:=false; offered boolean;
begin
 if p_enabled is not null then perform pg_advisory_xact_lock(hashtextextended(vessel::text,154));end if;
 offered:=fleet_private.qm_ship_documents_offered(vessel);
 select t.enabled,t.version into selected,current_version from fleet_private.qm_ship_tools t where t.vessel_id=vessel;
 selected:=coalesce(selected,false);current_version:=coalesce(current_version,0);
 if p_enabled is not null then
   if p_enabled and not offered then raise exception 'This service is unavailable for this ship' using errcode='42501';end if;
   if p_expected_version is distinct from current_version then raise exception 'Ship tools changed. Refresh to see the saved choice.' using errcode='40001';end if;
   if p_enabled<>selected then
     selected:=p_enabled;current_version:=current_version+1;
     insert into fleet_private.qm_ship_tools values(vessel,selected,current_version)
       on conflict(vessel_id) do update set enabled=excluded.enabled,version=excluded.version;
     insert into fleet_private.qm_ship_tool_history(vessel_id,version,enabled,actor) values(vessel,current_version,selected,auth.uid());
   end if;
 end if;
 return jsonb_build_object('projectId',p_project_id,'vesselId',vessel,'eligible',offered,'enabled',selected,'version',current_version);
end $$;

-- Preserve the installed Admiral guard, including any site-specific restrictions.
-- The new path uses a distinct ship-owned namespace for succession between Captains.
do $install$
begin
 if to_regprocedure('fleet_private.qm_require_admiral_scope(jsonb)') is null then
   execute replace(pg_get_functiondef('fleet_private.qm_require_scope(jsonb)'::regprocedure),
     'FUNCTION fleet_private.qm_require_scope(', 'FUNCTION fleet_private.qm_require_admiral_scope(');
 end if;
end $install$;
create or replace function fleet_private.qm_require_scope(s jsonb) returns void language plpgsql volatile security definer set search_path='' as $$
declare vessel uuid;
begin
 if (s->>'accountId') not like 'ship:%' or s->>'accountId' is null then
   perform fleet_private.qm_require_admiral_scope(s);return;
 end if;
 perform fleet_private.qm_keys(s,array['accountId','backend','environment','site','businessId']);
 vessel:=fleet_private.qm_captain_vessel(s->>'businessId');
 if s->>'accountId' is distinct from 'ship:'||vessel::text
   or s->>'backend' is distinct from 'https://sjgqqtnuttnkwsoebbqf.supabase.co'
   or s->>'environment' is distinct from 'staging'
   or s->>'site' is distinct from 'https://jdaniel318-ctrl.github.io/-ikes-wood-signs/'
   or not fleet_private.qm_ship_documents_offered(vessel) then
   raise exception 'Ship document scope is unavailable' using errcode='42501';
 end if;
 perform 1 from fleet_private.qm_ship_tools where vessel_id=vessel and enabled for share;
 if not found then raise exception 'Quotes and invoices are turned off for this ship' using errcode='42501';end if;
end $$;
revoke all on function fleet_private.qm_require_admiral_scope(jsonb),fleet_private.qm_require_scope(jsonb),
 fleet_private.qm_captain_vessel(text),fleet_private.qm_ship_documents_offered(uuid),
 public.vessel_captain_document_tool(text,boolean,bigint) from public,anon,authenticated,service_role;
grant execute on function public.vessel_captain_document_tool(text,boolean,bigint) to authenticated;
-- Abort the install if these function and table grants are broader than intended.
do $verify$
begin
 if has_function_privilege('anon','public.vessel_captain_document_tool(text,boolean,bigint)','execute')
    or not has_function_privilege('authenticated','public.vessel_captain_document_tool(text,boolean,bigint)','execute')
    or has_function_privilege('authenticated','fleet_private.qm_require_admiral_scope(jsonb)','execute')
    or has_table_privilege('authenticated','fleet_private.qm_ship_tools','SELECT,INSERT,UPDATE,DELETE')
    or has_table_privilege('anon','fleet_private.qm_ship_tool_history','SELECT,INSERT,UPDATE,DELETE') then
   raise exception 'Ship document access grant check failed. Installation rolled back.';
 end if;
end $verify$;
notify pgrst,'reload schema';
commit;

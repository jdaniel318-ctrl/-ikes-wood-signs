-- Signalman 8.8.20.99. Additive, repeatable; apply to the intended Fleet Core only.
-- Prerequisite: commissioning/appointment authorities from SUPABASE_ADMIRAL_COMMISSIONING_886.sql.
-- No accounts, appointments, memberships, fleet authority or publication settings are changed.
begin;
create table if not exists fleet_private.fleet_help_requests (
  vessel_id uuid not null references public.fleet_vessels(id) on delete restrict,
  request_id uuid not null,
  owner_user_id uuid not null,
  screen text not null check (length(screen) between 1 and 80),
  build text not null check (length(build) between 1 and 80),
  description text not null check (length(description) between 1 and 1200),
  attachment text check (octet_length(attachment)<=220000),
  status text not null default 'open' check (status in ('open','in_progress','verified')),
  outcome text not null default '' check (length(outcome)<=600),
  version integer not null default 1 check (version>0),
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  primary key(vessel_id,request_id),
  check (status<>'verified' or length(btrim(outcome))>=8)
);
create index if not exists fleet_help_vessel_updated on fleet_private.fleet_help_requests(vessel_id,updated_at desc,request_id);
alter table fleet_private.fleet_help_requests enable row level security;
revoke all on fleet_private.fleet_help_requests from public,anon,authenticated,service_role;

-- No owner, applicant, project or recipient identity supplied by the browser is trusted.
-- Bind mutation authorization to the transaction; a racing membership revocation serializes with it.
create or replace function fleet_private.fh_vessel(p_project_id text,p_access text,p_lock boolean default false)
returns uuid language plpgsql set search_path='' as $$
declare actor uuid:=auth.uid(); vessel uuid; ok boolean:=false;
begin
 if actor is null then raise exception 'fleet_help_sign_in_required' using errcode='42501'; end if;
 select id into vessel from public.fleet_vessels where project_id=lower(btrim(p_project_id));
 if p_access in ('owner','either') then
   if p_lock then
     perform 1 from public.fleet_memberships m where m.vessel_id=vessel and m.user_id=actor and m.role='project_owner' and m.active and m.revoked_at is null for share;
     ok:=found;
   else
     select exists(select 1 from public.fleet_memberships m where m.vessel_id=vessel and m.user_id=actor and m.role='project_owner' and m.active and m.revoked_at is null) into ok;
   end if;
 end if;
 if not ok and p_access in ('captain','either') then
   if p_lock then
     perform 1 from public.fleet_captain_appointments a join public.fleet_memberships m on m.id=a.membership_id
       where a.vessel_id=vessel and a.candidate_user_id=actor and a.status='accepted' and a.revoked_at is null
       and m.vessel_id=vessel and m.user_id=actor and m.role='operator' and m.active and m.revoked_at is null for share of a,m;
     ok:=found;
   else ok:=true; end if;
   ok:=ok and coalesce(fleet_private.has_active_vessel_captain(vessel,actor),false);
 end if;
 if not ok or vessel is null then raise exception 'fleet_help_vessel_access_required' using errcode='42501'; end if;
 return vessel;
end $$;

-- Only a bounded JPEG data URL is retained. Check MIME, base64, image/scan headers, dimensions and end marker.
create or replace function fleet_private.fh_check_jpeg(p_attachment text) returns void language plpgsql immutable set search_path='' as $$
declare b bytea; n integer; pos integer:=2; marker integer; seglen integer; w integer; h integer; frame boolean:=false;
begin
 if p_attachment is null then return; end if;
 if octet_length(p_attachment)>220000 or p_attachment !~ '^data:image/jpeg;base64,[A-Za-z0-9+/]+={0,2}$' then raise exception 'fleet_help_invalid_jpeg' using errcode='22023'; end if;
 begin b:=decode(substr(p_attachment,24),'base64'); exception when data_exception then raise exception 'fleet_help_invalid_jpeg' using errcode='22023'; end;
 n:=octet_length(b);
 if n>=12 and substring(b from 1 for 2)=decode('ffd8','hex') and substring(b from n-1)=decode('ffd9','hex') then
   while pos+3<n loop
     exit when get_byte(b,pos)<>255;
     while pos<n-1 and get_byte(b,pos)=255 loop pos:=pos+1; end loop;
     exit when pos+2>=n; marker:=get_byte(b,pos);pos:=pos+1;
     seglen:=256*get_byte(b,pos)+get_byte(b,pos+1);exit when seglen<2 or pos+seglen>n-2;
     if marker in (192,193,194) then
       exit when seglen<8;h:=256*get_byte(b,pos+3)+get_byte(b,pos+4);w:=256*get_byte(b,pos+5)+get_byte(b,pos+6);
       exit when w not between 1 and 1600 or h not between 1 and 1600;frame:=true;
     elsif marker=218 then if frame and seglen>=6 and pos+seglen<n-2 then return; end if;exit;
     end if;
     pos:=pos+seglen;
   end loop;
 end if;
 raise exception 'fleet_help_invalid_jpeg' using errcode='22023';
end $$;

-- Explicit projections: lists never move photos; only vessel readers receive the owner's description.
-- v1 lists return every matching row with no cap or silent omission; payload and query cost grow
-- with the number of reports. Add cursor-based UI + RPC paging together for larger fleets.
-- Outcome notes and screen labels appear in the authenticated Admiral summary; descriptions do not.
create or replace function fleet_private.fh_record(r fleet_private.fleet_help_requests,v public.fleet_vessels,full_record boolean)
returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('request_id',r.request_id,'project_id',v.project_id,'project_name',v.display_name,
   'screen',r.screen,'build',r.build,'status',r.status,'version',r.version,'created_at',r.created_at,
   'updated_at',r.updated_at,'outcome',r.outcome) || case when full_record then
   jsonb_build_object('description',r.description,'has_attachment',r.attachment is not null) else '{}'::jsonb end
$$;
create or replace function fleet_private.fh_list(vessel uuid,full_record boolean) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('records',coalesce(jsonb_agg(fleet_private.fh_record(r,v,full_record) order by r.updated_at desc,r.vessel_id,r.request_id),'[]'::jsonb))
 from fleet_private.fleet_help_requests r join public.fleet_vessels v on v.id=r.vessel_id where vessel is null or r.vessel_id=vessel
$$;

create or replace function public.owner_create_fleet_help(p_project_id text,p_request_id uuid,p_screen text,p_build text,p_description text,p_attachment text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare vessel uuid:=fleet_private.fh_vessel(p_project_id,'owner',true); actor uuid:=auth.uid(); r fleet_private.fleet_help_requests%rowtype;
 s text:=btrim(p_screen); b text:=btrim(p_build); d text:=btrim(p_description,E' \t\r\n');
begin
 if p_request_id is null or coalesce(length(s),0) not between 1 and 80 or s~'[[:cntrl:]?#%@<>:]' or coalesce(length(b),0) not between 1 and 80 or b!~'^[A-Za-z0-9][A-Za-z0-9_.+ -]*$'
   or coalesce(length(d),0) not between 1 and 1200 or translate(d,E'\n\r\t','')~'[[:cntrl:]]' then raise exception 'fleet_help_invalid_context_or_description' using errcode='22023';end if;
 perform fleet_private.fh_check_jpeg(p_attachment);
 insert into fleet_private.fleet_help_requests(vessel_id,request_id,owner_user_id,screen,build,description,attachment)
 values(vessel,p_request_id,actor,s,b,d,p_attachment) on conflict(vessel_id,request_id) do nothing returning * into r;
 if found then
   insert into public.fleet_authority_audit(actor_user_id,vessel_id,action,authority_used,detail)
   values(actor,vessel,'fleet_help_opened','project_owner',jsonb_build_object('request_id',p_request_id,'status','open','version',1));
 else
   select * into strict r from fleet_private.fleet_help_requests where vessel_id=vessel and request_id=p_request_id;
   if (r.owner_user_id,r.screen,r.build,r.description,r.attachment) is distinct from (actor,s,b,d,p_attachment) then raise exception 'fleet_help_request_id_conflict';end if;
 end if;
 return (select fleet_private.fh_record(r,v,true) from public.fleet_vessels v where v.id=vessel);
end $$;

create or replace function public.owner_list_fleet_help(p_project_id text) returns jsonb language sql security definer set search_path='' as $$
 select fleet_private.fh_list(fleet_private.fh_vessel(p_project_id,'owner'),true)
$$;
create or replace function public.vessel_captain_list_fleet_help(p_project_id text) returns jsonb language sql security definer set search_path='' as $$
 select fleet_private.fh_list(fleet_private.fh_vessel(p_project_id,'captain'),true)
$$;
create or replace function public.admiral_list_fleet_help() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not coalesce(fleet_private.is_fleet_global_authority(array['admiral']),false) then raise exception 'fleet_help_admiral_required' using errcode='42501';end if;
 return fleet_private.fh_list(null,false);
end $$;
create or replace function public.fleet_help_read_attachment(p_project_id text,p_request_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare vessel uuid:=fleet_private.fh_vessel(p_project_id,'either'); result jsonb;
begin
 select jsonb_build_object('request_id',r.request_id,'attachment',r.attachment) into result from fleet_private.fleet_help_requests r where r.vessel_id=vessel and r.request_id=p_request_id;
 if not found then raise exception 'fleet_help_not_found' using errcode='P0002';end if;
 return result;
end $$;

create or replace function public.vessel_captain_update_fleet_help(p_project_id text,p_request_id uuid,p_version integer,p_status text,p_outcome text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare vessel uuid:=fleet_private.fh_vessel(p_project_id,'captain',true); r fleet_private.fleet_help_requests%rowtype;
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
 values(auth.uid(),vessel,'fleet_help_'||p_status,'vessel_captain',jsonb_build_object('request_id',p_request_id,'version',r.version,'status',p_status));
 return (select fleet_private.fh_record(r,v,true) from public.fleet_vessels v where v.id=vessel);
end $$;

revoke all on function fleet_private.fh_vessel(text,text,boolean),fleet_private.fh_record(fleet_private.fleet_help_requests,public.fleet_vessels,boolean),fleet_private.fh_list(uuid,boolean),fleet_private.fh_check_jpeg(text) from public,anon,authenticated,service_role;
revoke all on function public.owner_create_fleet_help(text,uuid,text,text,text,text), public.owner_list_fleet_help(text),public.vessel_captain_list_fleet_help(text),public.admiral_list_fleet_help(),public.fleet_help_read_attachment(text,uuid),public.vessel_captain_update_fleet_help(text,uuid,integer,text,text) from public,anon,authenticated,service_role;
grant execute on function public.owner_create_fleet_help(text,uuid,text,text,text,text), public.owner_list_fleet_help(text),public.vessel_captain_list_fleet_help(text),public.admiral_list_fleet_help(),public.fleet_help_read_attachment(text,uuid),public.vessel_captain_update_fleet_help(text,uuid,integer,text,text) to authenticated;
commit;

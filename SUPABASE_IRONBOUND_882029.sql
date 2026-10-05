-- Ironbound 8.8.20.29: server-first PRIVATE TEST commissioning.
-- Additive RPCs; saved voyages/receipts stay intact. No vessel is commissioned by this migration.
-- No membership, global role, entitlement, contract approval or publication is granted.

create or replace function fleet_private.require_commissioning_admiral()
returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.fleet_global_authorities
  where user_id=auth.uid() and authority_role='admiral' and active and revoked_at is null)
 then raise exception 'active_admiral_authority_required' using errcode='42501'; end if;
end $$;
revoke all on function fleet_private.require_commissioning_admiral() from public,anon,authenticated;

create or replace function fleet_private.commissioning_draft_fingerprint(p_voyage_id uuid)
returns text language sql stable security definer set search_path='' as $$
 select md5(jsonb_build_object('schema','server-first-v1','draft_key',v.draft_key,
  'draft',(select coalesce(jsonb_object_agg(e.key,e.value),'{}'::jsonb)
   from jsonb_each(v.draft) e where left(e.key,1)<>'_' and e.key<>'updatedAt'),
  'forge_truth',v.forge_truth)::text)
 from public.fleet_commissioning_voyages v where voyage_id=p_voyage_id
$$;
revoke all on function fleet_private.commissioning_draft_fingerprint(uuid) from public,anon,authenticated;

-- An old client may not rebind an operation or resurrect a closed receipt.
create or replace function fleet_private.guard_commissioning_receipt()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if (new.operation_id,new.voyage_id,new.actor_user_id,new.intended_project_id,new.preview_fingerprint)
  is distinct from (old.operation_id,old.voyage_id,old.actor_user_id,old.intended_project_id,old.preview_fingerprint)
 then raise exception 'commissioning_operation_identity_is_immutable'; end if;
 if old.detail->>'operation_closed'='true' and
  (new.command_state<>old.command_state or new.detail->>'operation_closed' is distinct from 'true')
 then raise exception 'closed_commissioning_operation_cannot_reopen'; end if;
 if old.detail->>'retry_forbidden'='true' and new.detail->>'retry_forbidden' is distinct from 'true'
 then raise exception 'commissioning_retry_forbidden'; end if;
 return new;
end $$;
revoke all on function fleet_private.guard_commissioning_receipt() from public,anon,authenticated;
drop trigger if exists ironbound_receipt_identity_guard on public.fleet_commissioning_receipts;
create trigger ironbound_receipt_identity_guard before update on public.fleet_commissioning_receipts
 for each row execute function fleet_private.guard_commissioning_receipt();

-- Closed absent operations retire their intended keys, including through legacy writers.
create or replace function fleet_private.guard_retired_commissioning_key()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.fleet_commissioning_receipts r
  where r.intended_project_id=new.project_id and r.command_state in ('verified_not_created','cancelled'))
 then raise exception 'retired_commissioning_project_key_cannot_be_reused'; end if;
 return new;
end $$;
revoke all on function fleet_private.guard_retired_commissioning_key() from public,anon,authenticated;
drop trigger if exists ironbound_retired_project_guard on public.fleet_vessels;
create trigger ironbound_retired_project_guard before insert or update of project_id on public.fleet_vessels
 for each row execute function fleet_private.guard_retired_commissioning_key();

create or replace function public.preview_commissioning_voyage(p_voyage_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v public.fleet_commissioning_voyages%rowtype; r public.fleet_commissioning_receipts%rowtype;
 issues text[]:=array[]::text[];
begin
 perform fleet_private.require_commissioning_admiral();
 select * into v from public.fleet_commissioning_voyages where voyage_id=p_voyage_id and actor_user_id=auth.uid();
 if not found then raise exception 'exact_commissioning_voyage_required' using errcode='42501'; end if;
 select * into r from public.fleet_commissioning_receipts where voyage_id=v.voyage_id and actor_user_id=auth.uid()
 order by (operation_id=v.last_operation_id) desc,created_at desc limit 1;
 if v.status<>'active' then issues:=array_append(issues,'Voyage is already commissioned or closed. Read its existing operation.'); end if;
 if v.safe_stage<>7 then issues:=array_append(issues,'Save the exact voyage at Step 7 before preparation.'); end if;
 if length(trim(coalesce(v.draft->>'name','')))<2 or length(trim(coalesce(v.draft->>'name','')))>80
 then issues:=array_append(issues,'Business name must contain 2 to 80 characters.'); end if;
 if jsonb_typeof(v.draft->'forgePlan') is distinct from 'object'
 then issues:=array_append(issues,'A reviewed Forge Plan is required.'); end if;
 if jsonb_typeof(v.forge_truth->'conflicts')='array' and jsonb_array_length(v.forge_truth->'conflicts')>0
 then issues:=array_append(issues,'Resolve the saved Forge conflicts before commissioning.'); end if;
 if v.draft->'forgePlan'->'photoRequired' is distinct from v.draft->'photoRequired'
 then issues:=array_append(issues,'Photo requirement must match the reviewed Forge Plan.'); end if;
 if exists(select 1 from public.fleet_commissioning_receipts where voyage_id=v.voyage_id
  and command_state not in ('verified_not_created','cancelled'))
 then issues:=array_append(issues,'Read or reconcile the existing operation. A new operation is blocked.'); end if;
 return jsonb_build_object('schema','server-first-preview-v1','voyage_id',v.voyage_id,'draft_key',v.draft_key,
  'display_name',trim(v.draft->>'name'),'draft_fingerprint',fleet_private.commissioning_draft_fingerprint(v.voyage_id),
  'ready',cardinality(issues)=0,'issues',to_jsonb(issues),'receipt',case when r.operation_id is null then null else to_jsonb(r)-'actor_user_id' end,
  'test_only',true,'live',false,'owner_membership_created',false,'entitlements_created',false,
  'auto_retry','forbidden','status',v.status,'observed_at',clock_timestamp());
end $$;
revoke all on function public.preview_commissioning_voyage(uuid) from public,anon;
grant execute on function public.preview_commissioning_voyage(uuid) to authenticated;

create or replace function public.read_commissioning_operation(p_voyage_id uuid,p_operation_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.fleet_commissioning_receipts%rowtype; f public.fleet_vessels%rowtype;
 s jsonb; matched boolean:=false; blueprint boolean:=false; project jsonb; appointments jsonb;
begin
 perform fleet_private.require_commissioning_admiral();
 select * into r from public.fleet_commissioning_receipts where operation_id=p_operation_id
  and voyage_id=p_voyage_id and actor_user_id=auth.uid();
 if not found then raise exception 'exact_commissioning_receipt_required' using errcode='42501'; end if;
 select * into f from public.fleet_vessels where project_id=r.intended_project_id;
 if f.id is not null then
  matched:=f.commissioned_by=r.actor_user_id and exists(select 1 from public.fleet_authority_audit a
   where a.vessel_id=f.id and a.action='server_first_vessel_commissioned'
   and a.detail->>'operation_id'=r.operation_id::text and a.detail->>'preview_fingerprint'=r.preview_fingerprint);
  select settings into s from public.fleet_business_settings where vessel_id=f.id;
  blueprint:=coalesce(s->>'projectId'=f.project_id and s->'commissioning'->>'operation_id'=r.operation_id::text
   and s->'commissioning'->>'preview_fingerprint'=r.preview_fingerprint
   and s->'commissioningBlueprint'->'project'->>'id'=f.project_id,false);
  if matched and blueprint then project:=s->'commissioningBlueprint'->'project'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'status',status,'appointment_role',appointment_role)),'[]'::jsonb)
   into appointments from public.fleet_captain_appointments where vessel_id=f.id and status in ('pending','accepted','suspended');
 end if;
 return jsonb_build_object('schema','server-first-operation-proof-v1','voyage_id',r.voyage_id,'operation_id',r.operation_id,
  'intended_project_id',r.intended_project_id,'preview_fingerprint',r.preview_fingerprint,'command_state',r.command_state,
  'receipt',to_jsonb(r)-'actor_user_id'-'detail'||jsonb_build_object('detail',r.detail-'project_snapshot'-'draft_snapshot'-'forge_snapshot'),
  'canonical_vessel_exists',f.id is not null,'canonical_matches_operation',matched,'blueprint_verified',blueprint,
  'vessel',case when f.id is null then null else to_jsonb(f)-'commissioned_by'-'primary_owner_user_id' end,
  'project',project,'observed_at',clock_timestamp(),
  'handoff',jsonb_build_object('appointments',coalesce(appointments,'[]'::jsonb),
    'membership_count',(select count(*) from public.fleet_memberships where vessel_id=f.id and active and revoked_at is null),
    'entitlement_count',(select count(*) from public.fleet_service_entitlements where vessel_id=f.id),
    'isolation_proof','not_run','working_ship_handoff','not_proven','publication','blocked_by_test_commission'));
end $$;
revoke all on function public.read_commissioning_operation(uuid,uuid) from public,anon;
grant execute on function public.read_commissioning_operation(uuid,uuid) to authenticated;

create or replace function public.prepare_commissioning_operation(p_voyage_id uuid,p_expected_draft_fingerprint text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v public.fleet_commissioning_voyages%rowtype; preview jsonb; op uuid:=gen_random_uuid();
 pid text:='bf-p-'||substr(replace(gen_random_uuid()::text,'-',''),1,16); fp text; project jsonb;
begin
 perform fleet_private.require_commissioning_admiral();
 select * into v from public.fleet_commissioning_voyages where voyage_id=p_voyage_id and actor_user_id=auth.uid() for update;
 if not found then raise exception 'exact_commissioning_voyage_required' using errcode='42501'; end if;
 preview:=public.preview_commissioning_voyage(p_voyage_id);
 if preview->>'ready'<>'true' then raise exception 'commissioning_preview_held: %',preview->'issues'; end if;
 if nullif(p_expected_draft_fingerprint,'') is null or p_expected_draft_fingerprint<>preview->>'draft_fingerprint'
 then raise exception 'commissioning_preview_stale_read_again'; end if;
 fp:=md5(concat_ws('|',p_expected_draft_fingerprint,op::text,pid,'private-test','server-first-v1'));
 project:=jsonb_build_object('id',pid,'name',trim(v.draft->>'name'),'namespace','bf.project.'||pid,'permanentNamespace','bf.project.'||pid,
  'description',coalesce(v.draft->>'description',v.draft->>'businessBrief',''),
  'businessBrief',jsonb_build_object('text',coalesce(v.draft->>'businessBrief',v.draft->>'description',''),'source','server-commissioning'),
  'projectCode',upper(coalesce(nullif(trim(v.draft->>'projectCode'),''),'NEW')),'orderPrefix',upper(coalesce(nullif(trim(v.draft->>'orderPrefix'),''),'NEW')),
  'businessType',coalesce(v.draft->>'businessType','service'),'type',coalesce(v.draft->>'businessType','service'),
  'status','development','visibility','private','approved',false,'published',false,'theme','commissioned',
  'characterLimit',coalesce(v.draft->'characterLimit','32'::jsonb),
  'customerExperience',jsonb_build_object('mode',coalesce(v.draft->>'customerMode','guided'),
    'relationshipType',coalesce(v.draft->>'relationshipType','service_request'),'photoRequired',v.draft->'photoRequired','contactCapture',v.draft->'contactCapture'),
  'visualPresentation',jsonb_build_object('profile',coalesce(v.draft->>'visualProfile','none')),
  'products',case when coalesce(v.draft->>'primaryOffer','')='' then '[]'::jsonb else jsonb_build_array(jsonb_build_object(
    'id','offer-'||substr(op::text,1,8),'name',v.draft->>'primaryOffer','active',true,'published',false,'customerReady',false,'pricingMode',coalesce(v.draft->>'pricingMode','manual'))) end,
  'ownerAccess',jsonb_build_object('enabled',false,'status','not_claimed','ownerName',coalesce(v.draft->>'ownerName',''),'ownerEmail',coalesce(v.draft->>'ownerEmail','')),
  'capabilities',jsonb_build_object('customerRetention',false,'notifications',false,'fleetLaunchService',false),
  'requestedCapabilities',jsonb_build_object('customerRetention',v.draft->'customerRetention','notifications',v.draft->'notifications','fleetLaunchService',v.draft->'launchService'),
  'serviceInstances','[]'::jsonb,'orders','[]'::jsonb,'customers','[]'::jsonb,'deployments','[]'::jsonb,'ledger','[]'::jsonb,
  'createdAt',now(),'updatedAt',now(),'commissioningVersion','8.8.20.29','forgePlan',v.draft->'forgePlan') ||
  jsonb_build_object('lifecycle',jsonb_build_object('state','draft','version',3,'updatedAt',now()),
   'registry',jsonb_build_object('version',1,'source','fleet-core-server-first','displayNameUnique',false),
   'commissioningAuthority',jsonb_build_object('role','admiral','identitySource','fleet-core','ownerAutomaticallyGranted',false,'ownerState','fleet_unassigned','build','8.8.20.29'),
   'serverCommission',jsonb_build_object('operationId',op,'voyageId',v.voyage_id,'previewFingerprint',fp,'testOnly',true));
 insert into public.fleet_commissioning_receipts(operation_id,voyage_id,actor_user_id,intended_project_id,preview_fingerprint,command_state,detail)
 values(op,v.voyage_id,auth.uid(),pid,fp,'prepared',jsonb_build_object('protocol','server-first-v1','build','8.8.20.29',
  'draft_fingerprint',p_expected_draft_fingerprint,'project_snapshot',project,'draft_snapshot',v.draft,'forge_snapshot',v.forge_truth,
  'auto_retry','forbidden','test_only',true,'canonical_vessel_exists',false));
 update public.fleet_commissioning_voyages set last_operation_id=op,project_id_hint=pid,updated_at=now() where voyage_id=v.voyage_id;
 insert into public.fleet_authority_audit(actor_user_id,action,authority_used,detail)
 values(auth.uid(),'server_first_commission_prepared','admiral',jsonb_build_object('operation_id',op,'voyage_id',v.voyage_id,'project_id',pid,'preview_fingerprint',fp,'vessel_created',false));
 return public.read_commissioning_operation(v.voyage_id,op);
end $$;
revoke all on function public.prepare_commissioning_operation(uuid,text) from public,anon;
grant execute on function public.prepare_commissioning_operation(uuid,text) to authenticated;

create or replace function public.commit_commissioning_operation(p_voyage_id uuid,p_operation_id uuid,p_expected_fingerprint text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v public.fleet_commissioning_voyages%rowtype; r public.fleet_commissioning_receipts%rowtype;
 f public.fleet_vessels%rowtype; project jsonb; settings jsonb;
begin
 perform fleet_private.require_commissioning_admiral();
 -- Reconciliation and all canonical commission writers share this lock. A delayed
 -- command cannot insert after an absent operation has been closed.
 lock table public.fleet_vessels in share row exclusive mode;
 select * into v from public.fleet_commissioning_voyages where voyage_id=p_voyage_id and actor_user_id=auth.uid() for update;
 if not found then raise exception 'exact_commissioning_voyage_required' using errcode='42501'; end if;
 select * into r from public.fleet_commissioning_receipts where operation_id=p_operation_id and voyage_id=v.voyage_id and actor_user_id=auth.uid() for update;
 if not found then raise exception 'exact_commissioning_receipt_required' using errcode='42501'; end if;
 if r.detail->>'protocol' is distinct from 'server-first-v1' then raise exception 'legacy_operation_is_not_replayable'; end if;
 if nullif(p_expected_fingerprint,'') is null or p_expected_fingerprint<>r.preview_fingerprint then raise exception 'commissioning_fingerprint_mismatch'; end if;
 if r.command_state='verified_created' then return public.read_commissioning_operation(v.voyage_id,r.operation_id); end if;
 if r.command_state<>'prepared' or r.detail->>'operation_closed'='true' or r.detail->>'retry_forbidden'='true'
 then raise exception 'commissioning_operation_closed_or_uncertain_do_not_retry'; end if;
 if v.status<>'active' or v.last_operation_id is distinct from r.operation_id then raise exception 'commissioning_voyage_operation_mismatch'; end if;
 if fleet_private.commissioning_draft_fingerprint(v.voyage_id) is distinct from r.detail->>'draft_fingerprint'
 then raise exception 'commissioning_draft_changed_reconcile_before_new_preview'; end if;
 project:=r.detail->'project_snapshot';
 if project->>'id' is distinct from r.intended_project_id or project->>'namespace' is distinct from 'bf.project.'||r.intended_project_id
 then raise exception 'commissioning_snapshot_identity_mismatch'; end if;
 insert into public.fleet_vessels(project_id,namespace,display_name,lifecycle_state,owner_state,commissioned_by,commissioning_authority,
  entry_path,ownership_model,operating_model,primary_owner_user_id,mission_class,display_name_status,mission_summary)
 values(r.intended_project_id,project->>'namespace',project->>'name','commissioning','fleet_unassigned',auth.uid(),'admiral',
  'admiral_commissioned','fleet_unassigned','fleet_operated',null,'independent_business','working',left(coalesce(project->>'description',''),500)) returning * into f;
 project:=project||jsonb_build_object('commissionedAt',f.commissioned_at,'serverVesselId',f.id);
 settings:=jsonb_build_object('schema','dark-sky-owner-business-settings-v1','projectId',f.project_id,
  'businessConfig',jsonb_build_object('name',f.display_name,'description',project->>'description','businessType',project->>'businessType','customerExperience',project->'customerExperience','products',project->'products'),
  'customization','{}'::jsonb,'notifications','{}'::jsonb,'syncedFrom','server-first-commissioning','syncedAt',now(),
  'commissioningBlueprint',jsonb_build_object('schema','black-flag-commissioning-blueprint-v1','project',project,'draft',r.detail->'draft_snapshot','forgeTruth',r.detail->'forge_snapshot'),
  'commissioning',jsonb_build_object('operation_id',r.operation_id,'voyage_id',v.voyage_id,'preview_fingerprint',r.preview_fingerprint,'test_only',true,'production_activation','blocked','agreement_verified',false));
 insert into public.fleet_business_settings(vessel_id,settings,updated_by) values(f.id,settings,auth.uid());
 insert into public.fleet_authority_audit(actor_user_id,vessel_id,action,authority_used,detail)
 values(auth.uid(),f.id,'server_first_vessel_commissioned','admiral',jsonb_build_object('operation_id',r.operation_id,'voyage_id',v.voyage_id,
  'project_id',f.project_id,'preview_fingerprint',r.preview_fingerprint,'test_only',true,'owner_membership_created',false,'entitlements_created',false,'published',false));
 update public.fleet_commissioning_receipts set command_state='verified_created',
  detail=detail||jsonb_build_object('canonical_vessel_exists',true,'vessel_id',f.id,'operation_closed',true,'retry_forbidden',true,'committed_at',now()),updated_at=now()
 where operation_id=r.operation_id;
 update public.fleet_commissioning_voyages set status='commissioned',safe_stage=7,updated_at=now() where voyage_id=v.voyage_id;
 return public.read_commissioning_operation(v.voyage_id,r.operation_id);
end $$;
revoke all on function public.commit_commissioning_operation(uuid,uuid,text) from public,anon;
grant execute on function public.commit_commissioning_operation(uuid,uuid,text) to authenticated;

create or replace function public.reconcile_commissioning_receipt(p_voyage_id uuid,p_operation_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.fleet_commissioning_receipts%rowtype; f public.fleet_vessels%rowtype; result jsonb; state text;
begin
 perform fleet_private.require_commissioning_admiral();
 lock table public.fleet_vessels in share row exclusive mode;
 perform 1 from public.fleet_commissioning_voyages where voyage_id=p_voyage_id and actor_user_id=auth.uid() for update;
 if not found then raise exception 'exact_commissioning_voyage_required' using errcode='42501'; end if;
 select * into r from public.fleet_commissioning_receipts where operation_id=p_operation_id and voyage_id=p_voyage_id and actor_user_id=auth.uid() for update;
 if not found then raise exception 'exact_commissioning_receipt_required' using errcode='42501'; end if;
 result:=public.read_commissioning_operation(p_voyage_id,p_operation_id);
 if r.detail->>'operation_closed'='true' then return result||jsonb_build_object('reconciled',true,'existing_closed_receipt',true); end if;
 state:=case when result->>'canonical_vessel_exists'='false' then 'verified_not_created'
  when result->>'canonical_matches_operation'='true' and result->>'blueprint_verified'='true' then 'verified_created' else 'outcome_uncertain' end;
 update public.fleet_commissioning_receipts set command_state=state,detail=detail||jsonb_build_object('reconciled_at',now(),
  'reconciled_from_state',r.command_state,'canonical_vessel_exists',(result->>'canonical_vessel_exists')::boolean,
  'reconciliation_basis','locked_canonical_vessel_and_bound_blueprint','operation_closed',state<>'outcome_uncertain','retry_forbidden',true),updated_at=now()
 where operation_id=p_operation_id;
 insert into public.fleet_authority_audit(actor_user_id,action,authority_used,detail)
 values(auth.uid(),'commissioning_operation_reconciled','admiral',jsonb_build_object('operation_id',p_operation_id,'voyage_id',p_voyage_id,
  'project_id',r.intended_project_id,'from_state',r.command_state,'to_state',state,'commission_command_issued',false));
 return public.read_commissioning_operation(p_voyage_id,p_operation_id)||jsonb_build_object('reconciled',true);
end $$;
revoke all on function public.reconcile_commissioning_receipt(uuid,uuid) from public,anon;
grant execute on function public.reconcile_commissioning_receipt(uuid,uuid) to authenticated;

-- Backward-compatible read surface; it can no longer manufacture receipt state.
create or replace function public.record_commissioning_receipt(p_voyage_id uuid,p_operation_id uuid,p_intended_project_id text,p_preview_fingerprint text,p_command_state text,p_detail jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.fleet_commissioning_receipts%rowtype;
begin
 perform fleet_private.require_commissioning_admiral();
 select * into r from public.fleet_commissioning_receipts where operation_id=p_operation_id and voyage_id=p_voyage_id and actor_user_id=auth.uid();
 if not found then raise exception 'client_receipt_writes_disabled_use_server_first_commissioning'; end if;
 if r.intended_project_id<>lower(trim(coalesce(p_intended_project_id,''))) or r.preview_fingerprint<>coalesce(p_preview_fingerprint,'')
  or r.command_state<>p_command_state then raise exception 'receipt_is_server_owned_read_or_reconcile_do_not_replay'; end if;
 return jsonb_build_object('recorded',false,'read_only',true,'operation_id',r.operation_id,'command_state',r.command_state);
end $$;
revoke all on function public.record_commissioning_receipt(uuid,uuid,text,text,text,jsonb) from public,anon;
grant execute on function public.record_commissioning_receipt(uuid,uuid,text,text,text,jsonb) to authenticated;

create or replace function public.save_commissioning_voyage(p_draft_key text,p_display_name text,p_project_id_hint text,p_safe_stage integer,p_draft jsonb,p_forge_truth jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); role_name text; v public.fleet_commissioning_voyages%rowtype;
begin
 role_name:=public.fleet_commissioning_authority_role();
 if actor is null or role_name is null then raise exception 'commissioning_authority_required' using errcode='42501'; end if;
 if nullif(trim(p_draft_key),'') is null or jsonb_typeof(p_draft) is distinct from 'object' or p_draft->>'draftId' is distinct from trim(p_draft_key)
 then raise exception 'commissioning_draft_identity_required'; end if;
 if p_safe_stage is null or p_safe_stage<1 or p_safe_stage>7 then raise exception 'safe_stage_invalid'; end if;
 if octet_length(p_draft::text)>524288 then raise exception 'commissioning_draft_too_large'; end if;
 perform pg_advisory_xact_lock(hashtextextended(actor::text,29));
 if exists(select 1 from public.fleet_commissioning_voyages where actor_user_id=actor and draft_key=trim(p_draft_key) and status='commissioned')
 then raise exception 'voyage_already_commissioned_read_existing_receipt'; end if;
 select * into v from public.fleet_commissioning_voyages where actor_user_id=actor and status='active' for update;
 if found then
  if v.draft_key<>trim(p_draft_key) then raise exception 'different_active_voyage_restore_or_discard_first'; end if;
  if exists(select 1 from public.fleet_commissioning_receipts where voyage_id=v.voyage_id and command_state not in ('verified_not_created','cancelled'))
  then raise exception 'operation_frozen_read_or_reconcile_before_editing'; end if;
  update public.fleet_commissioning_voyages set display_name=trim(coalesce(p_display_name,'')),safe_stage=p_safe_stage,
   draft=p_draft-'_serverReceipt'-'_serverCommitProof',forge_truth=coalesce(p_forge_truth,'{}'::jsonb),updated_at=now()
   where voyage_id=v.voyage_id returning * into v;
 else
  insert into public.fleet_commissioning_voyages(actor_user_id,draft_key,display_name,project_id_hint,safe_stage,draft,forge_truth)
  values(actor,trim(p_draft_key),trim(coalesce(p_display_name,'')),lower(trim(coalesce(p_project_id_hint,''))),p_safe_stage,p_draft-'_serverReceipt'-'_serverCommitProof',coalesce(p_forge_truth,'{}'::jsonb)) returning * into v;
 end if;
 return jsonb_build_object('voyage_id',v.voyage_id,'status',v.status,'safe_stage',v.safe_stage,'updated_at',v.updated_at,'authority_role',role_name);
end $$;

create or replace function public.read_active_commissioning_voyage()
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); role_name text; v public.fleet_commissioning_voyages%rowtype; receipt jsonb;
begin
 role_name:=public.fleet_commissioning_authority_role();
 if actor is null or role_name is null then raise exception 'commissioning_authority_required' using errcode='42501'; end if;
 select * into v from public.fleet_commissioning_voyages where actor_user_id=actor and status in ('active','commissioned')
  order by (status='active') desc,updated_at desc limit 1;
 if not found then return jsonb_build_object('found',false,'authority_role',role_name); end if;
 select to_jsonb(r)-'actor_user_id'-'detail'||jsonb_build_object('detail',r.detail-'draft_snapshot'-'forge_snapshot'-'project_snapshot') into receipt
  from public.fleet_commissioning_receipts r where r.voyage_id=v.voyage_id order by (r.operation_id=v.last_operation_id) desc,r.created_at desc limit 1;
 return jsonb_build_object('found',true,'status',v.status,'voyage_id',v.voyage_id,'draft_key',v.draft_key,'display_name',v.display_name,
  'project_id_hint',v.project_id_hint,'safe_stage',v.safe_stage,'draft',v.draft,'forge_truth',v.forge_truth,'updated_at',v.updated_at,
  'receipt',receipt,'authority_role',role_name,'observed_at',clock_timestamp());
end $$;

create or replace function public.discard_active_commissioning_voyage(p_voyage_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or public.fleet_commissioning_authority_role() is null then raise exception 'commissioning_authority_required' using errcode='42501'; end if;
 perform 1 from public.fleet_commissioning_voyages where voyage_id=p_voyage_id and actor_user_id=auth.uid() and status='active' for update;
 if not found then raise exception 'active_voyage_not_found'; end if;
 if exists(select 1 from public.fleet_commissioning_receipts where voyage_id=p_voyage_id and command_state not in ('verified_not_created','cancelled'))
 then raise exception 'operation_frozen_reconcile_before_discard'; end if;
 update public.fleet_commissioning_voyages set status='discarded',updated_at=now() where voyage_id=p_voyage_id;
 return jsonb_build_object('discarded',true,'voyage_id',p_voyage_id);
end $$;

revoke all on function public.save_commissioning_voyage(text,text,text,integer,jsonb,jsonb),
 public.read_active_commissioning_voyage(), public.discard_active_commissioning_voyage(uuid) from public,anon;
grant execute on function public.save_commissioning_voyage(text,text,text,integer,jsonb,jsonb),
 public.read_active_commissioning_voyage(), public.discard_active_commissioning_voyage(uuid) to authenticated;
notify pgrst,'reload schema';

-- Final already-installed guard: migration 20261005012853.
-- Used by Ironbound 8.8.20.30. No real draft is edited by these definitions.
create or replace function fleet_private.guard_test_commission_departure()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.lifecycle_state='active' and old.lifecycle_state is distinct from 'active'
  and exists(select 1 from public.fleet_business_settings s where s.vessel_id=new.id
   and s.settings->'commissioning'->>'test_only'='true')
 then raise exception 'test_commission_cannot_depart_production_review_required'; end if;
 return new;
end $$;
revoke all on function fleet_private.guard_test_commission_departure() from public,anon,authenticated;
drop trigger if exists ironbound_test_commission_departure_guard on public.fleet_vessels;
create trigger ironbound_test_commission_departure_guard before update of lifecycle_state on public.fleet_vessels
 for each row execute function fleet_private.guard_test_commission_departure();
create or replace function public.preview_commissioning_voyage(p_voyage_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v public.fleet_commissioning_voyages%rowtype; r public.fleet_commissioning_receipts%rowtype;
 issues text[]:=array[]::text[]; brief text;
begin
 perform fleet_private.require_commissioning_admiral();
 select * into v from public.fleet_commissioning_voyages where voyage_id=p_voyage_id and actor_user_id=auth.uid();
 if not found then raise exception 'exact_commissioning_voyage_required' using errcode='42501'; end if;
 select * into r from public.fleet_commissioning_receipts where voyage_id=v.voyage_id and actor_user_id=auth.uid()
  order by (operation_id=v.last_operation_id) desc,created_at desc limit 1;
 if v.status<>'active' then issues:=array_append(issues,'Voyage is already commissioned or closed. Read its existing operation.'); end if;
 if v.safe_stage<>7 then issues:=array_append(issues,'Save the exact voyage at Step 7 before preparation.'); end if;
 if length(trim(coalesce(v.draft->>'name','')))<2 or length(trim(coalesce(v.draft->>'name','')))>80
 then issues:=array_append(issues,'Business name must contain 2 to 80 characters.'); end if;
 if jsonb_typeof(v.draft->'forgePlan') is distinct from 'object' then issues:=array_append(issues,'A reviewed Forge Plan is required.'); end if;
 if jsonb_typeof(v.forge_truth->'conflicts')='array' and jsonb_array_length(v.forge_truth->'conflicts')>0
 then issues:=array_append(issues,'Resolve the saved Forge conflicts before commissioning.'); end if;
 if v.draft->'forgePlan'->'photoRequired' is distinct from v.draft->'photoRequired'
 then issues:=array_append(issues,'Photo requirement must match the reviewed Forge Plan.'); end if;
 brief:=lower(coalesce(v.draft->>'businessBrief',v.draft->>'description',''));
 if brief ~ '(no|without)[[:space:]]+(customer[[:space:]]+)?(photo|photos|picture|pictures|image|images)([[:space:]]+(is|are))?[[:space:]]*(required|needed|necessary)?|(photo|photos|picture|pictures|image|images)[[:space:]]+(is[[:space:]]+|are[[:space:]]+)?not[[:space:]]+(required|needed|necessary)'
  and (v.draft->>'photoRequired'='true' or v.draft->'forgePlan'->>'photoRequired'='true')
 then issues:=array_append(issues,'The saved brief says no photo is required. Confirm the no-photo correction before commissioning.'); end if;
 if exists(select 1 from public.fleet_commissioning_receipts where voyage_id=v.voyage_id and command_state not in ('verified_not_created','cancelled'))
 then issues:=array_append(issues,'Read or reconcile the existing operation. A new operation is blocked.'); end if;
 return jsonb_build_object('schema','server-first-preview-v1','voyage_id',v.voyage_id,'draft_key',v.draft_key,
  'display_name',trim(v.draft->>'name'),'draft_fingerprint',fleet_private.commissioning_draft_fingerprint(v.voyage_id),
  'ready',cardinality(issues)=0,'issues',to_jsonb(issues),
  'receipt',case when r.operation_id is null then null else to_jsonb(r)-'actor_user_id'-'detail'||jsonb_build_object('detail',r.detail-'project_snapshot'-'draft_snapshot'-'forge_snapshot') end,
  'test_only',true,'live',false,'owner_membership_created',false,'entitlements_created',false,'auto_retry','forbidden',
  'status',v.status,'observed_at',clock_timestamp());
end $$;
revoke all on function public.preview_commissioning_voyage(uuid) from public,anon;
grant execute on function public.preview_commissioning_voyage(uuid) to authenticated;
notify pgrst,'reload schema';

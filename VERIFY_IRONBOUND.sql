-- Optional maintainer regression test. Run only after SUPABASE_IRONBOUND_882029.sql.
-- Synthetic identities only. The inner block rolls back all fixture rows on PASS.
-- Any unexpected error aborts the statement, which also rolls back its fixture rows.
-- Does NOT exercise or retry any real commissioning operation.
do $test$
declare a uuid:=gen_random_uuid(); v uuid; op uuid; old_op uuid; pid text; old_pid text;
 fp text; d jsonb; ft jsonb; r jsonb; p jsonb; n integer;
begin
 select count(*) into n from public.fleet_vessels;
 begin
  insert into auth.users(id,aud,role,email) values(a,'authenticated','authenticated','ironbound-test-'||a::text||'@example.invalid');
  insert into public.fleet_global_authorities(user_id,authority_role,active) values(a,'admiral',true);
  perform set_config('request.jwt.claim.sub',a::text,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated')::text,true);
  d:=jsonb_build_object('draftId','ironbound-'||a::text,'name','Ironbound rollback fixture','businessType','service','primaryOffer','Service Visit','photoRequired',false,'forgePlan',jsonb_build_object('offer','Service Visit','photoRequired',false),'_step',7);
  ft:=jsonb_build_object('build','8.8.20.29','stage',7,'forgePlan',d->'forgePlan','conflicts','[]'::jsonb);
  r:=public.save_commissioning_voyage(d->>'draftId',d->>'name','',7,d,ft);v:=(r->>'voyage_id')::uuid;
  p:=public.preview_commissioning_voyage(v);assert p->>'ready'='true','ready saved voyage';
  r:=public.prepare_commissioning_operation(v,p->>'draft_fingerprint');op:=(r->>'operation_id')::uuid;pid:=r->>'intended_project_id';fp:=r->>'preview_fingerprint';old_op:=op;old_pid:=pid;
  assert r->>'canonical_vessel_exists'='false' and (select count(*) from public.fleet_vessels)=n,'prepare creates no vessel';
  begin perform public.save_commissioning_voyage(d->>'draftId',d->>'name','',7,d,ft);raise exception 'TEST_FAILED_edit_not_frozen';exception when others then if SQLERRM<>'operation_frozen_read_or_reconcile_before_editing' then raise;end if;end;
  r:=public.reconcile_commissioning_receipt(v,op);assert r->>'command_state'='verified_not_created','reconcile absent without creating';
  begin perform public.commit_commissioning_operation(v,op,fp);raise exception 'TEST_FAILED_closed_replay';exception when others then if SQLERRM<>'commissioning_operation_closed_or_uncertain_do_not_retry' then raise;end if;end;
  p:=public.preview_commissioning_voyage(v);r:=public.prepare_commissioning_operation(v,p->>'draft_fingerprint');op:=(r->>'operation_id')::uuid;pid:=r->>'intended_project_id';fp:=r->>'preview_fingerprint';
  assert op<>old_op and pid<>old_pid,'new immutable operation and project';
  r:=public.commit_commissioning_operation(v,op,fp);
  assert r->>'command_state'='verified_created' and r->>'canonical_matches_operation'='true' and r->>'blueprint_verified'='true','atomic vessel and bound blueprint';
  r:=public.read_commissioning_operation(v,op);assert r->>'blueprint_verified'='true','independent server read';
  assert r->'project'->>'published'='false' and r->'vessel'->>'lifecycle_state'='commissioning','private test only';
  assert r->'handoff'->>'membership_count'='0' and r->'handoff'->>'entitlement_count'='0','no authority or feature grants';
  r:=public.commit_commissioning_operation(v,op,fp);assert (select count(*) from public.fleet_vessels)=n+1,'duplicate delivery cannot duplicate vessel';
  r:=public.read_active_commissioning_voyage();assert r->>'status'='commissioned','completed voyage recoverable';
  begin perform public.save_commissioning_voyage(d->>'draftId',d->>'name','',7,d,ft);raise exception 'TEST_FAILED_late_save';exception when others then if SQLERRM<>'voyage_already_commissioned_read_existing_receipt' then raise;end if;end;
  update public.fleet_global_authorities set active=false where user_id=a;
  begin perform public.read_commissioning_operation(v,op);raise exception 'TEST_FAILED_revoked_access';exception when insufficient_privilege then null;end;
  raise exception 'Roll back successful fixtures' using errcode='PZ029';
 exception when sqlstate 'PZ029' then null;
 end;
 assert not exists(select 1 from auth.users where id=a),'no fixture account remains';
 assert (select count(*) from public.fleet_vessels)=n,'no fixture vessel remains';
 assert not has_function_privilege('anon','public.commit_commissioning_operation(uuid,uuid,text)','EXECUTE'),'anonymous execute denied';
end $test$;
select 'PASS' as ironbound_reproducible_server_test,'All synthetic fixture rows rolled back; no real operation retried' as scope;

-- 8.8.20.30 guard regression. Same synthetic-only rollback boundary.
do $test$
declare a uuid:=gen_random_uuid(); v uuid; op uuid; f uuid; n integer;
 d jsonb; ft jsonb; r jsonb; p jsonb;
begin
 select count(*) into n from public.fleet_vessels;
 begin
  insert into auth.users(id,aud,role,email) values(a,'authenticated','authenticated','ironbound-test-'||a::text||'@example.invalid');
  insert into public.fleet_global_authorities(user_id,authority_role,active) values(a,'admiral',true);
  perform set_config('request.jwt.claim.sub',a::text,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated')::text,true);
  d:=jsonb_build_object('draftId','photo-guard-fixture-'||a::text,'name','Ironbound no-photo rollback fixture','businessBrief','No photo required. Scheduling as needed.','businessType','service','primaryOffer','Service Visit','photoRequired',true,'forgePlan',jsonb_build_object('offer','Service Visit','photoRequired',true),'_step',7);
  ft:=jsonb_build_object('build','8.8.20.30','stage',7,'forgePlan',d->'forgePlan','conflicts','[]'::jsonb);
  r:=public.save_commissioning_voyage(d->>'draftId',d->>'name','',7,d,ft);v:=(r->>'voyage_id')::uuid;
  p:=public.preview_commissioning_voyage(v);
  assert p->>'ready'='false','server rejects actual brief mismatch even with empty client conflicts';
  begin perform public.prepare_commissioning_operation(v,p->>'draft_fingerprint');raise exception 'TEST_FAILED_unreviewed_photo_plan_prepared';
  exception when others then if SQLERRM not like 'commissioning_preview_held:%' then raise;end if;end;
  assert not exists(select 1 from public.fleet_commissioning_receipts where voyage_id=v),'blocked preview creates no operation';
  d:=jsonb_set(jsonb_set(d,'{photoRequired}','false'::jsonb),'{forgePlan,photoRequired}','false'::jsonb);
  ft:=jsonb_set(ft,'{forgePlan}',d->'forgePlan');
  r:=public.save_commissioning_voyage(d->>'draftId',d->>'name','',7,d,ft);
  r:=public.read_active_commissioning_voyage();
  assert r->'draft'->>'photoRequired'='false' and r->'draft'->'forgePlan'->>'photoRequired'='false','corrected photo draft reads back';
  p:=public.preview_commissioning_voyage(v);assert p->>'ready'='true','corrected brief passes server preview';
  r:=public.prepare_commissioning_operation(v,p->>'draft_fingerprint');op:=(r->>'operation_id')::uuid;
  assert (select count(*) from public.fleet_vessels)=n,'preparation creates no vessel';
  r:=public.commit_commissioning_operation(v,op,r->>'preview_fingerprint');r:=public.read_commissioning_operation(v,op);
  assert r->>'command_state'='verified_created' and r->>'blueprint_verified'='true' and r->>'canonical_matches_operation'='true','one synthetic commission independently verified';
  assert r->'project'->'customerExperience'->>'photoRequired'='false','blueprint preserves corrected no-photo setting';
  f:=(r->'vessel'->>'id')::uuid;
  begin update public.fleet_vessels set lifecycle_state='active' where id=f;raise exception 'TEST_FAILED_test_vessel_activated';
  exception when others then if SQLERRM<>'test_commission_cannot_depart_production_review_required' then raise;end if;end;
  assert (select lifecycle_state from public.fleet_vessels where id=f)='commissioning','test vessel cannot activate';
  assert r->'handoff'->>'membership_count'='0' and r->'handoff'->>'entitlement_count'='0','no authority or feature grants';
  raise exception 'Roll back all synthetic fixtures' using errcode='PZ030';
 exception when sqlstate 'PZ030' then null;
 end;
 assert not exists(select 1 from auth.users where id=a),'fixture account rolled back';
 assert (select count(*) from public.fleet_vessels)=n,'fixture vessel rolled back';
end $test$;
select 'PASS' as no_photo_and_test_boundary_regression,'Synthetic fixtures rolled back. No real voyage saved, prepared, commissioned, or retried.' as scope;

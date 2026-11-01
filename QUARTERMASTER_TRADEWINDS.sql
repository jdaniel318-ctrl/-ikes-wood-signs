-- Trade Winds 8.8.20.76: additive, opt-in Quartermaster cloud workspaces.
-- No existing business, authority, membership or session record is modified.
create table fleet_private.quartermaster_workspaces (
 scope jsonb primary key,
 workspace jsonb not null,
 cloud_revision bigint not null check(cloud_revision > 0),
 saved_at timestamptz not null default now()
);
create table fleet_private.quartermaster_receipts (
 scope jsonb not null references fleet_private.quartermaster_workspaces(scope),
 operation_id uuid not null,
 request_hash text not null,
 cloud_revision bigint not null,
 workspace_revision bigint not null,
 saved_at timestamptz not null default now(),
 primary key(scope,operation_id)
);
alter table fleet_private.quartermaster_workspaces enable row level security;
alter table fleet_private.quartermaster_receipts enable row level security;
revoke all on fleet_private.quartermaster_workspaces,fleet_private.quartermaster_receipts from public,anon,authenticated;

create function fleet_private.qm_keys(v jsonb, names text[]) returns void language plpgsql immutable set search_path='' as $$
begin
 if jsonb_typeof(v) is distinct from 'object' then raise exception 'quartermaster_invalid_object'; end if;
 if (select array_agg(k order by k) from jsonb_object_keys(v) k) is distinct from (select array_agg(k order by k) from unnest(names) k) then raise exception 'quartermaster_invalid_fields'; end if;
end $$;
create function fleet_private.qm_text(v jsonb,k text,lim integer,blank boolean default true) returns text language plpgsql immutable set search_path='' as $$
declare s text:=v->>k;
begin
 if jsonb_typeof(v->k) is distinct from 'string' or length(s)>lim or (not blank and btrim(s)='') or s ~ '[\x01-\x08\x0B\x0C\x0E-\x1F]' then raise exception 'quartermaster_invalid_text_%',k; end if;
 return s;
end $$;
create function fleet_private.qm_integer(v jsonb,minimum bigint default 0) returns bigint language plpgsql immutable set search_path='' as $$
declare n numeric;
begin
 if jsonb_typeof(v) is distinct from 'number' or v::text !~ '^[0-9]+$' then raise exception 'quartermaster_invalid_integer'; end if;
 n:=v::text::numeric;if n<minimum or n>9007199254740991 then raise exception 'quartermaster_unsafe_integer';end if;return n::bigint;
end $$;
create function fleet_private.qm_decimal(v jsonb,places integer,positive boolean default false) returns numeric language plpgsql immutable set search_path='' as $$
declare s text:=v#>>'{}';n numeric;
begin
 if jsonb_typeof(v) is distinct from 'string' or length(s)>40 or s !~ ('^[0-9]+(\.[0-9]{1,'||places||'})?$') then raise exception 'quartermaster_invalid_decimal';end if;
 n:=s::numeric;if n*power(10::numeric,places)>9007199254740991 or positive and n=0 then raise exception 'quartermaster_unsafe_decimal';end if;return n;
end $$;
create function fleet_private.qm_timestamp(v jsonb) returns void language plpgsql immutable set search_path='' as $$
begin
 if jsonb_typeof(v) is distinct from 'string' or length(v#>>'{}')>40 or (v#>>'{}') !~ '^\d{4}-\d{2}-\d{2}T' then raise exception 'quartermaster_invalid_timestamp';end if;
 perform (v#>>'{}')::timestamptz;
end $$;
create function fleet_private.qm_business(v jsonb,id text) returns void language plpgsql immutable set search_path='' as $$
declare k text;p text;
begin
 perform fleet_private.qm_keys(v,array['id','name','prefix','address','email','phone']);
 if v->>'id' is distinct from id then raise exception 'quartermaster_business_scope';end if;
 foreach k in array array['name','prefix','email','phone'] loop perform fleet_private.qm_text(v,k,256);end loop;
 perform fleet_private.qm_text(v,'address',4000);p:=v->>'prefix';
 if p<>'' and p !~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,19}$' then raise exception 'quartermaster_invalid_prefix';end if;
end $$;
create function fleet_private.qm_require_scope(s jsonb) returns void language plpgsql stable security definer set search_path='' as $$
declare u uuid:=auth.uid(); sid uuid;
begin
 if u is null or not exists(select 1 from public.fleet_global_authorities a where a.user_id=u and a.authority_role='admiral' and a.active and a.revoked_at is null) then raise exception 'quartermaster_active_admiral_required' using errcode='42501';end if;
 sid:=nullif(auth.jwt()->>'session_id','')::uuid;
 if sid is null or not exists(select 1 from auth.sessions a where a.id=sid and a.user_id=u and (a.not_after is null or a.not_after>now())) then raise exception 'quartermaster_active_session_required' using errcode='42501';end if;
 perform fleet_private.qm_keys(s,array['accountId','backend','environment','site','businessId']);
 if s->>'accountId' is distinct from u::text or s->>'backend' is distinct from 'https://sjgqqtnuttnkwsoebbqf.supabase.co' or s->>'environment' is distinct from 'staging' or s->>'site' is distinct from 'https://jdaniel318-ctrl.github.io/-ikes-wood-signs/' then raise exception 'quartermaster_scope_mismatch' using errcode='42501';end if;
 if s->>'businessId' is distinct from 'planned:househull-exterior' and not exists(select 1 from public.fleet_vessels v where v.project_id=s->>'businessId' and v.mission_class<>'admiral_program') then raise exception 'quartermaster_business_unavailable' using errcode='42501';end if;
end $$;

create function fleet_private.qm_validate_workspace(w jsonb,s jsonb,old jsonb default null) returns void language plpgsql set search_path='' as $$
declare c jsonb;d jsonb;l jsonb;o jsonb;x jsonb;prior jsonb;k text;sub numeric;tax numeric;rate numeric;q numeric;p numeric;v bigint;n bigint;num text;defkeys text[]:=array['kind','code','description','specification','packageDescription','manufacturerPart','supplierSku','unit'];
begin
 if octet_length(w::text)>5242880 then raise exception 'quartermaster_cloud_capacity_5_MiB';end if;
 perform fleet_private.qm_keys(w,array['schema','scope','revision','installationId','business','catalog','documents','operations','counters','createdAt','updatedAt']);
 if w->'scope' is distinct from s or w->'schema' is distinct from '1'::jsonb then raise exception 'quartermaster_workspace_scope';end if;
 perform fleet_private.qm_integer(w->'revision');perform fleet_private.qm_text(w,'installationId',128,false);
 if w->>'installationId' !~* '^([0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$' then raise exception 'quartermaster_installation';end if;
 perform fleet_private.qm_timestamp(w->'createdAt');perform fleet_private.qm_timestamp(w->'updatedAt');perform fleet_private.qm_business(w->'business',s->>'businessId');
 foreach k in array array['catalog','documents','operations'] loop if jsonb_typeof(w->k) is distinct from 'array' or jsonb_array_length(w->k)>100000 then raise exception 'quartermaster_invalid_collection';end if;end loop;
 perform fleet_private.qm_keys(w->'counters',array['material','service','quote','invoice']);
 foreach k in array array['material','service','quote','invoice'] loop v:=fleet_private.qm_integer(w->'counters'->k);if old is not null and v<fleet_private.qm_integer(old->'counters'->k) then raise exception 'quartermaster_counter_regression';end if;end loop;
 if old is not null then
  if w->'scope'<>old->'scope' or w->'installationId'<>old->'installationId' or w->'createdAt'<>old->'createdAt' or fleet_private.qm_integer(w->'revision')<>fleet_private.qm_integer(old->'revision')+1 then raise exception 'quartermaster_revision_or_identity_conflict';end if;
  foreach k in array array['catalog','documents','operations'] loop
   for prior in select value from jsonb_array_elements(old->k) loop
    select value into x from jsonb_array_elements(w->k) where value->>'id'=prior->>'id';
    if x is null then raise exception 'quartermaster_history_removal';end if;
    if k='operations' and x<>prior then raise exception 'quartermaster_immutable_operation';end if;
    if k='documents' and prior->>'status'='finalized' and x<>prior then raise exception 'quartermaster_immutable_finalized_document';end if;
    if k in ('catalog','documents') then
     if x->'createdAt'<>prior->'createdAt' or (x<>prior and fleet_private.qm_integer(x->'revision')<>fleet_private.qm_integer(prior->'revision')+1) then raise exception 'quartermaster_item_revision_conflict';end if;
     if k='catalog' and x->'code'<>prior->'code' then raise exception 'quartermaster_stable_catalog_code';end if;
     if k='documents' and (x->'number'<>prior->'number' or x->'type'<>prior->'type' or x->'quoteReference'<>prior->'quoteReference') then raise exception 'quartermaster_document_identity_conflict';end if;
    end if;
   end loop;
  end loop;
 end if;
 foreach k in array array['catalog','documents','operations'] loop
  if (select count(*) from jsonb_array_elements(w->k))<>(select count(distinct value->>'id') from jsonb_array_elements(w->k)) then raise exception 'quartermaster_duplicate_identity';end if;
 end loop;
 if (select count(*) from jsonb_array_elements(w->'catalog'))<>(select count(distinct upper(value->>'code')) from jsonb_array_elements(w->'catalog')) or (select count(*) from jsonb_array_elements(w->'documents'))<>(select count(distinct upper(value->>'number')) from jsonb_array_elements(w->'documents')) then raise exception 'quartermaster_duplicate_number';end if;
 for c in select value from jsonb_array_elements(w->'catalog') loop
  perform fleet_private.qm_keys(c,array['id','revision','code','kind','description','specification','unit','packageDescription','unitPrice','cost','manufacturerPart','supplier','supplierSku','active','createdAt','updatedAt']);
  perform fleet_private.qm_text(c,'id',128,false);perform fleet_private.qm_integer(c->'revision',1);
  if c->>'kind' not in ('material','service') or jsonb_typeof(c->'active') is distinct from 'boolean' then raise exception 'quartermaster_catalog_kind';end if;
  foreach k in array array['code','unit'] loop perform fleet_private.qm_text(c,k,128,false);end loop;
  perform fleet_private.qm_text(c,'description',4000,false);
  foreach k in array array['specification','packageDescription'] loop perform fleet_private.qm_text(c,k,4000);end loop;
  foreach k in array array['kind','manufacturerPart','supplier','supplierSku'] loop perform fleet_private.qm_text(c,k,256);end loop;
  foreach k in array array['unitPrice','cost'] loop if fleet_private.qm_text(c,k,40)<>'' then perform fleet_private.qm_decimal(c->k,2);end if;end loop;
  perform fleet_private.qm_timestamp(c->'createdAt');perform fleet_private.qm_timestamp(c->'updatedAt');
  if old is not null and not exists(select 1 from jsonb_array_elements(old->'catalog') t where t.value->>'id'=c->>'id') and c->'revision'<>'1'::jsonb then raise exception 'quartermaster_new_item_revision';end if;
 end loop;
 for d in select value from jsonb_array_elements(w->'documents') loop
  perform fleet_private.qm_keys(d,array['id','type','number','revision','status','business','customer','job','issueDate','dueDate','validUntil','terms','notes','taxRate','taxConfirmed','lines','totals','quoteReference','isSample','createdAt','updatedAt','finalizedAt']);
  foreach k in array array['id','type','number','status'] loop perform fleet_private.qm_text(d,k,160,false);end loop;
  perform fleet_private.qm_integer(d->'revision',1);
  if d->>'type' not in ('quote','invoice') or d->>'status' not in ('draft','finalized') then raise exception 'quartermaster_document_type';end if;
  perform fleet_private.qm_business(d->'business',s->>'businessId');
  perform fleet_private.qm_keys(d->'customer',array['name','address','email','phone']);perform fleet_private.qm_keys(d->'job',array['name','address']);
  foreach k in array array['name','email','phone'] loop perform fleet_private.qm_text(d->'customer',k,256);end loop;
  perform fleet_private.qm_text(d->'customer','address',4000);perform fleet_private.qm_text(d->'job','name',256);perform fleet_private.qm_text(d->'job','address',4000);
  foreach k in array array['issueDate','dueDate','validUntil'] loop num:=fleet_private.qm_text(d,k,10);if num<>'' and (num !~ '^\d{4}-\d{2}-\d{2}$' or (num::date)::text<>num) then raise exception 'quartermaster_document_date';end if;end loop;
  perform fleet_private.qm_text(d,'terms',10000);perform fleet_private.qm_text(d,'notes',20000);
  perform fleet_private.qm_timestamp(d->'createdAt');perform fleet_private.qm_timestamp(d->'updatedAt');
  if jsonb_typeof(d->'taxConfirmed') is distinct from 'boolean' or jsonb_typeof(d->'isSample') is distinct from 'boolean' then raise exception 'quartermaster_document_flags';end if;
  num:=fleet_private.qm_text(d,'taxRate',40);rate:=case when num='' then 0 else fleet_private.qm_decimal(d->'taxRate',3) end;
  if jsonb_typeof(d->'lines') is distinct from 'array' or jsonb_array_length(d->'lines')>10000 then raise exception 'quartermaster_document_lines';end if;
  if (select count(*) from jsonb_array_elements(d->'lines'))<>(select count(distinct value->>'id') from jsonb_array_elements(d->'lines')) then raise exception 'quartermaster_duplicate_line';end if;
  sub:=0;
  for l in select value from jsonb_array_elements(d->'lines') loop
   perform fleet_private.qm_keys(l,array['id','itemId','itemRevision','kind','code','description','specification','packageDescription','manufacturerPart','supplierSku','quantity','unit','unitPrice']);
   perform fleet_private.qm_text(l,'id',128,false);perform fleet_private.qm_text(l,'itemId',128,false);perform fleet_private.qm_integer(l->'itemRevision',1);
   foreach k in array defkeys loop perform fleet_private.qm_text(l,k,case when k in ('description','specification','packageDescription') then 4000 else 256 end,k not in ('code','description','unit'));end loop;
   select value into c from jsonb_array_elements(w->'catalog') where value->>'id'=l->>'itemId';
   if c is null or fleet_private.qm_integer(l->'itemRevision')>fleet_private.qm_integer(c->'revision') or l->>'kind' not in ('material','service') then raise exception 'quartermaster_line_item_scope';end if;
   if c->'revision'=l->'itemRevision' then foreach k in array defkeys loop if l->k<>c->k then raise exception 'quartermaster_catalog_snapshot_mismatch';end if;end loop;end if;
   q:=fleet_private.qm_decimal(l->'quantity',4,true);p:=fleet_private.qm_decimal(l->'unitPrice',2);sub:=sub+round(q*p*100);
   if d->>'status'='finalized' and l->>'kind'='material' and btrim(l->>'packageDescription')='' then raise exception 'quartermaster_final_material_package';end if;
  end loop;
  tax:=round(sub*rate/100);
  perform fleet_private.qm_keys(d->'totals',array['subtotalCents','taxCents','totalCents']);
  if fleet_private.qm_integer(d->'totals'->'subtotalCents')<>sub or fleet_private.qm_integer(d->'totals'->'taxCents')<>tax or fleet_private.qm_integer(d->'totals'->'totalCents')<>sub+tax then raise exception 'quartermaster_totals_mismatch';end if;
  if d->>'status'='finalized' then
   perform fleet_private.qm_timestamp(d->'finalizedAt');
   if btrim(d->'business'->>'name')='' or btrim(d->'customer'->>'name')='' or d->>'issueDate'='' or jsonb_array_length(d->'lines')=0 or d->'taxConfirmed'<>'true'::jsonb or d->>'taxRate'='' then raise exception 'quartermaster_incomplete_final';end if;
  elsif d->'finalizedAt'<>'null'::jsonb then raise exception 'quartermaster_draft_final_time';end if;
  if d->'quoteReference'<>'null'::jsonb then
   perform fleet_private.qm_keys(d->'quoteReference',array['id','number','revision']);
   if d->>'type'<>'invoice' or not exists(select 1 from jsonb_array_elements(w->'documents') a where a.value->>'id'=d->'quoteReference'->>'id' and a.value->>'type'='quote' and a.value->>'status'='finalized' and a.value->'number'=d->'quoteReference'->'number' and a.value->'revision'=d->'quoteReference'->'revision') then raise exception 'quartermaster_quote_reference';end if;
  end if;
  num:=d->>'number';
  if num !~ ('^[A-Z0-9][A-Z0-9_-]{0,19}-'||case when d->>'type'='quote' then 'QTE' else 'INV' end||'-[0-9]{4}-L'||upper(replace(w->>'installationId','-',''))||'-[0-9]{6,}$') then raise exception 'quartermaster_document_series';end if;
  n:=substring(num from '([0-9]+)$')::bigint;if n<1 or n>fleet_private.qm_integer(w->'counters'->(d->>'type')) then raise exception 'quartermaster_document_counter';end if;
  if (select count(*) from jsonb_array_elements(w->'operations') a where a.value->>'documentId'=d->>'id' and a.value->>'kind'='createDocument')<>1 or (select count(*) from jsonb_array_elements(w->'operations') a where a.value->>'documentId'=d->>'id' and a.value->>'kind'='finalizeDocument')<>(case when d->>'status'='finalized' then 1 else 0 end) then raise exception 'quartermaster_document_history';end if;
  if old is not null and not exists(select 1 from jsonb_array_elements(old->'documents') a where a.value->>'id'=d->>'id') and (d->'revision'<>'1'::jsonb or d->>'status'<>'draft') then raise exception 'quartermaster_new_document_revision';end if;
 end loop;
 -- One definition per item revision, anchored to saved history and the current catalog.
 -- Group once: validating each line by scanning all other lines is quadratic.
 if exists(select 1 from (
 select jsonb_build_array(v.value->'id',v.value->'revision') as identity,jsonb_build_array(v.value->'kind',v.value->'code',v.value->'description',v.value->'specification',v.value->'packageDescription',v.value->'manufacturerPart',v.value->'supplierSku',v.value->'unit') as definition,true as anchored from jsonb_array_elements(w->'catalog') v
 union all
 select jsonb_build_array(v.value->'id',v.value->'revision') as identity,jsonb_build_array(v.value->'kind',v.value->'code',v.value->'description',v.value->'specification',v.value->'packageDescription',v.value->'manufacturerPart',v.value->'supplierSku',v.value->'unit') as definition,true as anchored from jsonb_array_elements(old->'catalog') v
 union all
 select jsonb_build_array(v.value->'itemId',v.value->'itemRevision') as identity,jsonb_build_array(v.value->'kind',v.value->'code',v.value->'description',v.value->'specification',v.value->'packageDescription',v.value->'manufacturerPart',v.value->'supplierSku',v.value->'unit') as definition,true as anchored from jsonb_array_elements(old->'documents') dd cross join lateral jsonb_array_elements(dd.value->'lines') v
 union all
 select jsonb_build_array(v.value->'itemId',v.value->'itemRevision') as identity,jsonb_build_array(v.value->'kind',v.value->'code',v.value->'description',v.value->'specification',v.value->'packageDescription',v.value->'manufacturerPart',v.value->'supplierSku',v.value->'unit') as definition,false as anchored from jsonb_array_elements(w->'documents') dd cross join lateral jsonb_array_elements(dd.value->'lines') v
 ) definitions group by identity having count(distinct definition)>1 or (old is not null and not bool_or(anchored))) then
  raise exception 'quartermaster_conflicting_historical_snapshot';
 end if;
 for o in select value from jsonb_array_elements(w->'operations') loop
  perform fleet_private.qm_keys(o,array['id','kind','request','documentId']);perform fleet_private.qm_text(o,'id',160,false);perform fleet_private.qm_text(o,'documentId',160,false);perform fleet_private.qm_text(o,'kind',160,false);
  select value into d from jsonb_array_elements(w->'documents') where value->>'id'=o->>'documentId';
  if d is null or o->>'kind' not in ('createDocument','finalizeDocument') then raise exception 'quartermaster_operation_document';end if;
  if o->>'kind'='createDocument' and o->'request' is distinct from jsonb_build_object('type',d->>'type','sourceQuoteId',d->'quoteReference'->>'id') then raise exception 'quartermaster_create_operation';end if;
  if o->>'kind'='finalizeDocument' and (d->>'status'<>'finalized' or o->'request' is distinct from jsonb_build_object('documentId',d->>'id')) then raise exception 'quartermaster_finalize_operation';end if;
 end loop;
end $$;

create function fleet_private.qm_read(s jsonb,op uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare w fleet_private.quartermaster_workspaces%rowtype;r fleet_private.quartermaster_receipts%rowtype;
begin
 perform fleet_private.qm_require_scope(s);select * into w from fleet_private.quartermaster_workspaces where scope=s;
 if op is not null then select * into r from fleet_private.quartermaster_receipts where scope=s and operation_id=op;end if;
 return jsonb_build_object('schema','blackflag.quartermaster.cloud.v1','workspace',w.workspace,'cloudRevision',coalesce(w.cloud_revision,0),'savedAt',w.saved_at,'receipt',case when r.operation_id is null then null else jsonb_build_object('operationId',r.operation_id,'cloudRevision',r.cloud_revision,'workspaceRevision',r.workspace_revision,'requestHash',r.request_hash,'savedAt',r.saved_at) end);
end $$;
create function fleet_private.qm_commit(s jsonb,expected_revision bigint,op uuid,candidate jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare w fleet_private.quartermaster_workspaces%rowtype;r fleet_private.quartermaster_receipts%rowtype;h text;next_revision bigint;
begin
 perform fleet_private.qm_require_scope(s);
 if op is null or expected_revision is null or expected_revision<0 then raise exception 'quartermaster_invalid_operation';end if;
 if candidate->'scope' is distinct from s then raise exception 'quartermaster_workspace_scope';end if;
 if octet_length(candidate::text)>5242880 then raise exception 'quartermaster_cloud_capacity_5_MiB';end if;
 h:=encode(sha256(convert_to(jsonb_build_object('scope',s,'expected',expected_revision,'workspace',candidate)::text,'UTF8')),'hex');
 perform pg_advisory_xact_lock(hashtextextended(s::text,76));
 select * into r from fleet_private.quartermaster_receipts where scope=s and operation_id=op;
 if found then if r.request_hash<>h then raise exception 'quartermaster_operation_conflict';end if;return fleet_private.qm_read(s,op);end if;
 select * into w from fleet_private.quartermaster_workspaces where scope=s for update;
 if coalesce(w.cloud_revision,0)<>expected_revision then raise exception 'quartermaster_revision_conflict' using errcode='40001';end if;
 perform fleet_private.qm_validate_workspace(candidate,s,w.workspace);next_revision:=coalesce(w.cloud_revision,0)+1;
 insert into fleet_private.quartermaster_workspaces(scope,workspace,cloud_revision,saved_at) values(s,candidate,next_revision,now()) on conflict(scope) do update set workspace=excluded.workspace,cloud_revision=excluded.cloud_revision,saved_at=excluded.saved_at;
 insert into fleet_private.quartermaster_receipts(scope,operation_id,request_hash,cloud_revision,workspace_revision) values(s,op,h,next_revision,(candidate->>'revision')::bigint);
 return fleet_private.qm_read(s,op);
end $$;
-- The public API has no elevated privileges. Only these private guarded entry points are executable.
create function public.quartermaster_read_workspace(p_scope jsonb,p_operation_id uuid default null) returns jsonb language sql security invoker set search_path='' as $$select fleet_private.qm_read(p_scope,p_operation_id)$$;
create function public.quartermaster_commit_workspace(p_scope jsonb,p_expected_cloud_revision bigint,p_operation_id uuid,p_workspace jsonb) returns jsonb language sql security invoker set search_path='' as $$select fleet_private.qm_commit(p_scope,p_expected_cloud_revision,p_operation_id,p_workspace)$$;
revoke all on function public.quartermaster_read_workspace(jsonb,uuid),public.quartermaster_commit_workspace(jsonb,bigint,uuid,jsonb) from public,anon;
grant execute on function public.quartermaster_read_workspace(jsonb,uuid),public.quartermaster_commit_workspace(jsonb,bigint,uuid,jsonb) to authenticated;
revoke all on function fleet_private.qm_keys(jsonb,text[]),fleet_private.qm_text(jsonb,text,integer,boolean),fleet_private.qm_integer(jsonb,bigint),fleet_private.qm_decimal(jsonb,integer,boolean),fleet_private.qm_timestamp(jsonb),fleet_private.qm_business(jsonb,text),fleet_private.qm_require_scope(jsonb),fleet_private.qm_validate_workspace(jsonb,jsonb,jsonb),fleet_private.qm_read(jsonb,uuid),fleet_private.qm_commit(jsonb,bigint,uuid,jsonb) from public,anon,authenticated;
grant usage on schema fleet_private to authenticated;
grant execute on function fleet_private.qm_read(jsonb,uuid),fleet_private.qm_commit(jsonb,bigint,uuid,jsonb) to authenticated;

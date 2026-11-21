-- Apply once to the fleet database that already runs Quartermaster Trade Winds.
begin;
-- Protect intervening changes to the shared workspace validator on install or re-run.
do $check$
declare signature text:=(select md5(prosrc) from pg_proc where oid=to_regprocedure('fleet_private.qm_validate_workspace(jsonb,jsonb,jsonb)'));
begin
 if signature is null or signature not in ('dfc03ec343529897dc37a185eb5e4376','d81ff98b1e6a96ba73e72bd694de84ba') then
  raise exception 'Install requires a matching Quartermaster Trade Winds workspace validator.';
 end if;
end $check$;
create table if not exists fleet_private.qm_invoice_series (
 business_id text primary key,
 code text not null unique check(code ~ '^[A-Z0-9]{3}$'),
 last_serial bigint not null default 0 check(last_serial>=0)
);
create table if not exists fleet_private.qm_invoice_numbers (
 business_id text not null references fleet_private.qm_invoice_series(business_id),
 document_id uuid not null,
 number text not null unique,
 reserved_at timestamptz not null default now(),
 reserved_by uuid not null,
 primary key(business_id,document_id)
);
alter table fleet_private.qm_invoice_series enable row level security;
alter table fleet_private.qm_invoice_numbers enable row level security;
revoke all on fleet_private.qm_invoice_series,fleet_private.qm_invoice_numbers from public,anon,authenticated;

create or replace function fleet_private.qm_allocate_invoice(s jsonb,doc uuid,requested text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 ship text:=s->>'businessId';
 series fleet_private.qm_invoice_series%rowtype;
 assigned text;
 serial_text text;
begin
 perform fleet_private.qm_require_scope(s);
 if doc is null or (requested is not null and requested !~ '^[A-Z0-9]{3}$') then
  raise exception 'quartermaster_invalid_invoice_request';
 end if;
 -- Serialize first registration, retries and counter increments for this ship.
 perform pg_advisory_xact_lock(hashtextextended(ship,152));
 select * into series from fleet_private.qm_invoice_series where business_id=ship;
 if not found then
  if requested is null then return jsonb_build_object('needsCode',true);end if;
  begin
   insert into fleet_private.qm_invoice_series(business_id,code) values(ship,requested) returning * into series;
  exception when unique_violation then raise exception 'quartermaster_invoice_code_taken';
  end;
 elsif requested is not null and requested<>series.code then
  raise exception 'quartermaster_invoice_series_already_registered';
 end if;
 select number into assigned from fleet_private.qm_invoice_numbers where business_id=ship and document_id=doc;
 if not found then
  update fleet_private.qm_invoice_series set last_serial=last_serial+1 where business_id=ship returning last_serial::text into serial_text;
  assigned:=series.code||'-'||lpad(serial_text,greatest(5,length(serial_text)),'0');
  insert into fleet_private.qm_invoice_numbers(business_id,document_id,number,reserved_by) values(ship,doc,assigned,auth.uid());
 end if;
 return jsonb_build_object('businessId',ship,'documentId',doc,'number',assigned);
end $$;

create or replace function fleet_private.qm_validate_workspace(w jsonb,s jsonb,old jsonb default null) returns void language plpgsql set search_path='' as $$
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
  if d->>'type'='invoice' and num ~ '^[A-Z0-9]{3}-[0-9]{5,19}$' then
   if not exists(select 1 from fleet_private.qm_invoice_numbers r
     where r.business_id=s->>'businessId' and r.document_id::text=d->>'id' and r.number=num) then
    raise exception 'quartermaster_invoice_reservation_mismatch';
   end if;
  else
  if num !~ ('^[A-Z0-9][A-Z0-9_-]{0,19}-'||case when d->>'type'='quote' then 'QTE' else 'INV' end||'-[0-9]{4}-L'||upper(replace(w->>'installationId','-',''))||'-[0-9]{6,}$') then raise exception 'quartermaster_document_series';end if;
  n:=substring(num from '([0-9]+)$')::bigint;if n<1 or n>fleet_private.qm_integer(w->'counters'->(d->>'type')) then raise exception 'quartermaster_document_counter';end if;
  end if;
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
revoke all on function fleet_private.qm_allocate_invoice(jsonb,uuid,text) from public,anon;
grant execute on function fleet_private.qm_allocate_invoice(jsonb,uuid,text) to authenticated;
create or replace function public.quartermaster_reserve_invoice_number(p_scope jsonb,p_document uuid,p_code text default null)
returns jsonb language sql security invoker set search_path='' as $$
 select fleet_private.qm_allocate_invoice(p_scope,p_document,p_code);
$$;
revoke all on function public.quartermaster_reserve_invoice_number(jsonb,uuid,text) from public,anon;
grant execute on function public.quartermaster_reserve_invoice_number(jsonb,uuid,text) to authenticated;
notify pgrst,'reload schema';
commit;

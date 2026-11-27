-- Run once in the sandbox Fleet Core after installing Renewal Receiver v3.
begin;
create schema if not exists bf_sandbox_billing;
revoke all on schema bf_sandbox_billing from public, anon, authenticated;

alter table public.treasury_sandbox_webhook_receipts
  add column if not exists invoice_number text,
  add column if not exists amount_due_minor bigint,
  add column if not exists next_period_at timestamptz,
  add column if not exists subscription_state text;

create table if not exists bf_sandbox_billing.bindings (
  subscription_id text primary key check (subscription_id ~ '^sub_[a-zA-Z0-9_]+$'),
  vessel_id uuid not null references public.fleet_vessels(id),
  entitlement_id uuid not null references public.fleet_service_entitlements(id),
  monthly_usd_minor bigint not null check (monthly_usd_minor between 0 and 99999999999),
  authorization_reference text not null check (length(trim(authorization_reference)) between 1 and 250),
  bound_at timestamptz not null default now()
);
alter table bf_sandbox_billing.bindings enable row level security;
-- Optional verified historical invoice facts, stored separately from the signed receipts.
create table if not exists bf_sandbox_billing.invoice_evidence (
  invoice_id text primary key check (invoice_id ~ '^in_[A-Za-z0-9_]+$'),
  subscription_id text not null check (subscription_id ~ '^sub_[A-Za-z0-9_]+$'),
  invoice_number text, currency text, paid_minor bigint check (paid_minor>=0),
  period_end timestamptz, evidence_reference text not null
);
alter table bf_sandbox_billing.invoice_evidence enable row level security;
create index if not exists bf_sandbox_receipt_object on public.treasury_sandbox_webhook_receipts(provider,object_id,event_created_at);
create index if not exists bf_sandbox_binding_vessel on bf_sandbox_billing.bindings(vessel_id);

-- A subscription can acquire exactly one vessel/service binding. Retries must agree.
create or replace function public.bind_vessel_sandbox_billing(p_project_id text,p_entitlement_id uuid,
  p_subscription_id text,p_monthly_usd_minor bigint,p_authorization_reference text)
returns void language plpgsql security definer set search_path='' as $$
declare selected_vessel uuid;
begin
  select v.id into strict selected_vessel from public.fleet_vessels v
    join public.fleet_service_entitlements e on e.vessel_id=v.id
    where v.project_id=p_project_id and e.id=p_entitlement_id;
  if not exists (select 1 from public.treasury_sandbox_webhook_receipts r where r.provider='stripe'
    and ((r.object_id=p_subscription_id and r.event_type like 'customer.subscription.%') or
         (r.subscription_id=p_subscription_id and r.event_type like 'invoice.%'))) then
    raise exception 'No verified sandbox receipt for this subscription';
  end if;
  insert into bf_sandbox_billing.bindings values
    (p_subscription_id,selected_vessel,p_entitlement_id,p_monthly_usd_minor,trim(p_authorization_reference),now())
    on conflict (subscription_id) do nothing;
  if not exists(select 1 from bf_sandbox_billing.bindings where subscription_id=p_subscription_id
      and vessel_id=selected_vessel and entitlement_id=p_entitlement_id and monthly_usd_minor=p_monthly_usd_minor
      and authorization_reference=trim(p_authorization_reference)) then
    raise exception 'Existing sandbox binding differs; review the original authorization';
  end if;
end $$;
revoke all on function public.bind_vessel_sandbox_billing(text,uuid,text,bigint,text) from public,anon,authenticated;
grant execute on function public.bind_vessel_sandbox_billing(text,uuid,text,bigint,text) to service_role;

create or replace view bf_sandbox_billing.invoices as
with evidence as (
  select r.object_id as invoice_id,
    count(distinct coalesce(r.subscription_id,h.subscription_id)) as sources,
    max(coalesce(r.subscription_id,h.subscription_id)) as subscription_id,
    bool_or(r.subscription_id is not null and h.subscription_id is not null and r.subscription_id<>h.subscription_id) as conflicting,
    max(coalesce(r.invoice_number,h.invoice_number)) as invoice_number,
    max(coalesce(r.next_period_at,h.period_end)) as next_period_at,
    max(r.amount_due_minor) as due_minor,
    max(r.currency) as observed_currency,max(h.currency) as archive_currency,max(h.paid_minor) as archive_paid
  from public.treasury_sandbox_webhook_receipts r
  left join bf_sandbox_billing.invoice_evidence h on h.invoice_id=r.object_id
  where r.provider='stripe' and r.object_id like 'in\_%' and r.event_type in
    ('invoice.finalized','invoice.paid','invoice.payment_failed','invoice.payment_action_required','invoice.voided','invoice.marked_uncollectible')
  group by r.object_id
), states as (
  select distinct on (r.object_id) r.object_id,r.event_type,r.event_created_at,r.event_id,r.amount_paid_minor,r.billing_reason,r.collection_method
  from public.treasury_sandbox_webhook_receipts r
  where r.provider='stripe' and r.event_type in
    ('invoice.finalized','invoice.paid','invoice.payment_failed','invoice.payment_action_required','invoice.voided','invoice.marked_uncollectible')
  order by r.object_id, case when r.event_type='invoice.paid' then 3 when r.event_type in
    ('invoice.voided','invoice.marked_uncollectible') then 2 when r.event_type='invoice.finalized' then 0 else 1 end desc,
    r.event_created_at desc,r.event_id desc
)
select case when e.sources=1 and not e.conflicting then e.subscription_id end as subscription_id,
 e.invoice_id,e.invoice_number,s.event_type,s.event_created_at as recorded_at,e.next_period_at,
 coalesce(e.observed_currency,e.archive_currency) as currency,e.due_minor,
 case when s.event_type='invoice.paid' then coalesce(s.amount_paid_minor,e.archive_paid) end as paid_minor,
 s.billing_reason,s.collection_method
from evidence e join states s on s.object_id=e.invoice_id;

create or replace view bf_sandbox_billing.accounts as
select b.subscription_id,v.id as vessel_id,v.project_id,v.display_name as vessel,c.display_name as service,
 b.monthly_usd_minor,
 case when life.event_type='customer.subscription.deleted' then 'canceled'
      when life.subscription_state in ('canceled','incomplete_expired') then 'canceled'
      when failed.alert or life.subscription_state in ('past_due','unpaid','incomplete','paused') then 'needs_attention'
      when life.subscription_state is not null then life.subscription_state
      when hist.items is not null and hist.has_paid then 'paid' else 'awaiting_receipt' end as status,
 case when life.event_type<>'customer.subscription.deleted' or life.event_type is null then
    case when coalesce(life.subscription_state,'') not in ('canceled','incomplete_expired') then
    coalesce(case when life.next_period_at is not null and (last_invoice.recorded_at is null or life.event_created_at>=last_invoice.recorded_at)
         then life.next_period_at end,last_invoice.next_period_at,life.next_period_at) end end as next_period_at,
 coalesce(hist.items,'[]'::jsonb) as invoices
from bf_sandbox_billing.bindings b join public.fleet_vessels v on v.id=b.vessel_id
join public.fleet_service_entitlements e on e.id=b.entitlement_id and e.vessel_id=b.vessel_id
join public.fleet_capabilities c on c.id=e.capability_id
left join lateral (select r.event_type,r.subscription_state,r.next_period_at,r.event_created_at
 from public.treasury_sandbox_webhook_receipts r where r.provider='stripe' and r.object_id=b.subscription_id
 and r.event_type like 'customer.subscription.%'
 order by (r.event_type='customer.subscription.deleted') desc,r.event_created_at desc,
 (r.event_type='customer.subscription.updated') desc,r.event_id desc limit 1) life on true
left join lateral (select i.recorded_at,i.next_period_at from bf_sandbox_billing.invoices i
 where i.subscription_id=b.subscription_id and i.next_period_at is not null and i.event_type='invoice.paid'
 order by i.next_period_at desc limit 1) last_invoice on true
left join lateral (select bool_or(i.event_type in ('invoice.payment_failed','invoice.payment_action_required','invoice.marked_uncollectible')) as alert
 from bf_sandbox_billing.invoices i where i.subscription_id=b.subscription_id) failed on true
left join lateral (select jsonb_agg(to_jsonb(i)-'subscription_id' order by i.recorded_at desc,i.invoice_id) as items,
 bool_or(i.event_type='invoice.paid') as has_paid from bf_sandbox_billing.invoices i where i.subscription_id=b.subscription_id) hist on true;

create or replace function public.owner_read_sandbox_billing(p_project_id text) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare scope uuid;
begin
  select v.id into scope from public.fleet_vessels v where v.project_id=p_project_id and exists (
    select 1 from public.fleet_memberships m where m.user_id=auth.uid() and m.vessel_id=v.id
    and m.active and m.revoked_at is null and m.role='project_owner');
  if scope is null then raise insufficient_privilege using message='Verified vessel owner required'; end if;
  return jsonb_build_object('mode','sandbox','project_id',p_project_id,'accounts',
    coalesce((select jsonb_agg(to_jsonb(a)-'vessel_id' order by a.service,a.subscription_id)
      from bf_sandbox_billing.accounts a where a.vessel_id=scope),'[]'::jsonb));
end $$;
create or replace function public.admiral_read_sandbox_billing() returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
  if not exists (select 1 from public.fleet_global_authorities where user_id=auth.uid() and
    active and revoked_at is null and authority_role='admiral') then
    raise insufficient_privilege using message='Active Admiral authority required'; end if;
  return jsonb_build_object('mode','sandbox','accounts',coalesce((select jsonb_agg(to_jsonb(a)-'vessel_id'
    order by a.vessel,a.service,a.subscription_id) from bf_sandbox_billing.accounts a),'[]'::jsonb),
    'to_check',coalesce((select jsonb_agg(to_jsonb(q) order by q.recorded_at desc,q.invoice_id)
    from (select i.*,null::text as subscription_state from bf_sandbox_billing.invoices i where not exists (
      select 1 from bf_sandbox_billing.accounts a where a.subscription_id=i.subscription_id)
    union all
    select latest.object_id,null::text,null::text,latest.event_type,latest.event_created_at,
      null::timestamptz,null::text,null::bigint,null::bigint,null::text,null::text,latest.subscription_state
    from (
      select distinct on (r.object_id) r.object_id,r.event_type,r.subscription_state,r.event_created_at
      from public.treasury_sandbox_webhook_receipts r
      where r.provider='stripe' and r.event_type like 'customer.subscription.%'
      order by r.object_id,(r.event_type='customer.subscription.deleted') desc,r.event_created_at desc,
        (r.event_type='customer.subscription.updated') desc,r.event_id desc
    ) latest
    where not exists(select 1 from bf_sandbox_billing.accounts a where a.subscription_id=latest.object_id)
      and (latest.event_type='customer.subscription.deleted' or
          latest.subscription_state in ('past_due','unpaid','canceled','paused','incomplete','incomplete_expired') or
          not exists(select 1 from bf_sandbox_billing.invoices i where i.subscription_id=latest.object_id))
    ) q),'[]'::jsonb));
end $$;
revoke all on function public.owner_read_sandbox_billing(text),public.admiral_read_sandbox_billing() from public,anon;
grant execute on function public.owner_read_sandbox_billing(text),public.admiral_read_sandbox_billing() to authenticated;
revoke all on all tables in schema bf_sandbox_billing from public,anon,authenticated;
commit;

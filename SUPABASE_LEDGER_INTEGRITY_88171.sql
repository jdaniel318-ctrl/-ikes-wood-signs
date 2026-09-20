-- Dark Sky 8.8.17.1 — Ledger Integrity
-- Reference migration for Black Flag Fleet Core. Review in a development project before production.
-- This release does not claim that the migration has been applied.

create table if not exists public.fleet_accounting_entities (
  entity_id uuid primary key default gen_random_uuid(),
  entity_key text not null unique,
  entity_type text not null check (entity_type in ('fleet_member','captain_office','admiral_office','admiral_program')),
  project_id text unique references public.fleet_vessels(project_id) on delete restrict,
  display_name text not null,
  accounting_method text not null default 'cash' check (accounting_method in ('cash','accrual','other')),
  tax_classification text not null default 'unclassified' check (tax_classification in ('unclassified','sole_proprietor','partnership','s_corporation','c_corporation','nonprofit','other')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.fleet_tax_ledger_entries (
  entry_id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references public.fleet_accounting_entities(entity_id) on delete restrict,
  transaction_date date not null,
  entry_type text not null check (entry_type in ('income','expense','transfer','owner_contribution','owner_draw','adjustment')),
  category_code text not null,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null default 'USD' check (currency = 'USD'),
  counterparty text not null default '',
  description text not null check (char_length(trim(description)) between 1 and 300),
  evidence_ref text not null default '',
  evidence_status text not null default 'missing' check (evidence_status in ('missing','referenced','verified')),
  review_status text not null default 'unreviewed' check (review_status in ('unreviewed','accountant_review','ready','approved')),
  acting_office text not null check (acting_office in ('captain','admiral','owner','system')),
  entered_by uuid not null references auth.users(id),
  correction_of uuid references public.fleet_tax_ledger_entries(entry_id) on delete restrict,
  source_ref text unique,
  created_at timestamptz not null default now()
);

create index if not exists fleet_tax_ledger_entity_date_idx on public.fleet_tax_ledger_entries(entity_id, transaction_date desc, created_at desc);
create index if not exists fleet_tax_ledger_review_idx on public.fleet_tax_ledger_entries(entity_id, review_status) where review_status <> 'approved';

insert into public.fleet_accounting_entities(entity_key,entity_type,display_name)
values ('office:captain','captain_office','Captain Operations'),('office:admiral','admiral_office','Admiral Operations')
on conflict (entity_key) do nothing;

insert into public.fleet_accounting_entities(entity_key,entity_type,project_id,display_name)
select 'project:'||v.project_id,
       case when v.mission_class='admiral_program' then 'admiral_program' else 'fleet_member' end,
       v.project_id,v.display_name
from public.fleet_vessels v
on conflict (entity_key) do update set display_name=excluded.display_name;

create or replace function public.ledger_register_vessel_entity()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.fleet_accounting_entities(entity_key,entity_type,project_id,display_name,created_by)
  values ('project:'||new.project_id,case when new.mission_class='admiral_program' then 'admiral_program' else 'fleet_member' end,new.project_id,new.display_name,auth.uid())
  on conflict (entity_key) do update set display_name=excluded.display_name;
  return new;
end $$;

drop trigger if exists ledger_register_vessel_entity_after_insert on public.fleet_vessels;
create trigger ledger_register_vessel_entity_after_insert after insert on public.fleet_vessels
for each row execute function public.ledger_register_vessel_entity();

alter table public.fleet_accounting_entities enable row level security;
alter table public.fleet_tax_ledger_entries enable row level security;

revoke all on public.fleet_accounting_entities, public.fleet_tax_ledger_entries from public, anon, authenticated;
grant select on public.fleet_accounting_entities, public.fleet_tax_ledger_entries to authenticated;
grant insert on public.fleet_tax_ledger_entries to authenticated;

drop policy if exists "ledger entities by exact authority" on public.fleet_accounting_entities;
create policy "ledger entities by exact authority" on public.fleet_accounting_entities for select to authenticated using (
  exists (select 1 from public.fleet_global_authorities a where a.user_id=(select auth.uid()) and a.authority_role='admiral' and a.active=true and a.revoked_at is null)
  or (entity_type <> 'admiral_office' and exists (select 1 from public.fleet_global_authorities a where a.user_id=(select auth.uid()) and a.authority_role='captain' and a.active=true and a.revoked_at is null))
  or (project_id is not null and exists (select 1 from public.fleet_memberships m where m.user_id=(select auth.uid()) and m.project_id=fleet_accounting_entities.project_id and m.status='active'))
);

drop policy if exists "ledger entries by exact authority" on public.fleet_tax_ledger_entries;
create policy "ledger entries by exact authority" on public.fleet_tax_ledger_entries for select to authenticated using (
  exists (
    select 1 from public.fleet_accounting_entities e
    where e.entity_id=fleet_tax_ledger_entries.entity_id and (
      exists (select 1 from public.fleet_global_authorities a where a.user_id=(select auth.uid()) and a.authority_role='admiral' and a.active=true and a.revoked_at is null)
      or (e.entity_type <> 'admiral_office' and exists (select 1 from public.fleet_global_authorities a where a.user_id=(select auth.uid()) and a.authority_role='captain' and a.active=true and a.revoked_at is null))
      or (e.project_id is not null and exists (select 1 from public.fleet_memberships m where m.user_id=(select auth.uid()) and m.project_id=e.project_id and m.status='active'))
    )
  )
);

drop policy if exists "append ledger entries by declared office" on public.fleet_tax_ledger_entries;
create policy "append ledger entries by declared office" on public.fleet_tax_ledger_entries for insert to authenticated with check (
  entered_by=(select auth.uid()) and (
    (acting_office='admiral' and exists (select 1 from public.fleet_global_authorities a where a.user_id=(select auth.uid()) and a.authority_role='admiral' and a.active=true and a.revoked_at is null))
    or (acting_office='captain' and exists (select 1 from public.fleet_global_authorities a where a.user_id=(select auth.uid()) and a.authority_role='captain' and a.active=true and a.revoked_at is null) and exists (select 1 from public.fleet_accounting_entities e where e.entity_id=fleet_tax_ledger_entries.entity_id and e.entity_type <> 'admiral_office'))
    or (acting_office='owner' and exists (select 1 from public.fleet_accounting_entities e join public.fleet_memberships m on m.project_id=e.project_id where e.entity_id=fleet_tax_ledger_entries.entity_id and m.user_id=(select auth.uid()) and m.status='active'))
  )
);

-- No UPDATE or DELETE grants are issued. Corrections append a new adjustment or reversal row.
revoke all on function public.ledger_register_vessel_entity() from public, anon, authenticated;

-- Dark Sky 8.8.20.17 BlackWake
-- Non-destructive supporting indexes discovered by live Fleet Core performance inspection.
-- Idempotent; does not alter RLS, grants, ownership, roles, or authority.

create index if not exists fleet_captain_appointments_appointed_by_idx
  on public.fleet_captain_appointments (appointed_by);

create index if not exists fleet_captain_appointments_membership_id_idx
  on public.fleet_captain_appointments (membership_id);

create index if not exists fleet_commissioning_receipts_actor_user_id_idx
  on public.fleet_commissioning_receipts (actor_user_id);

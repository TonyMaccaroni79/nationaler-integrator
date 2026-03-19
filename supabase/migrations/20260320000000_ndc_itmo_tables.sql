create table if not exists ndc_targets (
  id uuid primary key default gen_random_uuid(),
  sector text not null,
  year integer not null,
  ndc_target numeric not null,
  ndc_path jsonb not null default '[]'::jsonb,
  allowed_export_share numeric not null check (allowed_export_share >= 0 and allowed_export_share <= 1),
  created_at timestamptz not null default now()
);

create table if not exists itmo_authorizations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  authorization_type text not null check (authorization_type in ('domestic', 'ITMO', 'both')),
  max_itmo_export numeric not null,
  itmo_eligible boolean not null,
  ndc_compatible boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists corresponding_adjustments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  adjustment_year integer not null,
  adjustment_amount numeric not null,
  adjustment_applied boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_itmo_authorizations_project_id on itmo_authorizations(project_id);
create index if not exists idx_corresponding_adjustments_project_id on corresponding_adjustments(project_id);

alter table ndc_targets enable row level security;
alter table itmo_authorizations enable row level security;
alter table corresponding_adjustments enable row level security;

drop policy if exists ndc_targets_auth_read on ndc_targets;
create policy ndc_targets_auth_read on ndc_targets for select to authenticated using (true);

drop policy if exists itmo_auth_read on itmo_authorizations;
create policy itmo_auth_read on itmo_authorizations for select to authenticated using (true);

drop policy if exists itmo_ministry_write on itmo_authorizations;
create policy itmo_ministry_write on itmo_authorizations for all to authenticated
using (public.current_user_role() = 'ministry')
with check (public.current_user_role() = 'ministry');

drop policy if exists adjustments_auth_read on corresponding_adjustments;
create policy adjustments_auth_read on corresponding_adjustments for select to authenticated using (true);

drop policy if exists adjustments_ministry_write on corresponding_adjustments;
create policy adjustments_ministry_write on corresponding_adjustments for all to authenticated
using (public.current_user_role() = 'ministry')
with check (public.current_user_role() = 'ministry');

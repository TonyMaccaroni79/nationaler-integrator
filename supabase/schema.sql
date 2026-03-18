create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'auditor' check (role in ('ministry', 'auditor')),
  created_at timestamptz not null default now()
);

create table if not exists sectors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  dmrv_requirements jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  sector_id uuid not null references sectors(id) on delete restrict,
  name text not null,
  dmrv_data jsonb not null default '{}'::jsonb,
  permanence_score integer,
  status text not null default 'draft' check (status in ('draft', 'authorized', 'rejected', 'minted')),
  created_at timestamptz not null default now()
);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  timestamp timestamptz not null default now(),
  action text not null,
  result text not null
);

create table if not exists authorizations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references projects(id) on delete cascade,
  authorized boolean not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists tokens (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  token_id text not null unique,
  minted_at timestamptz not null default now()
);

create index if not exists idx_projects_sector_id on projects(sector_id);
create index if not exists idx_audit_project_id on audit_log(project_id);
create index if not exists idx_audit_timestamp on audit_log(timestamp desc);
create index if not exists idx_tokens_project_id on tokens(project_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, coalesce(new.email, 'unknown@example.invalid'), 'auditor')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.current_user_role()
returns text
language sql
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

alter table profiles enable row level security;
alter table sectors enable row level security;
alter table projects enable row level security;
alter table audit_log enable row level security;
alter table authorizations enable row level security;
alter table tokens enable row level security;

drop policy if exists profiles_self_read on profiles;
create policy profiles_self_read on profiles
for select to authenticated
using (id = auth.uid());

drop policy if exists profiles_ministry_read_all on profiles;
create policy profiles_ministry_read_all on profiles
for select to authenticated
using (public.current_user_role() = 'ministry');

drop policy if exists profiles_ministry_update on profiles;
create policy profiles_ministry_update on profiles
for update to authenticated
using (public.current_user_role() = 'ministry')
with check (public.current_user_role() = 'ministry');

drop policy if exists sectors_auth_read on sectors;
create policy sectors_auth_read on sectors
for select to authenticated
using (true);

drop policy if exists projects_auth_read on projects;
create policy projects_auth_read on projects
for select to authenticated
using (true);

drop policy if exists projects_ministry_write on projects;
create policy projects_ministry_write on projects
for all to authenticated
using (public.current_user_role() = 'ministry')
with check (public.current_user_role() = 'ministry');

drop policy if exists audit_auth_read on audit_log;
create policy audit_auth_read on audit_log
for select to authenticated
using (true);

drop policy if exists audit_ministry_write on audit_log;
create policy audit_ministry_write on audit_log
for insert to authenticated
with check (public.current_user_role() = 'ministry');

drop policy if exists authz_auth_read on authorizations;
create policy authz_auth_read on authorizations
for select to authenticated
using (true);

drop policy if exists authz_ministry_write on authorizations;
create policy authz_ministry_write on authorizations
for all to authenticated
using (public.current_user_role() = 'ministry')
with check (public.current_user_role() = 'ministry');

drop policy if exists tokens_auth_read on tokens;
create policy tokens_auth_read on tokens
for select to authenticated
using (true);

drop policy if exists tokens_ministry_write on tokens;
create policy tokens_ministry_write on tokens
for all to authenticated
using (public.current_user_role() = 'ministry')
with check (public.current_user_role() = 'ministry');


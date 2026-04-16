
create extension if not exists pgcrypto;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  tag text default '',
  description text default '',
  avatar_url text default '',
  banner_url text default '',
  member_names text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.teams
  add column if not exists avatar_url text default '',
  add column if not exists banner_url text default '';

alter table public.participants
  add column if not exists team_id uuid references public.teams(id) on delete set null;

create index if not exists teams_owner_id_idx on public.teams (owner_id);
create index if not exists participants_team_id_idx on public.participants (team_id);

alter table public.teams enable row level security;

drop policy if exists "users can view own teams" on public.teams;
create policy "users can view own teams"
on public.teams
for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists "users can create own teams" on public.teams;
create policy "users can create own teams"
on public.teams
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "users can update own teams" on public.teams;
create policy "users can update own teams"
on public.teams
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "users can delete own teams" on public.teams;
create policy "users can delete own teams"
on public.teams
for delete
to authenticated
using (owner_id = auth.uid());

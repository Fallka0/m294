create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text unique,
  full_name text,
  bio text default '',
  avatar_url text default '',
  banner_url text default '',
  website_url text default '',
  x_url text default '',
  github_url text default '',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles
  add column if not exists avatar_url text default '',
  add column if not exists banner_url text default '',
  add column if not exists website_url text default '',
  add column if not exists x_url text default '',
  add column if not exists github_url text default '';

alter table public.tournaments
  add column if not exists owner_id uuid references auth.users(id) on delete set null,
  add column if not exists description text not null default '',
  add column if not exists is_public boolean not null default true;

alter table public.tournaments
  alter column owner_id set default auth.uid();

alter table public.tournaments
  alter column status set default 'open';

update public.tournaments
set
  description = coalesce(description, ''),
  is_public = coalesce(is_public, true),
  status = coalesce(status, 'open');

alter table public.participants
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create unique index if not exists participants_tournament_user_unique
  on public.participants (tournament_id, user_id)
  where user_id is not null;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    username = coalesce(excluded.username, public.profiles.username),
    full_name = coalesce(excluded.full_name, public.profiles.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile();

alter table public.profiles enable row level security;
alter table public.tournaments enable row level security;
alter table public.participants enable row level security;
alter table public.matches enable row level security;

drop policy if exists "profiles are public readable" on public.profiles;
create policy "profiles are public readable"
on public.profiles
for select
to authenticated, anon
using (true);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "public can read visible tournaments" on public.tournaments;
create policy "public can read visible tournaments"
on public.tournaments
for select
to authenticated, anon
using (is_public = true or owner_id = auth.uid());

drop policy if exists "users can create own tournaments" on public.tournaments;
create policy "users can create own tournaments"
on public.tournaments
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "owners can update tournaments" on public.tournaments;
create policy "owners can update tournaments"
on public.tournaments
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "owners can delete tournaments" on public.tournaments;
create policy "owners can delete tournaments"
on public.tournaments
for delete
to authenticated
using (owner_id = auth.uid());

drop policy if exists "read participants for visible tournaments" on public.participants;
create policy "read participants for visible tournaments"
on public.participants
for select
to authenticated, anon
using (
  exists (
    select 1
    from public.tournaments
    where tournaments.id = participants.tournament_id
      and (tournaments.is_public = true or tournaments.owner_id = auth.uid())
  )
);

drop policy if exists "owners can manage participants" on public.participants;
create policy "owners can manage participants"
on public.participants
for insert
to authenticated
with check (
  exists (
    select 1
    from public.tournaments
    where tournaments.id = participants.tournament_id
      and tournaments.owner_id = auth.uid()
  )
);

drop policy if exists "users can join public tournaments" on public.participants;
create policy "users can join public tournaments"
on public.participants
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.tournaments
    where tournaments.id = participants.tournament_id
      and tournaments.is_public = true
      and coalesce(tournaments.status, 'open') = 'open'
      and (tournaments.owner_id is null or tournaments.owner_id <> auth.uid())
  )
);

drop policy if exists "owners or joined users can delete participants" on public.participants;
create policy "owners or joined users can delete participants"
on public.participants
for delete
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.tournaments
    where tournaments.id = participants.tournament_id
      and tournaments.owner_id = auth.uid()
  )
);

drop policy if exists "read matches for visible tournaments" on public.matches;
create policy "read matches for visible tournaments"
on public.matches
for select
to authenticated, anon
using (
  exists (
    select 1
    from public.tournaments
    where tournaments.id = matches.tournament_id
      and (tournaments.is_public = true or tournaments.owner_id = auth.uid())
  )
);

drop policy if exists "owners can insert matches" on public.matches;
create policy "owners can insert matches"
on public.matches
for insert
to authenticated
with check (
  exists (
    select 1
    from public.tournaments
    where tournaments.id = matches.tournament_id
      and tournaments.owner_id = auth.uid()
  )
);

drop policy if exists "owners can update matches" on public.matches;
create policy "owners can update matches"
on public.matches
for update
to authenticated
using (
  exists (
    select 1
    from public.tournaments
    where tournaments.id = matches.tournament_id
      and tournaments.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.tournaments
    where tournaments.id = matches.tournament_id
      and tournaments.owner_id = auth.uid()
  )
);

drop policy if exists "owners can delete matches" on public.matches;
create policy "owners can delete matches"
on public.matches
for delete
to authenticated
using (
  exists (
    select 1
    from public.tournaments
    where tournaments.id = matches.tournament_id
      and tournaments.owner_id = auth.uid()
  )
);

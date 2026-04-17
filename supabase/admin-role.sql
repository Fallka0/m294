alter table public.profiles
  add column if not exists role text not null default 'user';

update public.profiles
set role = 'user'
where role is null
   or role not in ('user', 'admin');

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'admin'));

create or replace function public.is_admin(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role = 'admin'
  );
$$;

drop policy if exists "admins can read all profiles" on public.profiles;
create policy "admins can read all profiles"
on public.profiles
for select
to authenticated
using (public.is_admin());

drop policy if exists "admins can read all tournaments" on public.tournaments;
create policy "admins can read all tournaments"
on public.tournaments
for select
to authenticated
using (public.is_admin());

drop policy if exists "admins can read all participants" on public.participants;
create policy "admins can read all participants"
on public.participants
for select
to authenticated
using (public.is_admin());

drop policy if exists "admins can read all matches" on public.matches;
create policy "admins can read all matches"
on public.matches
for select
to authenticated
using (public.is_admin());

drop policy if exists "admins can read all teams" on public.teams;
create policy "admins can read all teams"
on public.teams
for select
to authenticated
using (public.is_admin());

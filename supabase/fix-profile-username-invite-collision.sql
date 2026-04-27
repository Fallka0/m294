create or replace function public.generate_unique_profile_username(
  desired_username text,
  profile_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  candidate text;
  suffix text;
begin
  base_username := lower(coalesce(nullif(trim(desired_username), ''), 'user'));
  base_username := regexp_replace(base_username, '[^a-z0-9._-]+', '-', 'g');
  base_username := trim(both '-._' from base_username);

  if base_username = '' then
    base_username := 'user';
  end if;

  candidate := left(base_username, 32);

  if not exists (
    select 1
    from public.profiles
    where username = candidate
      and id <> profile_id
  ) then
    return candidate;
  end if;

  suffix := '_' || right(replace(profile_id::text, '-', ''), 6);
  candidate := left(base_username, 32 - char_length(suffix)) || suffix;

  return candidate;
end;
$$;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_username text;
begin
  requested_username := coalesce(
    new.raw_user_meta_data ->> 'username',
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, email, username, full_name)
  values (
    new.id,
    new.email,
    public.generate_unique_profile_username(requested_username, new.id),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    username = coalesce(nullif(public.profiles.username, ''), excluded.username),
    full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name);

  return new;
end;
$$;

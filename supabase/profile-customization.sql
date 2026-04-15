alter table public.profiles
  add column if not exists avatar_url text default '',
  add column if not exists banner_url text default '',
  add column if not exists website_url text default '',
  add column if not exists x_url text default '',
  add column if not exists github_url text default '';

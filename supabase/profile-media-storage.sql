insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-media',
  'profile-media',
  true,
  6291456,
  array['image/png', 'image/jpeg', 'image/webp', 'image/avif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "profile media is publicly readable" on storage.objects;
create policy "profile media is publicly readable"
on storage.objects
for select
to public
using (bucket_id = 'profile-media');

drop policy if exists "users can upload own profile media" on storage.objects;
create policy "users can upload own profile media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "users can update own profile media" on storage.objects;
create policy "users can update own profile media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-media'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'profile-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "users can delete own profile media" on storage.objects;
create policy "users can delete own profile media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

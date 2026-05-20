alter table cafes
  add column if not exists images text[] not null default '{}';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cafe-images',
  'cafe-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public cafe images are readable" on storage.objects;

create policy "Public cafe images are readable"
on storage.objects
for select
using (bucket_id = 'cafe-images');

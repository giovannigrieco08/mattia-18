-- Run once against the self-hosted Supabase project (SQL editor).

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  caption text,
  guest_name text,
  width int,
  height int,
  bytes int,
  created_at timestamptz not null default now()
);

create index if not exists idx_photos_created_at
  on public.photos(created_at desc);

alter table public.photos enable row level security;

drop policy if exists "public read" on public.photos;
create policy "public read" on public.photos
  for select using (true);

insert into storage.buckets (id, name, public)
values ('birthday-photos', 'birthday-photos', true)
on conflict (id) do nothing;

drop policy if exists "public read photos" on storage.objects;
create policy "public read photos" on storage.objects
  for select using (bucket_id = 'birthday-photos');

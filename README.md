# Mattia ne fa diciotto.

Mobile photo wall for Mattia's 18th birthday — 13.05.2026, Manfredonia.

Next.js 15 (App Router) + React 19 + Tailwind v4 + Supabase (self-hosted Nebulon) + Vercel.

## Run

```bash
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

npm install
npm run dev
```

Visit http://localhost:3000.

## Supabase setup

Run once against the self-hosted Supabase project (SQL editor):

```sql
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  caption text,
  guest_name text,
  width int,
  height int,
  bytes int,
  created_at timestamptz not null default now()
);
create index idx_photos_created_at on public.photos(created_at desc);

alter table public.photos enable row level security;
create policy "public read" on public.photos
  for select using (true);

insert into storage.buckets (id, name, public)
values ('birthday-photos', 'birthday-photos', true)
on conflict (id) do nothing;

create policy "public read photos" on storage.objects
  for select using (bucket_id = 'birthday-photos');
```

Uploads use the service role key from the server action and bypass RLS — no need for an insert policy.

## Project structure

```
app/
  layout.tsx            root layout, fonts
  page.tsx              splash + hero + gallery + upload (?upload=1)
  globals.css           Tailwind v4 + DomeGallery CSS
  actions/upload.ts     server action: validate, HEIC convert, sharp resize, upload
  api/photos/route.ts   polling endpoint, no-store, force-dynamic
  components/
    Splash.tsx          full-screen wine intro with SMIL logo, sessionStorage skip
    Hero.tsx            landing
    Gallery.tsx         empty / sparse / full selector + polling + lightbox
    DomeGallery.tsx     React Bits dome, ported with imperative enlarge
    UploadSheet.tsx     bottom sheet, 4 steps (pick/form/uploading/success)
    Lightbox.tsx        full-screen image view for masonry tiles
    Toast.tsx           error notifications
    Logo.tsx            static + SplashLogo with SMIL stroke-draw
    BlurText.tsx        word-by-word blur reveal
    icons.tsx           lucide-style SVG icons
    CheckCircleAnimated.tsx
lib/
  photos.ts             getPhotos() + countDistinctGuests()
  supabase/server.ts    SSR client (cookies-aware)
  supabase/admin.ts     service-role client for upload action
_mockup/                original HTML/JSX mockup, kept for reference
```

## Deploy

Vercel: import the repo, set the three env vars, deploy. `output: 'standalone'` is not required.

## Acceptance

- Splash: plays first visit, skips on `prefers-reduced-motion` and sessionStorage flag, ~3s total
- Hero: BlurText headline, Logo top-left, two stat cards with real counts
- Gallery: empty / sparse (< 30 photos) / full (>= 30) — picks variant by count
- DomeGallery: drag to rotate, tap to enlarge, scroll lock active
- Upload: pick → form (name + caption) → uploading → success, FAB + back-button close
- HEIC: converted server-side via `heic-convert`
- EXIF: sharp `.rotate()` strips orientation
- Polling: every 20s, paused when tab hidden
- noindex via metadata.robots

## Mockup → production map

See the build prompt in conversation. Mockup files preserved under `_mockup/`.

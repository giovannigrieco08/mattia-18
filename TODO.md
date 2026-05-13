# TODO — post-deploy follow-ups

These are deliberately deferred (per build prompt: "vai dritto, scelte di default ragionevoli").

## Perf
- [ ] DomeGallery fps fallback: measure RAF samples in the first 2s, if median <30fps swap to masonry-only. Today's Android entry-level devices may lag with 50 tiles × 3D transforms.
- [ ] Replace `<img>` with `next/image` in masonry once Supabase URL host is stable on prod (image config already keyed off `NEXT_PUBLIC_SUPABASE_URL`).

## Robustness
- [ ] HEIC fallback in browser: if `heic-convert` errors on a specific iPhone HEIC variant, fall back to "Esporta come JPEG" prompt in the UI (server already returns a friendly message — surface it as toast).
- [ ] Rate-limit `/api/photos` polling under load (e.g. backoff if 429 from upstream).
- [ ] Storage quota check before upload — abort early if bucket approaches limit.

## Nice-to-haves (post-birthday)
- [ ] Service worker for offline-first viewing of already-loaded photos.
- [ ] Lightbox: preload neighbor images for snappier swipes.
- [ ] Per-photo guest-name colorization in lightbox header.

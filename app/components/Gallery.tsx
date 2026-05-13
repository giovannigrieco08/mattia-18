"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DomeGallery, type DomeImage } from "./DomeGallery";
import { Lightbox } from "./Lightbox";
import { Plus } from "./icons";
import type { Photo } from "@/lib/photos";

const SPARSE_THRESHOLD = 30;

export function Gallery({ initialPhotos }: { initialPhotos: Photo[] }) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const activeRef = useRef(true);

  const tick = useCallback(async () => {
    if (typeof document === "undefined" || document.hidden) return;
    try {
      const res = await fetch("/api/photos", { cache: "no-store" });
      if (!res.ok || !activeRef.current) return;
      const data = (await res.json()) as { photos: Photo[] };
      if (Array.isArray(data?.photos)) setPhotos(data.photos);
    } catch {
      // swallow polling errors
    }
  }, []);

  useEffect(() => {
    activeRef.current = true;
    const id = setInterval(tick, 20_000);
    const onVis = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      activeRef.current = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [tick]);

  if (photos.length >= SPARSE_THRESHOLD) return <FullGallery photos={photos} />;
  // 0–29 photos: render the dome with placeholders filling empty slots
  return <SparseGallery photos={photos} />;
}

function FAB() {
  return (
    <Link
      href="/?upload=1"
      scroll={false}
      className="fixed bottom-6 right-5 z-20 rounded-full w-14 h-14 flex items-center justify-center active:scale-90 transition-transform"
      style={{
        background: "var(--color-wine)",
        color: "var(--color-paper)",
        boxShadow: "0 10px 25px rgba(122,30,43,0.35)",
      }}
      aria-label="Carica foto"
    >
      <Plus size={24} />
    </Link>
  );
}

function StickyHeader({ count, guests }: { count: number; guests: number }) {
  return (
    <div
      className="absolute top-0 left-0 right-0 z-30 px-5 py-3.5 flex items-center justify-between"
      style={{
        background:
          "linear-gradient(180deg, rgba(245,239,227,0.92) 0%, rgba(245,239,227,0.78) 60%, rgba(245,239,227,0) 100%)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        className="italic leading-none tracking-tight"
        style={{ fontSize: 20, color: "var(--color-ink)", fontFamily: "var(--font-heading)" }}
      >
        La galleria.
      </div>
      <div
        className="text-[11px] tabular-nums"
        style={{ color: "var(--color-ink-soft)" }}
      >
        {count} foto · {guests} ospiti
      </div>
    </div>
  );
}

function toDomeImages(photos: Photo[]): DomeImage[] {
  return photos.map((p, i) => ({
    src: p.src,
    alt: p.caption || `foto ${i + 1}`,
    caption: p.caption || "",
    name: p.guest_name || "",
  }));
}

function distinctGuests(photos: Photo[]) {
  const s = new Set<string>();
  for (const p of photos) {
    if (p.guest_name && p.guest_name.trim()) s.add(p.guest_name.trim().toLowerCase());
  }
  return s.size;
}

function SparseGallery({ photos }: { photos: Photo[] }) {
  const images = toDomeImages(photos);
  const guests = distinctGuests(photos);
  return (
    <section
      id="galleria"
      className="relative w-full h-[100svh]"
      style={{ background: "var(--color-paper)" }}
    >
      <div className="absolute inset-0">
        <DomeGallery
          images={images}
          segments={18}
          minRadius={260}
          maxRadius={420}
          fit={0.6}
          fitBasis="min"
          padFactor={0.12}
          overlayBlurColor="#F5EFE3"
          maxVerticalRotationDeg={8}
          dragSensitivity={14}
          dragDampening={0.5}
          openedImageWidth="240px"
          openedImageHeight="320px"
          imageBorderRadius="14px"
          openedImageBorderRadius="18px"
          grayscale={false}
          allowPlaceholders
          placeholderColor="#7A1E2B"
          placeholderMessage="Aspetta che gli ospiti carichino le loro foto, o sii il primo a caricarne una tu."
        />
      </div>

      <StickyHeader count={photos.length} guests={guests} />

      <div
        className="absolute left-0 right-0 z-20 flex justify-center pointer-events-none"
        style={{ bottom: 84 }}
      >
        <div
          className="text-[10px] uppercase"
          style={{ letterSpacing: "0.22em", color: "var(--color-ink-soft)" }}
        >
          ancora poche foto · aggiungi la tua
        </div>
      </div>

      <FAB />
    </section>
  );
}

function FullGallery({ photos }: { photos: Photo[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const guests = distinctGuests(photos);
  const best = photos.slice(0, 14);
  const bestImages = toDomeImages(best);

  return (
    <section
      id="galleria"
      className="relative w-full"
      style={{ background: "var(--color-paper)" }}
    >
      <div
        className="sticky top-0 z-30 px-5 py-3.5 border-b flex items-center justify-between"
        style={{
          background: "rgba(245,239,227,0.92)",
          backdropFilter: "blur(8px)",
          borderColor: "var(--color-line)",
        }}
      >
        <div
          className="italic leading-none tracking-tight"
          style={{ fontSize: 20, color: "var(--color-ink)", fontFamily: "var(--font-heading)" }}
        >
          La galleria.
        </div>
        <div
          className="text-[11px] tabular-nums"
          style={{ color: "var(--color-ink-soft)" }}
        >
          {photos.length} foto · {guests} ospiti
        </div>
      </div>

      <div className="px-5 pt-5 pb-2 flex items-baseline justify-between">
        <div
          className="italic tracking-tight"
          style={{
            fontSize: 22,
            letterSpacing: "-0.3px",
            color: "var(--color-ink)",
            fontFamily: "var(--font-heading)",
          }}
        >
          Foto migliori.
        </div>
        <div
          className="text-[10px] uppercase"
          style={{ letterSpacing: "0.22em", color: "var(--color-ink-soft)" }}
        >
          scelte di Mattia
        </div>
      </div>
      <div className="relative" style={{ height: 440 }}>
        <DomeGallery
          images={bestImages}
          segments={16}
          minRadius={220}
          maxRadius={360}
          fit={0.65}
          fitBasis="min"
          padFactor={0.1}
          overlayBlurColor="#F5EFE3"
          maxVerticalRotationDeg={8}
          dragSensitivity={14}
          dragDampening={0.5}
          openedImageWidth="240px"
          openedImageHeight="320px"
          imageBorderRadius="12px"
          openedImageBorderRadius="18px"
          grayscale={false}
        />
      </div>

      <div className="px-5 pt-6 pb-2 flex items-baseline justify-between">
        <div
          className="italic tracking-tight"
          style={{
            fontSize: 22,
            letterSpacing: "-0.3px",
            color: "var(--color-ink)",
            fontFamily: "var(--font-heading)",
          }}
        >
          Tutte le foto.
        </div>
        <div
          className="text-[10px] uppercase tabular-nums"
          style={{ letterSpacing: "0.22em", color: "var(--color-ink-soft)" }}
        >
          {photos.length}
        </div>
      </div>
      <div className="columns-2 gap-2 px-3 pt-2 pb-32">
        {photos.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setLightboxIndex(i)}
            className="mb-2 break-inside-avoid paper-card rounded-lg overflow-hidden active:scale-[0.97] transition-transform w-full text-left"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} className="w-full block" loading="lazy" alt={p.caption || ""} />
            {(p.caption || p.guest_name) && (
              <div className="px-2.5 py-2">
                {p.caption && (
                  <div
                    className="text-[13px] italic leading-snug"
                    style={{ color: "var(--color-ink)", fontFamily: "var(--font-heading)" }}
                  >
                    {p.caption}
                  </div>
                )}
                {p.guest_name && (
                  <div
                    className="text-[11px] mt-0.5 tracking-tight"
                    style={{ color: "var(--color-ink-soft)" }}
                  >
                    {p.guest_name}
                  </div>
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      <FAB />

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  );
}


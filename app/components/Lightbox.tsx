"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { XIcon } from "./icons";
import type { Photo } from "@/lib/photos";

export function Lightbox({
  photos,
  index,
  onClose,
  onChange,
}: {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onChange: (next: number) => void;
}) {
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setHintVisible(false), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    document.body.classList.add("sheet-open");
    return () => document.body.classList.remove("sheet-open");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onChange(Math.max(0, index - 1));
      if (e.key === "ArrowRight") onChange(Math.min(photos.length - 1, index + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, photos.length, onClose, onChange]);

  const photo = photos[index];
  if (!photo) return null;

  let touchStartX = 0;
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 50) return;
    if (dx < 0 && index < photos.length - 1) onChange(index + 1);
    if (dx > 0 && index > 0) onChange(index - 1);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: "#0A0706" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <div className="text-[12px] tabular-nums" style={{ color: "rgba(245,239,227,0.7)" }}>
          {index + 1} / {photos.length}
        </div>
        <button
          onClick={onClose}
          className="w-11 h-11 flex items-center justify-center"
          style={{ color: "rgba(245,239,227,0.9)" }}
          aria-label="Chiudi"
        >
          <XIcon size={24} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-3 min-h-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.src}
          className="max-w-full max-h-full object-contain rounded-lg"
          alt={photo.caption || ""}
        />
      </div>

      <div className="px-6 pb-6 pt-4 text-center">
        {photo.caption && (
          <div
            className="text-[15px] italic leading-snug mb-1"
            style={{ color: "var(--color-paper)", fontFamily: "var(--font-heading)" }}
          >
            {photo.caption}
          </div>
        )}
        {photo.guest_name && (
          <div className="text-[12px] tracking-tight" style={{ color: "rgba(245,239,227,0.6)" }}>
            {photo.guest_name}
          </div>
        )}
      </div>

      <AnimatePresence>
        {hintVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] uppercase"
            style={{ letterSpacing: "0.18em", color: "rgba(245,239,227,0.4)" }}
          >
            ← swipe →
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Logo } from "./Logo";
import { BlurText } from "./BlurText";
import { Camera, ArrowUpRight, ArrowRight, ChevronDown, ImageIcon, Users } from "./icons";

const heroFade = (delay = 0) => ({
  initial: { filter: "blur(10px)", opacity: 0, y: 20 },
  animate: { filter: "blur(0px)", opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: "easeOut" as const, delay },
});

export function Hero({
  photoCount,
  guestCount,
  galleryHref = "#galleria",
}: {
  photoCount: number;
  guestCount: number;
  galleryHref?: string;
}) {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden">
      <div className="mx-auto max-w-md px-5 pt-12 pb-10 flex flex-col min-h-[100svh]">
        <div className="flex items-start justify-between mb-12">
          <div style={{ marginTop: -4, marginLeft: -4 }}>
            <Logo size={56} color="var(--color-wine)" />
          </div>
          <div />
        </div>

        <motion.div
          {...heroFade(0.2)}
          className="text-[11px] font-medium uppercase mb-4"
          style={{ letterSpacing: "0.18em", color: "var(--color-wine)" }}
        >
          13.05.2026 · Manfredonia
        </motion.div>

        <BlurText
          text="Mattia ne fa diciotto."
          className="hero-headline italic mb-6"
          delayMs={100}
        />

        <motion.p
          {...heroFade(0.9)}
          className="text-[15px] font-light leading-snug mb-8"
          style={{ maxWidth: "26ch", color: "var(--color-ink-soft)" }}
        >
          Lascia un ricordo della serata. Carica le tue foto, scrivi due righe.
        </motion.p>

        <motion.div {...heroFade(1.1)} className="flex items-center gap-4">
          <Link
            href="/?upload=1"
            scroll={false}
            className="rounded-full px-5 py-3.5 inline-flex items-center gap-2 text-[14px] font-medium active:scale-95 transition-transform"
            style={{
              background: "var(--color-wine)",
              color: "var(--color-paper)",
              boxShadow: "0 8px 20px rgba(122,30,43,0.25)",
            }}
          >
            <Camera size={18} />
            <span>Carica una foto</span>
            <ArrowUpRight size={16} />
          </Link>
          <Link
            href={galleryHref}
            scroll={true}
            className="inline-flex items-center gap-1.5 text-[14px] underline underline-offset-4"
            style={{ color: "var(--color-ink)", textDecorationColor: "var(--color-line)" }}
          >
            <span>Vedi galleria</span>
            <ArrowRight size={14} />
          </Link>
        </motion.div>

        <motion.div {...heroFade(1.3)} className="grid grid-cols-2 gap-3 mt-12">
          <div className="paper-card rounded-2xl p-4">
            <ImageIcon size={20} style={{ color: "var(--color-wine)" }} />
            <div
              className="italic leading-none mt-3"
              style={{
                fontSize: 40,
                letterSpacing: "-1.5px",
                color: "var(--color-ink)",
                fontFamily: "var(--font-heading)",
              }}
            >
              {photoCount}
            </div>
            <div
              className="text-[11px] mt-1.5 tracking-tight leading-tight"
              style={{ color: "var(--color-ink-soft)" }}
            >
              foto caricate
            </div>
          </div>
          <div className="paper-card rounded-2xl p-4">
            <Users size={20} style={{ color: "var(--color-wine)" }} />
            <div
              className="italic leading-none mt-3"
              style={{
                fontSize: 40,
                letterSpacing: "-1.5px",
                color: "var(--color-ink)",
                fontFamily: "var(--font-heading)",
              }}
            >
              {guestCount}
            </div>
            <div
              className="text-[11px] mt-1.5 tracking-tight leading-tight"
              style={{ color: "var(--color-ink-soft)" }}
            >
              ospiti partecipi
            </div>
          </div>
        </motion.div>

        <div className="mt-auto pt-14 flex flex-col items-center gap-2 pb-2">
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            style={{ color: "var(--color-ink-soft)" }}
          >
            <ChevronDown size={16} />
          </motion.div>
          <div
            className="text-[10px] uppercase"
            style={{ letterSpacing: "0.18em", color: "var(--color-ink-soft)" }}
          >
            scorri per la galleria
          </div>
        </div>
      </div>
    </section>
  );
}

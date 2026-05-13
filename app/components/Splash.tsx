"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SplashLogo } from "./Logo";

const SESSION_KEY = "mattia18-splash-seen";
const TOTAL_MS = 3000;

export function Splash() {
  const [phase, setPhase] = useState<"loading" | "visible" | "fading" | "gone">("loading");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem(SESSION_KEY) === "1";
    if (seen || reduceMotion) {
      setPhase("gone");
      return;
    }
    setPhase("visible");
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / TOTAL_MS);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else handleEnter();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnter = () => {
    if (typeof window !== "undefined") sessionStorage.setItem(SESSION_KEY, "1");
    setPhase("fading");
    setTimeout(() => setPhase("gone"), 450);
  };

  return (
    <AnimatePresence>
      {phase !== "gone" && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "fading" ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          onClick={handleEnter}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8 cursor-pointer overflow-hidden"
          style={{ background: "var(--color-wine)", color: "var(--color-paper)" }}
          role="button"
          tabIndex={0}
          aria-label="Entra"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleEnter();
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(120% 80% at 50% 35%, rgba(245,239,227,0.06) 0%, rgba(245,239,227,0) 60%), radial-gradient(80% 60% at 50% 100%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 70%)",
              pointerEvents: "none",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.05 }}
            className="absolute uppercase"
            style={{
              top: 52,
              left: 24,
              fontSize: 10,
              letterSpacing: "0.28em",
              color: "rgba(245,239,227,0.65)",
              fontFamily: "var(--font-body)",
            }}
          >
            Manfredonia
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
            className="absolute uppercase tabular-nums"
            style={{
              top: 52,
              right: 24,
              fontSize: 10,
              letterSpacing: "0.28em",
              color: "rgba(245,239,227,0.65)",
              fontFamily: "var(--font-body)",
            }}
          >
            13.05.26
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 }}
            style={{
              position: "absolute",
              top: 86,
              left: 24,
              right: 24,
              height: 1,
              background: "rgba(245,239,227,0.25)",
              transformOrigin: "left",
            }}
          />

          <div style={{ marginTop: -20, marginBottom: 28 }}>
            <SplashLogo size={320} color="#F5EFE3" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: "easeOut", delay: 1.7 }}
            className="text-center relative z-10"
          >
            <p
              className="italic leading-[0.95]"
              style={{
                fontSize: 36,
                letterSpacing: "-0.5px",
                color: "var(--color-paper)",
                fontFamily: "var(--font-heading)",
              }}
            >
              Mattia ne fa diciotto.
            </p>
          </motion.div>

          <div className="absolute left-0 right-0 bottom-12 px-10 flex flex-col items-center gap-4">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 }}
              style={{
                position: "absolute",
                bottom: 110,
                left: 24,
                right: 24,
                height: 1,
                background: "rgba(245,239,227,0.25)",
                transformOrigin: "right",
              }}
            />
            <div
              style={{
                width: 140,
                height: 1,
                background: "rgba(245,239,227,0.20)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  width: `${Math.round(progress * 100)}%`,
                  background: "var(--color-paper)",
                  transition: "width 80ms linear",
                }}
              />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 2.0 }}
              className="uppercase"
              style={{
                fontSize: 10,
                letterSpacing: "0.28em",
                color: "rgba(245,239,227,0.55)",
                fontFamily: "var(--font-body)",
              }}
            >
              tocca per entrare
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

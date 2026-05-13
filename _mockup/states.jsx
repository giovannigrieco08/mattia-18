/* global React, motion, AnimatePresence, Camera, ArrowUpRight, ArrowRight, ChevronDown, Plus, XIcon, ImageIcon, Users, AlertTriangle, CheckCircleAnimated, SignatureGlyph, BlurText, MOCK, HEIGHTS, heroFade, Logo, SplashLogo */
const { useState: useStateS, useEffect: useEffectS, useRef: useRefS } = React;

// ============================================================
// SPLASH
// ============================================================
function SplashView({ onEnter }) {
  const [progress, setProgress] = useStateS(0);
  useEffectS(() => {
    const start = performance.now();
    const total = 4200; // ms — covers full draw + breathing room
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / total);
      setProgress(p);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => onEnter && onEnter(), 700);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onEnter]);

  // subtle film grain (CSS-only) + vignette baked in via inset shadow
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center px-8 cursor-pointer overflow-hidden"
      style={{
        background: "var(--wine)",
        color: "var(--paper)",
      }}
      onClick={onEnter}
    >
      {/* paper-color soft vignette / grain feel */}
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

      {/* Top corner marks */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.05 }}
        className="absolute font-body uppercase"
        style={{
          top: 52,
          left: 24,
          fontSize: 10,
          letterSpacing: "0.28em",
          color: "rgba(245,239,227,0.65)",
        }}
      >
        Manfredonia
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
        className="absolute font-body uppercase tabular-nums"
        style={{
          top: 52,
          right: 24,
          fontSize: 10,
          letterSpacing: "0.28em",
          color: "rgba(245,239,227,0.65)",
        }}
      >
        13.05.26
      </motion.div>

      {/* Top thin rule */}
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

      {/* Logo with stroke-draw + fill */}
      <div style={{ marginTop: -20, marginBottom: 28 }}>
        <SplashLogo size={320} color="#F5EFE3" />
      </div>

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1, ease: "easeOut", delay: 3.1 }}
        className="text-center relative z-10"
      >
        <p
          className="font-heading italic leading-[0.95]"
          style={{
            fontSize: 36,
            letterSpacing: "-0.5px",
            color: "var(--paper)",
          }}
        >
          Mattia ne fa diciotto.
        </p>
      </motion.div>

      {/* Bottom: rule + progress + hint */}
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
              background: "var(--paper)",
              transition: "width 80ms linear",
            }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 3.5 }}
          className="font-body uppercase"
          style={{
            fontSize: 10,
            letterSpacing: "0.28em",
            color: "rgba(245,239,227,0.55)",
          }}
        >
          tocca per entrare
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================
// HERO
// ============================================================
function HeroView({ triggerKey }) {
  return (
    <div className="absolute inset-0 overflow-y-auto no-scrollbar"><div className="min-h-full flex flex-col px-5 pt-12 pb-10">
      {/* mini top bar — logo top-left only */}
      <div className="flex items-start justify-between mb-12">
        <div style={{ marginTop: -4, marginLeft: -4 }}>
          <Logo size={56} color="var(--wine)" />
        </div>
        <div />
      </div>

      {/* eyebrow */}
      <motion.div
        {...heroFade(0.2)}
        className="text-[11px] font-body font-medium uppercase text-wine mb-4"
        style={{ letterSpacing: "0.18em" }}
      >
        13.05.2026 · Manfredonia
      </motion.div>

      {/* headline */}
      <BlurText
        text="Mattia ne fa diciotto."
        className="hero-headline font-heading italic text-ink mb-6"
        triggerKey={triggerKey}
        delayMs={100}
      />

      {/* subheading */}
      <motion.p
        {...heroFade(0.9)}
        className="text-[15px] font-body font-light text-ink-soft leading-snug mb-8"
        style={{ maxWidth: "26ch" }}
      >
        Lascia un ricordo della serata. Carica le tue foto, scrivi due righe.
      </motion.p>

      {/* CTA row */}
      <motion.div {...heroFade(1.1)} className="flex items-center gap-4">
        <button
          className="bg-wine text-paper rounded-full px-5 py-3.5 inline-flex items-center gap-2 text-[14px] font-body font-medium active:scale-95 transition-transform"
          style={{ boxShadow: "0 8px 20px rgba(122,30,43,0.25)" }}
        >
          <Camera size={18} />
          <span>Carica una foto</span>
          <ArrowUpRight size={16} />
        </button>
        <a
          className="inline-flex items-center gap-1.5 text-[14px] font-body text-ink underline underline-offset-4 decoration-line cursor-pointer"
        >
          <span>Vedi galleria</span>
          <ArrowRight size={14} />
        </a>
      </motion.div>

      {/* stats */}
      <motion.div {...heroFade(1.3)} className="grid grid-cols-2 gap-3 mt-12">
        <div className="paper-card rounded-2xl p-4">
          <ImageIcon size={20} className="text-wine" />
          <div
            className="font-heading italic text-ink leading-none mt-3"
            style={{ fontSize: 40, letterSpacing: "-1.5px" }}
          >
            47
          </div>
          <div className="text-[11px] font-body text-ink-soft mt-1.5 tracking-tight leading-tight">
            foto caricate
          </div>
        </div>
        <div className="paper-card rounded-2xl p-4">
          <Users size={20} className="text-wine" />
          <div
            className="font-heading italic text-ink leading-none mt-3"
            style={{ fontSize: 40, letterSpacing: "-1.5px" }}
          >
            23
          </div>
          <div className="text-[11px] font-body text-ink-soft mt-1.5 tracking-tight leading-tight">
            ospiti partecipi
          </div>
        </div>
      </motion.div>

      {/* scroll hint */}
      <div className="mt-auto pt-14 flex flex-col items-center gap-2 pb-2">
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="text-ink-soft"
        >
          <ChevronDown size={16} />
        </motion.div>
        <div
          className="text-[10px] font-body uppercase text-ink-soft"
          style={{ letterSpacing: "0.18em" }}
        >
          scorri per la galleria
        </div>
      </div>
    </div></div>
  );
}

// ============================================================
// GALLERIA (also reused as background for Upload/Error)
// ============================================================
// Build dome images once — picsum seeds matching the masonry; include caption/name
const DOME_IMAGES = MOCK.map((m, i) => ({
  src: `https://picsum.photos/seed/mattia${i}/500/500`,
  alt: m.caption || `foto ${i + 1}`,
  caption: m.caption,
  name: m.name,
}));

function GalleriaView({ withFAB = true, showHeader = true }) {
  return (
    <div className="absolute inset-0" style={{ background: "var(--paper)" }}>
      {/* Dome fills the whole device viewport; overlay fades to paper */}
      <div className="absolute inset-0">
        <window.DomeGallery
          images={DOME_IMAGES}
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
        />
      </div>

      {/* Sticky-style header floating on top */}
      {showHeader && (
        <div
          className="absolute top-0 left-0 right-0 z-30 px-5 py-3.5 flex items-center justify-between"
          style={{
            background:
              "linear-gradient(180deg, rgba(245,239,227,0.92) 0%, rgba(245,239,227,0.78) 60%, rgba(245,239,227,0) 100%)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            className="font-heading italic text-ink leading-none tracking-tight"
            style={{ fontSize: 20 }}
          >
            La galleria.
          </div>
          <div className="text-[11px] font-body text-ink-soft tabular-nums">
            47 foto · 23 ospiti
          </div>
        </div>
      )}

      {/* Bottom hint */}
      <div
        className="absolute left-0 right-0 z-20 flex justify-center pointer-events-none"
        style={{ bottom: 84 }}
      >
        <div
          className="text-[10px] font-body uppercase text-ink-soft"
          style={{ letterSpacing: "0.22em" }}
        >
          trascina · tocca per ingrandire
        </div>
      </div>

      {withFAB && (
        <button
          className="absolute bottom-6 right-5 z-20 bg-wine text-paper rounded-full w-14 h-14 flex items-center justify-center active:scale-90 transition-transform"
          style={{ boxShadow: "0 10px 25px rgba(122,30,43,0.35)" }}
          aria-label="Carica foto"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}

// ============================================================
// GALLERIA — SPARSE (few photos, placeholders fill the rest)
// ============================================================
const SPARSE_IMAGES = MOCK.slice(0, 6).map((m, i) => ({
  src: `https://picsum.photos/seed/mattia${i}/500/500`,
  alt: m.caption || `foto ${i + 1}`,
  caption: m.caption,
  name: m.name,
}));

function GalleriaSparseView({ withFAB = true }) {
  return (
    <div className="absolute inset-0" style={{ background: "var(--paper)" }}>
      <div className="absolute inset-0">
        <window.DomeGallery
          images={SPARSE_IMAGES}
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
          allowPlaceholders={true}
          placeholderColor="#7A1E2B"
          placeholderMessage="Aspetta che gli ospiti carichino le loro foto, o sii il primo a caricarne una tu."
        />
      </div>

      <div
        className="absolute top-0 left-0 right-0 z-30 px-5 py-3.5 flex items-center justify-between"
        style={{
          background:
            "linear-gradient(180deg, rgba(245,239,227,0.92) 0%, rgba(245,239,227,0.78) 60%, rgba(245,239,227,0) 100%)",
          backdropFilter: "blur(6px)",
        }}
      >
        <div className="font-heading italic text-ink leading-none tracking-tight" style={{ fontSize: 20 }}>
          La galleria.
        </div>
        <div className="text-[11px] font-body text-ink-soft tabular-nums">
          {SPARSE_IMAGES.length} foto · 4 ospiti
        </div>
      </div>

      <div
        className="absolute left-0 right-0 z-20 flex justify-center pointer-events-none"
        style={{ bottom: 84 }}
      >
        <div className="text-[10px] font-body uppercase text-ink-soft" style={{ letterSpacing: "0.22em" }}>
          ancora poche foto · aggiungi la tua
        </div>
      </div>

      {withFAB && (
        <button
          className="absolute bottom-6 right-5 z-20 bg-wine text-paper rounded-full w-14 h-14 flex items-center justify-center active:scale-90 transition-transform"
          style={{ boxShadow: "0 10px 25px rgba(122,30,43,0.35)" }}
          aria-label="Carica foto"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}

// ============================================================
// GALLERIA — PIENA (best-of dome on top + canonical grid below)
// ============================================================
const BEST_IMAGES = MOCK.slice(0, 14).map((m, i) => ({
  src: `https://picsum.photos/seed/mattia${i}/500/500`,
  alt: m.caption || `foto ${i + 1}`,
  caption: m.caption,
  name: m.name,
}));

// Bigger pool for the canonical grid below — re-use original mock with more seeds
const FULL_GRID = Array.from({ length: 48 }, (_, i) => {
  const m = MOCK[i % MOCK.length];
  return {
    src: `https://picsum.photos/seed/mattia-full-${i}/600/${HEIGHTS[i % HEIGHTS.length]}`,
    caption: m.caption,
    name: m.name,
  };
});

function GalleriaPienaView({ withFAB = true }) {
  return (
    <div className="absolute inset-0" style={{ background: "var(--paper)" }}>
      <div className="absolute inset-0 overflow-y-auto no-scrollbar">
        {/* Sticky header */}
        <div
          className="sticky top-0 z-30 px-5 py-3.5 border-b border-line flex items-center justify-between"
          style={{ background: "rgba(245,239,227,0.92)", backdropFilter: "blur(8px)" }}
        >
          <div className="font-heading italic text-ink leading-none tracking-tight" style={{ fontSize: 20 }}>
            La galleria.
          </div>
          <div className="text-[11px] font-body text-ink-soft tabular-nums">
            {FULL_GRID.length} foto · 31 ospiti
          </div>
        </div>

        {/* Section: foto migliori — dome */}
        <div className="px-5 pt-5 pb-2 flex items-baseline justify-between">
          <div
            className="font-heading italic text-ink tracking-tight"
            style={{ fontSize: 22, letterSpacing: "-0.3px" }}
          >
            Foto migliori.
          </div>
          <div className="text-[10px] font-body uppercase text-ink-soft" style={{ letterSpacing: "0.22em" }}>
            scelte di Mattia
          </div>
        </div>
        <div className="relative" style={{ height: 440 }}>
          <window.DomeGallery
            images={BEST_IMAGES}
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

        {/* Section: tutte le foto — canonical grid */}
        <div className="px-5 pt-6 pb-2 flex items-baseline justify-between">
          <div
            className="font-heading italic text-ink tracking-tight"
            style={{ fontSize: 22, letterSpacing: "-0.3px" }}
          >
            Tutte le foto.
          </div>
          <div className="text-[10px] font-body uppercase text-ink-soft tabular-nums" style={{ letterSpacing: "0.22em" }}>
            {FULL_GRID.length}
          </div>
        </div>
        <div className="columns-2 gap-2 px-3 pt-2 pb-32">
          {FULL_GRID.map((m, i) => (
            <div
              key={i}
              className="mb-2 break-inside-avoid paper-card rounded-lg overflow-hidden active:scale-[0.97] transition-transform"
            >
              <img src={m.src} className="w-full block" loading="lazy" alt="" />
              {(m.caption || m.name) && (
                <div className="px-2.5 py-2">
                  {m.caption && (
                    <div className="text-[13px] font-heading italic text-ink leading-snug">
                      {m.caption}
                    </div>
                  )}
                  {m.name && (
                    <div className="text-[11px] font-body text-ink-soft mt-0.5 tracking-tight">
                      {m.name}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {withFAB && (
        <button
          className="absolute bottom-6 right-5 z-20 bg-wine text-paper rounded-full w-14 h-14 flex items-center justify-center active:scale-90 transition-transform"
          style={{ boxShadow: "0 10px 25px rgba(122,30,43,0.35)" }}
          aria-label="Carica foto"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}

// ============================================================
// LIGHTBOX
// ============================================================
function LightboxView() {
  const [hintVisible, setHintVisible] = useStateS(true);
  useEffectS(() => {
    const t = setTimeout(() => setHintVisible(false), 2500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="absolute inset-0 z-40 flex flex-col" style={{ background: "#0A0706" }}>
      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <div className="text-[12px] font-body tabular-nums" style={{ color: "rgba(245,239,227,0.7)" }}>
          12 / 47
        </div>
        <button
          className="w-11 h-11 flex items-center justify-center"
          style={{ color: "rgba(245,239,227,0.9)" }}
          aria-label="Chiudi"
        >
          <XIcon size={24} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-3 min-h-0">
        <img
          src="https://picsum.photos/seed/mattia7/900/1200"
          className="max-w-full max-h-full object-contain rounded-lg"
          alt=""
        />
      </div>

      <div className="px-6 pb-6 pt-4 text-center">
        <div className="text-[15px] font-heading italic text-paper leading-snug mb-1">
          auguri fratello
        </div>
        <div className="text-[12px] font-body tracking-tight" style={{ color: "rgba(245,239,227,0.6)" }}>
          Marco
        </div>
      </div>

      <AnimatePresence>
        {hintVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-body uppercase"
            style={{ letterSpacing: "0.18em", color: "rgba(245,239,227,0.4)" }}
          >
            ← swipe →
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// BOTTOM SHEET shell
// ============================================================
function Sheet({ children, maxHeight = "75%" }) {
  const [open, setOpen] = useStateS(false);
  useEffectS(() => {
    const id = setTimeout(() => setOpen(true), 20);
    return () => clearTimeout(id);
  }, []);
  return (
    <>
      <div
        className="absolute inset-0 z-40 transition-opacity duration-300 ease-out"
        style={{ background: "rgba(28,20,16,0.4)", opacity: open ? 1 : 0 }}
      />
      <div
        className="z-50 paper-card-strong px-5 pt-3 pb-8 flex flex-col"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: "2rem",
          borderTopRightRadius: "2rem",
          maxHeight,
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="flex justify-center mb-4 shrink-0">
          <div className="w-10 h-1 rounded-full bg-line" />
        </div>
        {children}
      </div>
    </>
  );
}

// ============================================================
// UPLOAD 1
// ============================================================
function Upload1View() {
  return (
    <div className="absolute inset-0">
      <GalleriaView />
      <Sheet maxHeight="75%">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div
            className="font-heading italic text-ink tracking-tight"
            style={{ fontSize: 26 }}
          >
            Carica le foto.
          </div>
          <button className="w-11 h-11 flex items-center justify-center text-ink-soft" aria-label="Chiudi">
            <XIcon size={24} />
          </button>
        </div>

        <div
          className="paper-card rounded-2xl px-5 py-10 flex flex-col items-center justify-center text-center mb-4"
          style={{ border: "2px dashed rgba(122,30,43,0.30)" }}
        >
          <Camera size={44} className="text-wine mb-3" />
          <div className="text-[17px] font-heading italic text-ink mb-1">
            Tocca per scegliere
          </div>
          <div className="text-[12px] font-body text-ink-soft">
            JPG, PNG, HEIC · max 15MB
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <button className="paper-card rounded-xl px-4 py-3.5 flex items-center justify-center gap-2 text-[13px] font-body font-medium text-ink active:scale-95 transition-transform">
            <Camera size={18} />
            <span>Fotocamera</span>
          </button>
          <button className="paper-card rounded-xl px-4 py-3.5 flex items-center justify-center gap-2 text-[13px] font-body font-medium text-ink active:scale-95 transition-transform">
            <ImageIcon size={18} />
            <span>Galleria</span>
          </button>
        </div>

        <div className="text-[11px] font-body text-ink-soft text-center mt-2 leading-snug">
          Le foto saranno visibili a tutti gli ospiti del compleanno.
        </div>
      </Sheet>
    </div>
  );
}

// ============================================================
// UPLOAD 2
// ============================================================
function Upload2View() {
  const [name, setName] = useStateS("");
  const [msg, setMsg] = useStateS("");
  return (
    <div className="absolute inset-0">
      <GalleriaView />
      <Sheet maxHeight="90%">
        <div className="flex flex-col overflow-y-auto no-scrollbar -mx-5 px-5 flex-1 min-h-0">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div
              className="font-heading italic text-ink tracking-tight"
              style={{ fontSize: 26 }}
            >
              3 foto pronte.
            </div>
            <button className="w-11 h-11 flex items-center justify-center text-ink-soft" aria-label="Chiudi">
              <XIcon size={24} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden paper-card">
                <img
                  src={`https://picsum.photos/seed/up${i}/200/200`}
                  className="w-full h-full object-cover"
                  alt=""
                />
                <button
                  className="absolute top-1 right-1 w-6 h-6 rounded-full text-paper flex items-center justify-center text-[14px] leading-none"
                  style={{ background: "rgba(28,20,16,0.7)" }}
                  aria-label="Rimuovi"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button className="text-[13px] font-body text-wine font-medium mb-5 active:opacity-70 text-left">
            + Aggiungi altre
          </button>

          <div className="h-px bg-line mb-5" />

          <div className="space-y-5 mb-4">
            <div>
              <label
                className="text-[11px] font-body uppercase text-ink-soft mb-2 block"
                style={{ letterSpacing: "0.15em" }}
              >
                Il tuo nome
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="(opzionale)"
                className="w-full bg-transparent border-0 border-b border-line py-2 text-[16px] font-body text-ink focus:outline-none focus:border-wine"
                style={{ borderBottomWidth: 1 }}
              />
            </div>
            <div>
              <label
                className="text-[11px] font-body uppercase text-ink-soft mb-2 block"
                style={{ letterSpacing: "0.15em" }}
              >
                Messaggio per Mattia
              </label>
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value.slice(0, 280))}
                rows={3}
                placeholder="Scrivi due righe..."
                className="w-full bg-transparent border-0 border-b border-line py-2 text-[16px] font-body text-ink resize-none focus:outline-none focus:border-wine"
                style={{ borderBottomWidth: 1 }}
              />
              <div className="text-[11px] font-body text-ink-soft tabular-nums text-right mt-1">
                {msg.length}/280
              </div>
            </div>
          </div>
        </div>

        <div
          className="sticky bottom-0 -mx-5 px-5 pt-4 pb-2 shrink-0"
          style={{ background: "var(--paper-soft)" }}
        >
          <button
            className="w-full bg-wine text-paper rounded-full py-4 text-[15px] font-body font-medium active:scale-[0.98] transition-transform"
          >
            Carica 3 foto
          </button>
        </div>
      </Sheet>
    </div>
  );
}

// ============================================================
// SUCCESS
// ============================================================
function SuccessView() {
  return (
    <div className="absolute inset-0">
      <GalleriaView />
      <Sheet maxHeight="60%">
        <div className="flex flex-col items-center justify-center text-center pt-8 pb-12 px-8 flex-1">
          <div className="text-wine mb-6">
            <CheckCircleAnimated size={72} />
          </div>
          <div
            className="font-heading italic text-ink leading-none mb-3"
            style={{ fontSize: 40, letterSpacing: "-1px" }}
          >
            Grazie.
          </div>
          <div
            className="text-[15px] font-body text-ink-soft leading-snug"
            style={{ maxWidth: "24ch" }}
          >
            Le tue foto sono in galleria. Buon compleanno Mattia.
          </div>
        </div>
        <div className="mt-auto px-5 pb-2 space-y-2 shrink-0">
          <button className="w-full bg-wine text-paper rounded-full py-4 text-[15px] font-body font-medium">
            Torna alla galleria
          </button>
          <div className="text-center">
            <a className="text-[13px] font-body text-ink-soft underline underline-offset-4 cursor-pointer">
              Carica altre foto
            </a>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

// ============================================================
// EMPTY
// ============================================================
function EmptyView({ triggerKey }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 overflow-y-auto no-scrollbar"><div className="min-h-full flex flex-col">
      {/* hero compressed at top */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-start justify-between mb-10">
          <div style={{ marginTop: -4, marginLeft: -4 }}>
            <Logo size={56} color="var(--wine)" />
          </div>
          <div />
        </div>
        <div
          className="text-[11px] font-body font-medium uppercase text-wine mb-3"
          style={{ letterSpacing: "0.18em" }}
        >
          13.05.2026 · Manfredonia
        </div>
        <BlurText
          text="Mattia ne fa diciotto."
          className="empty-headline font-heading italic text-ink"
          triggerKey={triggerKey}
        />
      </div>

      <div className="px-8 py-16 flex flex-col items-center text-center">
        <svg
          width="96"
          height="96"
          viewBox="0 0 32 32"
          fill="none"
          className="text-wine mb-6"
          style={{ opacity: 0.3 }}
          aria-hidden="true"
        >
          {/* bottle */}
          <path
            d="M14 4 H18 V8 L19 11 V26 H13 V11 L14 8 Z"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* glass left */}
          <path
            d="M4 14 L10 14 L9 22 Q7 23 5 22 Z M7 22 V26 M5 26 H9"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* glass right */}
          <path
            d="M22 14 L28 14 L27 22 Q25 23 23 22 Z M25 22 V26 M23 26 H27"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="text-[18px] font-heading italic text-ink-soft leading-snug mb-2">
          Le foto della serata appariranno qui.
        </div>
        <div
          className="text-[14px] font-body leading-snug"
          style={{ color: "rgba(90,78,69,0.8)", maxWidth: "28ch" }}
        >
          Sii il primo a caricarne una.
        </div>
      </div>
      </div></div>

      <button
        className="absolute bottom-6 right-5 z-20 bg-wine text-paper rounded-full w-14 h-14 flex items-center justify-center active:scale-90 transition-transform"
        style={{ boxShadow: "0 10px 25px rgba(122,30,43,0.35)" }}
        aria-label="Carica foto"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

// ============================================================
// ERROR
// ============================================================
function ErrorView() {
  return (
    <div className="absolute inset-0">
      <GalleriaView />
      <motion.div
        className="absolute left-4 right-4 bottom-24 z-40 paper-card-strong rounded-xl pl-3 pr-4 py-3 flex items-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="w-1 self-stretch bg-wine rounded-full -my-1" />
        <AlertTriangle size={20} className="text-wine shrink-0" />
        <div className="flex-1">
          <div className="text-[13px] font-body font-medium text-ink leading-tight">
            Foto troppo grande.
          </div>
          <div className="text-[12px] font-body text-ink-soft mt-0.5 leading-tight">
            Massimo 15MB. Riprova con un'immagine più piccola.
          </div>
        </div>
        <button
          className="w-8 h-8 flex items-center justify-center shrink-0"
          style={{ color: "rgba(90,78,69,0.6)" }}
          aria-label="Chiudi"
        >
          <XIcon size={18} />
        </button>
      </motion.div>
    </div>
  );
}

Object.assign(window, {
  SplashView,
  HeroView,
  GalleriaView,
  GalleriaSparseView,
  GalleriaPienaView,
  LightboxView,
  Upload1View,
  Upload2View,
  SuccessView,
  EmptyView,
  ErrorView,
});

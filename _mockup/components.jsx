/* global React, Motion */
const { motion, useInView, AnimatePresence } = window.Motion;
const { useState, useEffect, useRef, useMemo } = React;

// ---------- Icons (lucide-style outlines, currentColor) ----------
const IconBase = ({ size = 24, stroke = 1.6, children, className = "", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const Camera = (p) => (
  <IconBase {...p}>
    <path d="M5 7h3l1.5-2h5L16 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13" r="3.5" />
  </IconBase>
);
const ArrowUpRight = (p) => (
  <IconBase {...p}>
    <path d="M7 17 L17 7" />
    <path d="M9 7 H17 V15" />
  </IconBase>
);
const ArrowRight = (p) => (
  <IconBase {...p}>
    <path d="M5 12 H19" />
    <path d="M13 6 L19 12 L13 18" />
  </IconBase>
);
const ChevronDown = (p) => (
  <IconBase {...p}>
    <path d="M6 9 L12 15 L18 9" />
  </IconBase>
);
const Plus = (p) => (
  <IconBase {...p} stroke={2}>
    <path d="M12 5 V19" />
    <path d="M5 12 H19" />
  </IconBase>
);
const XIcon = (p) => (
  <IconBase {...p}>
    <path d="M6 6 L18 18" />
    <path d="M18 6 L6 18" />
  </IconBase>
);
const ImageIcon = (p) => (
  <IconBase {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="9" cy="11" r="1.6" />
    <path d="M3 17 L9 13 L14 17 L18 14 L21 16" />
  </IconBase>
);
const Users = (p) => (
  <IconBase {...p}>
    <circle cx="9" cy="9" r="3.5" />
    <path d="M3 19 q0-4 6-4 t6 4" />
    <circle cx="17" cy="9" r="2.8" />
    <path d="M17 13 q4 0 4 6" />
  </IconBase>
);
const AlertTriangle = (p) => (
  <IconBase {...p}>
    <path d="M12 4 L22 20 H2 Z" />
    <path d="M12 11 V14" />
    <circle cx="12" cy="17.5" r="0.6" fill="currentColor" />
  </IconBase>
);

// CheckCircle with animated pathLength
const CheckCircleAnimated = ({ size = 72 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <motion.circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    />
    <motion.path
      d="M8 12.5 L11 15.5 L16.5 9.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
    />
  </svg>
);

// ---------- Signature glyph ----------
const SignatureGlyph = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 30 30" fill="none" aria-hidden="true">
    <path
      d="M7 4 L23 4 L18 13 L18 22 M12 22 H24"
      stroke="var(--wine)"
      strokeWidth="1.4"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ---------- BlurText (word-by-word reveal) ----------
function BlurText({ text, className = "", delayMs = 100, triggerKey }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.1, once: true });
  const words = text.split(" ");

  return (
    <p
      ref={ref}
      className={className}
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        rowGap: "0.1em",
      }}
    >
      {words.map((w, i) => (
        <motion.span
          key={`${triggerKey || ""}-${i}-${w}`}
          style={{ display: "inline-block", marginRight: "0.28em" }}
          initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
          animate={
            inView
              ? {
                  filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
                  opacity: [0, 0.5, 1],
                  y: [50, -5, 0],
                }
              : {}
          }
          transition={{
            duration: 0.7,
            times: [0, 0.5, 1],
            ease: "easeOut",
            delay: (i * delayMs) / 1000,
          }}
        >
          {w}
        </motion.span>
      ))}
    </p>
  );
}

// ---------- Mock photo data ----------
const MOCK = [
  { caption: "the boyz ❤️", name: "Andrea" },
  { caption: "balcone vibes", name: "Sofia" },
  { caption: "auguri Matti, sei il migliore", name: "Anto" },
  { caption: null, name: null },
  { caption: "che squadra", name: "Leo" },
  { caption: "prima del crollo", name: "Giulia" },
  { caption: "best of the night", name: null },
  { caption: "auguri fratello", name: "Marco" },
  { caption: "non ricordo questa foto", name: "Chiara" },
  { caption: "selfie obbligatorio", name: "Sofia" },
  { caption: null, name: "Andrea" },
  { caption: "buon compleanno bro", name: null },
  { caption: "ti voglio bene scemo", name: "Giulia" },
  { caption: "torta time", name: null },
  { caption: "vista mare 🌊", name: "Leo" },
  { caption: null, name: null },
  { caption: "i veri amici", name: "Anto" },
  { caption: "qualcuno mi spiega", name: "Marco" },
  { caption: "vibes only", name: null },
  { caption: "ultima foto della notte", name: "Chiara" },
  { caption: null, name: null },
  { caption: "buon compleanno re", name: "Andrea" },
  { caption: "boh", name: null },
  { caption: "famiglia", name: "Sofia" },
  { caption: "che serata", name: null },
  { caption: null, name: "Leo" },
  { caption: "auguri capo", name: "Marco" },
  { caption: "ti adoriamo", name: "Giulia" },
];
const HEIGHTS = [700, 850, 900, 750, 1000, 800, 950, 720];

// Base motion preset (hero items)
const heroFade = (delay = 0) => ({
  initial: { filter: "blur(10px)", opacity: 0, y: 20 },
  animate: { filter: "blur(0px)", opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: "easeOut", delay },
});

// ---------- M18 Logo (path-based, paper-color fills) ----------
const LOGO_PATHS = {
  M: "M639.018,695.696C639.018,694.896 638.468,694.521 637.768,694.521C636.593,694.521 635.043,695.596 635.043,697.646C635.043,699.721 636.818,702.071 641.168,702.071C650.418,702.071 659.518,692.921 666.393,687.271L667.143,687.571C662.318,691.921 656.143,697.946 656.143,700.996C656.143,701.246 656.243,701.421 656.518,701.421C658.968,701.421 663.918,695.296 670.443,689.346L670.868,689.646C665.268,695.271 663.043,700.246 663.043,703.946C663.043,708.121 665.868,710.646 669.893,710.646C674.743,710.646 677.493,706.496 677.493,701.571C677.493,697.821 675.893,693.621 672.368,690.471C674.643,687.846 677.418,684.921 680.843,681.696L680.593,681.371C676.868,683.421 673.443,686.146 670.368,688.921C669.843,688.546 669.268,688.221 668.643,687.896C670.268,686.121 671.818,684.321 673.168,682.621L673.068,682.396C670.843,683.496 668.593,685.096 666.293,686.896C663.843,686.021 660.943,685.496 657.568,685.496C653.943,685.496 650.243,686.196 646.793,687.721L647.568,688.746C651.293,686.896 654.568,685.946 658.243,685.946C661.193,685.946 663.768,686.396 665.993,687.146C658.343,693.246 650.218,701.621 641.368,701.621C639.368,701.621 636.068,700.771 636.068,698.621C636.068,697.496 639.018,697.321 639.018,695.696ZM664.218,705.421C664.218,702.246 666.418,697.421 672.168,690.696C675.593,693.796 677.168,697.946 677.168,701.621C677.168,706.346 674.568,710.271 669.968,710.271C666.643,710.271 664.218,708.746 664.218,705.421ZM656.618,700.921C656.618,700.296 662.818,694.321 668.418,688.146C669.018,688.446 669.593,688.771 670.143,689.121C663.643,695.021 658.843,701.046 656.768,701.046C656.668,701.046 656.618,701.021 656.618,700.921ZM679.968,682.146C676.368,684.646 673.443,687.096 671.093,689.421L670.693,689.121C673.493,686.571 676.593,684.071 679.893,682.096L679.968,682.146ZM667.393,687.321C667.168,687.221 666.918,687.121 666.668,687.046C668.393,685.621 669.993,684.446 671.393,683.721L671.418,683.771L667.393,687.321Z",
  EIGHTEEN_SWOOSH:
    "M170.708,508.353C252.531,508.353 250.51,429.225 353.883,361.881L352.872,359.187C268.356,407.338 250.847,465.59 165.657,505.659L170.708,508.353Z",
  EIGHTEEN_BODY:
    "M618.206,423.5C618.206,423.5 580.83,382.421 493.62,382.421C489.243,382.421 485.202,382.758 481.162,382.758C481.835,380.401 482.172,377.707 482.172,375.013C482.172,354.473 463.652,344.035 441.429,344.035C410.114,344.035 371.055,364.912 366.341,407.338C366.004,408.685 365.668,409.695 365.668,411.042C302.701,440.673 265.663,485.456 265.663,503.976C265.663,509.363 268.693,512.394 275.091,512.394C346.811,512.394 371.729,480.742 373.749,411.379C392.605,402.961 413.818,395.89 437.388,391.176C437.388,397.236 440.419,403.971 450.184,403.971C465.673,403.971 475.774,396.226 479.815,386.125C484.866,386.125 489.916,385.788 494.967,385.788C579.483,385.788 617.196,426.531 617.196,426.531L618.206,423.5ZM475.774,370.972C475.774,370.972 442.103,373.329 437.725,387.808C414.492,392.186 393.278,398.92 374.086,407.001L374.086,401.95C374.086,365.922 411.798,347.402 441.429,347.402C460.285,347.402 475.774,355.147 475.774,370.972ZM270.04,504.313C270.04,490.507 303.375,446.06 364.321,415.756C352.872,454.142 294.283,508.69 274.08,508.69C271.387,508.69 270.04,507.006 270.04,504.313Z",
};

function Logo({ size = 60, color = "#7A1E2B" }) {
  // tight viewBox cropped to where the letterforms actually live
  return (
    <svg
      width={size}
      height={size * (950 / 1600)}
      viewBox="200 900 1600 950"
      fill={color}
      aria-hidden="true"
    >
      <g transform="matrix(29.410967,0,0,29.410967,-18394.773466,-19109.067564)">
        <path d={LOGO_PATHS.M} fillRule="nonzero" />
      </g>
      <g transform="matrix(2.244036,0,0,2.244036,-55.612925,321.843435)">
        <path d={LOGO_PATHS.EIGHTEEN_SWOOSH} />
        <path d={LOGO_PATHS.EIGHTEEN_BODY} />
      </g>
    </svg>
  );
}

// ---------- Animated splash logo: stroke-draw, then fill ----------
const SplashLogo = React.memo(function SplashLogo({ size = 280, color = "#F5EFE3" }) {
  const W = size;
  const H = size * (950 / 1600);
  // Draw timings (begin offsets in seconds)
  const beginM = 0.15;
  const durM = 1.6;
  const beginSw = 1.35;
  const durSw = 0.55;
  const begin18 = 1.55;
  const dur18 = 1.5;
  return (
    <div style={{ position: "relative", width: W, height: H }}>
      <svg
        width="100%"
        height="100%"
        viewBox="200 900 1600 950"
        fill="none"
        aria-hidden="true"
      >
        <g transform="matrix(29.410967,0,0,29.410967,-18394.773466,-19109.067564)">
          <path
            d={LOGO_PATHS.M}
            pathLength="1"
            stroke={color}
            strokeWidth={0.04}
            fill={color}
            fillOpacity={0}
            strokeDasharray="1"
            strokeDashoffset="1"
            fillRule="nonzero"
            vectorEffect="non-scaling-stroke"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="1"
              to="0"
              dur={`${durM}s`}
              begin={`${beginM}s`}
              fill="freeze"
              calcMode="spline"
              keySplines="0.65 0 0.35 1"
              keyTimes="0;1"
            />
            <animate
              attributeName="fill-opacity"
              from="0"
              to="1"
              dur="0.5s"
              begin={`${beginM + durM - 0.05}s`}
              fill="freeze"
            />
          </path>
        </g>
        <g transform="matrix(2.244036,0,0,2.244036,-55.612925,321.843435)">
          <path
            d={LOGO_PATHS.EIGHTEEN_SWOOSH}
            pathLength="1"
            stroke={color}
            strokeWidth={0.5}
            fill={color}
            fillOpacity={0}
            strokeDasharray="1"
            strokeDashoffset="1"
            vectorEffect="non-scaling-stroke"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="1"
              to="0"
              dur={`${durSw}s`}
              begin={`${beginSw}s`}
              fill="freeze"
              calcMode="spline"
              keySplines="0.65 0 0.35 1"
              keyTimes="0;1"
            />
            <animate
              attributeName="fill-opacity"
              from="0"
              to="1"
              dur="0.5s"
              begin={`${beginSw + durSw - 0.05}s`}
              fill="freeze"
            />
          </path>
          <path
            d={LOGO_PATHS.EIGHTEEN_BODY}
            pathLength="1"
            stroke={color}
            strokeWidth={0.5}
            fill={color}
            fillOpacity={0}
            strokeDasharray="1"
            strokeDashoffset="1"
            vectorEffect="non-scaling-stroke"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="1"
              to="0"
              dur={`${dur18}s`}
              begin={`${begin18}s`}
              fill="freeze"
              calcMode="spline"
              keySplines="0.65 0 0.35 1"
              keyTimes="0;1"
            />
            <animate
              attributeName="fill-opacity"
              from="0"
              to="1"
              dur="0.5s"
              begin={`${begin18 + dur18 - 0.05}s`}
              fill="freeze"
            />
          </path>
        </g>
      </svg>
    </div>
  );
});

Object.assign(window, { Logo, SplashLogo, LOGO_PATHS });

Object.assign(window, {
  motion,
  AnimatePresence,
  Camera,
  ArrowUpRight,
  ArrowRight,
  ChevronDown,
  Plus,
  XIcon,
  ImageIcon,
  Users,
  AlertTriangle,
  CheckCircleAnimated,
  SignatureGlyph,
  BlurText,
  MOCK,
  HEIGHTS,
  heroFade,
});

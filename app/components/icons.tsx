import type { ReactNode } from "react";

type IconProps = {
  size?: number;
  stroke?: number;
  className?: string;
  style?: React.CSSProperties;
};

function IconBase({
  size = 24,
  stroke = 1.6,
  children,
  className,
  style,
}: IconProps & { children: ReactNode }) {
  return (
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
}

export const Camera = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M5 7h3l1.5-2h5L16 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13" r="3.5" />
  </IconBase>
);

export const ArrowUpRight = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M7 17 L17 7" />
    <path d="M9 7 H17 V15" />
  </IconBase>
);

export const ArrowRight = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M5 12 H19" />
    <path d="M13 6 L19 12 L13 18" />
  </IconBase>
);

export const ChevronDown = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M6 9 L12 15 L18 9" />
  </IconBase>
);

export const Plus = (p: IconProps) => (
  <IconBase {...p} stroke={p.stroke ?? 2}>
    <path d="M12 5 V19" />
    <path d="M5 12 H19" />
  </IconBase>
);

export const XIcon = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M6 6 L18 18" />
    <path d="M18 6 L6 18" />
  </IconBase>
);

export const ImageIcon = (p: IconProps) => (
  <IconBase {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="9" cy="11" r="1.6" />
    <path d="M3 17 L9 13 L14 17 L18 14 L21 16" />
  </IconBase>
);

export const Users = (p: IconProps) => (
  <IconBase {...p}>
    <circle cx="9" cy="9" r="3.5" />
    <path d="M3 19 q0-4 6-4 t6 4" />
    <circle cx="17" cy="9" r="2.8" />
    <path d="M17 13 q4 0 4 6" />
  </IconBase>
);

export const AlertTriangle = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M12 4 L22 20 H2 Z" />
    <path d="M12 11 V14" />
    <circle cx="12" cy="17.5" r="0.6" fill="currentColor" />
  </IconBase>
);

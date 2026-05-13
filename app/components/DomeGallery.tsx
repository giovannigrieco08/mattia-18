"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

export type DomeImage = {
  src: string;
  alt?: string;
  caption?: string;
  name?: string;
};

type DragHandlers = {
  onDragStart?: (e: { event: PointerEvent }) => void;
  onDrag?: (e: {
    event: PointerEvent;
    last: boolean;
    velocity: [number, number];
    direction: [number, number];
    movement: [number, number];
  }) => void;
};

function useGestureShim(
  handlers: DragHandlers,
  options: { target: React.RefObject<HTMLElement | null> }
) {
  const { onDragStart, onDrag } = handlers;
  const target = options.target;
  // Stable refs to avoid re-binding on every parent render
  const startRef = useRef(onDragStart);
  const dragRef = useRef(onDrag);
  startRef.current = onDragStart;
  dragRef.current = onDrag;

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    const DRAG_THRESHOLD = 4;
    let started = false;
    let startPos: { x: number; y: number } | null = null;
    let lastPos: { x: number; y: number } | null = null;
    let lastTime = 0;
    let velocity: [number, number] = [0, 0];
    let direction: [number, number] = [0, 0];
    let activePointerId: number | null = null;
    let originalEvent: PointerEvent | null = null;

    const onPointerDown = (e: PointerEvent) => {
      if (activePointerId !== null) return;
      activePointerId = e.pointerId;
      started = false;
      startPos = { x: e.clientX, y: e.clientY };
      lastPos = { x: e.clientX, y: e.clientY };
      lastTime = performance.now();
      velocity = [0, 0];
      direction = [0, 0];
      originalEvent = e;
    };

    const maybeStart = (e: PointerEvent) => {
      if (started) return;
      started = true;
      startRef.current?.({ event: originalEvent ?? e });
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId || !startPos || !lastPos) return;
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      if (!started) {
        if (dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return;
        maybeStart(e);
      }
      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const mdx = e.clientX - lastPos.x;
      const mdy = e.clientY - lastPos.y;
      velocity = [Math.abs(mdx) / dt, Math.abs(mdy) / dt];
      direction = [Math.sign(mdx) || direction[0], Math.sign(mdy) || direction[1]];
      lastPos = { x: e.clientX, y: e.clientY };
      lastTime = now;
      const movement: [number, number] = [dx, dy];
      dragRef.current?.({ event: e, last: false, velocity, direction, movement });
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId) return;
      if (started && startPos) {
        const movement: [number, number] = [
          e.clientX - startPos.x,
          e.clientY - startPos.y,
        ];
        dragRef.current?.({ event: e, last: true, velocity, direction, movement });
      }
      activePointerId = null;
      started = false;
      startPos = null;
      originalEvent = null;
    };

    el.addEventListener("pointerdown", onPointerDown, { passive: true });
    el.addEventListener("pointermove", onPointerMove, { passive: true });
    el.addEventListener("pointerup", onPointerUp, { passive: true });
    el.addEventListener("pointercancel", onPointerUp, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
    };
  }, [target]);
}

const DEFAULTS = {
  maxVerticalRotationDeg: 5,
  dragSensitivity: 20,
  enlargeTransitionMs: 300,
  segments: 35,
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const normalizeAngle = (d: number) => ((d % 360) + 360) % 360;
const wrapAngleSigned = (deg: number) => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};
const getDataNumber = (el: HTMLElement, name: string, fallback: number) => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};

type Slot = {
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
  src: string;
  alt: string;
  caption: string;
  name: string;
  placeholder: boolean;
};

function buildItems(
  pool: DomeImage[],
  seg: number,
  options: { allowPlaceholders?: boolean }
): Slot[] {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];

  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map((y) => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  const totalSlots = coords.length;
  const emptySlot = { src: "", alt: "", caption: "", name: "", placeholder: true };
  if (pool.length === 0) return coords.map((c) => ({ ...c, ...emptySlot }));

  const normalizedImages = pool.map((image) => ({
    src: image.src || "",
    alt: image.alt || "",
    caption: image.caption || "",
    name: image.name || "",
    placeholder: false,
  }));

  if (options.allowPlaceholders && normalizedImages.length < totalSlots) {
    const result: Slot[] = coords.map((c) => ({ ...c, ...emptySlot }));
    // First slot near the front-center of the dome so a single photo is visible
    // without dragging. coords are laid out column-by-column starting from x=-37
    // (rotateY ≈ -5° from front), with each column holding 5 y-rows; index 2 hits
    // the middle row (y=0) of the front column.
    const FRONT_CENTER_SLOT = 2;
    const step = totalSlots / normalizedImages.length;
    for (let i = 0; i < normalizedImages.length; i++) {
      const slot = (FRONT_CENTER_SLOT + Math.floor(i * step)) % totalSlots;
      const im = normalizedImages[i];
      result[slot] = {
        ...result[slot],
        src: im.src,
        alt: im.alt,
        caption: im.caption,
        name: im.name,
        placeholder: false,
      };
    }
    return result;
  }

  const usedImages = Array.from(
    { length: totalSlots },
    (_, i) => normalizedImages[i % normalizedImages.length]
  );
  for (let i = 1; i < usedImages.length; i++) {
    if (usedImages[i].src === usedImages[i - 1].src) {
      for (let j = i + 1; j < usedImages.length; j++) {
        if (usedImages[j].src !== usedImages[i].src) {
          const tmp = usedImages[i];
          usedImages[i] = usedImages[j];
          usedImages[j] = tmp;
          break;
        }
      }
    }
  }
  return coords.map((c, i) => ({
    ...c,
    src: usedImages[i].src,
    alt: usedImages[i].alt,
    caption: usedImages[i].caption,
    name: usedImages[i].name,
    placeholder: false,
  }));
}

function computeItemBaseRotation(
  offsetX: number,
  offsetY: number,
  sizeX: number,
  sizeY: number,
  segments: number
) {
  const unit = 360 / segments / 2;
  const rotateY = unit * (offsetX + (sizeX - 1) / 2);
  const rotateX = unit * (offsetY - (sizeY - 1) / 2);
  return { rotateX, rotateY };
}

type DomeGalleryProps = {
  images: DomeImage[];
  fit?: number;
  fitBasis?: "auto" | "min" | "max" | "width" | "height";
  minRadius?: number;
  maxRadius?: number;
  padFactor?: number;
  overlayBlurColor?: string;
  maxVerticalRotationDeg?: number;
  dragSensitivity?: number;
  enlargeTransitionMs?: number;
  segments?: number;
  dragDampening?: number;
  openedImageWidth?: string;
  openedImageHeight?: string;
  imageBorderRadius?: string;
  openedImageBorderRadius?: string;
  grayscale?: boolean;
  allowPlaceholders?: boolean;
  placeholderColor?: string;
  placeholderMessage?: string;
};

export function DomeGallery({
  images,
  fit = 0.5,
  fitBasis = "auto",
  minRadius = 600,
  maxRadius = Infinity,
  padFactor = 0.25,
  overlayBlurColor = "#120F17",
  maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
  dragSensitivity = DEFAULTS.dragSensitivity,
  enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
  segments = DEFAULTS.segments,
  dragDampening = 2,
  openedImageWidth = "260px",
  openedImageHeight = "340px",
  imageBorderRadius = "16px",
  openedImageBorderRadius = "20px",
  grayscale = false,
  allowPlaceholders = false,
  placeholderColor = "#7A1E2B",
  placeholderMessage = "Non ci sono ancora abbastanza foto. Sii il primo a caricarne una.",
}: DomeGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const focusedElRef = useRef<HTMLElement | null>(null);
  const originalTilePositionRef = useRef<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  const rotationRef = useRef({ x: 0, y: 0 });
  const startRotRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const inertiaRAF = useRef<number | null>(null);
  const openingRef = useRef(false);
  const openStartedAtRef = useRef(0);
  const lastDragEndAt = useRef(0);
  const lockedRadiusRef = useRef<number | null>(null);

  const scrollLockedRef = useRef(false);
  const lockScroll = useCallback(() => {
    if (scrollLockedRef.current) return;
    scrollLockedRef.current = true;
    document.body.classList.add("dg-scroll-lock");
  }, []);
  const unlockScroll = useCallback(() => {
    if (!scrollLockedRef.current) return;
    if (rootRef.current?.getAttribute("data-enlarging") === "true") return;
    scrollLockedRef.current = false;
    document.body.classList.remove("dg-scroll-lock");
  }, []);

  const items = useMemo(
    () => buildItems(images || [], segments, { allowPlaceholders }),
    [images, segments, allowPlaceholders]
  );

  const applyTransform = (xDeg: number, yDeg: number) => {
    const el = sphereRef.current;
    if (el) {
      el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width);
      const h = Math.max(1, cr.height);
      const minDim = Math.min(w, h);
      const maxDim = Math.max(w, h);
      const aspect = w / h;
      let basis: number;
      switch (fitBasis) {
        case "min": basis = minDim; break;
        case "max": basis = maxDim; break;
        case "width": basis = w; break;
        case "height": basis = h; break;
        default: basis = aspect >= 1.3 ? w : minDim;
      }
      let radius = basis * fit;
      const heightGuard = h * 1.35;
      radius = Math.min(radius, heightGuard);
      radius = clamp(radius, minRadius, maxRadius);
      lockedRadiusRef.current = Math.round(radius);

      const viewerPad = Math.max(8, Math.round(minDim * padFactor));
      root.style.setProperty("--radius", `${lockedRadiusRef.current}px`);
      root.style.setProperty("--viewer-pad", `${viewerPad}px`);
      root.style.setProperty("--overlay-blur-color", overlayBlurColor);
      root.style.setProperty("--tile-radius", imageBorderRadius);
      root.style.setProperty("--enlarge-radius", openedImageBorderRadius);
      root.style.setProperty("--image-filter", grayscale ? "grayscale(1)" : "none");
      root.style.setProperty("--placeholder-color", placeholderColor);
      applyTransform(rotationRef.current.x, rotationRef.current.y);
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [
    fit,
    fitBasis,
    minRadius,
    maxRadius,
    padFactor,
    overlayBlurColor,
    grayscale,
    imageBorderRadius,
    openedImageBorderRadius,
    openedImageWidth,
    openedImageHeight,
    placeholderColor,
  ]);

  useEffect(() => {
    applyTransform(rotationRef.current.x, rotationRef.current.y);
  }, []);

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current !== null) {
      cancelAnimationFrame(inertiaRAF.current);
      inertiaRAF.current = null;
    }
  }, []);

  const startInertia = useCallback(
    (vx: number, vy: number) => {
      const MAX_V = 1.4;
      let vX = clamp(vx, -MAX_V, MAX_V) * 80;
      let vY = clamp(vy, -MAX_V, MAX_V) * 80;
      let frames = 0;
      const d = clamp(dragDampening ?? 0.6, 0, 1);
      const frictionMul = 0.94 + 0.055 * d;
      const stopThreshold = 0.015 - 0.01 * d;
      const maxFrames = Math.round(90 + 270 * d);
      const step = () => {
        vX *= frictionMul;
        vY *= frictionMul;
        if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
          inertiaRAF.current = null;
          return;
        }
        if (++frames > maxFrames) {
          inertiaRAF.current = null;
          return;
        }
        const nextX = clamp(
          rotationRef.current.x - vY / 200,
          -maxVerticalRotationDeg,
          maxVerticalRotationDeg
        );
        const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200);
        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);
        inertiaRAF.current = requestAnimationFrame(step);
      };
      stopInertia();
      inertiaRAF.current = requestAnimationFrame(step);
    },
    [dragDampening, maxVerticalRotationDeg, stopInertia]
  );

  useGestureShim(
    {
      onDragStart: ({ event }) => {
        if (focusedElRef.current) return;
        stopInertia();
        draggingRef.current = true;
        movedRef.current = false;
        startRotRef.current = { ...rotationRef.current };
        startPosRef.current = { x: event.clientX, y: event.clientY };
      },
      onDrag: ({ event, last, velocity = [0, 0], direction = [0, 0], movement }) => {
        if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return;
        const dxTotal = event.clientX - startPosRef.current.x;
        const dyTotal = event.clientY - startPosRef.current.y;
        if (!movedRef.current) {
          const dist2 = dxTotal * dxTotal + dyTotal * dyTotal;
          if (dist2 > 16) movedRef.current = true;
        }
        const nextX = clamp(
          startRotRef.current.x - dyTotal / dragSensitivity,
          -maxVerticalRotationDeg,
          maxVerticalRotationDeg
        );
        const nextY = wrapAngleSigned(startRotRef.current.y + dxTotal / dragSensitivity);
        if (rotationRef.current.x !== nextX || rotationRef.current.y !== nextY) {
          rotationRef.current = { x: nextX, y: nextY };
          applyTransform(nextX, nextY);
        }
        if (last) {
          draggingRef.current = false;
          const [vMagX, vMagY] = velocity;
          const [dirX, dirY] = direction;
          let vx = vMagX * dirX;
          let vy = vMagY * dirY;
          if (Math.abs(vx) < 0.001 && Math.abs(vy) < 0.001 && Array.isArray(movement)) {
            const [mx, my] = movement;
            vx = clamp((mx / dragSensitivity) * 0.02, -1.2, 1.2);
            vy = clamp((my / dragSensitivity) * 0.02, -1.2, 1.2);
          }
          if (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005) startInertia(vx, vy);
          if (movedRef.current) lastDragEndAt.current = performance.now();
          movedRef.current = false;
        }
      },
    },
    { target: mainRef }
  );

  useEffect(() => {
    const scrim = scrimRef.current;
    if (!scrim) return;
    const close = () => {
      if (performance.now() - openStartedAtRef.current < 250) return;
      const el = focusedElRef.current;
      if (!el) return;
      const parent = el.parentElement as HTMLElement | null;
      if (!parent) return;
      const overlay = viewerRef.current?.querySelector(".enlarge") as HTMLElement | null;
      if (!overlay) return;
      const refDiv = parent.querySelector(".item__image--reference") as HTMLElement | null;
      const originalPos = originalTilePositionRef.current;
      if (!originalPos) {
        overlay.remove();
        if (refDiv) refDiv.remove();
        parent.style.setProperty("--rot-y-delta", "0deg");
        parent.style.setProperty("--rot-x-delta", "0deg");
        el.style.visibility = "";
        el.style.zIndex = "0";
        focusedElRef.current = null;
        rootRef.current?.removeAttribute("data-enlarging");
        openingRef.current = false;
        unlockScroll();
        return;
      }
      const currentRect = overlay.getBoundingClientRect();
      const rootRect = rootRef.current!.getBoundingClientRect();
      const originalPosRel = {
        left: originalPos.left - rootRect.left,
        top: originalPos.top - rootRect.top,
        width: originalPos.width,
        height: originalPos.height,
      };
      const overlayRel = {
        left: currentRect.left - rootRect.left,
        top: currentRect.top - rootRect.top,
        width: currentRect.width,
        height: currentRect.height,
      };
      const animatingOverlay = document.createElement("div");
      animatingOverlay.className = "enlarge-closing";
      animatingOverlay.style.cssText = `position:absolute;left:${overlayRel.left}px;top:${overlayRel.top}px;width:${overlayRel.width}px;height:${overlayRel.height}px;z-index:9999;border-radius: var(--enlarge-radius, 32px);overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:all ${enlargeTransitionMs}ms ease-out;pointer-events:none;margin:0;transform:none;`;
      const originalImg = overlay.querySelector("img");
      if (originalImg) {
        const img = originalImg.cloneNode() as HTMLImageElement;
        img.style.cssText = "width:100%;height:100%;object-fit:cover;";
        animatingOverlay.appendChild(img);
      } else {
        animatingOverlay.style.background = "var(--placeholder-color, #7A1E2B)";
      }
      overlay.remove();
      rootRef.current!.appendChild(animatingOverlay);
      void animatingOverlay.getBoundingClientRect();
      requestAnimationFrame(() => {
        animatingOverlay.style.left = originalPosRel.left + "px";
        animatingOverlay.style.top = originalPosRel.top + "px";
        animatingOverlay.style.width = originalPosRel.width + "px";
        animatingOverlay.style.height = originalPosRel.height + "px";
        animatingOverlay.style.opacity = "0";
      });
      const cleanup = () => {
        animatingOverlay.remove();
        originalTilePositionRef.current = null;
        if (refDiv) refDiv.remove();
        parent.style.transition = "none";
        el.style.transition = "none";
        parent.style.setProperty("--rot-y-delta", "0deg");
        parent.style.setProperty("--rot-x-delta", "0deg");
        requestAnimationFrame(() => {
          el.style.visibility = "";
          el.style.opacity = "0";
          el.style.zIndex = "0";
          focusedElRef.current = null;
          rootRef.current?.removeAttribute("data-enlarging");
          requestAnimationFrame(() => {
            parent.style.transition = "";
            el.style.transition = "opacity 300ms ease-out";
            requestAnimationFrame(() => {
              el.style.opacity = "1";
              setTimeout(() => {
                el.style.transition = "";
                el.style.opacity = "";
                openingRef.current = false;
                if (
                  !draggingRef.current &&
                  rootRef.current?.getAttribute("data-enlarging") !== "true"
                ) {
                  document.body.classList.remove("dg-scroll-lock");
                }
              }, 300);
            });
          });
        });
      };
      animatingOverlay.addEventListener("transitionend", cleanup, { once: true });
    };
    scrim.addEventListener("click", close);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      scrim.removeEventListener("click", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [enlargeTransitionMs, unlockScroll]);

  const openItemFromElement = useCallback(
    (el: HTMLElement) => {
      if (openingRef.current) return;
      openingRef.current = true;
      openStartedAtRef.current = performance.now();
      lockScroll();
      const parent = el.parentElement as HTMLElement | null;
      if (!parent) {
        openingRef.current = false;
        return;
      }
      focusedElRef.current = el;
      el.setAttribute("data-focused", "true");
      const offsetX = getDataNumber(parent, "offsetX", 0);
      const offsetY = getDataNumber(parent, "offsetY", 0);
      const sizeX = getDataNumber(parent, "sizeX", 2);
      const sizeY = getDataNumber(parent, "sizeY", 2);
      const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments);
      const parentY = normalizeAngle(parentRot.rotateY);
      const globalY = normalizeAngle(rotationRef.current.y);
      let rotY = -(parentY + globalY) % 360;
      if (rotY < -180) rotY += 360;
      const rotX = -parentRot.rotateX - rotationRef.current.x;
      parent.style.setProperty("--rot-y-delta", `${rotY}deg`);
      parent.style.setProperty("--rot-x-delta", `${rotX}deg`);
      const refDiv = document.createElement("div");
      refDiv.className = "item__image item__image--reference";
      refDiv.style.opacity = "0";
      refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
      parent.appendChild(refDiv);
      void refDiv.offsetHeight;
      const tileR = refDiv.getBoundingClientRect();
      const mainR = mainRef.current?.getBoundingClientRect();
      const frameR = frameRef.current?.getBoundingClientRect();
      if (!mainR || !frameR || tileR.width <= 0 || tileR.height <= 0) {
        openingRef.current = false;
        focusedElRef.current = null;
        parent.removeChild(refDiv);
        unlockScroll();
        return;
      }
      originalTilePositionRef.current = {
        left: tileR.left,
        top: tileR.top,
        width: tileR.width,
        height: tileR.height,
      };
      el.style.visibility = "hidden";
      el.style.zIndex = "0";
      const overlay = document.createElement("div");
      overlay.className = "enlarge";
      overlay.style.position = "absolute";
      overlay.style.left = frameR.left - mainR.left + "px";
      overlay.style.top = frameR.top - mainR.top + "px";
      overlay.style.width = frameR.width + "px";
      overlay.style.height = frameR.height + "px";
      overlay.style.opacity = "0";
      overlay.style.zIndex = "30";
      overlay.style.willChange = "transform, opacity";
      overlay.style.transformOrigin = "top left";
      overlay.style.transition = `transform ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease`;
      const isPlaceholder = parent.dataset.placeholder === "true";
      const rawSrc = parent.dataset.src || el.querySelector("img")?.src || "";
      const rawCaption = parent.dataset.caption || "";
      const rawName = parent.dataset.name || "";
      if (isPlaceholder) {
        overlay.classList.add("enlarge--placeholder");
        const inner = document.createElement("div");
        inner.className = "enlarge__placeholder-inner";
        const title = document.createElement("div");
        title.className = "enlarge__placeholder-title";
        title.textContent = "Non ci sono ancora abbastanza foto.";
        const body = document.createElement("div");
        body.className = "enlarge__placeholder-body";
        body.textContent = placeholderMessage;
        inner.appendChild(title);
        inner.appendChild(body);
        overlay.appendChild(inner);
      } else {
        const img = document.createElement("img");
        img.src = rawSrc;
        overlay.appendChild(img);
      }
      if (!isPlaceholder && (rawCaption || rawName)) {
        const captionWrap = document.createElement("div");
        captionWrap.className = "enlarge-caption";
        captionWrap.style.opacity = "0";
        captionWrap.style.transform = "translateY(4px)";
        captionWrap.style.transition = "opacity 360ms ease-out, transform 360ms ease-out";
        if (rawCaption) {
          const c = document.createElement("div");
          c.className = "enlarge-caption__text";
          c.textContent = rawCaption;
          captionWrap.appendChild(c);
        }
        if (rawName) {
          const n = document.createElement("div");
          n.className = "enlarge-caption__name";
          n.textContent = rawName;
          captionWrap.appendChild(n);
        }
        overlay.appendChild(captionWrap);
        setTimeout(() => {
          captionWrap.style.opacity = "1";
          captionWrap.style.transform = "translateY(0)";
        }, 360);
      }
      viewerRef.current!.appendChild(overlay);
      const tx0 = tileR.left - frameR.left;
      const ty0 = tileR.top - frameR.top;
      const sx0 = tileR.width / frameR.width;
      const sy0 = tileR.height / frameR.height;
      const validSx0 = isFinite(sx0) && sx0 > 0 ? sx0 : 1;
      const validSy0 = isFinite(sy0) && sy0 > 0 ? sy0 : 1;
      overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${validSx0}, ${validSy0})`;
      setTimeout(() => {
        if (!overlay.parentElement) return;
        overlay.style.opacity = "1";
        overlay.style.transform = "translate(0px, 0px) scale(1, 1)";
        rootRef.current?.setAttribute("data-enlarging", "true");
      }, 16);

      const wantsResize = openedImageWidth || openedImageHeight;
      if (wantsResize) {
        const onFirstEnd = (ev: TransitionEvent) => {
          if (ev.propertyName !== "transform") return;
          overlay.removeEventListener("transitionend", onFirstEnd);
          const prevTransition = overlay.style.transition;
          overlay.style.transition = "none";
          const tempWidth = openedImageWidth || `${frameR.width}px`;
          const tempHeight = openedImageHeight || `${frameR.height}px`;
          overlay.style.width = tempWidth;
          overlay.style.height = tempHeight;
          const newRect = overlay.getBoundingClientRect();
          overlay.style.width = frameR.width + "px";
          overlay.style.height = frameR.height + "px";
          void overlay.offsetWidth;
          overlay.style.transition = `left ${enlargeTransitionMs}ms ease, top ${enlargeTransitionMs}ms ease, width ${enlargeTransitionMs}ms ease, height ${enlargeTransitionMs}ms ease`;
          const centeredLeft = frameR.left - mainR.left + (frameR.width - newRect.width) / 2;
          const centeredTop = frameR.top - mainR.top + (frameR.height - newRect.height) / 2;
          requestAnimationFrame(() => {
            overlay.style.left = `${centeredLeft}px`;
            overlay.style.top = `${centeredTop}px`;
            overlay.style.width = tempWidth;
            overlay.style.height = tempHeight;
          });
          const cleanupSecond = () => {
            overlay.removeEventListener("transitionend", cleanupSecond);
            overlay.style.transition = prevTransition;
          };
          overlay.addEventListener("transitionend", cleanupSecond, { once: true });
        };
        overlay.addEventListener("transitionend", onFirstEnd);
      }
    },
    [
      enlargeTransitionMs,
      lockScroll,
      openedImageHeight,
      openedImageWidth,
      placeholderMessage,
      segments,
      unlockScroll,
    ]
  );

  const onTileClick = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (draggingRef.current) return;
      if (movedRef.current) return;
      if (performance.now() - lastDragEndAt.current < 80) return;
      if (openingRef.current) return;
      openItemFromElement(e.currentTarget);
    },
    [openItemFromElement]
  );

  const onTilePointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== "touch") return;
      if (draggingRef.current) return;
      if (movedRef.current) return;
      if (performance.now() - lastDragEndAt.current < 80) return;
      if (openingRef.current) return;
      openItemFromElement(e.currentTarget);
    },
    [openItemFromElement]
  );

  useEffect(
    () => () => {
      document.body.classList.remove("dg-scroll-lock");
    },
    []
  );

  const rootStyle: CSSProperties & Record<string, string | number> = {
    "--segments-x": segments,
    "--segments-y": segments,
    "--overlay-blur-color": overlayBlurColor,
    "--tile-radius": imageBorderRadius,
    "--enlarge-radius": openedImageBorderRadius,
    "--image-filter": grayscale ? "grayscale(1)" : "none",
  };

  return (
    <div ref={rootRef} className="sphere-root" style={rootStyle}>
      <main ref={mainRef} className="sphere-main">
        <div className="stage">
          <div ref={sphereRef} className="sphere">
            {items.map((it, i) => {
              const itemStyle: CSSProperties & Record<string, string | number> = {
                "--offset-x": it.x,
                "--offset-y": it.y,
                "--item-size-x": it.sizeX,
                "--item-size-y": it.sizeY,
              };
              return (
                <div
                  key={`${it.x},${it.y},${i}`}
                  className="item"
                  data-src={it.src}
                  data-caption={it.caption}
                  data-name={it.name}
                  data-placeholder={it.placeholder ? "true" : "false"}
                  data-offset-x={it.x}
                  data-offset-y={it.y}
                  data-size-x={it.sizeX}
                  data-size-y={it.sizeY}
                  style={itemStyle}
                >
                  <div
                    className={"item__image" + (it.placeholder ? " item__image--placeholder" : "")}
                    role="button"
                    tabIndex={0}
                    aria-label={it.placeholder ? "Slot vuoto" : it.alt || "Open image"}
                    onClick={onTileClick}
                    onPointerUp={onTilePointerUp}
                  >
                    {it.placeholder ? (
                      <div className="item__placeholder-mark" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.src} draggable={false} alt={it.alt} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="overlay" />
        <div className="overlay overlay--blur" />
        <div className="edge-fade edge-fade--top" />
        <div className="edge-fade edge-fade--bottom" />

        <div className="viewer" ref={viewerRef}>
          <div ref={scrimRef} className="scrim" />
          <div ref={frameRef} className="frame" />
        </div>
      </main>
    </div>
  );
}

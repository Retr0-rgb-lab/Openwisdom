"use client";

/**
 * React Bits Magic Bento — adapted (no GSAP; Spec 08)
 * https://reactbits.dev/components/magic-bento
 * Source: DavidHDev/react-bits (TS-TW MagicBento)
 *
 * Overlay Atlas: primary/mist glow (not purple 132,0,255).
 * Magnetism off by default (catalog UX). RM / coarse pointer / mobile = static.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/** Overlay Atlas primary #1C4BD1 */
export const MAGIC_GLOW_PRIMARY = "28, 75, 209";
/** Overlay Atlas mist #88ADC0 — soft secondary spark */
export const MAGIC_GLOW_MIST = "136, 173, 192";

const DEFAULT_PARTICLE_COUNT = 10;
const DEFAULT_SPOTLIGHT_RADIUS = 280;
const MOBILE_BREAKPOINT = 768;

function canAnimate(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: fine)").matches &&
    window.matchMedia("(min-width: 768px)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function createParticle(
  x: number,
  y: number,
  color: string,
): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "ow-magic-particle";
  el.style.cssText = `
    position: absolute;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: rgba(${color}, 0.95);
    box-shadow: 0 0 8px rgba(${color}, 0.45);
    pointer-events: none;
    z-index: 20;
    left: ${x}px;
    top: ${y}px;
    will-change: transform, opacity;
  `;
  return el;
}

function updateCardGlow(
  card: HTMLElement,
  mouseX: number,
  mouseY: number,
  glow: number,
  radius: number,
) {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;
  card.style.setProperty("--glow-x", `${relativeX}%`);
  card.style.setProperty("--glow-y", `${relativeY}%`);
  card.style.setProperty("--glow-intensity", String(glow));
  card.style.setProperty("--glow-radius", `${radius}px`);
}

/* ------------------------------------------------------------------ */
/* MagicBentoCard — single plate                                      */
/* ------------------------------------------------------------------ */

export function MagicBentoCard({
  children,
  className,
  style,
  glowColor = MAGIC_GLOW_PRIMARY,
  enableBorderGlow = true,
  enableStars = true,
  enableTilt = false,
  enableMagnetism = false,
  clickEffect = false,
  particleCount = DEFAULT_PARTICLE_COUNT,
  disableAnimations,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  glowColor?: string;
  enableBorderGlow?: boolean;
  enableStars?: boolean;
  enableTilt?: boolean;
  /** Default false — whole-card pull rejected on skills */
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  particleCount?: number;
  disableAnimations?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hovered = useRef(false);
  const seedRef = useRef<HTMLDivElement[]>([]);
  const seeded = useRef(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const apply = () =>
      setLive(disableAnimations === true ? false : canAnimate());
    apply();
    const mq1 = window.matchMedia("(pointer: fine)");
    const mq2 = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mq3 = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`);
    mq1.addEventListener("change", apply);
    mq2.addEventListener("change", apply);
    mq3.addEventListener("change", apply);
    return () => {
      mq1.removeEventListener("change", apply);
      mq2.removeEventListener("change", apply);
      mq3.removeEventListener("change", apply);
    };
  }, [disableAnimations]);

  const clearParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    particlesRef.current.forEach((p) => {
      p.style.transition = "opacity 0.25s ease, transform 0.25s ease";
      p.style.opacity = "0";
      p.style.transform = "scale(0)";
      window.setTimeout(() => p.parentNode?.removeChild(p), 280);
    });
    particlesRef.current = [];
  }, []);

  const spawnParticles = useCallback(() => {
    const card = cardRef.current;
    if (!card || !hovered.current || !enableStars) return;

    if (!seeded.current) {
      const { width, height } = card.getBoundingClientRect();
      seedRef.current = Array.from({ length: particleCount }, () =>
        createParticle(
          Math.random() * width,
          Math.random() * height,
          glowColor,
        ),
      );
      seeded.current = true;
    }

    seedRef.current.forEach((particle, index) => {
      const id = setTimeout(() => {
        if (!hovered.current || !cardRef.current) return;
        const clone = particle.cloneNode(true) as HTMLDivElement;
        const dx = (Math.random() - 0.5) * 90;
        const dy = (Math.random() - 0.5) * 90;
        const rot = Math.random() * 360;
        clone.style.opacity = "0";
        clone.style.transform = "scale(0)";
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);
        requestAnimationFrame(() => {
          clone.style.transition =
            "opacity 0.35s ease, transform 2.4s ease-in-out";
          clone.style.opacity = "0.85";
          clone.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(1)`;
        });
        // soft pulse loop via second transition
        const pulse = window.setInterval(() => {
          if (!clone.isConnected) {
            clearInterval(pulse);
            return;
          }
          clone.style.opacity = clone.style.opacity === "0.35" ? "0.9" : "0.35";
        }, 1200);
        clone.dataset.pulse = String(pulse);
      }, index * 90);
      timeoutsRef.current.push(id);
    });
  }, [enableStars, glowColor, particleCount]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || !live) return;

    const onEnter = () => {
      hovered.current = true;
      spawnParticles();
    };

    const onLeave = () => {
      hovered.current = false;
      clearParticles();
      el.style.transform = "";
      if (!el.classList.contains("ow-magic-card--grid-glow")) {
        el.style.setProperty("--glow-intensity", "0");
      }
    };

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      // Local border-glow when not driven by grid spotlight
      if (enableBorderGlow) {
        updateCardGlow(el, e.clientX, e.clientY, 1, DEFAULT_SPOTLIGHT_RADIUS);
      }

      if (enableTilt) {
        const rx = ((y - cy) / cy) * -6;
        const ry = ((x - cx) / cx) * 6;
        el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }

      if (enableMagnetism) {
        const mx = (x - cx) * 0.04;
        const my = (y - cy) * 0.04;
        el.style.transform = `${
          enableTilt
            ? `perspective(1000px) rotateX(${((y - cy) / cy) * -6}deg) rotateY(${((x - cx) / cx) * 6}deg) `
            : ""
        }translate3d(${mx}px, ${my}px, 0)`;
      }
    };

    const onClick = (e: MouseEvent) => {
      if (!clickEffect) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const maxD = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height),
      );
      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: absolute;
        width: ${maxD * 2}px;
        height: ${maxD * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle,
          rgba(${glowColor}, 0.28) 0%,
          rgba(${glowColor}, 0.12) 35%,
          transparent 70%);
        left: ${x - maxD}px;
        top: ${y - maxD}px;
        pointer-events: none;
        z-index: 30;
        transform: scale(0);
        opacity: 1;
        transition: transform 0.7s cubic-bezier(0.16,1,0.3,1), opacity 0.7s ease;
      `;
      el.appendChild(ripple);
      requestAnimationFrame(() => {
        ripple.style.transform = "scale(1)";
        ripple.style.opacity = "0";
      });
      window.setTimeout(() => ripple.remove(), 750);
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("click", onClick);
    return () => {
      hovered.current = false;
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("click", onClick);
      clearParticles();
      particlesRef.current.forEach((p) => {
        const id = p.dataset.pulse;
        if (id) clearInterval(Number(id));
      });
    };
  }, [
    live,
    enableBorderGlow,
    enableTilt,
    enableMagnetism,
    clickEffect,
    glowColor,
    spawnParticles,
    clearParticles,
  ]);

  return (
    <div
      ref={cardRef}
      data-magic-bento-card=""
      className={cn(
        /* Default w-full; callers may pass h-full when equal-height stretch is desired */
        "ow-magic-card relative min-h-0 w-full overflow-hidden rounded-xl",
        enableBorderGlow && "ow-magic-card--border-glow",
        className,
      )}
      style={
        {
          ...style,
          ["--glow-x" as string]: "50%",
          ["--glow-y" as string]: "50%",
          ["--glow-intensity" as string]: "0",
          ["--glow-radius" as string]: "200px",
          ["--glow-color" as string]: glowColor,
          transition: "transform 0.2s ease-out",
        } as CSSProperties
      }
    >
      {/* Border-glow recipe lives on card so related-cards work outside grid */}
      {enableBorderGlow ? (
        <style>{`
          .ow-magic-card--border-glow::after {
            content: '';
            position: absolute;
            inset: 0;
            padding: 1.5px;
            border-radius: inherit;
            background: radial-gradient(
              var(--glow-radius) circle at var(--glow-x) var(--glow-y),
              rgba(var(--glow-color), calc(var(--glow-intensity) * 0.85)) 0%,
              rgba(var(--glow-color), calc(var(--glow-intensity) * 0.35)) 28%,
              rgba(${MAGIC_GLOW_MIST}, calc(var(--glow-intensity) * 0.18)) 48%,
              transparent 68%
            );
            -webkit-mask:
              linear-gradient(#fff 0 0) content-box,
              linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask:
              linear-gradient(#fff 0 0) content-box,
              linear-gradient(#fff 0 0);
            mask-composite: exclude;
            pointer-events: none;
            z-index: 5;
          }
          .ow-magic-card--border-glow:hover {
            box-shadow:
              0 1px 0 rgb(15 23 36 / 0.04),
              0 8px 28px -6px rgb(28 75 209 / calc(0.12 + var(--glow-intensity) * 0.18));
          }
          @media (prefers-reduced-motion: reduce) {
            .ow-magic-card--border-glow::after { display: none; }
            .ow-magic-particle { display: none !important; }
          }
        `}</style>
      ) : null}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MagicBentoGrid — section spotlight + glow driver                   */
/* ------------------------------------------------------------------ */

export function MagicBentoGrid({
  children,
  className,
  glowColor = MAGIC_GLOW_PRIMARY,
  enableSpotlight = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  disableAnimations,
}: {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  enableSpotlight?: boolean;
  spotlightRadius?: number;
  disableAnimations?: boolean;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const apply = () =>
      setLive(disableAnimations === true ? false : canAnimate());
    apply();
    window
      .matchMedia("(prefers-reduced-motion: reduce)")
      .addEventListener("change", apply);
    return () =>
      window
        .matchMedia("(prefers-reduced-motion: reduce)")
        .removeEventListener("change", apply);
  }, [disableAnimations]);

  useEffect(() => {
    if (!live || !enableSpotlight || !gridRef.current) return;

    const spot = document.createElement("div");
    spot.className = "ow-magic-global-spotlight";
    spot.style.cssText = `
      position: fixed;
      width: 720px;
      height: 720px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.12) 0%,
        rgba(${glowColor}, 0.06) 18%,
        rgba(${MAGIC_GLOW_MIST}, 0.04) 32%,
        transparent 62%);
      z-index: 40;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: multiply;
      transition: opacity 0.2s ease;
    `;
    document.body.appendChild(spot);
    spotRef.current = spot;

    const proximity = spotlightRadius * 0.5;
    const fadeDistance = spotlightRadius * 0.75;

    const onMove = (e: MouseEvent) => {
      const section = gridRef.current;
      const spotEl = spotRef.current;
      if (!section || !spotEl) return;

      const rect = section.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      const cards = section.querySelectorAll<HTMLElement>(".ow-magic-card");

      if (!inside) {
        spotEl.style.opacity = "0";
        cards.forEach((c) => c.style.setProperty("--glow-intensity", "0"));
        return;
      }

      let minDistance = Infinity;
      cards.forEach((card) => {
        card.classList.add("ow-magic-card--grid-glow");
        const cr = card.getBoundingClientRect();
        const cx = cr.left + cr.width / 2;
        const cy = cr.top + cr.height / 2;
        const distance =
          Math.hypot(e.clientX - cx, e.clientY - cy) -
          Math.max(cr.width, cr.height) / 2;
        const effective = Math.max(0, distance);
        minDistance = Math.min(minDistance, effective);

        let glow = 0;
        if (effective <= proximity) glow = 1;
        else if (effective <= fadeDistance) {
          glow = (fadeDistance - effective) / (fadeDistance - proximity);
        }
        updateCardGlow(card, e.clientX, e.clientY, glow, spotlightRadius);
      });

      spotEl.style.left = `${e.clientX}px`;
      spotEl.style.top = `${e.clientY}px`;
      const opacity =
        minDistance <= proximity
          ? 0.7
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.7
            : 0;
      spotEl.style.opacity = String(opacity);
    };

    const onLeave = () => {
      if (spotRef.current) spotRef.current.style.opacity = "0";
      gridRef.current
        ?.querySelectorAll<HTMLElement>(".ow-magic-card")
        .forEach((c) => c.style.setProperty("--glow-intensity", "0"));
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      spotRef.current?.parentNode?.removeChild(spotRef.current);
      spotRef.current = null;
    };
  }, [live, enableSpotlight, glowColor, spotlightRadius]);

  return (
    <div
      ref={gridRef}
      data-magic-bento-grid=""
      className={cn("ow-magic-bento-section relative", className)}
      style={
        {
          ["--glow-color" as string]: glowColor,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

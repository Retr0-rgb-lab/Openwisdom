"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Adapted from React Bits "Dot Field" (reactbits.dev, MIT + Commons Clause).
// Direction-B adaptation (specs/02 §6/§7, specs/04 §5):
// - REMOVED all cursor interaction (bulge/wave), glow and sparkle effects.
// - Static or extremely slow drift only; reduced-motion and mobile render once.
// - Low alpha so it stays a background field, never a HUD wallpaper.
export function DotField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const ink =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--ow-ink")
        .trim() || "#0E141B";

    let raf = 0;
    let width = 0;
    let height = 0;
    const spacing = 28;

    // Deterministic pseudo-random per dot (stable across frames).
    const jitter = (x: number, y: number) => {
      const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return n - Math.floor(n);
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (offsetY: number) => {
      ctx.clearRect(0, 0, width, height);
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 2;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = ((j * spacing + offsetY) % (height + spacing)) - spacing / 2;
          const alpha = 0.05 + jitter(i, j) * 0.11;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = ink;
          ctx.beginPath();
          ctx.arc(x, y, 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    resize();
    const isMobile = window.innerWidth < 768;

    if (reduceMotion || isMobile) {
      draw(0);
    } else {
      // Extremely slow vertical drift (~2px/s): orientation field, not animation show.
      const start = performance.now();
      const tick = (now: number) => {
        draw(((now - start) / 1000) * 2);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    const onResize = () => {
      resize();
      if (reduceMotion || window.innerWidth < 768) draw(0);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}

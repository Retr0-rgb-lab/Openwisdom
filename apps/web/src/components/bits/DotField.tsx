"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Dot Field background (specs/08 MUST).
 * Point colors = primary / structure / mist (logo tokens); no cursor bulge.
 * RM / optional static = single frame.
 * Pauses rAF when the document is hidden; re-checks prefers-reduced-motion live.
 */
export function DotField({
  className,
  static: forceStatic = false,
}: {
  className?: string;
  /** Force a static frame (no drift). */
  static?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const styles = getComputedStyle(document.documentElement);
    const primary =
      styles.getPropertyValue("--ow-primary").trim() || "#1C4BD1";
    const structure =
      styles.getPropertyValue("--ow-structure").trim() || "#2E6975";
    const mist = styles.getPropertyValue("--ow-mist").trim() || "#88ADC0";

    let raf = 0;
    let width = 0;
    let height = 0;
    const spacing = 26;

    // Drift clock — frozen while paused so resume continues smoothly
    let start = performance.now();
    let pausedAt: number | null = null;
    let pausedAccum = 0;

    const mqlReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqlMobile = window.matchMedia("(max-width: 767px)");

    const jitter = (x: number, y: number) => {
      const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return n - Math.floor(n);
    };

    const pickColor = (r: number) => {
      // Sparse primary accents; structure mid; mist field majority
      if (r > 0.9) return primary;
      if (r > 0.72) return structure;
      return mist;
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // Prefer parent box; fall back to viewport for fixed full-bleed backdrops
      width = parent.clientWidth || window.innerWidth;
      height = parent.clientHeight || window.innerHeight;
      if (width < 2 || height < 2) return;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (offsetY: number, t = 0) => {
      if (width < 2 || height < 2) return;
      ctx.clearRect(0, 0, width, height);
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 2;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing + Math.sin(t * 0.0004 + j * 0.15) * 1.2;
          const y =
            ((j * spacing + offsetY) % (height + spacing)) - spacing / 2;
          const r = jitter(i, j);
          const isAccent = r > 0.88;
          ctx.fillStyle = pickColor(r);
          // Visible range: mist field quiet, accents a bit stronger
          ctx.globalAlpha = isAccent ? 0.3 + r * 0.1 : 0.14 + r * 0.16;
          ctx.beginPath();
          ctx.arc(x, y, isAccent ? 1.45 : 1.15, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const elapsed = (now: number) => now - start - pausedAccum;

    const stopLoop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const tick = (now: number) => {
      const speed = mqlMobile.matches ? 4 : 8;
      const t = elapsed(now);
      draw((t / 1000) * speed, t);
      raf = requestAnimationFrame(tick);
    };

    const shouldAnimate = () =>
      !forceStatic && !mqlReduce.matches && !document.hidden;

    const syncMode = () => {
      stopLoop();
      resize();

      if (!shouldAnimate()) {
        // Freeze clock while static/paused so resume continues
        if (pausedAt === null) pausedAt = performance.now();
        draw(0, 0);
        return;
      }

      // Resume clock after pause (tab hidden or RM off → on)
      if (pausedAt !== null) {
        pausedAccum += performance.now() - pausedAt;
        pausedAt = null;
      }
      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      if (document.hidden) {
        // Pause without tearing down mode
        if (raf) {
          stopLoop();
          if (pausedAt === null) pausedAt = performance.now();
        }
        return;
      }
      syncMode();
    };

    const onResize = () => {
      resize();
      if (!shouldAnimate()) {
        draw(0, 0);
      }
      // Live loop will redraw next frame if animating
    };

    const onReduceChange = () => {
      // Reset drift origin when RM flips so we don't jump mid-session oddly
      start = performance.now();
      pausedAt = null;
      pausedAccum = 0;
      syncMode();
    };

    resize();
    syncMode();

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    // Safari < 14 fallback: addListener/removeListener
    if (typeof mqlReduce.addEventListener === "function") {
      mqlReduce.addEventListener("change", onReduceChange);
    } else {
      mqlReduce.addListener(onReduceChange);
    }

    return () => {
      stopLoop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      if (typeof mqlReduce.removeEventListener === "function") {
        mqlReduce.removeEventListener("change", onReduceChange);
      } else {
        mqlReduce.removeListener(onReduceChange);
      }
    };
  }, [forceStatic]);

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 z-0", className)}
    >
      <canvas ref={canvasRef} className="block size-full" />
    </div>
  );
}

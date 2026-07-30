"use client";

import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/**
 * Low-intensity spotlight on hover (specs/08 MAY Spotlight Card).
 * Primary/mist radial — no neon glow stack, no copper.
 */
export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 50, y: 50, on: false });

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSpot({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
      on: true,
    });
  }, []);

  const onLeave = useCallback(() => {
    setSpot((s) => ({ ...s, on: false }));
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "relative flex h-full min-h-0 flex-col overflow-hidden transition-[border-color,box-shadow] duration-300",
        className,
      )}
      style={
        {
          "--spot-x": `${spot.x}%`,
          "--spot-y": `${spot.y}%`,
        } as CSSProperties
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit] opacity-0 transition-opacity duration-300 motion-reduce:hidden"
        style={{
          opacity: spot.on ? 1 : 0,
          background: `radial-gradient(420px circle at var(--spot-x) var(--spot-y), color-mix(in srgb, var(--ow-primary) 10%, transparent), color-mix(in srgb, var(--ow-mist) 14%, transparent) 42%, transparent 58%)`,
        }}
      />
      <div className="relative z-[1] flex h-full min-h-0 flex-col overflow-visible">
        {children}
      </div>
    </div>
  );
}

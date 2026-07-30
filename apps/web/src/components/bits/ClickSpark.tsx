"use client";

import { useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Spec 08 MAY — spark only on successful tool feedback (copy).
 * Primary/signal flecks; slightly stronger burst; duration ≤450ms.
 * RM = no particles.
 */
export function ClickSpark({
  children,
  className,
  active = false,
}: {
  children: ReactNode;
  className?: string;
  /** True while celebrating a successful action (~200–450ms) */
  active?: boolean;
}) {
  const reduce = useReducedMotion();
  const show = Boolean(active && !reduce);

  return (
    <span className={cn("relative inline-flex", className)}>
      {children}
      {show ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-visible"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="ow-click-spark absolute left-1/2 top-1/2 size-2 rounded-full"
              style={
                {
                  background:
                    i % 2 === 0 ? "var(--ow-primary)" : "var(--ow-signal)",
                  "--a": `${i * 45}deg`,
                  // Alternate travel distance for a fuller burst
                  "--dist": i % 2 === 0 ? "-28px" : "-22px",
                } as CSSProperties
              }
            />
          ))}
        </span>
      ) : null}
      <style>{`
        .ow-click-spark {
          animation: ow-spark 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes ow-spark {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(var(--a)) translateY(0) scale(1.15);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(var(--a)) translateY(var(--dist, -28px)) scale(0.3);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ow-click-spark { animation: none !important; display: none; }
        }
      `}</style>
    </span>
  );
}

"use client";

import { useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Spec 08 MAY — spark only on successful tool feedback (copy).
 * Primary/signal flecks; RM = no particles.
 */
export function ClickSpark({
  children,
  className,
  active = false,
}: {
  children: ReactNode;
  className?: string;
  /** True while celebrating a successful action (~200–400ms) */
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
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="ow-click-spark absolute left-1/2 top-1/2 size-1.5 rounded-full"
              style={
                {
                  background:
                    i % 2 === 0 ? "var(--ow-primary)" : "var(--ow-signal)",
                  "--a": `${i * 60}deg`,
                } as CSSProperties
              }
            />
          ))}
        </span>
      ) : null}
      <style>{`
        .ow-click-spark {
          animation: ow-spark 0.42s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes ow-spark {
          0% {
            opacity: 0.95;
            transform: translate(-50%, -50%) rotate(var(--a)) translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(var(--a)) translateY(-20px) scale(0.35);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ow-click-spark { animation: none !important; display: none; }
        }
      `}</style>
    </span>
  );
}

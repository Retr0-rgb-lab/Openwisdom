"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * BlurText H1 entrance (specs/04 §5–§6) — one-shot settle on mount.
 * Strengthened vs prior (y:12 blur:10 was easy to miss under fast LCP).
 */
export function BlurText({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const units = useMemo(
    () => (/\s/.test(text) ? text.split(/(\s+)/) : Array.from(text)),
    [text],
  );

  if (reduceMotion) {
    return <span className={cn("inline-block", className)}>{text}</span>;
  }

  return (
    <motion.span
      className={cn("inline-block", className)}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.04,
            delayChildren: delay,
          },
        },
      }}
    >
      {units.map((unit, i) => (
        <motion.span
          key={`${i}-${unit}`}
          className="inline-block will-change-[transform,filter,opacity]"
          variants={{
            // Floor opacity > 0 for C7; blur for focal H1 only (Spec 08 animate)
            hidden: {
              opacity: 0.18,
              y: 14,
              filter: "blur(8px)",
            },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              },
            },
          }}
        >
          {unit === " " ? "\u00A0" : unit}
        </motion.span>
      ))}
    </motion.span>
  );
}

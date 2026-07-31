"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Stagger list entrance — transform-only (y).
 *
 * Do NOT lower opacity on list items. Catalog cards sit over ShapeGrid;
 * opacity < 1 multiplies white plates into ghost gray, and whileInView
 * delays / filter remounts leave items stranded mid-floor (entity bug).
 * Spec 08 C7: content must remain fully opaque.
 * Prefer not nesting under another Reveal on the same block.
 */
export function Stagger({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="show"
      /* Generous root margin so filter remounts in sticky+fold still fire */
      viewport={{ once: true, amount: 0.05, margin: "40px 0px 40px 0px" }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger, delayChildren: 0.04 },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={cn("h-full min-h-0", className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(
        /* self-start grids: width fills cell; avoid h-full stretch fighting top-align */
        "min-h-0 w-full will-change-transform",
        className,
      )}
      variants={{
        /* Opacity always 1 — small lift only (large y left some cards stranded mid-row) */
        hidden: { opacity: 1, y: 8 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

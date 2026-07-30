"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

// Adapted from React Bits "Blur Text" (reactbits.dev, MIT + Commons Clause).
// Direction-B adaptation: plays exactly once on mount (specs/02 §6 — brand
// settle is one-shot, never looping). When `text` changes later (locale
// switch), new glyphs appear instantly — no re-run of the hero animation
// (specs/04 §6: language switch crossfades copy, never replays heavy motion).
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
  const [played, setPlayed] = useState(false);

  // Word-split for spaced scripts (en), glyph-split for CJK (zh).
  const units = useMemo(
    () => (/\s/.test(text) ? text.split(/(\s+)/) : Array.from(text)),
    [text],
  );

  const initial = reduceMotion || played ? (false as const) : "hidden";

  return (
    <motion.span
      className={cn("inline-block", className)}
      initial={initial}
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.035, delayChildren: delay } },
      }}
      onAnimationComplete={() => {
        setPlayed(true);
      }}
    >
      {units.map((unit, i) => (
        <motion.span
          key={`${i}-${unit}`}
          className="inline-block will-change-transform"
          variants={{
            hidden: { opacity: 0, y: 12, filter: "blur(10px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.5, ease: "easeOut" },
            },
          }}
        >
          {unit === " " ? " " : unit}
        </motion.span>
      ))}
    </motion.span>
  );
}

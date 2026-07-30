"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Spec 08 MAY — one-shot typewriter (install CLI demo).
 * Never loops. prefers-reduced-motion → full text immediately.
 */
export function TextType({
  text,
  className,
  /** Ms per character. Default 28. */
  speed = 28,
  /** Delay before typing starts (ms). */
  delay = 0,
  /** Optional callback when typing finishes. */
  onComplete,
}: {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <span className={cn("inline", className)}>{text}</span>;
  }

  // key=text remounts so typing restarts cleanly when the string changes
  return (
    <TextTypeOnce
      key={text}
      text={text}
      className={className}
      speed={speed}
      delay={delay}
      onComplete={onComplete}
    />
  );
}

function TextTypeOnce({
  text,
  className,
  speed,
  delay,
  onComplete,
}: {
  text: string;
  className?: string;
  speed: number;
  delay: number;
  onComplete?: () => void;
}) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    let i = 0;
    let intervalId = 0;
    const startId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        i += 1;
        setShown(text.slice(0, i));
        if (i >= text.length) {
          window.clearInterval(intervalId);
          onComplete?.();
        }
      }, Math.max(8, speed));
    }, Math.max(0, delay));

    return () => {
      window.clearTimeout(startId);
      window.clearInterval(intervalId);
    };
    // Mount-once (parent remounts via key=text); onComplete is fire-and-forget.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot typewriter
  }, [text, speed, delay]);

  const done = shown.length >= text.length;

  return (
    <span className={cn("inline", className)}>
      {shown}
      {!done ? (
        <span
          aria-hidden
          className="ow-text-type-caret ml-px inline-block w-[0.5ch] translate-y-px border-r-2 border-current opacity-70"
        />
      ) : null}
      <style>{`
        .ow-text-type-caret {
          animation: ow-text-type-caret 0.9s step-end infinite;
        }
        @keyframes ow-text-type-caret {
          50% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ow-text-type-caret { animation: none !important; display: none; }
        }
      `}</style>
    </span>
  );
}

"use client";

import { cn } from "@/lib/utils";

/**
 * Harness trust strip (specs/08 C5 LogoLoop).
 * Animated only on md+ when motion allowed; cycle ≥36s; hover pauses.
 * Mobile / prefers-reduced-motion → static wrap row.
 */
export function LogoLoop({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  const row = (ariaHidden: boolean, keyPrefix: string) => (
    <div
      key={keyPrefix}
      aria-hidden={ariaHidden || undefined}
      className="flex shrink-0 items-center"
    >
      {items.map((item) => (
        <span
          key={`${keyPrefix}-${item}`}
          className="mx-8 font-sans text-sm font-medium tracking-wide whitespace-nowrap text-ink-muted md:text-[0.95rem]"
        >
          {item}
        </span>
      ))}
    </div>
  );

  return (
    <div className={cn("relative w-full", className)}>
      <div
        className="group relative hidden overflow-hidden md:block motion-reduce:hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div className="ow-logo-loop flex w-max group-hover:[animation-play-state:paused]">
          {row(false, "a")}
          {row(true, "b")}
        </div>
      </div>
      {/* Static: mobile OR reduced-motion */}
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 md:hidden motion-reduce:flex motion-reduce:md:flex">
        {items.map((item) => (
          <span
            key={item}
            className="font-sans text-sm font-medium tracking-wide text-ink-muted"
          >
            {item}
          </span>
        ))}
      </div>
      <style>{`
        .ow-logo-loop {
          animation: ow-logo-loop 40s linear infinite;
        }
        @keyframes ow-logo-loop {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ow-logo-loop { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

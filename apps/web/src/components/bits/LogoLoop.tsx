"use client";

import { cn } from "@/lib/utils";

// Adapted from React Bits "Logo Loop" (reactbits.dev, MIT + Commons Clause).
// Direction-B adaptation (specs/04 §5 Tier A allows a harness trust loop, but
// specs/02 §7 bans attention-hogging marquee seas):
// - extremely slow (90s per cycle), pauses on hover;
// - reduced-motion and mobile render a static wrapped row instead;
// - plain text wordmarks only — no third-party brand glyphs.
export function LogoLoop({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  const row = (ariaHidden: boolean) => (
    <div
      aria-hidden={ariaHidden || undefined}
      className="flex shrink-0 items-center"
    >
      {items.map((item) => (
        <span
          key={item}
          className="mx-7 font-sans text-sm font-medium tracking-wide whitespace-nowrap text-ink-muted"
        >
          {item}
        </span>
      ))}
    </div>
  );

  return (
    <div className={cn("relative", className)}>
      {/* Animated loop: md+ and motion-allowed only */}
      <div
        className="group relative hidden overflow-hidden md:block"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        }}
      >
        <div className="ow-logo-loop flex w-max group-hover:[animation-play-state:paused]">
          {row(false)}
          {row(true)}
        </div>
      </div>
      {/* Static fallback: mobile, or when reduced motion is preferred */}
      <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 md:hidden motion-reduce:flex motion-reduce:md:flex">
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
        .ow-logo-loop { animation: ow-logo-loop 90s linear infinite; }
        @keyframes ow-logo-loop { to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) {
          .ow-logo-loop { animation: none; }
        }
      `}</style>
    </div>
  );
}

import { cn } from "@/lib/utils";

// Specs/02: Noise 3–5% — previous 0.04 was near-invisible on #EEF1F2.
// Slightly higher opacity so grain reads as archive texture.
const NOISE_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.7'/%3E%3C/svg%3E\")";

export function Noise({
  className,
  opacity = 0.07,
}: {
  className?: string;
  /** Default 0.07 (~spec 3–5%+ readable on cool field) */
  opacity?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 z-[1]", className)}
      style={{
        backgroundImage: NOISE_URI,
        opacity,
        mixBlendMode: "multiply",
      }}
    />
  );
}

import { cn } from "@/lib/utils";

// Adapted from React Bits "Noise" (reactbits.dev, MIT + Commons Clause).
// Static print/archive grain at ~4% opacity (specs/02 §5: Noise 3–5%).
// Pure SVG turbulence data-URI — no JS, no motion, server-safe.
const NOISE_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")";

export function Noise({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{ backgroundImage: NOISE_URI, opacity: 0.04 }}
    />
  );
}

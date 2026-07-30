import { cn } from "@/lib/utils";

// Datum cross/pin motif (specs/02 §3, direction B): a copper coordinate
// crosshair with a center dot. Self-drawn — deliberately not the repo-root
// logo.svg (blue/cyan grid, off-direction).
export function DatumMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn("size-4 text-datum", className)}
    >
      <path d="M8 1.5v13M1.5 8h13" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="8" cy="8" r="2" fill="currentColor" />
    </svg>
  );
}

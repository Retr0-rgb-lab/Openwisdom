"use client";

import { ShapeGrid } from "@/components/bits/ShapeGrid";
import { Noise } from "@/components/bits/Noise";
import { usePathname } from "@/i18n/navigation";

/**
 * Global field: React Bits Shape Grid
 * https://reactbits.dev/backgrounds/shape-grid
 *
 * Animated + cursor (same as Home) on:
 *   /  ·  /skills  ·  /skills/*
 * Other routes: static grid, no hover fill.
 *
 * next-intl usePathname strips locale prefix.
 */
function usesLiveShapeGrid(pathname: string): boolean {
  const p = pathname || "/";
  if (p === "/" || p === "") return true;
  if (p === "/skills" || p.startsWith("/skills/")) return true;
  return false;
}

export function SiteBackdrop() {
  const pathname = usePathname();
  const live = usesLiveShapeGrid(pathname);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-field"
    >
      <ShapeGrid
        className="opacity-50"
        speed={0.14}
        direction="right"
        shape="square"
        squareSize={40}
        hoverTrailAmount={live ? 5 : 0}
        static={!live}
        interactive={live}
      />
      <Noise opacity={0.04} className="z-[1]" />
    </div>
  );
}

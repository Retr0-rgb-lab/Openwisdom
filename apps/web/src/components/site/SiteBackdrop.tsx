"use client";

import { DotField } from "@/components/bits/DotField";
import { Noise } from "@/components/bits/Noise";

/**
 * Global page field (Spec 08 MUST):
 * DotField (HEAVY ambient) + static Noise 3–7%.
 * Fixed under all routes; content sits in relative z-10 chrome.
 * RM: DotField freezes to one frame (see DotField).
 */
export function SiteBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-field"
    >
      {/* HEAVY #1 — quiet drift; opacity keeps field readable */}
      <DotField className="opacity-[0.55]" />
      {/* Texture only — not a heavy */}
      <Noise opacity={0.055} className="z-[1]" />
    </div>
  );
}

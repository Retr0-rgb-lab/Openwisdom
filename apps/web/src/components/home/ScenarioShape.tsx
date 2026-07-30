import { cn } from "@/lib/utils";

export type ScenarioShapeKind = "circle" | "triangle" | "square";

/** Logo-language micro marks: circle / triangle / square (spec 07). */
export function ScenarioShape({
  kind,
  className,
}: {
  kind: ScenarioShapeKind;
  className?: string;
}) {
  const base = cn("size-10 shrink-0", className);

  if (kind === "circle") {
    return (
      <svg viewBox="0 0 40 40" className={base} aria-hidden>
        <circle
          cx="20"
          cy="20"
          r="14"
          fill="color-mix(in srgb, var(--ow-primary) 14%, transparent)"
          stroke="var(--ow-primary)"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (kind === "triangle") {
    return (
      <svg viewBox="0 0 40 40" className={base} aria-hidden>
        <path
          d="M20 8 L34 32 H6 Z"
          fill="color-mix(in srgb, var(--ow-signal) 16%, transparent)"
          stroke="var(--ow-signal)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 40 40" className={base} aria-hidden>
      <rect
        x="9"
        y="9"
        width="22"
        height="22"
        rx="3"
        fill="color-mix(in srgb, var(--ow-structure) 14%, transparent)"
        stroke="var(--ow-structure)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

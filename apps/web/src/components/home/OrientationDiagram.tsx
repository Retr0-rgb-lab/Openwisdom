import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// The Home mnemonic (specs/02 §5): a bounded coordinate field with three value
// axes and a copper datum cross — "you are here". Static-first SVG; one-shot
// 600ms settle draw under no-preference motion only, never looping, and the
// grid stays strictly inside this panel (no full-page wallpaper grid).
export function OrientationDiagram({ className }: { className?: string }) {
  const t = useTranslations("home.hero.diagram");

  return (
    <figure
      className={cn(
        "rounded-xl border border-line bg-surface p-4 md:p-6",
        className,
      )}
    >
      <svg
        viewBox="0 0 400 300"
        role="img"
        aria-label={t("ariaLabel")}
        className="h-auto w-full"
      >
        {/* Local coordinate grid — bounded to this panel only */}
        <g stroke="var(--ow-line)" strokeWidth="0.75" opacity="0.5">
          {[50, 100, 150, 200, 250, 300, 350].map((x) => (
            <line key={`v${x}`} x1={x} y1="16" x2={x} y2="284" />
          ))}
          {[50, 100, 150, 200, 250].map((y) => (
            <line key={`h${y}`} x1="16" y1={y} x2="384" y2={y} />
          ))}
        </g>

        {/* Range rings around the datum */}
        <g
          stroke="var(--ow-datum)"
          strokeWidth="0.75"
          fill="none"
          opacity="0.45"
          strokeDasharray="3 4"
          className="od-draw"
        >
          <circle cx="200" cy="190" r="46" />
          <circle cx="200" cy="190" r="92" />
        </g>

        {/* Three value axes from the datum */}
        <g
          stroke="var(--ow-ink)"
          strokeWidth="1"
          opacity="0.8"
          className="od-draw"
        >
          <line x1="200" y1="190" x2="86" y2="64" />
          <line x1="200" y1="190" x2="200" y2="44" />
          <line x1="200" y1="190" x2="314" y2="64" />
        </g>
        <g fill="var(--ow-ink)" fontSize="12" fontFamily="inherit">
          <text x="86" y="52" textAnchor="middle">
            {t("macro")}
          </text>
          <text x="200" y="34" textAnchor="middle">
            {t("anchor")}
          </text>
          <text x="314" y="52" textAnchor="middle">
            {t("meta")}
          </text>
        </g>

        {/* Copper datum cross — you are here */}
        <g stroke="var(--ow-datum)" strokeWidth="1.5" className="od-draw">
          <line x1="200" y1="168" x2="200" y2="212" />
          <line x1="178" y1="190" x2="222" y2="190" />
        </g>
        <circle cx="200" cy="190" r="5" fill="var(--ow-datum)" />
        <text
          x="200"
          y="234"
          textAnchor="middle"
          fontSize="12"
          fontFamily="inherit"
          fill="var(--ow-datum)"
          fontWeight="600"
        >
          {t("youAreHere")}
        </text>
      </svg>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .od-draw {
            stroke-dasharray: 400;
            stroke-dashoffset: 400;
            animation: od-settle 0.6s ease-out forwards;
          }
        }
        @keyframes od-settle { to { stroke-dashoffset: 0; } }
      `}</style>
    </figure>
  );
}

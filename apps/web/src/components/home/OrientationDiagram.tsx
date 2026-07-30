import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * Hero orientation panel (specs/07 §5–§6, 08).
 * Grid + logo three-shape language (circle / square / triangle),
 * not a copper crosshair HUD. One-shot settle; RM = static.
 */
export function OrientationDiagram({ className }: { className?: string }) {
  const t = useTranslations("home.hero.diagram");

  return (
    <figure
      className={cn(
        "rounded-xl border border-line bg-surface/90 p-4 shadow-sm backdrop-blur-[2px] md:p-6",
        className,
      )}
    >
      <svg
        viewBox="0 0 400 300"
        role="img"
        aria-label={t("ariaLabel")}
        className="h-auto w-full"
      >
        {/* Soft panel field */}
        <rect
          x="28"
          y="28"
          width="344"
          height="244"
          rx="8"
          fill="var(--ow-field)"
          stroke="var(--ow-line)"
          strokeWidth="1"
        />

        {/* 5×5 grid inside panel only (specs/07: no full-bleed wallpaper grid) */}
        <g stroke="var(--ow-line)" strokeWidth="0.75" opacity="0.65">
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const x = 48 + i * 60.8;
            const y = 48 + i * 40.8;
            return (
              <g key={`g${i}`}>
                <line x1={x} y1="48" x2={x} y2="252" />
                <line x1="48" y1={y} x2="352" y2={y} />
              </g>
            );
          })}
        </g>

        {/* Three-shape overlay (logo semantics): circle / square / triangle */}
        <g className="od-shapes" style={{ mixBlendMode: "multiply" }}>
          {/* Circle — macro / whole (primary) */}
          <circle
            className="od-shape"
            cx="148"
            cy="150"
            r="62"
            fill="var(--ow-primary)"
            fillOpacity="0.9"
          />
          {/* Square — structure (structure teal) */}
          <rect
            className="od-shape od-shape-delay"
            x="168"
            y="98"
            width="96"
            height="96"
            rx="6"
            fill="var(--ow-structure)"
            fillOpacity="0.85"
          />
          {/* Triangle — individual / anchor (signal) */}
          <path
            className="od-shape od-shape-delay-2"
            d="M214 220 L320 220 L320 114 Z"
            fill="var(--ow-signal)"
            fillOpacity="0.9"
            stroke="var(--ow-signal)"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </g>

        {/* Light glass edge on the panel */}
        <rect
          x="48"
          y="48"
          width="304"
          height="204"
          rx="4"
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1"
          pointerEvents="none"
        />

        {/* Labels — same triad as ScenarioCards: circle=macro, triangle=anchor, square=meta */}
        <g
          className="od-fade"
          fill="var(--ow-ink)"
          fontSize="12"
          fontFamily="inherit"
        >
          <text x="148" y="78" textAnchor="middle" fill="var(--ow-primary)" fontWeight="600">
            {t("macro")}
          </text>
          <text x="318" y="100" textAnchor="middle" fill="var(--ow-signal)" fontWeight="600">
            {t("anchor")}
          </text>
          <text x="216" y="88" textAnchor="middle" fill="var(--ow-structure)" fontWeight="600">
            {t("meta")}
          </text>
        </g>

        <text
          className="od-fade"
          x="200"
          y="268"
          textAnchor="middle"
          fontSize="12"
          fontFamily="inherit"
          fill="var(--ow-primary)"
          fontWeight="600"
        >
          {t("youAreHere")}
        </text>
      </svg>
      <style>{`
        /* Spec 08 C7: never rest at opacity 0 — motion is transform-only so
           shapes stay visible if animation is skipped or interrupted. */
        @media (prefers-reduced-motion: no-preference) {
          .od-shape {
            transform-box: fill-box;
            transform-origin: center;
            animation: od-shape-in 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
          }
          .od-shape-delay { animation-delay: 0.1s; }
          .od-shape-delay-2 { animation-delay: 0.2s; }
          .od-fade {
            animation: od-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both;
          }
        }
        @keyframes od-shape-in {
          from { transform: translateY(12px) scale(0.94); }
          to { transform: translateY(0) scale(1); }
        }
        @keyframes od-fade {
          from { transform: translateY(6px); }
          to { transform: translateY(0); }
        }
      `}</style>
    </figure>
  );
}

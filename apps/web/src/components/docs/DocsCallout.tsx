import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DocsCalloutVariant = "info" | "tip" | "warn" | "neutral";

const variantClass: Record<DocsCalloutVariant, string> = {
  info: "border-primary/20 bg-primary/5 text-ink",
  tip: "border-structure/25 bg-structure/10 text-ink",
  warn: "border-signal/30 bg-signal/10 text-ink",
  neutral: "border-line bg-surface text-ink",
};

/**
 * Notion-calm callout: soft fill + hairline border, no thick side stripe.
 */
export function DocsCallout({
  variant = "neutral",
  title,
  children,
  className,
}: {
  variant?: DocsCalloutVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "rounded-lg border px-4 py-3 text-sm leading-relaxed",
        variantClass[variant],
        className,
      )}
    >
      {title ? (
        <p className="mb-1.5 font-medium text-ink">{title}</p>
      ) : null}
      <div className="text-ink-muted [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline [&_code]:rounded [&_code]:bg-surface-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-ink">
        {children}
      </div>
    </aside>
  );
}

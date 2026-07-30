import { cn } from "@/lib/utils";
import { Reveal } from "@/components/bits/Reveal";

/**
 * layout: generous section pad, tight heading stack.
 * reveal=false when children own Stagger (no nested transform).
 */
export function Section({
  id,
  className,
  children,
  delay = 0,
  reveal = true,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  delay?: number;
  reveal?: boolean;
}) {
  const inner = (
    <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">{children}</div>
  );
  return (
    <section id={id} className={cn("border-b border-line", className)}>
      {reveal ? <Reveal delay={delay}>{inner}</Reveal> : inner}
    </section>
  );
}

/**
 * typeset roles: optional kicker (structure) · serif display H2 · muted lede.
 * layout: more space under title than above subtitle (group rhythm).
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-12 flex max-w-2xl flex-col gap-3 md:mb-14 md:gap-3.5",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-[0.8125rem] font-semibold tracking-[-0.01em] text-structure">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-serif text-[1.85rem] leading-[1.15] font-semibold tracking-[-0.025em] text-ink md:text-[2.35rem] md:leading-[1.12]">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-[42rem] text-base leading-[1.65] text-ink-muted md:text-[1.0625rem]">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

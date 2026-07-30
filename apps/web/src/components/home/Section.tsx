import { cn } from "@/lib/utils";
import { DatumMark } from "@/components/site/DatumMark";

// Shared section rhythm (旧 plan Phase D): tight inside a group, loose between
// groups; heading top-margin > bottom-margin.
export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("border-b border-line", className)}>
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-10 flex max-w-2xl flex-col gap-4 md:mb-14", className)}>
      <p className="flex items-center gap-2 text-meta font-medium tracking-widest text-ink-muted uppercase">
        <DatumMark className="size-3" />
        {eyebrow}
      </p>
      <h2 className="font-serif text-3xl leading-tight text-ink md:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-body leading-relaxed text-ink-muted">{subtitle}</p>
      ) : null}
    </div>
  );
}

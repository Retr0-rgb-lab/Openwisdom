import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DocsCodeBlock } from "./DocsCodeBlock";
import { DocsHeadingLink } from "./DocsHeadingLink";

/** Shared article header for docs pages. */
export function DocsArticleHeader({
  title,
  lede,
  id = "page-title",
  actions,
}: {
  title: string;
  lede?: string;
  id?: string;
  /** Optional top-right control (e.g. Copy LLM prompt). */
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8">
      <div className="flex items-start justify-between gap-3">
        <h1
          id={id}
          className="group min-w-0 flex-1 scroll-mt-28 flex items-baseline gap-2 font-serif text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-ink md:text-[2.125rem]"
        >
          <span>{title}</span>
          <DocsHeadingLink id={id} size="lg" />
        </h1>
        {actions ? (
          <div className="shrink-0 pt-1">{actions}</div>
        ) : null}
      </div>
      {lede ? (
        <p className="mt-3 max-w-prose text-base leading-[1.65] text-ink-muted md:text-[1.0625rem]">
          {lede}
        </p>
      ) : null}
    </header>
  );
}

/** Anchored H2 for docs hub / one-off headings (same chain treatment as DocsSection). */
export function DocsHeading({
  as: Tag = "h2",
  id,
  children,
  className,
  linkSize = "md",
}: {
  as?: "h1" | "h2";
  id: string;
  children: ReactNode;
  className?: string;
  linkSize?: "sm" | "md" | "lg";
}) {
  return (
    <Tag
      id={id}
      className={cn(
        "group scroll-mt-28 flex items-baseline gap-1.5 font-serif font-semibold text-ink",
        className,
      )}
    >
      <span>{children}</span>
      <DocsHeadingLink id={id} size={linkSize} />
    </Tag>
  );
}

export function DocsSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10" aria-labelledby={id}>
      <h2
        id={id}
        className="group scroll-mt-28 flex items-baseline gap-1.5 font-serif text-xl font-semibold text-ink md:text-[1.35rem]"
      >
        <span>{title}</span>
        <DocsHeadingLink id={id} size="md" />
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-muted md:text-[0.9375rem]">
        {children}
      </div>
    </section>
  );
}

export function DocsProseList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** Command / code sample with one-click copy (via DocsCodeBlock). */
export function DocsCode({ children }: { children: string }) {
  return <DocsCodeBlock code={children} />;
}

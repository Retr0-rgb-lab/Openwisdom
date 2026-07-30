"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { DocsTocItem } from "./nav";

/**
 * Sticky "On this page" — color-only active state, no motion theater.
 */
export function DocsToc({ items }: { items: DocsTocItem[] }) {
  const t = useTranslations("pages.docs.nav");
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) return;
    const els = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0]?.target.id;
        if (top) setActiveId(top);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    for (const el of els) observer.observe(el);
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <aside className="hidden w-44 shrink-0 xl:block">
      <div className="sticky top-24">
        <p className="mb-3 text-meta font-medium tracking-wide text-ink-muted uppercase">
          {t("onThisPage")}
        </p>
        <nav aria-label={t("onThisPage")} className="flex flex-col gap-1">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn(
                "border-l border-transparent py-1 pl-2.5 text-sm transition-colors duration-150",
                activeId === item.id
                  ? "border-primary text-primary"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}

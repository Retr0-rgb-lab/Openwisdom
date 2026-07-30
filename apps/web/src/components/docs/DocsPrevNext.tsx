"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { getDocsNavNeighbors } from "./nav";

export function DocsPrevNext() {
  const t = useTranslations("pages.docs.nav");
  const pathname = usePathname();
  const { prev, next } = getDocsNavNeighbors(pathname);

  if (!prev && !next) return null;

  return (
    <nav
      aria-label={t("pageNav")}
      className="mt-12 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:justify-between"
    >
      {prev ? (
        <Link
          href={prev.href}
          className="group flex max-w-xs flex-col gap-1 rounded-lg border border-line bg-surface px-4 py-3 transition-colors duration-150 hover:bg-surface-muted"
        >
          <span className="inline-flex items-center gap-1 text-meta text-ink-muted">
            <ArrowLeft className="size-3.5" />
            {t("prev")}
          </span>
          <span className="text-sm font-medium text-ink group-hover:text-primary">
            {t(prev.labelKey)}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group flex max-w-xs flex-col gap-1 rounded-lg border border-line bg-surface px-4 py-3 text-right transition-colors duration-150 hover:bg-surface-muted sm:ml-auto sm:items-end"
        >
          <span className="inline-flex items-center gap-1 text-meta text-ink-muted">
            {t("next")}
            <ArrowRight className="size-3.5" />
          </span>
          <span className="text-sm font-medium text-ink group-hover:text-primary">
            {t(next.labelKey)}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}

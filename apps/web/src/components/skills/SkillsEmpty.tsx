"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { CatalogEntry } from "@/data/catalog/types";
import { Link } from "@/i18n/navigation";
import { GITHUB_URL } from "@/components/site/constants";
import { pickLocalized } from "@/data/catalog/types";
import { useLocale } from "next-intl";

export function SkillsEmpty({
  featured,
  onClear,
}: {
  featured: CatalogEntry[];
  onClear: () => void;
}) {
  const t = useTranslations("skills.empty");
  const locale = useLocale();

  return (
    <div className="rounded-xl border border-line bg-surface px-6 py-10 md:px-8 md:py-12">
      <h2 className="font-serif text-xl font-semibold tracking-[-0.02em] text-ink md:text-2xl">
        {t("title")}
      </h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-muted md:text-base">
        {t("description")}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" variant="default" onClick={onClear}>
          {t("clear")}
        </Button>
        <Button
          variant="outline"
          render={
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" />
          }
        >
          {t("github")}
        </Button>
        <Button variant="ghost" render={<Link href="/contribute" />}>
          {t("contribute")}
        </Button>
      </div>

      {featured.length > 0 ? (
        <div className="mt-8 border-t border-line pt-6">
          <p className="text-sm font-medium text-structure">{t("featuredTitle")}</p>
          <ul className="mt-3 flex flex-col gap-2">
            {featured.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={`/skills/${entry.slug}`}
                  className="text-sm font-medium text-ink underline-offset-4 hover:text-primary hover:underline"
                >
                  {pickLocalized(entry.title, locale)}
                  <span className="ml-2 font-mono text-xs text-ink-muted">
                    {entry.slug}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SkillDetail } from "@/components/skills/SkillDetail";
import {
  getCatalog,
  getCatalogWithHeat,
  getSkillBySlug,
  getSkillBySlugWithHeat,
} from "@/data/catalog/server";
import { pickLocalized } from "@/data/catalog/types";
import { getStatsInProcess } from "@/lib/heat/get-stats";
import { routing } from "@/i18n/routing";

type Params = Promise<{ locale: string; slug: string }>;

export function generateStaticParams() {
  const skills = getCatalog();
  return routing.locales.flatMap((locale) =>
    skills.map((entry) => ({ locale, slug: entry.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const entry = getSkillBySlug(slug);
  if (!entry) {
    return { title: "Not found" };
  }
  const t = await getTranslations({ locale, namespace: "skills" });
  const name = pickLocalized(entry.title, locale);
  const layerLabel = t(`layer.${entry.layer}`);
  return {
    title: `${name} · ${layerLabel} · Openwisdom`,
    description: pickLocalized(entry.summary, locale),
  };
}

export default async function SkillDetailPage({
  params,
}: {
  params: Params;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // Same heat merge as list (SPE 37 G4); in-process stats; fail-open
  const stats = await getStatsInProcess();
  const catalog = getCatalogWithHeat(stats);
  const entry = getSkillBySlugWithHeat(slug, stats);
  if (!entry) {
    notFound();
  }

  const related = catalog
    .filter((e) => e.slug !== entry.slug)
    .filter(
      (e) =>
        e.layer === entry.layer ||
        e.disciplines.some((d) => entry.disciplines.includes(d)),
    )
    .slice(0, 3);

  // Client resolves reference chips without importing getCatalog
  const knownSlugs = catalog.map((e) => e.slug);

  return (
    <SkillDetail entry={entry} related={related} knownSlugs={knownSlugs} />
  );
}

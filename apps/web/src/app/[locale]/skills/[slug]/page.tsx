import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SkillDetail } from "@/components/skills/SkillDetail";
import {
  getCatalog,
  getCatalogWithHeat,
  getSkillBySlug,
  getSkillBySlugWithHeat,
  pickLocalized,
} from "@/data/catalog";
import { fetchStats } from "@/lib/heat/fetch-stats";
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

  // Same heat merge as list (SPE 37 G4); fail-open when stats unavailable
  const stats = await fetchStats();
  const entry = getSkillBySlugWithHeat(slug, stats);
  if (!entry) {
    notFound();
  }

  const related = getCatalogWithHeat(stats)
    .filter((e) => e.slug !== entry.slug)
    .filter(
      (e) =>
        e.layer === entry.layer ||
        e.disciplines.some((d) => entry.disciplines.includes(d)),
    )
    .slice(0, 3);

  return <SkillDetail entry={entry} related={related} />;
}

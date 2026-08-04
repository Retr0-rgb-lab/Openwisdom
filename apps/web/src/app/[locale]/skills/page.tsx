import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SkillsCatalog } from "@/components/skills/SkillsCatalog";
import { Skeleton } from "@/components/ui/skeleton";
import { getCatalogWithHeat } from "@/data/catalog";
import { fetchStats } from "@/lib/heat/fetch-stats";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "skills" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

function CatalogFallback() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-4 h-10 w-full max-w-xl" />
      <Skeleton className="mt-8 h-11 w-full" />
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

async function SkillsCatalogWithHeat() {
  // Fail-open: missing /api/stats → null → no fake heat zeros
  const stats = await fetchStats();
  const entries = getCatalogWithHeat(stats);
  return <SkillsCatalog entries={entries} />;
}

export default async function SkillsPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<CatalogFallback />}>
      <SkillsCatalogWithHeat />
    </Suspense>
  );
}

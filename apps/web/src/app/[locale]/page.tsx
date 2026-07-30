import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { DisciplineGrid } from "@/components/home/DisciplineGrid";
import { FinalCta } from "@/components/home/FinalCta";
import { HarnessRow } from "@/components/home/HarnessRow";
import { Hero } from "@/components/home/Hero";
import { Model } from "@/components/home/Model";
import { ScenarioCards } from "@/components/home/ScenarioCards";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.metadata" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
    },
  };
}

// Home composition (specs/10): ≤6 Persuade beats.
// InstallPaths / ContributeTeaser / full Layer+Provenance removed from Home
// (components kept for subpages).
export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <>
      {/* 1 Hero: 60s + install object */}
      <Hero />
      {/* 2 Harness trust band */}
      <HarnessRow />
      {/* 3 Three scenario skills (asymmetric) */}
      <ScenarioCards />
      {/* 4 Model: Layer + Provenance compact merge */}
      <Model />
      {/* 5 Disciplines (short keep) */}
      <DisciplineGrid />
      {/* 6 Final CTA */}
      <FinalCta />
    </>
  );
}

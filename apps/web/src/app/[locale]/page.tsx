import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { ContributeTeaser } from "@/components/home/ContributeTeaser";
import { DisciplineGrid } from "@/components/home/DisciplineGrid";
import { FinalCta } from "@/components/home/FinalCta";
import { HarnessRow } from "@/components/home/HarnessRow";
import { Hero } from "@/components/home/Hero";
import { InstallPaths } from "@/components/home/InstallPaths";
import { LayerDiagram } from "@/components/home/LayerDiagram";
import { Provenance } from "@/components/home/Provenance";
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

// Home composition (specs/03 §4.1): nine modules in narrative order.
export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <>
      {/* ① Hero: three pillars + install object + orientation mnemonic */}
      <Hero />
      {/* ② Harness trust band */}
      <HarnessRow />
      {/* ③ Three scenario skills (asymmetric) */}
      <ScenarioCards />
      {/* ④ Layered model: scenario → reference */}
      <LayerDiagram />
      {/* ⑤ Five discipline entries */}
      <DisciplineGrid />
      {/* ⑥ Install paths */}
      <InstallPaths />
      {/* ⑦ Official vs community */}
      <Provenance />
      {/* ⑧ Contribute teaser */}
      <ContributeTeaser />
      {/* ⑨ Bottom CTA */}
      <FinalCta />
    </>
  );
}

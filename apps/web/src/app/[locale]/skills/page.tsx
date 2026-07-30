import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { PlaceholderSection } from "@/components/site/PlaceholderSection";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shell" });
  return {
    title: t("placeholder.skills.title"),
    description: t("placeholder.skills.description"),
  };
}

export default function SkillsPage({ params }: { params: Params }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("shell");

  return (
    <PlaceholderSection
      title={t("placeholder.skills.title")}
      description={t("placeholder.skills.description")}
    />
  );
}

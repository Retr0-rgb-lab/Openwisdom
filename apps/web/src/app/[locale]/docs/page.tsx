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
    title: t("placeholder.docs.title"),
    description: t("placeholder.docs.description"),
  };
}

export default function DocsPage({ params }: { params: Params }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("shell");

  return (
    <PlaceholderSection
      title={t("placeholder.docs.title")}
      description={t("placeholder.docs.description")}
    />
  );
}

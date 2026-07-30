import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocsHub } from "@/components/docs/DocsHub";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return {
    title: t("docs.meta.title"),
    description: t("docs.meta.description"),
  };
}

export default async function DocsPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DocsHub />;
}

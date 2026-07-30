import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocsAuthoring } from "@/components/docs/DocsAuthoring";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "pages.docs.authoringPage",
  });
  return {
    title: t("title"),
    description: t("lede"),
  };
}

export default async function DocsAuthoringPage({
  params,
}: {
  params: Params;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DocsAuthoring />;
}

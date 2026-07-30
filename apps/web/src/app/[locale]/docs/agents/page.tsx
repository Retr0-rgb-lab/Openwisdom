import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocsAgents } from "@/components/docs/DocsAgents";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "pages.docs.agentsPage",
  });
  return {
    title: t("title"),
    description: t("lede"),
  };
}

export default async function DocsAgentsPage({
  params,
}: {
  params: Params;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DocsAgents />;
}

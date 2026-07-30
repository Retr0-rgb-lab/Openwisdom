import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocsChangelog } from "@/components/docs/DocsChangelog";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "pages.docs.changelogPage",
  });
  return {
    title: t("title"),
    description: t("lede"),
  };
}

export default async function DocsChangelogPage({
  params,
}: {
  params: Params;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DocsChangelog />;
}

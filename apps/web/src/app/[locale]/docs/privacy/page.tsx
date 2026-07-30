import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocsPrivacy } from "@/components/docs/DocsPrivacy";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "pages.docs.privacy",
  });
  return {
    title: t("heading"),
    description: t("lede"),
  };
}

export default async function DocsPrivacyPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DocsPrivacy />;
}

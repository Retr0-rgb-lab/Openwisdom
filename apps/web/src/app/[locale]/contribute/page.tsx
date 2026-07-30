import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContributeGuide } from "@/components/install/ContributeGuide";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return {
    title: t("contribute.meta.title"),
    description: t("contribute.meta.description"),
  };
}

export default async function ContributePage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ContributeGuide />;
}

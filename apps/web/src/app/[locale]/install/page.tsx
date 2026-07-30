import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { InstallHub } from "@/components/install/InstallHub";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return {
    title: t("install.meta.title"),
    description: t("install.meta.description"),
  };
}

export default async function InstallPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <InstallHub />;
}

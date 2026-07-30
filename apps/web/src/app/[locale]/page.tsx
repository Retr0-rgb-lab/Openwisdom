import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Button } from "@/components/ui/button";

// Temporary test page (Plan A Task A.6); Plan C replaces it with the real
// nine-module Home composition.
export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("shell");

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-6 py-24">
      <h1 className="font-serif text-display">{t("meta.siteName")}</h1>
      <p className="text-body text-ink-muted">{t("meta.tagline")}</p>
      <Button>{t("test.button")}</Button>
    </main>
  );
}

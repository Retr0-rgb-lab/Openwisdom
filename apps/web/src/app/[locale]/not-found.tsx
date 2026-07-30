import { useTranslations } from "next-intl";
import { DatumMark } from "@/components/site/DatumMark";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

// Localized 404 with a recovery path (specs/03 §2).
export default function NotFound() {
  const t = useTranslations("shell");

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-start gap-6 px-6 py-24">
      <DatumMark className="size-6" />
      <h1 className="font-serif text-title">{t("notFound.title")}</h1>
      <p className="max-w-prose text-body text-ink-muted">
        {t("notFound.description")}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" render={<Link href="/" />}>
          {t("notFound.backHome")}
        </Button>
        <Button variant="ghost" render={<Link href="/skills" />}>
          {t("notFound.browseSkills")}
        </Button>
      </div>
    </section>
  );
}

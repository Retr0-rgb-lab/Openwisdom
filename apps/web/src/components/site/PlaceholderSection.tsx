import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { GITHUB_URL } from "./constants";
import { DatumMark } from "./DatumMark";
import { GithubMark } from "./GithubMark";

// Designed empty state for secondary routes (specs/03 §4.5, 知识库/03
// "empty states are designed"): hairline card, not bare text.
export function PlaceholderSection({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const t = useTranslations("shell");

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-20 md:py-28">
      <div className="rounded-lg border border-line bg-surface p-8 md:p-12">
        <div className="flex items-center justify-between gap-4">
          <Badge variant="outline" className="border-datum/50 text-datum">
            {t("placeholder.badge")}
          </Badge>
          <DatumMark className="size-5" />
        </div>
        <h1 className="mt-6 font-serif text-title">{title}</h1>
        <p className="mt-3 max-w-prose text-body text-ink-muted">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button variant="outline" render={<Link href="/" />}>
            <ArrowLeft />
            {t("placeholder.backHome")}
          </Button>
          <Button
            variant="ghost"
            render={
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" />
            }
          >
            <GithubMark />
            {t("placeholder.github")}
          </Button>
        </div>
      </div>
    </section>
  );
}

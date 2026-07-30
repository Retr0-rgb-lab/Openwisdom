import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { GITHUB_URL } from "./constants";
import { GithubMark } from "./GithubMark";

// Honest empty state for secondary routes (specs/09 I-P0-1, specs/10 §2):
// under construction + GitHub + home — no copper-badge "full product" feel.
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
        <Badge
          variant="outline"
          className="border-line bg-field font-normal text-ink-muted"
        >
          {t("placeholder.badge")}
        </Badge>
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

import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { InstallCommand } from "@/components/install/InstallCommand";
import { GITHUB_URL } from "@/components/site/constants";

// Bottom CTA (specs/03 §4.1 ⑨): one more chance at the primary action —
// copy the command, browse the catalog, or open GitHub.
export function FinalCta() {
  const t = useTranslations("home.finalCta");

  return (
    <section className="border-b border-line">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center md:py-28">
        <h2 className="font-serif text-3xl leading-tight text-ink md:text-4xl">
          {t("title")}
        </h2>
        <p className="max-w-xl text-body leading-relaxed text-ink-muted">
          {t("description")}
        </p>
        <InstallCommand className="w-full text-left" />
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" className="border-line" render={<Link href="/skills" />}>
            {t("browseSkills")}
          </Button>
          <Button
            variant="ghost"
            render={<a href={GITHUB_URL} target="_blank" rel="noreferrer" />}
          >
            {t("github")}
            <ArrowUpRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

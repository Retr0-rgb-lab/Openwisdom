import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { GithubMark } from "@/components/site/GithubMark";
import { GITHUB_URL } from "@/components/site/constants";
import { Link } from "@/i18n/navigation";
import { DocsArticleHeader, DocsHeading } from "./DocsArticle";
import { DocsShell } from "./DocsShell";

type PathCard = {
  n: string;
  title: string;
  body: string;
  href: string;
  cta: string;
};

type GuideCard = {
  id: string;
  title: string;
  body: string;
  href: string;
};

/**
 * Docs index — Read hub: boundary, numbered path, guide cards.
 */
export async function DocsHub() {
  const t = await getTranslations("pages.docs");
  const whatItems = t.raw("hub.whatItems") as string[];
  const pathCards = t.raw("hub.pathCards") as PathCard[];
  const guideCards = t.raw("hub.guideCards") as GuideCard[];

  return (
    <DocsShell wide>
      <DocsArticleHeader title={t("hub.title")} lede={t("hub.lede")} />

      <section aria-labelledby="what">
        <DocsHeading id="what" className="text-lg">
          {t("hub.whatHeading")}
        </DocsHeading>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-muted md:text-[0.9375rem]">
          {whatItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="mt-10" aria-labelledby="path">
        <DocsHeading id="path" className="text-lg">
          {t("hub.pathHeading")}
        </DocsHeading>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {pathCards.map((card) => (
            <li key={card.href}>
              <Link
                href={card.href}
                className="flex h-full flex-col rounded-lg border border-line bg-surface p-4 transition-colors duration-150 hover:bg-surface-muted"
              >
                <span className="text-meta font-medium tracking-wide text-structure">
                  {card.n}
                </span>
                <span className="mt-2 font-medium text-ink">{card.title}</span>
                <span className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-muted">
                  {card.body}
                </span>
                <span className="mt-3 text-sm font-medium text-primary">
                  {card.cta} →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10" aria-labelledby="guides">
        <DocsHeading id="guides" className="text-lg">
          {t("hub.guidesHeading")}
        </DocsHeading>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {guideCards.map((card) => (
            <li key={card.id}>
              <Link
                href={card.href}
                className="flex h-full flex-col rounded-lg border border-line bg-surface p-4 transition-colors duration-150 hover:bg-surface-muted"
              >
                <span className="font-medium text-ink">{card.title}</span>
                <span className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  {card.body}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="links">
        <DocsHeading id="links" className="text-lg">
          {t("hub.linksHeading")}
        </DocsHeading>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" render={<Link href="/skills" />}>
            {t("hub.linkSkills")}
          </Button>
          <Button variant="outline" render={<Link href="/install" />}>
            {t("hub.linkInstall")}
          </Button>
          <Button variant="outline" render={<Link href="/contribute" />}>
            {t("hub.linkContribute")}
          </Button>
          <Button
            variant="ghost"
            render={
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" />
            }
          >
            <GithubMark className="size-4" />
            {t("hub.linkGithub")}
            <ArrowUpRight className="size-4" />
          </Button>
        </div>
      </section>
    </DocsShell>
  );
}

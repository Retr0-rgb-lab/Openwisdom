import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GithubMark } from "@/components/site/GithubMark";
import { GITHUB_ISSUES_URL, GITHUB_URL } from "@/components/site/constants";
import { Link } from "@/i18n/navigation";

type Step = { title: string; body: string };

/**
 * Contribute guide — official vs community, PR path, frontmatter checklist.
 * No web upload backend claims.
 */
export async function ContributeGuide() {
  const t = await getTranslations("pages.contribute");
  const officialPoints = t.raw("officialPoints") as string[];
  const communityPoints = t.raw("communityPoints") as string[];
  const steps = t.raw("steps") as Step[];
  const frontmatterItems = t.raw("frontmatterItems") as string[];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
      <header>
        <h1 className="font-serif text-[1.85rem] leading-[1.15] font-semibold tracking-[-0.025em] text-ink md:text-[2.35rem]">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-prose text-base leading-[1.65] text-ink-muted md:text-[1.0625rem]">
          {t("lede")}
        </p>
      </header>

      <section className="mt-12" aria-labelledby="contribute-provenance-heading">
        <h2
          id="contribute-provenance-heading"
          className="font-serif text-xl font-semibold text-ink md:text-2xl"
        >
          {t("provenanceHeading")}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card className="border-line shadow-none">
            <CardHeader className="gap-3">
              <Badge className="w-fit bg-primary text-primary-foreground hover:bg-primary">
                {t("officialBadge")}
              </Badge>
              <CardTitle className="font-serif text-lg text-ink">
                {t("officialTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-muted">
                {officialPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-line shadow-none">
            <CardHeader className="gap-3">
              <Badge
                variant="outline"
                className="w-fit border-community/40 bg-field font-normal text-ink"
              >
                {t("communityBadge")}
              </Badge>
              <CardTitle className="font-serif text-lg text-ink">
                {t("communityTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-muted">
                {communityPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="contribute-steps-heading">
        <h2
          id="contribute-steps-heading"
          className="font-serif text-xl font-semibold text-ink md:text-2xl"
        >
          {t("stepsHeading")}
        </h2>
        <ol className="mt-6 space-y-4">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-lg border border-line bg-surface p-5"
            >
              <p className="text-meta font-medium tracking-wide text-structure uppercase">
                {index + 1}
              </p>
              <h3 className="mt-2 font-serif text-lg font-semibold text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="mt-12"
        aria-labelledby="contribute-frontmatter-heading"
      >
        <h2
          id="contribute-frontmatter-heading"
          className="font-serif text-xl font-semibold text-ink md:text-2xl"
        >
          {t("frontmatterHeading")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          {t("frontmatterIntro")}
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-muted">
          {frontmatterItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-ink-muted">
          {t("frontmatterNote")}
        </p>
      </section>

      <section className="mt-12" aria-labelledby="contribute-links-heading">
        <h2
          id="contribute-links-heading"
          className="font-serif text-xl font-semibold text-ink md:text-2xl"
        >
          {t("linksHeading")}
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            render={
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" />
            }
          >
            <GithubMark className="size-4" />
            {t("openRepo")}
            <ArrowUpRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            render={
              <a href={GITHUB_ISSUES_URL} target="_blank" rel="noreferrer" />
            }
          >
            {t("openIssues")}
            <ArrowUpRight className="size-4" />
          </Button>
          <Button variant="ghost" render={<Link href="/docs" />}>
            {t("readDocs")}
          </Button>
          <Button variant="ghost" render={<Link href="/skills" />}>
            {t("browseSkills")}
          </Button>
        </div>
      </section>

      <p className="mt-12 max-w-prose border-t border-line pt-8 text-sm leading-relaxed text-ink-muted">
        {t("closing")}
      </p>
    </div>
  );
}

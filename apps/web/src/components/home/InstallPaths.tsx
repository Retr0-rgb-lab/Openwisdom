import { ArrowUpRight, Download, Terminal } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/home/Section";
import { GithubMark } from "@/components/site/GithubMark";
import { GITHUB_URL } from "@/components/site/constants";

// Install paths (specs/03 §4.1 ⑥): CLI primary, GitHub and manual secondary.
export function InstallPaths() {
  const t = useTranslations("home.paths");

  const cards = [
    {
      key: "cli" as const,
      icon: <Terminal className="size-5 text-primary" />,
      primary: true,
      body: (
        <code className="block rounded-lg border border-line bg-field px-3 py-2 font-mono text-sm text-ink">
          npx openwisdom install
        </code>
      ),
      cta: (
        <Link
          href="/install"
          className="text-sm font-medium text-structure underline-offset-4 hover:underline"
        >
          {t("cli.cta")} →
        </Link>
      ),
    },
    {
      key: "github" as const,
      icon: <GithubMark className="size-5 text-ink" />,
      primary: false,
      body: null,
      cta: (
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-structure underline-offset-4 hover:underline"
        >
          {t("github.cta")}
          <ArrowUpRight className="size-4" />
        </a>
      ),
    },
    {
      key: "manual" as const,
      icon: <Download className="size-5 text-ink-muted" />,
      primary: false,
      body: null,
      cta: (
        <Link
          href="/install"
          className="text-sm font-medium text-structure underline-offset-4 hover:underline"
        >
          {t("manual.cta")} →
        </Link>
      ),
    },
  ];

  return (
    <Section className="bg-surface">
      <SectionHeading
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map(({ key, icon, primary, body, cta }) => (
          <Card key={key} className="gap-4 border-line shadow-none">
            <CardHeader className="gap-3">
              <div className="flex items-center justify-between">
                {icon}
                {primary ? (
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                    {t("primary")}
                  </Badge>
                ) : null}
              </div>
              <CardTitle className="font-serif text-xl text-ink">
                {t(`${key}.title`)}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <p className="text-sm leading-relaxed text-ink-muted">
                {t(`${key}.desc`)}
              </p>
              {body}
              <div className="mt-auto">{cta}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

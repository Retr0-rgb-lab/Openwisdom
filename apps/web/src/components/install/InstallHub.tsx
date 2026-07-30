import type { ReactNode } from "react";
import { ArrowUpRight, Download, Plug, Terminal } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { InstallCommand } from "@/components/install/InstallCommand";
import { INSTALL_COMMANDS } from "@/components/install/commands";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GithubMark } from "@/components/site/GithubMark";
import { GITHUB_URL } from "@/components/site/constants";
import { Link } from "@/i18n/navigation";

/**
 * Install hub body — honest dual-surface package manager + GitHub/manual paths.
 * Reuses InstallCommand (CLI | MCP); no fake npm availability claims.
 */
export async function InstallHub() {
  const t = await getTranslations("pages.install");

  const pathCards: {
    key: "cli" | "mcp" | "github" | "manual";
    icon: ReactNode;
    primary: boolean;
    body: ReactNode;
    cta: ReactNode;
  }[] = [
    {
      key: "cli",
      icon: <Terminal className="size-5 text-primary" />,
      primary: true,
      body: (
        <code className="block overflow-x-auto rounded-lg border border-line bg-field px-3 py-2 font-mono text-sm text-ink">
          {INSTALL_COMMANDS.cli}
        </code>
      ),
      cta: null,
    },
    {
      key: "mcp",
      icon: <Plug className="size-5 text-primary" />,
      primary: true,
      body: (
        <code className="block overflow-x-auto rounded-lg border border-line bg-field px-3 py-2 font-mono text-sm text-ink">
          {INSTALL_COMMANDS.mcp}
        </code>
      ),
      cta: null,
    },
    {
      key: "github",
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
          {t("openGithub")}
          <ArrowUpRight className="size-4" />
        </a>
      ),
    },
    {
      key: "manual",
      icon: <Download className="size-5 text-ink-muted" />,
      primary: false,
      body: null,
      cta: (
        <Link
          href="/skills"
          className="text-sm font-medium text-structure underline-offset-4 hover:underline"
        >
          {t("browseSkills")} →
        </Link>
      ),
    },
  ];

  const manualSteps = t.raw("manualSteps") as string[];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
      <header className="max-w-2xl">
        <h1 className="font-serif text-[1.85rem] leading-[1.15] font-semibold tracking-[-0.025em] text-ink md:text-[2.35rem]">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-[42rem] text-base leading-[1.65] text-ink-muted md:text-[1.0625rem]">
          {t("lede")}
        </p>
      </header>

      <aside
        className="mt-8 max-w-3xl rounded-lg border border-line-strong bg-surface p-5 md:p-6"
        aria-labelledby="install-status-title"
      >
        <Badge
          variant="outline"
          className="border-line bg-field font-normal text-ink-muted"
        >
          {t("statusBadge")}
        </Badge>
        <h2
          id="install-status-title"
          className="mt-3 font-serif text-lg font-semibold text-ink md:text-xl"
        >
          {t("statusTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted md:text-[0.9375rem]">
          {t("statusBody")}
        </p>
      </aside>

      <section
        className="mt-12 max-w-2xl"
        aria-labelledby="install-command-heading"
      >
        <h2
          id="install-command-heading"
          className="font-serif text-xl font-semibold text-ink md:text-2xl"
        >
          {t("commandHeading")}
        </h2>
        <div className="mt-4">
          <InstallCommand emphasis />
        </div>
      </section>

      <section className="mt-14" aria-labelledby="install-paths-heading">
        <h2
          id="install-paths-heading"
          className="font-serif text-xl font-semibold text-ink md:text-2xl"
        >
          {t("pathsHeading")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted md:text-[0.9375rem]">
          {t("pathsLede")}
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pathCards.map(({ key, icon, primary, body, cta }) => (
            <Card key={key} className="gap-4 border-line shadow-none">
              <CardHeader className="gap-3">
                <div className="flex items-center justify-between">
                  {icon}
                  {primary ? (
                    <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                      {t("pathPrimary")}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-line bg-field font-normal text-ink-muted"
                    >
                      {t("pathSecondary")}
                    </Badge>
                  )}
                </div>
                <CardTitle className="font-serif text-xl text-ink">
                  {t(`paths.${key}.title`)}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <p className="text-sm leading-relaxed text-ink-muted">
                  {t(`paths.${key}.desc`)}
                </p>
                {body}
                {cta ? <div className="mt-auto">{cta}</div> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section
        className="mt-14 max-w-2xl"
        aria-labelledby="install-manual-heading"
      >
        <h2
          id="install-manual-heading"
          className="font-serif text-xl font-semibold text-ink md:text-2xl"
        >
          {t("manualStepsHeading")}
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-muted md:text-[0.9375rem]">
          {manualSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section
        className="mt-14 border-t border-line pt-10"
        aria-labelledby="install-next-heading"
      >
        <h2
          id="install-next-heading"
          className="font-serif text-xl font-semibold text-ink md:text-2xl"
        >
          {t("nextHeading")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted md:text-[0.9375rem]">
          {t("afterNote")}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted md:text-[0.9375rem]">
          {t("telemetryNote")}{" "}
          <Link
            href="/docs/privacy"
            className="font-medium text-structure underline-offset-4 hover:underline"
          >
            {t("telemetryLink")}
          </Link>
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button render={<Link href="/skills" />}>{t("browseSkills")}</Button>
          <Button variant="outline" render={<Link href="/docs" />}>
            {t("readDocs")}
          </Button>
          <Button
            variant="ghost"
            render={
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" />
            }
          >
            <GithubMark className="size-4" />
            {t("openGithub")}
          </Button>
          <Button variant="ghost" render={<Link href="/contribute" />}>
            {t("contribute")}
          </Button>
        </div>
      </section>
    </div>
  );
}

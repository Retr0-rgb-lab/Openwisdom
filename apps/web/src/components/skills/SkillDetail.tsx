"use client";

import { ArrowLeft, Check, Copy, Download, ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import {
  ScenarioShape,
  type ScenarioShapeKind,
} from "@/components/home/ScenarioShape";
import { GITHUB_URL } from "@/components/site/constants";
import { GithubMark } from "@/components/site/GithubMark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CatalogEntry } from "@/data/catalog/types";
import {
  entryProvenance,
  isLinkOnlyEntry,
  pickLocalized,
} from "@/data/catalog/types";
import { getSkillBySlug } from "@/data/catalog";
import { Link } from "@/i18n/navigation";
import { reportWebHeat } from "@/lib/heat/client";
import { cn } from "@/lib/utils";
import { DISCIPLINE_CSS, SHAPE_ACCENT } from "./disciplineStyles";
import { SkillCard } from "./SkillCard";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function detailBodyKey(entry: CatalogEntry): string {
  if (
    entry.contentAvailability === "external-only" ||
    entryProvenance(entry) === "curated-external"
  ) {
    return "detail.bodyExternal";
  }
  if (entry.source === "catalog") {
    return "detail.bodyCatalog";
  }
  // bootstrap product seed not yet in registry
  return "detail.bodyPending";
}

function downloadHref(skillId: string): string {
  return `/api/skills/${encodeURIComponent(skillId)}/download`;
}

export function SkillDetail({
  entry,
  related,
}: {
  entry: CatalogEntry;
  related: CatalogEntry[];
}) {
  const t = useTranslations("skills");
  const locale = useLocale();
  const [copied, setCopied] = useState(false);

  const title = pickLocalized(entry.title, locale);
  const summary = pickLocalized(entry.summary, locale);
  const when = entry.when ? pickLocalized(entry.when, locale) : null;
  const axis = entry.axis ? pickLocalized(entry.axis, locale) : null;
  const accent = entry.shape
    ? SHAPE_ACCENT[entry.shape]
    : "var(--ow-primary)";
  const linkOnly = isLinkOnlyEntry(entry);
  const isCatalog = entry.source === "catalog";
  const showHeat =
    typeof entry.installs30d === "number" ||
    typeof entry.installsTotal === "number";
  const githubHref =
    entry.externalUrl ||
    (entry.repoPath
      ? `${GITHUB_URL}/tree/master/${entry.repoPath}`
      : GITHUB_URL);

  async function onCopy() {
    if (!entry.install?.cli) return;
    const ok = await copyText(entry.install.cli);
    if (ok) {
      setCopied(true);
      toast.success(t("actions.copied"));
      // Funnel only for installable registry skills
      if (isCatalog) {
        reportWebHeat("web_copy_install", entry.id);
      }
      window.setTimeout(() => setCopied(false), 1600);
    } else {
      toast.error(t("actions.copyFailed"));
    }
  }

  return (
    <div className="pb-24 md:pb-0">
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-8 md:py-12">
          <nav className="mb-5 text-sm text-ink-muted">
            <Link
              href="/skills"
              className="font-medium text-structure underline-offset-4 hover:text-primary hover:underline"
            >
              {t("detail.breadcrumbSkills")}
            </Link>
            <span className="mx-2 text-line" aria-hidden>
              /
            </span>
            <span className="text-ink">{title}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-line bg-field font-normal text-ink-muted"
            >
              {t(`layer.${entry.layer}`)}
            </Badge>
            {linkOnly ? (
              <Badge
                variant="outline"
                className="border-mist/40 bg-mist/10 font-normal text-ink-muted"
              >
                {t("card.linkOnly")}
              </Badge>
            ) : null}
            <Badge
              variant="outline"
              className="border-line bg-field font-normal text-ink-muted"
            >
              {t("card.contentLang", { lang: entry.language })}
            </Badge>
            {entry.license ? (
              <Badge
                variant="outline"
                className="border-line bg-field font-mono text-[0.7rem] font-normal text-ink-muted"
              >
                {entry.license}
              </Badge>
            ) : null}
            <span className="font-mono text-xs text-ink-muted">
              {t("detail.version", { version: entry.version })}
            </span>
            {showHeat ? (
              <span className="font-mono text-xs tabular-nums text-ink-muted">
                {typeof entry.installs30d === "number"
                  ? t("heat.installs30d", {
                      count: entry.installs30d as number,
                    })
                  : null}
                {typeof entry.installs30d === "number" &&
                typeof entry.installsTotal === "number"
                  ? " · "
                  : null}
                {typeof entry.installsTotal === "number"
                  ? t("heat.installsTotal", {
                      count: entry.installsTotal as number,
                    })
                  : null}
              </span>
            ) : null}
          </div>

          <div className="mt-5 flex items-start gap-3">
            {entry.shape ? (
              <ScenarioShape
                kind={entry.shape as ScenarioShapeKind}
                className="mt-1 size-10 shrink-0"
              />
            ) : null}
            <div className="min-w-0">
              <code className="font-mono text-[0.75rem] text-ink-muted">
                {entry.slug}
                {axis ? ` · ${axis}` : ""}
              </code>
              <h1 className="mt-1 font-serif text-[2rem] leading-[1.12] font-semibold tracking-[-0.025em] text-ink md:text-[2.5rem]">
                {title}
              </h1>
              <p className="mt-3 max-w-[42rem] text-base leading-[1.65] text-ink-muted md:text-[1.0625rem]">
                {summary}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {entry.disciplines.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1 text-[0.8125rem] text-ink-muted"
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: DISCIPLINE_CSS[d] }}
                  aria-hidden
                />
                {t(`disciplines.${d}`)}
              </span>
            ))}
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-line bg-field px-2 py-1 font-mono text-[0.7rem] text-ink-muted"
              >
                {tag}
              </span>
            ))}
          </div>

          {linkOnly || entry.externalUrl ? (
            <aside className="mt-6 rounded-lg border border-line bg-surface-muted/60 px-4 py-3 md:px-5">
              <p className="text-xs font-semibold tracking-wide text-structure">
                {t("detail.attribution")}
              </p>
              <ul className="mt-2 space-y-1 text-sm text-ink-muted">
                {entry.author ? (
                  <li>
                    {t("detail.author")}:{" "}
                    <span className="text-ink">{entry.author}</span>
                  </li>
                ) : null}
                {entry.license ? (
                  <li>
                    {t("detail.license")}:{" "}
                    <span className="font-mono text-ink">{entry.license}</span>
                  </li>
                ) : null}
                {entry.attribution ? (
                  <li>
                    {t("detail.credit")}: {entry.attribution}
                  </li>
                ) : null}
                {entry.externalUrl ? (
                  <li>
                    <a
                      href={entry.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-structure underline-offset-4 hover:text-primary hover:underline"
                    >
                      {t("detail.upstream")}
                      <ExternalLink className="size-3.5" />
                    </a>
                  </li>
                ) : null}
              </ul>
            </aside>
          ) : null}


        </div>
      </section>

      {/* Desktop sticky install */}
      <div className="sticky top-14 z-30 hidden border-b border-line bg-surface/95 backdrop-blur-sm md:block supports-[backdrop-filter]:bg-surface/90">
        <div className="mx-auto max-w-6xl px-6 py-3">
          <InstallTabs
            entry={entry}
            githubHref={githubHref}
            copied={copied}
            onCopy={onCopy}
            linkOnly={linkOnly}
            isCatalog={isCatalog}
          />
        </div>
      </div>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
          <div className="max-w-3xl">
            {t(detailBodyKey(entry)).trim() ? (
              <p className="mb-6 text-sm leading-relaxed text-ink-muted">
                {t(detailBodyKey(entry))}
              </p>
            ) : null}

            {entry.layer === "scenario" ? (
              <ScenarioBody
                when={when}
                steps={entry.steps}
                output={entry.output}
                bias={entry.bias}
                references={entry.references}
                accent={accent}
                locale={locale}
              />
            ) : (
              <ReferenceBody entry={entry} locale={locale} />
            )}
          </div>

          <div className="mt-10">
            <Button
              variant="outline"
              className="min-h-10 gap-1.5"
              render={<Link href="/skills" />}
            >
              <ArrowLeft className="size-4" />
              {t("actions.backToCatalog")}
            </Button>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="border-b border-line">
          <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
            <h2 className="mb-6 font-serif text-xl font-semibold tracking-[-0.02em] text-ink md:text-2xl">
              {t("detail.related")}
            </h2>
            <div className="grid auto-rows-auto grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <div key={item.slug} className="w-full self-start">
                  <SkillCard entry={item} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Mobile bottom dock */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:hidden">
        <div className="mx-auto flex max-w-6xl gap-2">
          {linkOnly && entry.externalUrl ? (
            <Button
              className="min-h-11 flex-1 gap-1.5"
              render={
                <a
                  href={entry.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              <ExternalLink className="size-4" />
              {t("detail.openUpstream")}
            </Button>
          ) : linkOnly ? (
            <Button
              className="min-h-11 flex-1 gap-1.5"
              render={
                <a href={githubHref} target="_blank" rel="noreferrer" />
              }
            >
              <ExternalLink className="size-4" />
              {t("detail.openUpstream")}
            </Button>
          ) : (
            <Button
              type="button"
              className="min-h-11 flex-1 gap-1.5"
              onClick={onCopy}
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              {t("card.copyInstall")}
            </Button>
          )}
          {isCatalog && !linkOnly ? (
            <Button
              variant="outline"
              className="min-h-11 gap-1.5 px-3"
              aria-label={t("card.download")}
              render={<a href={downloadHref(entry.id)} />}
            >
              <Download className="size-4" />
            </Button>
          ) : null}
          <Button
            variant="outline"
            className="min-h-11 gap-1.5 px-3"
            aria-label={t("actions.github")}
            render={
              <a href={githubHref} target="_blank" rel="noreferrer" />
            }
          >
            <GithubMark className="size-4" />
          </Button>
        </div>
        {(linkOnly
          ? t("detail.cliPreviewNote")
          : t("actions.installNote")
        ).trim() ? (
          <p className="mx-auto mt-2 max-w-6xl text-[0.7rem] leading-snug text-ink-muted">
            {linkOnly
              ? t("detail.cliPreviewNote")
              : t("actions.installNote")}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function InstallTabs({
  entry,
  githubHref,
  copied,
  onCopy,
  linkOnly,
  isCatalog,
}: {
  entry: CatalogEntry;
  githubHref: string;
  copied: boolean;
  onCopy: () => void;
  linkOnly: boolean;
  isCatalog: boolean;
}) {
  const t = useTranslations("skills");
  const defaultTab = linkOnly ? "github" : "cli";
  const hasCli = Boolean(entry.install?.cli?.trim());

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList variant="line" className="mb-3">
        {!linkOnly || hasCli ? (
          <TabsTrigger value="cli">{t("detail.tabCli")}</TabsTrigger>
        ) : null}
        <TabsTrigger value="github">{t("detail.tabGithub")}</TabsTrigger>
        <TabsTrigger value="manual">{t("detail.tabManual")}</TabsTrigger>
      </TabsList>
      {hasCli ? (
        <TabsContent value="cli" className="outline-none">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <code className="truncate rounded-md border border-line bg-field px-3 py-2 font-mono text-xs text-ink sm:text-sm">
              {entry.install.cli}
            </code>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                className="min-h-10 gap-1.5"
                variant={linkOnly ? "outline" : "default"}
                onClick={onCopy}
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {linkOnly ? t("card.copyCliPreview") : t("card.copyInstall")}
              </Button>
              {isCatalog && !linkOnly ? (
                <Button
                  variant="outline"
                  className="min-h-10 gap-1.5"
                  render={<a href={downloadHref(entry.id)} />}
                >
                  <Download className="size-4" />
                  {t("card.download")}
                </Button>
              ) : null}
              <Button
                variant="outline"
                className="min-h-10 gap-1.5"
                render={
                  <a href={githubHref} target="_blank" rel="noreferrer" />
                }
              >
                <GithubMark className="size-4" />
                {t("actions.github")}
              </Button>
            </div>
          </div>
          {(linkOnly
            ? t("detail.cliPreviewNote")
            : t("actions.installNote")
          ).trim() ? (
            <p className="mt-2 text-xs text-ink-muted">
              {linkOnly
                ? t("detail.cliPreviewNote")
                : t("actions.installNote")}
            </p>
          ) : null}
        </TabsContent>
      ) : null}
      <TabsContent value="github" className="outline-none">
        {t("detail.githubTabBody").trim() ? (
          <p className="text-sm text-ink-muted">{t("detail.githubTabBody")}</p>
        ) : null}
        {linkOnly && t("detail.defaultGitHubTab").trim() ? (
          <p className="mt-1 text-xs text-ink-muted">
            {t("detail.defaultGitHubTab")}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            className="min-h-10 gap-1.5"
            variant={linkOnly ? "default" : "outline"}
            render={
              <a href={githubHref} target="_blank" rel="noreferrer" />
            }
          >
            <ExternalLink className="size-4" />
            {t("detail.openUpstream")}
          </Button>
          {isCatalog && !linkOnly ? (
            <Button
              variant="outline"
              className="min-h-10 gap-1.5"
              render={<a href={downloadHref(entry.id)} />}
            >
              <Download className="size-4" />
              {t("card.download")}
            </Button>
          ) : null}
        </div>
      </TabsContent>
      <TabsContent value="manual" className="outline-none">
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-ink-muted">
          <li>{t("detail.manual1")}</li>
          <li>{t("detail.manual2")}</li>
          <li>{t("detail.manual3")}</li>
        </ol>
        <div className="mt-3 flex flex-wrap gap-2">
          {isCatalog && !linkOnly ? (
            <Button
              className="min-h-10 gap-1.5"
              variant="outline"
              render={<a href={downloadHref(entry.id)} />}
            >
              <Download className="size-4" />
              {t("card.download")}
            </Button>
          ) : null}
          <Button
            className="min-h-10"
            variant="ghost"
            render={<Link href="/skills" />}
          >
            {t("detail.installHub")}
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function ScenarioBody({
  when,
  steps,
  output,
  bias,
  references,
  accent,
  locale,
}: {
  when: string | null;
  steps?: CatalogEntry["steps"];
  output?: CatalogEntry["output"];
  bias?: CatalogEntry["bias"];
  references?: string[];
  accent: string;
  locale: string;
}) {
  const t = useTranslations("skills");

  return (
    <>
      {when ? (
        <div className="mt-10">
          <h2 className="font-serif text-xl font-semibold tracking-[-0.02em] text-ink">
            {t("detail.when")}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink">{when}</p>
        </div>
      ) : null}

      {steps?.length ? (
        <div className="mt-10">
          <h2 className="font-serif text-xl font-semibold tracking-[-0.02em] text-ink">
            {t("detail.steps")}
          </h2>
          <ol className="list-none border-t border-line">
            {steps.map((step, i) => (
              <li
                key={i}
                className="grid grid-cols-[2rem_1fr] gap-3 border-b border-line/70 py-3.5 text-base last:border-b-0"
              >
                <span
                  className="pt-0.5 font-mono text-[0.75rem] font-medium tabular-nums"
                  style={{ color: accent }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="leading-snug text-ink">
                  {pickLocalized(step, locale)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {output?.length ? (
        <div className="mt-10">
          <h2 className="font-serif text-xl font-semibold tracking-[-0.02em] text-ink">
            {t("detail.output")}
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-base text-ink">
            {output.map((line, i) => (
              <li key={i}>{pickLocalized(line, locale)}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {bias?.length ? (
        <div className="mt-10">
          <h2 className="font-serif text-xl font-semibold tracking-[-0.02em] text-ink">
            {t("detail.bias")}
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-base text-ink">
            {bias.map((line, i) => (
              <li key={i}>{pickLocalized(line, locale)}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {references && references.length > 0 ? (
        <div className="mt-10">
          <h2 className="font-serif text-xl font-semibold tracking-[-0.02em] text-ink">
            {t("detail.references")}
          </h2>
          {t("detail.referencesNote").trim() ? (
            <p className="mt-2 text-sm text-ink-muted">
              {t("detail.referencesNote")}
            </p>
          ) : null}
          <ul className="mt-3 flex flex-wrap gap-2">
            {references.map((ref) => {
              // Live catalog hit → link; dangling id → mono label only
              const live = getSkillBySlug(ref);
              if (live) {
                return (
                  <li key={ref}>
                    <Link
                      href={`/skills/${ref}`}
                      className="inline-flex rounded-md border border-structure/30 bg-structure/8 px-2.5 py-1 font-mono text-xs text-structure hover:underline"
                    >
                      {ref}
                    </Link>
                  </li>
                );
              }
              return (
                <li key={ref}>
                  <code className="rounded-md border border-line bg-field px-2.5 py-1 font-mono text-xs text-ink-muted">
                    {ref}
                  </code>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </>
  );
}

function ReferenceBody({
  entry,
  locale,
}: {
  entry: CatalogEntry;
  locale: string;
}) {
  const t = useTranslations("skills");
  const definition = entry.definition
    ? pickLocalized(entry.definition, locale)
    : pickLocalized(entry.summary, locale);
  const bounds = entry.bounds ? pickLocalized(entry.bounds, locale) : null;
  const misuse = entry.misuse ? pickLocalized(entry.misuse, locale) : null;

  return (
    <>
      <div className="mt-10">
        <h2 className="font-serif text-xl font-semibold tracking-[-0.02em] text-ink">
          {t("detail.definition")}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink">{definition}</p>
      </div>
      {bounds ? (
        <div className="mt-8">
          <h2 className="font-serif text-xl font-semibold tracking-[-0.02em] text-ink">
            {t("detail.bounds")}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink">{bounds}</p>
        </div>
      ) : null}
      {misuse ? (
        <div className="mt-8">
          <h2 className="font-serif text-xl font-semibold tracking-[-0.02em] text-ink">
            {t("detail.misuse")}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink">{misuse}</p>
        </div>
      ) : null}
      {entry.questions?.length ? (
        <div className="mt-8">
          <h2 className="font-serif text-xl font-semibold tracking-[-0.02em] text-ink">
            {t("detail.questions")}
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-base text-ink">
            {entry.questions.map((q, i) => (
              <li key={i}>{pickLocalized(q, locale)}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

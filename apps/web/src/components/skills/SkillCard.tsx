"use client";

import { Check, Copy, Download, ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { MagicBentoCard } from "@/components/bits/MagicBento";
import {
  ScenarioShape,
  type ScenarioShapeKind,
} from "@/components/home/ScenarioShape";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CatalogEntry } from "@/data/catalog/types";
import { isLinkOnlyEntry, pickLocalized } from "@/data/catalog/types";
import { Link } from "@/i18n/navigation";
import { reportWebHeat } from "@/lib/heat/client";
import { cn } from "@/lib/utils";
import { DISCIPLINE_CSS, SHAPE_ACCENT } from "./disciplineStyles";

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

export function SkillCard({ entry }: { entry: CatalogEntry }) {
  const t = useTranslations("skills");
  const locale = useLocale();
  const [copied, setCopied] = useState(false);

  const title = pickLocalized(entry.title, locale);
  const summary = pickLocalized(entry.summary, locale);
  const when = entry.when ? pickLocalized(entry.when, locale) : null;
  const accent = entry.shape
    ? SHAPE_ACCENT[entry.shape]
    : "var(--ow-primary)";
  const tags = entry.tags.slice(0, 3);
  const extraTags = Math.max(0, entry.tags.length - 3);
  // Heat from mergeHeat only (Spec 29) — never invent zeros in the seed
  const installs30d = entry.installs30d;
  const installsTotal = entry.installsTotal;
  const linkOnly = isLinkOnlyEntry(entry);
  const isCatalog = entry.source === "catalog";
  // Preview CLI only for discovery; installable catalog keeps real CLI CTA
  const hasCli = Boolean(entry.install?.cli?.trim());
  const showCliPreview = linkOnly && hasCli;
  const showCliInstall = !linkOnly && hasCli && entry.installMode !== "link-only";
  const showDownload = isCatalog && !linkOnly;

  async function onCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!entry.install?.cli) return;
    const ok = await copyText(entry.install.cli);
    if (ok) {
      setCopied(true);
      toast.success(t("actions.copied"));
      // Funnel only; server excludes copies from installs* main rank
      if (isCatalog) {
        reportWebHeat("web_copy_install", entry.id);
      }
      window.setTimeout(() => setCopied(false), 1600);
    } else {
      toast.error(t("actions.copyFailed"));
    }
  }

  return (
    /* Magic Bento plate — reactbits.dev/components/magic-bento (Overlay Atlas) */
    <MagicBentoCard
      className="h-full"
      enableBorderGlow
      enableStars
      enableTilt={false}
      enableMagnetism={false}
      clickEffect
      particleCount={8}
    >
      <article
        className={cn(
          "relative z-[1] flex h-full flex-col gap-3 rounded-xl border border-line-strong bg-surface p-5",
          "shadow-[0_1px_0_rgb(15_23_36/0.05),0_6px_18px_-4px_rgb(15_23_36/0.1)] md:p-6",
        )}
      >
        <div
          className="h-px w-full shrink-0 rounded-full"
          style={{ backgroundColor: accent, opacity: 0.85 }}
          aria-hidden
        />

        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <code className="font-mono text-[0.7rem] tracking-wide text-ink-muted">
              {entry.slug}
            </code>
            <h3 className="flex min-w-0 items-start gap-2 font-serif text-[1.2rem] leading-[1.2] font-semibold tracking-[-0.02em] text-ink md:text-[1.3rem]">
              {entry.shape ? (
                <ScenarioShape
                  kind={entry.shape as ScenarioShapeKind}
                  className="mt-0.5 size-7 shrink-0"
                />
              ) : null}
              <Link
                href={`/skills/${entry.slug}`}
                className="line-clamp-2 min-w-0 break-words rounded-sm outline-none hover:text-primary focus-visible:text-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
              >
                {title}
              </Link>
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant="outline"
            className="border-line bg-field font-normal text-ink-muted"
          >
            {t(`layer.${entry.layer}`)}
          </Badge>
          {isLinkOnlyEntry(entry) ? (
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
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">
          {summary}
        </p>

        {when ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-ink-muted/90">
            {when}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-1.5">
          {entry.disciplines.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-0.5 text-[0.75rem] text-ink-muted"
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: DISCIPLINE_CSS[d] }}
                aria-hidden
              />
              {t(`disciplines.${d}`)}
            </span>
          ))}
        </div>

        {tags.length > 0 ? (
          <p className="font-mono text-[0.7rem] text-ink-muted/90">
            {tags.join(" · ")}
            {extraTags > 0
              ? ` ${t("card.moreTags", { count: extraTags })}`
              : ""}
          </p>
        ) : null}

        {/* Footer: actions left · heat (side-channel) bottom-right — Spec 06/29 */}
        <div className="mt-auto flex items-end gap-2 border-t border-line pt-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {linkOnly ? (
              <>
                {entry.externalUrl ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-9 gap-1.5"
                    render={
                      <a
                        href={entry.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                      />
                    }
                  >
                    <ExternalLink className="size-3.5" />
                    {t("card.viewUpstream")}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-9"
                    render={<Link href={`/skills/${entry.slug}`} />}
                  >
                    {t("card.open")}
                  </Button>
                )}
                {showCliPreview ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="min-h-9 gap-1.5 text-ink-muted"
                    onClick={onCopy}
                    aria-label={t("card.copyCliPreview")}
                  >
                    {copied ? (
                      <Check className="size-3.5" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    {t("card.copyCliPreview")}
                  </Button>
                ) : null}
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-9"
                  render={<Link href={`/skills/${entry.slug}`} />}
                >
                  {t("card.open")}
                </Button>
                {showCliInstall ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="min-h-9 gap-1.5"
                    onClick={onCopy}
                    aria-label={t("card.copyInstall")}
                  >
                    {copied ? (
                      <Check className="size-3.5" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    {t("card.copyInstall")}
                  </Button>
                ) : null}
                {showDownload ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-h-9 gap-1.5 text-ink-muted"
                    render={
                      <a
                        href={`/api/skills/${encodeURIComponent(entry.id)}/download`}
                      />
                    }
                    aria-label={t("card.download")}
                  >
                    <Download className="size-3.5" />
                    {t("card.download")}
                  </Button>
                ) : null}
              </>
            )}
          </div>
          <SkillHeatCorner
            installs30d={installs30d}
            installsTotal={installsTotal}
          />
        </div>
      </article>
    </MagicBentoCard>
  );
}

/**
 * Card heat corner — Spec 06/29 side-channel only.
 * Prefer installs30d (main rank key); fall back to installsTotal.
 * No API key → honest empty glyph, not a fake 0.
 */
function SkillHeatCorner({
  installs30d,
  installsTotal,
}: {
  installs30d?: number;
  installsTotal?: number;
}) {
  const t = useTranslations("skills");
  const has30 = typeof installs30d === "number";
  const hasTotal = typeof installsTotal === "number";

  if (!has30 && !hasTotal) {
    return (
      <span
        className="inline-flex shrink-0 items-center gap-1 self-center text-[0.7rem] tabular-nums text-ink-muted/45"
        title={t("heat.note")}
        aria-label={t("heat.unavailable")}
      >
        <Download className="size-3 opacity-60" aria-hidden />
        <span>{t("heat.unavailable")}</span>
      </span>
    );
  }

  const label = has30
    ? t("heat.installs30d", { count: installs30d })
    : t("heat.installsTotal", { count: installsTotal as number });

  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 self-center font-mono text-[0.7rem] tabular-nums text-ink-muted"
      title={t("heat.note")}
      aria-label={label}
    >
      <Download className="size-3 opacity-70" aria-hidden />
      <span>{label}</span>
    </span>
  );
}

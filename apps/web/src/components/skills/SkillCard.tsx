"use client";

import { Check, Copy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Magnet } from "@/components/bits/Magnet";
import { SpotlightCard } from "@/components/bits/SpotlightCard";
import {
  ScenarioShape,
  type ScenarioShapeKind,
} from "@/components/home/ScenarioShape";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CatalogEntry } from "@/data/catalog/types";
import { entryProvenance, pickLocalized } from "@/data/catalog/types";
import { Link } from "@/i18n/navigation";
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
  const accent = entry.shape
    ? SHAPE_ACCENT[entry.shape]
    : "var(--ow-primary)";
  const tags = entry.tags.slice(0, 3);
  const extraTags = Math.max(0, entry.tags.length - 3);
  const showHeat =
    typeof entry.installs30d === "number" ||
    typeof entry.installsTotal === "number";

  async function onCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const ok = await copyText(entry.install.cli);
    if (ok) {
      setCopied(true);
      toast.success(t("actions.copied"));
      window.setTimeout(() => setCopied(false), 1600);
    } else {
      toast.error(t("actions.copyFailed"));
    }
  }

  return (
    <Magnet className="h-full min-h-0" magnetStrength={14} padding={48}>
      <SpotlightCard className="h-full rounded-xl">
        <article
          className={cn(
            "flex h-full flex-col gap-3 rounded-xl border border-line-strong bg-surface p-5",
            "shadow-[0_1px_0_rgb(15_23_36/0.04),0_4px_14px_-2px_rgb(15_23_36/0.08)] md:p-6",
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
              <h3 className="flex items-start gap-2 font-serif text-[1.2rem] leading-[1.2] font-semibold tracking-[-0.02em] text-ink md:text-[1.3rem]">
                {entry.shape ? (
                  <ScenarioShape
                    kind={entry.shape as ScenarioShapeKind}
                    className="mt-0.5 size-7 shrink-0"
                  />
                ) : null}
                <Link
                  href={`/skills/${entry.slug}`}
                  className="min-w-0 outline-none hover:text-primary focus-visible:text-primary"
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
            <Badge
              variant="outline"
              className={cn(
                "font-normal",
                entryProvenance(entry) === "official"
                  ? "border-structure/30 bg-structure/8 text-structure"
                  : entryProvenance(entry) === "curated-external"
                    ? "border-mist/40 bg-mist/10 text-ink-muted"
                    : "border-line bg-field text-ink-muted",
              )}
            >
              {t(`provenance.${entryProvenance(entry)}`)}
            </Badge>
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

          {showHeat ? (
            <p className="text-xs tabular-nums text-ink-muted">
              {entry.installs30d ?? entry.installsTotal}
            </p>
          ) : null}

          <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line pt-3">
            <Button
              variant="outline"
              size="sm"
              className="min-h-9"
              render={<Link href={`/skills/${entry.slug}`} />}
            >
              {t("card.open")}
            </Button>
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
          </div>
        </article>
      </SpotlightCard>
    </Magnet>
  );
}

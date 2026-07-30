"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Section, SectionHeading } from "@/components/home/Section";
import { SpotlightCard } from "@/components/bits/SpotlightCard";
import { Stagger, StaggerItem } from "@/components/bits/Stagger";
import {
  ScenarioShape,
  type ScenarioShapeKind,
} from "@/components/home/ScenarioShape";
import type { DisciplineKey } from "@/components/home/disciplines";
import { cn } from "@/lib/utils";

type ScenarioKey = "macroScan" | "personalAnchor" | "metacognition";

const ORDER: ScenarioKey[] = ["macroScan", "personalAnchor", "metacognition"];

const SCENARIO_META: Record<
  ScenarioKey,
  { shape: ScenarioShapeKind; folio: string; accent: string }
> = {
  // colorize: shape colors only (no left rails) — logo triad
  macroScan: {
    shape: "circle",
    folio: "01",
    accent: "var(--ow-primary)",
  },
  personalAnchor: {
    shape: "triangle",
    folio: "02",
    accent: "var(--ow-signal)",
  },
  metacognition: {
    shape: "square",
    folio: "03",
    accent: "var(--ow-structure)",
  },
};

function CiteLine({ keys }: { keys: DisciplineKey[] }) {
  const t = useTranslations("home");
  const names = keys.map((d) => t(`disciplines.${d}.name`));
  return (
    <p className="text-[0.8125rem] leading-relaxed text-ink-muted">
      <span className="font-medium text-ink">{t("scenarios.citeLabel")} </span>
      {names.join(t("scenarios.citeJoin"))}
    </p>
  );
}

function ScenarioColumn({ scenarioKey }: { scenarioKey: ScenarioKey }) {
  const t = useTranslations("home");
  const meta = SCENARIO_META[scenarioKey];
  const disciplines = t.raw(
    `scenarios.${scenarioKey}.disciplines`,
  ) as DisciplineKey[];
  const steps = t.raw(`scenarios.${scenarioKey}.steps`) as string[];

  return (
    <SpotlightCard className="flex h-full min-h-0 flex-col rounded-xl">
      <article
        className={cn(
          "flex h-full min-h-0 flex-col gap-3.5 rounded-xl border border-line bg-surface p-5",
          "shadow-[0_2px_10px_-4px_rgb(15_23_36/0.1)] md:p-6",
        )}
      >
        {/* 1px top rule in axis color — colorize without left-bar trope */}
        <div
          className="h-px w-full shrink-0 rounded-full"
          style={{ backgroundColor: meta.accent, opacity: 0.85 }}
          aria-hidden
        />

        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-2">
            <code className="font-mono text-[0.7rem] tracking-wide text-ink-muted">
              {t(`scenarios.${scenarioKey}.id`)}
            </code>
            <h3 className="flex items-start gap-2.5 font-serif text-[1.35rem] leading-[1.2] font-semibold tracking-[-0.02em] text-ink md:text-[1.5rem]">
              <ScenarioShape kind={meta.shape} className="mt-0.5 size-8 shrink-0" />
              <span className="min-w-0">{t(`scenarios.${scenarioKey}.name`)}</span>
            </h3>
          </div>
          <div className="shrink-0 text-right font-mono text-[0.68rem] leading-snug text-ink-muted">
            <div className="tabular-nums">
              {meta.folio}
              <span className="text-ink-muted/70"> / 03</span>
            </div>
            <div className="mt-0.5 max-w-[5.5rem] text-balance">
              {t(`scenarios.${scenarioKey}.axis`)}
            </div>
          </div>
        </div>

        <p className="text-[0.9375rem] leading-[1.55] text-ink">
          {t(`scenarios.${scenarioKey}.tagline`)}
        </p>

        <p className="text-sm leading-relaxed text-ink-muted">
          <span className="font-semibold text-ink">
            {t("scenarios.whenLabel")} ·{" "}
          </span>
          {t(`scenarios.${scenarioKey}.when`)}
        </p>

        <ol className="mt-auto list-none border-t border-line pt-3">
          {steps.map((step, i) => (
            <li
              key={step}
              className="grid grid-cols-[1.85rem_1fr] gap-2 border-b border-line/60 py-2.5 text-sm last:border-b-0 last:pb-0"
            >
              <span
                className="pt-0.5 font-mono text-[0.7rem] font-medium tabular-nums"
                style={{ color: meta.accent }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="leading-snug text-ink">{step}</span>
            </li>
          ))}
        </ol>

        <CiteLine keys={disciplines} />

        <Link
          href="/skills"
          className="inline-flex min-h-9 w-fit items-center text-sm font-medium text-structure underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          {t("scenarios.cta")}
        </Link>
      </article>
    </SpotlightCard>
  );
}

/**
 * layout: three equal columns · animate: Stagger only (no outer Reveal)
 * colorize: top hairline + step numbers · typeset: serif titles
 */
export function ScenarioCards() {
  const t = useTranslations("home.scenarios");

  return (
    <Section id="scenarios" reveal={false}>
      <SectionHeading
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <Stagger
        className="grid grid-cols-1 items-stretch gap-5 sm:gap-6 md:grid-cols-3"
        stagger={0.09}
      >
        {ORDER.map((key) => (
          <StaggerItem key={key} className="h-full min-h-0">
            <ScenarioColumn scenarioKey={key} />
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

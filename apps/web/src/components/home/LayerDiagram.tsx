import { ArrowDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Section, SectionHeading } from "@/components/home/Section";

// Layered model (specs/03 §4.1 ④): scenario skills cite discipline reference
// cards. Static structural diagram — no animation.
export function LayerDiagram() {
  const t = useTranslations("home");
  const scenarios = t.raw("layers.scenarioItems") as string[];
  const references = t.raw("layers.references") as string[];

  return (
    <Section className="bg-surface">
      <SectionHeading
        eyebrow={t("layers.eyebrow")}
        title={t("layers.title")}
        subtitle={t("layers.description")}
      />
      <div className="flex flex-col items-stretch gap-6 rounded-xl border border-line bg-field p-6 md:p-8">
        <div className="flex flex-col gap-3">
          <p className="text-meta font-medium tracking-widest text-datum uppercase">
            {t("layers.scenarioLabel")}
          </p>
          <div className="flex flex-wrap gap-3">
            {scenarios.map((item) => (
              <span
                key={item}
                className="rounded-lg border border-datum/50 bg-surface px-3 py-1.5 font-mono text-sm text-ink"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 text-ink-muted" aria-hidden="true">
          <span className="h-px flex-1 bg-line" />
          <ArrowDown className="size-4" />
          <span className="text-meta">{t("layers.cites")}</span>
          <ArrowDown className="size-4" />
          <span className="h-px flex-1 bg-line" />
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-meta font-medium tracking-widest text-insight uppercase">
            {t("layers.referenceLabel")}
          </p>
          <div className="flex flex-wrap gap-3">
            {references.map((item) => (
              <span
                key={item}
                className="rounded-lg border border-insight/40 bg-surface px-3 py-1.5 text-sm text-ink"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

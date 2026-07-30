import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/home/Section";
import { DISCIPLINE_COLORS, type DisciplineKey } from "@/components/home/disciplines";
import { cn } from "@/lib/utils";

type ScenarioKey = "macroScan" | "personalAnchor" | "metacognition";

const SCENARIO_ORDER: { key: ScenarioKey; className: string }[] = [
  // Asymmetric placement (specs/03 §4.1 ③): one wide feature card, then two
  // offset companions — never three identical icon tiles.
  { key: "macroScan", className: "md:col-span-2 lg:col-span-4" },
  { key: "personalAnchor", className: "lg:col-span-2" },
  { key: "metacognition", className: "lg:col-span-2 lg:col-start-3" },
];

function ScenarioCard({
  scenarioKey,
  className,
}: {
  scenarioKey: ScenarioKey;
  className?: string;
}) {
  const t = useTranslations("home");
  const disciplines = t.raw(`scenarios.${scenarioKey}.disciplines`) as DisciplineKey[];

  return (
    <Card
      className={cn(
        "gap-4 border-line border-t-2 border-t-datum shadow-none",
        className,
      )}
    >
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="border-insight/50 text-insight">
            {t("scenarios.layerBadge")}
          </Badge>
          <code className="font-mono text-meta text-ink-muted">
            {t(`scenarios.${scenarioKey}.id`)}
          </code>
        </div>
        <CardTitle className="font-serif text-2xl text-ink">
          {t(`scenarios.${scenarioKey}.name`)}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="text-body leading-relaxed text-ink-muted">
          {t(`scenarios.${scenarioKey}.tagline`)}
        </p>
        <div className="rounded-lg border border-line bg-field px-4 py-3">
          <p className="text-meta font-medium tracking-wide text-ink-muted uppercase">
            {t("scenarios.whenLabel")}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink">
            {t(`scenarios.${scenarioKey}.when`)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {disciplines.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-meta"
              style={{
                borderColor: `color-mix(in oklab, ${DISCIPLINE_COLORS[d]} 45%, transparent)`,
                color: DISCIPLINE_COLORS[d],
              }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: DISCIPLINE_COLORS[d] }}
              />
              {t(`disciplines.${d}.name`)}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Link
          href="/skills"
          className="text-sm font-medium text-insight underline-offset-4 hover:underline"
        >
          {t("scenarios.cta")} →
        </Link>
      </CardFooter>
    </Card>
  );
}

export function ScenarioCards() {
  const t = useTranslations("home.scenarios");

  return (
    <Section>
      <SectionHeading
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-6">
        {SCENARIO_ORDER.map(({ key, className }) => (
          <ScenarioCard key={key} scenarioKey={key} className={className} />
        ))}
      </div>
    </Section>
  );
}

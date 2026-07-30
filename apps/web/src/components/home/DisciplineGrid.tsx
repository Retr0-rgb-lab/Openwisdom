import { useTranslations } from "next-intl";
import { Section, SectionHeading } from "@/components/home/Section";
import { DISCIPLINE_COLORS, DISCIPLINE_ORDER } from "@/components/home/disciplines";

// Five-discipline entry chips (specs/03 §4.1 ⑤): chip color as border or
// ~8–10% fill only — never full-card rainbow (specs/02 §5).
export function DisciplineGrid() {
  const t = useTranslations("home");

  return (
    <Section>
      <SectionHeading
        eyebrow={t("disciplines.eyebrow")}
        title={t("disciplines.title")}
        subtitle={t("disciplines.subtitle")}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {DISCIPLINE_ORDER.map((key) => (
          <div
            key={key}
            className="flex flex-col gap-2 rounded-lg border p-4"
            style={{
              borderColor: `color-mix(in oklab, ${DISCIPLINE_COLORS[key]} 40%, transparent)`,
              backgroundColor: `color-mix(in oklab, ${DISCIPLINE_COLORS[key]} 8%, transparent)`,
            }}
          >
            <p className="flex items-center gap-2 font-medium text-ink">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: DISCIPLINE_COLORS[key] }}
              />
              {t(`disciplines.${key}.name`)}
            </p>
            <p className="text-meta leading-relaxed text-ink-muted">
              {t(`disciplines.${key}.desc`)}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

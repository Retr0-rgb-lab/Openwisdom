import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/home/Section";

// Official vs community (specs/03 §4.1 ⑦): provenance layers, restrained
// badges — insight green for official, warm brown for community (DESIGN.md),
// never playful rainbow badges (specs/02 §7).
export function Provenance() {
  const t = useTranslations("home.provenance");

  const panels = [
    {
      key: "official" as const,
      badgeClass: "border-insight/50 text-insight",
      accentClass: "border-t-insight",
    },
    {
      key: "community" as const,
      badgeClass: "border-community/60 text-community",
      accentClass: "border-t-community",
    },
  ];

  return (
    <Section>
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
      <div className="grid gap-5 md:grid-cols-2">
        {panels.map(({ key, badgeClass, accentClass }) => {
          const points = t.raw(`${key}.points`) as string[];
          return (
            <Card
              key={key}
              className={`gap-4 border-line border-t-2 shadow-none ${accentClass}`}
            >
              <CardHeader className="gap-3">
                <div>
                  <Badge variant="outline" className={badgeClass}>
                    {t(`${key}.badge`)}
                  </Badge>
                </div>
                <CardTitle className="font-serif text-xl text-ink">
                  {t(`${key}.title`)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-3">
                  {points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-insight" />
                      <span className="text-sm leading-relaxed text-ink-muted">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}

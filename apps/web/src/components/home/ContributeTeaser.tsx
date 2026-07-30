import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/home/Section";
import { Separator } from "@/components/ui/separator";
import { GITHUB_URL } from "@/components/site/constants";

// Contribute teaser (specs/03 §4.1 ⑧): fork → template → PR to community/.
// v1 has no web upload or moderation backend — everything via GitHub PR.
export function ContributeTeaser() {
  const t = useTranslations("home.contribute");
  const steps = [t("step1"), t("step2"), t("step3")];

  return (
    <Section className="bg-surface">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
      <div className="flex flex-col gap-6 rounded-xl border border-line bg-field p-6 md:p-8">
        <ol className="flex flex-col gap-4 md:flex-row md:items-center md:gap-0">
          {steps.map((step, i) => (
            <li key={step} className="flex flex-1 items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-datum text-sm font-semibold text-datum">
                {i + 1}
              </span>
              <span className="text-sm font-medium text-ink">{step}</span>
              {i < steps.length - 1 ? (
                <Separator
                  orientation="horizontal"
                  className="mx-4 hidden flex-1 md:block"
                />
              ) : null}
            </li>
          ))}
        </ol>
        <p className="text-sm leading-relaxed text-ink-muted">{t("note")}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="border-line" render={<Link href="/contribute" />}>
            {t("cta")}
          </Button>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-insight underline-offset-4 hover:underline"
          >
            GitHub
            <ArrowUpRight className="size-4" />
          </a>
        </div>
      </div>
    </Section>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Section, SectionHeading } from "@/components/home/Section";
import { Reveal } from "@/components/bits/Reveal";
import { Stagger, StaggerItem } from "@/components/bits/Stagger";
import {
  DISCIPLINE_COLORS,
  DISCIPLINE_ORDER,
} from "@/components/home/disciplines";
import { DISCIPLINE_HOME_TO_ID } from "@/data/catalog/types";

/**
 * layout: spine · colorize: name-side color tick · animate: heading Reveal + grid Stagger
 */
export function DisciplineGrid() {
  const t = useTranslations("home");

  return (
    <Section id="disciplines" reveal={false}>
      <Reveal>
        <SectionHeading
          title={t("disciplines.title")}
          subtitle={t("disciplines.subtitle")}
        />
      </Reveal>
      <Stagger
        className="grid border-y border-line bg-surface sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7"
        stagger={0.05}
      >
        {DISCIPLINE_ORDER.map((key) => (
          <StaggerItem key={key} className="h-full">
            <Link
              href={`/skills?discipline=${DISCIPLINE_HOME_TO_ID[key]}`}
              className="group flex h-full flex-col gap-2.5 border-b border-line px-4 py-6 transition-colors duration-200 last:border-b-0 hover:bg-surface-muted sm:border-b xl:border-b-0 xl:border-r xl:py-7 xl:last:border-r-0"
            >
              <span className="flex items-center gap-2 font-medium tracking-[-0.01em] text-ink">
                {/* 2px tick under name — colorize without left bar */}
                <span
                  className="mt-px size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: DISCIPLINE_COLORS[key] }}
                  aria-hidden
                />
                <span className="underline-offset-4 group-hover:underline group-hover:decoration-structure">
                  {t(`disciplines.${key}.name`)}
                </span>
              </span>
              <span className="pl-3.5 text-[0.8125rem] leading-relaxed text-ink-muted">
                {t(`disciplines.${key}.desc`)}
              </span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-ink-muted">
        {t("disciplines.edgeNote")}
      </p>
    </Section>
  );
}

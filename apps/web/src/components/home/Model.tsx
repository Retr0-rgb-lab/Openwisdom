"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Section, SectionHeading } from "@/components/home/Section";
import { cn } from "@/lib/utils";

type CiteKey = "macro" | "anchor" | "meta";

const CITE_KEYS: CiteKey[] = ["macro", "anchor", "meta"];

/**
 * colorize: selected row commits primary · animate: card swap 280ms
 * layout: clear three-column cite plate
 */
export function Model() {
  const t = useTranslations("home.model");
  const reduce = useReducedMotion();
  const [active, setActive] = useState<CiteKey>("macro");

  return (
    <Section id="model" className="bg-surface/92">
      <SectionHeading title={t("title")} subtitle={t("subtitle")} />

      <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(13rem,0.9fr)_auto_minmax(15rem,1.25fr)] lg:gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-[0.8125rem] font-semibold tracking-[-0.01em] text-ink-muted">
            {t("scenarioLabel")}
          </p>
          <div
            className="flex flex-col gap-2"
            role="group"
            aria-label={t("scenarioLabel")}
          >
            {CITE_KEYS.map((key) => {
              const pressed = active === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => setActive(key)}
                  className={cn(
                    "w-full rounded-lg border px-3.5 py-3 text-left text-sm transition-[border-color,background-color,box-shadow] duration-200",
                    pressed
                      ? "border-primary/40 bg-primary/[0.06] text-ink shadow-[0_1px_3px_rgb(28_75_209/0.08)]"
                      : "border-line bg-surface text-ink hover:border-line hover:bg-field",
                  )}
                >
                  <span className="mb-0.5 block font-mono text-[0.7rem] text-ink-muted">
                    {t(`cites.${key}.id`)}
                  </span>
                  <span className="font-medium">{t(`cites.${key}.name`)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="flex flex-col items-center justify-center gap-1 self-center px-1 text-primary"
          aria-hidden
        >
          {reduce ? (
            <span className="inline-flex items-center gap-1 text-meta font-medium text-primary">
              <ArrowRight className="size-3.5" />
              {t("citesLabel")}
            </span>
          ) : (
            <motion.span
              className="inline-flex items-center gap-1 text-meta font-medium text-primary"
              initial={{ opacity: 0.25, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <ArrowRight className="size-3.5" />
              {t("citesLabel")}
            </motion.span>
          )}
        </div>

        <div className="min-h-[11rem] rounded-xl border border-line bg-field/90 p-5 shadow-[0_1px_4px_rgb(15_23_36/0.04)] md:p-6">
          <p className="mb-2 text-[0.8125rem] font-semibold text-structure">
            {t("referenceLabel")}
          </p>
          <motion.div
            key={active}
            initial={reduce ? false : { opacity: 0.35, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3 className="font-serif text-[1.35rem] leading-snug font-semibold tracking-[-0.02em] text-ink md:text-[1.55rem]">
              {t(`cites.${active}.refTitle`)}
            </h3>
            <p className="mt-2.5 text-[0.9375rem] leading-[1.6] text-ink-muted">
              {t(`cites.${active}.refBody`)}
            </p>
            <p className="mt-4 border-t border-dashed border-line pt-3 font-mono text-[0.72rem] text-ink-muted">
              {t(`cites.${active}.from`)}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 border-t border-line pt-8 sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-line">
        <div className="flex flex-col gap-2 sm:pr-8">
          <h4 className="text-sm font-semibold text-structure">
            {t("official.badge")}
          </h4>
          <p className="text-sm leading-relaxed text-ink-muted">
            {t("official.blurb")}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:pl-8">
          <h4 className="text-sm font-semibold text-community">
            {t("community.badge")}
          </h4>
          <p className="text-sm leading-relaxed text-ink-muted">
            {t("community.blurb")}
          </p>
        </div>
      </div>
    </Section>
  );
}

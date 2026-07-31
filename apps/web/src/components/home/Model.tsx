"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Section, SectionHeading } from "@/components/home/Section";
import { cn } from "@/lib/utils";

type CiteKey = "macro" | "anchor" | "meta";

const CITE_KEYS: CiteKey[] = ["macro", "anchor", "meta"];

/** Cite bridge path length (viewBox units) for stroke-dash draw. */
const BRIDGE_LEN = 100;

/**
 * colorize: selected row commits primary · animate: card swap 280ms
 * layout: clear three-column cite plate
 * motion: SVG cite bridge draws once whileInView (no double fade on label)
 */
export function Model() {
  const t = useTranslations("home.model");
  const reduce = useReducedMotion();
  const [active, setActive] = useState<CiteKey>("macro");

  return (
    <Section id="model" className="bg-surface">
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
                      : "border-line-strong bg-field text-ink hover:border-line-strong hover:bg-surface-muted",
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
          className="flex flex-col items-center justify-center gap-1.5 self-center px-1 text-primary"
          aria-hidden
        >
          <svg
            viewBox="0 0 88 28"
            className="h-7 w-[5.5rem] text-primary"
            fill="none"
          >
            {/* Horizontal cite bridge + chevron tip */}
            <motion.path
              d="M4 14 H68 L60 8 M68 14 L60 20"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={BRIDGE_LEN}
              initial={reduce ? false : { strokeDashoffset: BRIDGE_LEN }}
              whileInView={reduce ? undefined : { strokeDashoffset: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          </svg>
          <span className="text-meta font-medium text-primary">
            {t("citesLabel")}
          </span>
        </div>

        <div className="min-h-[11rem] rounded-xl border border-line-strong bg-field p-5 shadow-[0_1px_0_rgb(15_23_36/0.04),0_4px_14px_-2px_rgb(15_23_36/0.08)] md:p-6">
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

      <div className="mt-10 border-t border-line pt-8">
        <h4 className="text-sm font-semibold text-structure">
          {t("library.badge")}
        </h4>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-muted">
          {t("library.blurb")}
        </p>
      </div>
    </Section>
  );
}

"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BlurText } from "@/components/bits/BlurText";
import { InstallCommand } from "@/components/install/InstallCommand";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Hero: BlurText · triad legend · Install (TextType/Magnet/sweep).
 * ShapeGrid is global via SiteBackdrop (not duplicated here).
 */
export function Hero() {
  const t = useTranslations("home.hero");
  const td = useTranslations("home.hero.diagram");
  const reduce = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden border-b border-line">
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-7 px-6 py-24 text-center md:gap-8 md:py-32">
        <p className="max-w-lg text-[0.9375rem] leading-relaxed text-ink-muted">
          {t("eyebrow")}
        </p>

        <h1 className="max-w-[18ch] font-serif text-[2.35rem] leading-[1.12] font-semibold tracking-[-0.03em] text-ink sm:text-5xl md:text-[3.35rem] md:leading-[1.1] lg:text-[3.6rem]">
          <BlurText text={t("title1")} className="block" />
          <BlurText text={t("title2")} className="block" delay={0.1} />
          <BlurText
            text={t("title3")}
            className="block text-primary"
            delay={0.2}
          />
        </h1>

        {reduce ? (
          <p className="max-w-[38rem] text-base leading-[1.65] text-ink-muted md:text-lg md:leading-relaxed">
            {t("subtitle")}
          </p>
        ) : (
          <motion.p
            className="max-w-[38rem] text-base leading-[1.65] text-ink-muted md:text-lg md:leading-relaxed"
            initial={{ opacity: 0.25, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48, duration: 0.5, ease }}
          >
            {t("subtitle")}
          </motion.p>
        )}

        {/* Triad legend only — full-bleed ShapeGrid is global SiteBackdrop */}
        <ul
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          aria-label={`${td("macro")}, ${td("anchor")}, ${td("meta")}`}
        >
          {(
            [
              {
                key: "macro",
                label: td("macro"),
                mark: (
                  <span
                    className="size-2.5 shrink-0 rounded-full bg-primary"
                    aria-hidden
                  />
                ),
              },
              {
                key: "anchor",
                label: td("anchor"),
                mark: (
                  <span
                    className="inline-block size-0 shrink-0 border-x-[5px] border-b-[9px] border-x-transparent border-b-signal"
                    aria-hidden
                  />
                ),
              },
              {
                key: "meta",
                label: td("meta"),
                mark: (
                  <span
                    className="size-2.5 shrink-0 rounded-[2px] bg-structure"
                    aria-hidden
                  />
                ),
              },
            ] as const
          ).map((item, i) => (
            <motion.li
              key={item.key}
              className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5 text-sm text-ink-muted"
              initial={reduce ? false : { opacity: 0.25, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.07, duration: 0.4, ease }}
            >
              {item.mark}
              {item.label}
            </motion.li>
          ))}
        </ul>

        {reduce ? (
          <InstallCommand className="w-full max-w-lg text-left" emphasis />
        ) : (
          <motion.div
            className="w-full max-w-lg text-left"
            initial={{ opacity: 0.25, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.72, duration: 0.65, ease }}
          >
            <InstallCommand className="w-full" emphasis />
          </motion.div>
        )}

        <Link
          href="/skills"
          className="inline-flex min-h-11 items-center text-sm font-medium text-structure underline-offset-4 transition-colors duration-200 hover:text-primary hover:underline"
        >
          {t("browseSkills")} →
        </Link>
      </div>
    </section>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { InstallCommand } from "@/components/install/InstallCommand";
import { Reveal } from "@/components/bits/Reveal";

/**
 * bolder close: larger title · primary browse · install emphasis ring
 */
export function FinalCta() {
  const t = useTranslations("home.finalCta");

  return (
    <section id="final" className="border-b border-line bg-surface">
      <Reveal>
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1.15fr_0.95fr] md:items-center md:gap-14 md:py-28">
          <div className="flex flex-col gap-5">
            <h2 className="max-w-[16ch] font-serif text-[1.9rem] leading-[1.12] font-semibold tracking-[-0.03em] text-ink md:text-[2.5rem]">
              {t("title")}
            </h2>
            <p className="max-w-md text-base leading-[1.65] text-ink-muted md:text-[1.0625rem]">
              {t("description")}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary-pressed"
                render={<Link href="/skills" />}
              >
                {t("browseSkills")}
              </Button>
              <Button
                variant="ghost"
                className="text-structure hover:text-primary"
                render={<a href="#scenarios" />}
              >
                {t("backToScenarios")}
              </Button>
            </div>
          </div>
          <InstallCommand className="w-full" emphasis />
        </div>
      </Reveal>
    </section>
  );
}

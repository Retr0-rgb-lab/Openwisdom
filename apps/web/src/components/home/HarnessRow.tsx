import { useTranslations } from "next-intl";
import { LogoLoop } from "@/components/bits/LogoLoop";
import { Reveal } from "@/components/bits/Reveal";

/** Compact band between Hero peak and Scenarios — quieter typeset. */
export function HarnessRow() {
  const t = useTranslations("home.harness");
  const items = t.raw("items") as string[];

  return (
    <section className="border-b border-line bg-surface/92">
      <Reveal>
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-12 text-center md:gap-5 md:py-14">
          <h2 className="font-serif text-xl leading-snug font-semibold tracking-[-0.02em] text-ink md:text-2xl">
            {t("label")}
          </h2>
          {t("subtitle") ? (
            <p className="max-w-md text-sm leading-relaxed text-ink-muted">
              {t("subtitle")}
            </p>
          ) : null}
          <LogoLoop items={items} className="w-full" />
          <p className="font-mono text-[0.7rem] tracking-wide text-ink-muted">
            {t("paths")}
          </p>
        </div>
      </Reveal>
    </section>
  );
}

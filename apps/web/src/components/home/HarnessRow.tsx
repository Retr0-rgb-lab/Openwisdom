import { useTranslations } from "next-intl";
import { LogoLoop } from "@/components/bits/LogoLoop";

// Harness trust band (specs/03 §4.1 ②): text wordmarks only — no third-party
// brand glyphs. LogoLoop is the Tier-A pick (specs/04 §5), heavily restrained.
export function HarnessRow() {
  const t = useTranslations("home.harness");
  const items = t.raw("items") as string[];

  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 py-10">
        <p className="text-meta font-medium tracking-widest text-ink-muted uppercase">
          {t("label")}
        </p>
        <LogoLoop items={items} className="w-full" />
      </div>
    </section>
  );
}

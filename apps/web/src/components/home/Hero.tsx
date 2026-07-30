import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DotField } from "@/components/bits/DotField";
import { BlurText } from "@/components/bits/BlurText";
import { Noise } from "@/components/bits/Noise";
import { InstallCommand } from "@/components/install/InstallCommand";
import { OrientationDiagram } from "@/components/home/OrientationDiagram";
import { DatumMark } from "@/components/site/DatumMark";

// Hero recipe (specs/04 §6): DotField background + Noise 3–5% + static eyebrow
// + BlurText H1 once + InstallCommand + orientation mnemonic.
// Heavy-effect budget: DotField + BlurText (+ LogoLoop in HarnessRow) = 3.
export function Hero() {
  const t = useTranslations("home.hero");

  return (
    <section className="relative overflow-hidden border-b border-line">
      <DotField />
      <Noise />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:py-28 lg:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col items-start gap-6">
          <p className="flex items-center gap-2 text-meta font-medium tracking-widest text-ink-muted uppercase">
            <DatumMark className="size-3" />
            {t("eyebrow")}
          </p>
          <h1 className="font-serif text-4xl leading-[1.15] text-ink md:text-5xl lg:text-[3.4rem]">
            <BlurText text={t("title1")} className="block" />
            <BlurText text={t("title2")} className="block" delay={0.15} />
            <BlurText
              text={t("title3")}
              className="block text-datum"
              delay={0.3}
            />
          </h1>
          <p className="max-w-xl text-body leading-relaxed text-ink-muted">
            {t("subtitle")}
          </p>
          <InstallCommand className="w-full max-w-xl" />
          <Link
            href="/skills"
            className="text-sm font-medium text-insight underline-offset-4 hover:underline"
          >
            {t("browseSkills")} →
          </Link>
        </div>
        <OrientationDiagram className="hidden lg:block" />
      </div>
    </section>
  );
}

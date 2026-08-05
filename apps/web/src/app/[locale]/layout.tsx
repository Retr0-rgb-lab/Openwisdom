import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { SiteBackdrop } from "@/components/site/SiteBackdrop";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Toaster } from "@/components/ui/sonner";
import type { CatalogEntry } from "@/data/catalog/types";
import { getCatalogSearchIndex } from "@/data/catalog/server";
import { routing } from "@/i18n/routing";

export const metadata: Metadata = {
  title: {
    default: "Openwisdom",
    template: "%s · Openwisdom",
  },
  description: "Open-source social-science Agent Skills library",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  // Explicit messages so client components (e.g. SkillsCatalog) always see
  // full namespaces: shell / home / skills — including nested sections.* keys.
  const messages = await getMessages();
  // Slim static index for chrome search (server merge only; heat via /api/stats)
  const catalogIndex = getCatalogSearchIndex() as CatalogEntry[];

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* Fixed field under chrome; path-aware static/drift via usePathname */}
      <SiteBackdrop />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader catalogIndex={catalogIndex} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Toaster />
      </div>
    </NextIntlClientProvider>
  );
}

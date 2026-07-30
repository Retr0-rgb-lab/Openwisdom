import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Openwisdom",
  description: "Open-source social-science Agent Skills library",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// The single root layout for the whole app (renders <html>).
// The header/footer below are INLINE PLACEHOLDER shell markup (Plan A only);
// Wave 2 Plan B replaces them with real site/* components. Do not import
// site/* here before then.
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

  return (
    <html lang={locale} className={fontVariables}>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider>
          <header className="border-b border-line bg-surface">
            <div className="mx-auto flex h-14 max-w-5xl items-center px-6 font-serif text-title">
              Openwisdom
            </div>
          </header>
          <div className="flex-1">{children}</div>
          <footer className="border-t border-line bg-surface">
            <div className="mx-auto max-w-5xl px-6 py-6 text-meta text-ink-muted">
              Openwisdom
            </div>
          </footer>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

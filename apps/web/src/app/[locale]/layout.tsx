import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Toaster } from "@/components/ui/sonner";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

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

// The single root layout for the whole app (renders <html>).
// Global chrome comes from components/site/* (Wave 2 Plan B).
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
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

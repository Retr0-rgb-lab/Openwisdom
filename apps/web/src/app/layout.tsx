import type { ReactNode } from "react";
import { fontVariables } from "@/lib/fonts";
import { SiteBackdrop } from "@/components/site/SiteBackdrop";
import "./globals.css";

/**
 * Root document shell (Next.js requires app/layout.tsx).
 * Global Overlay Atlas field: SiteBackdrop (DotField + Noise) under all routes.
 * Locale chrome lives under app/[locale]/layout.tsx.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh" className={fontVariables} suppressHydrationWarning>
      <body className="relative flex min-h-screen flex-col bg-field text-ink">
        <SiteBackdrop />
        <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  );
}

import type { ReactNode } from "react";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

/**
 * Root document shell (Next.js requires app/layout.tsx).
 * Locale chrome + SiteBackdrop live under app/[locale]/layout.tsx
 * so next-intl navigation hooks have a locale context.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh" className={fontVariables} suppressHydrationWarning>
      <body className="relative flex min-h-screen flex-col bg-field text-ink">
        {children}
      </body>
    </html>
  );
}

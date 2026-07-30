import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Openwisdom",
  description: "Open-source social-science Agent Skills library",
};

// Temporary layout (Plan A Task A.2); replaced by the full next-intl
// root layout in Task A.6.
export default function LocaleLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}

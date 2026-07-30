import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";

type Params = Promise<{ locale: string }>;

/**
 * Docs segment layout — pages compose DocsShell themselves for hub vs article.
 * Locale is set so nested server components resolve messages correctly.
 */
export default async function DocsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Params;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}

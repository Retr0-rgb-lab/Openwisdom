/**
 * Public docs sidebar order — Spec 30 / Spec 03.
 * hrefs are locale-free (next-intl Link).
 */

export type DocsNavId =
  | "overview"
  | "getting-started"
  | "concepts"
  | "cli"
  | "agents"
  | "authoring"
  | "privacy"
  | "faq"
  | "changelog";

export type DocsNavStatus = "ready" | "stub";

export type DocsNavItem = {
  id: DocsNavId;
  href: string;
  status: DocsNavStatus;
  /** message key under pages.docs.nav.* */
  labelKey: string;
};

export const DOCS_NAV: DocsNavItem[] = [
  { id: "overview", href: "/docs", status: "ready", labelKey: "overview" },
  {
    id: "getting-started",
    href: "/docs/getting-started",
    status: "ready",
    labelKey: "gettingStarted",
  },
  { id: "concepts", href: "/docs/concepts", status: "ready", labelKey: "concepts" },
  { id: "cli", href: "/docs/cli", status: "ready", labelKey: "cli" },
  { id: "agents", href: "/docs/agents", status: "ready", labelKey: "agents" },
  {
    id: "authoring",
    href: "/docs/authoring",
    status: "ready",
    labelKey: "authoring",
  },
  { id: "privacy", href: "/docs/privacy", status: "ready", labelKey: "privacy" },
  { id: "faq", href: "/docs/faq", status: "ready", labelKey: "faq" },
  {
    id: "changelog",
    href: "/docs/changelog",
    status: "ready",
    labelKey: "changelog",
  },
];

export function isDocsNavActive(pathname: string, href: string): boolean {
  const p = pathname.replace(/\/$/, "") || "/";
  const h = href.replace(/\/$/, "") || "/";
  if (h === "/docs") return p === "/docs";
  return p === h || p.startsWith(`${h}/`);
}

export function getDocsNavNeighbors(pathname: string): {
  prev: DocsNavItem | null;
  next: DocsNavItem | null;
  current: DocsNavItem | null;
} {
  const p = pathname.replace(/\/$/, "") || "/";
  const idx = DOCS_NAV.findIndex((item) => isDocsNavActive(p, item.href));
  if (idx < 0) return { prev: null, next: null, current: null };
  return {
    current: DOCS_NAV[idx] ?? null,
    prev: idx > 0 ? (DOCS_NAV[idx - 1] ?? null) : null,
    next: idx < DOCS_NAV.length - 1 ? (DOCS_NAV[idx + 1] ?? null) : null,
  };
}

export type DocsTocItem = {
  id: string;
  label: string;
};

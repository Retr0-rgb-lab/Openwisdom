// External destinations shared by the site chrome.
export const GITHUB_URL = "https://github.com/Retr0-rgb-lab/Openwisdom";
export const GITHUB_ISSUES_URL = `${GITHUB_URL}/issues`;
export const LICENSE_URL = `${GITHUB_URL}/blob/master/LICENSE`;

// Primary navigation. Install is not a top-level page (install CTAs live on Home / Skills).
export const NAV_ITEMS = [
  { href: "/skills", key: "skills" },
  { href: "/docs", key: "docs" },
  { href: "/contribute", key: "contribute" },
] as const;

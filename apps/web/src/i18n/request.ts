import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Namespaced per file (shell / home / skills) to avoid write conflicts.
  const [shell, home, skills] = await Promise.all([
    import(`../messages/${locale}/shell.json`).then((m) => m.default),
    import(`../messages/${locale}/home.json`).then((m) => m.default),
    import(`../messages/${locale}/skills.json`).then((m) => m.default),
  ]);

  return {
    locale,
    messages: { shell, home, skills },
  };
});

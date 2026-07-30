import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Namespaced per file so Wave 2 plans can extend their own namespace
  // without write conflicts (shell -> Plan B, home -> Plan C).
  const [shell, home] = await Promise.all([
    import(`../messages/${locale}/shell.json`).then((m) => m.default),
    import(`../messages/${locale}/home.json`).then((m) => m.default),
  ]);

  return {
    locale,
    messages: { shell, home },
  };
});

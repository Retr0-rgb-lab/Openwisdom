import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip api routes, Next/Vercel internals, and any path containing a dot
  // (static files such as icon.svg or future /registry/* artifacts).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

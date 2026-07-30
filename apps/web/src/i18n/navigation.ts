import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware navigation primitives. All internal links and the
// LocaleSwitcher must use these instead of bare next/link.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

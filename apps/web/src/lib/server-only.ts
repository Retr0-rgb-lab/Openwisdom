/**
 * Local stand-in for the `server-only` package (not declared in package.json).
 * Import at the top of modules that must never enter a Client Component graph.
 *
 * Next’s built-in plugin only special-cases the real `server-only` package name;
 * this still fails at runtime if a client bundle evaluates the module, and
 * documents the boundary for contributors / code review.
 */
if (typeof window !== "undefined") {
  throw new Error(
    "This module is server-only and must not be imported from Client Components. " +
      "Use @/data/catalog (query/types) or pass data via server props.",
  );
}

export {};

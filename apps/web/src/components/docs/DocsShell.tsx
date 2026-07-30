import type { ReactNode } from "react";
import { DocsPrevNext } from "./DocsPrevNext";
import { DocsSidebar } from "./DocsSidebar";
import { DocsToc } from "./DocsToc";
import type { DocsTocItem } from "./nav";

/**
 * Notion-calm docs chrome: sidebar + main + optional TOC.
 * Mode: Read — no ambient motion, measure-first prose column.
 */
export function DocsShell({
  children,
  toc = [],
  wide = false,
}: {
  children: ReactNode;
  toc?: DocsTocItem[];
  /** Hub cards may use a slightly wider main column. */
  wide?: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 md:py-14">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:gap-10">
        <DocsSidebar />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-10">
            <div
              className={
                wide
                  ? "min-w-0 w-full max-w-3xl xl:max-w-4xl"
                  : "min-w-0 w-full max-w-[42rem]"
              }
            >
              {children}
              <DocsPrevNext />
            </div>
            {toc.length > 0 ? <DocsToc items={toc} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

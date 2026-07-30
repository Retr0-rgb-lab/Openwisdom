import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-xs transition-colors outline-none",
        "placeholder:text-ink-muted/70",
        "focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20",
        "disabled:pointer-events-none disabled:opacity-50",
        "aria-invalid:border-danger aria-invalid:ring-danger/20",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

import { cn } from "@/lib/utils";

/**
 * Project mark: repo `logo.svg` → `public/brand/logo.svg` (Spec 07).
 * Decorative when paired with visible wordmark (alt=""); otherwise pass label.
 */
export function BrandLogo({
  className,
  size = 32,
  alt = "",
}: {
  className?: string;
  size?: number;
  /** Empty when wordmark is adjacent (decorative). */
  alt?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static brand SVG from public/
    <img
      src="/brand/logo.svg"
      alt={alt}
      width={size}
      height={size}
      className={cn("shrink-0 rounded-md object-cover", className)}
      decoding="async"
    />
  );
}

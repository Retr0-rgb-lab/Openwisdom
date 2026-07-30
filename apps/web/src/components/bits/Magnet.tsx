"use client";

import {
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/**
 * React Bits Magnet — adapted
 * https://reactbits.dev/animations/magnet
 * Source: DavidHDev/react-bits (TS-TW Magnet)
 *
 * `magnetStrength`: larger = weaker pull (offset = delta / strength).
 * Cards: try 10–14. CTA buttons: 6–8.
 * Mobile / prefers-reduced-motion → no transform.
 */
export function Magnet({
  children,
  className,
  wrapperClassName,
  innerClassName,
  padding = 60,
  disabled = false,
  /** Official API: higher = milder. Default 12 ≈ slight card drift. */
  magnetStrength = 12,
  activeTransition = "transform 0.3s ease-out",
  inactiveTransition = "transform 0.5s ease-in-out",
  ...props
}: {
  children: ReactNode;
  className?: string;
  wrapperClassName?: string;
  innerClassName?: string;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
} & HTMLAttributes<HTMLDivElement>) {
  const magnetRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mqPointer = window.matchMedia("(pointer: fine)");
    const mqWidth = window.matchMedia("(min-width: 768px)");
    const mqRm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () =>
      setEnabled(mqPointer.matches && mqWidth.matches && !mqRm.matches);
    apply();
    mqPointer.addEventListener("change", apply);
    mqWidth.addEventListener("change", apply);
    mqRm.addEventListener("change", apply);
    return () => {
      mqPointer.removeEventListener("change", apply);
      mqWidth.removeEventListener("change", apply);
      mqRm.removeEventListener("change", apply);
    };
  }, []);

  useEffect(() => {
    if (disabled || !enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      const el = magnetRef.current;
      if (!el) return;
      const { left, top, width, height } = el.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const distX = Math.abs(centerX - e.clientX);
      const distY = Math.abs(centerY - e.clientY);

      if (distX < width / 2 + padding && distY < height / 2 + padding) {
        setIsActive(true);
        // Official formula: larger magnetStrength → smaller offset
        const offsetX = (e.clientX - centerX) / magnetStrength;
        const offsetY = (e.clientY - centerY) / magnetStrength;
        // Soft clamp so large cards don't jump too far
        const max = 10;
        setPosition({
          x: Math.max(-max, Math.min(max, offsetX)),
          y: Math.max(-max, Math.min(max, offsetY)),
        });
      } else {
        setIsActive(false);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      // Reset via event path only; `off` style already drops transform.
      setIsActive(false);
      setPosition({ x: 0, y: 0 });
    };
  }, [padding, disabled, magnetStrength, enabled]);

  const off = disabled || !enabled;

  return (
    <div
      ref={magnetRef}
      className={cn("relative block h-full", wrapperClassName, className)}
      style={{ position: "relative" }}
      {...props}
    >
      <div
        className={cn("h-full will-change-transform", innerClassName)}
        style={
          off
            ? undefined
            : {
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                transition: isActive ? activeTransition : inactiveTransition,
              }
        }
      >
        {children}
      </div>
    </div>
  );
}

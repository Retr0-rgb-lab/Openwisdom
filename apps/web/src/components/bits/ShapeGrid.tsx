"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type CanvasStrokeStyle = string | CanvasGradient | CanvasPattern;

interface GridOffset {
  x: number;
  y: number;
}

export type ShapeGridShape = "square" | "hexagon" | "circle" | "triangle";
export type ShapeGridDirection =
  | "diagonal"
  | "up"
  | "right"
  | "down"
  | "left";

/**
 * React Bits Shape Grid — adapted for Overlay Atlas light field.
 * Upstream: https://reactbits.dev/backgrounds/shape-grid
 * Source: DavidHDev/react-bits TS-TW ShapeGrid
 *
 * Defaults tuned for Openwisdom Home global backdrop (speed 0.32).
 * Dark vignette (#120F17) removed — light field + soft edge fade instead.
 */
export function ShapeGrid({
  className,
  direction = "right",
  speed = 0.32,
  borderColor,
  squareSize = 40,
  hoverFillColor,
  shape = "square",
  hoverTrailAmount = 0,
  /** Freeze animation (non-home routes / RM). */
  static: forceStatic = false,
  /** Allow pointer hover fill (off for full-bleed under content). */
  interactive = false,
}: {
  className?: string;
  direction?: ShapeGridDirection;
  speed?: number;
  borderColor?: CanvasStrokeStyle;
  squareSize?: number;
  hoverFillColor?: CanvasStrokeStyle;
  shape?: ShapeGridShape;
  hoverTrailAmount?: number;
  static?: boolean;
  interactive?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const gridOffset = useRef<GridOffset>({ x: 0, y: 0 });
  const hoveredSquareRef = useRef<GridOffset | null>(null);
  const trailCells = useRef<GridOffset[]>([]);
  const cellOpacities = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const styles = getComputedStyle(document.documentElement);
    // Single quiet border — match field line token, no structure accent stripes
    const stroke: CanvasStrokeStyle =
      borderColor ??
      (styles.getPropertyValue("--ow-line").trim() || "#D5DCE2");
    // Hover: neutral mist wash (not primary pop)
    const hoverFill: CanvasStrokeStyle =
      hoverFillColor ?? "rgba(136, 173, 192, 0.14)";

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const frozen = forceStatic || reduceMotion;

    const isHex = shape === "hexagon";
    const isTri = shape === "triangle";
    const hexHoriz = squareSize * 1.5;
    const hexVert = squareSize * Math.sqrt(3);

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent?.clientWidth || window.innerWidth;
      const h = parent?.clientHeight || window.innerHeight;
      if (w < 2 || h < 2) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawHex = (cx: number, cy: number, size: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const vx = cx + size * Math.cos(angle);
        const vy = cy + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(vx, vy);
        else ctx.lineTo(vx, vy);
      }
      ctx.closePath();
    };

    const drawCircle = (cx: number, cy: number, size: number) => {
      ctx.beginPath();
      ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
      ctx.closePath();
    };

    const drawTriangle = (
      cx: number,
      cy: number,
      size: number,
      flip: boolean,
    ) => {
      ctx.beginPath();
      if (flip) {
        ctx.moveTo(cx, cy + size / 2);
        ctx.lineTo(cx + size / 2, cy - size / 2);
        ctx.lineTo(cx - size / 2, cy - size / 2);
      } else {
        ctx.moveTo(cx, cy - size / 2);
        ctx.lineTo(cx + size / 2, cy + size / 2);
        ctx.lineTo(cx - size / 2, cy + size / 2);
      }
      ctx.closePath();
    };

    const cssW = () => canvas.clientWidth || canvas.width;
    const cssH = () => canvas.clientHeight || canvas.height;

    const drawGrid = () => {
      const width = cssW();
      const height = cssH();
      ctx.clearRect(0, 0, width, height);

      // Soft structure tint on a few strokes via globalAlpha
      ctx.lineWidth = 1;

      if (isHex) {
        const colShift = Math.floor(gridOffset.current.x / hexHoriz);
        const offsetX =
          ((gridOffset.current.x % hexHoriz) + hexHoriz) % hexHoriz;
        const offsetY =
          ((gridOffset.current.y % hexVert) + hexVert) % hexVert;
        const cols = Math.ceil(width / hexHoriz) + 3;
        const rows = Math.ceil(height / hexVert) + 3;

        for (let col = -2; col < cols; col++) {
          for (let row = -2; row < rows; row++) {
            const cx = col * hexHoriz + offsetX;
            const cy =
              row * hexVert +
              ((col + colShift) % 2 !== 0 ? hexVert / 2 : 0) +
              offsetY;
            const cellKey = `${col},${row}`;
            const alpha = cellOpacities.current.get(cellKey);
            if (alpha) {
              ctx.globalAlpha = alpha;
              drawHex(cx, cy, squareSize);
              ctx.fillStyle = hoverFill as string;
              ctx.fill();
              ctx.globalAlpha = 1;
            }
            drawHex(cx, cy, squareSize);
            ctx.strokeStyle = stroke as string;
            ctx.globalAlpha = 0.45;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      } else if (isTri) {
        const halfW = squareSize / 2;
        const colShift = Math.floor(gridOffset.current.x / halfW);
        const rowShift = Math.floor(gridOffset.current.y / squareSize);
        const offsetX = ((gridOffset.current.x % halfW) + halfW) % halfW;
        const offsetY =
          ((gridOffset.current.y % squareSize) + squareSize) % squareSize;
        const cols = Math.ceil(width / halfW) + 4;
        const rows = Math.ceil(height / squareSize) + 4;

        for (let col = -2; col < cols; col++) {
          for (let row = -2; row < rows; row++) {
            const cx = col * halfW + offsetX;
            const cy = row * squareSize + squareSize / 2 + offsetY;
            const flip =
              ((col + colShift + row + rowShift) % 2 + 2) % 2 !== 0;
            const cellKey = `${col},${row}`;
            const alpha = cellOpacities.current.get(cellKey);
            if (alpha) {
              ctx.globalAlpha = alpha;
              drawTriangle(cx, cy, squareSize, flip);
              ctx.fillStyle = hoverFill as string;
              ctx.fill();
              ctx.globalAlpha = 1;
            }
            drawTriangle(cx, cy, squareSize, flip);
            ctx.strokeStyle = stroke as string;
            ctx.globalAlpha = 0.45;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      } else if (shape === "circle") {
        const offsetX =
          ((gridOffset.current.x % squareSize) + squareSize) % squareSize;
        const offsetY =
          ((gridOffset.current.y % squareSize) + squareSize) % squareSize;
        const cols = Math.ceil(width / squareSize) + 3;
        const rows = Math.ceil(height / squareSize) + 3;

        for (let col = -2; col < cols; col++) {
          for (let row = -2; row < rows; row++) {
            const cx = col * squareSize + squareSize / 2 + offsetX;
            const cy = row * squareSize + squareSize / 2 + offsetY;
            const cellKey = `${col},${row}`;
            const alpha = cellOpacities.current.get(cellKey);
            if (alpha) {
              ctx.globalAlpha = alpha;
              drawCircle(cx, cy, squareSize);
              ctx.fillStyle = hoverFill as string;
              ctx.fill();
              ctx.globalAlpha = 1;
            }
            drawCircle(cx, cy, squareSize);
            ctx.strokeStyle = stroke as string;
            ctx.globalAlpha = 0.4;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      } else {
        // square (default demo)
        const offsetX =
          ((gridOffset.current.x % squareSize) + squareSize) % squareSize;
        const offsetY =
          ((gridOffset.current.y % squareSize) + squareSize) % squareSize;
        const cols = Math.ceil(width / squareSize) + 3;
        const rows = Math.ceil(height / squareSize) + 3;

        for (let col = -2; col < cols; col++) {
          for (let row = -2; row < rows; row++) {
            const sx = col * squareSize + offsetX;
            const sy = row * squareSize + offsetY;
            const cellKey = `${col},${row}`;
            const alpha = cellOpacities.current.get(cellKey);
            if (alpha) {
              ctx.globalAlpha = alpha;
              ctx.fillStyle = hoverFill as string;
              ctx.fillRect(sx, sy, squareSize, squareSize);
              ctx.globalAlpha = 1;
            }
            // Uniform stroke only — no lattice accent (avoids continuous dark bands)
            ctx.strokeStyle = stroke as string;
            ctx.globalAlpha = 0.18;
            ctx.strokeRect(sx + 0.5, sy + 0.5, squareSize, squareSize);
            ctx.globalAlpha = 1;
          }
        }
      }

      // Light edge vignette toward field (NOT upstream dark #120F17)
      const g = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.sqrt(width ** 2 + height ** 2) / 2,
      );
      g.addColorStop(0, "rgba(248, 249, 250, 0)");
      g.addColorStop(0.7, "rgba(248, 249, 250, 0)");
      g.addColorStop(1, "rgba(248, 249, 250, 0.88)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    };

    const updateCellOpacities = () => {
      if (!interactive || reduceMotion) return;
      const targets = new Map<string, number>();
      if (hoveredSquareRef.current) {
        targets.set(
          `${hoveredSquareRef.current.x},${hoveredSquareRef.current.y}`,
          1,
        );
      }
      if (hoverTrailAmount > 0) {
        for (let i = 0; i < trailCells.current.length; i++) {
          const t = trailCells.current[i];
          const key = `${t.x},${t.y}`;
          if (!targets.has(key)) {
            targets.set(
              key,
              (trailCells.current.length - i) /
                (trailCells.current.length + 1),
            );
          }
        }
      }
      for (const [key] of targets) {
        if (!cellOpacities.current.has(key)) {
          cellOpacities.current.set(key, 0);
        }
      }
      for (const [key, opacity] of cellOpacities.current) {
        const target = targets.get(key) || 0;
        const next = opacity + (target - opacity) * 0.18;
        if (next < 0.005) cellOpacities.current.delete(key);
        else cellOpacities.current.set(key, next);
      }
    };

    const updateAnimation = () => {
      if (document.hidden) {
        requestRef.current = requestAnimationFrame(updateAnimation);
        return;
      }
      // Allow slow speeds (do not clamp to 0.1 — that made 0.32 feel fast-ish)
      const effectiveSpeed = Math.max(speed, 0.02);

      if (!frozen) {
        const wrapX = isHex ? hexHoriz * 2 : squareSize;
        const wrapY = isHex ? hexVert : isTri ? squareSize * 2 : squareSize;

        switch (direction) {
          case "right":
            gridOffset.current.x =
              (gridOffset.current.x - effectiveSpeed + wrapX) % wrapX;
            break;
          case "left":
            gridOffset.current.x =
              (gridOffset.current.x + effectiveSpeed + wrapX) % wrapX;
            break;
          case "up":
            gridOffset.current.y =
              (gridOffset.current.y + effectiveSpeed + wrapY) % wrapY;
            break;
          case "down":
            gridOffset.current.y =
              (gridOffset.current.y - effectiveSpeed + wrapY) % wrapY;
            break;
          case "diagonal":
            gridOffset.current.x =
              (gridOffset.current.x - effectiveSpeed + wrapX) % wrapX;
            gridOffset.current.y =
              (gridOffset.current.y - effectiveSpeed + wrapY) % wrapY;
            break;
          default:
            break;
        }
      }

      updateCellOpacities();
      drawGrid();
      // Keep loop for hover fade even when grid offset is frozen
      if (!frozen || interactive) {
        requestRef.current = requestAnimationFrame(updateAnimation);
      }
    };

    /**
     * Window-level pointer tracking so cursor fill works while the layer stays
     * pointer-events: none (clicks reach the page).
     */
    const handleMouseMove = (event: MouseEvent) => {
      if (!interactive || reduceMotion) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      if (
        mouseX < 0 ||
        mouseY < 0 ||
        mouseX > rect.width ||
        mouseY > rect.height
      ) {
        hoveredSquareRef.current = null;
        return;
      }
      const offsetX =
        ((gridOffset.current.x % squareSize) + squareSize) % squareSize;
      const offsetY =
        ((gridOffset.current.y % squareSize) + squareSize) % squareSize;
      const col = Math.floor((mouseX - offsetX) / squareSize);
      const row = Math.floor((mouseY - offsetY) / squareSize);
      if (
        !hoveredSquareRef.current ||
        hoveredSquareRef.current.x !== col ||
        hoveredSquareRef.current.y !== row
      ) {
        if (hoveredSquareRef.current && hoverTrailAmount > 0) {
          trailCells.current.unshift({ ...hoveredSquareRef.current });
          if (trailCells.current.length > hoverTrailAmount) {
            trailCells.current.length = hoverTrailAmount;
          }
        }
        hoveredSquareRef.current = { x: col, y: row };
      }
    };

    const handleMouseLeaveDoc = () => {
      hoveredSquareRef.current = null;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    if (interactive && !reduceMotion) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      document.documentElement.addEventListener(
        "mouseleave",
        handleMouseLeaveDoc,
      );
    }

    // Always start loop when drifting or when hover fills need animation
    if (!frozen || (interactive && !reduceMotion)) {
      requestRef.current = requestAnimationFrame(updateAnimation);
    } else {
      drawGrid();
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
        document.documentElement.removeEventListener(
          "mouseleave",
          handleMouseLeaveDoc,
        );
      }
      if (requestRef.current != null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [
    direction,
    speed,
    borderColor,
    squareSize,
    hoverFillColor,
    shape,
    hoverTrailAmount,
    forceStatic,
    interactive,
  ]);

  return (
    <div
      aria-hidden="true"
      className={cn(
        // Never capture clicks — cursor tracking is on window when interactive
        "pointer-events-none absolute inset-0 z-0 overflow-hidden",
        className,
      )}
    >
      <canvas ref={canvasRef} className="block size-full" />
    </div>
  );
}

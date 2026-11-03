import type { Box } from "./types";

/** 16:9 widescreen, inches — PowerPoint's default "Widescreen" */
export const SLIDE = { w: 13.333, h: 7.5 } as const;

export const box = (x: number, y: number, w: number, h: number): Box => ({ x, y, w, h });
export const right = (b: Box) => b.x + b.w;
export const bottom = (b: Box) => b.y + b.h;

export function inset(b: Box, dx: number, dy = dx): Box {
  return { x: b.x + dx, y: b.y + dy, w: b.w - 2 * dx, h: b.h - 2 * dy };
}

/** split horizontally into n columns with gutter; `weights` for unequal widths */
export function columns(b: Box, n: number, gutter: number, weights?: number[]): Box[] {
  const ws = weights ?? Array.from({ length: n }, () => 1);
  const total = ws.reduce((a, c) => a + c, 0);
  const free = b.w - gutter * (n - 1);
  let x = b.x;
  return ws.map((wt) => {
    const w = (free * wt) / total;
    const out = { x, y: b.y, w, h: b.h };
    x += w + gutter;
    return out;
  });
}

export function rows(b: Box, n: number, gutter: number, weights?: number[]): Box[] {
  return columns({ x: b.y, y: b.x, w: b.h, h: b.w }, n, gutter, weights).map((r) => ({
    x: r.y,
    y: r.x,
    w: r.h,
    h: r.w,
  }));
}

export function intersect(a: Box, b: Box): Box | null {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const w = Math.min(right(a), right(b)) - x;
  const h = Math.min(bottom(a), bottom(b)) - y;
  return w > 0 && h > 0 ? { x, y, w, h } : null;
}

export const area = (b: Box) => b.w * b.h;
export const contains = (outer: Box, inner: Box, tol = 0.001) =>
  inner.x >= outer.x - tol && inner.y >= outer.y - tol && right(inner) <= right(outer) + tol && bottom(inner) <= bottom(outer) + tol;

import type { StrokePoint } from './types';

/** Ponto em pixels, no sistema de coordenadas da grade. */
export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface CellRect {
  cellId: string;
  rect: Rect;
}

export interface ScratchedCell {
  cellId: string;
  /** 0 a 1: fração da largura da célula coberta horizontalmente pelo traço. */
  coverage: number;
  /** Trecho do traço dentro da célula, normalizado (0–1). */
  stroke: StrokePoint[];
}

/** Cobertura mínima (fração da largura) para uma célula contar como riscada. */
export const SCRATCH_COVERAGE_THRESHOLD = 0.6;

type Segment = readonly [Point, Point];

/** Recorta o segmento ao retângulo (Liang–Barsky). Retorna undefined se não houver interseção. */
export function clipSegmentToRect([start, end]: Segment, rect: Rect): Segment | undefined {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  let enter = 0;
  let exit = 1;
  const checks: Array<[number, number]> = [
    [-dx, start.x - rect.left],
    [dx, rect.left + rect.width - start.x],
    [-dy, start.y - rect.top],
    [dy, rect.top + rect.height - start.y],
  ];
  for (const [p, q] of checks) {
    if (p === 0) {
      if (q < 0) return undefined;
      continue;
    }
    const t = q / p;
    if (p < 0) enter = Math.max(enter, t);
    else exit = Math.min(exit, t);
    if (enter > exit) return undefined;
  }
  return [
    { x: start.x + enter * dx, y: start.y + enter * dy },
    { x: start.x + exit * dx, y: start.y + exit * dy },
  ];
}

function segmentsOf(points: readonly Point[]): Segment[] {
  if (points.length === 1) return [[points[0]!, points[0]!]];
  const segments: Segment[] = [];
  for (let i = 1; i < points.length; i++) segments.push([points[i - 1]!, points[i]!]);
  return segments;
}

function unionLength(intervals: Array<[number, number]>): number {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  let total = 0;
  let current: [number, number] | undefined;
  for (const [from, to] of sorted) {
    if (!current || from > current[1]) {
      if (current) total += current[1] - current[0];
      current = [from, to];
    } else {
      current[1] = Math.max(current[1], to);
    }
  }
  if (current) total += current[1] - current[0];
  return total;
}

/** Fração (0–1) da largura do retângulo coberta horizontalmente pelo traço. */
export function computeHorizontalCoverage(points: readonly Point[], rect: Rect): number {
  if (points.length === 0 || rect.width <= 0) return 0;
  const intervals: Array<[number, number]> = [];
  for (const segment of segmentsOf(points)) {
    const clipped = clipSegmentToRect(segment, rect);
    if (!clipped) continue;
    const [a, b] = clipped;
    intervals.push([Math.min(a.x, b.x), Math.max(a.x, b.x)]);
  }
  return Math.min(1, unionLength(intervals) / rect.width);
}

const round = (value: number) => Math.round(value * 1000) / 1000;

/** Trecho do traço dentro do retângulo, normalizado para 0–1 em relação a ele. */
export function normalizeStrokeToRect(points: readonly Point[], rect: Rect): StrokePoint[] {
  const normalized: StrokePoint[] = [];
  const push = (point: Point) => {
    const next = { x: round((point.x - rect.left) / rect.width), y: round((point.y - rect.top) / rect.height) };
    const last = normalized.at(-1);
    if (!last || last.x !== next.x || last.y !== next.y) normalized.push(next);
  };
  for (const segment of segmentsOf(points)) {
    const clipped = clipSegmentToRect(segment, rect);
    if (!clipped) continue;
    push(clipped[0]);
    push(clipped[1]);
  }
  return normalized;
}

/** Células cuja largura foi coberta pelo traço em pelo menos `threshold`. */
export function findScratchedCells(
  points: readonly Point[],
  cells: readonly CellRect[],
  threshold: number = SCRATCH_COVERAGE_THRESHOLD,
): ScratchedCell[] {
  const scratched: ScratchedCell[] = [];
  for (const { cellId, rect } of cells) {
    const coverage = computeHorizontalCoverage(points, rect);
    if (coverage >= threshold) scratched.push({ cellId, coverage, stroke: normalizeStrokeToRect(points, rect) });
  }
  return scratched;
}

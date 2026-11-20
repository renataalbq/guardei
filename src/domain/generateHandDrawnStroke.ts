import type { StrokePoint } from './types';

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Gerador pseudoaleatório determinístico (mulberry32). */
export function createSeededRandom(seed: string): () => number {
  let state = hashString(seed);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const POINTS_IN_STROKE = 7;
const round = (value: number) => Math.round(value * 1000) / 1000;

/**
 * Risco "feito à mão" usado quando a célula é marcada por toque.
 * Sempre o mesmo para a mesma semente, levemente inclinado e tremido.
 */
export function generateHandDrawnStroke(seed: string): StrokePoint[] {
  const random = createSeededRandom(seed);
  const startX = 0.04 + random() * 0.06;
  const endX = 0.9 + random() * 0.06;
  const startY = 0.48 + random() * 0.14;
  const endY = 0.38 + random() * 0.14;

  const points: StrokePoint[] = [];
  for (let i = 0; i < POINTS_IN_STROKE; i++) {
    const t = i / (POINTS_IN_STROKE - 1);
    const isEndpoint = i === 0 || i === POINTS_IN_STROKE - 1;
    const wobble = isEndpoint ? 0 : (random() - 0.5) * 0.07;
    points.push({
      x: round(startX + (endX - startX) * t),
      y: round(startY + (endY - startY) * t + wobble),
    });
  }
  return points;
}

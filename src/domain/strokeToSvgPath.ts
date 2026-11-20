import type { StrokePoint } from './types';

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Converte o traço normalizado (0–1) num `d` de path SVG, suavizado com curvas quadráticas.
 * `width` e `height` são o tamanho do viewBox (mantém a proporção da célula).
 */
export function strokeToSvgPath(points: readonly StrokePoint[], width: number, height: number): string {
  const scaled = points.map((point) => ({ x: round(point.x * width), y: round(point.y * height) }));
  const [first, ...rest] = scaled;
  if (!first) return '';
  if (rest.length === 0) return `M${first.x} ${first.y}l0 0`;

  let path = `M${first.x} ${first.y}`;
  for (let i = 0; i < rest.length - 1; i++) {
    const control = rest[i]!;
    const next = rest[i + 1]!;
    path += ` Q${control.x} ${control.y} ${round((control.x + next.x) / 2)} ${round((control.y + next.y) / 2)}`;
  }
  const last = rest.at(-1)!;
  return `${path} L${last.x} ${last.y}`;
}

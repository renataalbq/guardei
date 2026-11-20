import { strokeToSvgPath } from '../../domain/strokeToSvgPath';
import type { StrokePoint } from '../../domain/types';

interface StrokePathProps {
  stroke: StrokePoint[];
  /** Largura ÷ altura da célula, para o traço não deformar. */
  aspectRatio: number;
  animate: boolean;
  /** Espessura em unidades do viewBox (100 = largura da célula). */
  strokeWidth: number;
}

const VIEWBOX_WIDTH = 100;

/** Desenha o risco de uma célula (traço normalizado 0–1). */
export function StrokePath({ stroke, aspectRatio, animate, strokeWidth }: StrokePathProps) {
  const viewBoxHeight = VIEWBOX_WIDTH / aspectRatio;
  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${viewBoxHeight}`}
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      aria-hidden="true"
    >
      <path
        d={strokeToSvgPath(stroke, VIEWBOX_WIDTH, viewBoxHeight)}
        pathLength={1}
        fill="none"
        stroke="var(--marker)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animate ? 'stroke-draw' : undefined}
      />
    </svg>
  );
}

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { CellMark } from '../../data/challengeRepository';
import { computeGridColumns } from '../../domain/gridLayout';
import { findScratchedCells, type CellRect, type Point } from '../../domain/strokeCoverage';
import type { Cell, ChallengeType } from '../../domain/types';
import { useScratchGesture } from '../../hooks/useScratchGesture';
import { GridCell, type CellEmphasis } from './GridCell';

const CELL_ASPECT_RATIO: Record<ChallengeType, number> = {
  sequential: 1,
  weeks52: 4 / 3,
};
/** Células mais largas pedem traço mais fino, para a espessura ficar parecida na tela. */
const STROKE_WIDTH: Record<ChallengeType, number> = {
  sequential: 8,
  weeks52: 4.2,
};
const GRID_LINE_WIDTH = 1;
const LIVE_STROKE_WIDTH_PX = 5;

interface SavingsGridProps {
  cells: Cell[];
  type: ChallengeType;
  onSelectCell: (cell: Cell) => void;
  onScratchCells: (marks: CellMark[]) => void;
  /** Quando definido, destaca estas células (cabem no valor de hoje) e esmaece as outras não riscadas. */
  affordableCellIds?: ReadonlySet<string>;
  spotlightCellId?: string;
}

function emphasisOf(cell: Cell, affordableCellIds: ReadonlySet<string> | undefined): CellEmphasis {
  if (!affordableCellIds || cell.savedAt !== undefined) return 'none';
  return affordableCellIds.has(cell.id) ? 'affordable' : 'dimmed';
}

/** Mede a largura disponível para escolher quantas colunas cabem. */
function useContainerWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    setWidth(element.clientWidth);
    const observer = new ResizeObserver(([entry]) => entry && setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

/** Posição de cada célula ainda não riscada, relativa ao container da grade. */
function measureOpenCellRects(container: HTMLElement, openCellIds: ReadonlySet<string>): CellRect[] {
  const origin = container.getBoundingClientRect();
  const rects: CellRect[] = [];
  for (const element of container.querySelectorAll<HTMLElement>('[data-cell-id]')) {
    const cellId = element.dataset.cellId!;
    if (!openCellIds.has(cellId)) continue;
    const rect = element.getBoundingClientRect();
    rects.push({
      cellId,
      rect: {
        left: rect.left - origin.left,
        top: rect.top - origin.top,
        width: rect.width,
        height: rect.height,
      },
    });
  }
  return rects;
}

export function SavingsGrid({ cells, type, onSelectCell, onScratchCells, affordableCellIds, spotlightCellId }: SavingsGridProps) {
  const { ref: measureRef, width } = useContainerWidth<HTMLDivElement>();
  const gestureRef = useRef<HTMLDivElement>(null);
  const liveStrokeRef = useRef<SVGPathElement>(null);
  const [scratchedByFinger, setScratchedByFinger] = useState<ReadonlySet<string>>(new Set());

  const columns = width > 0 ? computeGridColumns(width, type, GRID_LINE_WIDTH) : 0;
  const emptySlotsInLastRow = columns > 0 ? (columns - (cells.length % columns)) % columns : 0;

  const handleScratch = useCallback(
    (points: Point[]) => {
      const container = gestureRef.current;
      if (!container) return;
      const openCellIds = new Set(cells.filter((cell) => cell.savedAt === undefined).map((cell) => cell.id));
      const scratched = findScratchedCells(points, measureOpenCellRects(container, openCellIds));
      if (scratched.length === 0) return;
      setScratchedByFinger(new Set(scratched.map((cell) => cell.cellId)));
      onScratchCells(scratched.map(({ cellId, stroke }) => ({ cellId, stroke })));
    },
    [cells, onScratchCells],
  );

  const gestureHandlers = useScratchGesture({
    containerRef: gestureRef,
    liveStrokeRef,
    onScratch: handleScratch,
  });

  return (
    <div ref={measureRef} className="w-full">
      {columns > 0 && (
        <div ref={gestureRef} {...gestureHandlers} className="relative touch-pan-y select-none [-webkit-touch-callout:none]">
          <div
            role="group"
            aria-label="Valores para riscar"
            className="grid overflow-hidden rounded-3xl bg-paper-line shadow-[var(--shadow-card)] ring-1 ring-paper-line"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              gap: GRID_LINE_WIDTH,
            }}
          >
            {cells.map((cell) => (
              <GridCell
                key={cell.id}
                cell={cell}
                type={type}
                aspectRatio={CELL_ASPECT_RATIO[type]}
                strokeWidth={STROKE_WIDTH[type]}
                wasScratchedByFinger={scratchedByFinger.has(cell.id)}
                emphasis={emphasisOf(cell, affordableCellIds)}
                isSpotlight={cell.id === spotlightCellId}
                onSelect={onSelectCell}
              />
            ))}
            {Array.from({ length: emptySlotsInLastRow }, (_, index) => (
              <div key={`empty-${index}`} aria-hidden="true" className="cell-paper" />
            ))}
          </div>
          <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <path
              ref={liveStrokeRef}
              fill="none"
              stroke="var(--marker)"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeWidth: `calc(${LIVE_STROKE_WIDTH_PX}px * var(--marker-scale))`,
                opacity: 'var(--marker-opacity)',
                filter: 'var(--marker-glow)',
              }}
            />
          </svg>
        </div>
      )}
    </div>
  );
}

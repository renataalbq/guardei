import { useLayoutEffect, useRef, useState } from 'react';
import { computeGridColumns } from '../../domain/gridLayout';
import type { Cell, ChallengeType } from '../../domain/types';
import { GridCell } from './GridCell';

const CELL_ASPECT_RATIO: Record<ChallengeType, number> = { sequential: 1, weeks52: 4 / 3 };
/** Células mais largas pedem traço mais fino, para a espessura ficar parecida na tela. */
const STROKE_WIDTH: Record<ChallengeType, number> = { sequential: 7, weeks52: 3.6 };
const GRID_LINE_WIDTH = 1;

interface SavingsGridProps {
  cells: Cell[];
  type: ChallengeType;
  onSelectCell: (cell: Cell) => void;
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

export function SavingsGrid({ cells, type, onSelectCell }: SavingsGridProps) {
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const columns = width > 0 ? computeGridColumns(width, type, GRID_LINE_WIDTH) : 0;
  const emptySlotsInLastRow = columns > 0 ? (columns - (cells.length % columns)) % columns : 0;

  return (
    <div ref={ref} className="w-full">
      {columns > 0 && (
        <div
          role="group"
          aria-label="Valores para riscar"
          className="grid overflow-hidden rounded-xl border border-paper-line bg-paper-line"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: GRID_LINE_WIDTH }}
        >
          {cells.map((cell) => (
            <GridCell key={cell.id} cell={cell} type={type} aspectRatio={CELL_ASPECT_RATIO[type]}
              strokeWidth={STROKE_WIDTH[type]}
              onSelect={onSelectCell} />
          ))}
          {Array.from({ length: emptySlotsInLastRow }, (_, index) => (
            <div key={`empty-${index}`} aria-hidden="true" className="bg-paper" />
          ))}
        </div>
      )}
    </div>
  );
}

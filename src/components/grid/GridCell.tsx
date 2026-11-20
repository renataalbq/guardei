import { memo, useEffect, useRef, useState } from 'react';
import { formatCellNumber, formatCurrency } from '../../domain/formatCurrency';
import type { Cell, ChallengeType } from '../../domain/types';
import { StrokePath } from './StrokePath';

interface GridCellProps {
  cell: Cell;
  type: ChallengeType;
  aspectRatio: number;
  strokeWidth: number;
  onSelect: (cell: Cell) => void;
}

/** Fica true só quando a célula passa de "não riscada" para "riscada" enquanto está na tela. */
function useJustSaved(isSaved: boolean): boolean {
  const wasSaved = useRef(isSaved);
  const [justSaved, setJustSaved] = useState(false);
  useEffect(() => {
    if (isSaved && !wasSaved.current) setJustSaved(true);
    if (!isSaved) setJustSaved(false);
    wasSaved.current = isSaved;
  }, [isSaved]);
  return justSaved;
}

export const GridCell = memo(function GridCell({ cell, type, aspectRatio, strokeWidth, onSelect }: GridCellProps) {
  const isSaved = cell.savedAt !== undefined;
  const justSaved = useJustSaved(isSaved);
  const label = type === 'weeks52' ? `Semana ${cell.position + 1}, ${formatCurrency(cell.value)}` : formatCurrency(cell.value);

  return (
    <button
      type="button"
      data-cell-id={cell.id}
      aria-label={`${label}${isSaved ? ', guardado' : ''}`}
      aria-pressed={isSaved}
      onClick={() => onSelect(cell)}
      style={{ aspectRatio }}
      className={`relative flex flex-col items-center justify-center bg-paper select-none ${justSaved ? 'cell-saved-glow' : ''}`}
    >
      {type === 'weeks52' && (
        <span className={`text-[0.65rem] font-medium tracking-wide uppercase ${isSaved ? 'text-muted/60' : 'text-muted'}`}>
          Sem. {cell.position + 1}
        </span>
      )}
      <span
        className={`font-hand leading-none font-bold transition-colors ${type === 'weeks52' ? 'text-2xl' : 'text-[1.6rem]'} ${
          isSaved ? 'text-muted/70' : 'text-ink'
        }`}
      >
        {formatCellNumber(cell.value)}
      </span>
      {isSaved && cell.stroke && <StrokePath stroke={cell.stroke} aspectRatio={aspectRatio} strokeWidth={strokeWidth} animate={justSaved} />}
    </button>
  );
});

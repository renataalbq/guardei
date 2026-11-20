import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { SavingsGrid } from '../components/grid/SavingsGrid';
import { DeadlineHint } from '../components/progress/DeadlineHint';
import { ProgressHeader } from '../components/progress/ProgressHeader';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { todayCalendarDate } from '../domain/calendarDate';
import { formatCurrency } from '../domain/formatCurrency';
import type { Cell } from '../domain/types';
import { useChallenge } from '../hooks/useChallenge';

/** Vibração é só um extra: o Safari do iOS não tem `navigator.vibrate`. */
function vibrateIfAvailable(durationMs: number) {
  if ('vibrate' in navigator) navigator.vibrate(durationMs);
}

export function ChallengePage() {
  const { challengeId = '' } = useParams();
  const { state, markCellAsSavedByTap, unmarkCell } = useChallenge(challengeId);
  const [cellToUndo, setCellToUndo] = useState<Cell | undefined>();
  const today = useMemo(() => todayCalendarDate(), []);

  const handleSelectCell = useCallback(
    (cell: Cell) => {
      if (cell.savedAt) {
        setCellToUndo(cell);
        return;
      }
      vibrateIfAvailable(12);
      void markCellAsSavedByTap(cell);
    },
    [markCellAsSavedByTap],
  );

  const closeUndo = useCallback(() => setCellToUndo(undefined), []);

  if (state.status === 'loading') return null;

  if (state.status === 'not-found') {
    return (
      <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-hand text-4xl font-bold text-ink">Desafio não encontrado</p>
        <Link to="/" className="rounded-xl bg-ink px-6 py-3 font-semibold text-white">
          Voltar para o início
        </Link>
      </main>
    );
  }

  const { challenge, cells, progress } = state;

  return (
    <div className="min-h-dvh">
      <ProgressHeader name={challenge.name} progress={progress} />
      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <DeadlineHint challenge={challenge} savedAmount={progress.savedAmount} today={today} />
        <p className="text-center text-xs text-muted">Toque num valor quando guardar essa quantia.</p>
        <SavingsGrid cells={cells} type={challenge.type} onSelectCell={handleSelectCell} />
      </main>

      <ConfirmDialog
        open={cellToUndo !== undefined}
        title="Desfazer este valor?"
        description={cellToUndo ? `${formatCurrency(cellToUndo.value)} volta a ficar sem riscar.` : undefined}
        confirmLabel="Desfazer"
        onCancel={closeUndo}
        onConfirm={() => {
          if (cellToUndo) void unmarkCell(cellToUndo);
          closeUndo();
        }}
      />
    </div>
  );
}

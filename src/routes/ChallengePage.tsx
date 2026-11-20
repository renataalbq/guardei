import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { SavingsGrid } from '../components/grid/SavingsGrid';
import { AffordableTodayButton } from '../components/today/AffordableTodayButton';
import { AffordableTodaySheet } from '../components/today/AffordableTodaySheet';
import { TodayBudgetBar } from '../components/today/TodayBudgetBar';
import { ActivityStrip } from '../components/progress/ActivityStrip';
import { ChallengeHero } from '../components/progress/ChallengeHero';
import { MilestoneCelebration } from '../components/progress/MilestoneCelebration';
import { PaceCard } from '../components/progress/PaceCard';
import { ProgressHeader } from '../components/progress/ProgressHeader';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Icon } from '../components/ui/Icon';
import type { CellMark } from '../data/challengeRepository';
import { todayCalendarDate } from '../domain/calendarDate';
import { formatCurrency } from '../domain/formatCurrency';
import { findMilestoneCrossed } from '../domain/milestones';
import type { Cell } from '../domain/types';
import { useChallenge } from '../hooks/useChallenge';
import { useTodayBudget } from '../hooks/useTodayBudget';

/** Vibração é só um extra: o Safari do iOS não tem `navigator.vibrate`. */
function vibrateIfAvailable(pattern: number | number[]) {
  if ('vibrate' in navigator) navigator.vibrate(pattern);
}

/** Comemora quando o total guardado passa de um marco (só por ações feitas com a tela aberta). */
function useMilestoneCelebration(goal: number | undefined, savedAmount: number | undefined) {
  const previous = useRef<number | undefined>(undefined);
  const [celebratingPercent, setCelebratingPercent] = useState<number | undefined>();

  useEffect(() => {
    if (goal === undefined || savedAmount === undefined) return;
    if (previous.current !== undefined) {
      const crossed = findMilestoneCrossed(goal, previous.current, savedAmount);
      if (crossed !== undefined) {
        setCelebratingPercent(crossed);
        vibrateIfAvailable([20, 40, 20]);
      }
    }
    previous.current = savedAmount;
  }, [goal, savedAmount]);

  const stopCelebrating = useCallback(() => setCelebratingPercent(undefined), []);
  return { celebratingPercent, stopCelebrating };
}

const NO_CELLS: Cell[] = [];

export function ChallengePage() {
  const { challengeId = '' } = useParams();
  const { state, markCellAsSavedByTap, markCellsAsSaved, unmarkCell } = useChallenge(challengeId);
  const [cellToUndo, setCellToUndo] = useState<Cell | undefined>();
  const [isTodaySheetOpen, setIsTodaySheetOpen] = useState(false);
  const today = useMemo(() => todayCalendarDate(), []);
  const ready = state.status === 'ready' ? state : undefined;
  const { celebratingPercent, stopCelebrating } = useMilestoneCelebration(ready?.challenge.goal, ready?.progress.savedAmount);
  const todayBudget = useTodayBudget(ready?.cells ?? NO_CELLS);
  const openTodaySheet = useCallback(() => setIsTodaySheetOpen(true), []);
  const closeTodaySheet = useCallback(() => setIsTodaySheetOpen(false), []);

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

  const handleScratchCells = useCallback(
    (marks: CellMark[]) => {
      vibrateIfAvailable(15);
      void markCellsAsSaved(marks);
    },
    [markCellsAsSaved],
  );

  const closeUndo = useCallback(() => setCellToUndo(undefined), []);

  if (state.status === 'loading') return null;

  if (state.status === 'not-found') {
    return (
      <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-display text-3xl font-extrabold">Desafio não encontrado</p>
        <Link to="/" className="btn-primary px-6 py-3.5">
          Voltar para o início
        </Link>
      </main>
    );
  }

  const { challenge, cells, progress } = state;

  return (
    <div className="min-h-dvh">
      <ProgressHeader name={challenge.name} progress={progress} />
      <main
        className={`mx-auto flex max-w-3xl flex-col gap-4 px-4 pt-4 ${todayBudget.budget ? 'pb-28' : 'pb-[max(2.5rem,env(safe-area-inset-bottom))]'}`}
      >
        <ChallengeHero progress={progress} />
        <ActivityStrip cells={cells} today={today} />
        <PaceCard challenge={challenge} savedAmount={progress.savedAmount} today={today} />

        {!progress.isCompleted && <AffordableTodayButton activeAmount={todayBudget.budget?.amount} onClick={openTodaySheet} />}

        <div className="mt-2 flex items-end justify-between gap-2">
          <h2 className="font-display text-xl font-extrabold">Sua tabela</h2>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <Icon name="swipe" className="text-sm" /> Toque ou risque com o dedo
          </p>
        </div>
        <SavingsGrid
          cells={cells}
          type={challenge.type}
          onSelectCell={handleSelectCell}
          onScratchCells={handleScratchCells}
          affordableCellIds={todayBudget.affordableCellIds}
          spotlightCellId={todayBudget.spotlightCellId}
        />
        <p className="text-center text-xs text-muted">
          {progress.savedCount} de {progress.totalCount} valores riscados
        </p>
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

      {isTodaySheetOpen && (
        <AffordableTodaySheet
          open
          onClose={closeTodaySheet}
          todayBudget={todayBudget}
          smallestOpenValue={cells.reduce<number | undefined>(
            (smallest, cell) => (cell.savedAt === undefined && (smallest === undefined || cell.value < smallest) ? cell.value : smallest),
            undefined,
          )}
        />
      )}
      {!isTodaySheetOpen && <TodayBudgetBar todayBudget={todayBudget} onEdit={openTodaySheet} />}

      {celebratingPercent !== undefined && <MilestoneCelebration percent={celebratingPercent} onDone={stopCelebrating} />}
    </div>
  );
}

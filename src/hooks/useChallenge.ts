import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback } from 'react';
import { challengeRepository, type CellMark } from '../data/challengeRepository';
import { computeProgress, type ChallengeProgress } from '../domain/computeProgress';
import { generateHandDrawnStroke } from '../domain/generateHandDrawnStroke';
import type { Cell, Challenge } from '../domain/types';

export type ChallengeState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'ready'; challenge: Challenge; cells: Cell[]; progress: ChallengeProgress };

/** Desafio com suas células e progresso (ao vivo) e as ações de riscar/desfazer. */
export function useChallenge(challengeId: string) {
  const data = useLiveQuery(
    async () => {
      const [challenge, cells] = await Promise.all([
        challengeRepository.getChallenge(challengeId),
        challengeRepository.listCells(challengeId),
      ]);
      return { challenge, cells };
    },
    [challengeId],
  );

  const state: ChallengeState =
    data === undefined
      ? { status: 'loading' }
      : data.challenge === undefined
        ? { status: 'not-found' }
        : { status: 'ready', challenge: data.challenge, cells: data.cells, progress: computeProgress(data.challenge.goal, data.cells) };

  /** Marca por toque: usa um risco "feito à mão" gerado a partir do id da célula. */
  const markCellAsSavedByTap = useCallback(
    (cell: Cell) => challengeRepository.markCellAsSaved(cell.id, generateHandDrawnStroke(cell.id)),
    [],
  );

  const markCellsAsSaved = useCallback((marks: CellMark[]) => challengeRepository.markCellsAsSaved(marks), []);

  const unmarkCell = useCallback((cell: Cell) => challengeRepository.unmarkCell(cell.id), []);

  return { state, markCellAsSavedByTap, markCellsAsSaved, unmarkCell };
}

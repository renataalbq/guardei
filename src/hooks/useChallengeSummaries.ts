import { useLiveQuery } from 'dexie-react-hooks';
import { challengeRepository } from '../data/challengeRepository';
import { computeProgress, type ChallengeProgress } from '../domain/computeProgress';
import type { Cell, Challenge } from '../domain/types';

export interface ChallengeSummary {
  challenge: Challenge;
  progress: ChallengeProgress;
}

/** Desafios com o progresso de cada um, atualizados automaticamente quando o banco muda. `undefined` enquanto carrega. */
export function useChallengeSummaries(): ChallengeSummary[] | undefined {
  return useLiveQuery(async () => {
    const [challenges, cells] = await Promise.all([challengeRepository.listChallenges(), challengeRepository.listAllCells()]);
    const cellsByChallenge = new Map<string, Cell[]>();
    for (const cell of cells) {
      const list = cellsByChallenge.get(cell.challengeId) ?? [];
      list.push(cell);
      cellsByChallenge.set(cell.challengeId, list);
    }
    return challenges.map((challenge) => ({
      challenge,
      progress: computeProgress(challenge.goal, cellsByChallenge.get(challenge.id) ?? []),
    }));
  }, []);
}

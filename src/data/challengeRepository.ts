import { effectiveGoal, generateCellValues } from '../domain/generateCells';
import type { ChallengeDraft } from '../domain/previewChallenge';
import type { Cell, Challenge, StrokePoint, ThemeId } from '../domain/types';
import { db as defaultDb, type GuardeiDatabase } from './db';

export interface CellMark {
  cellId: string;
  stroke: StrokePoint[];
}

/**
 * Único ponto de acesso ao banco local. Quando houver sincronização na nuvem,
 * é aqui que ela entra, sem mudar os componentes.
 */
export function createChallengeRepository(db: GuardeiDatabase = defaultDb, now: () => Date = () => new Date()) {
  const timestamp = () => now().toISOString();

  return {
    async createChallenge(draft: ChallengeDraft, theme: ThemeId = 'caderno'): Promise<Challenge> {
      const createdAt = timestamp();
      const challenge: Challenge = {
        id: crypto.randomUUID(),
        name: draft.name.trim(),
        goal: effectiveGoal(draft),
        type: draft.type,
        step: draft.type === 'sequential' ? draft.step : 1,
        startDate: draft.startDate,
        endDate: draft.endDate,
        monthlyLimit: draft.monthlyLimit,
        theme,
        createdAt,
        updatedAt: createdAt,
      };
      const cells: Cell[] = generateCellValues(draft).map((value, position) => ({
        id: crypto.randomUUID(),
        challengeId: challenge.id,
        value,
        position,
        updatedAt: createdAt,
      }));
      await db.transaction('rw', db.challenges, db.cells, async () => {
        await db.challenges.add(challenge);
        await db.cells.bulkAdd(cells);
      });
      return challenge;
    },

    listChallenges(): Promise<Challenge[]> {
      return db.challenges.orderBy('createdAt').reverse().toArray();
    },

    getChallenge(challengeId: string): Promise<Challenge | undefined> {
      return db.challenges.get(challengeId);
    },

    listCells(challengeId: string): Promise<Cell[]> {
      return db.cells.where('[challengeId+position]').between([challengeId, -Infinity], [challengeId, Infinity]).toArray();
    },

    listAllCells(): Promise<Cell[]> {
      return db.cells.toArray();
    },

    async markCellsAsSaved(marks: readonly CellMark[]): Promise<void> {
      if (marks.length === 0) return;
      const savedAt = timestamp();
      await db.transaction('rw', db.cells, async () => {
        for (const { cellId, stroke } of marks) {
          await db.cells
            .where('id')
            .equals(cellId)
            .and((cell) => cell.savedAt === undefined)
            .modify({ savedAt, stroke, updatedAt: savedAt });
        }
      });
    },

    markCellAsSaved(cellId: string, stroke: StrokePoint[]): Promise<void> {
      return this.markCellsAsSaved([{ cellId, stroke }]);
    },

    async unmarkCell(cellId: string): Promise<void> {
      await db.cells.update(cellId, { savedAt: undefined, stroke: undefined, updatedAt: timestamp() });
    },

    async changeTheme(challengeId: string, theme: ThemeId): Promise<void> {
      await db.challenges.update(challengeId, { theme, updatedAt: timestamp() });
    },

    async deleteChallenge(challengeId: string): Promise<void> {
      await db.transaction('rw', db.challenges, db.cells, async () => {
        await db.cells.where('challengeId').equals(challengeId).delete();
        await db.challenges.delete(challengeId);
      });
    },
  };
}

export type ChallengeRepository = ReturnType<typeof createChallengeRepository>;

export const challengeRepository = createChallengeRepository();

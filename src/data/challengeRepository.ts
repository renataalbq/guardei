import { createId } from '../domain/createId';
import { effectiveGoal, generateCellValues } from '../domain/generateCells';
import type { ChallengeDraft } from '../domain/previewChallenge';
import { DEFAULT_THEME } from '../domain/themes';
import type { Cell, Challenge, StrokePoint, ThemeId } from '../domain/types';
import { db as defaultDb, type CellRecord, type ChallengeRecord, type GuardeiDatabase } from './db';
import { notifyLocalChange } from './localChanges';

export interface CellMark {
  cellId: string;
  stroke: StrokePoint[];
}

const isVisible = (challenge: ChallengeRecord) => challenge.deletedAt === undefined;

/**
 * Único ponto de acesso aos dados pelo app. Toda alteração fica marcada como pendente
 * e avisa a sincronização, que envia para a nuvem quando houver conexão.
 */
export function createChallengeRepository(
  db: GuardeiDatabase = defaultDb,
  now: () => Date = () => new Date(),
  onLocalChange: () => void = notifyLocalChange,
) {
  const timestamp = () => now().toISOString();

  return {
    async createChallenge(draft: ChallengeDraft, theme: ThemeId = DEFAULT_THEME): Promise<Challenge> {
      const createdAt = timestamp();
      const challenge: ChallengeRecord = {
        id: createId(),
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
        pendingSync: 1,
      };
      const cells: CellRecord[] = generateCellValues(draft).map((value, position) => ({
        id: createId(),
        challengeId: challenge.id,
        value,
        position,
        updatedAt: createdAt,
        pendingSync: 1,
      }));
      await db.transaction('rw', db.challenges, db.cells, async () => {
        await db.challenges.add(challenge);
        await db.cells.bulkAdd(cells);
      });
      onLocalChange();
      return challenge;
    },

    async listChallenges(): Promise<Challenge[]> {
      const challenges = await db.challenges.orderBy('createdAt').reverse().toArray();
      return challenges.filter(isVisible);
    },

    async getChallenge(challengeId: string): Promise<Challenge | undefined> {
      const challenge = await db.challenges.get(challengeId);
      return challenge && isVisible(challenge) ? challenge : undefined;
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
            .modify({ savedAt, stroke, updatedAt: savedAt, pendingSync: 1 });
        }
      });
      onLocalChange();
    },

    markCellAsSaved(cellId: string, stroke: StrokePoint[]): Promise<void> {
      return this.markCellsAsSaved([{ cellId, stroke }]);
    },

    async unmarkCell(cellId: string): Promise<void> {
      await db.cells.update(cellId, { savedAt: undefined, stroke: undefined, updatedAt: timestamp(), pendingSync: 1 });
      onLocalChange();
    },

    async changeTheme(challengeId: string, theme: ThemeId): Promise<void> {
      await db.challenges.update(challengeId, { theme, updatedAt: timestamp(), pendingSync: 1 });
      onLocalChange();
    },

    async deleteChallenge(challengeId: string): Promise<void> {
      const deletedAt = timestamp();
      await db.transaction('rw', db.challenges, db.cells, async () => {
        await db.cells.where('challengeId').equals(challengeId).delete();
        await db.challenges.update(challengeId, { deletedAt, updatedAt: deletedAt, pendingSync: 1 });
      });
      onLocalChange();
    },
  };
}

export type ChallengeRepository = ReturnType<typeof createChallengeRepository>;

export const challengeRepository = createChallengeRepository();

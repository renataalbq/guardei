import { createId } from '../../domain/createId';
import type { CellRecord, ChallengeRecord, GuardeiDatabase } from '../db';
import { cellFromRemote, challengeFromRemote, shouldApplyRemoteVersion, type RemoteCell, type RemoteChallenge } from './remoteRows';

const OWNER_KEY = 'ownerUserId';
const CURSOR_KEY = 'lastPulledServerTime';

/** Operações do banco local usadas só pela sincronização. */
export function createLocalSyncStore(db: GuardeiDatabase) {
  async function readMeta(key: string): Promise<string | undefined> {
    return (await db.syncMeta.get(key))?.value;
  }

  async function writeMeta(key: string, value: string | undefined): Promise<void> {
    if (value === undefined) await db.syncMeta.delete(key);
    else await db.syncMeta.put({ key, value });
  }

  return {
    /** Conta (id do Supabase) dona dos dados deste aparelho. */
    getOwnerUserId: () => readMeta(OWNER_KEY),
    setOwnerUserId: (userId: string) => writeMeta(OWNER_KEY, userId),

    getPullCursor: () => readMeta(CURSOR_KEY),
    setPullCursor: (serverTime: string) => writeMeta(CURSOR_KEY, serverTime),

    listPendingChallenges: () => db.challenges.where('pendingSync').equals(1).toArray(),
    listPendingCells: () => db.cells.where('pendingSync').equals(1).toArray(),

    /** Tira a marca de pendente só se a linha não mudou de novo enquanto era enviada. */
    async markChallengesSynced(sent: readonly ChallengeRecord[]): Promise<void> {
      await db.transaction('rw', db.challenges, async () => {
        for (const { id, updatedAt } of sent) {
          await db.challenges
            .where('id')
            .equals(id)
            .and((row) => row.updatedAt === updatedAt)
            .modify({ pendingSync: 0 });
        }
      });
    },

    async markCellsSynced(sent: readonly CellRecord[]): Promise<void> {
      await db.transaction('rw', db.cells, async () => {
        for (const { id, updatedAt } of sent) {
          await db.cells
            .where('id')
            .equals(id)
            .and((row) => row.updatedAt === updatedAt)
            .modify({ pendingSync: 0 });
        }
      });
    },

    /** Aplica o que veio da nuvem, respeitando "vence a alteração mais recente". */
    async applyRemoteChanges(challenges: readonly RemoteChallenge[], cells: readonly RemoteCell[]): Promise<void> {
      await db.transaction('rw', db.challenges, db.cells, async () => {
        for (const row of challenges) {
          const incoming = challengeFromRemote(row);
          const local = await db.challenges.get(incoming.id);
          if (!shouldApplyRemoteVersion(local, incoming.updatedAt)) continue;
          await db.challenges.put(incoming);
          if (incoming.deletedAt) await db.cells.where('challengeId').equals(incoming.id).delete();
        }
        for (const row of cells) {
          const incoming = cellFromRemote(row);
          const challenge = await db.challenges.get(incoming.challengeId);
          if (challenge?.deletedAt) continue;
          const local = await db.cells.get(incoming.id);
          if (!shouldApplyRemoteVersion(local, incoming.updatedAt)) continue;
          await db.cells.put(incoming);
        }
      });
    },

    /**
     * O aparelho entrou numa conta diferente da dona dos dados locais (ex.: usava anônimo e
     * entrou com o e-mail de outra conta). Os desafios locais são levados para a nova conta
     * com ids novos, para não colidir com as linhas da conta anterior na nuvem.
     */
    async moveLocalDataToNewOwner(): Promise<void> {
      await db.transaction('rw', db.challenges, db.cells, db.syncMeta, async () => {
        const challenges = await db.challenges.toArray();
        const cells = await db.cells.toArray();
        await db.challenges.clear();
        await db.cells.clear();
        await db.syncMeta.delete(CURSOR_KEY);

        for (const challenge of challenges) {
          if (challenge.deletedAt) continue;
          const newChallengeId = createId();
          await db.challenges.add({ ...challenge, id: newChallengeId, pendingSync: 1 });
          const ownCells = cells.filter((cell) => cell.challengeId === challenge.id);
          await db.cells.bulkAdd(
            ownCells.map((cell) => ({ ...cell, id: createId(), challengeId: newChallengeId, pendingSync: 1 as const })),
          );
        }
      });
    },

    /** Saiu da conta: apaga tudo deste aparelho (os dados continuam na nuvem). */
    async clearAll(): Promise<void> {
      await db.transaction('rw', db.challenges, db.cells, db.syncMeta, async () => {
        await db.challenges.clear();
        await db.cells.clear();
        await db.syncMeta.clear();
      });
    },
  };
}

export type LocalSyncStore = ReturnType<typeof createLocalSyncStore>;

import Dexie, { type EntityTable } from 'dexie';
import type { Cell, Challenge } from '../domain/types';

export type PendingSyncFlag = 0 | 1;

export interface ChallengeRecord extends Challenge {
  pendingSync: PendingSyncFlag;
  deletedAt?: string;
}

export interface CellRecord extends Cell {
  pendingSync: PendingSyncFlag;
}

export interface SyncMetaRecord {
  key: string;
  value: string;
}

export type GuardeiDatabase = Dexie & {
  challenges: EntityTable<ChallengeRecord, 'id'>;
  cells: EntityTable<CellRecord, 'id'>;
  syncMeta: EntityTable<SyncMetaRecord, 'key'>;
};

export function openGuardeiDatabase(name = 'guardei'): GuardeiDatabase {
  const database = new Dexie(name) as GuardeiDatabase;
  database.version(1).stores({
    challenges: 'id, createdAt, updatedAt',
    cells: 'id, challengeId, [challengeId+position], updatedAt',
  });
  database
    .version(2)
    .stores({
      challenges: 'id, createdAt, updatedAt, pendingSync',
      cells: 'id, challengeId, [challengeId+position], updatedAt, pendingSync',
      syncMeta: 'key',
    })
    .upgrade(async (transaction) => {
      // tudo que existia antes da nuvem precisa ser enviado
      await transaction.table('challenges').toCollection().modify({ pendingSync: 1 });
      await transaction.table('cells').toCollection().modify({ pendingSync: 1 });
    });
  return database;
}

export const db = openGuardeiDatabase();

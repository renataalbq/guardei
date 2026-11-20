import Dexie, { type EntityTable } from 'dexie';
import type { Cell, Challenge } from '../domain/types';

export type GuardeiDatabase = Dexie & {
  challenges: EntityTable<Challenge, 'id'>;
  cells: EntityTable<Cell, 'id'>;
};

export function openGuardeiDatabase(name = 'guardei'): GuardeiDatabase {
  const database = new Dexie(name) as GuardeiDatabase;
  database.version(1).stores({
    challenges: 'id, createdAt, updatedAt',
    cells: 'id, challengeId, [challengeId+position], updatedAt',
  });
  return database;
}

export const db = openGuardeiDatabase();

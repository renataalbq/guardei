import { challengeToRemote, cellToRemote, normalizeTimestamp, type RemoteCell, type RemoteChallenge } from './remoteRows';
import type { LocalSyncStore } from './localSyncStore';

/** O que a sincronização precisa da nuvem. Implementado pelo Supabase; nos testes, em memória. */
export interface RemoteStore {
  /** Garante uma sessão (cria uma conta anônima se ainda não houver) e devolve o id da conta. */
  ensureSession(): Promise<{ userId: string }>;
  upsertChallenges(rows: RemoteChallenge[]): Promise<void>;
  upsertCells(rows: RemoteCell[]): Promise<void>;
  /** Linhas alteradas no servidor depois de `serverTime` (ou todas, se undefined), em ordem de `server_updated_at`. */
  fetchChallengesChangedSince(serverTime: string | undefined): Promise<RemoteChallenge[]>;
  fetchCellsChangedSince(serverTime: string | undefined): Promise<RemoteCell[]>;
}

export const PUSH_BATCH_SIZE = 500;

/**
 * Margem ao buscar mudanças: uma gravação pode receber a hora do servidor um pouco antes
 * de ficar visível. Buscar com folga e aplicar de novo é inofensivo.
 */
export const PULL_OVERLAP_MS = 30_000;

function chunk<T>(items: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

function latestServerTime(rows: ReadonlyArray<{ server_updated_at?: string }>, current: string | undefined): string | undefined {
  let latest = current;
  for (const { server_updated_at } of rows) {
    if (!server_updated_at) continue;
    const normalized = normalizeTimestamp(server_updated_at);
    if (!latest || normalized > latest) latest = normalized;
  }
  return latest;
}

export function createSyncEngine(local: LocalSyncStore, remote: RemoteStore) {
  async function adoptCurrentAccount(userId: string) {
    const owner = await local.getOwnerUserId();
    if (owner === userId) return;
    if (owner !== undefined) await local.moveLocalDataToNewOwner();
    await local.setOwnerUserId(userId);
  }

  async function pushPendingChanges() {
    // desafios antes das células (a célula depende do desafio existir na nuvem)
    for (const batch of chunk(await local.listPendingChallenges(), PUSH_BATCH_SIZE)) {
      await remote.upsertChallenges(batch.map(challengeToRemote));
      await local.markChallengesSynced(batch);
    }
    for (const batch of chunk(await local.listPendingCells(), PUSH_BATCH_SIZE)) {
      await remote.upsertCells(batch.map(cellToRemote));
      await local.markCellsSynced(batch);
    }
  }

  async function pullRemoteChanges() {
    const cursor = await local.getPullCursor();
    const since = cursor ? new Date(Date.parse(cursor) - PULL_OVERLAP_MS).toISOString() : undefined;
    const challenges = await remote.fetchChallengesChangedSince(since);
    const cells = await remote.fetchCellsChangedSince(since);
    await local.applyRemoteChanges(challenges, cells);
    const nextCursor = latestServerTime(cells, latestServerTime(challenges, cursor));
    if (nextCursor && nextCursor !== cursor) await local.setPullCursor(nextCursor);
  }

  return {
    /** Envia o que mudou aqui e traz o que mudou em outros aparelhos. */
    async sync(): Promise<void> {
      const { userId } = await remote.ensureSession();
      await adoptCurrentAccount(userId);
      await pushPendingChanges();
      await pullRemoteChanges();
    },
  };
}

export type SyncEngine = ReturnType<typeof createSyncEngine>;

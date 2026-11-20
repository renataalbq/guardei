import type { SyncEngine } from './syncEngine';

export type SyncState = 'disabled' | 'idle' | 'syncing' | 'offline' | 'error';

export interface SyncStatus {
  state: SyncState;
  lastSyncedAt?: string;
  errorMessage?: string;
}

interface SchedulerOptions {
  debounceMs?: number;
  isOnline?: () => boolean;
  now?: () => Date;
}

/**
 * Decide quando sincronizar: agrupa alterações seguidas (debounce), nunca roda duas
 * sincronizações ao mesmo tempo e expõe o status para a interface.
 */
export function createSyncScheduler(engine: SyncEngine | null, options: SchedulerOptions = {}) {
  const { debounceMs = 1_500, isOnline = () => navigator.onLine, now = () => new Date() } = options;
  let status: SyncStatus = { state: engine ? 'idle' : 'disabled' };
  const listeners = new Set<() => void>();
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let running: Promise<void> | undefined;
  let runAgainAfterCurrent = false;

  function setStatus(next: SyncStatus) {
    status = next;
    for (const listener of listeners) listener();
  }

  async function runOnce(): Promise<void> {
    if (!engine) return;
    if (!isOnline()) {
      setStatus({ ...status, state: 'offline' });
      return;
    }
    setStatus({ ...status, state: 'syncing' });
    try {
      await engine.sync();
      setStatus({ state: 'idle', lastSyncedAt: now().toISOString() });
    } catch (error) {
      console.warn('Falha ao sincronizar', error);
      const message = error instanceof Error ? error.message : String(error);
      setStatus({ ...status, state: isOnline() ? 'error' : 'offline', errorMessage: message });
    }
  }

  function runNow(): Promise<void> {
    clearTimeout(debounceTimer);
    if (running) {
      runAgainAfterCurrent = true;
      return running;
    }
    running = (async () => {
      do {
        runAgainAfterCurrent = false;
        await runOnce();
      } while (runAgainAfterCurrent);
    })().finally(() => {
      running = undefined;
    });
    return running;
  }

  return {
    /** Pede uma sincronização em breve (várias chamadas seguidas viram uma só). */
    request(): void {
      if (!engine) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => void runNow(), debounceMs);
    },
    runNow,
    getStatus: () => status,
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export type SyncScheduler = ReturnType<typeof createSyncScheduler>;

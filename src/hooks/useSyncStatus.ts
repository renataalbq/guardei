import { useSyncExternalStore } from 'react';
import { syncScheduler } from '../data/sync/cloudSync';
import type { SyncStatus } from '../data/sync/syncScheduler';

export type { SyncStatus };

/** Status da sincronização com a nuvem (sincronizando, offline, erro…). */
export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(syncScheduler.subscribe, syncScheduler.getStatus);
}

export function retrySync(): void {
  void syncScheduler.runNow();
}

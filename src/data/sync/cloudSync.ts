import { db } from '../db';
import { subscribeToLocalChanges } from '../localChanges';
import { supabase } from '../supabaseClient';
import { createAccountService } from './accountService';
import { createLocalSyncStore } from './localSyncStore';
import { createSupabaseRemoteStore } from './supabaseRemoteStore';
import { createSyncEngine } from './syncEngine';
import { createSyncScheduler } from './syncScheduler';

const localSyncStore = createLocalSyncStore(db);
const syncEngine = supabase ? createSyncEngine(localSyncStore, createSupabaseRemoteStore(supabase)) : null;

export const syncScheduler = createSyncScheduler(syncEngine);

/** `null` quando a nuvem não está configurada no .env. */
export const accountService = supabase ? createAccountService(supabase, localSyncStore, syncScheduler) : null;

const PERIODIC_SYNC_MS = 2 * 60_000;

/** Sincroniza ao abrir, ao voltar para o app, ao reconectar, depois de cada alteração e a cada 2 min com o app aberto. */
export function startBackgroundSync(): void {
  if (!supabase) return;

  subscribeToLocalChanges(() => syncScheduler.request());
  window.addEventListener('online', () => void syncScheduler.runNow());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void syncScheduler.runNow();
  });
  setInterval(() => {
    if (document.visibilityState === 'visible') syncScheduler.request();
  }, PERIODIC_SYNC_MS);
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'USER_UPDATED') syncScheduler.request();
  });

  void syncScheduler.runNow();
}

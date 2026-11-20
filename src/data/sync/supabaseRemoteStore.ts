import type { SupabaseClient } from '@supabase/supabase-js';
import type { RemoteCell, RemoteChallenge } from './remoteRows';
import type { RemoteStore } from './syncEngine';

const PAGE_SIZE = 1_000;

const CHALLENGE_COLUMNS =
  'id,name,goal,type,step,start_date,end_date,monthly_limit,theme,created_at,updated_at,deleted_at,server_updated_at';
const CELL_COLUMNS = 'id,challenge_id,value,position,saved_at,stroke,updated_at,server_updated_at';

export function createSupabaseRemoteStore(client: SupabaseClient): RemoteStore {
  async function fetchChangedSince<T>(table: string, columns: string, since: string | undefined): Promise<T[]> {
    const rows: T[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      let query = client
        .from(table)
        .select(columns)
        .order('server_updated_at')
        .order('id')
        .range(from, from + PAGE_SIZE - 1);
      if (since) query = query.gt('server_updated_at', since);
      const { data, error } = await query;
      if (error) throw error;
      rows.push(...(data as T[]));
      if (data.length < PAGE_SIZE) return rows;
    }
  }

  return {
    async ensureSession() {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (data.session) return { userId: data.session.user.id };
      const signIn = await client.auth.signInAnonymously();
      if (signIn.error || !signIn.data.user) throw signIn.error ?? new Error('Não foi possível criar a conta anônima.');
      return { userId: signIn.data.user.id };
    },

    async upsertChallenges(rows: RemoteChallenge[]) {
      const { error } = await client.from('challenges').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
    },

    async upsertCells(rows: RemoteCell[]) {
      const { error } = await client.from('cells').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
    },

    fetchChallengesChangedSince: (since) => fetchChangedSince<RemoteChallenge>('challenges', CHALLENGE_COLUMNS, since),
    fetchCellsChangedSince: (since) => fetchChangedSince<RemoteCell>('cells', CELL_COLUMNS, since),
  };
}

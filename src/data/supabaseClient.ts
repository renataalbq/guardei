import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/** `null` quando o .env não está preenchido: o app funciona só no aparelho. */
export const supabase: SupabaseClient | null =
  url && publishableKey
    ? createClient(url, publishableKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          // login por código digitado no app (link mágico abriria o Safari fora do app instalado)
          detectSessionInUrl: false,
          storageKey: 'guardei-auth',
        },
      })
    : null;

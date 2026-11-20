import type { AuthError, Session, SupabaseClient } from '@supabase/supabase-js';
import type { LocalSyncStore } from './localSyncStore';
import type { SyncScheduler } from './syncScheduler';

export interface Account {
  userId: string;
  email?: string;
  /** Conta criada automaticamente, ainda sem e-mail: só existe neste aparelho até ser protegida. */
  isAnonymous: boolean;
}

export class AccountError extends Error {}

function accountFromSession(session: Session | null): Account | null {
  if (!session) return null;
  return {
    userId: session.user.id,
    email: session.user.email || undefined,
    isAnonymous: session.user.is_anonymous === true,
  };
}

/** Traduz os erros mais comuns do Supabase Auth para mensagens da interface. */
export function describeAuthError(error: AuthError | Error): string {
  const code = 'code' in error ? error.code : undefined;
  const message = error.message.toLowerCase();
  if (code === 'over_email_send_rate_limit' || message.includes('rate limit')) {
    return 'Muitos e-mails enviados em pouco tempo. Espere alguns minutos e tente de novo.';
  }
  if (code === 'otp_expired' || message.includes('expired') || message.includes('invalid')) {
    return 'Código inválido ou expirado. Confira o último e-mail ou peça um novo código.';
  }
  if (code === 'email_exists' || message.includes('already been registered')) {
    return 'Esse e-mail já tem uma conta. Use "Já tenho conta" para entrar com ele.';
  }
  if (code === 'otp_disabled' || message.includes('signups not allowed')) {
    return 'Não encontramos uma conta com esse e-mail.';
  }
  if (code === 'email_address_invalid' || message.includes('email address') || message.includes('validate email')) {
    return 'Confira o e-mail digitado.';
  }
  if (message.includes('fetch') || message.includes('network')) {
    return 'Sem conexão. Verifique a internet e tente de novo.';
  }
  return 'Algo deu errado. Tente de novo em instantes.';
}

async function unwrap<T extends { error: AuthError | null }>(promise: Promise<T>): Promise<T> {
  const result = await promise;
  if (result.error) throw new AccountError(describeAuthError(result.error));
  return result;
}

export function createAccountService(client: SupabaseClient, localStore: LocalSyncStore, scheduler: SyncScheduler) {
  return {
    async getAccount(): Promise<Account | null> {
      const { data } = await client.auth.getSession();
      return accountFromSession(data.session);
    },

    subscribe(listener: (account: Account | null) => void): () => void {
      const { data } = client.auth.onAuthStateChange((_event, session) => listener(accountFromSession(session)));
      return () => data.subscription.unsubscribe();
    },

    /** Proteger a conta anônima: envia um código para o e-mail. */
    async requestProtectAccountCode(email: string): Promise<void> {
      await unwrap(client.auth.updateUser({ email }));
    },

    async confirmProtectAccountCode(email: string, code: string): Promise<void> {
      await unwrap(client.auth.verifyOtp({ email, token: code, type: 'email_change' }));
      void scheduler.runNow();
    },

    /** Entrar numa conta que já existe (ex.: celular novo): envia um código para o e-mail. */
    async requestSignInCode(email: string): Promise<void> {
      await unwrap(client.auth.signInWithOtp({ email, options: { shouldCreateUser: false } }));
    },

    async confirmSignInCode(email: string, code: string): Promise<void> {
      await unwrap(client.auth.verifyOtp({ email, token: code, type: 'email' }));
      await scheduler.runNow();
    },

    /** Sai da conta neste aparelho. Só deixa sair se tudo já foi enviado para a nuvem. */
    async signOut(): Promise<void> {
      await scheduler.runNow();
      const pending = (await localStore.listPendingChallenges()).length + (await localStore.listPendingCells()).length;
      if (pending > 0) {
        throw new AccountError('Ainda há valores não enviados para a nuvem. Conecte-se à internet e tente de novo.');
      }
      await unwrap(client.auth.signOut({ scope: 'local' }));
      await localStore.clearAll();
    },
  };
}

export type AccountService = ReturnType<typeof createAccountService>;

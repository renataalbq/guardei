import { useEffect, useState } from 'react';
import { accountService } from '../data/sync/cloudSync';
import type { Account } from '../data/sync/accountService';

export type AccountState = { status: 'disabled' } | { status: 'loading' } | { status: 'ready'; account: Account | null };

/** Conta atual (anônima ou com e-mail), atualizada quando a sessão muda. */
export function useAccount(): AccountState {
  const [state, setState] = useState<AccountState>(accountService ? { status: 'loading' } : { status: 'disabled' });

  useEffect(() => {
    if (!accountService) return;
    let active = true;
    void accountService.getAccount().then((account) => active && setState({ status: 'ready', account }));
    const unsubscribe = accountService.subscribe((account) => setState({ status: 'ready', account }));
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return state;
}

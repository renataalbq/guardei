import type { SyncStatus } from '../../data/sync/syncScheduler';
import { retrySync } from '../../hooks/useSyncStatus';
import { Icon } from '../ui/Icon';

const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

export function describeSyncStatus(status: SyncStatus): string {
  switch (status.state) {
    case 'disabled':
      return 'Nuvem não configurada: os dados ficam só neste aparelho.';
    case 'syncing':
      return 'Sincronizando…';
    case 'offline':
      return 'Sem internet. Está tudo salvo aqui e vai para a nuvem quando a conexão voltar.';
    case 'error':
      return 'Não foi possível sincronizar agora. Seus dados continuam salvos neste aparelho.';
    case 'idle':
      return status.lastSyncedAt
        ? `Salvo na nuvem às ${timeFormatter.format(new Date(status.lastSyncedAt))}.`
        : 'Conectando com a nuvem…';
  }
}

export function SyncStatusLine({ status }: { status: SyncStatus }) {
  const icon = status.state === 'offline' || status.state === 'disabled' ? 'cloudOff' : 'cloud';
  return (
    <div className="flex items-start gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-fg">
      <Icon name={icon} className={`mt-0.5 shrink-0 text-lg ${status.state === 'error' ? 'text-red-700' : 'text-ink'}`} />
      <div className="flex-1">
        <p>{describeSyncStatus(status)}</p>
        {status.state === 'error' && (
          <button type="button" onClick={retrySync} className="mt-1 font-semibold text-ink underline underline-offset-2">
            Tentar de novo
          </button>
        )}
      </div>
    </div>
  );
}

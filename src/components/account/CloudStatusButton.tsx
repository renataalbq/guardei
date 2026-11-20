import { Link } from 'react-router';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import { Icon } from '../ui/Icon';
import { describeSyncStatus } from './SyncStatusLine';

const DOT_CLASS = {
  disabled: 'bg-muted',
  idle: 'bg-emerald-500',
  syncing: 'bg-amber-400 animate-pulse',
  offline: 'bg-muted',
  error: 'bg-red-600',
} as const;

/** Ícone de nuvem no topo da tela inicial: mostra o status e leva para a conta. */
export function CloudStatusButton() {
  const status = useSyncStatus();
  return (
    <Link
      to="/conta"
      aria-label={`Conta e nuvem. ${describeSyncStatus(status)}`}
      className="relative rounded-full p-2.5 text-2xl text-ink active:bg-ink-soft"
    >
      <Icon name={status.state === 'offline' || status.state === 'disabled' ? 'cloudOff' : 'cloud'} />
      <span className={`absolute right-2 bottom-2.5 h-2.5 w-2.5 rounded-full ring-2 ring-paper ${DOT_CLASS[status.state]}`} />
    </Link>
  );
}

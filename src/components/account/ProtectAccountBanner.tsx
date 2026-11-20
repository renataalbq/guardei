import { Link } from 'react-router';
import { useAccount } from '../../hooks/useAccount';
import { Icon } from '../ui/Icon';

/** Lembra quem ainda usa a conta anônima de proteger o progresso com um e-mail. */
export function ProtectAccountBanner() {
  const accountState = useAccount();
  if (accountState.status !== 'ready' || !accountState.account?.isAnonymous) return null;

  return (
    <Link to="/conta" className="card flex items-center gap-3 p-4 text-sm active:scale-[0.99]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-ink-soft text-xl text-ink">
        <Icon name="cloud" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-base font-bold">Proteja seu progresso</span>
        <span className="block text-muted">Adicione um e-mail para não perder nada se trocar de celular.</span>
      </span>
      <Icon name="back" className="shrink-0 rotate-180 text-lg text-muted" />
    </Link>
  );
}

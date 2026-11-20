import { Link } from 'react-router';
import { useAccount } from '../../hooks/useAccount';

/** Lembra quem ainda usa a conta anônima de proteger o progresso com um e-mail. */
export function ProtectAccountBanner() {
  const accountState = useAccount();
  if (accountState.status !== 'ready' || !accountState.account?.isAnonymous) return null;

  return (
    <Link to="/conta" className="block rounded-2xl border border-ink/30 bg-ink-soft p-4 text-sm text-fg active:scale-[0.99]">
      <p className="font-semibold text-ink">Proteja seu progresso</p>
      <p className="mt-1">
        Seus valores já estão na nuvem, mas sem um e-mail você não consegue recuperá-los se trocar de celular.{' '}
        <span className="font-semibold text-ink underline underline-offset-2">Adicionar e-mail</span>
      </p>
    </Link>
  );
}

import { useLiveQuery } from 'dexie-react-hooks';
import { Link, useParams } from 'react-router';
import { Icon } from '../components/ui/Icon';
import { challengeRepository } from '../data/challengeRepository';

/** Provisório: a grade e o progresso entram na próxima etapa. */
export function ChallengePage() {
  const { challengeId = '' } = useParams();
  const challenge = useLiveQuery(() => challengeRepository.getChallenge(challengeId), [challengeId], null);

  return (
    <main className="mx-auto min-h-dvh max-w-xl px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center gap-2 py-2">
        <Link to="/" aria-label="Voltar" className="-ml-2 rounded-full p-2 text-2xl text-ink active:bg-ink-soft">
          <Icon name="back" />
        </Link>
        <h1 className="truncate font-hand text-4xl font-bold text-ink">{challenge?.name ?? ''}</h1>
      </header>
      {challenge === undefined ? (
        <p className="mt-8 text-center text-muted">Desafio não encontrado.</p>
      ) : (
        challenge && <p className="paper-grid mt-6 rounded-2xl border border-border p-6 text-center text-muted">A grade chega na próxima etapa.</p>
      )}
    </main>
  );
}

import { useMemo } from 'react';
import { Link } from 'react-router';
import { CloudStatusButton } from '../components/account/CloudStatusButton';
import { ProtectAccountBanner } from '../components/account/ProtectAccountBanner';
import { ChallengeListItem } from '../components/home/ChallengeListItem';
import { EmptyState } from '../components/home/EmptyState';
import { Icon } from '../components/ui/Icon';
import { IosInstallHint } from '../components/ui/IosInstallHint';
import { Logo } from '../components/ui/Logo';
import { todayCalendarDate } from '../domain/calendarDate';
import { formatCurrency } from '../domain/formatCurrency';
import { useChallengeSummaries } from '../hooks/useChallengeSummaries';

export function HomePage() {
  const summaries = useChallengeSummaries();
  const today = useMemo(() => todayCalendarDate(), []);
  const totalSaved = summaries?.reduce((sum, summary) => sum + summary.progress.savedAmount, 0) ?? 0;
  const hasChallenges = summaries !== undefined && summaries.length > 0;

  return (
    <main className="mx-auto min-h-dvh max-w-xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-28">
      <header className="flex items-center justify-between py-3">
        <Logo />
        <CloudStatusButton />
      </header>

      <div className="mt-3 flex flex-col gap-4">
        <IosInstallHint />
        {summaries === undefined ? null : !hasChallenges ? (
          <EmptyState />
        ) : (
          <>
            <div>
              <p className="text-sm font-semibold text-muted">
                {summaries.length > 1 ? 'Guardado em todos os desafios' : 'Você já guardou'}
              </p>
              <p className="font-display text-[2.75rem] leading-none font-extrabold text-fg font-numeric">{formatCurrency(totalSaved)}</p>
            </div>
            <ProtectAccountBanner />
            <ul className="flex flex-col gap-3">
              {summaries.map((summary) => (
                <li key={summary.challenge.id}>
                  <ChallengeListItem summary={summary} today={today} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {hasChallenges && (
        <Link to="/novo" className="btn-primary fixed right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] rounded-full px-5 py-4">
          <Icon name="plus" className="text-xl" /> Novo desafio
        </Link>
      )}
    </main>
  );
}

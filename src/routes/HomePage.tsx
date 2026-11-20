import { useMemo } from "react";
import { Link } from "react-router";
import { CloudStatusButton } from "../components/account/CloudStatusButton";
import { ProtectAccountBanner } from "../components/account/ProtectAccountBanner";
import { ChallengeListItem } from "../components/home/ChallengeListItem";
import { Icon } from "../components/ui/Icon";
import { IosInstallHint } from "../components/ui/IosInstallHint";
import { todayCalendarDate } from "../domain/calendarDate";
import { useChallengeSummaries } from "../hooks/useChallengeSummaries";

function EmptyState() {
  return (
    <section className="paper-grid flex flex-col items-center gap-4 rounded-3xl border border-border px-6 py-10 text-center">
      <p className="font-hand text-4xl leading-tight font-bold text-ink">
        Risque um número
        <br />
        cada vez que guardar
      </p>
      <p className="max-w-xs text-sm text-fg">
        Escolha uma meta e o Guardei monta a sua tabela. Guardou R$ 37 hoje?
        Risca o 37. Quando todos estiverem riscados, a meta está batida.
      </p>
      <Link
        to="/novo"
        className="rounded-xl bg-ink px-6 py-3.5 font-semibold text-white active:scale-[0.98]"
      >
        Criar meu desafio
      </Link>
    </section>
  );
}

export function HomePage() {
  const summaries = useChallengeSummaries();
  const today = useMemo(() => todayCalendarDate(), []);

  return (
    <main className="mx-auto min-h-dvh max-w-xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-28">
      <header className="flex items-center justify-between py-2">
        <h1 className="font-hand text-5xl font-bold text-ink">Guardei</h1>
        <CloudStatusButton />
      </header>

      <div className="mt-4 flex flex-col gap-4">
        <IosInstallHint />
        {summaries === undefined ? null : summaries.length === 0 ? (
          <EmptyState />
        ) : (
          <>
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

      {summaries && summaries.length > 0 && (
        <Link
          to="/novo"
          className="fixed right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] flex items-center gap-2 rounded-full bg-ink px-5 py-3.5 font-semibold text-white shadow-lg active:scale-95"
        >
          <Icon name="plus" className="text-xl" /> Novo desafio
        </Link>
      )}
    </main>
  );
}

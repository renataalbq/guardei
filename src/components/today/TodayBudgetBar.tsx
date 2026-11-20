import { formatCurrency } from '../../domain/formatCurrency';
import type { TodayBudgetController } from '../../hooks/useTodayBudget';
import { Icon } from '../ui/Icon';

/** Barra flutuante enquanto há um valor de hoje: quanto sobra, quantos cabem e atalhos. */
export function TodayBudgetBar({ todayBudget, onEdit }: { todayBudget: TodayBudgetController; onEdit: () => void }) {
  const { budget, status } = todayBudget;
  if (!budget || !status) return null;

  const done = status.remaining === 0;
  const fitting = status.affordable.length;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-xl animate-[sheet-up_220ms_ease-out] items-center gap-2 rounded-3xl bg-inverse p-2 pl-4 text-on-inverse shadow-2xl">
        <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
          {done ? (
            <span className="block font-display font-bold">Você guardou tudo o que planejou hoje!</span>
          ) : (
            <>
              <span className="block truncate text-xs text-on-inverse/70">
                {status.spent > 0 ? `Sobram de ${formatCurrency(budget.amount)}` : 'Para hoje'} ·{' '}
                {fitting === 0 ? 'nada cabe' : `${fitting} ${fitting === 1 ? 'cabe' : 'cabem'}`}
              </span>
              <span className="block font-display text-xl leading-tight font-extrabold font-numeric">
                {formatCurrency(status.remaining)}
              </span>
            </>
          )}
        </button>
        {!done && fitting > 0 && (
          <>
            <button
              type="button"
              onClick={() => todayBudget.pickRandom()}
              className="rounded-2xl bg-on-inverse/15 px-3 py-2.5 text-sm font-bold active:scale-95"
            >
              Sortear
            </button>
            <button
              type="button"
              onClick={() => todayBudget.pickLargest()}
              className="rounded-2xl bg-on-inverse px-3 py-2.5 text-sm font-bold text-inverse active:scale-95"
            >
              Maior
            </button>
          </>
        )}
        <button
          type="button"
          onClick={todayBudget.clear}
          aria-label="Parar de destacar"
          className="rounded-full p-2.5 text-lg text-on-inverse/70"
        >
          <Icon name="close" />
        </button>
      </div>
    </div>
  );
}

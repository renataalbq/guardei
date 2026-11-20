import { formatCalendarDate, formatMonthYear } from '../../domain/calendarDate';
import { formatCurrency } from '../../domain/formatCurrency';
import type { MonthlyLimitPlan } from '../../domain/monthlyLimitPlan';
import type { CalendarDate } from '../../domain/types';
import { Icon } from '../ui/Icon';

interface MonthlyLimitNoticeProps {
  plan: MonthlyLimitPlan;
  goal: number;
  monthlyLimit: number;
  endDate: CalendarDate | undefined;
  onUseSuggestedEndDate: (date: CalendarDate) => void;
}

/** Compara a meta com o máximo por mês e sugere aumentar o prazo quando não cabe. */
export function MonthlyLimitNotice({ plan, goal, monthlyLimit, endDate, onUseSuggestedEndDate }: MonthlyLimitNoticeProps) {
  const suggestedLabel = formatMonthYear(plan.estimatedEndDate);

  if (!endDate) {
    return (
      <div className="rounded-xl border border-border bg-surface p-3 text-sm text-fg">
        <p>
          Guardando {formatCurrency(monthlyLimit)} por mês, você chega lá em <strong>{suggestedLabel}</strong>.
        </p>
        <button
          type="button"
          onClick={() => onUseSuggestedEndDate(plan.estimatedEndDate)}
          className="mt-2 font-semibold text-ink underline underline-offset-2"
        >
          Usar {suggestedLabel} como prazo
        </button>
      </div>
    );
  }

  if (plan.fitsDeadline) {
    return (
      <p className="flex items-start gap-2 rounded-xl bg-ink-soft p-3 text-sm text-fg">
        <Icon name="check" className="mt-0.5 shrink-0 text-ink" />
        <span>
          Cabe no seu limite: são ~{formatCurrency(plan.requiredPerMonth ?? 0)} por mês até {formatCalendarDate(endDate)}.
        </span>
      </p>
    );
  }

  return (
    <div role="alert" className="rounded-xl bg-warning-bg p-3 text-sm text-warning-fg">
      <p className="flex items-start gap-2">
        <Icon name="alert" className="mt-0.5 shrink-0" />
        <span>
          Para juntar {formatCurrency(goal)} até {formatCalendarDate(endDate)} você precisaria guardar ~
          {formatCurrency(plan.requiredPerMonth ?? 0)} por mês, mais que os {formatCurrency(monthlyLimit)} que cabem no seu bolso. Para
          caber, o prazo teria que aumentar: guardando {formatCurrency(monthlyLimit)} por mês, você chega lá em{' '}
          <strong>{suggestedLabel}</strong>.
        </span>
      </p>
      <button
        type="button"
        onClick={() => onUseSuggestedEndDate(plan.estimatedEndDate)}
        className="mt-3 w-full rounded-lg bg-warning-fg px-3 py-2.5 font-semibold text-white active:scale-[0.98]"
      >
        Aumentar prazo para {suggestedLabel}
      </button>
    </div>
  );
}

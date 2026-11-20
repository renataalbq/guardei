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
      <div className="card p-4 text-sm text-fg">
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
      <p className="flex items-start gap-2 rounded-2xl bg-money-soft p-4 text-sm font-medium text-money-fg">
        <Icon name="check" className="mt-0.5 shrink-0 text-money" />
        <span>
          Cabe no seu limite: são ~{formatCurrency(plan.requiredPerMonth ?? 0)} por mês até {formatCalendarDate(endDate)}.
        </span>
      </p>
    );
  }

  return (
    <div role="alert" className="rounded-2xl bg-warning-bg p-4 text-sm text-warning-fg">
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
        className="mt-3 w-full rounded-2xl bg-warning-fg px-3 py-3 font-bold text-white active:scale-[0.97]"
      >
        Aumentar prazo para {suggestedLabel}
      </button>
    </div>
  );
}

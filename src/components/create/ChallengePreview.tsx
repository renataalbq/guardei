import { formatCalendarDate } from '../../domain/calendarDate';
import { formatCurrency } from '../../domain/formatCurrency';
import type { ChallengePreview as ChallengePreviewData } from '../../domain/previewChallenge';
import type { CalendarDate, ChallengeType } from '../../domain/types';

interface ChallengePreviewProps {
  preview: ChallengePreviewData;
  type: ChallengeType;
  step: number;
  endDate: CalendarDate | undefined;
}

export function ChallengePreview({ preview, type, step, endDate }: ChallengePreviewProps) {
  const cellsLabel = type === 'weeks52' ? 'semanas' : 'números para riscar';

  return (
    <section aria-label="Pré-visualização do desafio" className="paper-grid rounded-2xl border border-border p-4">
      <h2 className="font-hand text-2xl font-bold text-ink">Como vai ficar</h2>
      <dl className="mt-2 grid grid-cols-2 gap-3">
        <div>
          <dt className="text-xs text-muted">Células</dt>
          <dd>
            <span className="block font-hand text-3xl font-bold text-fg">{preview.cellCount}</span>
            <span className="block text-xs text-muted">{cellsLabel}</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Maior valor</dt>
          <dd className="font-hand text-3xl font-bold text-fg">{formatCurrency(preview.largestValue)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-muted">Por dia, em média</dt>
          <dd className="text-sm text-fg">
            {preview.dailyAverageNeeded !== undefined && endDate ? (
              <>
                <span className="mr-1 font-hand text-3xl font-bold">{formatCurrency(preview.dailyAverageNeeded)}</span> para chegar até{' '}
                {formatCalendarDate(endDate)} ({preview.periodDays} dias)
              </>
            ) : (
              'Sem prazo: você guarda no seu ritmo.'
            )}
          </dd>
        </div>
      </dl>
      {preview.goalWasRounded && (
        <p className="mt-3 text-sm text-warning-fg">
          A meta foi ajustada para {formatCurrency(preview.effectiveGoal)} para os valores ficarem de {step} em {step}.
        </p>
      )}
    </section>
  );
}

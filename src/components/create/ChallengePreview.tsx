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

function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-2xl bg-white/12 p-3">
      <p className="text-xs font-semibold text-white/75">{label}</p>
      <p className="font-display text-2xl leading-tight font-extrabold font-numeric">{value}</p>
      {detail && <p className="text-xs text-white/75">{detail}</p>}
    </div>
  );
}

export function ChallengePreview({ preview, type, step, endDate }: ChallengePreviewProps) {
  const hasDeadline = preview.dailyAverageNeeded !== undefined && endDate !== undefined;

  return (
    <section aria-label="Pré-visualização do desafio" className="hero-gradient rounded-[2rem] p-5 shadow-[var(--shadow-brand)]">
      <p className="text-sm font-semibold text-white/80">Como vai ficar</p>
      <p className="font-display text-3xl font-extrabold font-numeric">{formatCurrency(preview.effectiveGoal)}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat label={type === 'weeks52' ? 'Semanas' : 'Números para riscar'} value={String(preview.cellCount)} />
        <Stat label="Maior valor" value={formatCurrency(preview.largestValue)} />
        {hasDeadline && preview.periodDays !== undefined && (
          <>
            <Stat label="Por dia" value={formatCurrency(preview.dailyAverageNeeded!)} detail={`${preview.periodDays} dias`} />
            <Stat
              label="Por semana"
              value={formatCurrency(Math.ceil(preview.effectiveGoal / Math.max(1, preview.periodDays / 7)))}
              detail={`até ${formatCalendarDate(endDate)}`}
            />
          </>
        )}
      </div>
      {!hasDeadline && <p className="mt-3 text-sm text-white/85">Sem prazo: você guarda no seu ritmo.</p>}
      {preview.goalWasRounded && (
        <p className="mt-3 rounded-xl bg-white/15 px-3 py-2 text-sm">
          A meta foi ajustada para {formatCurrency(preview.effectiveGoal)} para os valores ficarem de {step} em {step}.
        </p>
      )}
    </section>
  );
}

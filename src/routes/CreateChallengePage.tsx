import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { ChallengePreview } from '../components/create/ChallengePreview';
import { ChallengeTypePicker } from '../components/create/ChallengeTypePicker';
import { CurrencyInput } from '../components/create/CurrencyInput';
import { DeadlineFields } from '../components/create/DeadlineFields';
import { MonthlyLimitNotice } from '../components/create/MonthlyLimitNotice';
import { StepPicker } from '../components/create/StepPicker';
import { ChoiceChip } from '../components/ui/ChoiceChip';
import { FormField, textInputClassName } from '../components/ui/FormField';
import { Icon } from '../components/ui/Icon';
import { challengeRepository } from '../data/challengeRepository';
import { todayCalendarDate } from '../domain/calendarDate';
import { evaluateChallengeDraft, type ChallengeDraft } from '../domain/previewChallenge';
import { suggestChallengeName } from '../domain/suggestChallengeName';
import type { CalendarDate, ChallengeType, SequentialStep } from '../domain/types';

const GOAL_SHORTCUTS = [5_000, 10_000, 20_000, 30_000, 50_000];

export function CreateChallengePage() {
  const navigate = useNavigate();
  const today = useMemo(() => todayCalendarDate(), []);

  const [name, setName] = useState('');
  const [goal, setGoal] = useState<number | undefined>();
  const [type, setType] = useState<ChallengeType>('sequential');
  const [step, setStep] = useState<SequentialStep>(1);
  const [startDate, setStartDate] = useState<CalendarDate>(today);
  const [endDate, setEndDate] = useState<CalendarDate | undefined>();
  const [monthlyLimit, setMonthlyLimit] = useState<number | undefined>();
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const draft: ChallengeDraft = { name, goal: goal ?? 0, type, step, startDate, endDate, monthlyLimit };
  const evaluation = evaluateChallengeDraft(draft);
  const showProblems = submitAttempted || goal !== undefined;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitAttempted(true);
    if (!evaluation.isValid || evaluation.nameProblem || isSaving) return;
    setIsSaving(true);
    try {
      const challenge = await challengeRepository.createChallenge(draft);
      navigate(`/desafio/${challenge.id}`, { replace: true });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-32">
      <header className="flex items-center gap-2 py-2">
        <Link to="/" aria-label="Voltar" className="-ml-2 rounded-full p-2 text-2xl text-ink active:bg-ink-soft">
          <Icon name="back" />
        </Link>
        <h1 className="font-hand text-4xl font-bold text-ink">Novo desafio</h1>
      </header>

      <form id="create-challenge" onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-6">
        <FormField label="Quanto você quer juntar?" htmlFor="goal">
          <CurrencyInput id="goal" value={goal} onChange={setGoal} placeholder="20.000" />
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {GOAL_SHORTCUTS.map((shortcut) => (
              <ChoiceChip key={shortcut} selected={goal === shortcut} onSelect={() => setGoal(shortcut)}>
                {shortcut / 1_000} mil
              </ChoiceChip>
            ))}
          </div>
        </FormField>

        <FormField label="Tipo de desafio">
          <ChallengeTypePicker value={type} onChange={setType} />
        </FormField>

        {type === 'sequential' && (
          <FormField label="Valores das células" hint="Valores maiores = menos células para riscar.">
            <StepPicker value={step} onChange={setStep} />
          </FormField>
        )}

        <DeadlineFields
          today={today}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        <FormField
          label="Quanto você consegue guardar por mês, no máximo? (opcional)"
          htmlFor="monthly-limit"
          hint="Assim o app avisa se o prazo está apertado."
        >
          <CurrencyInput id="monthly-limit" value={monthlyLimit} onChange={setMonthlyLimit} placeholder="1.400" />
        </FormField>

        {evaluation.isValid && monthlyLimit && evaluation.preview.monthlyLimitPlan && (
          <MonthlyLimitNotice
            plan={evaluation.preview.monthlyLimitPlan}
            goal={evaluation.preview.effectiveGoal}
            monthlyLimit={monthlyLimit}
            endDate={endDate}
            onUseSuggestedEndDate={setEndDate}
          />
        )}

        <FormField label="Nome do desafio" htmlFor="name" error={submitAttempted ? evaluation.nameProblem : undefined}>
          <input
            id="name"
            type="text"
            value={name}
            maxLength={60}
            autoComplete="off"
            enterKeyHint="done"
            placeholder={`Ex.: ${suggestChallengeName(goal ?? 20_000, endDate)}`}
            onChange={(event) => setName(event.target.value)}
            className={textInputClassName}
          />
        </FormField>

        {evaluation.isValid ? (
          <ChallengePreview preview={evaluation.preview} type={type} step={step} endDate={endDate} />
        ) : (
          showProblems && (
            <ul className="flex flex-col gap-1 rounded-xl bg-warning-bg p-3 text-sm text-warning-fg">
              {evaluation.problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          )
        )}
      </form>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-paper/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <button
          type="submit"
          form="create-challenge"
          disabled={isSaving}
          className="mx-auto block w-full max-w-xl rounded-xl bg-ink py-3.5 text-base font-semibold text-white active:scale-[0.98] disabled:opacity-60"
        >
          {isSaving ? 'Criando…' : 'Criar desafio'}
        </button>
      </div>
    </main>
  );
}

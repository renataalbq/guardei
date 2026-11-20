import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { ThemePicker } from '../components/theme/ThemePicker';
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
import { DEFAULT_THEME } from '../domain/themes';
import type { CalendarDate, ChallengeType, SequentialStep, ThemeId } from '../domain/types';

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
  const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | undefined>();

  const draft: ChallengeDraft = {
    name,
    goal: goal ?? 0,
    type,
    step,
    startDate,
    endDate,
    monthlyLimit,
  };
  const evaluation = evaluateChallengeDraft(draft);
  const showProblems = submitAttempted || goal !== undefined;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitAttempted(true);
    if (!evaluation.isValid || evaluation.nameProblem || isSaving) return;
    setIsSaving(true);
    setSaveError(undefined);
    try {
      const challenge = await challengeRepository.createChallenge(draft, theme);
      navigate(`/desafio/${challenge.id}`, { replace: true });
    } catch (error) {
      console.error('Falha ao criar desafio', error);
      setSaveError('Não foi possível salvar o desafio neste aparelho. Tente de novo.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-32">
      <header className="flex items-center gap-2 py-2">
        <Link to="/" aria-label="Voltar" className="-ml-2 rounded-full p-2 text-2xl text-fg active:bg-ink-soft">
          <Icon name="back" />
        </Link>
        <h1 className="font-display text-3xl font-extrabold">Novo desafio</h1>
      </header>

      <form id="create-challenge" onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-4">
        <section className="card flex flex-col gap-5 p-5">
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
        </section>

        <section className="card flex flex-col gap-5 p-5">
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
        </section>

        {evaluation.isValid && monthlyLimit && evaluation.preview.monthlyLimitPlan && (
          <MonthlyLimitNotice
            plan={evaluation.preview.monthlyLimitPlan}
            goal={evaluation.preview.effectiveGoal}
            monthlyLimit={monthlyLimit}
            endDate={endDate}
            onUseSuggestedEndDate={setEndDate}
          />
        )}

        <section className="card p-5">
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
        </section>

        <section className="card p-5">
          <FormField label="Estilo da tabela" hint="Dá para trocar depois, dentro do desafio.">
            <ThemePicker value={theme} onChange={setTheme} />
          </FormField>
        </section>

        {evaluation.isValid ? (
          <ChallengePreview preview={evaluation.preview} type={type} step={step} endDate={endDate} />
        ) : (
          showProblems && (
            <ul className="flex flex-col gap-1 rounded-2xl bg-warning-bg p-4 text-sm font-medium text-warning-fg">
              {evaluation.problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          )
        )}
      </form>

      <div className="fixed inset-x-0 bottom-0 border-t border-border/70 bg-paper/85 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
        {saveError && (
          <p role="alert" className="mx-auto mb-2 max-w-xl text-center text-sm font-medium text-danger">
            {saveError}
          </p>
        )}
        <button
          type="submit"
          form="create-challenge"
          disabled={isSaving}
          className="btn-primary mx-auto flex w-full max-w-xl py-4 font-display text-lg"
        >
          {isSaving ? 'Criando…' : 'Criar desafio'}
        </button>
      </div>
    </main>
  );
}

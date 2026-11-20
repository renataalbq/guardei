import { useState } from 'react';
import { formatCurrency } from '../../domain/formatCurrency';
import type { TodayBudgetController } from '../../hooks/useTodayBudget';
import { CurrencyInput } from '../create/CurrencyInput';
import { BottomSheet } from '../ui/BottomSheet';
import { ChoiceChip } from '../ui/ChoiceChip';

const AMOUNT_SHORTCUTS = [10, 20, 50, 100, 200];

interface AffordableTodaySheetProps {
  open: boolean;
  onClose: () => void;
  todayBudget: TodayBudgetController;
  smallestOpenValue: number | undefined;
}

/** "Hoje consigo guardar R$ __": mostra quantos valores cabem e deixa sortear ou pegar o maior. */
export function AffordableTodaySheet({ open, onClose, todayBudget, smallestOpenValue }: AffordableTodaySheetProps) {
  const [amount, setAmount] = useState<number | undefined>(todayBudget.budget?.amount);
  const fittingCount = amount ? todayBudget.countAffordable(amount) : 0;
  const canAct = amount !== undefined && fittingCount > 0;

  function run(action: (amount: number) => unknown) {
    if (!amount) return;
    action(amount);
    onClose();
  }

  return (
    <BottomSheet open={open} title="Quanto dá pra guardar hoje?" onClose={onClose}>
      <label htmlFor="today-amount" className="text-sm font-bold">
        Hoje consigo guardar
      </label>
      <div className="mt-2">
        <CurrencyInput id="today-amount" value={amount} onChange={setAmount} placeholder="50" />
      </div>
      <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
        {AMOUNT_SHORTCUTS.map((shortcut) => (
          <ChoiceChip key={shortcut} selected={amount === shortcut} onSelect={() => setAmount(shortcut)}>
            R$ {shortcut}
          </ChoiceChip>
        ))}
      </div>

      <p className="mt-4 min-h-6 text-sm font-semibold" aria-live="polite">
        {amount === undefined ? (
          <span className="text-muted">Digite um valor para ver o que cabe.</span>
        ) : fittingCount > 0 ? (
          <span className="text-money-fg">
            {fittingCount === 1 ? '1 valor cabe' : `${fittingCount} valores cabem`} em {formatCurrency(amount)}.
          </span>
        ) : (
          <span className="text-warning-fg">
            Nenhum valor aberto cabe em {formatCurrency(amount)}.
            {smallestOpenValue !== undefined && ` O menor é ${formatCurrency(smallestOpenValue)}.`}
          </span>
        )}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" disabled={!canAct} onClick={() => run(todayBudget.pickRandom)} className="btn-primary py-3.5">
          Sortear um
        </button>
        <button
          type="button"
          disabled={!canAct}
          onClick={() => run(todayBudget.pickLargest)}
          className="rounded-2xl bg-ink-soft py-3.5 font-bold text-ink active:scale-[0.97] disabled:opacity-50"
        >
          Maior que cabe
        </button>
      </div>
      <button
        type="button"
        disabled={!canAct}
        onClick={() => run(todayBudget.highlight)}
        className="mt-3 w-full py-2 text-sm font-bold text-ink underline underline-offset-4 disabled:opacity-40"
      >
        Só destacar na tabela
      </button>
    </BottomSheet>
  );
}

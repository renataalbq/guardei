import { formatCellNumber } from '../../domain/formatCurrency';

const MAX_DIGITS = 9;

interface CurrencyInputProps {
  id: string;
  value: number | undefined;
  onChange: (valueInReais: number | undefined) => void;
  placeholder?: string;
  describedBy?: string;
}

/** Campo de valor em reais inteiros, formatado enquanto digita ("20.000"). */
export function CurrencyInput({ id, value, onChange, placeholder, describedBy }: CurrencyInputProps) {
  return (
    <div className="flex items-center rounded-xl border border-border bg-surface focus-within:border-ink focus-within:ring-2 focus-within:ring-ink/20">
      <span className="pl-3 text-base text-muted">R$</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        enterKeyHint="next"
        aria-describedby={describedBy}
        placeholder={placeholder}
        value={value === undefined ? '' : formatCellNumber(value)}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, MAX_DIGITS);
          onChange(digits ? Number(digits) : undefined);
        }}
        className="w-full bg-transparent px-2 py-3 text-lg font-semibold text-fg outline-none placeholder:font-normal placeholder:text-muted/60"
      />
    </div>
  );
}

import { formatCalendarDate, isValidCalendarDate } from '../../domain/calendarDate';
import type { CalendarDate } from '../../domain/types';

interface DateInputProps {
  id: string;
  value: CalendarDate | undefined;
  onChange: (date: CalendarDate | undefined) => void;
  min?: CalendarDate;
  placeholder?: string;
}

/**
 * Campo de data que sempre mostra dd/mm/aaaa.
 * O input nativo fica invisível por cima, para continuar abrindo o calendário do sistema ao tocar,
 * mas o texto exibido não depende do idioma do navegador.
 */
export function DateInput({ id, value, onChange, min, placeholder = 'dd/mm/aaaa' }: DateInputProps) {
  const hasDate = value !== undefined && isValidCalendarDate(value);

  return (
    <div className="relative flex min-h-12 w-full items-center justify-between rounded-2xl border border-border bg-surface px-4 text-base transition focus-within:border-ink focus-within:ring-4 focus-within:ring-ink/15">
      <span className={hasDate ? 'text-fg' : 'text-muted/60'} aria-hidden="true">
        {hasDate ? formatCalendarDate(value) : placeholder}
      </span>
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="text-muted"
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
      <input
        id={id}
        type="date"
        value={value ?? ''}
        min={min}
        onChange={(event) => onChange(event.target.value || undefined)}
        onClick={(event) => {
          // no desktop, clicar no input invisível não abre o calendário sozinho
          try {
            event.currentTarget.showPicker?.();
          } catch {
            // navegadores sem showPicker abrem o seletor pelo próprio toque
          }
        }}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
}
